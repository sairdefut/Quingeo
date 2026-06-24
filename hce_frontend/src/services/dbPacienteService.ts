import type { Paciente } from '../models/Paciente';
import { db, dbHelpers, type ConsultaLocal, type SyncConflict, type SyncItemStatus } from '../db/db';
import { apiGet } from './apiClient';
import { mapConsultaBackendToFrontend, mapConsultaFrontendToBackend, type ConsultaBackend } from './consultaMapper';
import { syncService } from './syncService';

type PacienteResponseDTO = {
    idPaciente?: number;
    numeroHistoriaClinica?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    primerNombre?: string;
    segundoNombre?: string;
    cedula: string;
    tipoIdentificacion?: string;
    tipoSangre?: string;
    anioEscolar?: string;
    fechaCreacion?: string;
    fechaNacimiento?: string;
    sexo?: string;
    idGrupoEtnico?: number;
    nombreGrupoEtnico?: string;
    idParroquia?: number;
    idPrqCanton?: number;
    idPrqCntProvincia?: number;
    usuario?: string;
    uuidOffline?: string;
    nombreCompleto?: string;
    edad?: number;
    tutor?: any;
    syncStatus?: string;
    lastModified?: string;
    origin?: string;
};

type PacienteRequestDTO = {
    idPaciente?: number;
    numeroHistoriaClinica?: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    primerNombre: string;
    segundoNombre?: string;
    cedula: string;
    tipoIdentificacion?: string;
    tipoSangre?: string;
    anioEscolar?: string | null;
    fechaNacimiento?: string;
    sexo?: string;
    idGrupoEtnico?: number;
    idParroquia?: number;
    idPrqCanton?: number;
    idPrqCntProvincia?: number;
    usuario?: string;
    uuidOffline?: string;
    origin?: string;
    tutor?: any;
};

type ConsultaSaveMode = 'create' | 'update';
type ConflictResolution = 'local' | 'server';

let legacyMigrationPromise: Promise<void> | null = null;
let pacientesRefreshPromise: Promise<Paciente[]> | null = null;
let allConsultasRefreshPromise: Promise<any[]> | null = null;
const pacienteRefreshPromises = new Map<string, Promise<Paciente | undefined>>();
const pacienteConsultasRefreshPromises = new Map<string, Promise<Paciente | undefined>>();

function splitFullName(value?: string) {
    const parts = value?.trim().split(/\s+/).filter(Boolean) ?? [];
    return {
        first: parts[0] ?? '',
        second: parts.slice(1).join(' ')
    };
}

function splitPersonName(value?: string) {
    const parts = value?.trim().split(/\s+/).filter(Boolean) ?? [];
    return {
        primerNombre: parts[0] ?? '',
        segundoNombre: parts[1] ?? '',
        primerApellido: parts[2] ?? '',
        segundoApellido: parts.slice(3).join(' ')
    };
}

function getCurrentUsername(): string | undefined {
    try {
        const parsed = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
        return parsed?.usuario || parsed?.username || parsed?.nombre || undefined;
    } catch {
        return undefined;
    }
}

function isOnline() {
    return typeof navigator !== 'undefined' && navigator.onLine;
}

function fireAndForgetSync() {
    if (isOnline()) {
        syncService.sync().catch(error => console.error('[dbPacienteService] sync failed:', error));
    }
}

async function migrateLegacyLocalStorage() {
    const migrated = await dbHelpers.getMetadata('legacyLocalStorageMigrated');
    if (migrated) return;

    try {
        const raw = localStorage.getItem('hce_pacientes');
        const pacientes = raw ? JSON.parse(raw) : [];
        if (Array.isArray(pacientes) && pacientes.length > 0) {
            for (const paciente of pacientes) {
                if (!paciente?.cedula) continue;
                const existing = await db.pacientes.where('cedula').equals(paciente.cedula).first();
                if (existing) continue;
                const uuidOffline = paciente.uuidOffline || paciente.id || crypto.randomUUID();
                await db.pacientes.put({
                    ...paciente,
                    id: uuidOffline,
                    uuidOffline,
                    syncStatus: 'pending',
                    localUpdatedAt: Date.now()
                });
                await dbHelpers.addToSyncQueue({
                    type: paciente.idPaciente ? 'UPDATE' : 'CREATE',
                    entity: 'paciente',
                    uuidOffline,
                    baseLastModified: paciente.lastModified || null,
                    data: mapPacienteFrontendToBackend({ ...paciente, id: uuidOffline, uuidOffline }),
                    payload: mapPacienteFrontendToBackend({ ...paciente, id: uuidOffline, uuidOffline })
                });
            }
        }
    } catch (error) {
        console.warn('[dbPacienteService] no se pudo migrar localStorage legacy:', error);
    } finally {
        await dbHelpers.setMetadata('legacyLocalStorageMigrated', true);
    }
}

