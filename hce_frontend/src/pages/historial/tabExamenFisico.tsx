import type { Dispatch, FC, SetStateAction } from 'react';
import { calcularEdadMeses } from './medicaCalcular';

interface Props {
  signosVitales: any;
  setSignosVitales: Dispatch<SetStateAction<any>>;
  examenSegmentario: any;
  setExamenSegmentario: Dispatch<SetStateAction<any>>;
  zPesoEdad: any;
  zTallaEdad: any;
  zIMCEdad: any;
  resultadoIMC?: any;
  evolucionClinica: string;
  setEvolucionClinica: (val: string) => void;
  paciente: any;
}

const calcularAspectoGlasgow = (puntaje: number): string => {
  if (puntaje >= 13) return 'Sobrealerta';
  if (puntaje >= 9) return 'Normal';
  return 'Activo';
};

export const TabExamenFisico: FC<Props> = ({
  signosVitales,
  setSignosVitales,
  examenSegmentario,
  setExamenSegmentario,
  zPesoEdad,
  zTallaEdad,
  zIMCEdad,
  resultadoIMC,
  evolucionClinica,
  setEvolucionClinica,
  paciente: _paciente
}) => {
  const renderValue = (val: any) => {
    if (val === null || val === undefined) return '0.00';
    if (typeof val === 'object') return val.valor ?? '0.00';
    const num = parseFloat(val);
    return Number.isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const edadMeses = _paciente?.fechaNacimiento ? calcularEdadMeses(_paciente.fechaNacimiento) : 0;
  const isCampoDisabled = (id: string) => id === 'perimetroCefalico' ? edadMeses < 24 || edadMeses > 36 : false;

  const toggleSegmentario = (grupo: string, item: string) => {
    setExamenSegmentario({
      ...examenSegmentario,
      [grupo]: {
        ...(examenSegmentario?.[grupo] || {}),
        [item]: !examenSegmentario?.[grupo]?.[item]
      }
    });
  };

  const setTextoCabezaOtros = (value: string) => {
    setExamenSegmentario({
      ...examenSegmentario,
      cabezaOtros: value
    });
  };

  const CurvaZGrafica = ({ valor }: { valor: any }) => {
    const v = parseFloat(valor?.valor || valor || 0);
    const posicion = Math.min(Math.max(((v + 3) / 6) * 100, 0), 100);

    return (
      <div className="mt-2 mb-3 px-1 w-100">
        <div style={{
          position: 'relative', height: '12px', width: '100%',
          display: 'flex', borderRadius: '6px', border: '1px solid #ccc', background: '#eee'
        }}>
          <div style={{ width: '16.6%', backgroundColor: '#d9534f', borderRadius: '6px 0 0 6px' }}></div>
          <div style={{ width: '16.6%', backgroundColor: '#f0ad4e' }}></div>
          <div style={{ width: '33.4%', backgroundColor: '#5cb85c' }}></div>
          <div style={{ width: '16.6%', backgroundColor: '#f0ad4e' }}></div>
          <div style={{ width: '16.6%', backgroundColor: '#d9534f', borderRadius: '0 6px 6px 0' }}></div>
          <div style={{
            position: 'absolute', left: `${posicion}%`, top: '50%',
            width: '10px', height: '10px', backgroundColor: '#000',
            borderRadius: '50%', border: '2px solid #fff',
            transform: 'translate(-50%, -50%)', zIndex: 10
          }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="row g-3 w-100 m-0">
      <div className="col-12 border-bottom pb-2">
        <h6 className="text-primary m-0 fw-bold">A. Signos Vitales y Antropometría</h6>
      </div>

      <div className="col-12">
        <div className="card border-0 shadow-sm bg-white p-3">
          <div className="row g-2">
            {[
              { id: 'peso', label: 'Peso (kg)' }, { id: 'talla', label: 'Talla (cm)' },
              { id: 'perimetroCefalico', label: 'P. Cefálico' }, { id: 'temperatura', label: 'Temp.' },
              { id: 'fc', label: 'FC' }, { id: 'fr', label: 'FR' },
              { id: 'paSistolica', label: 'PA Sist.' }, { id: 'paDiastolica', label: 'PA Diast.' },
              { id: 'spo2', label: 'SpO2' }
            ].map((campo) => (
              <div className="col-6 col-sm-4 col-md-2" key={campo.id}>
                <label className="small fw-bold text-muted" style={{ fontSize: '11px' }}>{campo.label}</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={signosVitales?.[campo.id] ?? ''}
                  disabled={isCampoDisabled(campo.id)}
                  onChange={e => setSignosVitales({ ...signosVitales, [campo.id]: e.target.value })}
                  title={isCampoDisabled(campo.id) && campo.id === 'perimetroCefalico' ? 'Solo aplicable entre 2 y 3 años' : ''}
                />
              </div>
            ))}

            <div className="col-6 col-sm-4 col-md-2">
              <label className="small fw-bold text-muted" style={{ fontSize: '11px' }}>Glasgow</label>
              <input
                type="number"
                min="3"
                max="15"
                className={`form-control form-control-sm ${signosVitales?.glasgow && (Number(signosVitales.glasgow) < 3 || Number(signosVitales.glasgow) > 15) ? 'is-invalid' : 'border-primary'}`}
                value={signosVitales?.glasgow ?? ''}
                onChange={e => {
                  const valor = Number(e.target.value);
                  setSignosVitales({
                    ...signosVitales,
                    glasgow: e.target.value,
                    aspectoGeneral: valor >= 3 && valor <= 15 ? calcularAspectoGlasgow(valor) : ''
                  });
                }}
                placeholder="3-15"
              />
            </div>
            <div className="col-6 col-sm-4 col-md-2">
              <label className="small fw-bold text-muted" style={{ fontSize: '11px' }}>Aspecto General</label>
              <input type="text" className="form-control form-control-sm bg-light" value={signosVitales?.aspectoGeneral ?? ''} readOnly placeholder="Auto" />
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 mt-2">
        <div className="card border-0 shadow-sm bg-light p-3">
          <label className="fw-bold text-secondary small d-block mb-2 text-center">EVALUACIÓN NUTRICIONAL (Z-SCORE)</label>
          <div className="row text-center g-3">
            <div className="col-12 col-md-3 border-end">
              <div className="small text-muted">IMC</div>
              <div className="fw-bold fs-5">{renderValue(resultadoIMC)}</div>
              <span className="badge rounded-pill" style={{ backgroundColor: resultadoIMC?.color || '#eee', color: '#000' }}>
                {resultadoIMC?.interpretacion || 'N/A'}
              </span>
            </div>
            {[
              { label: 'Z-Peso/E', value: zPesoEdad },
              { label: 'Z-Talla/E', value: zTallaEdad },
              { label: 'Z-IMC/E', value: zIMCEdad }
            ].map((item, idx) => (
              <div className="col-4 col-md-3" key={idx}>
                <div className="small text-muted fw-bold">{item.label}</div>
                <div className="fw-bold text-primary">{renderValue(item.value)}</div>
                <CurvaZGrafica valor={item.value} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="col-12 mt-3 border-bottom pb-2">
        <h6 className="text-primary m-0 fw-bold">B. Examen Físico Segmentario</h6>
      </div>

      <div className="col-12">
        <div className="card border-0 shadow-sm p-3 bg-light">
          <div className="row g-4">
            <div className="col-12 col-md-4">
              <label className="small fw-bold text-success border-bottom d-block mb-2">Aspecto General</label>
              <div className="d-flex flex-wrap gap-2">
                {['Consciente', 'Alerta', 'Activo', 'Decaído'].map(item => (
                  <div className="form-check" key={item}>
                    <input className="form-check-input" type="checkbox" checked={examenSegmentario?.aspecto?.[item] || false} onChange={() => toggleSegmentario('aspecto', item)} />
                    <label className="form-check-label small">{item}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 col-md-4">
              <label className="small fw-bold text-success border-bottom d-block mb-2">Piel y Faneras</label>
              <div className="d-flex flex-wrap gap-2">
                {['Ictericia', 'Cianosis', 'Rash', 'Normal'].map(item => (
                  <div className="form-check" key={item}>
                    <input className="form-check-input" type="checkbox" checked={examenSegmentario?.piel?.[item] || false} onChange={() => toggleSegmentario('piel', item)} />
                    <label className="form-check-label small">{item}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="d-flex align-items-center justify-content-between border-bottom mb-2">
                <label className="small fw-bold text-success mb-0">Cabeza y Cuello</label>
                <span className="badge text-bg-info" title="Fontanela anterior: se cierra alrededor de los 18-24 meses. Fontanela posterior: se cierra alrededor de los 2-3 meses.">Info</span>
              </div>
              <div className="small text-muted mb-2">Fontanela anterior: 18-24 meses. Fontanela posterior: 2-3 meses.</div>
              <div className="d-flex flex-wrap gap-2">
                {['Fontanela Anterior', 'Fontanela Posterior', 'Adenopatías', 'Normal', 'Otros'].map(item => (
                  <div className="form-check" key={item}>
                    <input className="form-check-input" type="checkbox" checked={examenSegmentario?.cabeza?.[item] || false} onChange={() => toggleSegmentario('cabeza', item)} />
                    <label className="form-check-label small">{item}</label>
                  </div>
                ))}
              </div>
              {examenSegmentario?.cabeza?.Otros && (
                <input
                  type="text"
                  className="form-control form-control-sm mt-2"
                  value={examenSegmentario?.cabezaOtros || ''}
                  onChange={(e) => setTextoCabezaOtros(e.target.value)}
                  placeholder="Describa otros hallazgos en cabeza y cuello"
                />
              )}
            </div>

            <div className="col-12 col-md-6">
              <label className="small fw-bold text-success border-bottom d-block mb-2">Cardiopulmonar</label>
              <div className="d-flex flex-wrap gap-3">
                {['Ruidos cardiacos', 'Murmullo vesicular', 'Soplos', 'Crepitantes'].map(item => (
                  <div className="form-check" key={item}>
                    <input className="form-check-input" type="checkbox" checked={examenSegmentario?.cardio?.[item] || false} onChange={() => toggleSegmentario('cardio', item)} />
                    <label className="form-check-label small">{item}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 col-md-6">
              <label className="small fw-bold text-success border-bottom d-block mb-2">Abdomen</label>
              <div className="d-flex flex-wrap gap-3">
                {['Blando', 'Depresible', 'Hepatomegalia', 'Esplenomegalia'].map(item => (
                  <div className="form-check" key={item}>
                    <input className="form-check-input" type="checkbox" checked={examenSegmentario?.abdomen?.[item] || false} onChange={() => toggleSegmentario('abdomen', item)} />
                    <label className="form-check-label small">{item}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 mt-3">
        <label className="small fw-bold">Evolución Clínica / Hallazgos Adicionales</label>
        <textarea className="form-control" rows={3} value={evolucionClinica} onChange={e => setEvolucionClinica(e.target.value)} placeholder="Describa el resumen del curso de la enfermedad..." />
      </div>
    </div>
  );
};
