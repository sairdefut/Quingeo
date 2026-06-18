import React from 'react';
import type { TratamientoPlan } from './MedicalGeneralTypes';

interface Props {
    data: TratamientoPlan;
    onChange: (data: TratamientoPlan) => void;
}

export const PlanTratamiento: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    return (
        <div className="card shadow-sm mb-4 border-0">
            <div className="card-header bg-primary text-white py-3">
                <h5 className="mb-0 fw-bold">9. PLAN DE TRATAMIENTO</h5>
            </div>
            <div className="card-body">
                <textarea 
                    className="form-control mb-4" 
                    rows={8} 
                    name="indicaciones"
                    value={data.indicaciones} 
                    onChange={handleChange}
                    placeholder="Describa el plan de tratamiento, indicaciones, recetas..."
                ></textarea>

                <div className="row g-3 align-items-end border-top pt-3">
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">FECHA</label>
                        <input type="date" className="form-control form-control-sm" name="fecha" value={data.fecha} onChange={handleChange} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">HORA</label>
                        <input type="time" className="form-control form-control-sm" name="hora" value={data.hora} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold">NOMBRE DEL PROFESIONAL</label>
                        <input type="text" className="form-control form-control-sm" name="profesional" value={data.profesional} onChange={handleChange} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">CÓDIGO</label>
                        <input type="text" className="form-control form-control-sm" name="codigo" value={data.codigo} onChange={handleChange} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">FIRMA</label>
                        <input type="text" className="form-control form-control-sm" name="firma" value={data.firma} onChange={handleChange} disabled placeholder="Espacio p/ firma" />
                    </div>
                </div>
            </div>
        </div>
    );
};
