import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  try {
    const storedUser = localStorage.getItem('usuarioLogueado');
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (String(user?.cargo || '').trim().toLowerCase() === 'admin') {
      return children;
    }
  } catch {
    // Una sesión local inválida nunca debe habilitar rutas administrativas.
  }

  return <Navigate to="/dashboard" replace />;
}
