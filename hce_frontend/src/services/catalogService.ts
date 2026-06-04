import { apiGet } from './apiClient';

export type SelectCatalogItem = {
    codigo: string;
    nombre: string;
    parentId?: string;
};

const SEXOS: SelectCatalogItem[] = [
    { codigo: 'M', nombre: 'Masculino' },
    { codigo: 'F', nombre: 'Femenino' }
];

const TIPOS_SANGRE: SelectCatalogItem[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    .map((value) => ({ codigo: value, nombre: value }));

const PARENTESCOS: SelectCatalogItem[] = ['Madre', 'Padre', 'Abuelo/a', 'Tio/a', 'Hermano/a', 'Representante legal', 'Otro']
    .map((value) => ({ codigo: value, nombre: value }));

const NIVELES_EDUCATIVOS: SelectCatalogItem[] = ['Ninguno', 'Primaria', 'Secundaria', 'Bachillerato', 'Superior']
    .map((value) => ({ codigo: value, nombre: value }));

function mapUbicacion(item: any, parentId?: string): SelectCatalogItem {
    return {
        codigo: String(item.id ?? item.codigo ?? ''),
        nombre: item.nombre ?? item.descripcion ?? '',
        parentId
    };
}

function mapEtnia(item: any): SelectCatalogItem {
    return {
        codigo: String(item.idGrupoEtnico ?? item.id ?? item.codigo ?? ''),
        nombre: item.descripcion ?? item.nombre ?? ''
    };
}

export async function obtenerProvincias(): Promise<SelectCatalogItem[]> {
    const data = await apiGet<any[]>('/ubicaciones/provincias');
    return Array.isArray(data) ? data.map((item) => mapUbicacion(item)) : [];
}

export async function obtenerCantones(idProvincia: string | number): Promise<SelectCatalogItem[]> {
    if (!idProvincia) return [];
    const data = await apiGet<any[]>(`/ubicaciones/provincias/${idProvincia}/cantones`);
    return Array.isArray(data) ? data.map((item) => mapUbicacion(item, String(idProvincia))) : [];
}

export async function obtenerParroquias(idProvincia: string | number, idCanton: string | number): Promise<SelectCatalogItem[]> {
    if (!idProvincia || !idCanton) return [];
    const data = await apiGet<any[]>(`/ubicaciones/provincias/${idProvincia}/cantones/${idCanton}/parroquias`);
    return Array.isArray(data) ? data.map((item) => mapUbicacion(item, String(idCanton))) : [];
}

export async function obtenerEtnias(): Promise<SelectCatalogItem[]> {
    const data = await apiGet<any[]>('/catalogos/etnias');
    return Array.isArray(data) ? data.map(mapEtnia).filter((item) => item.codigo && item.nombre) : [];
}

export function obtenerSexos() {
    return SEXOS;
}

export function obtenerTiposSangre() {
    return TIPOS_SANGRE;
}

export function obtenerParentescos() {
    return PARENTESCOS;
}

export function obtenerNivelesEducativos() {
    return NIVELES_EDUCATIVOS;
}

export async function buscarCie10(query: string): Promise<SelectCatalogItem[]> {
    const data = await apiGet<any[]>(`/catalogos/cie10/buscar?q=${encodeURIComponent(query)}`);
    return Array.isArray(data)
        ? data.map((item) => ({
            codigo: String(item.codigo || ''),
            nombre: item.nombre || item.descripcion || ''
        })).filter((item) => item.codigo || item.nombre)
        : [];
}
