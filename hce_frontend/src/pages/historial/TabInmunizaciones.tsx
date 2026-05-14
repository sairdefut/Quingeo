const VACUNAS_MSP = [
    'Hepatitis B',
    'BCG',
    'Rotavirus',
    'Pentavalente',
    'Neumococo',
    'IPV',
    'OPV',
    'SRP',
    'Varicela',
    'DPT',
    'Fiebre Amarilla',
    'VPH',
    'Influenza'
];

type EstadoVacuna = 'Falta' | 'Aplicada';

export const TabInmunizaciones = ({
    isAntBlocked,
    estadoVacunacion,
    setEstadoVacunacion,
    vacunasFaltantes,
    setVacunasFaltantes
}: any) => {
    const actualizarVacuna = (vacuna: string, estado: EstadoVacuna) => {
        setVacunasFaltantes({
            ...(vacunasFaltantes || {}),
            [vacuna]: estado
        });
    };

    return (
        <div className="mb-3 w-100">
            <h6 className="text-primary border-bottom pb-2">Inmunizaciones</h6>
            <label className="mb-2 d-block small">Estado de Vacunación según esquema nacional</label>
            <select className="form-select w-100" disabled={isAntBlocked} value={estadoVacunacion} onChange={e => setEstadoVacunacion(e.target.value)}>
                <option value="">Seleccione...</option>
                <option>Completo para la edad</option>
                <option>Incompleto</option>
                <option>No vacunado</option>
            </select>

            {estadoVacunacion === 'Incompleto' && (
                <div className="mt-3 border rounded bg-light p-3">
                    <div className="small fw-bold text-secondary mb-2">Vacunas del esquema MSP Ecuador</div>
                    <div className="row g-2">
                        {VACUNAS_MSP.map((vacuna) => {
                            const vacunaId = vacuna.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                            return (
                                <div className="col-12 col-md-6 col-xl-4" key={vacuna}>
                                    <div className="bg-white border rounded p-2 h-100">
                                        <div className="small fw-bold mb-2">{vacuna}</div>
                                        <div className="btn-group btn-group-sm w-100" role="group" aria-label={`Estado ${vacuna}`}>
                                            {(['Falta', 'Aplicada'] as EstadoVacuna[]).map((estado) => (
                                                <input
                                                    key={estado}
                                                    type="radio"
                                                    className="btn-check"
                                                    name={`vacuna-${vacunaId}`}
                                                    id={`vacuna-${vacunaId}-${estado}`}
                                                    disabled={isAntBlocked}
                                                    checked={(vacunasFaltantes || {})[vacuna] === estado}
                                                    onChange={() => actualizarVacuna(vacuna, estado)}
                                                />
                                            ))}
                                            <label className="btn btn-outline-danger" htmlFor={`vacuna-${vacunaId}-Falta`}>Falta</label>
                                            <label className="btn btn-outline-success" htmlFor={`vacuna-${vacunaId}-Aplicada`}>Aplicada</label>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
