import { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, MapPinned, UploadCloud } from 'lucide-react';
import { apiPostForm } from '../../services/apiClient';
import { confirmWarning, notifyError, notifySuccess } from '../../services/notificationService';

interface Warning { row: number; code: string; message: string }
interface Result {
  countriesValidated: number;
  provinces: number;
  cantons: number;
  parishes: number;
  exactDuplicatesOmitted: number;
  newProvinces: number;
  updatedProvinces: number;
  newCantons: number;
  updatedCantons: number;
  newParishes: number;
  updatedParishes: number;
  consolidatedCantons: number;
  consolidatedParishes: number;
  warningCount: number;
  warnings: Warning[];
  executed: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function AdminUbicaciones() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Result | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<'preview' | 'import' | null>(null);

  const chooseFile = (selected?: File) => {
    setPreview(null); setResult(null); setError('');
    if (!selected) { setFile(null); return; }
    if (!selected.name.toLowerCase().endsWith('.xlsx')) {
      setFile(null); setError('Solo se permiten archivos Excel con extensión .xlsx.'); return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFile(null); setError('El archivo supera el límite de 5 MB.'); return;
    }
    setFile(selected);
  };

  const send = async (action: 'preview' | 'import') => {
    if (!file) return;
    const form = new FormData(); form.append('file', file);
    return apiPostForm<Result>(`/admin/catalogos/ubicaciones/${action}`, form);
  };

  const handlePreview = async () => {
    if (!file || loading) return;
    setLoading('preview'); setError('');
    try { const data = await send('preview'); if (data) setPreview(data); }
    catch (caught) {
      const message = caught instanceof Error ? caught.message : 'No se pudo analizar el archivo.';
      setError(message); notifyError(message);
    } finally { setLoading(null); }
  };

  const handleImport = async () => {
    if (!file || !preview || loading) return;
    const confirmed = await confirmWarning(
      'Confirmar carga geográfica',
      `Se procesarán ${format(preview.provinces)} provincias, ${format(preview.cantons)} cantones y ${format(preview.parishes)} parroquias. La consolidación conservará las referencias clínicas.`,
      'Importar ubicaciones'
    );
    if (!confirmed) return;
    setLoading('import'); setError('');
    try {
      const data = await send('import');
      if (data) { setPreview(data); setResult(data); notifySuccess('Catálogo geográfico importado correctamente.'); }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'No se pudo importar el archivo.';
      setError(message); notifyError(message);
    } finally { setLoading(null); }
  };

  return (
    <div>
      <section className="card border-0 shadow-sm p-4 mb-4">
        <div className="d-flex align-items-center gap-3 mb-3">
          <MapPinned size={28} className="text-primary" />
          <div><h5 className="fw-bold mb-1">País, provincias, cantones y parroquias</h5>
          <p className="text-muted mb-0">El país debe ser Ecuador. Ningún registro válido ausente del Excel será eliminado.</p></div>
        </div>
        <input ref={inputRef} className="visually-hidden" type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={event => chooseFile(event.target.files?.[0])} />
        <button type="button" className="cie10-dropzone" onClick={() => inputRef.current?.click()} disabled={loading !== null}>
          <UploadCloud size={36} />
          <strong>{file ? file.name : 'Elegir archivo p_c_p_Ecuador.xlsx'}</strong>
          <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB seleccionados` : 'Excel (.xlsx), máximo 5 MB'}</span>
        </button>
        {error && <div className="alert alert-danger mt-3 mb-0" role="alert">{error}</div>}
        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-primary px-4" type="button" onClick={handlePreview} disabled={!file || loading !== null}>
            {loading === 'preview' ? 'Analizando...' : 'Previsualizar carga'}
          </button>
        </div>
      </section>

      {preview && <section className="card border-0 shadow-sm p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
          <div><h5 className="fw-bold mb-1">{result ? 'Resultado de la carga' : 'Vista previa'}</h5>
          <p className="text-muted mb-0">Ecuador validado: {preview.countriesValidated === 1 ? 'sí' : 'no'}.</p></div>
          {result && <span className="badge bg-success fs-6"><CheckCircle2 size={16} /> Completado</span>}
        </div>
        <div className="row g-3 cie10-summary">
          <Summary label="Provincias" value={preview.provinces} />
          <Summary label="Cantones" value={preview.cantons} />
          <Summary label="Parroquias" value={preview.parishes} />
          <Summary label="Duplicados omitidos" value={preview.exactDuplicatesOmitted} />
        </div>
        <div className="catalog-change-summary mt-3">
          <span>Nuevos: <strong>{format(preview.newProvinces + preview.newCantons + preview.newParishes)}</strong></span>
          <span>Actualizaciones: <strong>{format(preview.updatedProvinces + preview.updatedCantons + preview.updatedParishes)}</strong></span>
          <span>Consolidaciones: <strong>{format(preview.consolidatedCantons + preview.consolidatedParishes)}</strong></span>
        </div>
        {preview.warningCount > 0 && <div className="alert alert-warning mt-4 mb-0">
          <div className="d-flex gap-2 fw-bold mb-2"><AlertTriangle size={20} />{format(preview.warningCount)} códigos con nombres distintos</div>
          <p className="small mb-2">Se conservarán como parroquias separadas.</p>
          {preview.warnings.map(item => <div className="small" key={item.code}><code>{item.code}</code>: {item.message}</div>)}
        </div>}
        {!result && <div className="d-flex justify-content-end mt-4">
          <button className="btn btn-success px-4" type="button" onClick={handleImport} disabled={loading !== null}>
            {loading === 'import' ? 'Importando...' : 'Confirmar e importar'}
          </button>
        </div>}
      </section>}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return <div className="col-6 col-xl-3"><div className="cie10-stat cie10-stat-primary"><span>{label}</span><strong>{format(value)}</strong></div></div>;
}
function format(value: number) { return new Intl.NumberFormat('es-EC').format(value); }