function ensureLegacyLocalStorageMigrated() {
    if (!legacyMigrationPromise) {
        legacyMigrationPromise = migrateLegacyLocalStorage();
    }
    return legacyMigrationPromise;
}

export function mapPacienteBackendToFrontend(dto: PacienteResponseDTO): Paciente {
    const nombres = [dto.primerNombre, dto.segundoNombre].filter(Boolean).join(' ').trim();
    const apellidos = [dto.apellidoPaterno, dto.apellidoMaterno].filter(Boolean).join(' ').trim();
    const uuidOffline = dto.uuidOffline || (dto.idPaciente ? `srv-paciente-${dto.idPaciente}` : crypto.randomUUID());

    return {
        id: uuidOffline,
        uuidOffline,
        idPaciente: dto.idPaciente,
        numeroHistoriaClinica: dto.numeroHistoriaClinica,
        cedula: dto.cedula,
        tipoIdentificacion: dto.tipoIdentificacion,
        nombres: nombres || dto.nombreCompleto || '',
        apellidos,
        fechaCreacion: dto.fechaCreacion,
        fechaNacimiento: dto.fechaNacimiento || '',
        edad: dto.edad,
        sexo: dto.sexo || '',
        tipoSangre: dto.tipoSangre,
        anioEscolar: dto.anioEscolar,
        grupoEtnico: dto.nombreGrupoEtnico,
        idGrupoEtnico: dto.idGrupoEtnico,
        idParroquia: dto.idParroquia,
        idPrqCanton: dto.idPrqCanton,
        idPrqCntProvincia: dto.idPrqCntProvincia,
        provincia: '',
        canton: '',
        parroquia: '',
        usuario: dto.usuario,
        filiacion: dto.tutor ? {
            ...dto.tutor,
            idPrqCntProvincia: dto.tutor.provincia,
            idPrqCanton: dto.tutor.canton,
            idParroquia: dto.tutor.idParroquia
        } : undefined,
        historiaClinica: [],
        syncStatus: dto.syncStatus || 'synced',
        lastModified: dto.lastModified,
        origin: dto.origin
    };
}

function mapPacienteFrontendToBackend(paciente: Paciente): PacienteRequestDTO {
    const nombres = splitFullName(paciente.nombres);
    const apellidos = splitFullName(paciente.apellidos);
    const tutorFields = paciente.filiacion || {};
    const tutorSplit = tutorFields.primerNombre ? tutorFields : splitPersonName(paciente.filiacion?.nombreResponsable);

    return {
        idPaciente: paciente.idPaciente,
        numeroHistoriaClinica: paciente.numeroHistoriaClinica,
        apellidoPaterno: apellidos.first,
        apellidoMaterno: apellidos.second,
        primerNombre: nombres.first,
        segundoNombre: nombres.second,
        cedula: paciente.cedula,
        tipoIdentificacion: paciente.tipoIdentificacion || 'CEDULA',
        anioEscolar: paciente.anioEscolar || null,
        tipoSangre: paciente.tipoSangre,
        fechaNacimiento: paciente.fechaNacimiento,
        sexo: paciente.sexo,
        idGrupoEtnico: paciente.idGrupoEtnico,
        idParroquia: paciente.idParroquia,
        idPrqCanton: paciente.idPrqCanton,
        idPrqCntProvincia: paciente.idPrqCntProvincia,
        usuario: getCurrentUsername(),
        uuidOffline: paciente.uuidOffline || paciente.id || crypto.randomUUID(),
        origin: 'frontend-offline',
        tutor: paciente.filiacion ? {
            primerNombre: tutorSplit.primerNombre,
            segundoNombre: tutorSplit.segundoNombre,
            primerApellido: tutorSplit.primerApellido,
            segundoApellido: tutorSplit.segundoApellido,
            parentesco: paciente.filiacion.parentesco,
            // Support both field name conventions (frontend saved vs backend returned)
            telefono: paciente.filiacion.telefonoContacto || paciente.filiacion.telefono,
            nivelEducativo: paciente.filiacion.nivelEducativoResponsable || paciente.filiacion.nivelEducativo,
            direccion: paciente.filiacion.domicilioActual || paciente.filiacion.direccion,
            idParroquia: paciente.filiacion.idParroquia,
            provincia: paciente.filiacion.idPrqCntProvincia || paciente.filiacion.provincia,
            canton: paciente.filiacion.idPrqCanton || paciente.filiacion.canton
        } : undefined
    };
}

