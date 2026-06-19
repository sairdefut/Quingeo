export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

type ApiOptions = RequestInit & {
    skipUnauthorizedRedirect?: boolean;
};

export class ApiError extends Error {
    status: number;
    body: unknown;

    constructor(status: number, message: string, body?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }
}

export function clearStoredSession() {
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('hceAuthToken');
}

export function handleUnauthorized(message = 'Su sesion expiro. Inicie sesion nuevamente.') {
    clearStoredSession();
    window.alert(message);
    window.location.replace('/');
}

async function readResponseBody(response: Response) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}

function getErrorMessage(body: unknown, fallback: string) {
    if (typeof body === 'string' && body.trim()) return body;
    if (body && typeof body === 'object') {
        const record = body as Record<string, unknown>;
        return String(record.error || record.message || fallback);
    }
    return fallback;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
    const headers = new Headers(options.headers);
    const hasBody = options.body !== undefined && options.body !== null;

    if (hasBody && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    const token = localStorage.getItem('hceAuthToken');
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers
    });

    if (response.status === 401) {
        if (!options.skipUnauthorizedRedirect) {
            handleUnauthorized();
        }
        throw new ApiError(response.status, 'Sesion expirada o sin permisos');
    }

    if (response.status === 403) {
        const body = await readResponseBody(response);
        throw new ApiError(response.status, getErrorMessage(body, 'No tiene permisos para realizar esta accion'), body);
    }

    if (!response.ok) {
        const body = await readResponseBody(response);
        throw new ApiError(response.status, getErrorMessage(body, response.statusText), body);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return readResponseBody(response) as Promise<T>;
}

export function apiGet<T>(path: string, options?: ApiOptions) {
    return apiRequest<T>(path, { ...options, method: 'GET' });
}

export function apiPost<T>(path: string, body?: unknown, options?: ApiOptions) {
    return apiRequest<T>(path, {
        ...options,
        method: 'POST',
        body: body === undefined ? undefined : JSON.stringify(body)
    });
}

export function apiPut<T>(path: string, body?: unknown, options?: ApiOptions) {
    return apiRequest<T>(path, {
        ...options,
        method: 'PUT',
        body: body === undefined ? undefined : JSON.stringify(body)
    });
}
