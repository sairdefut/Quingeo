import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { notify } from '../services/notificationService';
import type { NotificationType } from '../services/notificationService';

interface ToastContextValue {
    showToast: (message: string, type?: NotificationType, duration?: number) => void;
    showSyncToast: (message: string) => void;
    showSuccessToast: (message: string) => void;
    showErrorToast: (message: string) => void;
    showWarningToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const showToast = (message: string, type: NotificationType = 'info', duration?: number) => {
        notify(message, type, duration);
    };

    const showSyncToast = (message: string) => showToast(message, 'info', 3000);
    const showSuccessToast = (message: string) => showToast(message, 'success', 3000);
    const showErrorToast = (message: string) => showToast(message, 'error', 5000);
    const showWarningToast = (message: string) => showToast(message, 'warning', 4000);

    return (
        <ToastContext.Provider value={{
            showToast,
            showSyncToast,
            showSuccessToast,
            showErrorToast,
            showWarningToast
        }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
