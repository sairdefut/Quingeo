import React from 'react';

const ExpandableTextarea = ({ value, onChange, placeholder, disabled, className = "form-control", baseHeight = "62px" }: any) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.setProperty('height', '0px', 'important');
        el.style.setProperty('height', `${Math.max(el.scrollHeight + 2, parseInt(baseHeight, 10) || 62)}px`, 'important');
    }, [value, baseHeight]);

    return (
        <textarea
            ref={textareaRef}
            className={className}
            placeholder={placeholder}
            value={value || ''}
            disabled={disabled}
            onChange={onChange}
            style={{
                resize: 'vertical',
                overflowY: 'hidden',
                minHeight: baseHeight,
                boxSizing: 'border-box',
                transition: 'none'
            }}
        />
    );
};

export const TabAnamnesis = ({ motivoConsulta, setMotivoConsulta, enfermedadActual, setEnfermedadActual }: any) => (
    <>
        <div className="alert alert-info py-2 small mb-3 w-100">
            <i className="bi bi-info-circle me-2"></i> Anamnesis y Motivo de Consulta
        </div>

        <div className="mb-3 w-100">
            <label className="fw-bold">A. Motivo de Consulta</label>
            <ExpandableTextarea
                className="form-control w-100"
                value={motivoConsulta}
                onChange={(e: any) => setMotivoConsulta(e.target.value)}
                baseHeight="62px"
            />
        </div>

        <div className="mb-3 w-100">
            <label className="fw-bold">B. Enfermedad Actual</label>
            <ExpandableTextarea
                className="form-control w-100"
                value={enfermedadActual}
                onChange={(e: any) => setEnfermedadActual(e.target.value)}
                baseHeight="62px"
            />
        </div>
    </>
);
