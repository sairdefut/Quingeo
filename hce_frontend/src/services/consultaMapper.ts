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
    datosGestacionales?: any[];
    complicacionesPerinatales?: any[];
    antecedentesInmunizacion?: any[];
    antecedentesPatologicosPersonales?: any;
    enfermedadesDiagnosticadas?: any[];
    alergiasPaciente?: any[];
    hospitalizacionesPrevias?: any[];
    cirugiasPrevias?: any[];
    antecedentesFamiliares?: any[];
    desarrolloPsicomotor?: any;
    hitosDesarrollo?: any[];
    alimentacion?: any[];
    examenFisico?: any;
    signosVitales?: any[];
    examenFisicoSegmentario?: any;
    pielFaneras?: any[];
    cabezaCuello?: any[];
    cardioPulmonar?: any[];
    abdomen?: any[];
    neurologico?: any[];
    diagnosticoPlanManejo?: any;
    planesTerapeuticos?: PlanTerapeuticoDTO[];
    estudiosLaboratorios?: EstudioLaboratorioDTO[];
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
    const normalizado = buildFrontendFromNormalizedBackend(consulta);
    const respaldo = consulta.jsonCompleto ?? normalizado ?? {};
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

    const listaPlan = [
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
    ].filter(plan => plan.medicamento || plan.indicaciones);

    const listaEstudios = resultados.length > 0
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
            : []);

    const perinatales = consulta.antecedentes?.perinatales || {};
    const vacunacion = consulta.antecedentes?.vacunacion || {};
    const personales = consulta.antecedentes?.personales || {};
    const desarrollo = consulta.antecedentes?.desarrollo || {};
    const signos = consulta.signosVitales || consulta.examenFisico?.vitales || {};
    const segmentario = consulta.examenFisico?.segmentario || {};
    const diagnosticoCompleto = consulta.diagnostico || {};

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

        listaPlan,
        planesTerapeuticos: listaPlan,
        listaEstudios,
        estudiosLaboratorios: listaEstudios,

        antecedentesPerinatales: {
            usuario
        },
        datosGestacionales: hasPerinatalData(perinatales)
            ? [{
                productoGestacion: perinatales.productoGestacion || '',
                edadGestacional: perinatales.edadGestacional ? String(perinatales.edadGestacional) : '',
                viaParto: perinatales.viaParto || '',
                pesoNacer: parseOptionalFloat(perinatales.pesoNacimiento),
                tallaNacer: parseOptionalFloat(perinatales.tallaNacimiento),
                apgarMinuto: sumApgar(perinatales.apgar),
                apgarCincoMinutos: sumApgar(perinatales.apgar),
                complicacionesPerinatales: perinatales.descripcionComplicaciones || ''
            }]
            : [],
        complicacionesPerinatales: [
            ...selectedLabels(perinatales.checksComplicaciones).map(descripcion => ({ descripcion, fecha: fechaISO })),
            ...(perinatales.descripcionComplicaciones ? [{ descripcion: perinatales.descripcionComplicaciones, fecha: fechaISO }] : [])
        ],
        antecedentesInmunizacion: vacunacion.estado
            ? [{
                estadoVacunacion: vacunacion.estado,
                fechaVacunacion: fechaISO,
                descripcion: safeJson(vacunacion.vacunas || {})
            }]
            : [],
        antecedentesPatologicosPersonales: {
            observaciones: [personales.descripcionCronicas, personales.descripcionOtrasCronicas].filter(Boolean).join(' | '),
            usuario
        },
        enfermedadesDiagnosticadas: [
            ...selectedLabels(personales.enfermedadesCronicas).map(descripcion => ({ descripcion, fecha: fechaISO, usuario })),
            ...(personales.descripcionCronicas ? [{ descripcion: personales.descripcionCronicas, fecha: fechaISO, usuario }] : []),
            ...(personales.descripcionOtrasCronicas ? [{ descripcion: personales.descripcionOtrasCronicas, fecha: fechaISO, usuario }] : [])
        ],
        alergiasPaciente: personales.alergias?.tiene
            ? [{
                nombreAlergia: personales.alergias.descripcion || 'Alergia no especificada',
                observaciones: personales.alergias.descripcion || '',
                fechaCreacion: fechaISO
            }]
            : [],
        hospitalizacionesPrevias: personales.hospitalizaciones?.tiene
            ? [{
                causa: personales.hospitalizaciones.descripcion || 'Hospitalizacion previa',
                fecha: toIsoDateOrNull(personales.hospitalizaciones.fecha)
            }]
            : [],
        cirugiasPrevias: personales.cirugias?.tiene
            ? [{
                tipo: personales.cirugias.descripcion || 'Cirugia previa',
                fecha: toIsoDateOrNull(personales.cirugias.fecha)
            }]
            : [],
        antecedentesFamiliares: selectedLabels(personales.familiares)
            .map(enfermedadHereditaria => ({ enfermedadHereditaria, descripcion: enfermedadHereditaria, fecha: fechaISO })),
        desarrolloPsicomotor: desarrollo.hitos || desarrollo.alimentacion
            ? { observacion: 'Evaluacion registrada desde consulta', fechaEvaluacion: fechaISO, usuario }
            : null,
        hitosDesarrollo: desarrollo.hitos
            ? [{
                sostenCefalio: desarrollo.hitos.sostenCefalico || '',
                sedestacion: desarrollo.hitos.sedestacion || '',
                deambulacion: desarrollo.hitos.deambulacion || '',
                lenguaje: desarrollo.hitos.lenguaje || '',
                observacion: desarrollo.hitos.desconoce ? 'Desconoce' : ''
            }]
            : [],
        alimentacion: desarrollo.alimentacion
            ? [{
                descripcion: 'Alimentacion registrada',
                tipoLactancia: desarrollo.alimentacion.lactancia?.checked ? 'Lactancia' : '',
                edadLactancia: desarrollo.alimentacion.lactancia?.duracion || '',
                tipo: desarrollo.alimentacion.formula?.tipo || '',
                edadAblactacion: desarrollo.alimentacion.ablactacion?.edadInicio || ''
            }]
            : [],
        examenFisico: {},
        signosVitales: [{
            peso: parseOptionalFloat(signos.peso),
            tallaLongitud: parseOptionalFloat(signos.talla),
            temperatura: parseOptionalFloat(signos.temperatura),
            frecuenciaCardiaca: parseOptionalInt(signos.fc),
            frecuenciaRespiratoria: parseOptionalInt(signos.fr),
            saturacionOxigeno: parseOptionalInt(signos.spo2),
            perimetroCefalico: parseOptionalFloat(signos.perimetroCefalico),
            presionArterialSistolica: parseOptionalInt(signos.paSistolica),
            presionArterialDiastolica: parseOptionalInt(signos.paDiastolica),
            puntuacion: signos.glasgow || '',
            observacion: signos.aspectoGeneral || ''
        }],
        examenFisicoSegmentario: {
            aspectoGeneral: selectedLabels(segmentario.aspecto).join(', '),
            pielFaneras: selectedLabels(segmentario.piel).join(', '),
            cabezaCuello: selectedLabels(segmentario.cabeza).join(', '),
            cardioPulmonar: selectedLabels(segmentario.cardio).join(', '),
            abdomen: selectedLabels(segmentario.abdomen).join(', '),
            neurologico: selectedLabels(segmentario.neuro).join(', '),
            evolucionClinica: consulta.examenFisico?.evolucion || ''
        },
        pielFaneras: segmentario.piel
            ? [{
                icterisia: boolByte(segmentario.piel.Ictericia),
                psianosis: boolByte(segmentario.piel.Cianosis),
                rash: boolByte(segmentario.piel.Rash),
                otros: selectedLabels(segmentario.piel).join(', ')
            }]
            : [],
        cabezaCuello: segmentario.cabeza
            ? [{
                fontaneloAnterior: segmentario.cabeza['Fontanela Anterior'] ? 'Presente' : '',
                adenopatia: segmentario.cabeza['Adenopatias'] || segmentario.cabeza['Adenopatías'] ? 'Si' : '',
                otros: segmentario.cabezaOtros || ''
            }]
            : [],
        cardioPulmonar: segmentario.cardio
            ? [{
                ruidoCardiaco: segmentario.cardio['Ruidos cardiacos'] ? 'Presente' : '',
                murmulloVesicular: segmentario.cardio['Murmullo vesicular'] ? 'Presente' : '',
                soplos: segmentario.cardio.Soplos ? 'Si' : '',
                crepitante: segmentario.cardio.Crepitantes ? 'Si' : '',
                otros: selectedLabels(segmentario.cardio).join(', ')
            }]
            : [],
        abdomen: segmentario.abdomen
            ? [{
                blando: Boolean(segmentario.abdomen.Blando),
                depresible: Boolean(segmentario.abdomen.Depresible),
                hepatomegalia: Boolean(segmentario.abdomen.Hepatomegalia),
                esplenomegalia: Boolean(segmentario.abdomen.Esplenomegalia),
                dolorPalpacion: false,
                otros: selectedLabels(segmentario.abdomen).join(', ')
            }]
            : [],
        neurologico: segmentario.neuro
            ? [{
                reflejoOsteotendinoso: segmentario.neuro.Reflejos ? 'Presente' : '',
                tonoMuscular: segmentario.neuro.Tono ? 'Presente' : '',
                otros: selectedLabels(segmentario.neuro).join(', ')
            }]
            : [],
        diagnosticoPlanManejo: {
            observacion: safeJson(diagnosticoCompleto),
            fecha: fechaISO
        }
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

