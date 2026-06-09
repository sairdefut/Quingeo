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
    conflicts: number;
    failedChanges: number;
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
};

class SyncService {
    private syncInProgress = false;
    private initialized = false;
    private listeners: Array<(status: SyncStatus) => void> = [];
    private toastCallback: ToastCallback | null = null;
    private backendOnline = navigator.onLine;
    private lastConnectivityCheck = 0;
    private readonly retryDelaysMs = [1000, 2000, 4000];
    private readonly connectivityCacheMs = 5000;

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
        const pendingItems = await dbHelpers.getPendingSyncItems();
        const conflicts = await db.conflicts.filter(conflict => !conflict.resolvedAt).count();
        const failedChanges = pendingItems.filter(item => item.status === 'failed').length;
        const online = await this.isSyncAvailable();

        return {
            lastSync: lastSync || null,
            syncing: this.syncInProgress,
            pendingChanges: pendingItems.length,
            online,
            conflicts,
            failedChanges
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
    }

    async syncDown(options: SyncOptions = {}): Promise<void> {
        if (!(await this.isSyncAvailable(true))) return;

        try {
            this.syncInProgress = true;
            await this.notifyListeners();

            const lastSync = await dbHelpers.getMetadata('lastSyncTimestamp');
            const url = new URL(`${API_BASE_URL}/sync/down`, window.location.origin);
            if (lastSync) {
                url.searchParams.set('since', String(lastSync));
            }
            const requestUrl = API_BASE_URL.startsWith('http') ? url.toString() : `${url.pathname}${url.search}`;

            const response = await fetch(requestUrl, {
                credentials: 'include',
                headers: this.authHeaders()
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

            const serverTime = data.serverTime ? Date.parse(data.serverTime) : Date.now();
            await dbHelpers.setMetadata('lastSyncTimestamp', Number.isFinite(serverTime) ? serverTime : Date.now());
            await dbHelpers.setSyncState('lastSyncResult', { ok: true, at: Date.now() });
            if (!options.background) {
                this.showToast('Datos actualizados', 'success');
            }
        } catch (error) {
            console.error('[SyncService] Error sync down:', error);
            await dbHelpers.setSyncState('lastSyncResult', { ok: false, at: Date.now(), error: String(error) });
            if (!options.background) {
                this.showToast('Error al descargar datos', 'error');
            }
        } finally {
            this.syncInProgress = false;
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
            for (const c of data.consultas) {
                const paciente = await db.pacientes.where('idPaciente').equals(c.idPaciente).first();
                const consultaFE = mapConsultaBackendToFrontend(c);
                const uuidOffline = consultaFE.uuidOffline || c.uuidOffline || consultaFE.id || `srv-consulta-${c.idConsulta}`;
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
        if (!(await this.isSyncAvailable(true))) return;
        const pendingItems = await dbHelpers.getPendingSyncItems();
        if (pendingItems.length === 0) return;

        try {
            this.syncInProgress = true;
            await this.notifyListeners();

            const prepared = await this.prepareBatchItems(pendingItems);
            if (prepared.length === 0) return;

            let response: Response | null = null;
            for (let attempt = 0; attempt <= this.retryDelaysMs.length; attempt++) {
                try {
                    response = await fetch(`${API_BASE_URL}/sync/up`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            ...this.authHeaders(),
                            'Content-Type': 'application/json'
                        },
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
                        if (!options.background) {
                            this.showToast('Sesion expirada. Inicie sesion nuevamente.', 'warning');
                        }
                        return;
                    }
                    if (response.ok) break;
                    throw new Error(`HTTP ${response.status}`);
                } catch (error) {
                    if (attempt === this.retryDelaysMs.length) throw error;
                    await this.wait(this.retryDelaysMs[attempt]);
                }
            }

            const result = await this.readSyncResponse(response);
            await this.applySyncResult(prepared.map(p => p.item), result);
            await dbHelpers.clearSyncedItems();
            await dbHelpers.setSyncState('lastSyncResult', { ok: true, at: Date.now() });
        } catch (error) {
            console.error('[SyncService] Error sync up:', error);
            await dbHelpers.setSyncState('lastSyncResult', { ok: false, at: Date.now(), error: String(error) });
            if (!options.background) {
                this.showToast('No se pudo completar la sincronizacion pendiente', 'error');
            }
        } finally {
            this.syncInProgress = false;
            await this.notifyListeners();
        }
    }

    private async prepareBatchItems(items: SyncQueueItem[]) {
        const prepared: Array<{ item: SyncQueueItem; payload: any }> = [];

        for (const item of items) {
            const payload = item.payload || item.data;
            if (item.id) {
                await db.syncQueue.update(item.id, { status: 'syncing' });
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
            }
            if (mapping.entityType === 'consulta' && mapping.uuidOffline && serverId) {
                await db.consultas.update(mapping.uuidOffline, {
                    idConsulta: serverId,
                    lastModified: mapping.serverLastModified,
                    syncStatus: 'synced'
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
        if (this.syncInProgress) return;
        await this.syncUp(options);
        await this.syncDown(options);
    }

    initAutoSync() {
        if (this.initialized) return;
        this.initialized = true;

        window.addEventListener('online', () => {
            this.checkBackendConnectivity(true)
                .then(() => this.sync({ background: true }))
                .catch(console.error);
        });
        window.addEventListener('offline', () => {
            this.backendOnline = false;
            this.notifyListeners().catch(console.error);
        });
        setInterval(() => {
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
        const timeout = window.setTimeout(() => controller.abort(), 2500);
        try {
            const response = await fetch(`${API_BASE_URL}/sync/ping?t=${now}`, {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store',
                headers: this.authHeaders(),
                signal: controller.signal
            });
            this.backendOnline = response.ok || response.status === 401 || response.status === 403;
        } catch {
            this.backendOnline = false;
        } finally {
            window.clearTimeout(timeout);
        }

        return this.backendOnline;
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
