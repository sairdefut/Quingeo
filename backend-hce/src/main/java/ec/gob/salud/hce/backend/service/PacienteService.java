package ec.gob.salud.hce.backend.service;

import ec.gob.salud.hce.backend.dto.PacienteRequestDTO;
import ec.gob.salud.hce.backend.dto.TutorDTO;
import ec.gob.salud.hce.backend.entity.Paciente;
import ec.gob.salud.hce.backend.entity.PacienteTutor;
import ec.gob.salud.hce.backend.entity.Tutor;
import ec.gob.salud.hce.backend.repository.PacienteRepository;
import ec.gob.salud.hce.backend.repository.PacienteTutorRepository;
import ec.gob.salud.hce.backend.repository.TutorRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PacienteService {

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private PacienteTutorRepository pacienteTutorRepository;

    private static final int HISTORIA_GRUPO_INICIAL = 1;
    private static final int HISTORIA_GRUPO_MAXIMO = 999;

    // --- 1. CREAR PACIENTE (Renombrado para coincidir con el Controller) ---
    @Transactional
    public Paciente crearPaciente(PacienteRequestDTO dto) {

        // A. GUARDAR DATOS DEL PACIENTE
        Paciente paciente = new Paciente();
        paciente.setNumeroHistoriaClinica(generarSiguienteNumeroHistoriaClinica());
        paciente.setCedula(dto.getCedula());
        paciente.setPrimerNombre(dto.getPrimerNombre());
        paciente.setSegundoNombre(dto.getSegundoNombre());
        paciente.setApellidoPaterno(dto.getApellidoPaterno());
        paciente.setApellidoMaterno(dto.getApellidoMaterno());
        paciente.setFechaNacimiento(dto.getFechaNacimiento());
        paciente.setSexo(dto.getSexo());
        paciente.setTipoSangre(dto.getTipoSangre());
        paciente.setTipoIdentificacion(dto.getTipoIdentificacion());
        paciente.setAnioEscolar(dto.getAnioEscolar());
        paciente.setUsuario(dto.getUsuario());
        paciente.setOrigin(dto.getOrigin());
        paciente.setIdPersonal(dto.getIdPersonal());

        // VALIDACIÓN DE CÉDULA VS EXTRANJERO
        if (dto.getTipoIdentificacion() != null && dto.getTipoIdentificacion().equals("EXTRANJERO")) {
            // Extranjero: permitir alfanumérico sin validación módulo 11
        } else {
            // Ecuatoriano: validar módulo 11 si tiene 10 dígitos
            if (dto.getCedula() != null && dto.getCedula().length() == 10) {
                if (!validarCedulaEcuatoriana(dto.getCedula())) {
                    throw new IllegalArgumentException("Cédula ecuatoriana inválida (falló verificación módulo 11)");
                }
            }
        }

        // CORRECCIÓN DE TIPOS: Pasamos Integer directamente (sin .longValue())
        paciente.setIdParroquia(dto.getIdParroquia());
        paciente.setIdPrqCanton(dto.getIdPrqCanton());
        paciente.setIdPrqCntProvincia(dto.getIdPrqCntProvincia());
        paciente.setIdGrupoEtnico(dto.getIdGrupoEtnico());
        paciente.setUuidOffline(dto.getUuidOffline()); // Guardar UUID Offline
        paciente.setSyncStatus("SYNCED");

        // Guardar Paciente
        paciente = pacienteRepository.save(paciente);

        // B. GUARDAR TUTOR (Si el DTO lo trae)
        if (dto.getTutor() != null) {
            TutorDTO tutorDto = dto.getTutor();

            Tutor tutor = new Tutor();
            // Mapeamos los campos del Tutor
            tutor.setPrimerNombre(tutorDto.getPrimerNombre());
            tutor.setSegundoNombre(tutorDto.getSegundoNombre());
            tutor.setPrimerApellido(tutorDto.getPrimerApellido());
            tutor.setSegundoApellido(tutorDto.getSegundoApellido());
            tutor.setTelefono(tutorDto.getTelefono());
            tutor.setNivelEducativo(tutorDto.getNivelEducativo());
            tutor.setDireccion(tutorDto.getDireccion());

            // Ubicación Tutor (Directo Integer)
            tutor.setIdParroquia(tutorDto.getIdParroquia());

            // Guardar Tutor
            tutor = tutorRepository.save(tutor);

            // C. GUARDAR RELACIÓN (Tabla Intermedia)
            PacienteTutor relacion = new PacienteTutor();
            relacion.setPaciente(paciente);
            relacion.setTutor(tutor);
            relacion.setParentesco(tutorDto.getParentesco());

            pacienteTutorRepository.save(relacion);
        }

        return paciente;
    }

    // --- 2. LISTAR TODOS (Faltaba este método) ---
    public List<Paciente> listarTodos() {
        return pacienteRepository.findAll();
    }

    // --- 3. OBTENER POR ID (Faltaba este método) ---
    public Optional<Paciente> obtenerPorId(Integer id) {
        return pacienteRepository.findById(id);
    }

    public List<Paciente> buscarPorCriterio(String criterio) {
        return pacienteRepository.buscarPorCriterio(criterio);
    }

    // VALIDACIÓN DE CÉDULA ECUATORIANA (MÓDULO 10)
    private boolean validarCedulaEcuatoriana(String cedula) {
        if (cedula == null || cedula.length() != 10) return false;
        
        int[] coef = {2, 1, 2, 1, 2, 1, 2, 1, 2};
        int suma = 0;
        
        for (int i = 0; i < 9; i++) {
            int digito = Character.getNumericValue(cedula.charAt(i));
            int resultado = digito * coef[i];
            suma += (resultado > 9) ? resultado - 9 : resultado;
        }
        
        int verificador = (10 - (suma % 10)) % 10;
        return verificador == Character.getNumericValue(cedula.charAt(9));
    }

    private String generarSiguienteNumeroHistoriaClinica() {
        return pacienteRepository.findTopByNumeroHistoriaClinicaIsNotNullOrderByNumeroHistoriaClinicaDesc()
                .map(Paciente::getNumeroHistoriaClinica)
                .map(this::incrementarNumeroHistoriaClinica)
                .orElse("HC-001-001-001");
    }

    private String incrementarNumeroHistoriaClinica(String numeroActual) {
        int[] grupos = parsearGruposHistoriaClinica(numeroActual);

        grupos[2]++;
        if (grupos[2] > HISTORIA_GRUPO_MAXIMO) {
            grupos[2] = HISTORIA_GRUPO_INICIAL;
            grupos[1]++;
        }
        if (grupos[1] > HISTORIA_GRUPO_MAXIMO) {
            grupos[1] = HISTORIA_GRUPO_INICIAL;
            grupos[0]++;
        }
        if (grupos[0] > HISTORIA_GRUPO_MAXIMO) {
            throw new IllegalStateException("Se alcanzó el límite de números de historia clínica");
        }

        return String.format("HC-%03d-%03d-%03d", grupos[0], grupos[1], grupos[2]);
    }

    private int[] parsearGruposHistoriaClinica(String numeroHistoriaClinica) {
        if (numeroHistoriaClinica == null || !numeroHistoriaClinica.matches("^HC-\\d{3}-\\d{3}-\\d{3}$")) {
            return new int[] { HISTORIA_GRUPO_INICIAL, HISTORIA_GRUPO_INICIAL, 0 };
        }

        return new int[] {
                Integer.parseInt(numeroHistoriaClinica.substring(3, 6)),
                Integer.parseInt(numeroHistoriaClinica.substring(7, 10)),
                Integer.parseInt(numeroHistoriaClinica.substring(11, 14))
        };
    }
}
