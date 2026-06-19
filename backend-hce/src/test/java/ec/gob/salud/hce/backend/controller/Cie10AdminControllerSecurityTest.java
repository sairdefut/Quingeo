package ec.gob.salud.hce.backend.controller;

import ec.gob.salud.hce.backend.dto.Cie10ImportResultDTO;
import ec.gob.salud.hce.backend.service.Cie10ImportService;
import ec.gob.salud.hce.backend.security.JwtService;
import ec.gob.salud.hce.backend.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(Cie10AdminController.class)
@Import(Cie10AdminControllerSecurityTest.TestSecurityConfiguration.class)
class Cie10AdminControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private Cie10ImportService cie10ImportService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @Test
    void rejectsAnonymousRequests() throws Exception {
        mockMvc.perform(multipart("/api/admin/cie10/preview").file(testFile()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "MEDICO")
    void rejectsAuthenticatedNonAdminRequests() throws Exception {
        mockMvc.perform(multipart("/api/admin/cie10/preview").file(testFile()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void allowsAdminRequests() throws Exception {
        when(cie10ImportService.preview(any())).thenReturn(new Cie10ImportResultDTO(
                10, 8, 1, 1, 0, List.of(), false));

        mockMvc.perform(multipart("/api/admin/cie10/preview").file(testFile()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRows").value(10))
                .andExpect(jsonPath("$.executed").value(false));
    }

    private MockMultipartFile testFile() {
        return new MockMultipartFile(
                "file", "CIE10.xls", "application/vnd.ms-excel", new byte[]{1});
    }

    @TestConfiguration
    @EnableMethodSecurity
    static class TestSecurityConfiguration {

        @Bean
        SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
            return http
                    .csrf(csrf -> csrf.disable())
                    .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                    .httpBasic(basic -> {})
                    .build();
        }
    }
}
