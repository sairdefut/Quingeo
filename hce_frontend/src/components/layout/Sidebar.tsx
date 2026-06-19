import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutDashboard, History, UserPlus, Search, FileText, Menu, X, Users, LogOut, UserRound, LibraryBig } from "lucide-react";
import { logout } from "../../services/authSession";
import { syncService } from "../../services/syncService";
import "./Sidebar.css";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sessionVersion, setSessionVersion] = useState(0);
  const [online, setOnline] = useState(() => navigator.onLine);
  const navigate = useNavigate();
  const userStr = localStorage.getItem('usuarioLogueado');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user && user.cargo === 'admin';
  const fullName = user?.nombres && user?.apellidos
    ? `${user.nombres} ${user.apellidos}`
    : user?.nombre || user?.username || 'Usuario';
  const role = user?.cargo || 'medico';

  useEffect(() => {
    const refreshUser = () => setSessionVersion(value => value + 1);
    window.addEventListener('hce-profile-updated', refreshUser);
    return () => window.removeEventListener('hce-profile-updated', refreshUser);
  }, []);

  useEffect(() => syncService.subscribe(status => setOnline(status.online)), []);

  void sessionVersion;

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await syncService.prepareForLogout();
      const loggedOut = await logout(navigate);
      if (!loggedOut) {
        syncService.resumeAfterLogin();
      }
    } finally {
      setLoggingOut(false);
    }
  };

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

          {online ? (
            <NavLink to="/perfil" className="nav-item">
              <UserRound size={18} /> Mi Perfil
            </NavLink>
          ) : (
            <span className="nav-item nav-item-disabled" title="Disponible únicamente con conexión">
              <UserRound size={18} /> Mi Perfil
            </span>
          )}

          {isAdmin && (
            <>
              <NavLink to="/admin/usuarios" className="nav-item">
                <Users size={18} /> Gestión de Usuarios
              </NavLink>
              {online ? (
                <NavLink to="/admin/catalogos" className="nav-item">
                  <LibraryBig size={18} /> Configuración de catálogos
                </NavLink>
              ) : (
                <span className="nav-item nav-item-disabled" title="Disponible únicamente con conexión">
                  <LibraryBig size={18} /> Configuración de catálogos
                </span>
              )}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-meta">
              <strong>{fullName}</strong>
              <span>{role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} disabled={loggingOut}>
            <LogOut size={18} />
            {loggingOut ? 'Cerrando...' : 'Cerrar sesión'}
          </button>
        </div>
      </aside>
    </>
  );
}