async function upsertRemotePacientes(dtos: PacienteResponseDTO[]) {
    const pending = await dbHelpers.getPendingSyncItems();
    const pendingCedulas = new Set(
        pending
            .filter(item => item.entity === 'paciente')
            .map(item => (item.payload || item.data)?.cedula)
            .filter(Boolean)
    );

    const local = await db.pacientes.toArray();
    const localByCedula = new Map(local.map(p => [p.cedula, p]));
    const pacientes = dtos
        .filter(dto => dto.cedula && !pendingCedulas.has(dto.cedula))
        .map(dto => {
            const mapped = mapPacienteBackendToFrontend(dto);
            const existing = localByCedula.get(mapped.cedula);
            const uuidOffline = existing?.uuidOffline || mapped.uuidOffline || crypto.randomUUID();
            return {
                ...existing,
                ...mapped,
                // Preserve local filiacion strings if server didn't return them or returned IDs
                filiacion: mapped.filiacion ? {
                    ...(localByCedula.get(mapped.cedula)?.filiacion || {}),
                    ...mapped.filiacion,
                    provincia: typeof mapped.filiacion.provincia === 'string' ? mapped.filiacion.provincia : localByCedula.get(mapped.cedula)?.filiacion?.provincia,
                    canton: typeof mapped.filiacion.canton === 'string' ? mapped.filiacion.canton : localByCedula.get(mapped.cedula)?.filiacion?.canton,
                    parroquia: typeof mapped.filiacion.parroquia === 'string' ? mapped.filiacion.parroquia : localByCedula.get(mapped.cedula)?.filiacion?.parroquia,
                } : existing?.filiacion,
                grupoEtnico: mapped.grupoEtnico || existing?.grupoEtnico,
                uuidOffline,
                id: uuidOffline,
                historiaClinica: existing?.historiaClinica || []
            };
        });

    if (pacientes.length > 0) {
        await db.pacientes.bulkPut(pacientes);
    }
}

async function upsertRemoteConsultas(dtos: ConsultaBackend[]) {
    const pending = await dbHelpers.getPendingSyncItems();
    const pendingConsultaUuids = new Set(
        pending
            .filter(item => item.entity === 'consulta')
            .map(item => item.uuidOffline)
            .filter(Boolean)
    );

    for (const dto of dtos) {
        const mapped = mapConsultaBackendToFrontend(dto);
        const uuidOffline = mapped.uuidOffline || mapped.id || (dto.idConsulta ? `srv-consulta-${dto.idConsulta}` : crypto.randomUUID());
        if (pendingConsultaUuids.has(uuidOffline)) continue;

        let paciente = dto.idPaciente
            ? await db.pacientes.where('idPaciente').equals(dto.idPaciente).first()
            : undefined;
        if (!paciente && mapped.cedula) {
            paciente = await db.pacientes.where('cedula').equals(mapped.cedula).first();
        }

        await db.consultas.put({
            uuidOffline,
            id: String(mapped.id || uuidOffline),
            idConsulta: dto.idConsulta,
            idPaciente: dto.idPaciente,
            pacienteUuidOffline: paciente?.uuidOffline,
            cedula: paciente?.cedula || mapped.cedula || '',
            data: { ...mapped, uuidOffline, sincronizado: true },
            syncStatus: 'synced',
            lastModified: dto.lastModified,
            localUpdatedAt: Date.now()
        });
    }
}

