import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
    changeMyPassword,
    getMyConsultas,
    getMyProfile,
    updateMyProfile,
    type MyConsultaDTO,
    type ProfileDTO
} from '../../services/profileService';
import { notifyError, notifySuccess, notifyWarning } from '../../services/notificationService';

export default function PerfilUsuario() {
    const [profile, setProfile] = useState<ProfileDTO | null>(null);
    const [consultas, setConsultas] = useState<MyConsultaDTO[]>([]);
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [onlineError, setOnlineError] = useState('');

    const fullName = useMemo(() => {
        if (!profile) return '';
        return `${profile.nombres || ''} ${profile.apellidos || ''}`.trim() || profile.username;
    }, [profile]);

    const loadOnlineData = async () => {
        if (!navigator.onLine) {
            setOnlineError('Esta sección requiere conexión.');
            setLoading(false);
            notifyWarning('Esta sección requiere conexión.');
            return;
        }

        setLoading(true);
        setOnlineError('');
        try {
            const [profileData, consultasData] = await Promise.all([
                getMyProfile(),
                getMyConsultas()
            ]);
            setProfile(profileData);
            setNombres(profileData.nombres || '');
            setApellidos(profileData.apellidos || '');
            setConsultas(Array.isArray(consultasData) ? consultasData : []);
        } catch (error: any) {
            setOnlineError(error?.message || 'Esta sección requiere conexión.');
            notifyError(error?.message || 'No se pudo cargar el perfil.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOnlineData().catch(console.error);
    }, []);

    const syncStoredProfile = (updated: ProfileDTO) => {
        const raw = localStorage.getItem('usuarioLogueado');
        const previous = raw ? JSON.parse(raw) : {};
        localStorage.setItem('usuarioLogueado', JSON.stringify({
            ...previous,
            idPersonal: updated.idPersonal,
            username: updated.username,
            nombres: updated.nombres,
            apellidos: updated.apellidos,
            cargo: updated.cargo
        }));
        window.dispatchEvent(new CustomEvent('hce-profile-updated', { detail: updated }));
    };

    const handleSaveProfile = async (event: FormEvent) => {
        event.preventDefault();
        if (!nombres.trim() || !apellidos.trim()) {
            notifyWarning('Ingrese nombres y apellidos.');
            return;
        }
        setSavingProfile(true);
        try {
            const updated = await updateMyProfile({
                nombres: nombres.trim(),
                apellidos: apellidos.trim()
            });
            setProfile(updated);
            syncStoredProfile(updated);
            notifySuccess('Perfil actualizado.');
        } catch (error: any) {
            notifyError(error?.message || 'No se pudo actualizar el perfil.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (event: FormEvent) => {
        event.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            notifyWarning('Complete todos los campos de contraseña.');
            return;
        }
        if (newPassword !== confirmPassword) {
            notifyWarning('La nueva contraseña y la confirmación no coinciden.');
            return;
        }
        if (newPassword.length < 6) {
            notifyWarning('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setSavingPassword(true);
        try {
            await changeMyPassword(currentPassword, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            notifySuccess('Contraseña actualizada.');
        } catch (error: any) {
            notifyError(error?.message || 'No se pudo cambiar la contraseña.');
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    if (onlineError) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-warning shadow-sm">
                    <strong>Mi Perfil</strong>
                    <div>{onlineError}</div>
                    <button className="btn btn-outline-primary btn-sm mt-3" onClick={() => loadOnlineData()}>
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h3 className="fw-bold text-primary mb-1">Mi Perfil</h3>
                    <p className="text-muted mb-0">Información del usuario y consultas registradas con esta cuenta.</p>
                </div>
                <button className="btn btn-outline-primary btn-sm" onClick={() => loadOnlineData()}>
                    Actualizar
                </button>
            </div>

            <div className="row g-4">
                <div className="col-lg-4">
                    <div className="bg-white rounded shadow-sm p-4 h-100">
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: 58, height: 58 }}>
                                {fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h5 className="mb-1 fw-bold">{fullName}</h5>
                                <div className="text-muted small">@{profile?.username}</div>
                                <span className="badge text-bg-light border text-capitalize mt-1">{profile?.cargo}</span>
                            </div>
                        </div>

                        <form onSubmit={handleSaveProfile}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Nombres</label>
                                <input className="form-control" value={nombres} onChange={e => setNombres(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Apellidos</label>
                                <input className="form-control" value={apellidos} onChange={e => setApellidos(e.target.value)} />
                            </div>
                            <button className="btn btn-primary w-100" type="submit" disabled={savingProfile}>
                                {savingProfile ? 'Guardando...' : 'Guardar perfil'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="bg-white rounded shadow-sm p-4 h-100">
                        <h5 className="fw-bold mb-3">Cambiar contraseña</h5>
                        <form onSubmit={handleChangePassword}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Contraseña actual</label>
                                <input className="form-control" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Nueva contraseña</label>
                                <input className="form-control" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Confirmar contraseña</label>
                                <input className="form-control" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                            </div>
                            <button className="btn btn-outline-primary w-100" type="submit" disabled={savingPassword}>
                                {savingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="bg-white rounded shadow-sm p-4 h-100">
                        <h5 className="fw-bold mb-2">Resumen</h5>
                        <div className="d-flex align-items-center justify-content-between border-bottom py-2">
                            <span className="text-muted">Consultas registradas</span>
                            <strong>{consultas.length}</strong>
                        </div>
                        <div className="d-flex align-items-center justify-content-between border-bottom py-2">
                            <span className="text-muted">ID personal</span>
                            <strong>{profile?.idPersonal}</strong>
                        </div>
                        <div className="d-flex align-items-center justify-content-between py-2">
                            <span className="text-muted">Modo</span>
                            <span className="badge text-bg-success">Online</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded shadow-sm mt-4">
                <div className="px-4 py-3 border-bottom">
                    <h5 className="fw-bold mb-0">Mis consultas</h5>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Fecha</th>
                                <th>Paciente</th>
                                <th>Historia</th>
                                <th>Motivo</th>
                                <th>Diagnóstico</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {consultas.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted py-4">No hay consultas registradas con este perfil.</td>
                                </tr>
                            ) : consultas.map(consulta => (
                                <tr key={consulta.idConsulta}>
                                    <td>
                                        <div className="fw-semibold">{consulta.fecha || 'Sin fecha'}</div>
                                        <small className="text-muted">{consulta.hora || ''}</small>
                                    </td>
                                    <td>
                                        <div className="fw-semibold">{consulta.pacienteNombre || 'Paciente no identificado'}</div>
                                        <small className="text-muted">{consulta.cedulaPaciente || ''}</small>
                                    </td>
                                    <td>{consulta.numeroHistoriaClinica || 'Pendiente'}</td>
                                    <td>{consulta.motivo || 'No registrado'}</td>
                                    <td>
                                        <div>{consulta.diagnostico || 'No registrado'}</div>
                                        {consulta.tipoDiagnostico && <small className="text-muted">{consulta.tipoDiagnostico}</small>}
                                    </td>
                                    <td>
                                        <span className="badge text-bg-success">{consulta.syncStatus || 'SYNCED'}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
