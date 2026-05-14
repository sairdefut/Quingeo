/// <reference types="react" />
import { useState, useMemo, useEffect } from 'react';

import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import type { Paciente } from '../../models/Paciente';

// Importaciones de componentes seccionados
import { AlertaAlergia } from './components/alertaAlergia';
import { VistaIdentificacion } from './components/VistaIdentificacion';
import { SeccionAntecedentes } from './components/SeccionAntecedentes';
import { TabsConsultaActual } from './components/TabsConsultaActual';

// Servicios y utilidades
import { obtenerPacientes, agregarConsulta, actualizarConsultaExistente } from "../../services/dbPacienteService";
import { calcularIMC, obtenerZScore, calcularEdadMeses } from './medicaCalcular';

export default function HistorialConsultas() {
    const { cedula } = useParams<{ cedula: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // 1. ESTADOS PRINCIPALES
    const [tabActiva, setTabActiva] = useState('anamnesis');
    const [pacienteActual, setPacienteActual] = useState<any>(null);
    const [bloquearAntecedentes, setBloquearAntecedentes] = useState(true);

    // 2. ESTADOS DE FORMULARIO
    const [motivoConsulta, setMotivoConsulta] = useState("");
    const [enfermedadActual, setEnfermedadActual] = useState("");

    // Antecedentes Perinatales
    const [productoGestacion, setProductoGestacion] = useState("");
    const [edadGestacional, setEdadGestacional] = useState<number | "">("");
    const [viaParto, setViaParto] = useState("");
    const [pesoNacimiento, setPesoNacimiento] = useState<number | "">("");
    const [tallaNacimiento, setTallaNacimiento] = useState<number | "">("");
    const [apgar, setApgar] = useState({ apariencia: 0, pulso: 0, reflejos: 0, tonoMuscular: 0, respiracion: 0 });
    const [checksComplicaciones, setChecksComplicaciones] = useState({ sdr: false, ictericia: false, sepsis: false, ninguna: true });
    const [descripcionComplicaciones, setDescripcionComplicaciones] = useState("");

    // Antecedentes Personales y Alergias
    const [enfermedadesCronicas, setEnfermedadesCronicas] = useState({ "Asma": false, "Diabetes": false, "Cardiopatías": false, "Epilepsia": false, "Otros": false });
    const [hospitalizaciones, setHospitalizaciones] = useState({ tiene: false, descripcion: "", fecha: "" });
    const [cirugias, setCirugias] = useState({ tiene: false, descripcion: "", fecha: "" });
    const [alergias, setAlergias] = useState({ tiene: false, descripcion: "" });
    const [familiares, setFamiliares] = useState({ HTA: false, Diabetes: false, Cáncer: false, Genéticas: false, Ninguna: false, Otros: false });
    const [descripcionCronicas, setDescripcionCronicas] = useState("");
    const [descripcionOtrasCronicas, setDescripcionOtrasCronicas] = useState("");

    // Inmunizaciones y Desarrollo
    const [estadoVacunacion, setEstadoVacunacion] = useState("");
    const [desarrollo, setDesarrollo] = useState({ sostenCefalico: "", sedestacion: "", deambulacion: "", lenguaje: "", desconoce: false });
    const [alimentacion, setAlimentacion] = useState({
        lactancia: { checked: false, duracion: "" },
        formula: { checked: false, tipo: "" },
        ablactacion: { checked: false, edadInicio: "" }
    });

    // Examen Físico y Diagnóstico
    const [signosVitales, setSignosVitales] = useState({ peso: "", talla: "", temperatura: "", fc: "", fr: "", spo2: "", paSistolica: "", paDiastolica: "", perimetroCefalico: "" });
    const [examenSegmentario, setExamenSegmentario] = useState({
        aspecto: { Consciente: true, Alerta: true, Activo: true, Decaído: false },
        piel: { Ictericia: false, Cianosis: false, Rash: false, Normal: true },
        cabeza: { 'Fontanela Anterior': true, Adenopatías: false, Normal: true },
        cardio: { 'Ruidos cardiacos': true, 'Murmullo vesicular': true, Soplos: false },
        abdomen: { Blando: true, Depresible: true, Hepatomegalia: false },
        neuro: { 'Reflejos': true, 'Tono': true }
    });
    const [evolucionClinica, setEvolucionClinica] = useState("");
    const [diagnosticoPrincipal, setDiagnosticoPrincipal] = useState({ id: uuidv4(), cie10: '', descripcion: '', tipo: 'Presuntivo' as 'Presuntivo' | 'Definitivo' });
    const [diagnosticosSecundarios, setDiagnosticosSecundarios] = useState<any[]>([]);
    const [estudiosSolicitados, setEstudiosSolicitados] = useState("");
    const [resultadosExamenes, setResultadosExamenes] = useState<any[]>([]);
    const [planFarmacologico, setPlanFarmacologico] = useState({ esquema: "", viaVenosa: "", viaOral: "" });
    const [planNoFarmacologico, setPlanNoFarmacologico] = useState({ hidratacion: false, dieta: false, oxigeno: false, fisio: false, otros: "" });
    const [pronostico, setPronostico] = useState("Bueno");
    const [proximaCita, setProximaCita] = useState("");

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const cargarPaciente = async () => {
            const lista = await obtenerPacientes();
            const encontrado = lista.find((p: Paciente) => String(p.cedula) === String(cedula));
            if (encontrado) {
                setPacienteActual(encontrado);
                const historia = encontrado.historiaClinica || [];
                setBloquearAntecedentes(historia.length > 0);

                // Alerta inmediata de alergias si existen en historial previo
                if (historia.length > 0) {
                    const ult = historia[historia.length - 1];
                    if (ult.antecedentes?.personales?.alergias) setAlergias(ult.antecedentes.personales.alergias);
                }
            }
        };
        cargarPaciente();

        const consultaEdicion = location.state?.consultaAEditar;
        if (consultaEdicion) {
            setMotivoConsulta(consultaEdicion.motivo || "");
            setEnfermedadActual(consultaEdicion.enfermedadActual || "");
            setSignosVitales(consultaEdicion.examenFisico?.vitales || {});
            setEvolucionClinica(consultaEdicion.examenFisico?.evolucion || "");
            if (consultaEdicion.diagnostico?.principal) setDiagnosticoPrincipal(consultaEdicion.diagnostico.principal);
            setPronostico(consultaEdicion.diagnostico?.pronostico || "Bueno");
            setProximaCita(consultaEdicion.diagnostico?.proximaCita || "");
        }
    }, [cedula, location.state]);

    // --- CÁLCULOS MÉDICOS ---
    const edadM = useMemo(() => pacienteActual ? calcularEdadMeses(pacienteActual.fechaNacimiento) : 0, [pacienteActual]);
    
    const edadFormateada = useMemo(() => {
        if (!edadM) return "";
        const años = Math.floor(edadM / 12);
        const meses = edadM % 12;
        if (años === 0) return `${meses} meses`;
        if (meses === 0) return `${años} años`;
        return `${años} años, ${meses} meses`;
    }, [edadM]);

    const resIMC = useMemo(() => {
        const p = parseFloat(signosVitales.peso); const t = parseFloat(signosVitales.talla);
        return (p && t) ? calcularIMC(p, t) : { valor: "0.00", interpretacion: "Pendiente", color: "#6c757d" };
    }, [signosVitales.peso, signosVitales.talla]);

    const zP = useMemo(() => obtenerZScore('Peso/Edad', parseFloat(signosVitales.peso), edadM), [signosVitales.peso, edadM]);
    const zT = useMemo(() => obtenerZScore('Talla/Edad', parseFloat(signosVitales.talla), edadM), [signosVitales.talla, edadM]);
    const zI = useMemo(() => obtenerZScore('IMC/Edad', parseFloat(resIMC.valor), edadM), [resIMC.valor, edadM]);

    const handleGuardar = async () => {
        if (!diagnosticoPrincipal.cie10) { alert("Debe ingresar el diagnóstico principal."); setTabActiva('diagnostico'); return; }
        
        try {
            const consultaCompleta = {
                id: location.state?.consultaAEditar?.id || uuidv4(),
                fecha: new Date().toLocaleDateString(),
                hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                motivo: motivoConsulta,
                enfermedadActual,
                antecedentes: {
                    perinatales: { productoGestacion, edadGestacional, viaParto, pesoNacimiento, tallaNacimiento, apgar, checksComplicaciones, descripcionComplicaciones },
                    vacunacion: estadoVacunacion,
                    personales: { enfermedadesCronicas, hospitalizaciones, cirugias, alergias, familiares, descripcionCronicas, descripcionOtrasCronicas },
                    desarrollo: { hitos: desarrollo, alimentacion }
                },
                examenFisico: { vitales: signosVitales, segmentario: examenSegmentario, evolucion: evolucionClinica, nutricion: { resIMC, zP, zT, zI } },
                diagnostico: { principal: diagnosticoPrincipal, secundarios: diagnosticosSecundarios, estudios: estudiosSolicitados, resultados: resultadosExamenes, plan: { farmacologico: planFarmacologico, noFarmacologico: planNoFarmacologico }, pronostico, proximaCita, impresion: enfermedadActual }
            };

            console.log('[DEBUG] Guardando consulta para cédula:', cedula, consultaCompleta);

            let exito = location.state?.consultaAEditar 
                ? await actualizarConsultaExistente(cedula!, consultaCompleta) 
                : await agregarConsulta(cedula!, consultaCompleta);
            
            if (exito) { 
                alert("Consulta guardada exitosamente."); 
                navigate("/pacientes/consulta"); 
            } else {
                alert("Error: No se pudo guardar la consulta. Paciente no encontrado en la base de datos local.");
                console.error('[ERROR] agregarConsulta retornó false. Paciente con cédula', cedula, 'no encontrado en IndexedDB.');
            }
        } catch (error: any) {
            console.error('[ERROR] Error al guardar consulta:', error);
            alert("Error al guardar la consulta: " + (error.message || error));
        }
    };

    return (
        <div className="container-fluid p-0 bg-light" style={{ height: "100vh", overflowY: "auto" }}>
            {/* Header Sticky con diseño limpio y moderno */}
            <div className="bg-white text-dark p-2 border-bottom shadow-sm d-flex justify-content-between align-items-center sticky-top" style={{ zIndex: 1050 }}>
                <div className="d-flex align-items-center px-2">
                    <div className="bg-primary bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                        <i className="bi bi-clipboard2-pulse-fill text-primary fs-5"></i>
                    </div>
                    <div>
                        <h5 className="m-0 fw-bold text-dark">Historia Clínica</h5>
                        <small className="text-muted">Nueva Consulta - {pacienteActual?.nombres} {pacienteActual?.apellidos} {edadFormateada ? `(${edadFormateada})` : ''}</small>
                    </div>
                </div>
                <div className="d-flex gap-2 pe-2">
                    <button className="btn btn-outline-secondary px-3 fw-bold btn-sm" onClick={() => navigate(-1)}>
                        <i className="bi bi-x-lg me-2"></i>CANCELAR
                    </button>
                    <button className="btn btn-primary px-3 fw-bold shadow-sm btn-sm" onClick={handleGuardar} id="btn-guardar-todo">
                        <i className="bi bi-check2-all me-2"></i>GUARDAR TODO
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
                            inmunizaciones={{ estadoVacunacion, setEstadoVacunacion }}
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
                            diagnostico={{ diagnosticoPrincipal, setDiagnosticoPrincipal, diagnosticosSecundarios, setDiagnosticosSecundarios, estudiosSolicitados, setEstudiosSolicitados, resultadosExamenes, setResultadosExamenes, planFarmacologico, setPlanFarmacologico, planNoFarmacologico, setPlanNoFarmacologico, pronostico, setPronostico, proximaCita, setProximaCita, handleGuardar }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
