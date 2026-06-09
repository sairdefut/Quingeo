import { useEffect, useRef, useState } from 'react';

const ExpandableTextarea = ({ value, onChange, placeholder, disabled, className = "form-control" }: any) => {
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        if (isFocused) {
            el.style.setProperty('height', 'auto', 'important');
            el.style.setProperty('height', `${el.scrollHeight + 2}px`, 'important');
        } else {
            el.style.setProperty('height', '62px', 'important');
        }
    }, [value, isFocused]);

    return (
        <textarea
            ref={textareaRef}
            className={className}
            placeholder={placeholder}
            value={value || ''}
            disabled={disabled}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
                resize: 'vertical',
                overflowY: isFocused ? 'hidden' : 'auto',
                minHeight: '62px',
                boxSizing: 'border-box'
            }}
        />
    );
};

export const TabAntecedentesPersonales = ({
    isAntBlocked, enfermedadesCronicas, setEnfermedadesCronicas,
    hospitalizaciones, setHospitalizaciones,
    cirugias, setCirugias,
    alergias, setAlergias,
    familiares, setFamiliares,
    descripcionCronicas, setDescripcionCronicas,
    descripcionOtrasCronicas, setDescripcionOtrasCronicas
}: any) => {

    const today = new Date().toISOString().split('T')[0];

    const handleFamiliaresChange = (key: string) => {
        if (key === 'Ninguna') {
            const resetFamiliares = Object.keys(familiares).reduce((acc: any, curr) => {
                acc[curr] = curr === 'Ninguna' ? !familiares['Ninguna'] : false;
                return acc;
            }, {});
            setFamiliares(resetFamiliares);
        } else {
            setFamiliares({
                ...familiares,
                [key]: !familiares[key],
                Ninguna: false
            });
        }
    };

    return (
        <div className="container-fluid p-2">
            <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">Antecedentes Patológicos Personales</h6>

            <div className="mb-4">
                <label className="fw-bold small d-block mb-2 text-secondary">Enfermedades Crónicas</label>
                <div className="d-flex gap-3 flex-wrap">
                    {Object.keys(enfermedadesCronicas).map(k => (
                        <div className="form-check" key={k}>
                            <input
                                type="checkbox"
                                className="form-check-input"
                                disabled={isAntBlocked}
                                checked={enfermedadesCronicas[k]}
                                onChange={() => setEnfermedadesCronicas({ ...enfermedadesCronicas, [k]: !enfermedadesCronicas[k] })}
                            />
                            <label className="form-check-label small">{k}</label>
                        </div>
                    ))}
                </div>
                {enfermedadesCronicas['Otros'] && (
                    <div className="mt-2 animate__animated animate__fadeIn">
                        <textarea className="form-control form-control-sm" rows={2} disabled={isAntBlocked}
                            placeholder="Describa la otra enfermedad crónica..." 
                            value={descripcionOtrasCronicas} 
                            onChange={e => setDescripcionOtrasCronicas(e.target.value)} />
                    </div>
                )}
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12 mb-3">
                    <div className="form-check form-switch mb-2">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={hospitalizaciones.tiene}
                            disabled={isAntBlocked}
                            onChange={e => setHospitalizaciones({ ...hospitalizaciones, tiene: e.target.checked })}
                        />
                        <label className="fw-bold small">Hospitalizaciones</label>
                    </div>
                    {hospitalizaciones.tiene && (
                        <div className="mt-2 row">
                            <div className="col-md-8">
                                <label className="x-small text-muted d-block">Causa:</label>
                                <ExpandableTextarea
                                    className="form-control mb-2"
                                    placeholder="Describa la causa de forma detallada"
                                    value={hospitalizaciones.descripcion}
                                    onChange={(e: any) => setHospitalizaciones({ ...hospitalizaciones, descripcion: e.target.value })}
                                    disabled={isAntBlocked}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="x-small text-muted d-block">Fecha:</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    max={today}
                                    value={hospitalizaciones.fecha || ''}
                                    onChange={e => setHospitalizaciones({ ...hospitalizaciones, fecha: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-12 mb-3 border-top pt-3">
                    <div className="form-check form-switch mb-2">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={cirugias.tiene}
                            disabled={isAntBlocked}
                            onChange={e => setCirugias({ ...cirugias, tiene: e.target.checked })}
                        />
                        <label className="fw-bold small">Cirugías Previas</label>
                    </div>
                    {cirugias.tiene && (
                        <div className="mt-2 row">
                            <div className="col-md-8">
                                <label className="x-small text-muted d-block">Tipo de Cirugía y Observaciones:</label>
                                <ExpandableTextarea
                                    className="form-control mb-2"
                                    placeholder="Ej: Apendicectomía, sin complicaciones..."
                                    value={cirugias.descripcion}
                                    onChange={(e: any) => setCirugias({ ...cirugias, descripcion: e.target.value })}
                                    disabled={isAntBlocked}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="x-small text-muted d-block">Fecha:</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    max={today}
                                    value={cirugias.fecha || ''}
                                    onChange={e => setCirugias({ ...cirugias, fecha: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-12 border-top pt-3">
                    <div className="form-check form-switch mb-2">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={alergias.tiene}
                            disabled={isAntBlocked}
                            onChange={e => setAlergias({ ...alergias, tiene: e.target.checked })}
                        />
                        <label className="fw-bold small">Alergias</label>
                    </div>
                    {alergias.tiene && (
                        <div className="mt-2">
                            <label className="x-small text-muted d-block">Tipo / Alimento / Fármaco / Reacción:</label>
                            <ExpandableTextarea
                                className="form-control"
                                placeholder="Ej: Penicilina (shock anafiláctico), Mariscos (urticaria)..."
                                value={alergias.descripcion}
                                onChange={(e: any) => setAlergias({ ...alergias, descripcion: e.target.value })}
                                disabled={isAntBlocked}
                            />
                        </div>
                    )}
                </div>
            </div>

            <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">Antecedentes Familiares (1er Grado)</h6>
            <div className="d-flex gap-3 flex-wrap mb-3">
                {['HTA', 'Diabetes', 'Cáncer', 'Enfermedades Genéticas', 'Ninguna', 'Otros'].map(f => (
                    <div className="form-check" key={f}>
                        <input
                            type="checkbox"
                            className="form-check-input"
                            disabled={isAntBlocked}
                            id={`fam-${f}`}
                            checked={familiares[f] || false}
                            onChange={() => handleFamiliaresChange(f)}
                        />
                        <label className="form-check-label small" htmlFor={`fam-${f}`}>{f}</label>
                    </div>
                ))}
            </div>

            {familiares['Otros'] && (
                <div className="row g-2 mb-3 animate__animated animate__fadeIn">
                    <div className="col-4 col-md-2">
                        <input type="text" className="form-control form-control-sm" placeholder="CIE-10" disabled={isAntBlocked} />
                    </div>
                    <div className="col-8 col-md-10">
                        <input type="text" className="form-control form-control-sm" placeholder="Especifique otra enfermedad familiar" disabled={isAntBlocked} />
                    </div>
                </div>
            )}

            <ExpandableTextarea
                className="form-control w-100 mt-2"
                placeholder="Otras observaciones familiares detalladas..."
                value={descripcionCronicas}
                onChange={(e: any) => setDescripcionCronicas(e.target.value)}
                disabled={isAntBlocked}
            />
        </div>
    );
};
