// src/services/consultaMapper.ts
// Mapper para convertir ConsultaDTO del backend al formato del frontend

export interface ConsultaBackend {
    idConsulta: number;
    idPaciente: number;
    fecha: string;
    hora: string;
    motivo: string;
    enfermedadActual: string;
    peso: number;
    talla: number;
    temperatura: number;
    fc: number;
    fr: number;
    spo2: number;
    diagnosticoTexto: string;
    tipoDiagnostico: string;
    usuario: string;
    listaPlan?: PlanTerapeuticoDTO[];
    listaEstudios?: EstudioLaboratorioDTO[];
    jsonCompleto?: Record<string, any>;
}

export interface PlanTerapeuticoDTO {
    id: number;
    medicamento: string;
    dosis: string;
    frecuencia: string;
    duracion: string;
    indicaciones: string;
}

export interface EstudioLaboratorioDTO {
    id: number;
    tipo: string;
    descripcion: string;
    fecha: string;
    resultado: string;
}

/**
 * Convierte ConsultaDTO del backend al formato que usa el frontend
 * en paciente.historiaClinica[]
 */
export function mapConsultaBackendToFrontend(consulta: ConsultaBackend): any {
    const respaldo = consulta.jsonCompleto ?? {};
    const planFarmacologico = respaldo.diagnostico?.plan?.farmacologico;
    const planNoFarmacologico = respaldo.diagnostico?.plan?.noFarmacologico;

    return {
        ...respaldo,
        id: respaldo.id || `consulta-${consulta.idConsulta}`,
        fecha: respaldo.fecha || consulta.fecha,
        hora: respaldo.hora || consulta.hora,
        motivo: respaldo.motivo || respaldo.motivoConsulta || consulta.motivo,
        motivoConsulta: respaldo.motivoConsulta || respaldo.motivo || consulta.motivo,
        enfermedadActual: respaldo.enfermedadActual || consulta.enfermedadActual,
        examenFisico: respaldo.examenFisico || {
            vitales: {
                peso: consulta.peso,
                talla: consulta.talla,
                temperatura: consulta.temperatura,
                fc: consulta.fc,
                fr: consulta.fr,
                spo2: consulta.spo2
            },
            segmentario: {},
            evolucion: ''
        },
        signosVitales: respaldo.signosVitales || respaldo.examenFisico?.vitales || {
            peso: consulta.peso,
            talla: consulta.talla,
            temperatura: consulta.temperatura,
            fc: consulta.fc,
            fr: consulta.fr,
            spo2: consulta.spo2
        },
        diagnostico: respaldo.diagnostico || {
            principal: {
                cie10: consulta.diagnosticoTexto || '',
                descripcion: consulta.diagnosticoTexto || 'Sin diagnóstico',
                tipo: consulta.tipoDiagnostico === 'DEFINITIVO' ? 'Definitivo' : 'Presuntivo'
            },
            secundarios: [],
            estudios: consulta.listaEstudios?.map(estudio => estudio.descripcion || estudio.tipo) || [],
            resultados: consulta.listaEstudios?.map(estudio => ({
                examen: estudio.descripcion || estudio.tipo,
                tipo: estudio.tipo,
                resultado: estudio.resultado
            })) || [],
            plan: {
                farmacologico: planFarmacologico || {
                    esquema: consulta.listaPlan?.[0]?.medicamento || '',
                    viaVenosa: '',
                    viaOral: ''
                },
                noFarmacologico: planNoFarmacologico || {
                    hidratacion: false,
                    dieta: false,
                    oxigeno: false,
                    fisio: false,
                    otros: consulta.listaPlan?.[0]?.indicaciones || ''
                }
            },
            pronostico: respaldo.diagnostico?.pronostico || 'Bueno',
            proximaCita: respaldo.diagnostico?.proximaCita || ''
        },
        usuario: consulta.usuario,
        sincronizado: true
    };
}
/**
 * Convierte el formato del frontend al formato ConsultaDTO del backend
 */
