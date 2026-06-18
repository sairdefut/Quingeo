import { useEffect, useRef, useState, type Dispatch, type FC, type SetStateAction } from 'react';
import { buscarCie10 } from '../../services/catalogService';

type EnfermedadCatalogo = {
  codigo: string;
  nombre: string;
};

type TipoExamen = 'Sangre' | 'Heces' | 'Orina' | 'Imagen';

type ResultadoExamen = {
  examen: string;
  tipo: TipoExamen;
  resultado: string;
  adjuntoNombre?: string;
  adjuntoTipo?: string;
  adjuntoDataUrl?: string;
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
  resultados: ResultadoExamen[];
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

const ExpandableTextarea = ({ value, onChange, placeholder, className = 'form-control', baseHeight = '62px', disabled = false }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (isFocused) {
      el.style.setProperty('height', '0px', 'important');
      el.style.setProperty('height', `${el.scrollHeight + 2}px`, 'important');
    } else {
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

const buscarCie10Backend = async (query: string): Promise<EnfermedadCatalogo[]> => buscarCie10(query);

const Cie10Autocomplete: FC<Cie10AutocompleteProps> = ({ id, label, value, onChange }) => {
  const [query, setQuery] = useState(value.descripcion || '');
  const [resultados, setResultados] = useState<EnfermedadCatalogo[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    setQuery(value.descripcion || '');
  }, [value.descripcion]);

  useEffect(() => {
    const texto = query.trim();
    if (texto.length < 2) {
      setResultados([]);
      setAbierto(false);
      return;
    }

    const timer: ReturnType<typeof setTimeout> = setTimeout(async () => {
      setBuscando(true);
      try {
        const data = await buscarCie10Backend(texto);
        setResultados(data);
        setAbierto(true);
      } catch (error) {
        console.error('[CIE-10] Error consultando backend:', error);
        setResultados([]);
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
        </div>
      )}
    </div>
  );
};

const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const examenVacio = (): ResultadoExamen => ({
  examen: '',
  tipo: 'Sangre',
  resultado: '',
  adjuntoNombre: '',
  adjuntoTipo: '',
  adjuntoDataUrl: ''
});

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
  const [modalExamenAbierto, setModalExamenAbierto] = useState(false);
  const [indiceEditandoExamen, setIndiceEditandoExamen] = useState<number | null>(null);
  const [examenTemporal, setExamenTemporal] = useState<ResultadoExamen>(examenVacio());

  const actualizarDiagnosticoPrincipal = (changes: Partial<Props['diagnosticoPrincipal']>) => {
    setDiagnosticoPrincipal({ ...diagnosticoPrincipal, ...changes });
  };

  const actualizarSecundario = (idx: number, changes: Record<string, any>) => {
    const nuevosDiagnosticos = [...secundarios];
    nuevosDiagnosticos[idx] = { ...nuevosDiagnosticos[idx], ...changes };
    setSecundarios(nuevosDiagnosticos);
  };

  const agregarDiagnosticoSecundario = () => {
    setSecundarios([...secundarios, { cie10: '', descripcion: '', tipo: 'Presuntivo' }]);
  };

  const eliminarDiagnosticoSecundario = (idx: number) => {
    setSecundarios(secundarios.filter((_, i) => i !== idx));
  };

  const abrirModalNuevoExamen = () => {
    setIndiceEditandoExamen(null);
    setExamenTemporal(examenVacio());
    setModalExamenAbierto(true);
  };

  const abrirModalEditarExamen = (idx: number) => {
    setIndiceEditandoExamen(idx);
    setExamenTemporal({ ...examenVacio(), ...resultados[idx] });
    setModalExamenAbierto(true);
  };

  const cerrarModalExamen = () => {
    setModalExamenAbierto(false);
    setIndiceEditandoExamen(null);
    setExamenTemporal(examenVacio());
  };

  const guardarExamen = () => {
    const nuevosResultados = [...resultados];
    if (indiceEditandoExamen === null) {
      nuevosResultados.push(examenTemporal);
    } else {
      nuevosResultados[indiceEditandoExamen] = examenTemporal;
    }
    setResultados(nuevosResultados);
    cerrarModalExamen();
  };

  const eliminarFilaExamen = (idx: number) => {
    setResultados(resultados.filter((_, i) => i !== idx));
  };

  const manejarAdjuntoTemporal = async (file?: File | null) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setExamenTemporal((prev) => ({
      ...prev,
      adjuntoNombre: file.name,
      adjuntoTipo: file.type,
      adjuntoDataUrl: dataUrl
    }));
  };

  return (
    <>
      <div className="row g-4 w-100 m-0">
        <div className="col-12 border-bottom pb-2">
          <h6 className="text-primary m-0 fw-bold">A. Diagnósticos (CIE-10)</h6>
        </div>

        <div className="col-12 mb-4">
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
              <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                <label className="small fw-bold text-uppercase text-secondary">Diagnósticos Secundarios</label>
                <button type="button" className="btn btn-sm btn-link text-decoration-none p-0" onClick={agregarDiagnosticoSecundario}>
                  <i className="bi bi-plus-circle me-1"></i> Agregar Secundario
                </button>
              </div>
              {secundarios.map((diag, idx) => (
                <div className="row g-2 mb-2 align-items-start" key={diag.id || idx}>
                  <div className="col-md-7">
                    <Cie10Autocomplete id={`diagnostico-secundario-${idx}`} value={diag} onChange={(changes) => actualizarSecundario(idx, changes as Record<string, string>)} />
                  </div>
                  <div className="col-md-4">
                    <label className="small fw-bold text-uppercase text-primary mb-2">Tipo</label>
                    <select className="form-select" value={diag.tipo || 'Presuntivo'} onChange={(e) => actualizarSecundario(idx, { tipo: e.target.value })}>
                      <option value="Presuntivo">PRESUNTIVO</option>
                      <option value="Definitivo">DEFINITIVO</option>
                    </select>
                  </div>
                  <div className="col-md-1 d-flex align-items-end justify-content-end">
                    <button type="button" className="btn btn-sm btn-outline-danger" title="Quitar diagnóstico secundario" onClick={() => eliminarDiagnosticoSecundario(idx)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 mb-4">
          <h6 className="text-primary fw-bold border-bottom pb-2">B. Estudios y Laboratorios</h6>
          <label className="small fw-bold mt-2">Estudios Solicitados (Texto libre)</label>
          <ExpandableTextarea className="form-control mb-3" value={estudios} onChange={(e: any) => setEstudios(e.target.value)} placeholder="Ej: Biometría hemática, Rx de tórax, etc." />

          <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
            <label className="small fw-bold">Tabla de Resultados Relevantes</label>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={abrirModalNuevoExamen}>
              <i className="bi bi-plus-circle me-1"></i> Añadir Examen
            </button>
          </div>

          <div className="table-responsive border rounded bg-white" style={{ maxHeight: '280px' }}>
            <table className="table table-sm table-hover m-0 align-middle">
              <thead className="table-light small">
                <tr>
                  <th>Examen</th>
                  <th style={{ width: '110px' }}>Tipo</th>
                  <th>Resultado</th>
                  <th style={{ width: '130px' }}>Adjunto</th>
                  <th style={{ width: '120px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r, i) => (
                  <tr key={i}>
                    <td>{r.examen || <span className="text-muted">Sin nombre</span>}</td>
                    <td>{r.tipo}</td>
                    <td>{r.resultado || <span className="text-muted">Sin resultado</span>}</td>
                    <td>
                      <div className="small text-truncate" title={r.adjuntoNombre || ''}>{r.adjuntoNombre || 'Sin archivo'}</div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => abrirModalEditarExamen(i)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => eliminarFilaExamen(i)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {resultados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted small py-3">Sin resultados registrados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-12 mb-4">
          <h6 className="text-primary fw-bold border-bottom pb-2">C. Plan Terapéutico</h6>

          <label className="small fw-bold mt-2">Manejo Farmacológico</label>
          <ExpandableTextarea className="form-control form-control-sm mb-2" value={planFarmacologico.esquema} onChange={(e: any) => setPlanFarmacologico({ ...planFarmacologico, esquema: e.target.value })} placeholder="Medicación detallada: fármaco, dosis, frecuencia, duración..." />

          <div className="row g-2 mb-3">
            <div className="col-12">
              <label className="small fw-bold">Vía Oral</label>
              <ExpandableTextarea className="form-control form-control-sm" baseHeight="46px" value={planFarmacologico.viaOral} onChange={(e: any) => setPlanFarmacologico({ ...planFarmacologico, viaOral: e.target.value })} placeholder="Indicaciones" />
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
          <ExpandableTextarea className="form-control form-control-sm" placeholder="Otras medidas (fisioterapia, cuidados, etc.)" value={planNoFarmacologico.otros} onChange={(e: any) => setPlanNoFarmacologico({ ...planNoFarmacologico, otros: e.target.value })} />
        </div>

        <div className="col-12 border-top pt-3 mb-4">
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
                <ExpandableTextarea className="form-control" value={motivoReferencia} onChange={(e: any) => setMotivoReferencia(e.target.value)} placeholder="Describa el motivo de referencia" />
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
              <button type="button" className="btn btn-primary w-100 fw-bold shadow-sm py-2" onClick={handleGuardar}>
                <i className="bi bi-cloud-check-fill me-2"></i> FINALIZAR Y GUARDAR CONSULTA
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalExamenAbierto && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.35)', zIndex: 2000 }}>
          <div className="card shadow-lg border-0" style={{ width: 'min(700px, 92vw)' }}>
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h6 className="m-0 fw-bold text-primary">{indiceEditandoExamen === null ? 'Añadir Examen' : 'Editar Examen'}</h6>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={cerrarModalExamen}>Cerrar</button>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-7">
                  <label className="small fw-bold">Nombre del examen</label>
                  <input className="form-control" value={examenTemporal.examen} onChange={(e) => setExamenTemporal((prev) => ({ ...prev, examen: e.target.value }))} placeholder="Ej: Biometría hemática" />
                </div>
                <div className="col-md-5">
                  <label className="small fw-bold">Tipo</label>
                  <select className="form-select" value={examenTemporal.tipo} onChange={(e) => setExamenTemporal((prev) => ({ ...prev, tipo: e.target.value as TipoExamen }))}>
                    <option value="Sangre">Sangre</option>
                    <option value="Heces">Heces</option>
                    <option value="Orina">Orina</option>
                    <option value="Imagen">Imagen</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="small fw-bold">Resultado / Hallazgo</label>
                  <ExpandableTextarea className="form-control" value={examenTemporal.resultado} onChange={(e: any) => setExamenTemporal((prev) => ({ ...prev, resultado: e.target.value }))} placeholder="Describa el resultado o hallazgo" />
                </div>
                <div className="col-12">
                  <label className="small fw-bold d-block mb-2">Adjunto</label>
                  <label className="btn btn-outline-secondary" htmlFor="modal-adjunto-examen">
                    <i className="bi bi-paperclip me-1"></i> Seleccionar archivo
                  </label>
                  <input id="modal-adjunto-examen" type="file" className="d-none" accept=".pdf,image/*" onChange={(e) => manejarAdjuntoTemporal(e.target.files?.[0])} />
                  <div className="small text-muted mt-2">{examenTemporal.adjuntoNombre || 'Sin archivo seleccionado'}</div>
                </div>
              </div>
            </div>
            <div className="card-footer bg-white d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={cerrarModalExamen}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={guardarExamen}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
