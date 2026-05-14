import { useEffect, useState, type Dispatch, type FC, type SetStateAction } from 'react';
import { db } from '../../db/db';
import { API_BASE_URL, handleUnauthorized } from '../../services/authSession';

type EnfermedadCatalogo = {
  codigo: string;
  nombre: string;
};

interface DiagnosticoValue {
  cie10: string;
  descripcion: string;
  tipo?: 'Presuntivo' | 'Definitivo';
}

interface Cie10AutocompleteProps {
  id: string;
  label?: string;
  value: DiagnosticoValue;
  onChange: (value: Partial<DiagnosticoValue>) => void;
}

interface Props {
  diagnosticoPrincipal: {
    cie10: string;
    descripcion: string;
    tipo: 'Presuntivo' | 'Definitivo';
  };
  setDiagnosticoPrincipal: Dispatch<SetStateAction<any>>;
  secundarios: any[];
  setSecundarios: Dispatch<SetStateAction<any[]>>;
  estudios: string;
  setEstudios: (val: string) => void;
  resultados: any[];
  setResultados: Dispatch<SetStateAction<any[]>>;
  planFarmacologico: {
    esquema: string;
    viaVenosa: string;
    viaOral: string;
  };
  setPlanFarmacologico: Dispatch<SetStateAction<any>>;
  planNoFarmacologico: {
    hidratacion: boolean;
    dieta: boolean;
    oxigeno: boolean;
    fisio: boolean;
    otros: string;
  };
  setPlanNoFarmacologico: Dispatch<SetStateAction<any>>;
  pronostico: string;
  setPronostico: (val: string) => void;
  proximaCita: string;
  handleProximaCitaChange: (e: any) => void;
  referenciaHospital: boolean;
  setReferenciaHospital: (val: boolean) => void;
  motivoReferencia: string;
  setMotivoReferencia: (val: string) => void;
  handleGuardar: () => void;
}

const buscarCie10Local = async (query: string): Promise<EnfermedadCatalogo[]> => {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 3) return [];

  const catalogos = await db.catalogos.where('tipo').equals('enfermedad').toArray();
  return catalogos
    .filter((item) =>
      (item.codigo || '').toLowerCase().includes(normalized) ||
      item.nombre.toLowerCase().includes(normalized)
    )
    .slice(0, 20)
    .map((item) => ({ codigo: item.codigo || '', nombre: item.nombre }));
};

const buscarCie10Backend = async (query: string): Promise<EnfermedadCatalogo[]> => {
  const response = await fetch(`${API_BASE_URL}/catalogos/cie10/buscar?q=${encodeURIComponent(query)}`, {
    credentials: 'include'
  });

  if (response.status === 403) {
    handleUnauthorized();
    return [];
  }

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data
    .map((item: any) => ({ codigo: item.codigo || '', nombre: item.nombre || '' }))
    .filter((item: EnfermedadCatalogo) => item.codigo || item.nombre);
};

