import React from 'react';
import type { ExamenFisicoRegional as ExamenFisicoRegionalType } from './MedicalGeneralTypes';

interface Props {
    data: ExamenFisicoRegionalType;
    onChange: (data: ExamenFisicoRegionalType) => void;
}

export const ExamenFisicoRegional: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    return (
        <div className="card shadow-sm mb-4 border-0">
            <div className="card-header bg-primary text-white py-3">
                <h5 className="mb-0 fw-bold">7. EXAMEN FÍSICO REGIONAL</h5>
            </div>
            <div className="card-body">
                <div className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label small fw-bold">1. CABEZA</label>
                        <input type="text" className="form-control form-control-sm" name="cabeza" value={data.cabeza} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold">2. CUELLO</label>
                        <input type="text" className="form-control form-control-sm" name="cuello" value={data.cuello} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold">3. TÓRAX</label>
                        <input type="text" className="form-control form-control-sm" name="torax" value={data.torax} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold">4. ABDOMEN</label>
                        <input type="text" className="form-control form-control-sm" name="abdomen" value={data.abdomen} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold">5. PELVIS</label>
                        <input type="text" className="form-control form-control-sm" name="pelvis" value={data.pelvis} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold">6. EXTREMIDADES</label>
                        <input type="text" className="form-control form-control-sm" name="extremidades" value={data.extremidades} onChange={handleChange} />
                    </div>
                </div>
            </div>
        </div>
    );
};
