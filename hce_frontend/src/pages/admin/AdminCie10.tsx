import { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileSpreadsheet, UploadCloud } from 'lucide-react';
import { apiPostForm } from '../../services/apiClient';
import { confirmWarning, notifyError, notifySuccess } from '../../services/notificationService';
import './AdminCie10.css';

interface Cie10Warning {
  row: number;
  code: string;
  message: string;
}

interface Cie10ImportResult {
  totalRows: number;
  newRecords: number;
  updatedRecords: number;
  unchangedRecords: number;
  warningCount: number;
  warnings: Cie10Warning[];
  executed: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function AdminCie10({ embedded = false }: { embedded?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Cie10ImportResult | null>(null);
  const [result, setResult] = useState<Cie10ImportResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<'preview' | 'import' | null>(null);

  const chooseFile = (selected?: File) => {
    setPreview(null);
    setResult(null);
    setError('');

    if (!selected) {
      setFile(null);
      return;
    }
    if (!selected.name.toLowerCase().endsWith('.xls')) {
      setFile(null);
      setError('Solo se permiten archivos Excel con extensión .xls.');
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFile(null);
      setError('El archivo supera el límite de 5 MB.');
      return;
    }
    setFile(selected);
  };

  const sendFile = async (endpoint: 'preview' | 'import') => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    return apiPostForm<Cie10ImportResult>(`/admin/cie10/${endpoint}`, formData);
  };

  const handlePreview = async () => {
    if (!file || loading) return;
    setLoading('preview');
    setError('');
    try {
      const data = await sendFile('preview');
      if (data) setPreview(data);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'No se pudo analizar el archivo.';
      setError(message);
      notifyError(message);
    } finally {
      setLoading(null);
    }
  };

  const handleImport = async () => {
    if (!file || !preview || loading) return;
    const confirmed = await confirmWarning(
      'Confirmar carga CIE-10',
      `Se procesarán ${formatNumber(preview.totalRows)} registros. Los códigos existentes conservarán su ID.`,
      'Importar catálogo'
    );
    if (!confirmed) return;

    setLoading('import');
    setError('');
    try {
      const data = await sendFile('import');
      if (data) {
        setResult(data);
        setPreview(data);
        notifySuccess('Catálogo CIE-10 importado correctamente.');
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'No se pudo importar el archivo.';
      setError(message);
      notifyError(message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="cie10-page container-fluid py-2">
      {!embedded && <div className="cie10-heading mb-4">
        <div>
          <span className="cie10-eyebrow">Administración</span>
          <h2 className="fw-bold mb-2">Carga del catálogo CIE-10</h2>
          <p className="text-muted mb-0">
            Previsualice el Excel antes de actualizar el catálogo clínico. Ningún registro existente será eliminado.
          </p>
        </div>
        <FileSpreadsheet size={44} aria-hidden="true" />
      </div>}

      <section className="card border-0 shadow-sm p-4 mb-4">
        <h5 className="fw-bold mb-3">1. Seleccionar archivo</h5>
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept=".xls,application/vnd.ms-excel"
          onChange={(event) => chooseFile(event.target.files?.[0])}
        />
        <button
          type="button"
          className="cie10-dropzone"
          onClick={() => inputRef.current?.click()}
          disabled={loading !== null}
        >
          <UploadCloud size={36} />
          <strong>{file ? file.name : 'Elegir archivo CIE10.xls'}</strong>
          <span>{file ? `${formatBytes(file.size)} seleccionados` : 'Excel 97-2003 (.xls), máximo 5 MB'}</span>
        </button>

        {error && <div className="alert alert-danger mt-3 mb-0" role="alert">{error}</div>}

        <div className="d-flex justify-content-end mt-3">
          <button
            type="button"
            className="btn btn-primary px-4"
            onClick={handlePreview}
            disabled={!file || loading !== null}
          >
            {loading === 'preview' ? 'Analizando...' : 'Previsualizar carga'}
          </button>
        </div>
      </section>

      {preview && (
        <section className="card border-0 shadow-sm p-4 mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div>
              <h5 className="fw-bold mb-1">2. {result ? 'Resultado de la carga' : 'Vista previa'}</h5>
              <p className="text-muted mb-0">Resumen calculado usando el estado actual de la base de datos.</p>
            </div>
            {result && <span className="badge bg-success fs-6"><CheckCircle2 size={16} /> Completado</span>}
          </div>

          <div className="row g-3 cie10-summary">
            <SummaryCard label="Filas válidas" value={preview.totalRows} tone="primary" />
            <SummaryCard label="Registros nuevos" value={preview.newRecords} tone="success" />
            <SummaryCard label="Por actualizar" value={preview.updatedRecords} tone="warning" />
            <SummaryCard label="Sin cambios" value={preview.unchangedRecords} tone="secondary" />
          </div>

          {preview.warningCount > 0 && (
            <div className="alert alert-warning mt-4 mb-0">
              <div className="d-flex align-items-center gap-2 fw-bold mb-2">
                <AlertTriangle size={20} />
                {formatNumber(preview.warningCount)} códigos con formato inusual
              </div>
              <p className="mb-3 small">Estas advertencias son informativas; los registros se importarán tal como aparecen.</p>
              <div className="table-responsive cie10-warning-table">
                <table className="table table-sm align-middle mb-0">
                  <thead><tr><th>Fila</th><th>Código</th><th>Advertencia</th></tr></thead>
                  <tbody>
                    {preview.warnings.map((warning) => (
                      <tr key={`${warning.row}-${warning.code}`}>
                        <td>{warning.row}</td>
                        <td><code>{warning.code}</code></td>
                        <td>{warning.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!result && (
            <div className="d-flex justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-success px-4"
                onClick={handleImport}
                disabled={loading !== null}
              >
                {loading === 'import' ? 'Importando...' : 'Confirmar e importar'}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="col-6 col-xl-3">
      <div className={`cie10-stat cie10-stat-${tone}`}>
        <span>{label}</span>
        <strong>{formatNumber(value)}</strong>
      </div>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-EC').format(value);
}

function formatBytes(value: number) {
  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}
