import { BrowserRouter, Navigate, Routes, Route, useParams } from 'react-router-dom';
import Login from '../pages/auth/Login';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/dashboard/Dashboard';
import RegistroPaciente from '../pages/pacientes/RegistroPaciente';
import ConsultaPacientes from '../pages/pacientes/ConsultaPacientes';
import ActualizarPaciente from '../pages/pacientes/ActualizarPaciente';
import HistorialConsultas from '../pages/historial/historialConsultasCorre';
import HistorialIndex from '../pages/historial/HistorialIndex';
import VerHistorialCompleto from '../pages/historial/VerHistorialCompleto';
import HistorialUsuarios from '../pages/dashboard/HistorialUsuarios';
import AdminUsuarios from '../pages/admin/AdminUsuarios';
import AdminCatalogos from '../pages/admin/AdminCatalogos';
import AdminRoute from './AdminRoute';
import OnlineRoute from './OnlineRoute';
import PerfilUsuario from '../pages/perfil/PerfilUsuario';
import { ReporteCompletoHCE } from '../pages/historial/components/ReporteCompletoHCE';
import {
  obtenerPacienteConConsultasLocal,
  obtenerPacienteSnapshot,
  refrescarPacienteConConsultasDesdeServidor
} from '../services/dbPacienteService';
import { useState, useEffect } from 'react';

// Wrapper para cargar paciente por cédula para el reporte
const ReporteHCEWrapper = () => {
  const { cedula } = useParams();
  const [paciente, setPaciente] = useState<any>(() => cedula ? obtenerPacienteSnapshot(cedula) : null);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      if (!cedula) {
        setPaciente(null);
        return;
      }

      const snapshot = obtenerPacienteSnapshot(cedula);
      if (snapshot) setPaciente(snapshot);

      const local = await obtenerPacienteConConsultasLocal(cedula);
      if (activo) setPaciente(local || null);

      refrescarPacienteConConsultasDesdeServidor(cedula)
        .then(encontrado => {
          if (activo) setPaciente(encontrado || null);
        })
        .catch(error => console.warn('[ReporteHCEWrapper] no se pudo refrescar reporte:', error));
    };
    cargar();

    let debounceTimer: number | undefined;
    const refreshReporteLocal = (event: Event) => {
      const entities = (event as CustomEvent<{ entities?: string[] }>).detail?.entities || [];
      if (entities.length > 0 && !entities.includes('pacientes') && !entities.includes('consultas')) return;
      if (debounceTimer) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        if (!cedula) return;
        obtenerPacienteConConsultasLocal(cedula)
          .then(encontrado => {
            if (activo) setPaciente(encontrado || null);
          })
          .catch(console.error);
      }, 300);
    };
    window.addEventListener('hce-local-data-updated', refreshReporteLocal);

    return () => {
      activo = false;
      if (debounceTimer) window.clearTimeout(debounceTimer);
      window.removeEventListener('hce-local-data-updated', refreshReporteLocal);
    };
  }, [cedula]);

  return <ReporteCompletoHCE paciente={paciente} />;
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pacientes/registro" element={<RegistroPaciente />} />
          <Route path="/pacientes/consulta" element={<ConsultaPacientes />} />
          <Route path="/pacientes/actualizar" element={<ActualizarPaciente />} />

          {/* Gestión de Historial */}
          <Route path="/historial/:cedula" element={<HistorialConsultas />} />
          {/* Gestión de Historial - Index (Busqueda) y Detalle */}
          <Route path="/historial-clinico" element={<HistorialIndex />} />
          <Route path="/historial-completo/:cedula" element={<VerHistorialCompleto />} />

          {/* ✅ VISTA PREVIA REPORTE HCE (SOLO LECTURA) */}
          <Route path="/reporte-hce/:cedula" element={<ReporteHCEWrapper />} />

          <Route path="/historial-usuarios" element={<HistorialUsuarios />} />
          <Route path="/perfil" element={<OnlineRoute><PerfilUsuario /></OnlineRoute>} />
          <Route path="/admin/usuarios" element={<AdminRoute><AdminUsuarios /></AdminRoute>} />
          <Route path="/admin/catalogos" element={<AdminRoute><OnlineRoute><AdminCatalogos /></OnlineRoute></AdminRoute>} />
          <Route path="/admin/cie10" element={<AdminRoute><OnlineRoute><Navigate to="/admin/catalogos" replace /></OnlineRoute></AdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
