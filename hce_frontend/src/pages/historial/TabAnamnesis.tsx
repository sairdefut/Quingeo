import React from 'react';

// --- COMPONENTE MAGICO ANTI-BOOTSTRAP ---
const ExpandableTextarea = ({ value, onChange, placeholder, disabled, className = "form-control", baseHeight = "62px" }: any) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        if (isFocused) {
            el.style.setProperty('height', '0px', 'important');
            el.style.setProperty('height', `${el.scrollHeight + 2}px`, 'important');
        } else {
            // Usa la altura base (ahora todos miden 62px al inicio)
            el.style.setProperty('height', baseHeight, 'important');
        }
    }, [value, isFocused, baseHeight]);

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
                minHeight: baseHeight,
                boxSizing: 'border-box',
                transition: 'none'
            }}
        />
    );
};

// --- TU CÓDIGO PRINCIPAL ---
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
                baseHeight="62px" // ¡Ajustado para que empiece igual de pequeño!
            />
        </div>
    </>
);
