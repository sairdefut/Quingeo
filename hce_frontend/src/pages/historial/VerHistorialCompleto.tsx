import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    obtenerPacienteConConsultasLocal,
    refrescarPacienteConConsultasDesdeServidor
} from '../../services/dbPacienteService';

export default function VerHistorialCompleto() {
    const { cedula } = useParams();
    const navigate = useNavigate();
    const [paciente, setPaciente] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let activo = true;
        let fallbackTimer: number | undefined;

        const cargarDatosLocales = async () => {
            if (!cedula) return;
            try {
                const encontrado = await obtenerPacienteConConsultasLocal(cedula);
                if (activo) setPaciente(encontrado || null);
                return Boolean(encontrado);
            } catch (error) {
                console.error('Error cargando datos:', error);
                return false;
            }
        };

        const cargarDatos = async () => {
            if (!cedula) return;
            const tieneLocal = await cargarDatosLocales();
            if (!activo) return;

            if (tieneLocal) {
                setLoading(false);
            } else {
                fallbackTimer = window.setTimeout(() => {
                    if (activo) setLoading(false);
                }, 1500);
            }

            refrescarPacienteConConsultasDesdeServidor(cedula)
                .then(encontrado => {
                    if (!activo) return;
                    setPaciente(encontrado || null);
                    setLoading(false);
                })
                .catch(error => {
                    console.warn('[VerHistorialCompleto] no se pudo refrescar historial:', error);
                    if (activo) setLoading(false);
                });
        };

        cargarDatos();

        let debounceTimer: number | undefined;
        const refreshHistorial = () => {
            if (debounceTimer) window.clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(() => {
                cargarDatosLocales().catch(console.error);
            }, 300);
        };
        window.addEventListener('hce-sync-complete', refreshHistorial);
        return () => {
            activo = false;
            if (fallbackTimer) window.clearTimeout(fallbackTimer);
            if (debounceTimer) window.clearTimeout(debounceTimer);
            window.removeEventListener('hce-sync-complete', refreshHistorial);
        };
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
        if (!edad) return 'No registrada';
        if (typeof edad === 'object') {
            return `${edad.años || 0} años, ${edad.meses || 0} meses`;
        }
        return edad;
    };

    const historialOrdenado = paciente.historiaClinica ? [...paciente.historiaClinica].reverse() : [];

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
        return [planFarmacologico, planNoFarmacologico].filter(Boolean).join(' | ') || 'No registrado';
    };

    const badgeSync = (consulta: any) => {
        if (consulta.syncStatus === 'conflict') return <span className="badge bg-warning text-dark mt-1">Conflicto</span>;
        if (consulta.syncStatus === 'failed') return <span className="badge bg-danger mt-1">Fallida</span>;
        if (consulta.syncStatus === 'pending' || consulta.syncStatus === 'syncing') return <span className="badge bg-primary mt-1">Pendiente</span>;
        return null;
    };

    const fechaCreacion = paciente.fechaCreacion || new Date().toLocaleDateString();

    const numHistoria = paciente.numeroHistoriaClinica || 'Pendiente';

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <div className="bg-white text-dark border-end shadow-sm p-4 d-flex flex-column" style={{ width: '300px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
                <button className="btn btn-outline-dark btn-sm mb-4 align-self-start" onClick={() => navigate('/historial-clinico')}>
                    <i className="bi bi-arrow-left me-2"></i> Volver
                </button>

                <div className="text-center mb-4">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold shadow border border-3 border-white" style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                        {(paciente.nombres || '?').charAt(0)}{(paciente.apellidos || '?').charAt(0)}
                    </div>
                    <h5 className="fw-bold m-0 text-dark">{paciente.nombres || 'Sin nombre'}</h5>
                    <h5 className="fw-normal text-secondary m-0">{paciente.apellidos || 'Sin apellido'}</h5>
                    <div className="mt-2">
                        <span className="badge bg-danger rounded-pill px-3 me-2 shadow-sm" title="Número de Historia Clínica">HC: {numHistoria}</span>
                        <span className="badge bg-primary rounded-pill px-3 shadow-sm" title="Cédula de Identidad">C.I: {paciente.cedula}</span>
                    </div>
                </div>

                <div className="v-stack gap-3">
                    <div className="bg-light border p-3 rounded">
                        <small className="text-uppercase text-secondary d-block mb-1" style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Edad</small>
                        <span className="fw-bold">{formatearEdad(paciente.edad)}</span>
                    </div>
                    <div className="bg-light border p-3 rounded">
                        <small className="text-uppercase text-secondary d-block mb-1" style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Sexo / Sangre</small>
                        <span className="fw-bold">{paciente.sexo} | {paciente.tipoSangre}</span>
                    </div>
                    <div className="bg-light border p-3 rounded">
                        <small className="text-uppercase text-secondary d-block mb-1" style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Ubicación</small>
                        <span className="fw-bold small">{paciente.canton}, {paciente.provincia}</span>
                    </div>
                </div>
            </div>

            <div className="flex-grow-1 p-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold text-dark m-0">Expediente Clínico</h3>
                    <button className="btn btn-light border shadow-sm" onClick={() => window.print()}>
                        <i className="bi bi-printer me-2"></i> Imprimir Historial
                    </button>
                </div>

                <div className="card border-0 shadow-sm mb-5 overflow-hidden">
                    <div className="card-header bg-primary text-white py-3">
                        <h6 className="m-0 fw-bold"><i className="bi bi-person-lines-fill me-2"></i>Datos de Filiación y Registro</h6>
                    </div>
                    <div className="card-body bg-white p-4">
                        <div className="row g-3">
                            <div className="col-md-auto pe-4 border-end">
                                <label className="text-muted small text-uppercase fw-bold">Nº Historia</label>
                                <div className="fs-5 fw-bold text-danger">{numHistoria}</div>
                            </div>
                            <div className="col-md">
                                <label className="text-muted small text-uppercase fw-bold">Nombre Completo</label>
                                <div className="fs-5 fw-bold text-dark">{paciente.nombres || 'Sin nombre'} {paciente.apellidos || 'Sin apellido'}</div>
                            </div>
                            <div className="col-md">
                                <label className="text-muted small text-uppercase fw-bold">Cédula</label>
                                <div className="fs-5 text-dark">{paciente.cedula}</div>
                            </div>
                            <div className="col-md">
                                <label className="text-muted small text-uppercase fw-bold">Nacimiento</label>
                                <div className="fs-5 text-dark">{paciente.fechaNacimiento || 'No registrada'}</div>
                            </div>
                            <div className="col-md">
                                <label className="text-success small text-uppercase fw-bold">Creación Ficha</label>
                                <div className="fs-5 fw-bold text-success">
                                    <i className="bi bi-calendar-check me-2"></i>{fechaCreacion}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <h5 className="fw-bold text-secondary mb-4 pb-2 border-bottom">
                    <i className="bi bi-clock-history me-2"></i>Historial de Consultas Realizadas
                </h5>

                {historialOrdenado.length > 0 ? (
                    <div className="timeline-wrapper">
                        {historialOrdenado.map((consulta: any, index: number) => (
                            <div key={index} className="d-flex mb-5 position-relative">
                                <div className="me-4 text-end" style={{ minWidth: '120px' }}>
                                    <div className="fw-bold text-dark fs-5">{consulta.fecha}</div>
                                    <div className="text-muted small">{consulta.hora}</div>
                                    <span className={`badge mt-1 ${consulta.estado === 'Finalizada' ? 'bg-success' : 'bg-warning'}`}>
                                        {consulta.estado || 'Finalizada'}
                                    </span>
                                    <div>{badgeSync(consulta)}</div>
                                </div>

                                <div className="position-absolute bg-secondary opacity-25" style={{ width: '2px', top: '15px', bottom: '-50px', left: '135px' }}></div>
                                <div className="rounded-circle bg-primary border border-4 border-white shadow-sm position-relative" style={{ width: '20px', height: '20px', left: '-5px', top: '5px', zIndex: 2 }}></div>

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
                                                    {consulta.examenFisico?.evolucion || consulta.estudiosSolicitados || 'Sin observaciones.'}
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
