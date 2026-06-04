import { apiGet } from './apiClient';

export type ActividadClinica = {
    id: number;
    usuario?: string;
    accion?: string;
    paciente?: string;
    idPaciente?: number;
    cedulaPaciente?: string;
    fechaHora?: string;
    detalle?: string;
};

export async function obtenerActividadClinica(): Promise<ActividadClinica[]> {
    const data = await apiGet<ActividadClinica[]>('/actividad');
    return Array.isArray(data) ? data : [];
}
