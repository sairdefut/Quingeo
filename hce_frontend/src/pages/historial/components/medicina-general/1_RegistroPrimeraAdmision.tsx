import React from 'react';
import type { DatosPrimeraAdmision } from './MedicalGeneralTypes';

interface Props {
    data: DatosPrimeraAdmision;
    onChange: (data: DatosPrimeraAdmision) => void;
}

export const RegistroPrimeraAdmision: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onChange({ ...data, [name]: value });
    };

    return (
        <div className="card shadow-sm mb-4 border-0">
            <div className="card-header bg-primary text-white py-3">
                <h5 className="mb-0 fw-bold">1. REGISTRO DE PRIMERA ADMISIÓN</h5>
            </div>
            <div className="card-body">
                {/* Cabecera del formulario (Institución, Unidad, etc) */}
                <div className="row g-3 mb-4 border-bottom pb-4">
                    <div className="col-md-3">
                        <label className="form-label text-muted small fw-bold">INSTITUCIÓN DEL SISTEMA</label>
                        <input type="text" className="form-control form-control-sm" name="institucion" value={data.institucion} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label text-muted small fw-bold">UNIDAD OPERATIVA</label>
                        <input type="text" className="form-control form-control-sm" name="unidadOperativa" value={data.unidadOperativa} onChange={handleChange} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label text-muted small fw-bold">COD. UO</label>
                        <input type="text" className="form-control form-control-sm" name="codUO" value={data.codUO} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label text-muted small fw-bold">NÚMERO DE HISTORIA CLÍNICA</label>
                        <input type="text" className="form-control form-control-sm fw-bold text-primary" name="numeroHistoria" value={data.numeroHistoria} onChange={handleChange} />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label text-muted small fw-bold">PARROQUIA</label>
                        <input type="text" className="form-control form-control-sm" name="parroquia" value={data.parroquia} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label text-muted small fw-bold">CANTÓN</label>
                        <input type="text" className="form-control form-control-sm" name="canton" value={data.canton} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label text-muted small fw-bold">PROVINCIA</label>
                        <input type="text" className="form-control form-control-sm" name="provincia" value={data.provincia} onChange={handleChange} />
                    </div>
                </div>

                {/* Datos del Paciente */}
                <div className="row g-3 mb-4 border-bottom pb-4">
                    <div className="col-md-3">
                        <label className="form-label small fw-bold">APELLIDO PATERNO</label>
                        <input type="text" className="form-control form-control-sm" name="apellidoPaterno" value={data.apellidoPaterno} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold">APELLIDO MATERNO</label>
                        <input type="text" className="form-control form-control-sm" name="apellidoMaterno" value={data.apellidoMaterno} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold">PRIMER NOMBRE</label>
                        <input type="text" className="form-control form-control-sm" name="primerNombre" value={data.primerNombre} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold">SEGUNDO NOMBRE</label>
                        <input type="text" className="form-control form-control-sm" name="segundoNombre" value={data.segundoNombre} onChange={handleChange} />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label small fw-bold">N° CÉDULA DE CIUDADANÍA</label>
                        <input type="text" className="form-control form-control-sm" name="cedula" value={data.cedula} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label small fw-bold">DIRECCIÓN (CALLE Y N° - MANZANA Y BARRIO)</label>
                        <input type="text" className="form-control form-control-sm" name="direccion" value={data.direccion} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold">N° TELÉFONO</label>
                        <input type="text" className="form-control form-control-sm" name="telefono" value={data.telefono} onChange={handleChange} />
                    </div>

                    <div className="col-md-2">
                        <label className="form-label small fw-bold">FECHA NACIMIENTO</label>
                        <input type="date" className="form-control form-control-sm" name="fechaNacimiento" value={data.fechaNacimiento} onChange={handleChange} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">NACIONALIDAD</label>
                        <input type="text" className="form-control form-control-sm" name="nacionalidad" value={data.nacionalidad} onChange={handleChange} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">GRUPO CULTURAL</label>
                        <input type="text" className="form-control form-control-sm" name="grupoCultural" value={data.grupoCultural} onChange={handleChange} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">EDAD</label>
                        <input type="text" className="form-control form-control-sm" name="edad" value={data.edad} onChange={handleChange} />
                    </div>
                    
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">SEXO</label>
                        <select className="form-select form-select-sm" name="sexo" value={data.sexo} onChange={handleChange}>
                            <option value=""></option>
                            <option value="H">H</option>
                            <option value="M">M</option>
                        </select>
                    </div>

                    <div className="col-md-2">
                        <label className="form-label small fw-bold">ESTADO CIVIL</label>
                        <select className="form-select form-select-sm" name="estadoCivil" value={data.estadoCivil} onChange={handleChange}>
                            <option value=""></option>
                            <option value="SOL">SOL</option>
                            <option value="CAS">CAS</option>
                            <option value="DIV">DIV</option>
                            <option value="VIU">VIU</option>
                            <option value="U-L">U-L</option>
                        </select>
                    </div>
                </div>

                {/* Datos de Admisión */}
                <div className="row g-3">
                    <div className="col-md-3">
                        <label className="form-label small fw-bold">FECHA DE ADMISIÓN</label>
                        <input type="date" className="form-control form-control-sm" name="fechaAdmision" value={data.fechaAdmision} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold">OCUPACIÓN</label>
                        <input type="text" className="form-control form-control-sm" name="ocupacion" value={data.ocupacion} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold">EMPRESA DONDE TRABAJA</label>
                        <input type="text" className="form-control form-control-sm" name="empresa" value={data.empresa} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold">TIPO DE SEGURO DE SALUD</label>
                        <input type="text" className="form-control form-control-sm" name="seguroSalud" value={data.seguroSalud} onChange={handleChange} />
                    </div>
                    <div className="col-md-12">
                        <label className="form-label small fw-bold">REFERIDO DE:</label>
                        <input type="text" className="form-control form-control-sm" name="referidoDe" value={data.referidoDe} onChange={handleChange} />
                    </div>
                </div>
            </div>
        </div>
    );
};
