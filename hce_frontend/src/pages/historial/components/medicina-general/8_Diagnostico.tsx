import React from 'react';
import type { DiagnosticoItem } from './MedicalGeneralTypes';
import { v4 as uuidv4 } from 'uuid';

interface Props {
    diagnosticos: DiagnosticoItem[];
    onChange: (diagnosticos: DiagnosticoItem[]) => void;
}

export const Diagnostico: React.FC<Props> = ({ diagnosticos, onChange }) => {
    const handleAdd = () => {
        onChange([...diagnosticos, { id: uuidv4(), descripcion: '', cie10: '', tipo: '' }]);
    };

    const handleRemove = (id: string) => {
        onChange(diagnosticos.filter(d => d.id !== id));
    };

    const handleChange = (id: string, field: keyof DiagnosticoItem, value: string) => {
        onChange(diagnosticos.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    return (
        <div className="card shadow-sm mb-4 border-0">
            <div className="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">8. DIAGNÓSTICO</h5>
                <button type="button" className="btn btn-light btn-sm fw-bold" onClick={handleAdd}>
                    <i className="bi bi-plus-lg me-1"></i> AÑADIR
                </button>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-bordered table-sm align-middle">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '50px' }}>N°</th>
                                <th>DESCRIPCIÓN</th>
                                <th style={{ width: '150px' }}>CIE-10</th>
                                <th style={{ width: '120px' }}>PRESUNTIVO</th>
                                <th style={{ width: '120px' }}>DEFINITIVO</th>
                                <th style={{ width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {diagnosticos.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted py-3">No hay diagnósticos registrados.</td>
                                </tr>
                            )}
                            {diagnosticos.map((diag, index) => (
                                <tr key={diag.id}>
                                    <td className="text-center">{index + 1}</td>
                                    <td>
                                        <input type="text" className="form-control form-control-sm border-0 bg-transparent" value={diag.descripcion} onChange={(e) => handleChange(diag.id, 'descripcion', e.target.value)} placeholder="Descripción del diagnóstico..." />
                                    </td>
                                    <td>
                                        <input type="text" className="form-control form-control-sm border-0 bg-transparent" value={diag.cie10} onChange={(e) => handleChange(diag.id, 'cie10', e.target.value)} placeholder="Cód." />
                                    </td>
                                    <td className="text-center">
                                        <input className="form-check-input" type="radio" name={`tipo_${diag.id}`} checked={diag.tipo === 'PRESUNTIVO'} onChange={() => handleChange(diag.id, 'tipo', 'PRESUNTIVO')} />
                                    </td>
                                    <td className="text-center">
                                        <input className="form-check-input" type="radio" name={`tipo_${diag.id}`} checked={diag.tipo === 'DEFINITIVO'} onChange={() => handleChange(diag.id, 'tipo', 'DEFINITIVO')} />
                                    </td>
                                    <td className="text-center">
                                        <button type="button" className="btn btn-outline-danger btn-sm border-0" onClick={() => handleRemove(diag.id)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
