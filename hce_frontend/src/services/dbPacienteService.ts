// src/services/dbPacienteService.ts
// Servicio de almacenamiento de pacientes usando IndexedDB (Dexie)
// Reemplaza la lógica de localStorage de pacienteStorage.ts

import { db, dbHelpers } from '../db/db';
import type { Paciente } from '../models/Paciente';

/**
 * Obtener todos los pacientes desde IndexedDB
 */
export const obtenerPacientes = async (): Promise<Paciente[]> => {
    return await dbHelpers.getAllPacientes();
};

/**
 * Guardar el array completo de pacientes (bulk operation)
 */
export const guardarPacientes = async (pacientes: Paciente[]): Promise<void> => {
    await db.transaction('rw', db.pacientes, async () => {
        // Limpiar tabla y reemplazar con nuevos datos
        await db.pacientes.clear();
        await db.pacientes.bulkAdd(pacientes);
    });
};

/**
 * Guardar o actualizar un solo paciente
 */
export const guardarPaciente = async (paciente: Paciente): Promise<void> => {
    await dbHelpers.savePaciente(paciente);
};

/**
 * Registrar un paciente nuevo
 * Lanza error si ya existe
 */
export const registrarPaciente = async (paciente: Paciente): Promise<void> => {
    const existe = await dbHelpers.getPacienteByCedula(paciente.cedula);
    if (existe) {
        throw new Error('El paciente ya está registrado');
    }

    console.log('[DEBUG] Paciente original:', paciente);
    console.log('[DEBUG] Filiacion:', paciente.filiacion);

    // --- MAPEO DE CATALOGOS DINAMICO ---
    const catalogos = await db.catalogos.toArray();
    
    const idGrupoEtnico = catalogos.find(c => c.tipo === 'etnia' && c.nombre === paciente.grupoEtnico)?.codigo;
    const idParroquia = catalogos.find(c => c.tipo === 'parroquia' && c.nombre === paciente.parroquia)?.codigo;

    // Transformar datos de filiacion a TutorDTO que espera el backend
    const pacienteParaBackend: any = {
        cedula: paciente.cedula,
        primerNombre: paciente.nombres?.split(' ')[0] || '',
        segundoNombre: paciente.nombres?.split(' ')[1] || '',
        apellidoPaterno: paciente.apellidos?.split(' ')[0] || '',
        apellidoMaterno: paciente.apellidos?.split(' ')[1] || '',
        fechaNacimiento: paciente.fechaNacimiento,
        sexo: paciente.sexo,
        tipoSangre: paciente.tipoSangre,
        idGrupoEtnico: idGrupoEtnico ? parseInt(idGrupoEtnico) : null,
        idParroquia: idParroquia ? parseInt(idParroquia) : null,
        uuidOffline: paciente.uuidOffline || paciente.id || crypto.randomUUID()
    };

    // Si tiene datos de filiación, mapearlos a TutorDTO
    if (paciente.filiacion && paciente.filiacion.nombreResponsable) {
        const nombresCompletos = paciente.filiacion.nombreResponsable.split(' ');
        const idParroquiaTutor = catalogos.find(c => c.tipo === 'parroquia' && c.nombre === paciente.filiacion?.parroquia)?.codigo;
        
        pacienteParaBackend.tutor = {
            primerNombre: nombresCompletos[0] || '',
            segundoNombre: nombresCompletos[1] || '',
            primerApellido: nombresCompletos[2] || '',
            segundoApellido: nombresCompletos[3] || '',
            parentesco: paciente.filiacion.parentesco,
            telefono: paciente.filiacion.telefonoContacto,
            nivelEducativo: paciente.filiacion.nivelEducativoResponsable,
            direccion: paciente.filiacion.domicilioActual,
            idParroquia: idParroquiaTutor ? parseInt(idParroquiaTutor) : null
        };
        console.log('[DEBUG] Tutor mapeado:', pacienteParaBackend.tutor);
    } else {
        console.warn('[DEBUG] NO HAY DATOS DE FILIACION!');
    }

    console.log('[DEBUG] Paciente para backend:', JSON.stringify(pacienteParaBackend, null, 2));

    if (navigator.onLine) {
        // ONLINE: POST directo al backend
        console.log('[DEBUG] ONLINE: Enviando POST directo al backend...');
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';
        const token = localStorage.getItem('token');

        const fetchUrl = API_BASE_URL.endsWith('/api') ? `${API_BASE_URL}/sync/up` : `${API_BASE_URL}/api/sync/up`;

        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                entity: 'paciente',
                type: 'CREATE',
                data: pacienteParaBackend
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[DEBUG] ❌ Error del backend:', errorText);
            throw new Error(`Error al guardar en servidor (${response.status}): ${errorText || response.statusText}`);
        }

        const mappings = await response.json();
        console.log('[DEBUG] ✅ Paciente guardado en backend exitosamente. Mapeos recibidos:', mappings);

        // Actualizar ID local si el backend lo devuelve
        if (mappings && Array.isArray(mappings)) {
            const mapping = mappings.find((m: any) => m.uuidOffline === pacienteParaBackend.uuidOffline);
            if (mapping && mapping.newId) {
                paciente.idPaciente = mapping.newId;
                console.log('[DEBUG] 🆔 ID asignado por backend:', mapping.newId);
            }
        }

        // Guardar localmente DESPUÉS de confirmar que se guardó en el servidor
        await dbHelpers.savePaciente(paciente);
    } else {
        // OFFLINE: Guardar localmente y agregar a cola
        console.log('[DEBUG] OFFLINE: Agregando a cola de sincronización...');
        await dbHelpers.savePaciente(paciente);
        await dbHelpers.addToSyncQueue({
            type: 'CREATE',
            entity: 'paciente',
            data: pacienteParaBackend
        });
        console.log('[DEBUG] ✅ Paciente agregado a cola de sincronización');
    }
};

