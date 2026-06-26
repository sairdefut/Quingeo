import React, { useEffect, useMemo, useRef, useState } from 'react';

type ModernOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type ModernSelectProps = {
  children: React.ReactNode;
  value?: string | number;
  disabled?: boolean;
  className?: string;
  onChange?: (event: { target: { value: string } }) => void;
};

function collectOptions(children: React.ReactNode): ModernOption[] {
  const options: ModernOption[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const props = child.props as { children?: React.ReactNode; value?: string | number; disabled?: boolean };

    if (child.type === React.Fragment) {
      options.push(...collectOptions(props.children));
      return;
    }

    if (child.type !== 'option') return;

    const label = React.Children.toArray(props.children).join('');
    options.push({
      value: String(props.value ?? label),
      label,
      disabled: props.disabled
    });
  });

  return options;
}

export function ModernSelect({ children, value = '', disabled, className = '', onChange }: ModernSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const options = useMemo(() => collectOptions(children), [children]);
  const normalizedValue = String(value);
  const selected = options.find(option => option.value === normalizedValue);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectOption = (option: ModernOption) => {
    if (option.disabled) return;
    onChange?.({ target: { value: option.value } });
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`modern-select ${className.includes('is-invalid') ? 'is-invalid' : ''} ${className.includes('form-select-sm') ? 'modern-select-sm' : ''}`}
    >
      <button
        type="button"
        className={`modern-select-trigger ${className.replace(/\bform-select\b|\bform-select-sm\b|\bis-invalid\b/g, '').trim()}`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(current => !current)}
      >
        <span className={!selected || selected.value === '' ? 'modern-select-placeholder' : ''}>
          {selected?.label || 'Seleccione...'}
        </span>
        <i className={`bi bi-chevron-down modern-select-chevron ${open ? 'open' : ''}`} aria-hidden="true"></i>
      </button>

      {open && !disabled && (
        <div className="modern-select-menu" role="listbox">
          {options.map(option => (
            <button
              type="button"
              key={`${option.value}-${option.label}`}
              className={`modern-select-option ${option.value === normalizedValue ? 'selected' : ''}`}
              disabled={option.disabled}
              role="option"
              aria-selected={option.value === normalizedValue}
              onClick={() => selectOption(option)}
            >
              <span>{option.label}</span>
              {option.value === normalizedValue && <i className="bi bi-check2" aria-hidden="true"></i>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
