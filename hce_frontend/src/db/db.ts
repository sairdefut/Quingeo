// src/db/db.ts
// IndexedDB schema for the HCE offline-first data layer.

import Dexie, { type Table } from 'dexie';
import type { Paciente } from '../models/Paciente';

export type SyncEntity = 'paciente' | 'consulta' | 'antecedente';
export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncItemStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';

export interface SyncQueueItem {
    id?: number;
    type: SyncOperation;
    operation?: SyncOperation;
    entity: SyncEntity;
    uuidOffline?: string;
    clientMutationId: string;
    baseLastModified?: string | null;
    data: any;
    payload?: any;
    timestamp: number;
    localUpdatedAt: number;
    status: SyncItemStatus;
    synced: number;
    retries: number;
    lastError?: string;
}

export interface CatalogoItem {
    id?: number;
    tipo: string;
    codigo?: string;
    nombre: string;
    parentId?: number;
    metadatos?: any;
}

export interface AppMetadata {
    key: string;
    value: any;
    updatedAt: number;
}

export interface ConsultaLocal {
    uuidOffline: string;
    id?: string;
    idConsulta?: number;
    idPaciente?: number;
    pacienteUuidOffline?: string;
    cedula: string;
    data: any;
    syncStatus?: SyncItemStatus;
    lastModified?: string;
    localUpdatedAt: number;
}

export interface SyncConflict {
    id?: number;
    entity: SyncEntity;
    uuidOffline?: string;
    clientMutationId?: string;
    localPayload: any;
    serverPayload: any;
    reason: string;
    createdAt: number;
    resolvedAt?: number;
}

export interface FailedSyncItem {
    id?: number;
    queueItemId?: number;
    clientMutationId?: string;
    entity: SyncEntity;
    uuidOffline?: string;
    payload: any;
    error: string;
    createdAt: number;
}

export interface SyncState {
    key: string;
    value: any;
    updatedAt: number;
}

class HceDatabase extends Dexie {
    pacientes!: Table<Paciente, string>;
    consultas!: Table<ConsultaLocal, string>;
    syncQueue!: Table<SyncQueueItem, number>;
    catalogos!: Table<CatalogoItem, number>;
    metadata!: Table<AppMetadata, string>;
    conflicts!: Table<SyncConflict, number>;
    syncState!: Table<SyncState, string>;
    failedSyncItems!: Table<FailedSyncItem, number>;

    constructor() {
        super('HceDatabaseV2');

        this.version(2).stores({
            pacientes: 'uuidOffline, cedula, idPaciente, nombres, apellidos, provincia, canton',
            syncQueue: '++id, synced, timestamp, entity',
            catalogos: '++id, tipo, codigo, nombre, parentId',
            metadata: 'key'
        });

        this.version(3).stores({
            pacientes: 'uuidOffline, cedula, idPaciente, nombres, apellidos, provincia, canton, syncStatus, lastModified',
            consultas: 'uuidOffline, idConsulta, idPaciente, pacienteUuidOffline, cedula, syncStatus, lastModified, localUpdatedAt',
            syncQueue: '++id, synced, status, timestamp, localUpdatedAt, entity, uuidOffline, clientMutationId',
            catalogos: '++id, tipo, codigo, nombre, parentId',
            metadata: 'key',
            conflicts: '++id, entity, uuidOffline, clientMutationId, createdAt, resolvedAt',
            syncState: 'key',
            failedSyncItems: '++id, queueItemId, clientMutationId, entity, uuidOffline, createdAt'
        }).upgrade(async tx => {
            await tx.table('syncQueue').toCollection().modify((item: SyncQueueItem) => {
                item.operation = item.operation || item.type;
                item.clientMutationId = item.clientMutationId || crypto.randomUUID();
                item.localUpdatedAt = item.localUpdatedAt || item.timestamp || Date.now();
                item.status = item.status || (item.synced === 1 ? 'synced' : 'pending');
                item.payload = item.payload || item.data;
            });
        });
    }
}

export const db = new HceDatabase();

export const dbHelpers = {
    async getAllPacientes(): Promise<Paciente[]> {
        return db.pacientes.toArray();
    },

    async getPacienteByCedula(cedula: string): Promise<Paciente | undefined> {
        return db.pacientes.where('cedula').equals(cedula).first();
    },

    async savePaciente(paciente: Paciente): Promise<string> {
        const uuidOffline = paciente.uuidOffline || paciente.id || crypto.randomUUID();
        return db.pacientes.put({
            ...paciente,
            id: paciente.id || uuidOffline,
            uuidOffline,
            localUpdatedAt: paciente.localUpdatedAt || Date.now()
        });
    },

    async deletePaciente(cedula: string): Promise<void> {
        const paciente = await db.pacientes.where('cedula').equals(cedula).first();
        if (paciente?.uuidOffline) {
            await db.pacientes.delete(paciente.uuidOffline);
        }
    },

    async addToSyncQueue(
        item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'localUpdatedAt' | 'synced' | 'retries' | 'status' | 'clientMutationId'>
            & Partial<Pick<SyncQueueItem, 'clientMutationId' | 'status' | 'localUpdatedAt'>>
    ): Promise<number> {
        const now = Date.now();
        return db.syncQueue.add({
            ...item,
            operation: item.operation || item.type,
            clientMutationId: item.clientMutationId || crypto.randomUUID(),
            payload: item.payload || item.data,
            timestamp: now,
            localUpdatedAt: item.localUpdatedAt || now,
            status: item.status || 'pending',
            synced: 0,
            retries: 0
        });
    },

    async getPendingSyncItems(): Promise<SyncQueueItem[]> {
        const staleSyncingBefore = Date.now() - 2 * 60 * 1000;
        await db.syncQueue
            .where('status')
            .equals('syncing')
            .filter(item => (item.localUpdatedAt || item.timestamp || 0) < staleSyncingBefore)
            .modify({ status: 'pending', lastError: 'Sincronizacion interrumpida; pendiente de reintento' });

        return db.syncQueue
            .where('status')
            .anyOf('pending', 'failed')
            .sortBy('timestamp');
    },

    async markAsSynced(itemId: number): Promise<void> {
        await db.syncQueue.update(itemId, { synced: 1, status: 'synced' });
    },

    async clearSyncedItems(): Promise<void> {
        await db.syncQueue.where('synced').equals(1).delete();
    },

    async markAsFailed(item: SyncQueueItem, error: string): Promise<void> {
        if (item.id) {
            await db.syncQueue.update(item.id, {
                status: 'failed',
                retries: (item.retries || 0) + 1,
                lastError: error
            });
        }
        await db.failedSyncItems.add({
            queueItemId: item.id,
            clientMutationId: item.clientMutationId,
            entity: item.entity,
            uuidOffline: item.uuidOffline,
            payload: item.payload || item.data,
            error,
            createdAt: Date.now()
        });
    },

    async addConflict(conflict: Omit<SyncConflict, 'id' | 'createdAt'>): Promise<number> {
        return db.conflicts.add({ ...conflict, createdAt: Date.now() });
    },

    async setMetadata(key: string, value: any): Promise<void> {
        await db.metadata.put({ key, value, updatedAt: Date.now() });
    },

    async getMetadata(key: string): Promise<any> {
        const item = await db.metadata.get(key);
        return item?.value;
    },

    async setSyncState(key: string, value: any): Promise<void> {
        await db.syncState.put({ key, value, updatedAt: Date.now() });
    },

    async getSyncState(key: string): Promise<any> {
        const item = await db.syncState.get(key);
        return item?.value;
    }
};
