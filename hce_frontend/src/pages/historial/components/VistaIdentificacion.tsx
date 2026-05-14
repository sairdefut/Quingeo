export const VistaIdentificacion = ({ cedula, paciente }: any) => (
    <div className="card mb-4 border-0 shadow-sm bg-white rounded-4 overflow-hidden">
        <div className="card-body p-4">
            <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                <div className="bg-primary bg-opacity-10 rounded p-2 me-3">
                    <i className="bi bi-person-badge fs-5 text-primary"></i>
                </div>
                <h6 className="text-dark m-0 fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Expediente Clínico</h6>
            </div>
            <div className="row g-3 px-2">
                <div className="col-md-3">
                    <span className="text-muted small text-uppercase fw-bold" style={{fontSize: "0.7rem"}}>Cédula</span><br/>
                    <span className="fs-6 fw-medium text-dark">{cedula}</span>
                </div>
                <div className="col-md-3">
                    <span className="text-muted small text-uppercase fw-bold" style={{fontSize: "0.7rem"}}>Nombres</span><br/>
                    <span className="fs-6 fw-medium text-dark">{paciente?.nombres || "—"}</span>
                </div>
                <div className="col-md-3">
                    <span className="text-muted small text-uppercase fw-bold" style={{fontSize: "0.7rem"}}>Apellidos</span><br/>
                    <span className="fs-6 fw-medium text-dark">{paciente?.apellidos || "—"}</span>
                </div>
                <div className="col-md-3">
                    <span className="text-muted small text-uppercase fw-bold" style={{fontSize: "0.7rem"}}>Fecha de Nacimiento</span><br/>
                    <span className="fs-6 fw-medium text-dark">{paciente?.fechaNacimiento || "—"}</span>
                </div>
            </div>
        </div>
    </div>
);
