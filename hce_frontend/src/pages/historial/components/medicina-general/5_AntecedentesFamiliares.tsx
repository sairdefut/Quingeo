import React from 'react';
import type { AntecedentesFamiliares as AntecedentesFamiliaresType } from './MedicalGeneralTypes';

interface Props {
    data: AntecedentesFamiliaresType;
    onChange: (data: AntecedentesFamiliaresType) => void;
}

export const AntecedentesFamiliares: React.FC<Props> = ({ data, onChange }) => {
    const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        onChange({ ...data, [name]: checked });
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    return (
        <div className="card shadow-sm mb-4 border-0">
            <div className="card-header bg-primary text-white py-3">
                <h5 className="mb-0 fw-bold">5. ANTECEDENTES FAMILIARES</h5>
            </div>
            <div className="card-body">
                <div className="row g-3 align-items-center">
                    <div className="col-auto">
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" name="cardiopatia" checked={data.cardiopatia} onChange={handleCheckChange} id="checkCardio" />
                            <label className="form-check-label fw-bold small" htmlFor="checkCardio">1. CARDIOPATÍA</label>
                        </div>
                    </div>
                    <div className="col-auto">
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" name="diabetes" checked={data.diabetes} onChange={handleCheckChange} id="checkDiabetes" />
                            <label className="form-check-label fw-bold small" htmlFor="checkDiabetes">2. DIABETES</label>
                        </div>
                    </div>
                    <div className="col-auto">
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" name="enfVascular" checked={data.enfVascular} onChange={handleCheckChange} id="checkVascular" />
                            <label className="form-check-label fw-bold small" htmlFor="checkVascular">3. ENF. VASCULAR</label>
                        </div>
                    </div>
                    <div className="col-auto">
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" name="hipertension" checked={data.hipertension} onChange={handleCheckChange} id="checkHipertension" />
                            <label className="form-check-label fw-bold small" htmlFor="checkHipertension">4. HIPERTENSIÓN</label>
                        </div>
                    </div>
                    <div className="col-auto">
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" name="cancer" checked={data.cancer} onChange={handleCheckChange} id="checkCancer" />
                            <label className="form-check-label fw-bold small" htmlFor="checkCancer">5. CÁNCER</label>
                        </div>
                    </div>
                    <div className="col-auto">
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" name="tuberculosis" checked={data.tuberculosis} onChange={handleCheckChange} id="checkTuberculosis" />
                            <label className="form-check-label fw-bold small" htmlFor="checkTuberculosis">6. TUBERCULOSIS</label>
                        </div>
                    </div>
                    <div className="col-auto">
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" name="enfInfecciosa" checked={data.enfInfecciosa} onChange={handleCheckChange} id="checkInfec" />
                            <label className="form-check-label fw-bold small" htmlFor="checkInfec">7. ENF. INFECCIOSA</label>
                        </div>
                    </div>
                    <div className="col-auto">
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" name="enfMental" checked={data.enfMental} onChange={handleCheckChange} id="checkMental" />
                            <label className="form-check-label fw-bold small" htmlFor="checkMental">8. ENF. MENTAL</label>
                        </div>
                    </div>
                    
                    <div className="col-md-12 mt-3">
                        <label className="form-label text-muted small fw-bold">9. OTROS ANTECEDENTES FAMILIARES</label>
                        <input type="text" className="form-control form-control-sm" name="otros" value={data.otros} onChange={handleTextChange} placeholder="Especifique otros..." />
                    </div>
                </div>
            </div>
        </div>
    );
};
