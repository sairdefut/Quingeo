import { useState, useEffect } from 'react';

interface Usuario {
  idPersonal: number;
  username: string;
  nombres: string;
  apellidos: string;
  cargo: string;
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  const [nuevoUsuario, setNuevoUsuario] = useState({
    username: '',
    password: '',
    nombres: '',
    apellidos: '',
    cargo: 'medico'
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

  const cargarUsuarios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/usuarios`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar usuarios');
      const data = await response.json();
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/usuarios`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoUsuario)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear usuario');
      }

      alert('Usuario creado con éxito');
      setNuevoUsuario({ username: '', password: '', nombres: '', apellidos: '', cargo: 'medico' });
      cargarUsuarios();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">Gestión de Usuarios</h2>
        <button className="btn btn-outline-primary btn-sm" onClick={cargarUsuarios}>
          Actualizar Lista
        </button>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-4 mb-4">
            <h5 className="fw-bold mb-3">Nuevo Usuario</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Usuario</label>
                <input type="text" className="form-control" value={nuevoUsuario.username} onChange={e => setNuevoUsuario({...nuevoUsuario, username: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Contraseña</label>
                <input type="password" className="form-control" value={nuevoUsuario.password} onChange={e => setNuevoUsuario({...nuevoUsuario, password: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Nombres</label>
                <input type="text" className="form-control" value={nuevoUsuario.nombres} onChange={e => setNuevoUsuario({...nuevoUsuario, nombres: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Apellidos</label>
                <input type="text" className="form-control" value={nuevoUsuario.apellidos} onChange={e => setNuevoUsuario({...nuevoUsuario, apellidos: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Cargo</label>
                <select className="form-select" value={nuevoUsuario.cargo} onChange={e => setNuevoUsuario({...nuevoUsuario, cargo: e.target.value})}>
                  <option value="admin">Administrador</option>
                  <option value="medico">Médico</option>
                  <option value="posgradista">Posgradista</option>
                </select>
              </div>
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              <button type="submit" className="btn btn-primary w-100 fw-bold">CREAR USUARIO</button>
            </form>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 small fw-bold">Usuario</th>
                    <th className="py-3 small fw-bold">Nombre Completo</th>
                    <th className="py-3 small fw-bold">Cargo</th>
                    <th className="py-3 small fw-bold">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    <tr><td colSpan={4} className="text-center py-4">Cargando...</td></tr>
                  ) : usuarios.map(u => (
                    <tr key={u.idPersonal}>
                      <td className="px-4 py-3 fw-bold">{u.username}</td>
                      <td className="py-3">{u.nombres} {u.apellidos}</td>
                      <td className="py-3 text-capitalize"><span className={`badge ${u.cargo === 'admin' ? 'bg-danger' : 'bg-success'}`}>{u.cargo}</span></td>
                      <td className="py-3 text-muted">{u.idPersonal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
