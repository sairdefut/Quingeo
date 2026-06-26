import { useEffect, useRef, useState } from 'react';
import { ModernSelect } from '../../components/ui/ModernSelect';

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

const emptyHospitalizacion = () => ({ descripcion: '', fecha: '' });
const emptyCirugia = () => ({ descripcion: '', fecha: '' });
const emptyAlergia = () => ({ descripcion: '', estado: 'ACTIVA' });

const normalizeItems = (section: any, createItem: () => any) => {
    if (Array.isArray(section?.items) && section.items.length > 0) return section.items;
    if (section?.descripcion || section?.fecha || section?.estado) {
        return [{ descripcion: section.descripcion || '', fecha: section.fecha || '', estado: section.estado || 'ACTIVA' }];
    }
    return [createItem()];
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

    const updateSectionItem = (section: any, setSection: any, index: number, changes: any, createItem: () => any) => {
        const items = normalizeItems(section, createItem).map((item: any, idx: number) => (
            idx === index ? { ...item, ...changes } : item
        ));
        setSection({ ...section, items, descripcion: items[0]?.descripcion || '', fecha: items[0]?.fecha || '', estado: items[0]?.estado || section.estado });
    };

    const addSectionItem = (section: any, setSection: any, createItem: () => any) => {
        const items = [...normalizeItems(section, createItem), createItem()];
        setSection({ ...section, tiene: true, items });
    };

    const removeSectionItem = (section: any, setSection: any, index: number, createItem: () => any) => {
        const nextItems = normalizeItems(section, createItem).filter((_: any, idx: number) => idx !== index);
        const items = nextItems.length > 0 ? nextItems : [createItem()];
        setSection({ ...section, items, descripcion: items[0]?.descripcion || '', fecha: items[0]?.fecha || '', estado: items[0]?.estado || section.estado });
    };

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
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <div className="form-check form-switch mb-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={hospitalizaciones.tiene}
                                disabled={isAntBlocked}
                                onChange={e => setHospitalizaciones({ ...hospitalizaciones, tiene: e.target.checked, items: normalizeItems(hospitalizaciones, emptyHospitalizacion) })}
                            />
                            <label className="fw-bold small">Hospitalizaciones</label>
                        </div>
                        {hospitalizaciones.tiene && (
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                disabled={isAntBlocked}
                                onClick={() => addSectionItem(hospitalizaciones, setHospitalizaciones, emptyHospitalizacion)}
                            >
                                <i className="bi bi-plus-lg me-1"></i>Añadir
                            </button>
                        )}
                    </div>
                    {hospitalizaciones.tiene && (
                        <div className="mt-2 d-flex flex-column gap-3">
                            {normalizeItems(hospitalizaciones, emptyHospitalizacion).map((item: any, index: number) => (
                                <div className="row g-2" key={`hospitalizacion-${index}`}>
                                    <div className="col-md-8">
                                        <label className="x-small text-muted d-block">Causa:</label>
                                        <ExpandableTextarea
                                            className="form-control mb-2"
                                            placeholder="Describa la causa de forma detallada"
                                            value={item.descripcion}
                                            onChange={(e: any) => updateSectionItem(hospitalizaciones, setHospitalizaciones, index, { descripcion: e.target.value }, emptyHospitalizacion)}
                                            disabled={isAntBlocked}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="x-small text-muted d-block">Fecha:</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            max={today}
                                            value={item.fecha || ''}
                                            onChange={e => updateSectionItem(hospitalizaciones, setHospitalizaciones, index, { fecha: e.target.value }, emptyHospitalizacion)}
                                            disabled={isAntBlocked}
                                        />
                                    </div>
                                    <div className="col-md-1 d-flex align-items-end">
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm w-100 mb-2"
                                            disabled={isAntBlocked || normalizeItems(hospitalizaciones, emptyHospitalizacion).length === 1}
                                            onClick={() => removeSectionItem(hospitalizaciones, setHospitalizaciones, index, emptyHospitalizacion)}
                                            title="Quitar hospitalización"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="col-12 mb-3 border-top pt-3">
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <div className="form-check form-switch mb-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={cirugias.tiene}
                                disabled={isAntBlocked}
                                onChange={e => setCirugias({ ...cirugias, tiene: e.target.checked, items: normalizeItems(cirugias, emptyCirugia) })}
                            />
                            <label className="fw-bold small">Cirugías Previas</label>
                        </div>
                        {cirugias.tiene && (
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                disabled={isAntBlocked}
                                onClick={() => addSectionItem(cirugias, setCirugias, emptyCirugia)}
                            >
                                <i className="bi bi-plus-lg me-1"></i>Añadir
                            </button>
                        )}
                    </div>
                    {cirugias.tiene && (
                        <div className="mt-2 d-flex flex-column gap-3">
                            {normalizeItems(cirugias, emptyCirugia).map((item: any, index: number) => (
                                <div className="row g-2" key={`cirugia-${index}`}>
                                    <div className="col-md-8">
                                        <label className="x-small text-muted d-block">Tipo de Cirugía y Observaciones:</label>
                                        <ExpandableTextarea
                                            className="form-control mb-2"
                                            placeholder="Ej: Apendicectomía, sin complicaciones..."
                                            value={item.descripcion}
                                            onChange={(e: any) => updateSectionItem(cirugias, setCirugias, index, { descripcion: e.target.value }, emptyCirugia)}
                                            disabled={isAntBlocked}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="x-small text-muted d-block">Fecha:</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            max={today}
                                            value={item.fecha || ''}
                                            onChange={e => updateSectionItem(cirugias, setCirugias, index, { fecha: e.target.value }, emptyCirugia)}
                                            disabled={isAntBlocked}
                                        />
                                    </div>
                                    <div className="col-md-1 d-flex align-items-end">
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm w-100 mb-2"
                                            disabled={isAntBlocked || normalizeItems(cirugias, emptyCirugia).length === 1}
                                            onClick={() => removeSectionItem(cirugias, setCirugias, index, emptyCirugia)}
                                            title="Quitar cirugía"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="col-12 border-top pt-3">
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <div className="form-check form-switch mb-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={alergias.tiene}
                                disabled={isAntBlocked}
                                onChange={e => setAlergias({ ...alergias, tiene: e.target.checked, items: normalizeItems(alergias, emptyAlergia) })}
                            />
                            <label className="fw-bold small">Alergias</label>
                        </div>
                        {alergias.tiene && (
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                disabled={isAntBlocked}
                                onClick={() => addSectionItem(alergias, setAlergias, emptyAlergia)}
                            >
                                <i className="bi bi-plus-lg me-1"></i>Añadir
                            </button>
                        )}
                    </div>
                    {alergias.tiene && (
                        <div className="mt-2 d-flex flex-column gap-3">
                            {normalizeItems(alergias, emptyAlergia).map((item: any, index: number) => (
                                <div className="row g-2" key={`alergia-${index}`}>
                                    <div className="col-md-8">
                                        <label className="x-small text-muted d-block">Tipo / Alimento / Fármaco / Reacción:</label>
                                        <ExpandableTextarea
                                            className="form-control"
                                            placeholder="Ej: Penicilina (shock anafiláctico), Mariscos (urticaria)..."
                                            value={item.descripcion}
                                            onChange={(e: any) => updateSectionItem(alergias, setAlergias, index, { descripcion: e.target.value }, emptyAlergia)}
                                            disabled={isAntBlocked}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="x-small text-muted d-block">Estado:</label>
                                        <ModernSelect
                                            className="form-select"
                                            value={item.estado || 'ACTIVA'}
                                            onChange={e => updateSectionItem(alergias, setAlergias, index, { estado: e.target.value }, emptyAlergia)}
                                            disabled={isAntBlocked}
                                        >
                                            <option value="ACTIVA">Activa</option>
                                            <option value="INACTIVA">Inactiva</option>
                                            <option value="RESUELTA">Resuelta</option>
                                        </ModernSelect>
                                    </div>
                                    <div className="col-md-1 d-flex align-items-end">
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm w-100"
                                            disabled={isAntBlocked || normalizeItems(alergias, emptyAlergia).length === 1}
                                            onClick={() => removeSectionItem(alergias, setAlergias, index, emptyAlergia)}
                                            title="Quitar alergia"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
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
