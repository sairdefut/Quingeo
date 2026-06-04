import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost, clearStoredSession } from '../../services/apiClient';

export default function Login() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setCargando(true);
    clearStoredSession();

    try {
      setMensaje('Validando credenciales...');
      const data = await apiPost<any>('/auth/login', { username: usuario, password }, { skipUnauthorizedRedirect: true });
      localStorage.setItem('usuarioLogueado', JSON.stringify(data));
      if (data.token) {
        localStorage.setItem('hceAuthToken', data.token);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas o error de conexion');
      setMensaje('');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card p-4 shadow border-0" style={{ width: 400 }}>
        <div className="text-center mb-4">
          <h4 className="fw-bold text-primary mb-1">Sistema HCE</h4>
          <p className="text-muted small">Historia Clinica Electronica</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">Usuario</label>
            <input className="form-control" placeholder="Ej: jandry" value={usuario} onChange={(e) => setUsuario(e.target.value)} autoFocus />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">Contrasena</label>
            <input className="form-control" type="password" placeholder="***" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="alert alert-danger py-2 small text-center mb-3">{error}</div>}
          {mensaje && <div className="alert alert-info py-2 small text-center mb-3">{mensaje}</div>}
          <button className="btn btn-primary w-100 fw-bold py-2 shadow-sm" type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'INGRESAR'}
          </button>
        </form>
      </div>
    </div>
  );
}
