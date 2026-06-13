import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

const DEFAULT_DURATIONS: Record<NotificationType, number> = {
    info: 3500,
    success: 3000,
    warning: 4000,
    error: 5000
};

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

export function notify(message: string, type: NotificationType = 'info', duration?: number) {
    return Toast.fire({
        icon: type,
        title: message,
        timer: duration ?? DEFAULT_DURATIONS[type]
    });
}

export const notifyInfo = (message: string, duration?: number) => notify(message, 'info', duration);
export const notifySuccess = (message: string, duration?: number) => notify(message, 'success', duration);
export const notifyWarning = (message: string, duration?: number) => notify(message, 'warning', duration);
export const notifyError = (message: string, duration?: number) => notify(message, 'error', duration);

export async function confirmWarning(title: string, text: string, confirmButtonText = 'Continuar') {
    const result = await Swal.fire({
        icon: 'warning',
        title,
        text,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#6c757d'
    });

    return result.isConfirmed;
}

export function notifySessionExpired(message = 'Su sesion expiro. Inicie sesion nuevamente.') {
    return notifyWarning(message).finally(() => {
        window.location.replace('/');
    });
}
