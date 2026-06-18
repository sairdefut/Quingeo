import React from 'react';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export const EnfermedadProblemaActual: React.FC<Props> = ({ value, onChange }) => {
    return (
        <div className="card shadow-sm mb-4 border-0">
            <div className="card-header bg-primary text-white py-3">
                <h5 className="mb-0 fw-bold">3. ENFERMEDAD O PROBLEMA ACTUAL</h5>
            </div>
            <div className="card-body">
                <textarea 
                    className="form-control" 
                    rows={6} 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Describa la enfermedad o problema actual cronológicamente..."
                ></textarea>
            </div>
        </div>
    );
};
