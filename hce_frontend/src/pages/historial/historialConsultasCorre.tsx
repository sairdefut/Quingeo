/// <reference types="react" />
import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { AlertaAlergia } from './components/alertaAlergia';
import { VistaIdentificacion } from './components/VistaIdentificacion';
import { SeccionAntecedentes } from './components/SeccionAntecedentes';
import { TabsConsultaActual } from './components/TabsConsultaActual';

import { guardarConsultaOffline, obtenerPacienteConConsultas } from '../../services/dbPacienteService';
import { calcularIMC, obtenerZScore, calcularEdadMeses } from './medicaCalcular';

type EstadoVacuna = 'Falta' | 'Aplicada';

const signosVitalesIniciales = {
    peso: '',
    talla: '',
    temperatura: '',
    fc: '',
    fr: '',
    spo2: '',
    paSistolica: '',
    paDiastolica: '',
    perimetroCefalico: '',
    glasgow: '',
    aspectoGeneral: ''
};

const examenSegmentarioInicial = {
    aspecto: { Consciente: false, Alerta: false, Activo: false, Decaído: false },
    piel: { Ictericia: false, Cianosis: false, Rash: false, Normal: false },
    cabeza: { 'Fontanela Anterior': false, 'Fontanela Posterior': false, Adenopatías: false, Normal: false, Otros: false },
    cabezaOtros: '',
    cardio: { 'Ruidos cardiacos': false, 'Murmullo vesicular': false, Soplos: false, Crepitantes: false },
    abdomen: { Blando: false, Depresible: false, Hepatomegalia: false, Esplenomegalia: false },
    neuro: { Reflejos: false, Tono: false }
};

