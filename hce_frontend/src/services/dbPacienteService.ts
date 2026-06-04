import type { Paciente } from '../models/Paciente';
import { apiGet, apiPost, apiPut } from './apiClient';
import { mapConsultaBackendToFrontend, mapConsultaFrontendToBackend, type ConsultaBackend } from './consultaMapper';

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

export function mapPacienteBackendToFrontend(dto: PacienteResponseDTO): Paciente {
    const nombres = [dto.primerNombre, dto.segundoNombre].filter(Boolean).join(' ').trim();
    const apellidos = [dto.apellidoPaterno, dto.apellidoMaterno].filter(Boolean).join(' ').trim();

    return {
        id: String(dto.idPaciente || dto.cedula),
        uuidOffline: dto.uuidOffline,
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
        historiaClinica: []
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
            idParroquia: paciente.filiacion.idParroquia,
            provincia: paciente.filiacion.idPrqCntProvincia,
            canton: paciente.filiacion.idPrqCanton
        } : undefined
    };
}

export async function obtenerPacientes(): Promise<Paciente[]> {
    const data = await apiGet<PacienteResponseDTO[]>('/pacientes');
    return Array.isArray(data) ? data.map(mapPacienteBackendToFrontend) : [];
}

export async function buscarPacientePorCedula(cedula: string): Promise<Paciente | undefined> {
    try {
        const data = await apiGet<PacienteResponseDTO>(`/pacientes/${encodeURIComponent(cedula)}`);
        return data ? mapPacienteBackendToFrontend(data) : undefined;
    } catch (error: any) {
        if (error?.status === 404) return undefined;
        throw error;
    }
}

export async function buscarPacientes(criterio: string): Promise<Paciente[]> {
    const data = await apiGet<PacienteResponseDTO[]>(`/pacientes/buscar?q=${encodeURIComponent(criterio)}`);
    return Array.isArray(data) ? data.map(mapPacienteBackendToFrontend) : [];
}

export async function registrarPaciente(paciente: Paciente): Promise<Paciente> {
    const payload = mapPacienteFrontendToBackend({
        ...paciente,
        uuidOffline: paciente.uuidOffline || paciente.id || crypto.randomUUID()
    });
    const creado = await apiPost<PacienteResponseDTO>('/pacientes', payload);
    return mapPacienteBackendToFrontend(creado);
}

export async function obtenerConsultasPorPacienteId(idPaciente: number): Promise<any[]> {
    const data = await apiGet<ConsultaBackend[]>(`/consultas/paciente/${idPaciente}`);
    return Array.isArray(data) ? data.map(mapConsultaBackendToFrontend) : [];
}

export async function obtenerConsultasPorCedula(cedula: string): Promise<any[]> {
    const paciente = await buscarPacientePorCedula(cedula);
    if (!paciente?.idPaciente) return [];
    return obtenerConsultasPorPacienteId(paciente.idPaciente);
}

export async function obtenerTodasConsultas(): Promise<any[]> {
    const data = await apiGet<ConsultaBackend[]>('/consultas');
    return Array.isArray(data) ? data.map(mapConsultaBackendToFrontend) : [];
}

export async function agregarConsulta(cedula: string, nuevaConsulta: any): Promise<boolean> {
    const paciente = await buscarPacientePorCedula(cedula);
    if (!paciente?.idPaciente) return false;

    const payload = mapConsultaFrontendToBackend(nuevaConsulta, paciente.idPaciente);
    await apiPost<ConsultaBackend>('/consultas', payload);
    return true;
}

export async function actualizarConsultaExistente(cedula: string, consultaEditada: any): Promise<boolean> {
    const paciente = await buscarPacientePorCedula(cedula);
    if (!paciente?.idPaciente) return false;

    const idConsulta = consultaEditada.idConsulta || consultaEditada.id;
    if (!idConsulta) {
        throw new Error('No se encontro el identificador de la consulta a editar.');
    }

    const payload = mapConsultaFrontendToBackend({ ...consultaEditada, idConsulta }, paciente.idPaciente);
    await apiPut<ConsultaBackend>(`/consultas/${encodeURIComponent(String(idConsulta))}`, payload);
    return true;
}
