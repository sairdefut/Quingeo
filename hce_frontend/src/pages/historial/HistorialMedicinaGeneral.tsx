import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { HCE_MedicinaGeneral } from './components/medicina-general/MedicalGeneralTypes';
import { RegistroPrimeraAdmision } from './components/medicina-general/1_RegistroPrimeraAdmision';
import { MotivoConsulta } from './components/medicina-general/2_MotivoConsulta';
import { EnfermedadProblemaActual } from './components/medicina-general/3_EnfermedadProblemaActual';
import { AntecedentesPersonales } from './components/medicina-general/4_AntecedentesPersonales';
import { AntecedentesFamiliares } from './components/medicina-general/5_AntecedentesFamiliares';
import { SignosVitales } from './components/medicina-general/6_SignosVitalesAntropometria';
import { ExamenFisicoRegional } from './components/medicina-general/7_ExamenFisicoRegional';
import { Diagnostico } from './components/medicina-general/8_Diagnostico';
import { PlanTratamiento } from './components/medicina-general/9_PlanTratamiento';
import { buscarPacientePorCedula } from '../../services/dbPacienteService';

export default function HistorialMedicinaGeneral() {
    const { cedula } = useParams<{ cedula: string }>();
    const navigate = useNavigate();
    const [pacienteActual, setPacienteActual] = useState<any>(null);

    const [hce, setHce] = useState<HCE_MedicinaGeneral>({
        primeraAdmision: {
            institucion: 'MINISTERIO DE SALUD PUBLICA',
            unidadOperativa: '',
            codUO: '',
            canton: '',
            provincia: '',
            parroquia: '',
            numeroHistoria: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            primerNombre: '',
            segundoNombre: '',
            cedula: cedula || '',
            direccion: '',
            barrio: '',
            telefono: '',
            fechaNacimiento: '',
            nacionalidad: '',
            grupoCultural: '',
            edad: '',
            sexo: '',
            estadoCivil: '',
            fechaAdmision: new Date().toISOString().split('T')[0],
            ocupacion: '',
            empresa: '',
            seguroSalud: '',
            referidoDe: ''
        },
        motivoConsulta: '',
        enfermedadActual: '',
        antecedentesPersonales: '',
        antecedentesFamiliares: {
            cardiopatia: false, diabetes: false, enfVascular: false, hipertension: false, cancer: false, tuberculosis: false, enfInfecciosa: false, enfMental: false, otros: ''
        },
        signosVitales: { fecha: new Date().toISOString().split('T')[0], temperatura: '', presionArterial: '', pulso: '', frecuenciaResp: '', peso: '', talla: '' },
        examenFisicoRegional: { cabeza: '', cuello: '', torax: '', abdomen: '', pelvis: '', extremidades: '' },
        diagnosticos: [],
        planTratamiento: { indicaciones: '', fecha: new Date().toISOString().split('T')[0], hora: new Date().toLocaleTimeString().slice(0,5), profesional: '', codigo: '', firma: '' }
    });

    useEffect(() => {
        const cargarPaciente = async () => {
            if (!cedula) return;
            const encontrado = await buscarPacientePorCedula(cedula);
            if (encontrado) {
                setPacienteActual(encontrado);
                setHce(prev => ({
                    ...prev,
                    primeraAdmision: {
                        ...prev.primeraAdmision,
                        apellidoPaterno: encontrado.apellidos?.split(' ')[0] || '',
                        apellidoMaterno: encontrado.apellidos?.split(' ')[1] || '',
                        primerNombre: encontrado.nombres?.split(' ')[0] || '',
                        segundoNombre: encontrado.nombres?.split(' ')[1] || '',
                        cedula: encontrado.cedula || '',
                        direccion: encontrado.direccion || '',
                        telefono: encontrado.telefono || '',
                        fechaNacimiento: encontrado.fechaNacimiento || '',
                        sexo: encontrado.sexo === 'Masculino' ? 'H' : encontrado.sexo === 'Femenino' ? 'M' : ''
                    }
                }));
            }
        };
        cargarPaciente();
    }, [cedula]);

    const handleGuardar = async () => {
        // Aquí se implementaría la lógica para guardar en Dexie o API
        console.log("Guardando HCE Medicina General: ", hce);
        alert("Consulta de Medicina General guardada exitosamente (Simulación).");
        navigate('/pacientes/consulta');
    };

    return (
        <div className="container-fluid p-0 bg-light" style={{ height: '100vh', overflowY: 'auto' }}>
            <div className="bg-white text-dark p-3 border-bottom shadow-sm d-flex justify-content-between align-items-center sticky-top" style={{ zIndex: 1050 }}>
                <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                        <i className="bi bi-file-earmark-medical-fill text-success fs-4"></i>
                    </div>
                    <div>
                        <h4 className="m-0 fw-bold text-dark">HCE - Medicina General</h4>
                        <small className="text-muted">Formulario 001 - Paciente: {pacienteActual ? `${pacienteActual.nombres} ${pacienteActual.apellidos}` : cedula}</small>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary px-4 fw-bold shadow-sm" onClick={() => navigate(-1)}>
                        <i className="bi bi-x-lg me-2"></i>CANCELAR
                    </button>
                    <button className="btn btn-success px-4 fw-bold shadow-sm" onClick={handleGuardar}>
                        <i className="bi bi-save me-2"></i>GUARDAR HCE
                    </button>
                </div>
            </div>

            <div className="container-xl py-4">
                <RegistroPrimeraAdmision 
                    data={hce.primeraAdmision} 
                    onChange={(data) => setHce({ ...hce, primeraAdmision: data })} 
                />

                <div className="row">
                    <div className="col-md-6">
                        <MotivoConsulta 
                            value={hce.motivoConsulta} 
                            onChange={(val) => setHce({ ...hce, motivoConsulta: val })} 
                        />
                    </div>
                    <div className="col-md-6">
                        <EnfermedadProblemaActual 
                            value={hce.enfermedadActual} 
                            onChange={(val) => setHce({ ...hce, enfermedadActual: val })} 
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <AntecedentesPersonales 
                            value={hce.antecedentesPersonales} 
                            onChange={(val) => setHce({ ...hce, antecedentesPersonales: val })} 
                        />
                    </div>
                    <div className="col-md-6">
                        <AntecedentesFamiliares 
                            data={hce.antecedentesFamiliares} 
                            onChange={(data) => setHce({ ...hce, antecedentesFamiliares: data })} 
                        />
                    </div>
                </div>

                <SignosVitales 
                    data={hce.signosVitales} 
                    onChange={(data) => setHce({ ...hce, signosVitales: data })} 
                />

                <ExamenFisicoRegional 
                    data={hce.examenFisicoRegional} 
                    onChange={(data) => setHce({ ...hce, examenFisicoRegional: data })} 
                />

                <Diagnostico 
                    diagnosticos={hce.diagnosticos} 
                    onChange={(data) => setHce({ ...hce, diagnosticos: data })} 
                />

                <PlanTratamiento 
                    data={hce.planTratamiento} 
                    onChange={(data) => setHce({ ...hce, planTratamiento: data })} 
                />
            </div>
        </div>
    );
}
