import { db, dbHelpers } from '../db/db';
import type { CatalogoItem } from '../db/db';
import type { Paciente } from '../models/Paciente';
import { API_BASE_URL, handleUnauthorized } from './authSession';

type PacienteBackendPayload = {
    idPaciente?: number;
    apellidoPaterno: string;
    apellidoMaterno: string;
    primerNombre: string;
    segundoNombre: string;
    cedula: string;
    tipoIdentificacion?: string;
    tipoSangre?: string;
    anioEscolar?: string;
    fechaNacimiento?: string;
    sexo?: string;
    idGrupoEtnico?: number;
    idParroquia?: number;
    idPrqCanton?: number;
    idPrqCntProvincia?: number;
    usuario?: string;
    uuidOffline: string;
    origin: string;
    tutor?: {
        primerNombre: string;
        segundoNombre: string;
        primerApellido: string;
        segundoApellido: string;
        parentesco?: string;
        telefono?: string;
        nivelEducativo?: string;
        direccion?: string;
        idParroquia?: number;
        provincia?: number;
        canton?: number;
    };
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
        const storedUser = localStorage.getItem('usuarioLogueado');
        if (!storedUser) return undefined;
        const parsed = JSON.parse(storedUser);
        return parsed?.usuario || parsed?.nombre || undefined;
    } catch {
        return undefined;
    }
}

async function findCatalogoByNombre(tipo: string, nombre?: string, parentId?: number): Promise<CatalogoItem | undefined> {
    if (!nombre) return undefined;

    const catalogos = await db.catalogos.where('tipo').equals(tipo).toArray();
    return catalogos.find((item) => {
        const sameName = item.nombre.trim().toLowerCase() === nombre.trim().toLowerCase();
        const sameParent = parentId === undefined || Number(item.parentId) === Number(parentId);
        return sameName && sameParent;
    });
}

async function mapPacienteFrontendToBackend(paciente: Paciente): Promise<PacienteBackendPayload> {
    const nombres = splitFullName(paciente.nombres);
    const apellidos = splitFullName(paciente.apellidos);
    const tutor = splitPersonName(paciente.filiacion?.nombreResponsable);

    const provincia = await findCatalogoByNombre('provincia', paciente.provincia);
    const canton = await findCatalogoByNombre('canton', paciente.canton, provincia ? Number(provincia.codigo) : undefined);
    const parroquia = await findCatalogoByNombre('parroquia', paciente.parroquia, canton ? Number(canton.codigo) : undefined);
    const grupoEtnico = await findCatalogoByNombre('etnia', paciente.grupoEtnico);

    const provinciaTutor = await findCatalogoByNombre('provincia', paciente.filiacion?.provincia);
    const cantonTutor = await findCatalogoByNombre('canton', paciente.filiacion?.canton, provinciaTutor ? Number(provinciaTutor.codigo) : undefined);
    const parroquiaTutor = await findCatalogoByNombre('parroquia', paciente.filiacion?.parroquia, cantonTutor ? Number(cantonTutor.codigo) : undefined);

    return {
        idPaciente: paciente.idPaciente,
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
        idGrupoEtnico: grupoEtnico?.codigo ? Number(grupoEtnico.codigo) : undefined,
        idParroquia: parroquia?.codigo ? Number(parroquia.codigo) : undefined,
        idPrqCanton: canton?.codigo ? Number(canton.codigo) : undefined,
        idPrqCntProvincia: provincia?.codigo ? Number(provincia.codigo) : undefined,
        usuario: getCurrentUsername(),
        uuidOffline: paciente.uuidOffline!,
        origin: 'frontend',
        tutor: paciente.filiacion ? {
            primerNombre: tutor.primerNombre,
            segundoNombre: tutor.segundoNombre,
            primerApellido: tutor.primerApellido,
            segundoApellido: tutor.segundoApellido,
            parentesco: paciente.filiacion.parentesco,
            telefono: paciente.filiacion.telefonoContacto,
            nivelEducativo: paciente.filiacion.nivelEducativoResponsable,
            direccion: paciente.filiacion.domicilioActual,
            idParroquia: parroquiaTutor?.codigo ? Number(parroquiaTutor.codigo) : undefined,
            provincia: provinciaTutor?.codigo ? Number(provinciaTutor.codigo) : undefined,
            canton: cantonTutor?.codigo ? Number(cantonTutor.codigo) : undefined
        } : undefined
    };
}

