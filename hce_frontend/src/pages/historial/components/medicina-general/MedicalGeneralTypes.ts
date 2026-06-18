export interface DatosPrimeraAdmision {
    institucion: string;
    unidadOperativa: string;
    codUO: string;
    canton: string;
    provincia: string;
    parroquia: string;
    numeroHistoria: string;
    
    apellidoPaterno: string;
    apellidoMaterno: string;
    primerNombre: string;
    segundoNombre: string;
    cedula: string;
    direccion: string; // CALLE Y N - MANZANA Y
    barrio: string;
    telefono: string;
    fechaNacimiento: string;
    nacionalidad: string;
    grupoCultural: string;
    edad: string;
    sexo: 'H' | 'M' | '';
    estadoCivil: 'SOL' | 'CAS' | 'DIV' | 'VIU' | 'U-L' | '';
    fechaAdmision: string;
    ocupacion: string;
    empresa: string;
    seguroSalud: string;
    referidoDe: string;
}

export interface AntecedentesFamiliares {
    cardiopatia: boolean;
    diabetes: boolean;
    enfVascular: boolean;
    hipertension: boolean;
    cancer: boolean;
    tuberculosis: boolean;
    enfInfecciosa: boolean;
    enfMental: boolean;
    otros: string;
}

export interface SignosVitales {
    fecha: string;
    temperatura: string;
    presionArterial: string;
    pulso: string;
    frecuenciaResp: string;
    peso: string;
    talla: string;
}

export interface ExamenFisicoRegional {
    cabeza: string;
    cuello: string;
    torax: string;
    abdomen: string;
    pelvis: string;
    extremidades: string;
}

export interface DiagnosticoItem {
    id: string;
    descripcion: string;
    cie10: string;
    tipo: 'PRESUNTIVO' | 'DEFINITIVO' | '';
}

export interface TratamientoPlan {
    indicaciones: string;
    fecha: string;
    hora: string;
    profesional: string;
    codigo: string;
    firma: string;
}

export interface HCE_MedicinaGeneral {
    primeraAdmision: DatosPrimeraAdmision;
    motivoConsulta: string;
    enfermedadActual: string;
    antecedentesPersonales: string;
    antecedentesFamiliares: AntecedentesFamiliares;
    signosVitales: SignosVitales;
    examenFisicoRegional: ExamenFisicoRegional;
    diagnosticos: DiagnosticoItem[];
    planTratamiento: TratamientoPlan;
}
