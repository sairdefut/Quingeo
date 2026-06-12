import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { syncService, type SyncStatus } from '../../services/syncService';
import { obtenerConflictosPendientes, resolverConflictoConsulta } from '../../services/dbPacienteService';
import type { SyncConflict } from '../../db/db';

const initialStatus: SyncStatus = {
    lastSync: null,
    syncing: false,
    pendingChanges: 0,
    online: false,
    conflicts: 0,
    failedChanges: 0,
    lastError: undefined
};

export function SyncStatusIndicator() {
    const [status, setStatus] = useState<SyncStatus>(initialStatus);
    const [showConflicts, setShowConflicts] = useState(false);
    const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
    const [resolvingId, setResolvingId] = useState<number | null>(null);

    useEffect(() => syncService.subscribe(setStatus), []);

    const loadConflicts = useCallback(async () => {
        setConflicts(await obtenerConflictosPendientes());
    }, []);

    const openConflicts = async () => {
        await loadConflicts();
        setShowConflicts(true);
    };

    const resolveConflict = async (conflict: SyncConflict, resolution: 'local' | 'server') => {
        if (!conflict.id) return;
        setResolvingId(conflict.id);
        try {
            await resolverConflictoConsulta(conflict.id, resolution);
            await loadConflicts();
            await syncService.refreshStatus();
        } finally {
            setResolvingId(null);
        }
    };

    const conflictTitle = (conflict: SyncConflict) => {
        const local = conflict.localPayload?.jsonCompleto || conflict.localPayload;
        const server = conflict.serverPayload?.jsonCompleto || conflict.serverPayload;
        return local?.motivo || server?.motivo || local?.motivoConsulta || server?.motivoConsulta || 'Consulta en conflicto';
    };

    const conflictDate = (conflict: SyncConflict) => {
        const local = conflict.localPayload?.jsonCompleto || conflict.localPayload;
        const server = conflict.serverPayload?.jsonCompleto || conflict.serverPayload;
        return local?.fecha || server?.fecha || 'Sin fecha';
    };

    const runSync = () => {
        const task = status.pendingChanges > 0
            ? syncService.sync()
            : syncService.syncFullFromServer();
        task.catch(console.error);
    };

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
                <button
                    type="button"
                    className="badge text-bg-warning border-0 d-inline-flex align-items-center gap-1"
                    onClick={openConflicts}
                    title="Revisar conflictos de sincronizacion"
                >
                    <AlertTriangle size={14} />
                    {status.conflicts} conflicto{status.conflicts === 1 ? '' : 's'}
                </button>
            )}

            {status.failedChanges > 0 && (
                <span
                    className="badge text-bg-danger d-inline-flex align-items-center gap-1"
                    title={status.lastError || 'Hay cambios que no se pudieron sincronizar'}
                >
                    <AlertTriangle size={14} />
                    {status.failedChanges} fallido{status.failedChanges === 1 ? '' : 's'}
                </span>
            )}

            <small className="text-muted">
                {status.lastSync ? `Ultima sync: ${new Date(status.lastSync).toLocaleString()}` : 'Sin sync previa'}
            </small>

            <button
                type="button"
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                disabled={!status.online || status.syncing}
                onClick={runSync}
                title={status.pendingChanges > 0
                    ? (status.lastError ? `Reintentar sincronizacion: ${status.lastError}` : 'Sincronizar cambios pendientes')
                    : 'Recargar datos desde el servidor'}
            >
                <RefreshCw size={14} className={status.syncing ? 'sync-spin' : ''} />
                {status.syncing ? 'Sincronizando' : (status.pendingChanges > 0 ? 'Sincronizar' : 'Recargar')}
            </button>

            {showConflicts && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">Conflictos de sincronizacion</h5>
                                <button type="button" className="btn-close" onClick={() => setShowConflicts(false)}></button>
                            </div>
                            <div className="modal-body">
                                {conflicts.length === 0 ? (
                                    <div className="text-center text-muted py-4">No hay conflictos pendientes.</div>
                                ) : conflicts.map(conflict => (
                                    <div key={conflict.id || conflict.clientMutationId} className="border rounded p-3 mb-3 bg-white">
                                        <div className="d-flex justify-content-between gap-3">
                                            <div>
                                                <h6 className="fw-bold mb-1">{conflictTitle(conflict)}</h6>
                                                <div className="text-muted small">{conflictDate(conflict)} · {conflict.reason}</div>
                                            </div>
                                            <span className="badge text-bg-light align-self-start">{conflict.entity}</span>
                                        </div>
                                        {conflict.entity === 'consulta' ? (
                                            <div className="d-flex gap-2 mt-3 flex-wrap">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    disabled={resolvingId === conflict.id}
                                                    onClick={() => resolveConflict(conflict, 'local')}
                                                >
                                                    Usar version local
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success"
                                                    disabled={resolvingId === conflict.id}
                                                    onClick={() => resolveConflict(conflict, 'server')}
                                                >
                                                    Usar version servidor
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-light border"
                                                    disabled={resolvingId === conflict.id}
                                                    onClick={() => setShowConflicts(false)}
                                                >
                                                    Revisar luego
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="alert alert-warning mt-3 mb-0 py-2">
                                                Este conflicto no es de consulta y debe resolverse desde su modulo.
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
