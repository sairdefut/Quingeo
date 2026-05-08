/// <reference types="react" />
import { useEffect, useState } from 'react';

import { db } from '../../db/db';
import type { Paciente } from '../../models/Paciente';

export default function Dashboard() {
  const [nombreUsuario, setNombreUsuario] = useState('Cargando...');
  const [inicial, setInicial] = useState('U');
  const [stats, setStats] = useState({
    totalPacientes: 0,
    consultasHoy: 0,
    alertasClinicas: 0
  });

  useEffect(() => {
    // 1. Cargar datos del usuario
    const storedUser = localStorage.getItem('usuarioLogueado');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const nombreCompleto = userData.nombres && userData.apellidos 
        ? `${userData.nombres} ${userData.apellidos}` 
        : (userData.nombre || "Usuario");
      
      setNombreUsuario(nombreCompleto);
      
      // Inicial: Primera letra del nombre real
      const primeraLetra = nombreCompleto.charAt(0).toUpperCase() || "U";
      setInicial(primeraLetra);
    }

    // 2. Cargar métricas dinámicas desde IndexedDB
    const cargarMetricas = async () => {
      try {
        const todosPacientes = await db.pacientes.toArray();
        const hoy = new Date().toLocaleDateString();

        let countConsultasHoy = 0;
        let countAlertas = 0;

        todosPacientes.forEach((p: Paciente) => {
          // Contar consultas de hoy
          if (p.historiaClinica && Array.isArray(p.historiaClinica)) {
            const hoyConsultas = p.historiaClinica.filter((c: any) => c.fecha === hoy);
            countConsultasHoy += hoyConsultas.length;
          }

          // Contar alertas (alergias o condiciones críticas)
          // Asumimos que si tiene alergias.tiene === true, es una alerta
          if (p.antecedentes?.personales?.alergias?.tiene) {
            countAlertas++;
          }
        });

        setStats({
          totalPacientes: todosPacientes.length,
          consultasHoy: countConsultasHoy,
          alertasClinicas: countAlertas
        });
      } catch (error) {
        console.error("Error al cargar métricas del dashboard:", error);
      }
    };

    cargarMetricas();
  }, []);

  return (
    <div className="container-fluid p-0 bg-light" style={{ minHeight: "100vh" }}>
      {/* --- ENCABEZADO --- */}
      <div className="d-flex justify-content-between align-items-center px-4 py-4 bg-white shadow-sm mb-4">
        <div className="d-flex align-items-center">
          <div className="bg-soft-primary p-2 rounded-3 me-3">
            <i className="bi bi-grid-1x2-fill text-vibrant-primary fs-4"></i>
          </div>
          <div>
            <h4 className="text-dark fw-bold m-0">Panel de Control</h4>
            <small className="text-muted">Resumen general de la gestión clínica</small>
          </div>
        </div>

        <div className="d-flex align-items-center border rounded-pill p-1 bg-white shadow-sm" style={{ minWidth: "220px" }}>
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2 shadow-sm" style={{ width: "45px", height: "45px", fontWeight: "bold", fontSize: "1.2rem" }}>
            {inicial}
          </div>
          <div className="pe-3">
            <div className="text-muted" style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>Profesional</div>
            <div className="text-dark fw-bold" style={{ fontSize: "14px" }}>{nombreUsuario}</div>
          </div>
        </div>
      </div>

      {/* --- TARJETAS DE MÉTRICAS --- */}
      <div className="px-4">
        <div className="row g-4">
          
          {/* Total Pacientes */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 transition-hover">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="bg-soft-primary p-3 rounded-circle">
                    <i className="bi bi-people-fill text-vibrant-primary fs-2"></i>
                  </div>
                  <span className="badge bg-soft-primary text-primary rounded-pill px-3">Total</span>
                </div>
                <h6 className="text-muted fw-bold small text-uppercase mb-1">Pacientes Registrados</h6>
                <h2 className="display-5 fw-bold text-dark mb-0">{stats.totalPacientes}</h2>
              </div>
              <div className="bg-primary py-1 opacity-75"></div>
            </div>
          </div>

          {/* Consultas Hoy */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 transition-hover">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="bg-soft-success p-3 rounded-circle">
                    <i className="bi bi-calendar2-check-fill text-vibrant-success fs-2"></i>
                  </div>
                  <span className="badge bg-soft-success text-success rounded-pill px-3">Hoy</span>
                </div>
                <h6 className="text-muted fw-bold small text-uppercase mb-1">Consultas Realizadas</h6>
                <h2 className="display-5 fw-bold text-dark mb-0">{stats.consultasHoy}</h2>
              </div>
              <div className="bg-success py-1 opacity-75"></div>
            </div>
          </div>

          {/* Alertas */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 transition-hover">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="bg-soft-danger p-3 rounded-circle">
                    <i className="bi bi-exclamation-triangle-fill text-vibrant-danger fs-2"></i>
                  </div>
                  <span className="badge bg-soft-danger text-danger rounded-pill px-3">Crítico</span>
                </div>
                <h6 className="text-muted fw-bold small text-uppercase mb-1">Pacientes con Alergias</h6>
                <h2 className="display-5 fw-bold text-dark mb-0">{stats.alertasClinicas}</h2>
              </div>
              <div className="bg-danger py-1 opacity-75"></div>
            </div>
          </div>

        </div>

        {/* --- SECCIÓN ADICIONAL: ACCESO RÁPIDO --- */}
        <div className="mt-5">
            <h5 className="fw-bold mb-4">Acciones Frecuentes</h5>
            <div className="row g-3">
                <div className="col-md-6 col-lg-3">
                    <a href="/pacientes/registro" className="text-decoration-none">
                        <div className="card border-0 shadow-sm p-3 text-center rounded-4 bg-white h-100 card-action">
                            <i className="bi bi-person-plus text-primary fs-3 mb-2"></i>
                            <div className="fw-bold text-dark">Nuevo Paciente</div>
                        </div>
                    </a>
                </div>
                <div className="col-md-6 col-lg-3">
                    <a href="/pacientes/consulta" className="text-decoration-none">
                        <div className="card border-0 shadow-sm p-3 text-center rounded-4 bg-white h-100 card-action">
                            <i className="bi bi-search text-success fs-3 mb-2"></i>
                            <div className="fw-bold text-dark">Buscar Paciente</div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
      </div>
      
      <style>{`
        .transition-hover:hover {
            transform: translateY(-5px);
            transition: all 0.3s ease;
            box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
        }
        .card-action:hover {
            background-color: #f8f9fa!important;
            border: 1px solid #0d6efd!important;
        }
      `}</style>
    </div>
  );
}