/**
 * Buscar un paciente por su número de cédula
 */
export const buscarPacientePorCedula = async (cedula: string): Promise<Paciente | undefined> => {
    return await dbHelpers.getPacienteByCedula(cedula);
};

/**
 * Agregar una consulta nueva al historial de un paciente
 */
export const agregarConsulta = async (cedula: string, nuevaConsulta: any): Promise<boolean> => {
    const paciente = await dbHelpers.getPacienteByCedula(cedula);

    if (!paciente) return false;

    // Inicializar historiaClinica si no existe
    if (!paciente.historiaClinica) {
        paciente.historiaClinica = [];
    }

    // Añadir la nueva consulta
    paciente.historiaClinica.push(nuevaConsulta);

    // Actualizar antecedentes globales
    paciente.antecedentes = nuevaConsulta.antecedentes;

    // Guardar cambios
    await dbHelpers.savePaciente(paciente);

    // Agregar a cola de sincronización
    await dbHelpers.addToSyncQueue({
        type: 'UPDATE',
        entity: 'consulta',
        data: { cedula, consulta: nuevaConsulta }
    });

    return true;
};

/**
 * Actualizar una consulta existente
 */
export const actualizarConsultaExistente = async (cedula: string, consultaEditada: any): Promise<boolean> => {
    const paciente = await dbHelpers.getPacienteByCedula(cedula);

    if (!paciente || !paciente.historiaClinica) return false;

    const consultaIndex = paciente.historiaClinica.findIndex((c: any) => c.id === consultaEditada.id);

    if (consultaIndex === -1) return false;

    // Reemplazar consulta
    paciente.historiaClinica[consultaIndex] = consultaEditada;

    // Actualizar antecedentes globales
    paciente.antecedentes = consultaEditada.antecedentes;

    // Guardar cambios
    await dbHelpers.savePaciente(paciente);

    // Agregar a cola de sincronización
    await dbHelpers.addToSyncQueue({
        type: 'UPDATE',
        entity: 'consulta',
        data: { cedula, consulta: consultaEditada }
    });

    return true;
};