const Cie10Autocomplete: FC<Cie10AutocompleteProps> = ({ id, label, value, onChange }) => {
  const [query, setQuery] = useState(value.descripcion || '');
  const [resultados, setResultados] = useState<EnfermedadCatalogo[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [origen, setOrigen] = useState<'backend' | 'local' | null>(null);

  useEffect(() => {
    setQuery(value.descripcion || '');
  }, [value.descripcion]);

  useEffect(() => {
    const texto = query.trim();
    if (texto.length < 3) {
      setResultados([]);
      setAbierto(false);
      setOrigen(null);
      return;
    }

    const timer: ReturnType<typeof setTimeout> = setTimeout(async () => {
      setBuscando(true);
      try {
        const data = navigator.onLine ? await buscarCie10Backend(texto) : await buscarCie10Local(texto);
        setResultados(data);
        setOrigen(navigator.onLine ? 'backend' : 'local');
        setAbierto(true);
      } catch (error) {
        console.error('[CIE-10] Error consultando backend, usando catálogo local:', error);
        const data = await buscarCie10Local(texto);
        setResultados(data);
        setOrigen('local');
        setAbierto(true);
      } finally {
        setBuscando(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const seleccionar = (item: EnfermedadCatalogo) => {
    onChange({ cie10: item.codigo, descripcion: item.nombre });
    setQuery(item.nombre);
    setAbierto(false);
  };

  return (
    <div className="position-relative">
      {label && <label className="small fw-bold text-uppercase text-primary mb-2">{label}</label>}
      <div className="input-group">
        <span className="input-group-text bg-white fw-bold text-primary">{value.cie10 || 'CIE-10'}</span>
        <input
          id={id}
          type="text"
          className="form-control"
          placeholder="Buscar diagnóstico por nombre o código"
          value={query}
          autoComplete="off"
          onFocus={() => resultados.length > 0 && setAbierto(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange({ descripcion: e.target.value, cie10: '' });
          }}
        />
        {buscando && <span className="input-group-text bg-white"><span className="spinner-border spinner-border-sm text-primary"></span></span>}
      </div>

      {abierto && (
        <div className="position-absolute bg-white border rounded shadow-sm w-100 mt-1" style={{ zIndex: 20, maxHeight: 260, overflowY: 'auto' }}>
          {resultados.length > 0 ? resultados.map((item) => (
            <button
              type="button"
              className="dropdown-item py-2 border-bottom text-wrap"
              key={`${id}-${item.codigo}-${item.nombre}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => seleccionar(item)}
            >
              <span className="fw-bold text-primary">[{item.codigo}]</span> {item.nombre}
            </button>
          )) : (
            <div className="small text-muted p-3">No se encontraron coincidencias.</div>
          )}
          {origen === 'local' && <div className="small text-muted px-3 py-2 bg-light">Mostrando resultados del catálogo local.</div>}
        </div>
      )}
    </div>
  );
};

export const TabDiagnostico: FC<Props> = ({
  diagnosticoPrincipal,
  setDiagnosticoPrincipal,
  secundarios,
  setSecundarios,
  estudios,
  setEstudios,
  resultados,
  setResultados,
  planFarmacologico,
  setPlanFarmacologico,
  planNoFarmacologico,
  setPlanNoFarmacologico,
  pronostico,
  setPronostico,
  proximaCita,
  handleProximaCitaChange,
  referenciaHospital,
  setReferenciaHospital,
  motivoReferencia,
  setMotivoReferencia,
  handleGuardar
}) => {
  const actualizarDiagnosticoPrincipal = (changes: Partial<Props['diagnosticoPrincipal']>) => {
    setDiagnosticoPrincipal({ ...diagnosticoPrincipal, ...changes });
  };

  const actualizarSecundario = (idx: number, changes: Record<string, string>) => {
    const nuevosDiagnosticos = [...secundarios];
    nuevosDiagnosticos[idx] = { ...nuevosDiagnosticos[idx], ...changes };
    setSecundarios(nuevosDiagnosticos);
  };

  const agregarFilaExamen = () => {
    setResultados([...resultados, { examen: '', tipo: 'Sangre', resultado: '' }]);
  };

  const agregarDiagnosticoSecundario = () => {
    setSecundarios([...secundarios, { cie10: '', descripcion: '' }]);
  };

  return (
    <div className="row g-4 w-100 m-0">
      <div className="col-12 border-bottom pb-2">
        <h6 className="text-primary m-0 fw-bold">A. Diagnósticos (CIE-10)</h6>
      </div>

      <div className="col-12">
        <div className="card shadow-sm border-0 bg-light p-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-9">
              <Cie10Autocomplete id="diagnostico-principal" label="Diagnóstico Principal" value={diagnosticoPrincipal} onChange={actualizarDiagnosticoPrincipal} />
            </div>
            <div className="col-md-3">
              <label className="small fw-bold text-uppercase text-primary mb-2">Tipo</label>
              <select className="form-select fw-bold" value={diagnosticoPrincipal.tipo} onChange={(e) => setDiagnosticoPrincipal({ ...diagnosticoPrincipal, tipo: e.target.value })}>
                <option value="Presuntivo">PRESUNTIVO</option>
                <option value="Definitivo">DEFINITIVO</option>
              </select>
            </div>
          </div>

          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="small fw-bold text-uppercase text-secondary">Diagnósticos Secundarios</label>
              <button type="button" className="btn btn-sm btn-link text-decoration-none p-0" onClick={agregarDiagnosticoSecundario}>
                <i className="bi bi-plus-circle"></i> Agregar Secundario
              </button>
            </div>
            {secundarios.map((diag, idx) => (
              <div className="row g-2 mb-2 align-items-start" key={diag.id || idx}>
                <div className="col-md-11">
                  <Cie10Autocomplete id={`diagnostico-secundario-${idx}`} value={diag} onChange={(changes) => actualizarSecundario(idx, changes as Record<string, string>)} />
                </div>
                <div className="col-md-1 text-end">
                  <button type="button" className="btn btn-sm btn-outline-danger" title="Quitar diagnóstico secundario" onClick={() => setSecundarios(secundarios.filter((_, i) => i !== idx))}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="col-md-6 border-end">
        <h6 className="text-primary fw-bold border-bottom pb-2">B. Estudios y Laboratorios</h6>
        <label className="small fw-bold mt-2">Estudios Solicitados (Texto libre)</label>
        <textarea className="form-control mb-3" rows={2} value={estudios} onChange={(e) => setEstudios(e.target.value)} placeholder="Ej: Biometría hemática, Rx de tórax, etc." />

        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="small fw-bold">Tabla de Resultados Relevantes</label>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={agregarFilaExamen}>
            <i className="bi bi-plus-circle me-1"></i> Añadir Examen
          </button>
        </div>

        <div className="table-responsive border rounded bg-white" style={{ maxHeight: '200px' }}>
          <table className="table table-sm table-hover m-0">
            <thead className="table-light small">
              <tr>
                <th>Examen (Lab/Imagen)</th>
                <th>Tipo</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((r, i) => (
                <tr key={i}>
                  <td>
                    <input type="text" className="form-control form-control-sm border-0" placeholder="Nombre del examen" value={r.examen} onChange={(e) => {
                      const nuevosResultados = [...resultados];
                      nuevosResultados[i].examen = e.target.value;
                      setResultados(nuevosResultados);
                    }} />
                  </td>
                  <td>
                    <select className="form-select form-select-sm border-0" value={r.tipo} onChange={(e) => {
                      const nuevosResultados = [...resultados];
                      nuevosResultados[i].tipo = e.target.value;
                      setResultados(nuevosResultados);
                    }}>
                      <option value="Sangre">Sangre</option>
                      <option value="Heces">Heces</option>
                      <option value="Orina">Orina</option>
                      <option value="Imagen">Imagen</option>
                    </select>
                  </td>
                  <td>
                    <input type="text" className="form-control form-control-sm border-0" placeholder="Valor/Hallazgo" value={r.resultado} onChange={(e) => {
                      const nuevosResultados = [...resultados];
                      nuevosResultados[i].resultado = e.target.value;
                      setResultados(nuevosResultados);
                    }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="col-md-6">
        <h6 className="text-primary fw-bold border-bottom pb-2">C. Plan Terapéutico</h6>

        <label className="small fw-bold mt-2">Manejo Farmacológico</label>
        <textarea className="form-control form-control-sm mb-2" rows={2} value={planFarmacologico.esquema} onChange={(e) => setPlanFarmacologico({ ...planFarmacologico, esquema: e.target.value })} placeholder="Medicación detallada: fármaco, dosis, frecuencia, duración..." />

        <div className="row g-2 mb-3">
          <div className="col-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white small">Vía Venosa</span>
              <input type="text" className="form-control" placeholder="Indicaciones" value={planFarmacologico.viaVenosa} onChange={(e) => setPlanFarmacologico({ ...planFarmacologico, viaVenosa: e.target.value })} />
            </div>
          </div>
          <div className="col-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white small">Vía Oral</span>
              <input type="text" className="form-control" placeholder="Indicaciones" value={planFarmacologico.viaOral} onChange={(e) => setPlanFarmacologico({ ...planFarmacologico, viaOral: e.target.value })} />
            </div>
          </div>
        </div>

        <label className="small fw-bold">Manejo No Farmacológico / Medidas Higiénico-Dietéticas</label>
        <div className="card p-2 bg-light border-0 mb-2">
          <div className="d-flex flex-wrap gap-3">
            {[
              { key: 'hidratacion', label: 'Hidratación' },
              { key: 'dieta', label: 'Dieta' },
              { key: 'oxigeno', label: 'Oxígeno' },
              { key: 'fisio', label: 'Fisio' }
            ].map((item) => (
              <div className="form-check" key={item.key}>
                <input className="form-check-input" type="checkbox" id={`check-${item.key}`} checked={(planNoFarmacologico as any)[item.key]} onChange={(e) => setPlanNoFarmacologico({ ...planNoFarmacologico, [item.key]: e.target.checked })} />
                <label className="form-check-label small fw-bold" htmlFor={`check-${item.key}`}>{item.label}</label>
              </div>
            ))}
          </div>
        </div>
        <input type="text" className="form-control form-control-sm" placeholder="Otras medidas (fisioterapia, cuidados, etc.)" value={planNoFarmacologico.otros} onChange={(e) => setPlanNoFarmacologico({ ...planNoFarmacologico, otros: e.target.value })} />
      </div>

      <div className="col-12 border-top pt-3">
        <h6 className="text-primary fw-bold border-bottom pb-2">D. Derivación / Referencia</h6>
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label className="small fw-bold text-primary">Paciente referido a otro hospital por lesión</label>
            <div className="btn-group w-100 mt-1" role="group" aria-label="Referencia hospitalaria">
              <input type="radio" className="btn-check" name="referenciaHospital" id="referenciaHospitalNo" checked={!referenciaHospital} onChange={() => setReferenciaHospital(false)} />
              <label className="btn btn-outline-primary" htmlFor="referenciaHospitalNo">No</label>
              <input type="radio" className="btn-check" name="referenciaHospital" id="referenciaHospitalSi" checked={referenciaHospital} onChange={() => setReferenciaHospital(true)} />
              <label className="btn btn-outline-primary" htmlFor="referenciaHospitalSi">Sí</label>
            </div>
          </div>
          {referenciaHospital && (
            <div className="col-md-7">
              <label className="small fw-bold">Motivo de referencia</label>
              <input type="text" className="form-control" value={motivoReferencia} onChange={(e) => setMotivoReferencia(e.target.value)} placeholder="Describa el motivo de referencia" />
            </div>
          )}
        </div>
      </div>

      <div className="col-12 mt-2">
        <div className="row g-3 align-items-end border-top pt-3">
          <div className="col-md-4">
            <label className="small fw-bold text-primary text-uppercase">Pronóstico del Paciente</label>
            <select className="form-select border-primary fw-bold text-primary" value={pronostico} onChange={(e) => setPronostico(e.target.value)}>
              <option value="Bueno">BUENO</option>
              <option value="Reservado">RESERVADO</option>
              <option value="Malo">MALO</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="small fw-bold text-danger text-uppercase">Fecha Próxima Cita</label>
            <input type="date" className="form-control border-danger fw-bold text-danger" value={proximaCita} onChange={handleProximaCitaChange} />
          </div>

          <div className="col-md-4 text-end">
            <button type="button" className="btn btn-primary btn-lg w-100 fw-bold shadow-sm" onClick={handleGuardar}>
              <i className="bi bi-cloud-check-fill me-2"></i> FINALIZAR Y GUARDAR CONSULTA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