function dedupeConsultaRows(rows: ConsultaLocal[]): ConsultaLocal[] {
    const byKey = new Map<string, ConsultaLocal>();

    rows.forEach(row => {
        const key = row.uuidOffline || row.id || (row.idConsulta ? `srv-${row.idConsulta}` : '');
        if (!key) return;
        const existing = byKey.get(key);
        if (!existing || (row.localUpdatedAt || 0) > (existing.localUpdatedAt || 0)) {
            byKey.set(key, row);
        }
    });

    return Array.from(byKey.values()).sort((a, b) => (a.localUpdatedAt || 0) - (b.localUpdatedAt || 0));
}

async function obtenerFilasConsultaDelPaciente(paciente: Paciente): Promise<ConsultaLocal[]> {
    const grupos = await Promise.all([
        paciente.idPaciente ? db.consultas.where('idPaciente').equals(paciente.idPaciente).toArray() : Promise.resolve([]),
        paciente.cedula ? db.consultas.where('cedula').equals(paciente.cedula).toArray() : Promise.resolve([]),
        paciente.uuidOffline ? db.consultas.where('pacienteUuidOffline').equals(paciente.uuidOffline).toArray() : Promise.resolve([])
    ]);

    return dedupeConsultaRows(grupos.flat());
}

async function obtenerConsultaRowLocal(uuidOffline: string, idConsulta?: number): Promise<ConsultaLocal | undefined> {
    const byUuid = await db.consultas.get(uuidOffline);
    if (byUuid) return byUuid;
    if (idConsulta) {
        return db.consultas.where('idConsulta').equals(idConsulta).first();
    }
    return undefined;
}

async function upsertConsultaSyncQueue(params: {
    uuidOffline: string;
    cedula: string;
    pacienteUuidOffline: string;
    consulta: any;
    mode: ConsultaSaveMode;
    payload: any;
    baseLastModified?: string | null;
}) {
    const pending = await db.syncQueue
        .where('uuidOffline')
        .equals(params.uuidOffline)
        .filter(item => item.entity === 'consulta' && item.status !== 'synced')
        .toArray();
    const existing = pending
        .sort((a, b) => (b.localUpdatedAt || b.timestamp || 0) - (a.localUpdatedAt || a.timestamp || 0))[0];
    const type = existing?.type === 'CREATE' || params.mode === 'create' ? 'CREATE' : 'UPDATE';
    const now = Date.now();
    const queueData = {
        cedula: params.cedula,
        consulta: params.consulta,
        pacienteUuidOffline: params.pacienteUuidOffline
    };

    if (existing?.id) {
        await db.syncQueue.update(existing.id, {
            type,
            operation: type,
            data: queueData,
            payload: params.payload,
            baseLastModified: type === 'CREATE' ? null : params.baseLastModified || null,
            status: 'pending',
            synced: 0,
            retries: 0,
            lastError: undefined,
            localUpdatedAt: now
        });

        const duplicateIds = pending
            .filter(item => item.id && item.id !== existing.id)
            .map(item => item.id!);
        if (duplicateIds.length > 0) {
            await db.syncQueue.bulkDelete(duplicateIds);
        }
        return;
    }

    await dbHelpers.addToSyncQueue({
        type,
        entity: 'consulta',
        uuidOffline: params.uuidOffline,
        baseLastModified: type === 'CREATE' ? null : params.baseLastModified || null,
        data: queueData,
        payload: params.payload
    });
}

function buildConsultaPayload(consulta: any, paciente: Paciente) {
    return paciente.idPaciente
        ? mapConsultaFrontendToBackend(consulta, paciente.idPaciente)
        : { ...consulta, pendingPacienteUuidOffline: paciente.uuidOffline };
}

