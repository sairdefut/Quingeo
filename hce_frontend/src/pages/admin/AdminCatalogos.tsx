import { useState } from 'react';
import { BookOpenCheck, MapPinned } from 'lucide-react';
import AdminCie10 from './AdminCie10';
import AdminUbicaciones from './AdminUbicaciones';
import './AdminCie10.css';

export default function AdminCatalogos() {
  const [tab, setTab] = useState<'cie10' | 'ubicaciones'>('cie10');

  return (
    <div className="cie10-page container-fluid py-2">
      <div className="cie10-heading mb-4">
        <div>
          <span className="cie10-eyebrow">Administración</span>
          <h2 className="fw-bold mb-2">Configuración de catálogos</h2>
          <p className="text-muted mb-0">Previsualice y actualice los catálogos maestros del sistema.</p>
        </div>
        <BookOpenCheck size={44} aria-hidden="true" />
      </div>

      <div className="catalog-tabs mb-4" role="tablist" aria-label="Catálogos disponibles">
        <button className={tab === 'cie10' ? 'active' : ''} onClick={() => setTab('cie10')} type="button">
          <BookOpenCheck size={19} /> CIE-10
        </button>
        <button className={tab === 'ubicaciones' ? 'active' : ''} onClick={() => setTab('ubicaciones')} type="button">
          <MapPinned size={19} /> Ubicaciones geográficas
        </button>
      </div>

      {tab === 'cie10' ? <AdminCie10 embedded /> : <AdminUbicaciones />}
    </div>
  );
}