export function mapConsultaFrontendToBackend(consulta: any, idPaciente: number): any {
    // Normalizar fecha (DD/MM/YYYY o locale a YYYY-MM-DD)
    let fechaISO = consulta.fecha;
    if (consulta.fecha && consulta.fecha.includes('/')) {
        const [d, m, y] = consulta.fecha.split('/');
        fechaISO = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // Normalizar hora (HH:mm:ss o HH:mm a HH:mm:ss)
    let horaISO = consulta.hora;
    if (horaISO && horaISO.length === 5) {
        horaISO = `${horaISO}:00`;
    }

    const diagnosticoPrincipal = consulta.diagnostico?.principal || {};
    const tipoDiagnostico = diagnosticoPrincipal.tipo === 'Definitivo' ? 'DEFINITIVO' : 'PRESUNTIVO';
    const planFarmacologico = consulta.diagnostico?.plan?.farmacologico || {};
    const planNoFarmacologico = consulta.diagnostico?.plan?.noFarmacologico || {};
    const resultados = Array.isArray(consulta.diagnostico?.resultados) ? consulta.diagnostico.resultados : [];
    const estudiosTexto = consulta.diagnostico?.estudios;
    const usuario = consulta.usuario
        || JSON.parse(localStorage.getItem('usuarioLogueado') || '{}')?.username
        || JSON.parse(localStorage.getItem('usuarioLogueado') || '{}')?.usuario
        || 'admin';

    return {
        idPaciente: idPaciente,
        fecha: fechaISO,
        hora: horaISO,
        motivo: consulta.motivo || consulta.motivoConsulta || "Sin motivo",
        enfermedadActual: consulta.enfermedadActual || "Sin enfermedad actual",
        
        // Vitales
        peso: parseFloat(consulta.signosVitales?.peso) || 0,
        talla: parseFloat(consulta.signosVitales?.talla) || 0,
        temperatura: parseFloat(consulta.signosVitales?.temperatura) || 0,
        fc: parseInt(consulta.signosVitales?.fc) || 0,
        fr: parseInt(consulta.signosVitales?.fr) || 0,
        spo2: parseInt(consulta.signosVitales?.spo2) || 0,
        
        // Diagnóstico
        diagnosticoTexto: [diagnosticoPrincipal.cie10, diagnosticoPrincipal.descripcion].filter(Boolean).join(' - ') || "Sin diagnóstico",
        tipoDiagnostico: tipoDiagnostico,
        
        usuario,
        jsonCompleto: consulta,

        // Listas detalladas
        listaPlan: [
            {
                medicamento: planFarmacologico.esquema || '',
                dosis: '',
                frecuencia: '',
                duracion: '',
                indicaciones: [
                    planFarmacologico.viaVenosa ? `Via venosa: ${planFarmacologico.viaVenosa}` : '',
                    planFarmacologico.viaOral ? `Via oral: ${planFarmacologico.viaOral}` : '',
                    planNoFarmacologico.hidratacion ? 'Hidratacion' : '',
                    planNoFarmacologico.dieta ? 'Dieta' : '',
                    planNoFarmacologico.oxigeno ? 'Oxigeno' : '',
                    planNoFarmacologico.fisio ? 'Fisio' : '',
                    planNoFarmacologico.otros || ''
                ].filter(Boolean).join(' | ')
            }
        ].filter(plan => plan.medicamento || plan.indicaciones),

        listaEstudios: resultados.length > 0
            ? resultados.map((e: any) => ({
                tipo: e.tipo || 'General',
                descripcion: e.examen || estudiosTexto || 'Estudio',
                fecha: e.fecha || fechaISO,
                resultado: e.resultado || ""
            }))
            : (typeof estudiosTexto === 'string' && estudiosTexto.trim()
                ? [{
                    tipo: 'General',
                    descripcion: estudiosTexto.trim(),
                    fecha: fechaISO,
                    resultado: ''
                }]
                : [])
    };
}
