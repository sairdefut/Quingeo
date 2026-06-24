import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    obtenerPacientesLocales,
    obtenerTodasConsultasLocales,
    refrescarPacientesDesdeServidor,
    refrescarTodasConsultasDesdeServidor
} from '../../services/dbPacienteService';

function agruparConsultasPorPaciente(consultas: any[]) {
    const porIdPaciente = new Map<number, any[]>();
    const porCedula = new Map<string, any[]>();

    consultas.forEach((consulta) => {
        if (consulta?.idPaciente) {
            const actuales = porIdPaciente.get(consulta.idPaciente) || [];
            porIdPaciente.set(consulta.idPaciente, [...actuales, consulta]);
            return;
        }

        if (consulta?.cedula) {
            const actuales = porCedula.get(consulta.cedula) || [];
            porCedula.set(consulta.cedula, [...actuales, consulta]);
        }
    });

    return { porIdPaciente, porCedula };
}

function obtenerConsultasDelPaciente(
    paciente: any,
    grupos: ReturnType<typeof agruparConsultasPorPaciente>
) {
    const porId = paciente.idPaciente ? grupos.porIdPaciente.get(paciente.idPaciente) || [] : [];
    const porCedula = paciente.cedula ? grupos.porCedula.get(paciente.cedula) || [] : [];
    const vistas = new Set(porId.map((consulta) => consulta.uuidOffline || consulta.idConsulta || consulta.id));

    return [
        ...porId,
        ...porCedula.filter((consulta) => {
            const clave = consulta.uuidOffline || consulta.idConsulta || consulta.id;
            return !clave || !vistas.has(clave);
        })
    ];
}

function resumenEstadoConsultas(consultas: any[]) {
    if (consultas.some((consulta) => consulta.syncStatus === 'conflict')) return 'Conflicto de sincronizacion';
    if (consultas.some((consulta) => consulta.syncStatus === 'failed')) return 'Sincronizacion fallida';
    if (consultas.some((consulta) => consulta.syncStatus === 'pending' || consulta.syncStatus === 'syncing')) return 'Pendiente de sincronizar';
    return '';
}

export default function HistorialIndex() {
    const navigate = useNavigate();
    const [pacientes, setPacientes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    const cargarDatosLocales = async () => {
        try {
            const [lista, consultas] = await Promise.all([
                obtenerPacientesLocales(),
                obtenerTodasConsultasLocales()
            ]);
            const pacientesLista = Array.isArray(lista) ? lista : [];
            const consultasLista = Array.isArray(consultas) ? consultas : [];
            const gruposConsultas = agruparConsultasPorPaciente(consultasLista);

            setPacientes(pacientesLista.map((paciente) => ({
                ...paciente,
                historiaClinica: obtenerConsultasDelPaciente(paciente, gruposConsultas)
            })));
            return pacientesLista.length;
        } catch (error) {
            console.error("Error cargando pacientes:", error);
            return 0;
        }
    };

    const refrescarDatosEnSegundoPlano = async () => {
        await Promise.all([
            refrescarPacientesDesdeServidor(),
            refrescarTodasConsultasDesdeServidor()
        ]);
        await cargarDatosLocales();
    };

    useEffect(() => {
        let activo = true;
        let fallbackTimer: number | undefined;

        const cargar = async () => {
            const totalLocales = await cargarDatosLocales();
            if (!activo) return;

            if (totalLocales > 0) {
                setLoading(false);
            } else {
                fallbackTimer = window.setTimeout(() => {
                    if (activo) setLoading(false);
                }, 1500);
            }

            refrescarDatosEnSegundoPlano()
                .then(() => {
                    if (activo) setLoading(false);
                })
                .catch(error => {
                    console.warn('[HistorialIndex] no se pudo refrescar historiales:', error);
                    if (activo) setLoading(false);
                });
        };

        cargar();
        return () => {
            activo = false;
            if (fallbackTimer) window.clearTimeout(fallbackTimer);
        };
    }, []);

    useEffect(() => {
        let debounceTimer: number | undefined;
        const refreshHistoriales = (event: Event) => {
            const entities = (event as CustomEvent<{ entities?: string[] }>).detail?.entities || [];
            if (entities.length > 0 && !entities.includes('pacientes') && !entities.includes('consultas')) return;
            if (debounceTimer) window.clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(() => {
                cargarDatosLocales().catch(console.error);
            }, 300);
        };
        window.addEventListener('hce-local-data-updated', refreshHistoriales);
        return () => {
            if (debounceTimer) window.clearTimeout(debounceTimer);
            window.removeEventListener('hce-local-data-updated', refreshHistoriales);
        };
    }, []);

    const filtrados = pacientes.filter(p =>
        `${p.nombres} ${p.apellidos} ${p.cedula}`.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-5 bg-light min-vh-100">
            <h3 className="fw-bold text-primary mb-4"><i className="bi bi-folder2-open me-2"></i>Historiales Clínicos</h3>

            <div className="bg-white p-4 rounded shadow-sm mb-4">
                <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Buscar paciente por nombre o cédula..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            <div className="row g-3">
                {filtrados.length > 0 ? filtrados.map(p => (
                    <div key={p.cedula} className="col-md-6 col-lg-4">
                        <div className="card shadow-sm border-0 h-100 hover-shadow" style={{ transition: '0.3s' }}>
                            <div className="card-body d-flex align-items-center">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}>
                                    {(p.nombres || '?').charAt(0)}{(p.apellidos || '?').charAt(0)}
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="fw-bold mb-0 text-dark">{p.apellidos || 'Sin apellido'} {p.nombres || 'Sin nombre'}</h6>
                                    <small className="text-muted d-block">C.I: {p.cedula}</small>
                                    <small className="text-success fw-bold" style={{ fontSize: '0.8rem' }}>
                                        {p.historiaClinica?.length || 0} Consultas registradas
                                    </small>
                                    {resumenEstadoConsultas(p.historiaClinica || []) && (
                                        <small className="text-warning fw-bold d-block" style={{ fontSize: '0.75rem' }}>
                                            {resumenEstadoConsultas(p.historiaClinica || [])}
                                        </small>
                                    )}
                                </div>
                                <button className="btn btn-outline-primary btn-sm ms-2" onClick={() => navigate(`/historial-completo/${p.cedula}`)}>
                                    <i className="bi bi-eye-fill"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-12 text-center py-5 text-muted">
                        <i className="bi bi-search display-4 mb-3 d-block opacity-50"></i>
                        No se encontraron pacientes.
                    </div>
                )}
            </div>
        </div>
    );
}
