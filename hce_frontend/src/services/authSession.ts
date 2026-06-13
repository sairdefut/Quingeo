import { dbHelpers } from '../db/db';
import { notifyInfo, notifySessionExpired, notifyWarning } from './notificationService';

export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

type NavigateFn = (to: string, options?: { replace?: boolean }) => void;

export function clearStoredSession() {
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('hceAuthToken');
}

export function handleUnauthorized(message = 'Su sesion expiro. Inicie sesion nuevamente.') {
    clearStoredSession();
    notifySessionExpired(message);
}

export async function logout(navigate: NavigateFn) {
    const pendingItems = await dbHelpers.getBlockingLogoutItems();
    const hasConflicts = await dbHelpers.hasUnresolvedConflicts();

    if (pendingItems.length > 0 || hasConflicts) {
        notifyWarning('Tiene cambios pendientes. Sincronice antes de cerrar sesión.');
        return false;
    }

    let serverLogoutFailed = false;
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        serverLogoutFailed = !response.ok && response.status !== 401 && response.status !== 403;
    } catch {
        serverLogoutFailed = true;
    }

    clearStoredSession();
    await dbHelpers.clearAllLocalData();
    clearLegacyLocalData();

    if (serverLogoutFailed) {
        notifyWarning('No se pudo cerrar la sesión en el servidor, pero la sesión local fue cerrada.');
    } else {
        notifyInfo('Sesión cerrada.');
    }

    navigate('/', { replace: true });
    return true;
}

function clearLegacyLocalData() {
    localStorage.removeItem('hce_pacientes');
    localStorage.removeItem('logs');
}