function estadoConsultaLocal(status?: SyncItemStatus) {
    if (status === 'conflict') return 'conflict';
    if (status === 'failed') return 'failed';
    if (status === 'pending' || status === 'syncing') return 'pending';
    return 'synced';
}

export async function obtenerPacientesLocales(): Promise<Paciente[]> {
    await ensureLegacyLocalStorageMigrated();
    return db.pacientes.toArray();
}

export async function refrescarPacientesDesdeServidor(): Promise<Paciente[]> {
    await ensureLegacyLocalStorageMigrated();

    if (!isOnline()) {
        return db.pacientes.toArray();
    }

    if (!pacientesRefreshPromise) {
        pacientesRefreshPromise = (async () => {
            try {
                const data = await apiGet<PacienteResponseDTO[]>('/pacientes');
                if (Array.isArray(data)) {
                    await upsertRemotePacientes(data);
                }
            } catch (error) {
                console.warn('[dbPacienteService] usando pacientes locales:', error);
            } finally {
                pacientesRefreshPromise = null;
            }

            return db.pacientes.toArray();
        })();
    }

    return pacientesRefreshPromise;
}

export async function obtenerPacientes(): Promise<Paciente[]> {
    const locales = await obtenerPacientesLocales();
    if (isOnline()) {
        refrescarPacientesDesdeServidor().catch(error => {
            console.warn('[dbPacienteService] no se pudo refrescar pacientes en background:', error);
        });
    }
    return locales;
}

export async function buscarPacientePorCedulaLocal(cedula: string): Promise<Paciente | undefined> {
    await ensureLegacyLocalStorageMigrated();
    return db.pacientes.where('cedula').equals(cedula).first();
}

export async function refrescarPacienteDesdeServidor(cedula: string): Promise<Paciente | undefined> {
    await ensureLegacyLocalStorageMigrated();

    if (!isOnline()) {
        return buscarPacientePorCedulaLocal(cedula);
    }

    const key = cedula.trim();
    const existingRefresh = pacienteRefreshPromises.get(key);
    if (existingRefresh) return existingRefresh;

    const refresh = (async () => {
        const local = await buscarPacientePorCedulaLocal(cedula);

        try {
            const pending = await dbHelpers.getPendingSyncItems();
            const hasPending = pending.some(item =>
                item.entity === 'paciente' &&
                (item.payload || item.data)?.cedula === cedula
            );

            if (!hasPending) {
                const data = await apiGet<PacienteResponseDTO>(`/pacientes/${encodeURIComponent(cedula)}`);
                if (data) {
                    const mapped = mapPacienteBackendToFrontend(data);
                    const merged = {
                        ...(local || {}),
                        ...mapped,
                        grupoEtnico: mapped.grupoEtnico || local?.grupoEtnico,
                        filiacion: mapped.filiacion ? {
                            ...(local?.filiacion || {}),
                            ...mapped.filiacion,
                            provincia: typeof mapped.filiacion.provincia === 'string' ? mapped.filiacion.provincia : local?.filiacion?.provincia,
                            canton: typeof mapped.filiacion.canton === 'string' ? mapped.filiacion.canton : local?.filiacion?.canton,
                            parroquia: typeof mapped.filiacion.parroquia === 'string' ? mapped.filiacion.parroquia : local?.filiacion?.parroquia,
                        } : local?.filiacion,
                        id: local?.id || mapped.id,
                        uuidOffline: local?.uuidOffline || mapped.uuidOffline,
                        historiaClinica: local?.historiaClinica || mapped.historiaClinica || []
                    };

                    await db.pacientes.put(merged);
                    return merged;
                }
            }
        } catch (error: any) {
            console.warn('[dbPacienteService] Could not fetch full patient info from server:', error);
            if (error?.status === 404 && !local) return undefined;
        } finally {
            pacienteRefreshPromises.delete(key);
        }

        return local || undefined;
    })();

    pacienteRefreshPromises.set(key, refresh);
    return refresh;
}

