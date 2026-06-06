import { apiGet } from './apiClient';
import { db } from '../db/db';

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
    try {
        const data = await apiGet<any[]>('/ubicaciones/provincias');
        return Array.isArray(data) ? data.map((item) => mapUbicacion(item)) : [];
    } catch {
        return getLocalCatalog('provincia');
    }
}

export async function obtenerCantones(idProvincia: string | number): Promise<SelectCatalogItem[]> {
    if (!idProvincia) return [];
    try {
        const data = await apiGet<any[]>(`/ubicaciones/provincias/${idProvincia}/cantones`);
        return Array.isArray(data) ? data.map((item) => mapUbicacion(item, String(idProvincia))) : [];
    } catch {
        return getLocalCatalog('canton', idProvincia);
    }
}

export async function obtenerParroquias(idProvincia: string | number, idCanton: string | number): Promise<SelectCatalogItem[]> {
    if (!idProvincia || !idCanton) return [];
    try {
        const data = await apiGet<any[]>(`/ubicaciones/provincias/${idProvincia}/cantones/${idCanton}/parroquias`);
        return Array.isArray(data) ? data.map((item) => mapUbicacion(item, String(idCanton))) : [];
    } catch {
        return getLocalCatalog('parroquia', idCanton);
    }
}

export async function obtenerEtnias(): Promise<SelectCatalogItem[]> {
    try {
        const data = await apiGet<any[]>('/catalogos/etnias');
        return Array.isArray(data) ? data.map(mapEtnia).filter((item) => item.codigo && item.nombre) : [];
    } catch {
        return getLocalCatalog('etnia');
    }
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
    try {
        const data = await apiGet<any[]>(`/catalogos/cie10/buscar?q=${encodeURIComponent(query)}`);
        return Array.isArray(data)
            ? data.map((item) => ({
                codigo: String(item.codigo || ''),
                nombre: item.nombre || item.descripcion || ''
            })).filter((item) => item.codigo || item.nombre)
            : [];
    } catch {
        const normalized = query.trim().toLowerCase();
        const items = await getLocalCatalog('enfermedad');
        return items.filter(item =>
            item.codigo.toLowerCase().includes(normalized) || item.nombre.toLowerCase().includes(normalized)
        ).slice(0, 30);
    }
}

async function getLocalCatalog(tipo: string, parentId?: string | number): Promise<SelectCatalogItem[]> {
    let collection = db.catalogos.where('tipo').equals(tipo);
    let rows = await collection.toArray();
    if (parentId !== undefined && parentId !== null && String(parentId) !== '') {
        rows = rows.filter(row => String(row.parentId ?? '') === String(parentId));
    }
    return rows
        .map(row => ({
            codigo: String(row.codigo || row.id || ''),
            nombre: row.nombre || '',
            parentId: row.parentId === undefined ? undefined : String(row.parentId)
        }))
        .filter(item => item.codigo || item.nombre);
}
