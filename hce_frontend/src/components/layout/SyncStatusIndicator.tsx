import { useEffect, useState } from 'react';
import { RefreshCw, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { syncService, type SyncStatus } from '../../services/syncService';

const initialStatus: SyncStatus = {
    lastSync: null,
    syncing: false,
    pendingChanges: 0,
    online: false,
    conflicts: 0,
    failedChanges: 0
};

export function SyncStatusIndicator() {
    const [status, setStatus] = useState<SyncStatus>(initialStatus);

    useEffect(() => syncService.subscribe(setStatus), []);

    const label = status.online ? 'Online' : 'Offline';
    const variant = status.conflicts > 0 || status.failedChanges > 0
        ? 'warning'
        : status.online
            ? 'success'
            : 'secondary';

    return (
        <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end mb-3">
            <span className={`badge text-bg-${variant} d-inline-flex align-items-center gap-1`}>
                {status.online ? <Wifi size={14} /> : <WifiOff size={14} />}
                {label}
            </span>

            {status.pendingChanges > 0 && (
                <span className="badge text-bg-primary">
                    {status.pendingChanges} pendiente{status.pendingChanges === 1 ? '' : 's'}
                </span>
            )}

            {status.conflicts > 0 && (
                <span className="badge text-bg-warning d-inline-flex align-items-center gap-1">
                    <AlertTriangle size={14} />
                    {status.conflicts} conflicto{status.conflicts === 1 ? '' : 's'}
                </span>
            )}

            <small className="text-muted">
                {status.lastSync ? `Ultima sync: ${new Date(status.lastSync).toLocaleString()}` : 'Sin sync previa'}
            </small>

            <button
                type="button"
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                disabled={!status.online || status.syncing}
                onClick={() => syncService.sync().catch(console.error)}
                title="Sincronizar cambios pendientes"
            >
                <RefreshCw size={14} className={status.syncing ? 'sync-spin' : ''} />
                {status.syncing ? 'Sincronizando' : 'Sincronizar'}
            </button>
        </div>
    );
}