export async function buscarPacientePorCedula(cedula: string): Promise<Paciente | undefined> {
    const local = await buscarPacientePorCedulaLocal(cedula);
    if (local) {
        if (isOnline()) {
            refrescarPacienteDesdeServidor(cedula).catch(error => {
                console.warn('[dbPacienteService] no se pudo refrescar paciente en background:', error);
            });
        }
        return local;
    }

    return refrescarPacienteDesdeServidor(cedula);
}

export async function buscarPacientes(criterio: string): Promise<Paciente[]> {
    const normalized = criterio.trim().toLowerCase();
    const pacientes = await obtenerPacientes();
    if (!normalized) return pacientes;

    return pacientes.filter(p => [
        p.cedula,
        p.nombres,
        p.apellidos,
        p.numeroHistoriaClinica
    ].filter(Boolean).some(value => String(value).toLowerCase().includes(normalized)));
}

export async function obtenerPacienteConConsultas(cedula: string): Promise<Paciente | undefined> {
    const local = await obtenerPacienteConConsultasLocal(cedula);
    if (local) {
        if (isOnline()) {
            refrescarPacienteConConsultasDesdeServidor(cedula).catch(error => {
                console.warn('[dbPacienteService] no se pudo refrescar paciente con consultas en background:', error);
            });
        }
        return local;
    }

    return refrescarPacienteConConsultasDesdeServidor(cedula);
}

export async function obtenerPacienteConConsultasLocal(cedula: string): Promise<Paciente | undefined> {
    const paciente = await buscarPacientePorCedulaLocal(cedula);
    if (!paciente) return undefined;

    const rows = await obtenerFilasConsultaDelPaciente(paciente);
    return {
        ...paciente,
        historiaClinica: rows.map(row => ({
            ...row.data,
            syncStatus: estadoConsultaLocal(row.syncStatus),
            lastModified: row.lastModified || row.data?.lastModified
        }))
    };
}

export async function refrescarPacienteConConsultasDesdeServidor(cedula: string): Promise<Paciente | undefined> {
    if (!isOnline()) {
        return obtenerPacienteConConsultasLocal(cedula);
    }

    const key = cedula.trim();
    const existingRefresh = pacienteConsultasRefreshPromises.get(key);
    if (existingRefresh) return existingRefresh;

    const refresh = (async () => {
        try {
            const paciente = await refrescarPacienteDesdeServidor(cedula);
            if (paciente?.idPaciente) {
                const data = await apiGet<ConsultaBackend[]>(`/consultas/paciente/${paciente.idPaciente}`);
                if (Array.isArray(data)) {
                    await upsertRemoteConsultas(data);
                }
            }
        } catch (error) {
            console.warn('[dbPacienteService] usando consultas locales del paciente:', error);
        } finally {
            pacienteConsultasRefreshPromises.delete(key);
        }

        return obtenerPacienteConConsultasLocal(cedula);
    })();

    pacienteConsultasRefreshPromises.set(key, refresh);
    return refresh;
}

export async function registrarPaciente(paciente: Paciente): Promise<Paciente> {
    await ensureLegacyLocalStorageMigrated();

    const existing = await db.pacientes.where('cedula').equals(paciente.cedula).first();
    if (existing && existing.uuidOffline !== paciente.uuidOffline) {
        throw new Error('El paciente ya esta registrado localmente.');
    }

    const uuidOffline = paciente.uuidOffline || paciente.id || crypto.randomUUID();
    const localPaciente: Paciente = {
        ...paciente,
        id: uuidOffline,
        uuidOffline,
        syncStatus: 'pending',
        localUpdatedAt: Date.now()
    };
    const payload = mapPacienteFrontendToBackend(localPaciente);

    await db.transaction('rw', db.pacientes, db.syncQueue, async () => {
        await dbHelpers.savePaciente(localPaciente);
        await dbHelpers.addToSyncQueue({
            type: localPaciente.idPaciente ? 'UPDATE' : 'CREATE',
            entity: 'paciente',
            uuidOffline,
            baseLastModified: localPaciente.lastModified || null,
            data: payload,
            payload
        });
    });

    fireAndForgetSync();
    return localPaciente;
}

