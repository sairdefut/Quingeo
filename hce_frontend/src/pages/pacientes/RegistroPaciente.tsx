import { useState, useEffect } from 'react';
import { registrarPaciente } from "../../services/dbPacienteService";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useLocation } from "react-router-dom";
import ErrorBoundary from "../../ErrorBoundary";
import {
  obtenerCantones,
  obtenerEtnias,
  obtenerNivelesEducativos,
  obtenerParentescos,
  obtenerParroquias,
  obtenerProvincias,
  obtenerSexos,
  obtenerTiposSangre
} from "../../services/catalogService";
import { notifyError, notifySuccess, notifyWarning } from "../../services/notificationService";

function RegistroPacienteInner() {
  const [activeTab, setActiveTab] = useState<'identificacion' | 'filiacion'>('identificacion');
  const navigate = useNavigate();
  const { state } = useLocation();
  const pacienteEditar = state?.pacienteEditar;
  const [uuidOffline, setUuidOffline] = useState<string | undefined>(undefined);
  const [idPaciente, setIdPaciente] = useState<number | undefined>(undefined);

  // MODIFICACIÓN 1: El nombre se inicializa vacío y se carga del login
  const [nombreDoctor, setNombreDoctor] = useState("Cargando...");
  const [inicial, setInicial] = useState('D');

  useEffect(() => {
    const storedUser = localStorage.getItem('usuarioLogueado');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const nombreCompleto = userData.nombres && userData.apellidos 
        ? `${userData.nombres} ${userData.apellidos}` 
        : (userData.nombre || "Usuario");
      
      setNombreDoctor(nombreCompleto);
      setInicial(nombreCompleto.charAt(0).toUpperCase() || "D");
    }
  }, []);

  // ================= FUNCIÓN AUXILIAR: FECHA DE HOY =================
  const obtenerFechaHoy = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ================= FUNCIÓN AUXILIAR: VALIDAR CÉDULA ECUATORIANA =================
  const validarCedulaEcuatoriana = (cedula: string) => {
    if (cedula.length !== 10) return false;
    const digits = cedula.split('').map(Number);
    if (digits.some(isNaN)) return false;
    const provincia = Number(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;
    const digitoTercero = digits[2];
    if (digitoTercero >= 6) return false;
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let valor = digits[i] * coeficientes[i];
      if (valor >= 10) valor -= 9;
      suma += valor;
    }
    const digitoVerificadorCalculado = suma % 10 === 0 ? 0 : 10 - (suma % 10);
    return digitoVerificadorCalculado === digits[9];
  };

  // ================= 1. DATOS DE IDENTIFICACIÓN DEL PACIENTE =================
  void validarCedulaEcuatoriana;

  const [tipoIdentificacion, setTipoIdentificacion] = useState<'CEDULA' | 'EXTRANJERO'>('CEDULA');
  const [cedula, setCedula] = useState('');
  const [primerNombre, setPrimerNombre] = useState('');
  const [segundoNombre, setSegundoNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [fechaCreacion, setFechaCreacion] = useState(obtenerFechaHoy());
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [edad, setEdad] = useState<{ años: number; meses: number } | null>(null);
  const [mensajeEdad, setMensajeEdad] = useState('');
  const [sexo, setSexo] = useState('');
  const [grupoEtnico, setGrupoEtnico] = useState('');
  const [provincia, setProvincia] = useState('');
  const [canton, setCanton] = useState('');
  const [parroquia, setParroquia] = useState('');
  const [tipoSangre, setTipoSangre] = useState('');

  // ================= VALIDAR CÉDULA SEGÚN TIPO =================
  const validarCedula = (cedulaValor: string) => {
    if (tipoIdentificacion === 'EXTRANJERO') {
      return true; // Extranjero acepta cualquier valor
    }
    // Ecuatoriana: validar módulo 10
    if (cedulaValor.length !== 10) return false;
    const digits = cedulaValor.split('').map(Number);
    if (digits.some(isNaN)) return false;
    const provincia = Number(cedulaValor.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;
    const digitoTercero = digits[2];
    if (digitoTercero >= 6) return false;
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let valor = digits[i] * coeficientes[i];
      if (valor >= 10) valor -= 9;
      suma += valor;
    }
    const digitoVerificadorCalculado = suma % 10 === 0 ? 0 : 10 - (suma % 10);
    return digitoVerificadorCalculado === digits[9];
  };

  // ================= 2. DATOS DE FILIACIÓN (RESPONSABLE) =================
  const [primerNombreRes, setPrimerNombreRes] = useState('');
  const [segundoNombreRes, setSegundoNombreRes] = useState('');
  const [primerApellidoRes, setPrimerApellidoRes] = useState('');
  const [segundoApellidoRes, setSegundoApellidoRes] = useState('');
  const [provinciaRes, setProvinciaRes] = useState('');
  const [cantonRes, setCantonRes] = useState('');
  const [parroquiaRes, setParroquiaRes] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [domicilioActual, setDomicilioActual] = useState('');
  const [nivelEducativoResponsable, setNivelEducativoResponsable] = useState('');
  const [anioEscolar, setAnioEscolar] = useState('');

  // LÓGICA DE EDAD
  const manejarFechaNacimiento = (fecha: string) => {
    setFechaNacimiento(fecha);
    setMensajeEdad('');
    if (!fecha) { setEdad(null); return; }
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    if (nacimiento.getTime() > hoy.getTime()) {
      setEdad(null);
      setMensajeEdad("La fecha de nacimiento no puede ser mayor a la actual");
      return;
    }
    let anos = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) { anos--; meses += 12; }
    if (hoy.getDate() < nacimiento.getDate()) { meses--; }
    if (meses < 0) { meses += 12; }
    setEdad({ años: anos, meses: meses });
  };

  // LISTAS DESDE CATÁLOGOS LOCALES (MOVIDO ARRIBA PARA EVITAR TEMPORAL DEAD ZONE)
  const [provincias, setProvincias] = useState<any[]>([]);
  const [cantonesList, setCantonesList] = useState<any[]>([]);
  const [parroquiasList, setParroquiasList] = useState<any[]>([]);
  const [cantonesResList, setCantonesResList] = useState<any[]>([]);
  const [parroquiasResList, setParroquiasResList] = useState<any[]>([]);
  const [etnias, setEtnias] = useState<any[]>([]);
  const [sexos, setSexos] = useState<any[]>([]);
  const [tiposSangreList, setTiposSangreList] = useState<any[]>([]);
  const [parentescosList, setParentescosList] = useState<any[]>([]);
  const [nivelesEducativosList, setNivelesEducativosList] = useState<any[]>([]);

  const [formCargado, setFormCargado] = useState(false);

  // ====== EFECTO 1: Llenar campos básicos INMEDIATAMENTE cuando hay pacienteEditar ======
  useEffect(() => {
    if (!pacienteEditar) return;
    if (formCargado) return;
    setFormCargado(true);

    try {
      setUuidOffline(pacienteEditar.uuidOffline);
      setIdPaciente(pacienteEditar.idPaciente);
      setCedula(pacienteEditar.cedula || '');
      setTipoIdentificacion(pacienteEditar.tipoIdentificacion || 'CEDULA');

      const partsNombres = pacienteEditar.nombres?.trim().split(/\s+/) || [];
      setPrimerNombre(partsNombres[0] || '');
      setSegundoNombre(partsNombres.slice(1).join(' ') || '');

      const partsApellidos = pacienteEditar.apellidos?.trim().split(/\s+/) || [];
      setPrimerApellido(partsApellidos[0] || '');
      setSegundoApellido(partsApellidos.slice(1).join(' ') || '');

      setFechaNacimiento(pacienteEditar.fechaNacimiento || '');
      if (pacienteEditar.fechaNacimiento) manejarFechaNacimiento(pacienteEditar.fechaNacimiento);

      setSexo(pacienteEditar.sexo || '');
      setTipoSangre(pacienteEditar.tipoSangre || '');
      setAnioEscolar(pacienteEditar.anioEscolar?.trim() || '');
      // Grupo Étnico: usar el nombre guardado inmediatamente (el catálogo lo refinará si carga)
      setGrupoEtnico(pacienteEditar.grupoEtnico || '');

      // Filiación del tutor - campos de texto (no dependen de catálogos)
      const fil = pacienteEditar.filiacion;
      if (fil) {
        if (fil.primerNombre || fil.primerApellido) {
          setPrimerNombreRes(fil.primerNombre || '');
          setSegundoNombreRes(fil.segundoNombre || '');
          setPrimerApellidoRes(fil.primerApellido || '');
          setSegundoApellidoRes(fil.segundoApellido || '');
        } else if (fil.nombreResponsable) {
          const parts = fil.nombreResponsable.trim().split(/\s+/);
          setPrimerNombreRes(parts[0] || '');
          setPrimerApellidoRes(parts[1] || '');
          setSegundoApellidoRes(parts.slice(2).join(' ') || '');
        }
        setParentesco(fil.parentesco || '');
        setTelefonoContacto(fil.telefono || fil.telefonoContacto || '');
        setNivelEducativoResponsable(fil.nivelEducativo || fil.nivelEducativoResponsable || '');
        setDomicilioActual(fil.direccion || fil.domicilioActual || '');
      }
    } catch (error) {
      console.error("Error llenando campos básicos:", error);
    }
  }, [pacienteEditar, formCargado]);

  // ====== EFECTO 2: Resolver nombres de catálogos CUANDO ESTÉN LISTOS ======
  useEffect(() => {
    if (!pacienteEditar || !formCargado) return;
    // Solo correr cuando hay catálogos disponibles
    if (provincias.length === 0 && etnias.length === 0) return;

    try {
      // Grupo Étnico: buscar por ID primero, luego por nombre (case-insensitive)
      if (etnias.length > 0) {
        let etnia = null;
        if (pacienteEditar.idGrupoEtnico) {
          etnia = etnias.find((x: any) => Number(x.codigo) === Number(pacienteEditar.idGrupoEtnico));
        }
        if (!etnia && pacienteEditar.grupoEtnico) {
          etnia = etnias.find((x: any) => x.nombre?.toLowerCase() === pacienteEditar.grupoEtnico?.toLowerCase());
        }
        if (etnia) setGrupoEtnico(etnia.nombre);
        else if (pacienteEditar.grupoEtnico) {
           // Fallback en caso de que el ID no cruce pero tengamos un string aproximado
           const match = etnias.find(e => e.nombre.toLowerCase().includes(pacienteEditar.grupoEtnico.toLowerCase()));
           if(match) setGrupoEtnico(match.nombre);
        }
      }

      // Provincia del paciente
      if (provincias.length > 0) {
        const provPacId = pacienteEditar.idPrqCntProvincia;
        if (provPacId) {
          const provPac = provincias.find((x: any) => Number(x.codigo) === Number(provPacId));
          const provPacNombre = provPac ? provPac.nombre : '';
          setProvincia(prev => prev || provPacNombre);

          // Cargar cantones y parroquia del paciente
          obtenerCantones(String(provPacId)).then(cantones => {
            setCantonesList(cantones);
            const cantId = pacienteEditar.idPrqCanton;
            const cant = cantId ? cantones.find((x: any) => Number(x.codigo) === Number(cantId)) : null;
            if (cant) setCanton(prev => prev || cant.nombre);

            if (cantId) {
              obtenerParroquias(String(provPacId), String(cantId)).then(parrs => {
                setParroquiasList(parrs);
                const parrId = pacienteEditar.idParroquia;
                const parr = parrId ? parrs.find((x: any) => Number(x.codigo) === Number(parrId)) : null;
                if (parr) setParroquia(prev => prev || parr.nombre);
              });
            }
          });
        }

        // Provincia del tutor — IMPORTANTE: usar ID numérico primero, luego nombre
        const fil = pacienteEditar.filiacion;
        if (fil) {
          // Preferir campos ID numéricos; los campos de nombre son solo texto y no sirven para buscar
          const provResId = fil.idPrqCntProvincia || (typeof fil.provincia === 'number' ? fil.provincia : null);
          const provResNombre = typeof fil.provincia === 'string' ? fil.provincia : '';

          // Buscar provincia: primero por ID, luego por nombre
          let provRes = provResId
            ? provincias.find((x: any) => Number(x.codigo) === Number(provResId))
            : null;
          if (!provRes && provResNombre) {
            provRes = provincias.find((x: any) => x.nombre?.toLowerCase() === provResNombre.toLowerCase());
          }

          if (provRes) {
            setProvinciaRes(prev => prev || provRes!.nombre);

            obtenerCantones(String(provRes.codigo)).then(cantones => {
              setCantonesResList(cantones);

              const cantResId = fil.idPrqCanton || (typeof fil.canton === 'number' ? fil.canton : null);
              const cantResNombre = typeof fil.canton === 'string' ? fil.canton : '';

              // Buscar cantón: primero por ID, luego por nombre
              let cantRes = cantResId
                ? cantones.find((x: any) => Number(x.codigo) === Number(cantResId))
                : null;
              if (!cantRes && cantResNombre) {
                cantRes = cantones.find((x: any) => x.nombre?.toLowerCase() === cantResNombre.toLowerCase());
              }

              if (cantRes) {
                setCantonRes(prev => prev || cantRes!.nombre);

                obtenerParroquias(String(provRes!.codigo), String(cantRes.codigo)).then(parrs => {
                  setParroquiasResList(parrs);

                  const parrResId = fil.idParroquia || (typeof fil.parroquia === 'number' ? fil.parroquia : null);
                  const parrResNombre = typeof fil.parroquia === 'string' ? fil.parroquia : '';

                  // Buscar parroquia: primero por ID, luego por nombre
                  let parrRes = parrResId
                    ? parrs.find((x: any) => Number(x.codigo) === Number(parrResId))
                    : null;
                  if (!parrRes && parrResNombre) {
                    parrRes = parrs.find((x: any) => x.nombre?.toLowerCase() === parrResNombre.toLowerCase());
                  }

                  if (parrRes) setParroquiaRes(prev => prev || parrRes!.nombre);
                });
              }
            });
          }
        }
      }
    } catch (error) {
      console.error("Error resolviendo catálogos:", error);
    }
  }, [pacienteEditar, formCargado, provincias, etnias]);


  // LISTAS DESDE CATÁLOGOS LOCALES (MOVIDO ARRIBA)

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [provinciasApi, etniasApi] = await Promise.all([
          obtenerProvincias(),
          obtenerEtnias()
        ]);

        setProvincias(provinciasApi);
        setEtnias(etniasApi);
        setSexos(obtenerSexos());
        setTiposSangreList(obtenerTiposSangre());
        setParentescosList(obtenerParentescos());
        setNivelesEducativosList(obtenerNivelesEducativos());
      } catch (err) {
        console.error("Error cargando catálogos", err);
      }
    };
    cargarCatalogos();
  }, []);

  // ====== HANDLERS EXPLÍCITOS para cascada provincia→cantón→parroquia (sin useEffect) ======
  // Paciente
  const handleProvinciaChange = (nombre: string) => {
    setProvincia(nombre);
    setCanton('');
    setParroquia('');
    setCantonesList([]);
    setParroquiasList([]);
    const prov = provincias.find(p => p.nombre === nombre);
    if (prov) obtenerCantones(prov.codigo).then(setCantonesList).catch(console.error);
  };

  const handleCantonChange = (nombre: string) => {
    setCanton(nombre);
    setParroquia('');
    setParroquiasList([]);
    const prov = provincias.find(p => p.nombre === provincia);
    const cant = cantonesList.find(c => c.nombre === nombre);
    if (prov && cant) obtenerParroquias(prov.codigo, cant.codigo).then(setParroquiasList).catch(console.error);
  };

  // Tutor
  const handleProvinciaResChange = (nombre: string) => {
    setProvinciaRes(nombre);
    setCantonRes('');
    setParroquiaRes('');
    setCantonesResList([]);
    setParroquiasResList([]);
    const prov = provincias.find(p => p.nombre === nombre);
    if (prov) obtenerCantones(prov.codigo).then(setCantonesResList).catch(console.error);
  };

  const handleCantonResChange = (nombre: string) => {
    setCantonRes(nombre);
    setParroquiaRes('');
    setParroquiasResList([]);
    const prov = provincias.find(p => p.nombre === provinciaRes);
    const cant = cantonesResList.find(c => c.nombre === nombre);
    if (prov && cant) obtenerParroquias(prov.codigo, cant.codigo).then(setParroquiasResList).catch(console.error);
  };

  // VALIDACIÓN
  const [errores, setErrores] = useState<Record<string, string>>({});
  const validarFormulario = () => {
    const e: any = {};

    // Validación de Identificación
    if (!cedula.trim()) e.cedula = 'Requerido';
    else if (!validarCedula(cedula)) e.cedula = tipoIdentificacion === 'EXTRANJERO' ? 'Requerido' : 'Cédula inválida';
    if (!primerNombre.trim()) e.primerNombre = 'Requerido';
    if (!primerApellido.trim()) e.primerApellido = 'Requerido';
    if (!fechaNacimiento) e.fechaNacimiento = 'Requerido';
    if (mensajeEdad) e.edad = mensajeEdad;
    if (!sexo) e.sexo = 'Requerido';
    if (!provincia) e.provincia = 'Requerido';
    if (!canton) e.canton = 'Requerido';

    // Validación de Filiación y Contacto
    if (!primerNombreRes.trim()) e.primerNombreRes = 'Requerido';
    if (!primerApellidoRes.trim()) e.primerApellidoRes = 'Requerido';
    if (!parentesco) e.parentesco = 'Requerido';
    if (!telefonoContacto.trim()) e.telefonoContacto = 'Requerido';
    else if (telefonoContacto.length !== 10) e.telefonoContacto = 'Debe tener 10 dígitos';

    setErrores(e);
    return {
      valido: Object.keys(e).length === 0,
      erroresActuales: e
    };
  };

  const [guardando, setGuardando] = useState(false);

  const handleGuardarPaciente = async () => {
    if (guardando) return; // Prevenir doble clic

    const { valido, erroresActuales } = validarFormulario();

    if (!valido) {
      // Determinar en qué pestaña están los errores
      const tieneErroresIdentificacion = erroresActuales.cedula || erroresActuales.primerNombre || erroresActuales.primerApellido || erroresActuales.fechaNacimiento || erroresActuales.sexo || erroresActuales.provincia || erroresActuales.canton;
      const tieneErroresFiliacion = erroresActuales.primerNombreRes || erroresActuales.primerApellidoRes || erroresActuales.parentesco || erroresActuales.telefonoContacto;

      if (tieneErroresIdentificacion && activeTab !== 'identificacion') {
        setActiveTab('identificacion');
        notifyWarning("Por favor complete todos los campos obligatorios en la pestaña 'Datos de Identificación'.");
      } else if (tieneErroresFiliacion && activeTab !== 'filiacion') {
        setActiveTab('filiacion');
        notifyWarning("Por favor complete todos los campos obligatorios en la pestaña 'Filiación y Contacto'.");
      } else if (erroresActuales.cedula === 'Cédula inválida') {
        notifyError("Error: Cédula del paciente inválida.");
      } else if (mensajeEdad) {
        notifyError("Error: " + mensajeEdad);
      } else {
        notifyWarning("Por favor complete todos los campos obligatorios marcados con *");
      }
      return;
    }

    setGuardando(true);

    const nuevoId = uuidOffline || uuidv4();
    const nombresPaciente = `${primerNombre.trim()} ${segundoNombre.trim()}`.trim();
    const apellidosPaciente = `${primerApellido.trim()} ${segundoApellido.trim()}`.trim();
    const nombresResponsable = `${primerNombreRes.trim()} ${segundoNombreRes.trim()}`.trim();
    const apellidosResponsable = `${primerApellidoRes.trim()} ${segundoApellidoRes.trim()}`.trim();
    const nombreCompletoResponsable = `${nombresResponsable} ${apellidosResponsable}`.trim();
    const provinciaSeleccionada = provincias.find(p => p.nombre === provincia);
    const cantonSeleccionado = cantonesList.find(c => c.nombre === canton);
    const parroquiaSeleccionada = parroquiasList.find(p => p.nombre === parroquia);
    const etniaSeleccionada = etnias.find(e => e.nombre === grupoEtnico);
    const provinciaResSeleccionada = provincias.find(p => p.nombre === provinciaRes);
    const cantonResSeleccionado = cantonesResList.find(c => c.nombre === cantonRes);
    const parroquiaResSeleccionada = parroquiasResList.find(p => p.nombre === parroquiaRes);

    const paciente = {
      id: nuevoId,
      cedula, tipoIdentificacion, nombres: nombresPaciente, apellidos: apellidosPaciente,
      fechaCreacion, fechaNacimiento,
      edad: edad ? `${edad.años} años, ${edad.meses} meses` : '',
      sexo, grupoEtnico, provincia, canton, parroquia, tipoSangre,
      idGrupoEtnico: etniaSeleccionada?.codigo ? Number(etniaSeleccionada.codigo) : undefined,
      idPrqCntProvincia: provinciaSeleccionada?.codigo ? Number(provinciaSeleccionada.codigo) : undefined,
      idPrqCanton: cantonSeleccionado?.codigo ? Number(cantonSeleccionado.codigo) : undefined,
      idParroquia: parroquiaSeleccionada?.codigo ? Number(parroquiaSeleccionada.codigo) : undefined,
      anioEscolar: (edad && edad.años < 25) ? anioEscolar : null,
      uuidOffline: nuevoId,
      idPaciente: idPaciente,
      filiacion: {
        nombreResponsable: nombreCompletoResponsable,
        primerNombre: primerNombreRes.trim(),
        segundoNombre: segundoNombreRes.trim(),
        primerApellido: primerApellidoRes.trim(),
        segundoApellido: segundoApellidoRes.trim(),
        parentesco, telefonoContacto, nivelEducativoResponsable,
        domicilioActual, provincia: provinciaRes, canton: cantonRes, parroquia: parroquiaRes,
        idPrqCntProvincia: provinciaResSeleccionada?.codigo ? Number(provinciaResSeleccionada.codigo) : undefined,
        idPrqCanton: cantonResSeleccionado?.codigo ? Number(cantonResSeleccionado.codigo) : undefined,
        idParroquia: parroquiaResSeleccionada?.codigo ? Number(parroquiaResSeleccionada.codigo) : undefined
      },
      historiaClinica: []
    };
    try {
      await registrarPaciente(paciente as any);
      notifySuccess('Paciente guardado exitosamente.');
      navigate('/pacientes/consulta');
    } catch (err: any) {
      notifyError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h4 className="text-primary m-0"><i className="bi bi-person-lines-fill me-2"></i> Registro de Historia Clínica Pediátrica</h4>
        <div className="d-flex align-items-center bg-white px-3 py-2 rounded shadow-sm border">
          <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-2 fw-bold" style={{ width: '35px', height: '35px' }}>
            {inicial}
          </div>
          <div className="lh-1">
            <small className="d-block text-muted" style={{ fontSize: '0.65rem' }}>Profesional</small>
            <span className="fw-bold text-dark small">{nombreDoctor}</span>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item"><button className={`nav-link ${activeTab === 'identificacion' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('identificacion')}>1. Datos de Identificación</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'filiacion' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('filiacion')}>2. Filiación y Contacto</button></li>
      </ul>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          {activeTab === 'identificacion' && (
            <div className="row g-3">
              <div className="col-12"><h6 className="text-muted border-bottom pb-2">Datos Personales del Paciente</h6></div>
              <div className="col-md-4">
                <label className="form-label fw-bold small text-primary">TIPO DE IDENTIFICACIÓN</label>
                <select className="form-select" value={tipoIdentificacion} onChange={e => { setTipoIdentificacion(e.target.value as 'CEDULA' | 'EXTRANJERO'); setCedula(''); }}>
                  <option value="CEDULA">CÉDULA ECUATORIANA</option>
                  <option value="EXTRANJERO">PASAPORTE / IDENTIFICACIÓN EXTRANJERA</option>
                </select>
              </div>
              <div className="col-md-8">
                <label className="form-label fw-bold small text-primary">{tipoIdentificacion === 'CEDULA' ? 'NÚMERO DE CÉDULA' : 'NÚMERO DE IDENTIFICACIÓN'}</label>
                <input type="text" maxLength={20} className={`form-control ${errores.cedula ? 'is-invalid' : ''}`} value={cedula} onChange={e => { if (tipoIdentificacion === 'EXTRANJERO' || /^\d*$/.test(e.target.value)) setCedula(e.target.value); }} placeholder={tipoIdentificacion === 'CEDULA' ? 'Ingrese los 10 dígitos' : 'Ingrese número de identificación'} />
                {errores.cedula && <div className="invalid-feedback">{errores.cedula}</div>}
              </div>
              <div className="col-md-3"><label className="form-label fw-bold small">PRIMER NOMBRE <span className="text-danger">*</span></label><input className={`form-control ${errores.primerNombre ? 'is-invalid' : ''}`} value={primerNombre} onChange={e => { if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(e.target.value)) setPrimerNombre(e.target.value); }} /></div>
              <div className="col-md-3"><label className="form-label fw-bold small">SEGUNDO NOMBRE</label><input className="form-control" value={segundoNombre} onChange={e => { if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(e.target.value)) setSegundoNombre(e.target.value); }} placeholder="(Opcional)" /></div>
              <div className="col-md-3"><label className="form-label fw-bold small">PRIMER APELLIDO <span className="text-danger">*</span></label><input className={`form-control ${errores.primerApellido ? 'is-invalid' : ''}`} value={primerApellido} onChange={e => { if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(e.target.value)) setPrimerApellido(e.target.value); }} /></div>
              <div className="col-md-3"><label className="form-label fw-bold small">SEGUNDO APELLIDO</label><input className="form-control" value={segundoApellido} onChange={e => { if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(e.target.value)) setSegundoApellido(e.target.value); }} placeholder="(Opcional)" /></div>
              <div className="col-md-4"><label className="form-label fw-bold small">Fecha de Creación</label><input type="date" className={`form-control ${errores.fechaCreacion ? 'is-invalid' : ''}`} value={fechaCreacion} onChange={e => setFechaCreacion(e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label fw-bold small">Fecha de Nacimiento</label><input type="date" className={`form-control ${errores.fechaNacimiento ? 'is-invalid' : ''}`} value={fechaNacimiento} onChange={e => manejarFechaNacimiento(e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label fw-bold small">Edad</label><input className={`form-control ${mensajeEdad ? 'is-invalid' : 'bg-light'}`} disabled value={mensajeEdad ? mensajeEdad : (edad ? `${edad.años} años, ${edad.meses} meses` : 'Seleccione fecha...')} style={{ fontWeight: 'bold', color: mensajeEdad ? '#dc3545' : '#0d6efd', fontSize: mensajeEdad ? '0.8rem' : '1rem' }} /></div>
              {(!edad || edad.años < 25) && (
                <div className="col-md-4"><label className="form-label fw-bold small">Año Escolar</label><select className="form-select" value={anioEscolar} onChange={e => setAnioEscolar(e.target.value)}><option value="">Seleccione...</option><option value="Inicial 1">Inicial 1</option><option value="Inicial 2">Inicial 2</option><option value="1ro Básica">1ro Básica</option><option value="2do Básica">2do Básica</option><option value="3ro Básica">3ro Básica</option><option value="4to Básica">4to Básica</option><option value="5to Básica">5to Básica</option><option value="6to Básica">6to Básica</option><option value="7mo Básica">7mo Básica</option><option value="8vo Básica">8vo Básica</option><option value="9no Básica">9no Básica</option><option value="10mo Básica">10mo Básica</option><option value="1ro Bachillerato">1ro Bachillerato</option><option value="2do Bachillerato">2do Bachillerato</option><option value="3ro Bachillerato">3ro Bachillerato</option><option value="Universidad">Universidad</option><option value="No aplica">No aplica</option></select></div>
              )}
              <div className="col-md-4"><label className="form-label fw-bold small">Sexo</label><select className="form-select" value={sexo} onChange={e => setSexo(e.target.value)}><option value="">Seleccione...</option>{sexos.map(s => <option key={s.codigo} value={s.nombre}>{s.nombre}</option>)}</select></div>
              <div className="col-md-4"><label className="form-label fw-bold small">Tipo de Sangre</label><select className="form-select" value={tipoSangre} onChange={e => setTipoSangre(e.target.value)}><option value="">Seleccione...</option>{tiposSangreList.length > 0 ? tiposSangreList.map(t => <option key={t.codigo} value={t.nombre}>{t.nombre}</option>) : <><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></>}</select></div>
              <div className="col-md-4"><label className="form-label fw-bold small">Grupo Étnico</label><select className="form-select" value={grupoEtnico} onChange={e => setGrupoEtnico(e.target.value)}><option value="">Seleccione...</option>{etnias.length > 0 ? etnias.map(e => <option key={e.codigo} value={e.nombre}>{e.nombre}</option>) : <><option value="Mestizo">Mestizo</option><option value="Blanco">Blanco</option><option value="Indígena">Indígena</option><option value="Afroecuatoriano">Afroecuatoriano</option></>}</select></div>
              <div className="col-12 mt-4"><h6 className="text-muted border-bottom pb-2">Ubicación Geográfica del Paciente</h6></div>
              <div className="col-md-4"><label className="form-label fw-bold small">Provincia</label><select className="form-select" value={provincia} onChange={e => handleProvinciaChange(e.target.value)}><option value="">Seleccione...</option>{provincias.map(p => <option key={p.codigo} value={p.nombre}>{p.nombre}</option>)}</select></div>
              <div className="col-md-4"><label className="form-label fw-bold small">Cantón</label><select className="form-select" value={canton} onChange={e => handleCantonChange(e.target.value)} disabled={!provincia}><option value="">Seleccione...</option>{cantonesList.map(c => <option key={c.codigo} value={c.nombre}>{c.nombre}</option>)}</select></div>
              <div className="col-md-4"><label className="form-label fw-bold small">Parroquia</label><select className="form-select" value={parroquia} onChange={e => setParroquia(e.target.value)} disabled={!canton}><option value="">Seleccione...</option>{parroquiasList.map(p => <option key={p.codigo} value={p.nombre}>{p.nombre}</option>)}</select></div>
            </div>
          )}
          {activeTab === 'filiacion' && (
            <div className="row g-3">

              <div className="col-12"><h6 className="text-muted border-bottom pb-2">Datos del Responsable / Tutor</h6></div>
              <div className="col-md-3"><label className="form-label fw-bold small">PRIMER NOMBRE <span className="text-danger">*</span></label><input className={`form-control ${errores.primerNombreRes ? 'is-invalid' : ''}`} value={primerNombreRes} onChange={e => { if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(e.target.value)) setPrimerNombreRes(e.target.value); }} placeholder="Ej: Maria" /></div>
              <div className="col-md-3"><label className="form-label fw-bold small">SEGUNDO NOMBRE</label><input className="form-control" value={segundoNombreRes} onChange={e => { if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(e.target.value)) setSegundoNombreRes(e.target.value); }} placeholder="(Opcional)" /></div>
              <div className="col-md-3"><label className="form-label fw-bold small">PRIMER APELLIDO <span className="text-danger">*</span></label><input className={`form-control ${errores.primerApellidoRes ? 'is-invalid' : ''}`} value={primerApellidoRes} onChange={e => { if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(e.target.value)) setPrimerApellidoRes(e.target.value); }} placeholder="Ej: Lopez" /></div>
              <div className="col-md-3"><label className="form-label fw-bold small">SEGUNDO APELLIDO</label><input className="form-control" value={segundoApellidoRes} onChange={e => { if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(e.target.value)) setSegundoApellidoRes(e.target.value); }} placeholder="(Opcional)" /></div>
              <div className="col-md-4"><label className="form-label fw-bold small">Parentesco con el Paciente <span className="text-danger">*</span></label><select className={`form-select ${errores.parentesco ? 'is-invalid' : ''}`} value={parentesco} onChange={e => setParentesco(e.target.value)}><option value="">Seleccione...</option>{parentescosList.map(p => <option key={p.codigo} value={p.nombre}>{p.nombre}</option>)}</select></div>
              <div className="col-md-4"><label className="form-label fw-bold small">Teléfono (Celular) <span className="text-danger">*</span></label><input type="text" maxLength={10} className={`form-control ${errores.telefonoContacto ? 'is-invalid' : ''}`} value={telefonoContacto} onChange={e => { if (/^\d*$/.test(e.target.value)) setTelefonoContacto(e.target.value); }} placeholder="09XXXXXXXX" /><div className="form-text small">Máximo 10 dígitos.</div></div>
              <div className="col-md-4"><label className="form-label fw-bold small">Nivel Educativo</label><select className="form-select" value={nivelEducativoResponsable} onChange={e => setNivelEducativoResponsable(e.target.value)}><option value="">Seleccione...</option>{nivelesEducativosList.map(n => <option key={n.codigo} value={n.nombre}>{n.nombre}</option>)}</select></div>
              <div className="col-12 mt-3"><h6 className="text-muted border-bottom pb-2">Ubicación del Responsable</h6></div>
              <div className="col-md-4"><label className="form-label fw-bold small">Provincia</label><select className="form-select" value={provinciaRes} onChange={e => handleProvinciaResChange(e.target.value)}><option value="">Seleccione...</option>{provincias.map(p => <option key={p.codigo} value={p.nombre}>{p.nombre}</option>)}</select></div>
              <div className="col-md-4"><label className="form-label fw-bold small">Cantón</label><select className="form-select" value={cantonRes} onChange={e => handleCantonResChange(e.target.value)} disabled={!provinciaRes}><option value="">Seleccione...</option>{cantonesResList.map(c => <option key={c.codigo} value={c.nombre}>{c.nombre}</option>)}</select></div>
              <div className="col-md-4"><label className="form-label fw-bold small">Parroquia</label><select className="form-select" value={parroquiaRes} onChange={e => setParroquiaRes(e.target.value)} disabled={!cantonRes}><option value="">Seleccione...</option>{parroquiasResList.map(p => <option key={p.codigo} value={p.nombre}>{p.nombre}</option>)}</select></div>
              <div className="col-12"><label className="form-label fw-bold small">Dirección Domiciliaria (Calle y Nro)</label><textarea className="form-control" rows={2} value={domicilioActual} onChange={e => setDomicilioActual(e.target.value)} placeholder="Ej: Calle Larga y Benigno Malo..."></textarea></div>
            </div>
          )}
        </div>
        <div className="card-footer bg-white text-end py-3">
          <button className="btn btn-primary px-4 fw-bold" onClick={handleGuardarPaciente}><i className="bi bi-save me-2"></i> {pacienteEditar ? 'GUARDAR CAMBIOS' : 'GUARDAR PACIENTE'}</button>
        </div>
      </div>
    </>
  );
}

export default function RegistroPaciente() {
  return (
    <ErrorBoundary>
      <RegistroPacienteInner />
    </ErrorBoundary>
  );
}
