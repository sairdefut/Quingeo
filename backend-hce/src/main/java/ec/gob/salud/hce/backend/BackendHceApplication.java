package ec.gob.salud.hce.backend;

import ec.gob.salud.hce.backend.entity.Usuario;
import ec.gob.salud.hce.backend.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendHceApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendHceApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
		return args -> {
			// Asegurar Admin: Angel Rodolfo Mora Nupia
			Usuario admin = repository.findByUsername("amora").orElseGet(() -> {
				Usuario u = new Usuario();
				u.setUsername("amora");
				return u;
			});
			admin.setPassword(passwordEncoder.encode("Salud2026!"));
			admin.setNombres("Angel Rodolfo");
			admin.setApellidos("Mora Nupia");
			admin.setCargo("admin");
			repository.save(admin);

			// Asegurar Posgradista: Francis Vasquez
			Usuario posgradista = repository.findByUsername("fvasquez").orElseGet(() -> {
				Usuario u = new Usuario();
				u.setUsername("fvasquez");
				return u;
			});
			posgradista.setPassword(passwordEncoder.encode("Salud2026!"));
			posgradista.setNombres("Francis");
			posgradista.setApellidos("Vasquez");
			posgradista.setCargo("posgradista");
			repository.save(posgradista);
		};
	}
}