export async function obtenerConsultasPorPacienteId(idPaciente: number): Promise<any[]> {
    if (isOnline()) {
        try {
            const data = await apiGet<ConsultaBackend[]>(`/consultas/paciente/${idPaciente}`);
            if (Array.isArray(data)) {
                await upsertRemoteConsultas(data);
            }
        } catch (error) {
            console.warn('[dbPacienteService] usando consultas locales:', error);
        }
    }

    const rows = await db.consultas.where('idPaciente').equals(idPaciente).sortBy('localUpdatedAt');
    return rows.map(row => ({
        ...row.data,
        syncStatus: estadoConsultaLocal(row.syncStatus),
        lastModified: row.lastModified || row.data?.lastModified
    }));
}

export async function obtenerConsultasPorCedula(cedula: string): Promise<any[]> {
    const paciente = await obtenerPacienteConConsultasLocal(cedula);
    if (isOnline()) {
        refrescarPacienteConConsultasDesdeServidor(cedula).catch(error => {
            console.warn('[dbPacienteService] no se pudo refrescar consultas por cedula:', error);
        });
    }
    return paciente?.historiaClinica || [];
}

export async function obtenerTodasConsultasLocales(): Promise<any[]> {
    const rows = await db.consultas.orderBy('localUpdatedAt').toArray();
    return rows.map(row => ({
        ...row.data,
        syncStatus: estadoConsultaLocal(row.syncStatus),
        lastModified: row.lastModified || row.data?.lastModified
    }));
}

export async function refrescarTodasConsultasDesdeServidor(): Promise<any[]> {
    if (!isOnline()) {
        return obtenerTodasConsultasLocales();
    }

    if (!allConsultasRefreshPromise) {
        allConsultasRefreshPromise = (async () => {
            try {
                const data = await apiGet<ConsultaBackend[]>('/consultas');
                if (Array.isArray(data)) {
                    await upsertRemoteConsultas(data);
                }
            } catch (error) {
                console.warn('[dbPacienteService] usando todas las consultas locales:', error);
            } finally {
                allConsultasRefreshPromise = null;
            }

            return obtenerTodasConsultasLocales();
        })();
    }

    return allConsultasRefreshPromise;
}

export async function obtenerTodasConsultas(): Promise<any[]> {
    const locales = await obtenerTodasConsultasLocales();
    if (isOnline()) {
        refrescarTodasConsultasDesdeServidor().catch(error => {
            console.warn('[dbPacienteService] no se pudo refrescar todas las consultas:', error);
        });
    }

    return locales;
}

export async function guardarConsultaOffline(cedula: string, consulta: any): Promise<boolean> {
    const paciente = await buscarPacientePorCedula(cedula);
    if (!paciente?.uuidOffline) return false;
    const pacienteUuidOffline = paciente.uuidOffline;

    const requestedUuid = String(consulta.uuidOffline || consulta.id || (consulta.idConsulta ? `srv-consulta-${consulta.idConsulta}` : crypto.randomUUID()));
    const existingRow = await obtenerConsultaRowLocal(requestedUuid, consulta.idConsulta);
    const uuidOffline = existingRow?.uuidOffline || requestedUuid;
    const mode: ConsultaSaveMode = consulta.idConsulta || existingRow?.idConsulta ? 'update' : 'create';
    const data = {
        ...consulta,
        id: consulta.id || uuidOffline,
        uuidOffline,
        cedula,
        idPaciente: paciente.idPaciente,
        sincronizado: false,
        syncStatus: 'pending'
    };

    const payload = buildConsultaPayload(data, paciente);
    const baseLastModified = existingRow?.lastModified || consulta.lastModified || null;

    await db.transaction('rw', db.pacientes, db.consultas, db.syncQueue, async () => {
        const row: ConsultaLocal = {
            uuidOffline,
            id: String(data.id),
            idConsulta: data.idConsulta || existingRow?.idConsulta,
            idPaciente: paciente.idPaciente,
            pacienteUuidOffline,
            cedula,
            data,
            syncStatus: 'pending',
            lastModified: existingRow?.lastModified || consulta.lastModified,
            localUpdatedAt: Date.now()
        };
        await db.consultas.put(row);

        const historiaClinica = Array.isArray(paciente.historiaClinica) ? paciente.historiaClinica : [];
        const sinActual = historiaClinica.filter((c: any) =>
            c.uuidOffline !== uuidOffline &&
            c.id !== data.id &&
            (!data.idConsulta || c.idConsulta !== data.idConsulta)
        );
        await db.pacientes.update(pacienteUuidOffline, {
            historiaClinica: [...sinActual, data],
            antecedentes: data.antecedentes,
            syncStatus: paciente.syncStatus || 'synced'
        });

        await upsertConsultaSyncQueue({
            uuidOffline,
            cedula,
            pacienteUuidOffline,
            consulta: data,
            mode,
            payload,
            baseLastModified
        });
    });

    fireAndForgetSync();
    return true;
}

