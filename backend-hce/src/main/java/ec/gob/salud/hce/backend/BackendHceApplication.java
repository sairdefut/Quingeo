package ec.gob.salud.hce.backend;

import ec.gob.salud.hce.backend.entity.Usuario;
import ec.gob.salud.hce.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendHceApplication {

	@Value("${HCE_DEFAULT_USER_PASSWORD}")
	private String defaultUserPassword;

	public static void main(String[] args) {
		SpringApplication.run(BackendHceApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
		return args -> {
			// Asegurar Admin: Angel Rodolfo Mora Nupia
			Usuario admin = repository.findByUsername("amora").orElse(null);
			if (admin == null) {
				admin = new Usuario();
				admin.setUsername("amora");
			}
			admin.setPassword(passwordEncoder.encode(defaultUserPassword));
			admin.setNombres("Angel Rodolfo");
			admin.setApellidos("Mora Nupia");
			admin.setCargo("admin");
			repository.save(admin);

			// Asegurar Posgradista: Francis Vasquez
			Usuario posgradista = repository.findByUsername("fvasquez").orElse(null);
			if (posgradista == null) {
				posgradista = new Usuario();
				posgradista.setUsername("fvasquez");
			}
			posgradista.setPassword(passwordEncoder.encode(defaultUserPassword));
			posgradista.setNombres("Francis");
			posgradista.setApellidos("Vasquez");
			posgradista.setCargo("posgradista");
			repository.save(posgradista);
		};
	}
}
