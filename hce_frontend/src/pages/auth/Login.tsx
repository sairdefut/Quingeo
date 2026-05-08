import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { syncService } from '../../services/syncService';

export default function Login() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajeSincronizacion, setMensajeSincronizacion] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    setMensajeSincronizacion('');

    try {
      // PASO 1: Autenticación Real
      setMensajeSincronizacion('Validando credenciales...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usuario, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Credenciales incorrectas');
      }

      const data = await response.json();

      // Guardamos en el navegador para que las otras pantallas lo lean
      localStorage.setItem('usuarioLogueado', JSON.stringify(data));
      localStorage.setItem('token', data.token);

      // PASO 2: Sincronización automática de datos
      if (navigator.onLine) {
        try {
          setMensajeSincronizacion('Descargando datos del servidor...');
          await syncService.syncDown();
          setMensajeSincronizacion('¡Datos sincronizados! Redirigiendo...');
        } catch (syncError) {
          console.warn('[Login] Error en sincronización inicial:', syncError);
          setMensajeSincronizacion('Advertencia: No se pudieron descargar los datos, pero puede trabajar offline');
          // No bloqueamos el login si falla la sincronización
        }
      } else {
        setMensajeSincronizacion('Sin conexión - Trabajará en modo offline');
      }

      // Pequeño delay para que el usuario vea el mensaje de éxito
      await new Promise(resolve => setTimeout(resolve, 500));

      navigate('/dashboard');

    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card p-4 shadow border-0" style={{ width: 400 }}>
        <div className="text-center mb-4">
          <h4 className="fw-bold text-primary mb-1">Sistema HCE</h4>
          <p className="text-muted small">Historia Clínica Electrónica</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">Usuario</label>
            <input className="form-control" placeholder="Ej: jandry" value={usuario} onChange={(e) => setUsuario(e.target.value)} autoFocus />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-bold text-secondary">Contraseña</label>
            <input className="form-control" type="password" placeholder="***" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="alert alert-danger py-2 small text-center mb-3">{error}</div>}
          <button className="btn btn-primary w-100 fw-bold py-2 shadow-sm" type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "INGRESAR"}
          </button>
        </form>
      </div>
    </div>
  );
}