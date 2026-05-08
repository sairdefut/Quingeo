/// <reference types="react" />
import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { obtenerPacientes } from "../../services/dbPacienteService";
import type { Paciente } from "../../models/Paciente";

export default function ConsultaPacientes() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [pacienteConsultas, setPacienteConsultas] = useState<any | null>(null);

  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        const lista = await obtenerPacientes();
        setPacientes(Array.isArray(lista) ? lista : []);
      } catch (error) {
        console.error("Error cargando pacientes:", error);
      }
    };
    cargarPacientes();
  }, []);

  const pacientesFiltrados = pacientes.filter((p: Paciente) =>
    `${p.nombres} ${p.apellidos} ${p.cedula}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getAvatar = (sexo: string) => {
    const isMale = sexo?.toLowerCase() === 'masculino' || sexo?.toLowerCase() === 'm';
    return isMale ? "bi-person-standing" : "bi-person-standing-dress";
  };

  return (
    <div className="container-fluid p-0 bg-light min-vh-100">
      {/* Header con Buscador Integrado */}
      <div className="bg-white px-4 py-4 shadow-sm mb-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                <i className="bi bi-people-fill text-primary fs-4"></i>
              </div>
              <div>
                <h4 className="fw-bold m-0 text-dark">Gestión de Pacientes</h4>
                <p className="text-muted small m-0">Consulte, edite y cree nuevas historias clínicas</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 mt-3 mt-md-0">
            <div className="input-group shadow-sm rounded-pill overflow-hidden border">
              <span className="input-group-text bg-white border-0 ps-3">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text" 
                className="form-control border-0 py-2" 
                placeholder="Buscar por cédula o nombre..." 
                value={busqueda}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button className="btn bg-white border-0" onClick={() => setBusqueda("")}>
                  <i className="bi bi-x-circle text-muted"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-5">
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 text-muted small text-uppercase fw-bold" style={{ width: '150px' }}>Cédula</th>
                  <th className="py-3 text-muted small text-uppercase fw-bold">Paciente</th>
                  <th className="py-3 text-muted small text-uppercase fw-bold">Fecha Nacimiento</th>
                  <th className="py-3 text-muted small text-uppercase fw-bold">Estado Sync</th>
                  <th className="py-3 text-muted small text-uppercase fw-bold text-end px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.length > 0 ? (
                  pacientesFiltrados.map((p: Paciente) => (
                    <tr key={p.cedula} className="border-bottom transition-hover">
                      <td className="px-4">
                        <span className="badge bg-light text-dark border fw-bold px-2 py-1">
                          {p.cedula}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className={`rounded-circle p-2 me-3 d-flex align-items-center justify-content-center ${p.sexo?.toLowerCase() === 'm' || p.sexo?.toLowerCase() === 'masculino' ? 'bg-soft-primary' : 'bg-soft-danger'}`} style={{ width: '40px', height: '40px' }}>
                            <i className={`bi ${getAvatar(p.sexo)} fs-5 ${p.sexo?.toLowerCase() === 'm' || p.sexo?.toLowerCase() === 'masculino' ? 'text-vibrant-info' : 'text-vibrant-danger'}`}></i>
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{p.apellidos} {p.nombres}</div>
                            <div className="text-muted small">{p.sexo || 'No especificado'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted">{p.fechaNacimiento}</td>
                      <td>
                        {p.idPaciente ? (
                          <span className="text-success small d-flex align-items-center">
                            <i className="bi bi-cloud-check-fill me-1"></i> Sincronizado
                          </span>
                        ) : (
                          <span className="text-warning small d-flex align-items-center">
                            <i className="bi bi-cloud-arrow-up-fill me-1"></i> Pendiente
                          </span>
                        )}
                      </td>
                      <td className="text-end px-4">
                        <div className="btn-group shadow-sm rounded-3">
                          <button 
                            className="btn btn-white btn-sm border-end px-3 py-2" 
                            title="Nueva Consulta"
                            onClick={() => navigate(`/historial/${p.cedula}`)}
                          >
                            <i className="bi bi-plus-circle-fill text-primary"></i>
                          </button>
                          <button 
                            className="btn btn-white btn-sm border-end px-3 py-2" 
                            title="Ver Reporte Completo"
                            onClick={() => navigate(`/reporte-hce/${p.cedula}`)}
                          >
                            <i className="bi bi-file-earmark-medical-fill text-info"></i>
                          </button>
                          <button 
                            className="btn btn-white btn-sm px-3 py-2" 
                            title="Historial de Consultas"
                            onClick={() => setPacienteConsultas(p)}
                          >
                            <i className="bi bi-clock-history text-success"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-5 text-center">
                      <div className="py-4">
                        <i className="bi bi-search text-muted display-1 opacity-25"></i>
                        <h5 className="mt-3 text-muted">No se encontraron pacientes</h5>
                        <p className="text-muted small">Intente con otro número de cédula o nombre</p>
                        <button className="btn btn-primary rounded-pill mt-2" onClick={() => navigate('/pacientes/registro')}>
                          <i className="bi bi-person-plus me-2"></i>Registrar Nuevo
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DE CONSULTAS - REDISEÑADO */}
      {pacienteConsultas && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Historial: {pacienteConsultas.nombres}</h5>
                <button type="button" className="btn-close" onClick={() => setPacienteConsultas(null)}></button>
              </div>
              <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {pacienteConsultas.historiaClinica?.length > 0 ? (
                  pacienteConsultas.historiaClinica.slice().reverse().map((c: any, i: number) => (
                    <div key={i} className="card mb-3 border shadow-none rounded-3 hover-shadow transition-all">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <span className="badge bg-success bg-opacity-10 text-success mb-1">{c.fecha}</span>
                            <span className="text-muted small ms-2">{c.hora}</span>
                          </div>
                          <button 
                            className="btn btn-light btn-sm rounded-pill px-3" 
                            onClick={() => navigate(`/historial/${pacienteConsultas.cedula}`, { state: { consultaAEditar: c } })}
                          >
                            <i className="bi bi-pencil me-1"></i> Editar
                          </button>
                        </div>
                        <h6 className="fw-bold text-dark mb-1">{c.motivo || "Consulta General"}</h6>
                        <p className="mb-0 small text-muted text-truncate">
                          <strong>DX:</strong> {c.diagnostico?.principal?.descripcion || "Sin diagnóstico registrado"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                    <div className="text-center py-5">
                        <i className="bi bi-journal-x text-muted fs-1 opacity-25"></i>
                        <p className="mt-2 text-muted">Aún no hay consultas para este paciente</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .transition-hover:hover {
            background-color: #f8f9fa!important;
        }
        .transition-all {
            transition: all 0.2s ease;
        }
        .hover-shadow:hover {
            box-shadow: 0 .125rem .25rem rgba(0,0,0,.075)!important;
            border-color: #0d6efd!important;
        }
        .btn-white {
            background-color: white;
            border: 1px solid #dee2e6;
        }
        .btn-white:hover {
            background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
}
