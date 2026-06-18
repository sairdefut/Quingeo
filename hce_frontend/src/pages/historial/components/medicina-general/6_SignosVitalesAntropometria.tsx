import React from 'react';
import type { SignosVitales as SignosVitalesType } from './MedicalGeneralTypes';

interface Props {
    data: SignosVitalesType;
    onChange: (data: SignosVitalesType) => void;
}

export const SignosVitales: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    return (
        <div className="card shadow-sm mb-4 border-0">
            <div className="card-header bg-primary text-white py-3">
                <h5 className="mb-0 fw-bold">6. SIGNOS VITALES Y ANTROPOMETRÍA</h5>
            </div>
            <div className="card-body">
                <div className="row g-3">
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">FECHA DE MEDICIÓN</label>
                        <input type="date" className="form-control form-control-sm" name="fecha" value={data.fecha} onChange={handleChange} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">TEMPERATURA °C</label>
                        <input type="text" className="form-control form-control-sm" name="temperatura" value={data.temperatura} onChange={handleChange} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">PRESIÓN ARTERIAL</label>
                        <input type="text" className="form-control form-control-sm" name="presionArterial" value={data.presionArterial} onChange={handleChange} placeholder="Ej. 120/80" />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">PULSO / MIN</label>
                        <input type="text" className="form-control form-control-sm" name="pulso" value={data.pulso} onChange={handleChange} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">FRECUENCIA RESP.</label>
                        <input type="text" className="form-control form-control-sm" name="frecuenciaResp" value={data.frecuenciaResp} onChange={handleChange} />
                    </div>
                </div>
            </div>
        </div>
    );
};