export async function agregarConsulta(cedula: string, nuevaConsulta: any): Promise<boolean> {
    return guardarConsultaOffline(cedula, nuevaConsulta);
}

export async function actualizarConsultaExistente(cedula: string, consultaEditada: any): Promise<boolean> {
    return guardarConsultaOffline(cedula, consultaEditada);
}

export async function obtenerConflictosPendientes(): Promise<SyncConflict[]> {
    return db.conflicts
        .filter(conflict => !conflict.resolvedAt)
        .sortBy('createdAt');
}

export async function resolverConflictoConsulta(conflictId: number, resolution: ConflictResolution): Promise<boolean> {
    const conflict = await db.conflicts.get(conflictId);
    if (!conflict || conflict.entity !== 'consulta') return false;

    const uuidOffline = conflict.uuidOffline || conflict.localPayload?.uuidOffline || conflict.serverPayload?.uuidOffline;
    if (!uuidOffline) return false;

    const row = await db.consultas.get(uuidOffline);

    if (resolution === 'server') {
        const serverData = mapConsultaBackendToFrontend(conflict.serverPayload as ConsultaBackend);
        const paciente = serverData.idPaciente
            ? await db.pacientes.where('idPaciente').equals(serverData.idPaciente).first()
            : undefined;
        const cedula = row?.cedula || paciente?.cedula || serverData.cedula || '';
        const pacienteUuidOffline = row?.pacienteUuidOffline || paciente?.uuidOffline;

        await db.transaction('rw', db.consultas, db.syncQueue, db.conflicts, async () => {
            await db.consultas.put({
                uuidOffline,
                id: String(serverData.id || uuidOffline),
                idConsulta: serverData.idConsulta,
                idPaciente: serverData.idPaciente,
                pacienteUuidOffline,
                cedula,
                data: { ...serverData, uuidOffline, cedula, sincronizado: true, syncStatus: 'synced' },
                syncStatus: 'synced',
                lastModified: serverData.lastModified,
                localUpdatedAt: Date.now()
            });
            await db.syncQueue
                .where('clientMutationId')
                .equals(conflict.clientMutationId || '')
                .modify({ status: 'synced', synced: 1 });
            await db.conflicts.update(conflictId, { resolvedAt: Date.now() });
        });
        return true;
    }

    if (!row) return false;
    const serverLastModified = conflict.serverPayload?.lastModified || null;
    const paciente = row.pacienteUuidOffline
        ? await db.pacientes.get(row.pacienteUuidOffline)
        : await db.pacientes.where('cedula').equals(row.cedula).first();
    if (!paciente?.uuidOffline) return false;

    const data = {
        ...row.data,
        syncStatus: 'pending',
        sincronizado: false
    };
    const payload = buildConsultaPayload(data, paciente);

    await db.transaction('rw', db.consultas, db.syncQueue, db.conflicts, async () => {
        await db.consultas.update(uuidOffline, {
            data,
            syncStatus: 'pending',
            localUpdatedAt: Date.now()
        });
        await upsertConsultaSyncQueue({
            uuidOffline,
            cedula: row.cedula,
            pacienteUuidOffline: paciente.uuidOffline!,
            consulta: data,
            mode: 'update',
            payload,
            baseLastModified: serverLastModified
        });
        await db.conflicts.update(conflictId, { resolvedAt: Date.now() });
    });

    fireAndForgetSync();
    return true;
}
