// src/services/syncService.ts
// Bidirectional offline-first synchronization service.

import { db, dbHelpers, type SyncQueueItem } from '../db/db';
import { mapConsultaFrontendToBackend, mapConsultaBackendToFrontend } from './consultaMapper';
import type { Paciente } from '../models/Paciente';
import { API_BASE_URL } from './authSession';

export interface SyncStatus {
    lastSync: number | null;
    syncing: boolean;
    pendingChanges: number;
    online: boolean;
    checking: boolean;
    conflicts: number;
    failedChanges: number;
    lastError?: string;
}

type ToastCallback = (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;

type SyncBatchResponse = {
    accepted?: Array<{ clientMutationId?: string; uuidOffline?: string; entityType?: string }>;
    rejected?: Array<{ clientMutationId?: string; uuidOffline?: string; entityType?: string; reason?: string }>;
    conflicts?: Array<{
        clientMutationId?: string;
        uuidOffline?: string;
        entityType?: 'paciente' | 'consulta' | 'antecedente';
        reason?: string;
        localPayload?: any;
        serverPayload?: any;
    }>;
    mappings?: Array<{
        clientMutationId?: string;
        uuidOffline?: string;
        newId?: number;
        serverId?: number;
        entityType?: string;
        numeroHistoriaClinica?: string;
        serverLastModified?: string;
    }>;
    serverTime?: string;
};

type SyncOptions = {
    background?: boolean;
    full?: boolean;
    reconcile?: boolean;
};

class SyncService {
    private syncInProgress = false;
    private initialized = false;
    private listeners: Array<(status: SyncStatus) => void> = [];
    private toastCallback: ToastCallback | null = null;
    private backendOnline = navigator.onLine;
    private connectivityChecking = false;
    private lastConnectivityCheck = 0;
    private activeSyncAbortController: AbortController | null = null;
    private suspendedForLogout = false;
    private readonly retryDelaysMs = [1000, 2000, 4000];
    private readonly connectivityCacheMs = 1000;
    private readonly pingTimeoutMs = 1000;

    setToastCallback(callback: ToastCallback) {
        this.toastCallback = callback;
    }

    private showToast(message: string, type?: 'info' | 'success' | 'warning' | 'error') {
        this.toastCallback?.(message, type);
    }

    private async wait(ms: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, ms));
    }

    async getStatus(): Promise<SyncStatus> {
        const lastSync = await dbHelpers.getMetadata('lastSyncTimestamp');
        const pendingItems = this.orderPendingItems(await dbHelpers.getPendingSyncItems());
        const conflicts = await db.conflicts.filter(conflict => !conflict.resolvedAt).count();
        const failedChanges = pendingItems.filter(item => item.status === 'failed').length;
        const failedItems = pendingItems
            .filter(item => item.lastError)
            .sort((a, b) => (b.localUpdatedAt || b.timestamp) - (a.localUpdatedAt || a.timestamp));
        const online = navigator.onLine && this.backendOnline;

        return {
            lastSync: lastSync || null,
            syncing: this.syncInProgress,
            pendingChanges: pendingItems.length,
            online,
            checking: this.connectivityChecking,
            conflicts,
            failedChanges,
            lastError: failedItems[0]?.lastError
        };
    }

    subscribe(callback: (status: SyncStatus) => void): () => void {
        this.listeners.push(callback);
        this.getStatus().then(callback).catch(console.error);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private async notifyListeners() {
        const status = await this.getStatus();
        this.listeners.forEach(listener => listener(status));
        window.dispatchEvent(new CustomEvent('hce-sync-status-change', {
            detail: status
        }));
    }

    async refreshStatus(): Promise<void> {
        await this.notifyListeners();
    }

    private emitSyncCompleted(source: 'up' | 'down' | 'full' = 'down', background = false) {
        window.dispatchEvent(new CustomEvent('hce-sync-complete', {
            detail: {
                source,
                background,
                at: Date.now()
            }
        }));
    }

    private async setBackendOnline(online: boolean, notify = true) {
        if (this.backendOnline !== online) {
            this.backendOnline = online;
        }
        if (notify) {
            await this.notifyListeners();
        }
    }

    private abortActiveSync() {
        this.activeSyncAbortController?.abort();
        this.activeSyncAbortController = null;
    }

    async prepareForLogout() {
        this.suspendedForLogout = true;
        this.abortActiveSync();
        this.syncInProgress = false;
        await this.notifyListeners();
    }

    resumeAfterLogin() {
        this.suspendedForLogout = false;
    }

    async syncDown(options: SyncOptions = {}): Promise<void> {
        if (this.suspendedForLogout) return;
        if (!(await this.isSyncAvailable(true))) return;

        try {
            this.syncInProgress = true;
            this.activeSyncAbortController = new AbortController();
            await this.notifyListeners();

            const lastSync = options.full ? null : await dbHelpers.getMetadata('lastSyncTimestamp');
            const url = new URL(`${API_BASE_URL}/sync/down`, window.location.origin);
            if (lastSync) {
                url.searchParams.set('since', String(lastSync));
            }
            const requestUrl = API_BASE_URL.startsWith('http') ? url.toString() : `${url.pathname}${url.search}`;

            const response = await fetch(requestUrl, {
                credentials: 'include',
                headers: this.authHeaders(),
                signal: this.activeSyncAbortController.signal
            });
            if (response.status === 401 || response.status === 403) {
                if (!options.background) {
                    this.showToast('Sesion expirada. Inicie sesion nuevamente.', 'warning');
                }
                return;
            }
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            await this.applyDownloadedData(data);
            if (options.reconcile) {
                await this.reconcileFullSnapshot(data);
            }

            const serverTime = data.serverTime ? Date.parse(data.serverTime) : Date.now();
            await dbHelpers.setMetadata('lastSyncTimestamp', Number.isFinite(serverTime) ? serverTime : Date.now());
            await dbHelpers.setSyncState('lastSyncResult', { ok: true, at: Date.now() });
            if (!options.background) {
                this.showToast('Datos actualizados', 'success');
            }
            this.emitSyncCompleted(options.full ? 'full' : 'down', Boolean(options.background));
        } catch (error) {
            console.error('[SyncService] Error sync down:', error);
            await this.handleConnectivityFailure(error);
            await dbHelpers.setSyncState('lastSyncResult', { ok: false, at: Date.now(), error: String(error) });
            if (!options.background) {
                this.showToast('Error al descargar datos', 'error');
            }
        } finally {
            this.syncInProgress = false;
            this.activeSyncAbortController = null;
            await this.notifyListeners();
        }
    }

    private async applyDownloadedData(data: any) {
        if (Array.isArray(data.pacientes)) {
            const pendingItems = await dbHelpers.getPendingSyncItems();
            const pendingPacientesCedulas = new Set(
                pendingItems
                    .filter(item => item.entity === 'paciente')
                    .map(item => (item.payload || item.data)?.cedula)
                    .filter(Boolean)
            );
            const localPacientes = await db.pacientes.toArray();
            const localCedulaToUuid = new Map(localPacientes.map(lp => [lp.cedula, lp.uuidOffline]));

            const pacientesToUpdate = data.pacientes
                .filter((p: any) => p.cedula && !pendingPacientesCedulas.has(p.cedula))
                .map((p: any): Paciente => {
                    const nombres = [p.primerNombre, p.segundoNombre].filter(Boolean).join(' ').trim();
                    const apellidos = [p.apellidoPaterno, p.apellidoMaterno].filter(Boolean).join(' ').trim();
                    const existingUuid = localCedulaToUuid.get(p.cedula);

                    return {
                        ...p,
                        id: existingUuid || p.uuidOffline || p.idPaciente?.toString() || crypto.randomUUID(),
                        uuidOffline: existingUuid || p.uuidOffline || p.idPaciente?.toString() || crypto.randomUUID(),
                        nombres,
                        apellidos,
                        filiacion: p.tutor,
                        syncStatus: 'synced'
                    } as Paciente;
                });

            if (pacientesToUpdate.length > 0) {
                await db.pacientes.bulkPut(pacientesToUpdate);
            }
        }

        if (Array.isArray(data.catalogos)) {
            await db.transaction('rw', db.catalogos, async () => {
                await db.catalogos.clear();
                await db.catalogos.bulkPut(data.catalogos);
            });
        }

        if (Array.isArray(data.consultas)) {
            const pendingConsultas = await dbHelpers.getPendingSyncItems();
            const blockedConsultaUuids = new Set(
                pendingConsultas
                    .filter(item => item.entity === 'consulta')
                    .map(item => item.uuidOffline)
                    .filter(Boolean)
            );

            for (const c of data.consultas) {
                const paciente = await db.pacientes.where('idPaciente').equals(c.idPaciente).first();
                const consultaFE = mapConsultaBackendToFrontend(c);
                const uuidOffline = consultaFE.uuidOffline || c.uuidOffline || consultaFE.id || `srv-consulta-${c.idConsulta}`;
                if (blockedConsultaUuids.has(uuidOffline)) continue;

                await db.consultas.put({
                    uuidOffline,
                    id: String(consultaFE.id || uuidOffline),
                    idConsulta: c.idConsulta,
                    idPaciente: c.idPaciente,
                    pacienteUuidOffline: paciente?.uuidOffline,
                    cedula: paciente?.cedula || consultaFE.cedula || '',
                    data: { ...consultaFE, uuidOffline, sincronizado: true, syncStatus: 'synced' },
                    syncStatus: 'synced',
                    lastModified: c.lastModified,
                    localUpdatedAt: Date.now()
                });
            }
        }
    }

    async syncUp(options: SyncOptions = {}): Promise<void> {
        if (this.suspendedForLogout) return;
        if (!(await this.isSyncAvailable(true))) return;
        const pendingItems = await dbHelpers.getPendingSyncItems();
        if (pendingItems.length === 0) return;
        let prepared: Array<{ item: SyncQueueItem; payload: any }> = [];

        try {
            this.syncInProgress = true;
            await this.notifyListeners();

            prepared = await this.prepareBatchItems(pendingItems);
            if (prepared.length === 0) return;

            const result = await this.uploadPreparedItems(prepared, options);
            if (!result) return;

            await this.applySyncResult(prepared.map(p => p.item), result);
            await dbHelpers.clearSyncedItems();
            prepared = [];
            await this.syncReadyPendingConsultas(options);
            await dbHelpers.setSyncState('lastSyncResult', { ok: true, at: Date.now() });
            this.emitSyncCompleted('up', Boolean(options.background));
        } catch (error) {
            console.error('[SyncService] Error sync up:', error);
            await this.markPreparedItemsFailed(prepared, String(error));
            await dbHelpers.setSyncState('lastSyncResult', { ok: false, at: Date.now(), error: String(error) });
            if (!options.background) {
                this.showToast('No se pudo completar la sincronizacion pendiente', 'error');
            }
        } finally {
            this.syncInProgress = false;
            await this.notifyListeners();
        }
    }

    private async reconcileFullSnapshot(data: any) {
        const pendingItems = await dbHelpers.getPendingSyncItems();
        const pendingPacienteUuids = new Set(
            pendingItems
                .filter(item => item.entity === 'paciente')
                .map(item => item.uuidOffline)
                .filter(Boolean)
        );
        const pendingPacienteCedulas = new Set(
            pendingItems
                .filter(item => item.entity === 'paciente')
                .map(item => (item.payload || item.data)?.cedula)
                .filter(Boolean)
        );
        const pendingConsultaUuids = new Set(
            pendingItems
                .filter(item => item.entity === 'consulta')
                .map(item => item.uuidOffline)
                .filter(Boolean)
        );

        const serverPacientes = Array.isArray(data.pacientes) ? data.pacientes : [];
        const serverPacienteUuids = new Set(serverPacientes.map((p: any) => p.uuidOffline).filter(Boolean));
        const serverPacienteIds = new Set(serverPacientes.map((p: any) => p.idPaciente).filter(Boolean));
        const serverPacienteCedulas = new Set(serverPacientes.map((p: any) => p.cedula).filter(Boolean));

        const serverConsultas = Array.isArray(data.consultas) ? data.consultas : [];
        const serverConsultaUuids = new Set(serverConsultas.map((c: any) => c.uuidOffline).filter(Boolean));
        const serverConsultaIds = new Set(serverConsultas.map((c: any) => c.idConsulta).filter(Boolean));

        await db.transaction('rw', db.pacientes, db.consultas, async () => {
            const pacientes = await db.pacientes.toArray();
            const pacientesToDelete = pacientes
                .filter(paciente => {
                    if (paciente.syncStatus && paciente.syncStatus !== 'synced') return false;
                    if (paciente.uuidOffline && pendingPacienteUuids.has(paciente.uuidOffline)) return false;
                    if (paciente.cedula && pendingPacienteCedulas.has(paciente.cedula)) return false;
                    if (paciente.uuidOffline && serverPacienteUuids.has(paciente.uuidOffline)) return false;
                    if (paciente.idPaciente && serverPacienteIds.has(paciente.idPaciente)) return false;
                    if (paciente.cedula && serverPacienteCedulas.has(paciente.cedula)) return false;
                    return true;
                })
                .map(paciente => paciente.uuidOffline)
                .filter(Boolean) as string[];

            const consultas = await db.consultas.toArray();
            const consultasToDelete = consultas
                .filter(consulta => {
                    if (consulta.syncStatus && consulta.syncStatus !== 'synced') return false;
                    if (consulta.uuidOffline && pendingConsultaUuids.has(consulta.uuidOffline)) return false;
                    if (consulta.uuidOffline && serverConsultaUuids.has(consulta.uuidOffline)) return false;
                    if (consulta.idConsulta && serverConsultaIds.has(consulta.idConsulta)) return false;
                    return true;
                })
                .map(consulta => consulta.uuidOffline)
                .filter(Boolean);

            if (pacientesToDelete.length > 0) {
                await db.pacientes.bulkDelete(pacientesToDelete);
            }
            if (consultasToDelete.length > 0) {
                await db.consultas.bulkDelete(consultasToDelete);
            }
        });
    }

    private async uploadPreparedItems(
        prepared: Array<{ item: SyncQueueItem; payload: any }>,
        options: SyncOptions
    ): Promise<SyncBatchResponse | null> {
        let response: Response | null = null;
        for (let attempt = 0; attempt <= this.retryDelaysMs.length; attempt++) {
            try {
                this.activeSyncAbortController = new AbortController();
                response = await fetch(`${API_BASE_URL}/sync/up`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        ...this.authHeaders(),
                        'Content-Type': 'application/json'
                    },
                    signal: this.activeSyncAbortController.signal,
                    body: JSON.stringify({
                        deviceId: await this.getDeviceId(),
                        userId: this.getCurrentUserId(),
                        items: prepared.map(({ item, payload }) => ({
                            clientMutationId: item.clientMutationId,
                            entity: item.entity,
                            operation: item.operation || item.type,
                            type: item.type,
                            uuidOffline: item.uuidOffline,
                            baseLastModified: item.baseLastModified,
                            payload,
                            data: payload
                        }))
                    })
                });

                if (response.status === 401 || response.status === 403) {
                    await this.resetPreparedItems(prepared, 'Sesion expirada. Inicie sesion nuevamente.');
                    if (!options.background) {
                        this.showToast('Sesion expirada. Inicie sesion nuevamente.', 'warning');
                    }
                    return null;
                }
                if (response.ok) break;
                throw new Error(`HTTP ${response.status}`);
            } catch (error) {
                await this.handleConnectivityFailure(error);
                if (attempt === this.retryDelaysMs.length) throw error;
                await this.wait(this.retryDelaysMs[attempt]);
            } finally {
                this.activeSyncAbortController = null;
            }
        }

        return this.readSyncResponse(response);
    }

    private async syncReadyPendingConsultas(options: SyncOptions): Promise<void> {
        const pendingConsultas = this.orderPendingItems(await dbHelpers.getPendingSyncItems())
            .filter(item => item.entity === 'consulta' && (item.status === 'pending' || item.status === 'failed'));
        if (pendingConsultas.length === 0) return;

        const prepared = await this.prepareBatchItems(pendingConsultas);
        if (prepared.length === 0) return;

        try {
            const result = await this.uploadPreparedItems(prepared, options);
            if (!result) return;
            await this.applySyncResult(prepared.map(p => p.item), result);
            await dbHelpers.clearSyncedItems();
        } catch (error) {
            await this.markPreparedItemsFailed(prepared, String(error));
            throw error;
        }
    }

    private async resetPreparedItems(
        prepared: Array<{ item: SyncQueueItem; payload: any }>,
        error: string
    ): Promise<void> {
        await Promise.all(prepared.map(({ item }) => item.id
            ? db.syncQueue.update(item.id, {
                status: 'pending',
                synced: 0,
                lastError: error,
                localUpdatedAt: Date.now()
            })
            : Promise.resolve()
        ));
    }

    private async markPreparedItemsFailed(
        prepared: Array<{ item: SyncQueueItem; payload: any }>,
        error: string
    ): Promise<void> {
        await Promise.all(prepared.map(({ item }) => dbHelpers.markAsFailed(item, error)));
    }

    private async prepareBatchItems(items: SyncQueueItem[]) {
        const prepared: Array<{ item: SyncQueueItem; payload: any }> = [];

        for (const item of items) {
            const payload = item.payload || item.data;
            if (item.id) {
                await db.syncQueue.update(item.id, {
                    status: 'syncing',
                    localUpdatedAt: Date.now(),
                    lastError: undefined
                });
            }

            if (item.entity === 'consulta') {
                const localData = item.data || {};
                const consulta = localData.consulta || payload;
                const paciente = localData.pacienteUuidOffline
                    ? await db.pacientes.get(localData.pacienteUuidOffline)
                    : await db.pacientes.where('cedula').equals(localData.cedula || consulta.cedula || '').first();

                if (!paciente?.idPaciente) {
                    if (item.id) {
                        await db.syncQueue.update(item.id, { status: 'pending' });
                    }
                    continue;
                }

                prepared.push({
                    item,
                    payload: mapConsultaFrontendToBackend(consulta, paciente.idPaciente)
                });
                continue;
            }

            prepared.push({ item, payload });
        }

        return prepared;
    }

    private async readSyncResponse(response: Response | null): Promise<SyncBatchResponse> {
        if (!response) return {};
        const data = await response.json().catch(() => ({}));
        if (Array.isArray(data)) {
            return { mappings: data, accepted: data.map((m: any) => ({ ...m, clientMutationId: m.clientMutationId })) };
        }
        return data || {};
    }

    private async applySyncResult(sentItems: SyncQueueItem[], result: SyncBatchResponse) {
        const mappings = result.mappings || [];
        for (const mapping of mappings) {
            const serverId = mapping.serverId ?? mapping.newId;
            if (mapping.entityType === 'paciente' && mapping.uuidOffline && serverId) {
                await db.pacientes.update(mapping.uuidOffline, {
                    idPaciente: serverId,
                    numeroHistoriaClinica: mapping.numeroHistoriaClinica,
                    lastModified: mapping.serverLastModified,
                    syncStatus: 'synced'
                });
                await db.consultas
                    .where('pacienteUuidOffline')
                    .equals(mapping.uuidOffline)
                    .modify(consulta => {
                        consulta.idPaciente = serverId;
                        if (consulta.data) {
                            consulta.data.idPaciente = serverId;
                        }
                    });
                await db.syncQueue
                    .where('entity')
                    .equals('consulta')
                    .filter(item => item.data?.pacienteUuidOffline === mapping.uuidOffline)
                    .modify(item => {
                        if (item.data?.consulta) {
                            item.data.consulta.idPaciente = serverId;
                        }
                        if (item.payload?.pendingPacienteUuidOffline === mapping.uuidOffline) {
                            item.payload.idPaciente = serverId;
                        }
                    });
            }
            if (mapping.entityType === 'consulta' && mapping.uuidOffline && serverId) {
                const consultaLocal = await db.consultas.get(mapping.uuidOffline);
                const data = consultaLocal?.data
                    ? {
                        ...consultaLocal.data,
                        idConsulta: serverId,
                        lastModified: mapping.serverLastModified,
                        syncStatus: 'synced',
                        sincronizado: true
                    }
                    : undefined;
                await db.consultas.update(mapping.uuidOffline, {
                    idConsulta: serverId,
                    lastModified: mapping.serverLastModified,
                    syncStatus: 'synced',
                    ...(data ? { data } : {})
                });
            }
        }

        const conflictIds = new Set((result.conflicts || []).map(c => c.clientMutationId).filter(Boolean));
        for (const conflict of result.conflicts || []) {
            await dbHelpers.addConflict({
                entity: conflict.entityType || 'antecedente',
                uuidOffline: conflict.uuidOffline,
                clientMutationId: conflict.clientMutationId,
                localPayload: conflict.localPayload,
                serverPayload: conflict.serverPayload,
                reason: conflict.reason || 'Conflicto de sincronizacion'
            });
        }

        const rejected = new Map((result.rejected || []).map(r => [r.clientMutationId, r.reason || 'Rechazado por el servidor']));
        const acceptedIds = new Set([
            ...(result.accepted || []).map(a => a.clientMutationId).filter(Boolean),
            ...mappings.map(m => m.clientMutationId).filter(Boolean)
        ]);

        for (const item of sentItems) {
            if (!item.id) continue;
            if (conflictIds.has(item.clientMutationId)) {
                await db.syncQueue.update(item.id, { status: 'conflict', synced: 0 });
                if (item.entity === 'consulta' && item.uuidOffline) {
                    const row = await db.consultas.get(item.uuidOffline);
                    await db.consultas.update(item.uuidOffline, {
                        syncStatus: 'conflict',
                        data: row?.data ? { ...row.data, syncStatus: 'conflict' } : row?.data
                    });
                }
                continue;
            }
            if (rejected.has(item.clientMutationId)) {
                await dbHelpers.markAsFailed(item, rejected.get(item.clientMutationId)!);
                continue;
            }

            // Empty accepted list means backward-compatible success for all sent items.
            if (acceptedIds.size === 0 || acceptedIds.has(item.clientMutationId)) {
                await dbHelpers.markAsSynced(item.id);
                if (item.entity === 'paciente' && item.uuidOffline) {
                    await db.pacientes.update(item.uuidOffline, { syncStatus: 'synced' });
                }
                if (item.entity === 'consulta' && item.uuidOffline) {
                    await db.consultas.update(item.uuidOffline, { syncStatus: 'synced' });
                }
            }
        }
    }

    async sync(options: SyncOptions = {}): Promise<void> {
        if (this.suspendedForLogout) return;
        if (this.syncInProgress) return;
        await this.syncUp(options);
        await this.syncDown(options);
    }

    private orderPendingItems(items: SyncQueueItem[]): SyncQueueItem[] {
        const priority: Record<string, number> = {
            paciente: 0,
            consulta: 1,
            antecedente: 2
        };
        return [...items].sort((a, b) => {
            const byEntity = (priority[a.entity] ?? 99) - (priority[b.entity] ?? 99);
            if (byEntity !== 0) return byEntity;
            const byTimestamp = (a.timestamp || 0) - (b.timestamp || 0);
            if (byTimestamp !== 0) return byTimestamp;
            return (a.localUpdatedAt || 0) - (b.localUpdatedAt || 0);
        });
    }

    async syncFullFromServer(): Promise<void> {
        if (this.syncInProgress) return;
        await this.syncDown({ full: true, reconcile: true });
    }

    initAutoSync() {
        if (this.initialized) return;
        this.initialized = true;

        window.addEventListener('online', () => {
            this.handleBrowserOnline()
                .catch(console.error);
        });
        window.addEventListener('offline', () => {
            this.handleBrowserOffline().catch(console.error);
        });
        window.addEventListener('focus', () => {
            this.checkAndSyncImmediately('focus').catch(console.error);
        });
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.checkAndSyncImmediately('visible').catch(console.error);
            }
        });
        setInterval(() => {
            if (this.suspendedForLogout) return;
            this.checkBackendConnectivity(true)
                .then(online => {
                    if (online && !this.syncInProgress) this.sync({ background: true }).catch(console.error);
                    return this.notifyListeners();
                })
                .catch(console.error);
        }, 30 * 1000);

        this.checkBackendConnectivity(true)
            .then(online => {
                if (online) this.sync({ background: true }).catch(console.error);
                return this.notifyListeners();
            })
            .catch(console.error);
    }

    private async handleBrowserOffline() {
        this.abortActiveSync();
        this.syncInProgress = false;
        this.lastConnectivityCheck = 0;
        await this.setBackendOnline(false);
    }

    private async handleBrowserOnline() {
        if (this.suspendedForLogout) return;
        this.connectivityChecking = true;
        await this.notifyListeners();
        try {
            const online = await this.checkBackendConnectivity(true);
            if (online) {
                await this.sync({ background: true });
            }
        } finally {
            this.connectivityChecking = false;
            await this.notifyListeners();
        }
    }

    private async checkAndSyncImmediately(_reason: 'focus' | 'visible') {
        if (this.suspendedForLogout) return;
        if (!navigator.onLine) {
            await this.handleBrowserOffline();
            return;
        }
        const online = await this.checkBackendConnectivity(true);
        await this.notifyListeners();
        if (online && !this.syncInProgress) {
            await this.sync({ background: true });
        }
    }

    private async isSyncAvailable(force = false): Promise<boolean> {
        if (!navigator.onLine) {
            this.backendOnline = false;
            return false;
        }
        return this.checkBackendConnectivity(force);
    }

    private async checkBackendConnectivity(force = false): Promise<boolean> {
        const now = Date.now();
        if (!force && now - this.lastConnectivityCheck < this.connectivityCacheMs) {
            return this.backendOnline;
        }

        this.lastConnectivityCheck = now;
        const controller = new AbortController();
        this.connectivityChecking = true;
        const timeout = window.setTimeout(() => controller.abort(), this.pingTimeoutMs);
        try {
            const response = await fetch(`${API_BASE_URL}/sync/ping?t=${now}`, {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store',
                headers: this.authHeaders(),
                signal: controller.signal
            });
            await this.setBackendOnline(response.ok || response.status === 401 || response.status === 403, false);
        } catch {
            await this.setBackendOnline(false, false);
        } finally {
            this.connectivityChecking = false;
            window.clearTimeout(timeout);
        }

        return this.backendOnline;
    }

    private async handleConnectivityFailure(error: unknown) {
        if (!navigator.onLine || error instanceof DOMException || String(error).includes('Failed to fetch')) {
            await this.setBackendOnline(false);
        }
    }

    private authHeaders(): Record<string, string> {
        const token = localStorage.getItem('hceAuthToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    private async getDeviceId(): Promise<string> {
        const existing = await dbHelpers.getMetadata('deviceId');
        if (existing) return existing;
        const deviceId = crypto.randomUUID();
        await dbHelpers.setMetadata('deviceId', deviceId);
        return deviceId;
    }

    private getCurrentUserId(): string | undefined {
        try {
            const parsed = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
            return parsed?.idUsuario || parsed?.id || parsed?.usuario || parsed?.username;
        } catch {
            return undefined;
        }
    }
}

export const syncService = new SyncService();