async function postPacienteToBackend(paciente: Paciente): Promise<number | undefined> {
    const pacienteParaBackend = await mapPacienteFrontendToBackend(paciente);
    const response = await fetch(`${API_BASE_URL}/sync/up`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            entity: 'paciente',
            type: 'CREATE',
            data: pacienteParaBackend
        })
    });

    if (response.status === 403) {
        handleUnauthorized();
        return undefined;
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al guardar en servidor (${response.status}): ${errorText || response.statusText}`);
    }

    const mappings = await response.json();
    if (!Array.isArray(mappings)) return undefined;

    const mapping = mappings.find((item: any) => item.uuidOffline === paciente.uuidOffline);
    return mapping?.newId;
}

export async function obtenerPacientes(): Promise<Paciente[]> {
    return dbHelpers.getAllPacientes();
}

export async function buscarPacientePorCedula(cedula: string): Promise<Paciente | undefined> {
    return dbHelpers.getPacienteByCedula(cedula);
}

export async function registrarPaciente(paciente: Paciente): Promise<Paciente> {
    const existente = await dbHelpers.getPacienteByCedula(paciente.cedula);
    if (existente) {
        throw new Error('El paciente ya está registrado');
    }

    const pacienteParaGuardar: Paciente = {
        ...paciente,
        uuidOffline: paciente.uuidOffline || paciente.id || crypto.randomUUID(),
        historiaClinica: paciente.historiaClinica || []
    };

    if (navigator.onLine) {
        try {
            const newId = await postPacienteToBackend(pacienteParaGuardar);
            if (newId) {
                pacienteParaGuardar.idPaciente = newId;
            }
            await dbHelpers.savePaciente(pacienteParaGuardar);
            return pacienteParaGuardar;
        } catch (error) {
            console.error('[dbPacienteService] Error registrando online. Se guarda pendiente para sync:', error);
        }
    }

    await dbHelpers.savePaciente(pacienteParaGuardar);
    await dbHelpers.addToSyncQueue({
        entity: 'paciente',
        type: 'CREATE',
        data: pacienteParaGuardar
    });

    return pacienteParaGuardar;
}

export async function agregarConsulta(cedula: string, nuevaConsulta: any): Promise<boolean> {
    const paciente = await dbHelpers.getPacienteByCedula(cedula);
    if (!paciente) return false;

    const historiaClinica = Array.isArray(paciente.historiaClinica) ? [...paciente.historiaClinica] : [];
    historiaClinica.push(nuevaConsulta);

    await dbHelpers.savePaciente({
        ...paciente,
        antecedentes: nuevaConsulta.antecedentes,
        historiaClinica
    });

    await dbHelpers.addToSyncQueue({
        entity: 'consulta',
        type: 'CREATE',
        data: {
            cedula,
            consulta: nuevaConsulta
        }
    });

    return true;
}

export async function actualizarConsultaExistente(cedula: string, consultaEditada: any): Promise<boolean> {
    const paciente = await dbHelpers.getPacienteByCedula(cedula);
    if (!paciente || !Array.isArray(paciente.historiaClinica)) return false;

    const index = paciente.historiaClinica.findIndex((consulta: any) => consulta.id === consultaEditada.id);
    if (index === -1) return false;

    const historiaClinica = [...paciente.historiaClinica];
    historiaClinica[index] = consultaEditada;

    await dbHelpers.savePaciente({
        ...paciente,
        antecedentes: consultaEditada.antecedentes,
        historiaClinica
    });

    return true;
}
