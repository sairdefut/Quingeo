import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buscarPacientePorCedula } from "../../services/dbPacienteService";

export default function VerHistorialCompleto() {
    const { cedula } = useParams();
    const navigate = useNavigate();
    const [paciente, setPaciente] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            if (!cedula) return;
            setLoading(true);
            try {
                const encontrado = await buscarPacientePorCedula(cedula);
                if (encontrado) setPaciente(encontrado);
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [cedula]);


    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    if (!cedula || (cedula && !paciente)) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="alert alert-warning shadow-sm">
                    <i className="bi bi-exclamation-triangle me-2"></i>Paciente no encontrado
                    <button className="btn btn-sm btn-outline-dark d-block mt-2 mx-auto" onClick={() => navigate('/historial-clinico')}>Volver al índice</button>
                </div>
            </div>
        );
    }

    const formatearEdad = (edad: any) => {
        if (!edad) return "No registrada";
        if (typeof edad === 'object') {
            return `${edad.años || 0} años, ${edad.meses || 0} meses`;
        }
        return edad;
    };

    const historialOrdenado = paciente.historiaClinica
        ? [...paciente.historiaClinica].reverse()
        : [];

    const obtenerDiagnosticos = (consulta: any) => {
        const diagnosticos = [];
        if (consulta.diagnostico?.principal?.descripcion) {
            diagnosticos.push(consulta.diagnostico.principal);
        }
        if (Array.isArray(consulta.diagnostico?.secundarios)) {
            diagnosticos.push(...consulta.diagnostico.secundarios.filter(Boolean));
        }
        return diagnosticos;
    };

    const obtenerPlan = (consulta: any) => {
        const planFarmacologico = consulta.diagnostico?.plan?.farmacologico?.esquema;
        const planNoFarmacologico = consulta.diagnostico?.plan?.noFarmacologico?.otros;
        return [planFarmacologico, planNoFarmacologico].filter(Boolean).join(' | ') || "No registrado";
    };

    // --- NUEVO: Obtener fecha de creación (si no existe en el objeto, usamos una por defecto o la actual) ---
    const fechaCreacion = paciente.fechaCreacion || new Date().toLocaleDateString();

    return (
        // --- CONTENEDOR PRINCIPAL FLEX ---
        // Usamos minHeight: '100vh' para que crezca libremente hacia abajo
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>

            {/* --- SIDEBAR IZQUIERDO --- */}
            {/* position: 'sticky' hace que se quede fijo mientras el resto de la página se mueve */}
            <div className="bg-white text-dark p-4 d-flex flex-column border-end shadow-sm" style={{ width: '260px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
                <button className="btn btn-outline-secondary btn-sm mb-4 align-self-start fw-bold" onClick={() => navigate('/historial-clinico')}>
                    <i className="bi bi-arrow-left me-2"></i> Volver
                </button>

                <div className="text-center mb-4">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold shadow-sm" style={{ width: '90px', height: '90px', fontSize: '2.5rem' }}>
                        {(paciente.nombres || '?').charAt(0)}{(paciente.apellidos || '?').charAt(0)}
                    </div>
                    <h6 className="fw-bold m-0 text-dark">{paciente.nombres || 'Sin nombre'}</h6>
                    <h6 className="fw-light text-muted m-0">{paciente.apellidos || 'Sin apellido'}</h6>
                    <span className="badge bg-primary mt-2 rounded-pill px-3 shadow-sm">C.I: {paciente.cedula}</span>
                </div>

                <div className="v-stack gap-3">
                    <div className="bg-light border p-2 rounded">
                        <small className="text-uppercase text-muted d-block mb-1 fw-bold" style={{ fontSize: '0.7rem' }}>Edad</small>
                        <span className="fw-medium fs-6 text-dark">{formatearEdad(paciente.edad)}</span>
                    </div>
                    <div className="bg-light border p-2 rounded">
                        <small className="text-uppercase text-muted d-block mb-1 fw-bold" style={{ fontSize: '0.7rem' }}>Sexo / Sangre</small>
                        <span className="fw-medium fs-6 text-dark">{paciente.sexo} | {paciente.tipoSangre}</span>
                    </div>
                    <div className="bg-light border p-2 rounded">
                        <small className="text-uppercase text-muted d-block mb-1 fw-bold" style={{ fontSize: '0.7rem' }}>Ubicación</small>
                        <span className="fw-medium fs-6 text-dark">{paciente.canton}, {paciente.provincia}</span>
                    </div>
                </div>
            </div>

            {/* --- CONTENIDO DERECHO --- */}
            {/* flex-grow-1 permite que ocupe todo el ancho restante y crezca hacia abajo sin límites */}
            <div className="flex-grow-1 p-5">

                {/* --- CABECERA SUPERIOR DE ACCIONES --- */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold text-dark m-0">Expediente Clínico</h4>
                    <button className="btn btn-outline-secondary border shadow-sm btn-sm" onClick={() => window.print()}>
                        <i className="bi bi-printer me-2"></i> Imprimir Historial
                    </button>
                </div>

                {/* --- NUEVA SECCIÓN: DATOS CLÍNICOS DEL PACIENTE ARRIBA --- */}
                <div className="card border-0 shadow-sm mb-5 bg-white rounded-4 overflow-hidden">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                            <div className="bg-primary bg-opacity-10 rounded p-2 me-3">
                                <i className="bi bi-person-vcard fs-5 text-primary"></i>
                            </div>
                            <h6 className="text-dark m-0 fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Datos de Filiación y Registro</h6>
                        </div>
                        <div className="row g-3 px-2">
                            <div className="col-md-3">
                                <span className="text-muted small text-uppercase fw-bold" style={{fontSize: "0.7rem"}}>Nombre Completo</span><br/>
                                <span className="fs-6 fw-medium text-dark">{paciente.nombres || 'Sin nombre'} {paciente.apellidos || 'Sin apellido'}</span>
                            </div>
                            <div className="col-md-3">
                                <span className="text-muted small text-uppercase fw-bold" style={{fontSize: "0.7rem"}}>Cédula de Identidad</span><br/>
                                <span className="fs-6 fw-medium text-dark">{paciente.cedula}</span>
                            </div>
                            <div className="col-md-3">
                                <span className="text-muted small text-uppercase fw-bold" style={{fontSize: "0.7rem"}}>Fecha de Nacimiento</span><br/>
                                <span className="fs-6 fw-medium text-dark">{paciente.fechaNacimiento || "No registrada"}</span>
                            </div>
                            <div className="col-md-3">
                                <span className="text-success small text-uppercase fw-bold" style={{fontSize: "0.7rem"}}>Fecha de Creación Ficha</span><br/>
                                <span className="fs-6 fw-bold text-success">
                                    <i className="bi bi-calendar-check me-2"></i>{fechaCreacion}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SECCIÓN: HISTORIAL DE CONSULTAS (ABAJO) --- */}
                <h5 className="fw-bold text-secondary mb-4 pb-2 border-bottom">
                    <i className="bi bi-clock-history me-2"></i>Historial de Consultas Realizadas
                </h5>

                {historialOrdenado.length > 0 ? (
                    <div className="timeline-wrapper">
                        {historialOrdenado.map((consulta: any, index: number) => (
                            <div key={index} className="d-flex mb-5 position-relative">

                                {/* Columna de Fecha Lateral */}
                                <div className="me-4 text-end" style={{ minWidth: '120px' }}>
                                    <div className="fw-bold text-dark fs-5">{consulta.fecha}</div>
                                    <div className="text-muted small">{consulta.hora}</div>
                                    <span className={`badge mt-1 ${consulta.estado === 'Finalizada' ? 'bg-success' : 'bg-warning'}`}>
                                        {consulta.estado || 'Finalizada'}
                                    </span>
                                </div>

                                {/* Línea de tiempo gráfica */}
                                <div className="position-absolute bg-secondary opacity-25" style={{ width: '2px', top: '15px', bottom: '-50px', left: '135px' }}></div>
                                <div className="rounded-circle bg-primary border border-4 border-white shadow-sm position-relative" style={{ width: '20px', height: '20px', left: '-5px', top: '5px', zIndex: 2 }}></div>

                                {/* Tarjeta de la Consulta */}
                                <div className="card border-0 shadow-sm flex-grow-1 ms-4">
                                    <div className="card-header bg-white border-bottom-0 pt-3 px-4 d-flex justify-content-between">
                                        <h6 className="fw-bold text-primary mb-1">Motivo: {consulta.motivo}</h6>
                                    </div>
                                    <div className="card-body px-4 pb-4 pt-2">
                                        <ul className="list-unstyled mb-0">
                                            <li className="mb-2">
                                                <strong className="text-dark small text-uppercase">Diagnóstico:</strong>
                                                <div className="ms-2">
                                                    {obtenerDiagnosticos(consulta).length > 0 ? (
                                                        obtenerDiagnosticos(consulta).map((d: any, i: number) => (
                                                            <span key={i} className="badge bg-secondary me-1">{d.descripcion} {d.cie10 ? `(${d.cie10})` : ''}</span>
                                                        ))
                                                    ) : <span className="text-muted small fst-italic">Sin diagnóstico CIE-10</span>}
                                                    <div className="small text-muted mt-1">{consulta.diagnostico?.impresion}</div>
                                                </div>
                                            </li>
                                            <li className="mb-2">
                                                <strong className="text-dark small text-uppercase">Tratamiento:</strong>
                                                <p className="ms-2 mb-0 small text-success fw-bold bg-success bg-opacity-10 p-2 rounded">
                                                    {consulta.planTratamiento?.receta || obtenerPlan(consulta)}
                                                </p>
                                            </li>
                                            <li>
                                                <strong className="text-dark small text-uppercase">Exámenes / Evolución:</strong>
                                                <p className="ms-2 mb-0 small text-muted">
                                                    {consulta.examenFisico?.evolucion || consulta.estudiosSolicitados || "Sin observaciones."}
                                                </p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-5 bg-white rounded shadow-sm">
                        <h4 className="text-muted">No hay historial registrado.</h4>
                        <p className="text-muted small">Este paciente aún no tiene consultas médicas realizadas.</p>
                        <button className="btn btn-primary mt-3" onClick={() => navigate(`/historial/${cedula}`)}>+ Crear Primera Consulta</button>
                    </div>
                )}
            </div>
        </div>
    );
}
