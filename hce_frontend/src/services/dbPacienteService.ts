import type { Paciente } from '../models/Paciente';
import { db, dbHelpers, type ConsultaLocal } from '../db/db';
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
        provincia: dto.idPrqCntProvincia ? `ID ${dto.idPrqCntProvincia}` : '',
        canton: dto.idPrqCanton ? `ID ${dto.idPrqCanton}` : '',
        parroquia: dto.idParroquia ? `ID ${dto.idParroquia}` : '',
        usuario: dto.usuario,
        filiacion: dto.tutor,
        historiaClinica: [],
        syncStatus: dto.syncStatus || 'synced',
        lastModified: dto.lastModified,
        origin: dto.origin
    };
}

function mapPacienteFrontendToBackend(paciente: Paciente): PacienteRequestDTO {
    const nombres = splitFullName(paciente.nombres);
    const apellidos = splitFullName(paciente.apellidos);
    const tutor = splitPersonName(paciente.filiacion?.nombreResponsable);

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
            primerNombre: tutor.primerNombre,
            segundoNombre: tutor.segundoNombre,
            primerApellido: tutor.primerApellido,
            segundoApellido: tutor.segundoApellido,
            parentesco: paciente.filiacion.parentesco,
            telefono: paciente.filiacion.telefonoContacto,
            nivelEducativo: paciente.filiacion.nivelEducativoResponsable,
            direccion: paciente.filiacion.domicilioActual,
            idParroquia: paciente.filiacion.idParroquia,
            provincia: paciente.filiacion.idPrqCntProvincia,
            canton: paciente.filiacion.idPrqCanton
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

export async function obtenerPacientes(): Promise<Paciente[]> {
    await migrateLegacyLocalStorage();

    if (isOnline()) {
        try {
            const data = await apiGet<PacienteResponseDTO[]>('/pacientes');
            if (Array.isArray(data)) {
                await upsertRemotePacientes(data);
            }
        } catch (error) {
            console.warn('[dbPacienteService] usando pacientes locales:', error);
        }
    }

    return db.pacientes.toArray();
}

export async function buscarPacientePorCedula(cedula: string): Promise<Paciente | undefined> {
    await migrateLegacyLocalStorage();

    const local = await db.pacientes.where('cedula').equals(cedula).first();
    if (local || !isOnline()) {
        return local;
    }

    try {
        const data = await apiGet<PacienteResponseDTO>(`/pacientes/${encodeURIComponent(cedula)}`);
        if (!data) return undefined;
        const mapped = mapPacienteBackendToFrontend(data);
        await dbHelpers.savePaciente(mapped);
        return mapped;
    } catch (error: any) {
        if (error?.status === 404) return undefined;
        throw error;
    }
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

export async function registrarPaciente(paciente: Paciente): Promise<Paciente> {
    await migrateLegacyLocalStorage();

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
    return rows.map(row => row.data);
}

export async function obtenerConsultasPorCedula(cedula: string): Promise<any[]> {
    const paciente = await buscarPacientePorCedula(cedula);
    if (paciente?.idPaciente) {
        return obtenerConsultasPorPacienteId(paciente.idPaciente);
    }

    const rows = await db.consultas.where('cedula').equals(cedula).sortBy('localUpdatedAt');
    return rows.map(row => row.data);
}

export async function obtenerTodasConsultas(): Promise<any[]> {
    if (isOnline()) {
        try {
            const data = await apiGet<ConsultaBackend[]>('/consultas');
            if (Array.isArray(data)) {
                await upsertRemoteConsultas(data);
            }
        } catch (error) {
            console.warn('[dbPacienteService] usando todas las consultas locales:', error);
        }
    }

    const rows = await db.consultas.orderBy('localUpdatedAt').toArray();
    return rows.map(row => row.data);
}

export async function agregarConsulta(cedula: string, nuevaConsulta: any): Promise<boolean> {
    const paciente = await buscarPacientePorCedula(cedula);
    if (!paciente?.uuidOffline) return false;
    const pacienteUuidOffline = paciente.uuidOffline;

    const uuidOffline = nuevaConsulta.uuidOffline || nuevaConsulta.id || crypto.randomUUID();
    const data = {
        ...nuevaConsulta,
        id: nuevaConsulta.id || uuidOffline,
        uuidOffline,
        cedula,
        idPaciente: paciente.idPaciente,
        sincronizado: false,
        syncStatus: 'pending'
    };

    const payload = paciente.idPaciente
        ? mapConsultaFrontendToBackend(data, paciente.idPaciente)
        : { ...data, pendingPacienteUuidOffline: paciente.uuidOffline };

    await db.transaction('rw', db.pacientes, db.consultas, db.syncQueue, async () => {
        const row: ConsultaLocal = {
            uuidOffline,
            id: String(data.id),
            idConsulta: data.idConsulta,
            idPaciente: paciente.idPaciente,
            pacienteUuidOffline,
            cedula,
            data,
            syncStatus: 'pending',
            localUpdatedAt: Date.now()
        };
        await db.consultas.put(row);

        const historiaClinica = Array.isArray(paciente.historiaClinica) ? paciente.historiaClinica : [];
        await db.pacientes.update(pacienteUuidOffline, {
            historiaClinica: [...historiaClinica.filter((c: any) => c.uuidOffline !== uuidOffline), data],
            antecedentes: data.antecedentes,
            syncStatus: paciente.syncStatus || 'synced'
        });

        await dbHelpers.addToSyncQueue({
            type: 'CREATE',
            entity: 'consulta',
            uuidOffline,
            baseLastModified: data.lastModified || null,
            data: { cedula, consulta: data, pacienteUuidOffline },
            payload
        });
    });

    fireAndForgetSync();
    return true;
}

export async function actualizarConsultaExistente(cedula: string, consultaEditada: any): Promise<boolean> {
    const paciente = await buscarPacientePorCedula(cedula);
    if (!paciente?.uuidOffline) return false;
    const pacienteUuidOffline = paciente.uuidOffline;

    const uuidOffline = consultaEditada.uuidOffline || consultaEditada.id || consultaEditada.idConsulta || crypto.randomUUID();
    const data = {
        ...consultaEditada,
        id: consultaEditada.id || uuidOffline,
        uuidOffline,
        cedula,
        idPaciente: paciente.idPaciente,
        sincronizado: false,
        syncStatus: 'pending'
    };

    const payload = paciente.idPaciente
        ? mapConsultaFrontendToBackend(data, paciente.idPaciente)
        : { ...data, pendingPacienteUuidOffline: paciente.uuidOffline };

    await db.transaction('rw', db.pacientes, db.consultas, db.syncQueue, async () => {
        await db.consultas.put({
            uuidOffline: String(uuidOffline),
            id: String(data.id),
            idConsulta: data.idConsulta,
            idPaciente: paciente.idPaciente,
            pacienteUuidOffline,
            cedula,
            data,
            syncStatus: 'pending',
            lastModified: consultaEditada.lastModified,
            localUpdatedAt: Date.now()
        });

        const historiaClinica = Array.isArray(paciente.historiaClinica) ? paciente.historiaClinica : [];
        await db.pacientes.update(pacienteUuidOffline, {
            historiaClinica: historiaClinica.map((c: any) =>
                c.uuidOffline === uuidOffline || c.id === consultaEditada.id || c.idConsulta === consultaEditada.idConsulta ? data : c
            ),
            antecedentes: data.antecedentes
        });

        await dbHelpers.addToSyncQueue({
            type: consultaEditada.idConsulta ? 'UPDATE' : 'CREATE',
            entity: 'consulta',
            uuidOffline: String(uuidOffline),
            baseLastModified: consultaEditada.lastModified || null,
            data: { cedula, consulta: data, pacienteUuidOffline },
            payload
        });
    });

    fireAndForgetSync();
    return true;
}
