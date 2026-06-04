import React from 'react';

const VACIO = 'No registrado';

const valor = (value: any, fallback = VACIO) => {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'number' && Number.isNaN(value)) return fallback;
    return String(value);
};

const formatoLista = (items: any, fallback = 'Ninguna') => {
    if (!items) return fallback;
    if (Array.isArray(items)) return items.length ? items.map(item => valor(item)).join(', ') : fallback;
    if (typeof items === 'object') {
        const activos = Object.entries(items)
            .filter(([, activo]) => Boolean(activo))
            .map(([nombre]) => nombre);
        return activos.length ? activos.join(', ') : fallback;
    }
    return valor(items, fallback);
};

const fechaHoraConsulta = (consulta: any) => {
    const fecha = valor(consulta?.fecha, '');
    const hora = valor(consulta?.hora, '');
    return [fecha, hora].filter(Boolean).join(' ');
};

const totalApgar = (apgar: any) => {
    if (!apgar) return null;
    return ['apariencia', 'pulso', 'reflejos', 'tonoMuscular', 'respiracion']
        .reduce((total, key) => total + Number(apgar[key] || 0), 0);
};

const clasificacionApgar = (total: number | null) => {
    if (total === null) return VACIO;
    if (total >= 7) return 'NORMAL';
    if (total >= 4) return 'INTERMEDIO';
    return 'BAJO';
};

const formatoSiTiene = (item: any, etiquetaSiNo = false) => {
    if (!item) return etiquetaSiNo ? 'No' : VACIO;
    if (!item.tiene) return 'No';
    return [item.descripcion, item.fecha].filter(Boolean).join(' - ') || 'Si';
};

const ordenarConsultas = (consultas: any[]) => {
    return consultas.slice().sort((a, b) => {
        const fechaA = new Date(`${a?.fecha || ''}T${a?.hora || '00:00:00'}`).getTime();
        const fechaB = new Date(`${b?.fecha || ''}T${b?.hora || '00:00:00'}`).getTime();
        return (Number.isNaN(fechaB) ? 0 : fechaB) - (Number.isNaN(fechaA) ? 0 : fechaA);
    });
};

const Campo = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="col-md-3 col-sm-6">
        <div className="text-muted small fw-semibold text-uppercase">{label}</div>
        <div className="fw-semibold text-dark">{children}</div>
    </div>
);

const Bloque = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
    <section className="reporte-bloque">
        <div className="reporte-bloque-titulo">{titulo}</div>
        <div className="reporte-bloque-cuerpo">{children}</div>
    </section>
);