export default function HistorialConsultas() {
    const { cedula } = useParams<{ cedula: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const consultaEnEdicion = location.state?.consultaAEditar;
    const modoEdicion = Boolean(consultaEnEdicion);

    const [tabActiva, setTabActiva] = useState('anamnesis');
    const [pacienteActual, setPacienteActual] = useState<any>(null);
    const [bloquearAntecedentes, setBloquearAntecedentes] = useState(true);

    const [motivoConsulta, setMotivoConsulta] = useState('');
    const [enfermedadActual, setEnfermedadActual] = useState('');

    const [productoGestacion, setProductoGestacion] = useState('');
    const [edadGestacional, setEdadGestacional] = useState<number | ''>('');
    const [viaParto, setViaParto] = useState('');
    const [pesoNacimiento, setPesoNacimiento] = useState<number | ''>('');
    const [tallaNacimiento, setTallaNacimiento] = useState<number | ''>('');
    const [apgar, setApgar] = useState({ apariencia: 0, pulso: 0, reflejos: 0, tonoMuscular: 0, respiracion: 0 });
    const [checksComplicaciones, setChecksComplicaciones] = useState({ sdr: false, ictericia: false, sepsis: false, ninguna: false });
    const [descripcionComplicaciones, setDescripcionComplicaciones] = useState('');

    const [enfermedadesCronicas, setEnfermedadesCronicas] = useState({ Asma: false, Diabetes: false, Cardiopatías: false, Epilepsia: false, Otros: false });
    const [hospitalizaciones, setHospitalizaciones] = useState({ tiene: false, descripcion: '', fecha: '' });
    const [cirugias, setCirugias] = useState({ tiene: false, descripcion: '', fecha: '' });
    const [alergias, setAlergias] = useState({ tiene: false, descripcion: '' });
    const [familiares, setFamiliares] = useState({ HTA: false, Diabetes: false, Cáncer: false, Genéticas: false, Ninguna: false, Otros: false });
    const [descripcionCronicas, setDescripcionCronicas] = useState('');
    const [descripcionOtrasCronicas, setDescripcionOtrasCronicas] = useState('');

    const [estadoVacunacion, setEstadoVacunacion] = useState('');
    const [vacunasFaltantes, setVacunasFaltantes] = useState<Record<string, EstadoVacuna>>({});
    const [desarrollo, setDesarrollo] = useState({ sostenCefalico: '', sedestacion: '', deambulacion: '', lenguaje: '', desconoce: false });
    const [alimentacion, setAlimentacion] = useState({
        lactancia: { checked: false, duracion: '' },
        formula: { checked: false, tipo: '' },
        ablactacion: { checked: false, edadInicio: '' }
    });

    const [signosVitales, setSignosVitales] = useState(signosVitalesIniciales);
    const [examenSegmentario, setExamenSegmentario] = useState<any>(examenSegmentarioInicial);
    const [evolucionClinica, setEvolucionClinica] = useState('');
    const [diagnosticoPrincipal, setDiagnosticoPrincipal] = useState({ id: uuidv4(), cie10: '', descripcion: '', tipo: 'Presuntivo' as 'Presuntivo' | 'Definitivo' });
    const [diagnosticosSecundarios, setDiagnosticosSecundarios] = useState<any[]>([]);
    const [estudiosSolicitados, setEstudiosSolicitados] = useState('');
    const [resultadosExamenes, setResultadosExamenes] = useState<any[]>([]);
    const [planFarmacologico, setPlanFarmacologico] = useState({ esquema: '', viaVenosa: '', viaOral: '' });
    const [planNoFarmacologico, setPlanNoFarmacologico] = useState({ hidratacion: false, dieta: false, oxigeno: false, fisio: false, otros: '' });
    const [pronostico, setPronostico] = useState('Bueno');
    const [proximaCita, setProximaCita] = useState('');
    const [referenciaHospital, setReferenciaHospital] = useState(false);
    const [motivoReferencia, setMotivoReferencia] = useState('');

    const cargarAntecedentesEnFormulario = (consulta: any) => {
        const antecedentes = consulta?.antecedentes;
        if (!antecedentes) return;

        const perinatales = antecedentes.perinatales || {};
        setProductoGestacion(perinatales.productoGestacion || '');
        setEdadGestacional(perinatales.edadGestacional ?? '');
        setViaParto(perinatales.viaParto || '');
        setPesoNacimiento(perinatales.pesoNacimiento ?? '');
        setTallaNacimiento(perinatales.tallaNacimiento ?? '');
        setApgar({
            apariencia: Number(perinatales.apgar?.apariencia || 0),
            pulso: Number(perinatales.apgar?.pulso || 0),
            reflejos: Number(perinatales.apgar?.reflejos || 0),
            tonoMuscular: Number(perinatales.apgar?.tonoMuscular || 0),
            respiracion: Number(perinatales.apgar?.respiracion || 0)
        });
        if (perinatales.checksComplicaciones) {
            setChecksComplicaciones(perinatales.checksComplicaciones);
        }
        setDescripcionComplicaciones(perinatales.descripcionComplicaciones || '');

        const vacunacion = antecedentes.vacunacion;
        if (typeof vacunacion === 'string') {
            setEstadoVacunacion(vacunacion);
            setVacunasFaltantes({});
        } else if (vacunacion) {
            setEstadoVacunacion(vacunacion.estado || '');
            setVacunasFaltantes(vacunacion.vacunas || {});
        }

        const personales = antecedentes.personales || {};
        if (personales.enfermedadesCronicas) setEnfermedadesCronicas(personales.enfermedadesCronicas);
        if (personales.hospitalizaciones) setHospitalizaciones(personales.hospitalizaciones);
        if (personales.cirugias) setCirugias(personales.cirugias);
        if (personales.alergias) setAlergias(personales.alergias);
        if (personales.familiares) setFamiliares(personales.familiares);
        setDescripcionCronicas(personales.descripcionCronicas || '');
        setDescripcionOtrasCronicas(personales.descripcionOtrasCronicas || '');

        const desarrolloData = antecedentes.desarrollo || {};
        if (desarrolloData.hitos) setDesarrollo(desarrolloData.hitos);
        if (desarrolloData.alimentacion) setAlimentacion(desarrolloData.alimentacion);
    };

    useEffect(() => {
        const cargarPaciente = async () => {
            if (!cedula) return;
            const encontrado = await obtenerPacienteConConsultas(cedula);
            if (encontrado) {
                const historia = encontrado.historiaClinica || [];
                setPacienteActual(encontrado);
                setBloquearAntecedentes(historia.length > 0);

                if (historia.length > 0) {
                    const ult = historia[historia.length - 1];
                    cargarAntecedentesEnFormulario(ult);
                }
            }
        };
        cargarPaciente();

        const consultaEdicion = consultaEnEdicion;
        if (consultaEdicion) {
            cargarAntecedentesEnFormulario(consultaEdicion);
            setMotivoConsulta(consultaEdicion.motivo || '');
            setEnfermedadActual(consultaEdicion.enfermedadActual || '');
            setSignosVitales({ ...signosVitalesIniciales, ...(consultaEdicion.examenFisico?.vitales || {}) });
            setExamenSegmentario({ ...examenSegmentarioInicial, ...(consultaEdicion.examenFisico?.segmentario || {}) });
            setEvolucionClinica(consultaEdicion.examenFisico?.evolucion || '');

            if (consultaEdicion.diagnostico?.principal) setDiagnosticoPrincipal(consultaEdicion.diagnostico.principal);
            if (consultaEdicion.diagnostico?.secundarios) setDiagnosticosSecundarios(consultaEdicion.diagnostico.secundarios);
            if (consultaEdicion.diagnostico?.estudios) setEstudiosSolicitados(consultaEdicion.diagnostico.estudios);
            if (consultaEdicion.diagnostico?.resultados) setResultadosExamenes(consultaEdicion.diagnostico.resultados);
            if (consultaEdicion.diagnostico?.plan?.farmacologico) setPlanFarmacologico(consultaEdicion.diagnostico.plan.farmacologico);
            if (consultaEdicion.diagnostico?.plan?.noFarmacologico) setPlanNoFarmacologico(consultaEdicion.diagnostico.plan.noFarmacologico);
            setPronostico(consultaEdicion.diagnostico?.pronostico || 'Bueno');
            setProximaCita(consultaEdicion.diagnostico?.proximaCita || '');
            setReferenciaHospital(Boolean(consultaEdicion.diagnostico?.cierre?.referenciaHospital ?? consultaEdicion.referenciaHospital));
            setMotivoReferencia(consultaEdicion.diagnostico?.cierre?.motivoReferencia || consultaEdicion.motivoReferencia || '');
        }
    }, [cedula, consultaEnEdicion]);

    const edadM = useMemo(() => pacienteActual ? calcularEdadMeses(pacienteActual.fechaNacimiento) : 0, [pacienteActual]);

    const edadFormateada = useMemo(() => {
        if (!edadM) return '';
        const anios = Math.floor(edadM / 12);
        const meses = edadM % 12;
        if (anios === 0) return `${meses} meses`;
        if (meses === 0) return `${anios} años`;
        return `${anios} años, ${meses} meses`;
    }, [edadM]);

    const resIMC = useMemo(() => {
        const p = parseFloat(signosVitales.peso);
        const t = parseFloat(signosVitales.talla);
        return (p && t) ? calcularIMC(p, t) : { valor: '0.00', interpretacion: 'Pendiente', color: '#6c757d' };
    }, [signosVitales.peso, signosVitales.talla]);

    const zP = useMemo(() => obtenerZScore('Peso/Edad', parseFloat(signosVitales.peso), edadM), [signosVitales.peso, edadM]);
    const zT = useMemo(() => obtenerZScore('Talla/Edad', parseFloat(signosVitales.talla), edadM), [signosVitales.talla, edadM]);
    const zI = useMemo(() => obtenerZScore('IMC/Edad', parseFloat(resIMC.valor), edadM), [resIMC.valor, edadM]);

    const handleGuardar = async () => {
        if (!diagnosticoPrincipal.cie10) {
            alert('Debe ingresar el diagnóstico principal.');
            setTabActiva('diagnostico');
            return;
        }

        try {
            const consultaCompleta = {
                id: consultaEnEdicion?.id || uuidv4(),
                uuidOffline: consultaEnEdicion?.uuidOffline,
                idConsulta: consultaEnEdicion?.idConsulta,
                lastModified: consultaEnEdicion?.lastModified,
                fecha: consultaEnEdicion?.fecha || new Date().toLocaleDateString(),
                hora: consultaEnEdicion?.hora || new Date().toTimeString().slice(0, 8),
                motivo: motivoConsulta,
                enfermedadActual,
                antecedentes: {
                    perinatales: { productoGestacion, edadGestacional, viaParto, pesoNacimiento, tallaNacimiento, apgar, checksComplicaciones, descripcionComplicaciones },
                    vacunacion: {
                        estado: estadoVacunacion,
                        vacunas: estadoVacunacion === 'Incompleto' ? vacunasFaltantes : {}
                    },
                    personales: { enfermedadesCronicas, hospitalizaciones, cirugias, alergias, familiares, descripcionCronicas, descripcionOtrasCronicas },
                    desarrollo: { hitos: desarrollo, alimentacion }
                },
                signosVitales,
                examenFisico: { vitales: signosVitales, segmentario: examenSegmentario, evolucion: evolucionClinica, nutricion: { resIMC, zP, zT, zI } },
                diagnostico: {
                    principal: diagnosticoPrincipal,
                    secundarios: diagnosticosSecundarios,
                    estudios: estudiosSolicitados,
                    resultados: resultadosExamenes,
                    plan: { farmacologico: planFarmacologico, noFarmacologico: planNoFarmacologico },
                    pronostico,
                    proximaCita,
                    impresion: enfermedadActual,
                    cierre: { referenciaHospital, motivoReferencia: referenciaHospital ? motivoReferencia : '' }
                },
                referenciaHospital,
                motivoReferencia: referenciaHospital ? motivoReferencia : ''
            };

            console.log('[DEBUG] Guardando consulta para cédula:', cedula, consultaCompleta);

            const exito = await guardarConsultaOffline(cedula!, consultaCompleta);

            if (exito) {
                alert(modoEdicion ? 'Consulta actualizada exitosamente.' : 'Consulta guardada exitosamente.');
                navigate('/pacientes/consulta');
            } else {
                alert('Error: No se pudo guardar la consulta. Paciente no encontrado en la base de datos local.');
                console.error('[ERROR] guardarConsultaOffline retorno false. Paciente con cedula', cedula, 'no encontrado.');
            }
        } catch (error: any) {
            console.error('[ERROR] Error al guardar consulta:', error);
            alert('Error al guardar la consulta: ' + (error.message || error));
        }
    };

    return (
        <div className="container-fluid p-0 bg-light" style={{ height: '100vh', overflowY: 'auto' }}>
            <div className="bg-white text-dark p-2 border-bottom shadow-sm d-flex justify-content-between align-items-center sticky-top" style={{ zIndex: 1050 }}>
                <div className="d-flex align-items-center px-2">
                    <div className="bg-primary bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                        <i className="bi bi-clipboard2-pulse-fill text-primary fs-5"></i>
                    </div>
                    <div>
                        <h5 className="m-0 fw-bold text-dark">Historia Clínica</h5>
                        <small className="text-muted">{modoEdicion ? 'Editar Consulta' : 'Nueva Consulta'} - {pacienteActual?.nombres} {pacienteActual?.apellidos} {edadFormateada ? `(${edadFormateada})` : ''}</small>
                    </div>
                </div>
                <div className="d-flex gap-2 pe-2">
                    <button className="btn btn-outline-secondary px-3 fw-bold btn-sm" onClick={() => navigate(-1)}>
                        <i className="bi bi-x-lg me-2"></i>CANCELAR
                    </button>
                    <button className="btn btn-primary px-3 fw-bold shadow-sm btn-sm" onClick={handleGuardar} id="btn-guardar-todo">
                        <i className="bi bi-check2-all me-2"></i>{modoEdicion ? 'GUARDAR CAMBIOS' : 'GUARDAR TODO'}
                    </button>
                </div>
            </div>

            <AlertaAlergia tiene={alergias.tiene} descripcion={alergias.descripcion} />

            <div className="container-xl p-4">
                <VistaIdentificacion cedula={cedula} paciente={pacienteActual} />

                <div className="card shadow-sm border-0 mb-4 overflow-hidden">
                    <div className="card-body p-0">
                        <SeccionAntecedentes
                            bloquear={bloquearAntecedentes} setBloquear={setBloquearAntecedentes}
                            perinatales={{ productoGestacion, setProductoGestacion, edadGestacional, setEdadGestacional, viaParto, setViaParto, pesoNacimiento, setPesoNacimiento, tallaNacimiento, setTallaNacimiento, apgar, setApgar, checksComplicaciones, setChecksComplicaciones, descripcionComplicaciones, setDescripcionComplicaciones }}
                            personales={{ enfermedadesCronicas, setEnfermedadesCronicas, hospitalizaciones, setHospitalizaciones, cirugias, setCirugias, alergias, setAlergias, familiares, setFamiliares, descripcionCronicas, setDescripcionCronicas, descripcionOtrasCronicas, setDescripcionOtrasCronicas }}
                            inmunizaciones={{ estadoVacunacion, setEstadoVacunacion, vacunasFaltantes, setVacunasFaltantes }}
                            desarrollo={{ desarrollo, setDesarrollo, alimentacion, setAlimentacion }}
                        />
                    </div>
                </div>

                <div className="card shadow-sm border-0">
                    <div className="card-body p-4">
                        <TabsConsultaActual
                            tabActiva={tabActiva} setTabActiva={setTabActiva}
                            anamnesis={{ motivoConsulta, setMotivoConsulta, enfermedadActual, setEnfermedadActual }}
                            fisico={{ signosVitales, setSignosVitales, examenSegmentario, setExamenSegmentario, zP, zT, zI, resIMC, evolucionClinica, setEvolucionClinica, pacienteActual }}
                            diagnostico={{ diagnosticoPrincipal, setDiagnosticoPrincipal, diagnosticosSecundarios, setDiagnosticosSecundarios, estudiosSolicitados, setEstudiosSolicitados, resultadosExamenes, setResultadosExamenes, planFarmacologico, setPlanFarmacologico, planNoFarmacologico, setPlanNoFarmacologico, pronostico, setPronostico, proximaCita, setProximaCita, referenciaHospital, setReferenciaHospital, motivoReferencia, setMotivoReferencia, handleGuardar }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
