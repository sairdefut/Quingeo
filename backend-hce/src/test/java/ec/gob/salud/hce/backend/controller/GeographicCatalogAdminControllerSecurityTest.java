package ec.gob.salud.hce.backend.controller;

import ec.gob.salud.hce.backend.dto.GeographicCatalogImportResultDTO;
import ec.gob.salud.hce.backend.repository.UsuarioRepository;
import ec.gob.salud.hce.backend.security.JwtService;
import ec.gob.salud.hce.backend.service.GeographicCatalogImportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GeographicCatalogAdminController.class)
@Import(GeographicCatalogAdminControllerSecurityTest.TestSecurityConfiguration.class)
class GeographicCatalogAdminControllerSecurityTest {
    @Autowired private MockMvc mockMvc;
    @MockBean private GeographicCatalogImportService service;
    @MockBean private JwtService jwtService;
    @MockBean private UsuarioRepository usuarioRepository;
    @MockBean private PasswordEncoder passwordEncoder;

    @Test
    void rejectsAnonymousRequests() throws Exception {
        mockMvc.perform(multipart("/api/admin/catalogos/ubicaciones/preview").file(testFile()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "MEDICO")
    void rejectsNonAdminRequests() throws Exception {
        mockMvc.perform(multipart("/api/admin/catalogos/ubicaciones/preview").file(testFile()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void allowsAdminRequests() throws Exception {
        when(service.preview(any())).thenReturn(new GeographicCatalogImportResultDTO(
                1, 24, 222, 1452, 53, 24, 0, 222, 0, 1452, 0,
                0, 0, 12, List.of(), false));
        mockMvc.perform(multipart("/api/admin/catalogos/ubicaciones/preview").file(testFile()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.provinces").value(24))
                .andExpect(jsonPath("$.executed").value(false));
    }

    private MockMultipartFile testFile() {
        return new MockMultipartFile("file", "ubicaciones.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", new byte[]{1});
    }

    @TestConfiguration
    @EnableMethodSecurity
    static class TestSecurityConfiguration {
        @Bean
        SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
            return http.csrf(csrf -> csrf.disable())
                    .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                    .httpBasic(basic -> {}).build();
        }
    }
}
