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
    const [showPasswordForm, setShowPasswordForm] = useState(false);
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
        <div className="profile-page container-fluid p-3 p-xl-4">
            <div className="profile-header d-flex align-items-center justify-content-between gap-3 mb-3">
                <div>
                    <h3 className="fw-bold text-primary mb-1">Mi Perfil</h3>
                    <p className="text-muted mb-0">Información del usuario y consultas registradas con esta cuenta.</p>
                </div>
                <button className="btn btn-outline-primary btn-sm" onClick={() => loadOnlineData()}>
                    Actualizar
                </button>
            </div>

            <div className="profile-grid">
                <section className="profile-card bg-white rounded shadow-sm">
                    <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: 52, height: 52 }}>
                                {fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <h5 className="mb-1 fw-bold">{fullName}</h5>
                                <div className="text-muted small">@{profile?.username}</div>
                                <span className="badge text-bg-light border text-capitalize mt-1">{profile?.cargo}</span>
                            </div>
                        </div>

                        <form onSubmit={handleSaveProfile} className="profile-form">
                            <div>
                                <label className="form-label small fw-bold">Nombres</label>
                                <input className="form-control" value={nombres} onChange={e => setNombres(e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label small fw-bold">Apellidos</label>
                                <input className="form-control" value={apellidos} onChange={e => setApellidos(e.target.value)} />
                            </div>
                            <button className="btn btn-primary w-100" type="submit" disabled={savingProfile}>
                                {savingProfile ? 'Guardando...' : 'Guardar perfil'}
                            </button>
                        </form>
                </section>

                <section className="profile-card bg-white rounded shadow-sm">
                    <div className="d-flex align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center gap-3 min-w-0">
                            <div className="rounded-circle bg-soft-primary text-primary d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 42, height: 42 }}>
                                <i className="bi bi-shield-lock"></i>
                            </div>
                            <div className="min-w-0">
                                <h5 className="fw-bold mb-1">Seguridad</h5>
                                <p className="text-muted small mb-0">Contraseña protegida.</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm flex-shrink-0"
                            onClick={() => setShowPasswordForm(current => !current)}
                        >
                            {showPasswordForm ? 'Cerrar' : 'Cambiar contraseña'}
                        </button>
                    </div>

                    {showPasswordForm && (
                        <form onSubmit={handleChangePassword} className="profile-form profile-password-form mt-3">
                            <div>
                                <label className="form-label small fw-bold">Contraseña actual</label>
                                <input className="form-control" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label small fw-bold">Nueva contraseña</label>
                                <input className="form-control" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label small fw-bold">Confirmar contraseña</label>
                                <input className="form-control" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                            </div>
                            <button className="btn btn-outline-primary w-100" type="submit" disabled={savingPassword}>
                                {savingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                            </button>
                        </form>
                    )}
                </section>

                <section className="profile-card profile-summary bg-white rounded shadow-sm">
                        <h5 className="fw-bold mb-2">Resumen</h5>
                        <div className="profile-summary-row d-flex align-items-center justify-content-between border-bottom py-2 gap-3">
                            <span className="text-muted">Consultas registradas</span>
                            <strong>{consultas.length}</strong>
                        </div>
                        <div className="profile-summary-row d-flex align-items-center justify-content-between border-bottom py-2 gap-3">
                            <span className="text-muted">ID personal</span>
                            <strong>{profile?.idPersonal}</strong>
                        </div>
                        <div className="profile-summary-row d-flex align-items-center justify-content-between py-2 gap-3">
                            <span className="text-muted">Modo</span>
                            <span className="badge text-bg-success">Online</span>
                        </div>
                </section>
            </div>

            <section className="profile-consultas bg-white rounded shadow-sm mt-3">
                <div className="px-3 px-xl-4 py-3 border-bottom d-flex align-items-center justify-content-between gap-3">
                    <h5 className="fw-bold mb-0">Mis consultas</h5>
                    <span className="badge text-bg-light border">{consultas.length}</span>
                </div>
                <div className="profile-consultas-table">
                    <table className="table table-hover align-middle mb-0 profile-table">
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
                                    <td data-label="Fecha">
                                        <div className="fw-semibold">{consulta.fecha || 'Sin fecha'}</div>
                                        <small className="text-muted">{consulta.hora || ''}</small>
                                    </td>
                                    <td data-label="Paciente">
                                        <div className="fw-semibold">{consulta.pacienteNombre || 'Paciente no identificado'}</div>
                                        <small className="text-muted">{consulta.cedulaPaciente || ''}</small>
                                    </td>
                                    <td data-label="Historia">{consulta.numeroHistoriaClinica || 'Pendiente'}</td>
                                    <td data-label="Motivo">
                                        <div className="text-truncate-cell">{consulta.motivo || 'No registrado'}</div>
                                    </td>
                                    <td data-label="Diagnóstico">
                                        <div className="text-truncate-cell">{consulta.diagnostico || 'No registrado'}</div>
                                        {consulta.tipoDiagnostico && <small className="text-muted">{consulta.tipoDiagnostico}</small>}
                                    </td>
                                    <td data-label="Estado">
                                        <span className="badge text-bg-success">{consulta.syncStatus || 'SYNCED'}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
