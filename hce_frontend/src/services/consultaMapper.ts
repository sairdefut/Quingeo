// src/services/consultaMapper.ts
// Mapper para convertir ConsultaDTO del backend al formato del frontend

export interface ConsultaBackend {
    idConsulta: number;
    idPaciente: number;
    uuidOffline?: string;
    syncStatus?: string;
    lastModified?: string;
    idHistoriaClinica?: number;
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
    perimetroCefalico?: number;
    diagnosticoTexto: string;
    tipoDiagnostico: string;
    usuario: string;
    listaPlan?: PlanTerapeuticoDTO[];
    listaEstudios?: EstudioLaboratorioDTO[];
    referenciaHospital?: boolean;
    motivoReferencia?: string;
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

export function mapConsultaBackendToFrontend(consulta: ConsultaBackend): any {
    const respaldo = consulta.jsonCompleto ?? {};
    const planFarmacologico = respaldo.diagnostico?.plan?.farmacologico;
    const planNoFarmacologico = respaldo.diagnostico?.plan?.noFarmacologico;
    const referenciaHospital = respaldo.referenciaHospital
        ?? respaldo.diagnostico?.cierre?.referenciaHospital
        ?? consulta.referenciaHospital
        ?? false;
    const motivoReferencia = respaldo.motivoReferencia
        ?? respaldo.diagnostico?.cierre?.motivoReferencia
        ?? consulta.motivoReferencia
        ?? '';

    return {
        ...respaldo,
        id: respaldo.id || consulta.uuidOffline || consulta.idConsulta || `consulta-${consulta.idConsulta}`,
        uuidOffline: respaldo.uuidOffline || consulta.uuidOffline,
        idConsulta: consulta.idConsulta,
        idPaciente: consulta.idPaciente,
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
                spo2: consulta.spo2,
                perimetroCefalico: consulta.perimetroCefalico
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
            spo2: consulta.spo2,
            perimetroCefalico: consulta.perimetroCefalico
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
            proximaCita: respaldo.diagnostico?.proximaCita || '',
            cierre: {
                referenciaHospital,
                motivoReferencia
            }
        },
        referenciaHospital,
        motivoReferencia,
        usuario: consulta.usuario,
        idHistoriaClinica: consulta.idHistoriaClinica,
        syncStatus: consulta.syncStatus || 'synced',
        lastModified: consulta.lastModified,
        sincronizado: true
    };
}

export function mapConsultaFrontendToBackend(consulta: any, idPaciente: number): any {
    let fechaISO = consulta.fecha;
    if (consulta.fecha && consulta.fecha.includes('/')) {
        const [d, m, y] = consulta.fecha.split('/');
        fechaISO = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    const horaISO = normalizarHoraBackend(consulta.hora);

    const diagnosticoPrincipal = consulta.diagnostico?.principal || {};
    const tipoDiagnostico = diagnosticoPrincipal.tipo === 'Definitivo' ? 'DEFINITIVO' : 'PRESUNTIVO';
    const planFarmacologico = consulta.diagnostico?.plan?.farmacologico || {};
    const planNoFarmacologico = consulta.diagnostico?.plan?.noFarmacologico || {};
    const resultados = Array.isArray(consulta.diagnostico?.resultados) ? consulta.diagnostico.resultados : [];
    const estudiosTexto = consulta.diagnostico?.estudios;
    const referenciaHospital = Boolean(consulta.diagnostico?.cierre?.referenciaHospital ?? consulta.referenciaHospital);
    const usuario = consulta.usuario
        || JSON.parse(localStorage.getItem('usuarioLogueado') || '{}')?.username
        || JSON.parse(localStorage.getItem('usuarioLogueado') || '{}')?.usuario
        || 'admin';

    return {
        idConsulta: consulta.idConsulta,
        uuidOffline: consulta.uuidOffline || consulta.id,
        idPaciente,
        fecha: fechaISO,
        hora: horaISO,
        motivo: consulta.motivo || consulta.motivoConsulta || 'Sin motivo',
        enfermedadActual: consulta.enfermedadActual || 'Sin enfermedad actual',

        peso: parseFloat(consulta.signosVitales?.peso) || 0,
        talla: parseFloat(consulta.signosVitales?.talla) || 0,
        temperatura: parseFloat(consulta.signosVitales?.temperatura) || 0,
        fc: parseInt(consulta.signosVitales?.fc) || 0,
        fr: parseInt(consulta.signosVitales?.fr) || 0,
        spo2: parseInt(consulta.signosVitales?.spo2) || 0,
        perimetroCefalico: consulta.signosVitales?.perimetroCefalico
            ? parseFloat(consulta.signosVitales.perimetroCefalico)
            : null,

        diagnosticoTexto: [diagnosticoPrincipal.cie10, diagnosticoPrincipal.descripcion].filter(Boolean).join(' - ') || 'Sin diagnóstico',
        tipoDiagnostico,
        referenciaHospital,
        motivoReferencia: referenciaHospital
            ? (consulta.diagnostico?.cierre?.motivoReferencia || consulta.motivoReferencia || '')
            : '',

        usuario,
        jsonCompleto: consulta,

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
                resultado: e.resultado || ''
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

function normalizarHoraBackend(hora?: string): string {
    if (!hora) {
        return new Date().toTimeString().slice(0, 8);
    }

    const limpia = hora.trim().toLowerCase().replace(/\s+/g, ' ');
    const formato24Horas = limpia.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (formato24Horas) {
        return [
            formato24Horas[1].padStart(2, '0'),
            formato24Horas[2],
            formato24Horas[3] || '00'
        ].join(':');
    }

    const formato12Horas = limpia.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap])\.?\s*m\.?$/);
    if (formato12Horas) {
        let horas = Number(formato12Horas[1]);
        const minutos = formato12Horas[2];
        const segundos = formato12Horas[3] || '00';
        const periodo = formato12Horas[4];

        if (periodo === 'p' && horas < 12) horas += 12;
        if (periodo === 'a' && horas === 12) horas = 0;

        return `${String(horas).padStart(2, '0')}:${minutos}:${segundos}`;
    }

    return new Date().toTimeString().slice(0, 8);
}
