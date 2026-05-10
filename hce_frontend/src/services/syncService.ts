// src/services/syncService.ts
// Servicio de sincronización bidireccional con el backend - CON NOTIFICACIONES TOAST

import { db, dbHelpers } from '../db/db';
import { mapConsultaFrontendToBackend, mapConsultaBackendToFrontend } from './consultaMapper';
import type { Paciente } from '../models/Paciente';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

export interface SyncStatus {
    lastSync: number | null;
    syncing: boolean;
    pendingChanges: number;
    online: boolean;
}

type ToastCallback = (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;

class SyncService {
    private syncInProgress = false;
    private listeners: Array<(status: SyncStatus) => void> = [];
    private toastCallback: ToastCallback | null = null;

    private readonly retryDelaysMs = [1000, 2000, 4000];

    setToastCallback(callback: ToastCallback) {
        this.toastCallback = callback;
    }

    private showToast(message: string, type?: 'info' | 'success' | 'warning' | 'error') {
        if (this.toastCallback) {
            this.toastCallback(message, type);
        }
    }

    private async wait(ms: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, ms));
    }

    async getStatus(): Promise<SyncStatus> {
        const lastSync = await dbHelpers.getMetadata('lastSyncTimestamp');
        const pendingItems = await dbHelpers.getPendingSyncItems();

        return {
            lastSync: lastSync || null,
            syncing: this.syncInProgress,
            pendingChanges: pendingItems.length,
            online: navigator.onLine
        };
    }

    subscribe(callback: (status: SyncStatus) => void): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private async notifyListeners() {
        const status = await this.getStatus();
        this.listeners.forEach(listener => listener(status));
    }

    async syncDown(): Promise<void> {
        if (!navigator.onLine) return;

        try {
            this.syncInProgress = true;
            await this.notifyListeners();
            this.showToast('📥 Descargando datos del servidor...', 'info');

            const response = await fetch(`${API_BASE_URL}/sync/down`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            if (data.pacientes && Array.isArray(data.pacientes)) {
                // Deduplicar por cédula antes de procesar
                const pacientesUnicosMap = new Map();
                data.pacientes.forEach((p: Paciente) => {
                    if (p.cedula && !pacientesUnicosMap.has(p.cedula)) {
                        pacientesUnicosMap.set(p.cedula, p);
                    }
                });

                const pacientesConUuid = Array.from(pacientesUnicosMap.values()).map((p: any): Paciente => {
                    const nombres = [p.primerNombre, p.segundoNombre].filter(Boolean).join(' ').trim();
                    const apellidos = [p.apellidoPaterno, p.apellidoMaterno].filter(Boolean).join(' ').trim();
                    
                    let filiacion = null;
                    if (p.tutor) {
                        filiacion = {
                            nombreResponsable: [p.tutor.primerNombre, p.tutor.segundoNombre, p.tutor.primerApellido, p.tutor.segundoApellido].filter(Boolean).join(' ').trim(),
                            parentesco: p.tutor.parentesco,
                            telefonoContacto: p.tutor.telefono,
                            domicilioActual: p.tutor.direccion
                        };
                    }

                    return {
                        ...p,
                        nombres,
                        apellidos,
                        filiacion,
                        uuidOffline: p.uuidOffline || p.idPaciente?.toString() || crypto.randomUUID()
                    } as Paciente;
                });

                await db.transaction('rw', db.pacientes, async () => {
                    await db.pacientes.clear();
                    await db.pacientes.bulkPut(pacientesConUuid);
                });
            }

            if (data.consultas && Array.isArray(data.consultas)) {
                for (const c of data.consultas) {
                    const paciente = await db.pacientes.where('idPaciente').equals(c.idPaciente).first();
                    if (paciente) {
                        if (!paciente.historiaClinica) paciente.historiaClinica = [];
                        const consultaFE = mapConsultaBackendToFrontend(c);
                        if (!paciente.historiaClinica.some((existing: any) => existing.id === consultaFE.id)) {
                            paciente.historiaClinica.push(consultaFE);
                            await db.pacientes.put(paciente);
                        }
                    }
                }
            }

            await dbHelpers.setMetadata('lastSyncTimestamp', Date.now());
            this.showToast('✅ Datos actualizados', 'success');
        } catch (error) {
            console.error('[SyncService] Error sync down:', error);
            this.showToast('❌ Error al descargar datos', 'error');
        } finally {
            this.syncInProgress = false;
            await this.notifyListeners();
        }
    }

    async syncUp(): Promise<void> {
        if (!navigator.onLine) return;
        const pendingItems = await dbHelpers.getPendingSyncItems();
        if (pendingItems.length === 0) return;

        try {
            this.syncInProgress = true;
            await this.notifyListeners();

            for (const item of pendingItems) {
                try {
                    let dataToSend = item.data;

                    if (item.entity === 'consulta') {
                        const paciente = await db.pacientes.where('cedula').equals(item.data.cedula).first();
                        if (paciente && paciente.idPaciente) {
                            dataToSend = mapConsultaFrontendToBackend(item.data.consulta, paciente.idPaciente);
                        } else {
                            continue;
                        }
                    }

<<<<<<< HEAD
                    let response: Response | null = null;

                    for (let attempt = 0; attempt <= this.retryDelaysMs.length; attempt++) {
                        try {
                            response = await fetch(`${API_BASE_URL}/sync/up`, {
                                method: 'POST',
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ ...item, data: dataToSend })
                            });

                            if (response.ok) {
                                break;
                            }

                            throw new Error(`HTTP ${response.status}`);
                        } catch (error) {
                            if (attempt === this.retryDelaysMs.length) {
                                throw error;
                            }

                            await this.wait(this.retryDelaysMs[attempt]);
                        }
                    }

                    if (response?.ok) {
                        const mappings = await response.json();
                        if (Array.isArray(mappings)) {
                            for (const m of mappings) {
                                if (m.entityType === 'paciente' && m.uuidOffline) {
                                    await db.pacientes.update(m.uuidOffline, { idPaciente: m.newId });
                                }
                            }
                        }
                        await dbHelpers.markAsSynced(item.id!);
                    }
                } catch (e) {
                    console.error('[SyncService] Error enviando item:', e);
                    this.showToast('❌ No se pudo completar la sincronizacion pendiente', 'error');
                }
            }
            await dbHelpers.clearSyncedItems();
        } finally {
            this.syncInProgress = false;
            await this.notifyListeners();
        }
    }

    async sync(): Promise<void> {
        if (this.syncInProgress) return;
        await this.syncUp();
        await this.syncDown();
    }

    initAutoSync() {
        window.addEventListener('online', () => this.syncUp().catch(console.error));
        setInterval(() => {
            if (navigator.onLine && !this.syncInProgress) this.syncUp().catch(console.error);
        }, 5 * 60 * 1000);
    }
}

export const syncService = new SyncService();
