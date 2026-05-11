export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

export function clearStoredSession() {
    localStorage.removeItem('usuarioLogueado');
}

export function handleUnauthorized(message = 'Su sesion expiro. Inicie sesion nuevamente.') {
    clearStoredSession();
    window.alert(message);
    window.location.replace('/');
}
