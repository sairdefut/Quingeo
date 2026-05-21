import React, { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const ReporteCompletoHCE = forwardRef(({ paciente }: any, ref: any) => {
    const navigate = useNavigate();

    if (!paciente) return <div className="p-5 text-center">Cargando datos del paciente...</div>;

    const ultimaConsulta = paciente.historiaClinica?.[paciente.historiaClinica.length - 1];

    const calcularEdad = (fechaNacimiento: string) => {
        if (!fechaNacimiento) return "No registrada";
        const hoy = new Date();
        const nac = new Date(fechaNacimiento);
        let meses = (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth());
        return `${meses} meses`;
    };

    return (
        <div ref={ref} className="bg-white text-dark p-5" style={{ fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
            
            <div className="d-flex justify-content-between mb-4 d-print-none">
                <button className="btn btn-sm btn-outline-primary shadow-sm" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left me-1"></i> Regresar a Gestión
                </button>
                <button className="btn btn-sm btn-outline-secondary shadow-sm" onClick={() => window.print()}>
                    <i className="bi bi-printer me-1"></i> Imprimir Reporte
                </button>
            </div>

            <div className="text-center mb-4" style={{ borderBottom: '2px solid black', paddingBottom: '10px' }}>
                <h4 className="fw-bold mb-1">CENTRO DE SALUD QUINGEO</h4>
                <h6 className="mb-2">Reporte de Historia Clínica Pediátrica / Control de Niño Sano</h6>
                <p className="small mb-0 text-muted">
                    Fecha de Consulta e Impresión: {new Date().toLocaleDateString('es-ES')} - Generado por Sistema HCE Pediátrico
                </p>
            </div>

            {/* 1. IDENTIFICACIÓN DEL PACIENTE */}
            <div className="mb-4">
                <h6 className="fw-bold bg-light p-2 border">1. IDENTIFICACIÓN DEL PACIENTE</h6>
                <div className="row g-2 small ms-1 pt-2">
                    <div className="col-12"><strong>Paciente:</strong> {paciente.apellidos} {paciente.nombres}</div>
                    <div className="col-md-6"><strong>Fecha de Nacimiento:</strong> {paciente.fechaNacimiento}</div>
                    <div className="col-md-6"><strong>Sexo:</strong> {paciente.sexo}</div>
                    <div className="col-md-6"><strong>Cédula:</strong> {paciente.cedula}</div>
                    <div className="col-md-6"><strong>Edad Calculada:</strong> {calcularEdad(paciente.fechaNacimiento)}</div>
                    <div className="col-12">
                        <strong>Contacto Responsable:</strong> {paciente.filiacion?.nombreResponsable || "No registrado"} 
                        {paciente.filiacion?.parentesco ? ` (${paciente.filiacion.parentesco})` : ""}
                    </div>
                </div>
            </div>

            {!ultimaConsulta ? (
                <div className="alert alert-info border-1">El paciente no registra consultas médicas previas en el sistema.</div>
            ) : (
                <>
                    {/* 2. ANTECEDENTES PRENATALES Y PATOLÓGICOS */}
                    <div className="mb-4">
                        <h6 className="fw-bold bg-light p-2 border">2. ANTECEDENTES PRENATALES Y PATOLÓGICOS</h6>
                        <div className="small ms-1 pt-2">
                            <p className="mb-1">
                                <strong>Antecedentes Perinatales:</strong> Parto {ultimaConsulta.antecedentes?.perinatales?.viaParto || "—"} a las {ultimaConsulta.antecedentes?.perinatales?.edadGestacional || "—"} semanas. 
                                Peso RN: {ultimaConsulta.antecedentes?.perinatales?.pesoNacimiento ? `${ultimaConsulta.antecedentes.perinatales.pesoNacimiento}g` : "—"}. 
                                Talla RN: {ultimaConsulta.antecedentes?.perinatales?.tallaNacimiento ? `${ultimaConsulta.antecedentes.perinatales.tallaNacimiento}cm` : "—"}.
                            </p>
                            <p className="mb-1 mt-2">
                                <strong>Antecedentes Patológicos Personales:</strong> {
                                    Object.entries(ultimaConsulta.antecedentes?.personales?.enfermedadesCronicas || {})
                                        .filter(([_, v]) => v).map(([k]) => k).join(", ") || "Ninguna enfermedad crónica reportada"
                                }. {
                                    ultimaConsulta.antecedentes?.personales?.alergias?.tiene 
                                        ? `Alergia reportada: ${ultimaConsulta.antecedentes.personales.alergias.descripcion}` 
                                        : "Sin alergias conocidas."
                                }
                            </p>
                        </div>
                    </div>

                    {/* 3. MOTIVO DE CONSULTA Y ENFERMEDAD ACTUAL */}
                    <div className="mb-4">
                        <h6 className="fw-bold bg-light p-2 border">3. MOTIVO DE CONSULTA Y ENFERMEDAD ACTUAL</h6>
                        <div className="small ms-1 pt-2">
                            <p className="mb-1"><strong>Motivo:</strong> "{ultimaConsulta.motivo}"</p>
                            <p className="mb-1"><strong>Enfermedad Actual:</strong> {ultimaConsulta.enfermedadActual}</p>
                            <p className="small text-muted mt-2 mb-0">Atendido el: {ultimaConsulta.fecha} {ultimaConsulta.hora}</p>
                        </div>
                    </div>

                    {/* 4. EXAMEN FÍSICO Y ANTROPOMETRÍA */}
                    <div className="mb-4">
                        <h6 className="fw-bold bg-light p-2 border">4. EXAMEN FÍSICO Y ANTROPOMETRÍA</h6>
                        <div className="row g-2 small ms-1 py-2">
                            <div className="col-md-3"><strong>Peso:</strong> {ultimaConsulta.examenFisico?.vitales?.peso || "—"} Kg</div>
                            <div className="col-md-3"><strong>Talla:</strong> {ultimaConsulta.examenFisico?.vitales?.talla || "—"} cm</div>
                            <div className="col-md-3"><strong>Temp:</strong> {ultimaConsulta.examenFisico?.vitales?.temperatura || "—"} °C</div>
                            <div className="col-md-3"><strong>Frec. Cardíaca:</strong> {ultimaConsulta.examenFisico?.vitales?.frecuenciaCardiaca || "—"} lpm</div>
                            <div className="col-md-3"><strong>Frec. Resp:</strong> {ultimaConsulta.examenFisico?.vitales?.frecuenciaRespiratoria || "—"} rpm</div>
                            <div className="col-md-3"><strong>Sat O2:</strong> {ultimaConsulta.examenFisico?.vitales?.saturacionOxigeno || "—"}%</div>
                        </div>
                        <div className="small ms-1 mt-2">
                            <p className="mb-0"><strong>Hallazgos / Evolución:</strong> {ultimaConsulta.examenFisico?.evolucion || "Sin novedades adicionales reportadas."}</p>
                        </div>
                    </div>

                    {/* 5. DIAGNÓSTICO, PLAN Y TRATAMIENTO */}
                    <div className="mb-4">
                        <h6 className="fw-bold bg-light p-2 border">5. DIAGNÓSTICO, PLAN Y TRATAMIENTO</h6>
                        <div className="small ms-1 pt-2">
                            <p className="mb-2">
                                <strong>Diagnóstico Principal (CIE-10):</strong> {ultimaConsulta.diagnostico?.principal?.cie10} - {ultimaConsulta.diagnostico?.principal?.descripcion}
                            </p>
                            <p className="mb-1 mt-3 fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>Plan Terapéutico / Indicaciones:</p>
                            <div className="ms-3">
                                {ultimaConsulta.diagnostico?.plan?.farmacologico?.esquema ? (
                                    ultimaConsulta.diagnostico.plan.farmacologico.esquema.split('\n').map((linea: string, idx: number) => (
                                        <p key={idx} className="mb-1">• {linea}</p>
                                    ))
                                ) : (
                                    <p className="mb-0 text-muted">No se registraron indicaciones específicas en el plan farmacológico.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 pt-5 row text-center small" style={{ pageBreakInside: 'avoid' }}>
                        <div className="col-6">
                            <div style={{ borderTop: '1px solid black', width: '85%', margin: '0 auto', paddingTop: '8px' }}>
                                <strong>Firma del Médico Tratante</strong><br/>
                                <span className="text-muted small">Sello y Código Profesional</span>
                            </div>
                        </div>
                        <div className="col-6">
                            <div style={{ borderTop: '1px solid black', width: '85%', margin: '0 auto', paddingTop: '8px' }}>
                                <strong>Firma del Responsable / Tutor</strong><br/>
                                <span>C.I: {paciente.filiacion?.cedulaResponsable || "____________________"}</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @media print {
                    @page { 
                        margin: 15mm; 
                    }
                    body { 
                        background-color: white !important; 
                    }
                    .d-print-none { 
                        display: none !important; 
                    }
                    .border { 
                        border: 1px solid #000 !important; 
                    }
                    .bg-light { 
                        background-color: #f1f1f1 !important; 
                        -webkit-print-color-adjust: exact; 
                    }
                }
            `}</style>
        </div>
    );
});
