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
    return {
        // Identificador único (usar idConsulta del backend)
        id: `consulta-${consulta.idConsulta}`,

        // Fecha y hora
        fecha: consulta.fecha,
        hora: consulta.hora,

        // Motivo y enfermedad actual
        motivoConsulta: consulta.motivo,
        enfermedadActual: consulta.enfermedadActual,

        // Signos vitales
        signosVitales: {
            peso: consulta.peso,
            talla: consulta.talla,
            temperatura: consulta.temperatura,
            fc: consulta.fc,
            fr: consulta.fr,
            spo2: consulta.spo2
        },

        // Diagnóstico
        diagnostico: {
            texto: consulta.diagnosticoTexto,
            tipo: consulta.tipoDiagnostico
        },

        // Plan terapéutico
        planTerapeutico: consulta.listaPlan?.map(plan => ({
            medicamento: plan.medicamento,
            dosis: plan.dosis,
            frecuencia: plan.frecuencia,
            duracion: plan.duracion,
            indicaciones: plan.indicaciones
        })) || [],

        // Estudios de laboratorio
        estudios: consulta.listaEstudios?.map(estudio => ({
            tipo: estudio.tipo,
            descripcion: estudio.descripcion,
            fecha: estudio.fecha,
            resultado: estudio.resultado
        })) || [],

        // Metadata
        usuario: consulta.usuario,
        sincronizado: true  // Viene del servidor
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

    return {
        idPaciente: idPaciente,
        fecha: fechaISO,
        hora: horaISO,
        motivo: consulta.motivoConsulta || consulta.motivo || "Sin motivo",
        enfermedadActual: consulta.enfermedadActual || "Sin enfermedad actual",
        
        // Vitales
        peso: parseFloat(consulta.signosVitales?.peso) || 0,
        talla: parseFloat(consulta.signosVitales?.talla) || 0,
        temperatura: parseFloat(consulta.signosVitales?.temperatura) || 0,
        fc: parseInt(consulta.signosVitales?.fc) || 0,
        fr: parseInt(consulta.signosVitales?.fr) || 0,
        spo2: parseInt(consulta.signosVitales?.spo2) || 0,
        
        // Diagnóstico
        diagnosticoTexto: consulta.diagnostico?.principal?.diagnostico || consulta.diagnostico?.texto || "Sin diagnóstico",
        tipoDiagnostico: consulta.diagnostico?.principal?.presuntivoDefinitivo || consulta.diagnostico?.tipo || "PRESUNTIVO",
        
        usuario: consulta.usuario || 'admin',

        // Listas detalladas
        listaPlan: consulta.diagnostico?.plan?.farmacologico?.map((p: any) => ({
            medicamento: p.medicamento,
            dosis: p.dosis,
            frecuencia: p.frecuencia,
            duracion: p.duracion,
            indicaciones: p.indicaciones
        })) || [],

        listaEstudios: consulta.diagnostico?.estudios?.map((e: any) => ({
            tipo: e.tipo,
            descripcion: e.descripcion,
            fecha: e.fecha || new Date().toISOString().split('T')[0],
            resultado: e.resultado || ""
        })) || []
    };
}