export const ReporteCompletoHCE = ({ paciente }: any) => {
    if (!paciente) return <div className="p-5 text-center">Cargando datos del paciente...</div>;

    const consultas = ordenarConsultas(Array.isArray(paciente.historiaClinica) ? paciente.historiaClinica : []);
    const primeraConsulta = consultas[consultas.length - 1];
    const ultimaConsulta = consultas[0];
    const consultaConAntecedentes = consultas.find(consulta => consulta?.antecedentes) || {};
    const antecedentes = consultaConAntecedentes.antecedentes || {};
    const perinatales = antecedentes.perinatales || {};
    const personales = antecedentes.personales || {};
    const desarrollo = antecedentes.desarrollo?.hitos || {};
    const alimentacion = antecedentes.desarrollo?.alimentacion || {};
    const apgarTotal = totalApgar(perinatales.apgar);
    const vacunas = antecedentes.vacunacion?.vacunas || {};

    return (
        <div className="container-fluid bg-light p-4 reporte-hce-page" id="reporte-hce">
            <div className="d-flex justify-content-between align-items-center mb-3 d-print-none">
                <div>
                    <h4 className="text-primary fw-bold mb-1">Historia Clinica</h4>
                    <div className="text-muted small">Vista previa del reporte clinico completo</div>
                </div>
                <button className="btn btn-outline-secondary" onClick={() => window.print()}>
                    <i className="bi bi-printer me-2"></i>Imprimir
                </button>
            </div>

            <header className="reporte-encabezado">
                <div className="d-flex justify-content-between gap-3 flex-wrap mb-3">
                    <div>
                        <div className="text-uppercase text-primary fw-bold small">Historia clinica</div>
                        <h2 className="fw-bold mb-1">{valor(paciente.numeroHistoriaClinica, 'Pendiente')}</h2>
                        <div className="text-muted">{valor(paciente.apellidos)} {valor(paciente.nombres)}</div>
                    </div>
                    <div className="text-md-end">
                        <div className="badge text-bg-primary fs-6 px-3 py-2">{consultas.length} consultas</div>
                        <div className="small text-muted mt-2">Documento solo lectura</div>
                    </div>
                </div>

                <div className="row g-3">
                    <Campo label="Cedula">{valor(paciente.cedula)}</Campo>
                    <Campo label="Fecha de nacimiento">{valor(paciente.fechaNacimiento)}</Campo>
                    <Campo label="Edad">{valor(paciente.edad)}</Campo>
                    <Campo label="Sexo">{valor(paciente.sexo)}</Campo>
                    <Campo label="Tipo de sangre">{valor(paciente.tipoSangre)}</Campo>
                    <Campo label="Responsable">{valor(paciente.filiacion?.nombreResponsable)}</Campo>
                    <Campo label="Parentesco">{valor(paciente.filiacion?.parentesco, '-')}</Campo>
                    <Campo label="Telefono">{valor(paciente.filiacion?.telefonoContacto, '-')}</Campo>
                    <Campo label="Primera consulta">{primeraConsulta ? fechaHoraConsulta(primeraConsulta) : '-'}</Campo>
                    <Campo label="Ultima consulta">{ultimaConsulta ? fechaHoraConsulta(ultimaConsulta) : '-'}</Campo>
                </div>

                <div className="antecedentes-encabezado mt-4">
                    <div className="reporte-bloque-titulo">Antecedentes clinicos</div>
                    <div className="antecedentes-grid small">
                        <div className="antecedente-subseccion">
                            <div className="fw-bold text-primary mb-2">Antecedentes Perinatales</div>
                            <div><strong>Producto gestacion:</strong> {valor(perinatales.productoGestacion)}</div>
                            <div><strong>Edad gestacional:</strong> {valor(perinatales.edadGestacional, '-')} semanas</div>
                            <div><strong>Via parto:</strong> {valor(perinatales.viaParto)}</div>
                            <div><strong>Peso RN:</strong> {valor(perinatales.pesoNacimiento, '-')} g</div>
                            <div><strong>Talla RN:</strong> {valor(perinatales.tallaNacimiento, '-')} cm</div>
                            <div><strong>Apgar:</strong> {apgarTotal === null ? VACIO : `${apgarTotal} / 10 (${clasificacionApgar(apgarTotal)})`}</div>
                            <div><strong>Apgar detalle:</strong> Apariencia {valor(perinatales.apgar?.apariencia, '-')}, Pulso {valor(perinatales.apgar?.pulso, '-')}, Reflejos {valor(perinatales.apgar?.reflejos, '-')}, Tono {valor(perinatales.apgar?.tonoMuscular, '-')}, Respiracion {valor(perinatales.apgar?.respiracion, '-')}</div>
                            <div><strong>Complicaciones:</strong> {formatoLista(perinatales.checksComplicaciones, 'Ninguna')}</div>
                            <div><strong>Descripcion complicaciones:</strong> {valor(perinatales.descripcionComplicaciones, '-')}</div>
                        </div>

                        <div className="antecedente-subseccion">
                            <div className="fw-bold text-primary mb-2">Antecedentes Patologicos Personales</div>
                            <div><strong>Enfermedades cronicas:</strong> {formatoLista(personales.enfermedadesCronicas)}</div>
                            <div><strong>Otras cronicas:</strong> {valor(personales.descripcionOtrasCronicas, '-')}</div>
                            <div><strong>Hospitalizaciones:</strong> {formatoSiTiene(personales.hospitalizaciones, true)}</div>
                            <div><strong>Cirugias previas:</strong> {formatoSiTiene(personales.cirugias, true)}</div>
                            <div className="text-danger fw-semibold"><strong>Alergias:</strong> {personales.alergias?.tiene ? valor(personales.alergias.descripcion) : 'Sin alergias conocidas'}</div>
                            <div><strong>Antecedentes familiares:</strong> {formatoLista(personales.familiares)}</div>
                            <div><strong>Observaciones familiares:</strong> {valor(personales.descripcionCronicas, '-')}</div>
                        </div>

                        <div className="antecedente-subseccion">
                            <div className="fw-bold text-primary mb-2">Inmunizaciones</div>
                            <div><strong>Estado:</strong> {valor(antecedentes.vacunacion?.estado || antecedentes.vacunacion)}</div>
                            <div><strong>Vacunas:</strong> {formatoLista(vacunas, antecedentes.vacunacion?.estado === 'Incompleto' ? 'Sin detalle' : '-')}</div>
                        </div>

                        <div className="antecedente-subseccion">
                            <div className="fw-bold text-primary mb-2">Desarrollo Psicomotor</div>
                            <div><strong>Padre desconoce/no recuerda:</strong> {desarrollo.desconoce ? 'Si' : 'No'}</div>
                            <div><strong>Sosten cefalico:</strong> {valor(desarrollo.sostenCefalico, '-')} meses</div>
                            <div><strong>Sedestacion:</strong> {valor(desarrollo.sedestacion, '-')} meses</div>
                            <div><strong>Deambulacion:</strong> {valor(desarrollo.deambulacion, '-')} meses</div>
                            <div><strong>Lenguaje:</strong> {valor(desarrollo.lenguaje, '-')} meses</div>
                            <div className="mt-2"><strong>Alimentacion:</strong></div>
                            <div><strong>Lactancia materna exclusiva:</strong> {valor(alimentacion.lactancia?.duracion, '-')} meses</div>
                            <div><strong>Formula:</strong> {valor(alimentacion.formula?.tipo, '-')}</div>
                            <div><strong>Ablactacion:</strong> {valor(alimentacion.ablactacion?.edadInicio, '-')}</div>
                        </div>
                    </div>
                </div>
            </header>

            {consultas.length === 0 ? (
                <div className="alert alert-info mt-4">El paciente no registra consultas medicas previas.</div>
            ) : (
                <div className="mt-4">
                    <h5 className="fw-bold text-dark mb-3">Consultas registradas</h5>
                    {consultas.map((consulta, index) => {
                        const vitales = consulta.examenFisico?.vitales || consulta.signosVitales || {};
                        const diagnostico = consulta.diagnostico || {};
                        const principal = diagnostico.principal || {};
                        const plan = diagnostico.plan || {};
                        const cierre = diagnostico.cierre || {};

                        return (
                            <article className="consulta-card" key={consulta.idConsulta || consulta.id || index}>
                                <div className="consulta-card-header">
                                    <div>
                                        <div className="text-muted small">Consulta #{consultas.length - index}</div>
                                        <h6 className="fw-bold mb-0">{valor(consulta.motivo || consulta.motivoConsulta, 'Consulta medica')}</h6>
                                    </div>
                                    <div className="text-md-end">
                                        <div className="fw-bold text-primary">{valor(consulta.fecha, 'Sin fecha')}</div>
                                        <div className="small text-muted">{valor(consulta.hora, 'Sin hora')}</div>
                                    </div>
                                </div>

                                <Bloque titulo="Motivo y enfermedad actual">
                                    <p><strong>Motivo:</strong> {valor(consulta.motivo || consulta.motivoConsulta)}</p>
                                    <p className="mb-0"><strong>Enfermedad actual:</strong> {valor(consulta.enfermedadActual)}</p>
                                </Bloque>

                                <Bloque titulo="Examen fisico y signos vitales">
                                    <div className="row g-2">
                                        <div className="col-md-3"><strong>Peso:</strong> {valor(vitales.peso, '-')} kg</div>
                                        <div className="col-md-3"><strong>Talla:</strong> {valor(vitales.talla, '-')} cm</div>
                                        <div className="col-md-3"><strong>Temperatura:</strong> {valor(vitales.temperatura, '-')} C</div>
                                        <div className="col-md-3"><strong>FC:</strong> {valor(vitales.fc, '-')} lpm</div>
                                        <div className="col-md-3"><strong>FR:</strong> {valor(vitales.fr, '-')} rpm</div>
                                        <div className="col-md-3"><strong>SpO2:</strong> {valor(vitales.spo2, '-')}%</div>
                                        <div className="col-md-3"><strong>Perimetro cefalico:</strong> {valor(vitales.perimetroCefalico, '-')}</div>
                                        <div className="col-12"><strong>Evolucion:</strong> {valor(consulta.examenFisico?.evolucion)}</div>
                                        <div className="col-12"><strong>Segmentario:</strong> {formatoLista(consulta.examenFisico?.segmentario, 'Sin hallazgos registrados')}</div>
                                    </div>
                                </Bloque>

                                <Bloque titulo="Diagnostico, estudios y plan">
                                    <div className="row g-2">
                                        <div className="col-12"><strong>Diagnostico principal:</strong> {valor(principal.descripcion)} {principal.cie10 ? `(${principal.cie10})` : ''}</div>
                                        <div className="col-12"><strong>Diagnosticos secundarios:</strong> {Array.isArray(diagnostico.secundarios) && diagnostico.secundarios.length ? diagnostico.secundarios.map((d: any) => valor(d.descripcion || d.cie10)).join(', ') : 'No registrados'}</div>
                                        <div className="col-md-6"><strong>Estudios solicitados:</strong> {formatoLista(diagnostico.estudios, 'No solicitados')}</div>
                                        <div className="col-md-6"><strong>Resultados:</strong> {Array.isArray(diagnostico.resultados) && diagnostico.resultados.length ? diagnostico.resultados.map((r: any) => `${valor(r.examen || r.tipo)}: ${valor(r.resultado)}`).join(' | ') : 'No registrados'}</div>
                                        <div className="col-md-6"><strong>Plan farmacologico:</strong> {valor(plan.farmacologico?.esquema, 'No prescrito')}</div>
                                        <div className="col-md-6"><strong>Plan no farmacologico:</strong> {formatoLista(plan.noFarmacologico, 'No registrado')}</div>
                                        <div className="col-md-4"><strong>Pronostico:</strong> {valor(diagnostico.pronostico)}</div>
                                        <div className="col-md-4"><strong>Proxima cita:</strong> {valor(diagnostico.proximaCita, '-')}</div>
                                        <div className="col-md-4"><strong>Referencia hospitalaria:</strong> {(cierre.referenciaHospital ?? consulta.referenciaHospital) ? valor(cierre.motivoReferencia || consulta.motivoReferencia) : 'No'}</div>
                                    </div>
                                </Bloque>
                            </article>
                        );
                    })}
                </div>
            )}

            <style>{`
                .reporte-hce-page {
                    color: #111827;
                }
                .reporte-encabezado {
                    background: #fff;
                    border: 1px solid #d8e1ea;
                    border-top: 6px solid #003b70;
                    border-radius: 8px;
                    padding: 22px;
                    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
                }
                .antecedentes-encabezado {
                    border-top: 1px solid #edf2f7;
                    padding-top: 16px;
                }
                .antecedentes-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 14px;
                }
                .antecedente-subseccion {
                    background: #f8fafc;
                    border: 1px solid #e5edf5;
                    border-radius: 6px;
                    padding: 12px;
                }
                .consulta-card {
                    background: #fff;
                    border: 1px solid #d8e1ea;
                    border-radius: 8px;
                    margin-bottom: 18px;
                    overflow: hidden;
                    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
                    break-inside: avoid;
                }
                .consulta-card-header {
                    background: #f7fafc;
                    border-bottom: 1px solid #d8e1ea;
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 16px 18px;
                }
                .reporte-bloque {
                    padding: 14px 18px;
                    border-bottom: 1px solid #edf2f7;
                }
                .reporte-bloque:last-child {
                    border-bottom: 0;
                }
                .reporte-bloque-titulo {
                    color: #003b70;
                    font-weight: 800;
                    font-size: 0.78rem;
                    letter-spacing: 0;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }
                .reporte-bloque-cuerpo {
                    font-size: 0.9rem;
                }
                @media print {
                    body {
                        background: #fff !important;
                    }
                    .sidebar, nav, aside, .d-print-none {
                        display: none !important;
                    }
                    #reporte-hce {
                        padding: 0 !important;
                        background: #fff !important;
                    }
                    .reporte-encabezado, .consulta-card {
                        box-shadow: none !important;
                    }
                    .antecedentes-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }
                @media (max-width: 900px) {
                    .antecedentes-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};
