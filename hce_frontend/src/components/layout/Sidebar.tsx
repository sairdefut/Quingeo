import { NavLink } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, History, UserPlus, Search, FileText, Menu, X, Users } from "lucide-react";
import "./Sidebar.css";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const userStr = localStorage.getItem('usuarioLogueado');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user && user.cargo === 'admin';

  return (
    <>
      {/* BOTÓN MÓVIL */}
      <button className="menu-toggle" onClick={() => setOpen(true)}>
        <Menu size={22} />
      </button>

      {/* OVERLAY */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>HCE</h2>
          <p>Menú Clínico</p>
          <button className="close-btn" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav>
          <NavLink to="/dashboard" className="nav-item">
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>

          <NavLink to="/historial-usuarios" className="nav-item">
            <History size={18} /> Historial de Actividad
          </NavLink>

          <NavLink to="/pacientes/registro" className="nav-item">
            <UserPlus size={18} /> Registrar Paciente
          </NavLink>

          <NavLink to="/pacientes/consulta" className="nav-item">
            <Search size={18} /> Consultar Pacientes
          </NavLink>

          <NavLink to="/historial-clinico" className="nav-item">
            <FileText size={18} /> Historial Clínico
          </NavLink>

          {isAdmin && (
            <NavLink to="/admin/usuarios" className="nav-item">
              <Users size={18} /> Gestión de Usuarios
            </NavLink>
          )}
        </nav>
      </aside>
    </>
  );
}