function buildFrontendFromNormalizedBackend(consulta: ConsultaBackend): any | null {
    const hasNormalizedData = Boolean(
        consulta.datosGestacionales?.length ||
        consulta.signosVitales?.length ||
        consulta.examenFisicoSegmentario ||
        consulta.diagnosticoPlanManejo ||
        consulta.hitosDesarrollo?.length
    );

    if (!hasNormalizedData) return null;

    const dato = consulta.datosGestacionales?.[0] || {};
    const vacuna = consulta.antecedentesInmunizacion?.[0] || {};
    const vital = consulta.signosVitales?.[0] || {};
    const segmentario = consulta.examenFisicoSegmentario || {};
    const hito = consulta.hitosDesarrollo?.[0] || {};
    const alimentacion = consulta.alimentacion?.[0] || {};
    const diagnosticoNormalizado = parseJsonObject(consulta.diagnosticoPlanManejo?.observacion);

    return {
        antecedentes: {
            perinatales: {
                productoGestacion: dato.productoGestacion || '',
                edadGestacional: dato.edadGestacional || '',
                viaParto: dato.viaParto || '',
                pesoNacimiento: dato.pesoNacer ?? '',
                tallaNacimiento: dato.tallaNacer ?? '',
                apgar: {
                    apariencia: dato.apgarMinuto || 0,
                    pulso: 0,
                    reflejos: 0,
                    tonoMuscular: 0,
                    respiracion: 0
                },
                checksComplicaciones: labelsToFlags((consulta.complicacionesPerinatales || []).map((c: any) => c.descripcion).join(', ')),
                descripcionComplicaciones: dato.complicacionesPerinatales || ''
            },
            vacunacion: {
                estado: vacuna.estadoVacunacion || '',
                vacunas: parseJsonObject(vacuna.descripcion) || {}
            },
            personales: {
                enfermedadesCronicas: labelsToFlags((consulta.enfermedadesDiagnosticadas || []).map((e: any) => e.descripcion).join(', ')),
                hospitalizaciones: {
                    tiene: Boolean(consulta.hospitalizacionesPrevias?.length),
                    descripcion: consulta.hospitalizacionesPrevias?.[0]?.causa || '',
                    fecha: consulta.hospitalizacionesPrevias?.[0]?.fecha || ''
                },
                cirugias: {
                    tiene: Boolean(consulta.cirugiasPrevias?.length),
                    descripcion: consulta.cirugiasPrevias?.[0]?.tipo || '',
                    fecha: consulta.cirugiasPrevias?.[0]?.fecha || ''
                },
                alergias: {
                    tiene: Boolean(consulta.alergiasPaciente?.length),
                    descripcion: consulta.alergiasPaciente?.[0]?.nombreAlergia || consulta.alergiasPaciente?.[0]?.observaciones || ''
                },
                familiares: labelsToFlags((consulta.antecedentesFamiliares || []).map((f: any) => f.enfermedadHereditaria || f.descripcion).join(', ')),
                descripcionCronicas: consulta.antecedentesPatologicosPersonales?.observaciones || '',
                descripcionOtrasCronicas: ''
            },
            desarrollo: {
                hitos: {
                    sostenCefalico: hito.sostenCefalio || '',
                    sedestacion: hito.sedestacion || '',
                    deambulacion: hito.deambulacion || '',
                    lenguaje: hito.lenguaje || '',
                    desconoce: hito.observacion === 'Desconoce'
                },
                alimentacion: {
                    lactancia: {
                        checked: Boolean(alimentacion.tipoLactancia),
                        duracion: alimentacion.edadLactancia || ''
                    },
                    formula: {
                        checked: Boolean(alimentacion.tipo),
                        tipo: alimentacion.tipo || ''
                    },
                    ablactacion: {
                        checked: Boolean(alimentacion.edadAblactacion),
                        edadInicio: alimentacion.edadAblactacion || ''
                    }
                }
            }
        },
        signosVitales: {
            peso: vital.peso ?? consulta.peso ?? '',
            talla: vital.tallaLongitud ?? consulta.talla ?? '',
            temperatura: vital.temperatura ?? consulta.temperatura ?? '',
            fc: vital.frecuenciaCardiaca ?? consulta.fc ?? '',
            fr: vital.frecuenciaRespiratoria ?? consulta.fr ?? '',
            spo2: vital.saturacionOxigeno ?? consulta.spo2 ?? '',
            paSistolica: vital.presionArterialSistolica ?? '',
            paDiastolica: vital.presionArterialDiastolica ?? '',
            perimetroCefalico: vital.perimetroCefalico ?? consulta.perimetroCefalico ?? '',
            glasgow: vital.puntuacion || '',
            aspectoGeneral: vital.observacion || ''
        },
        examenFisico: {
            vitales: {},
            segmentario: {
                aspecto: labelsToFlags(segmentario.aspectoGeneral),
                piel: labelsToFlags(segmentario.pielFaneras),
                cabeza: labelsToFlags(segmentario.cabezaCuello),
                cardio: labelsToFlags(segmentario.cardioPulmonar),
                abdomen: labelsToFlags(segmentario.abdomen),
                neuro: labelsToFlags(segmentario.neurologico),
                cabezaOtros: consulta.cabezaCuello?.[0]?.otros || ''
            },
            evolucion: segmentario.evolucionClinica || ''
        },
        diagnostico: diagnosticoNormalizado || undefined
    };
}

