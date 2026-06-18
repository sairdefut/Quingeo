import { apiGet, apiPut } from './apiClient';

export interface ProfileDTO {
    idPersonal: number;
    username: string;
    nombres: string;
    apellidos: string;
    cargo: string;
}

export interface MyConsultaDTO {
    idConsulta: number;
    idPaciente?: number;
    numeroHistoriaClinica?: string;
    cedulaPaciente?: string;
    pacienteNombre?: string;
    fecha?: string;
    hora?: string;
    motivo?: string;
    diagnostico?: string;
    tipoDiagnostico?: string;
    syncStatus?: string;
    lastModified?: string;
}

export function getMyProfile() {
    return apiGet<ProfileDTO>('/profile/me');
}

export function updateMyProfile(data: Pick<ProfileDTO, 'nombres' | 'apellidos'>) {
    return apiPut<ProfileDTO>('/profile/me', data);
}

export function changeMyPassword(currentPassword: string, newPassword: string) {
    return apiPut<{ success: boolean }>('/profile/me/password', { currentPassword, newPassword });
}

export function getMyConsultas() {
    return apiGet<MyConsultaDTO[]>('/profile/me/consultas');
}
