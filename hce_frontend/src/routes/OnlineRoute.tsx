import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { syncService } from '../services/syncService';

export default function OnlineRoute({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => syncService.subscribe(status => setOnline(status.online)), []);

  return online ? children : <Navigate to="/dashboard" replace />;
}