function selectedLabels(values: Record<string, any> | undefined): string[] {
    if (!values || typeof values !== 'object') return [];
    return Object.entries(values)
        .filter(([, value]) => value === true)
        .map(([key]) => key)
        .filter(key => key.toLowerCase() !== 'ninguna' && key.toLowerCase() !== 'normal');
}

function labelsToFlags(value: any): Record<string, boolean> {
    const flags: Record<string, boolean> = {};
    if (!value) return flags;
    String(value).split(',')
        .map(part => part.trim())
        .filter(Boolean)
        .forEach(label => {
            flags[label] = true;
        });
    return flags;
}

function parseOptionalFloat(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number.parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalInt(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number.parseInt(String(value), 10);
    return Number.isFinite(parsed) ? parsed : null;
}

function sumApgar(apgar: any): number | null {
    if (!apgar || typeof apgar !== 'object') return null;
    const total = Object.values(apgar).reduce<number>((sum, value) => {
        const parsed = Number.parseInt(String(value || 0), 10);
        return sum + (Number.isFinite(parsed) ? parsed : 0);
    }, 0);
    return total || null;
}

function boolByte(value: any): number {
    return value ? 1 : 0;
}

function safeJson(value: any): string {
    try {
        return JSON.stringify(value ?? {});
    } catch {
        return String(value ?? '');
    }
}

function parseJsonObject(value: any): any | null {
    if (!value || typeof value !== 'string') return null;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function toIsoDateOrNull(value: any): string | null {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
    if (String(value).includes('/')) {
        const [d, m, y] = String(value).split('/');
        if (d && m && y) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return null;
}

function hasPerinatalData(perinatales: any): boolean {
    if (!perinatales || typeof perinatales !== 'object') return false;
    return Boolean(
        perinatales.productoGestacion ||
        perinatales.edadGestacional ||
        perinatales.viaParto ||
        perinatales.pesoNacimiento ||
        perinatales.tallaNacimiento ||
        perinatales.descripcionComplicaciones ||
        selectedLabels(perinatales.checksComplicaciones).length
    );
}
