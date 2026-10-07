package com.textilamazonas.crm.auth;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.jayway.jsonpath.JsonPath;

/** Pruebas de CU01 contra la base real (usuarios semilla de la V11). */
@SpringBootTest
@AutoConfigureMockMvc
class AuthControladorTest {

    private static final String CORREO = "mquispe@amazonas.com.pe";
    private static final String CLAVE = "Clave2026!";
    private static final String MENSAJE_401 = "Correo o contraseña incorrectos.";

    @Autowired
    private MockMvc mockMvc;

    /** Envía POST /api/auth/login con el correo y la contraseña dados. */
    private ResultActions login(String correo, String contrasena) throws Exception {
        String cuerpo = """
                {"correo":"%s","contrasena":"%s"}""".formatted(correo, contrasena);
        return mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(cuerpo));
    }

    @Test
    void loginCorrectoDevuelveTokenYUsuario() throws Exception {
        login(CORREO, CLAVE)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tipo").value("Bearer"))
                .andExpect(jsonPath("$.expiraEn").value(28800))
                .andExpect(jsonPath("$.usuario.correo").value(CORREO))
                .andExpect(jsonPath("$.usuario.rol").value("COMERCIAL"))
                .andExpect(jsonPath("$.usuario.contrasenaHash").doesNotExist());
    }

    @Test
    void loginAceptaCorreoConMayusculasYEspacios() throws Exception {
        login("  MQuispe@Amazonas.com.pe ", CLAVE)
                .andExpect(status().isOk());
    }

    @Test
    void contrasenaIncorrectaDevuelve401() throws Exception {
        login(CORREO, "otraClave")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"))
                .andExpect(jsonPath("$.mensaje").value(MENSAJE_401));
    }

    @Test
    void correoInexistenteDevuelveElMismo401() throws Exception {
        login("nadie@amazonas.com.pe", CLAVE)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").value(MENSAJE_401));
    }

    @Test
    void camposVaciosDevuelven400ConDosErrores() throws Exception {
        login("", "")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACION"))
                .andExpect(jsonPath("$.errores", hasSize(2)));
    }

    @Test
    void yoConTokenDevuelveElUsuarioDeLaSesion() throws Exception {
        String respuesta = login(CORREO, CLAVE).andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(respuesta, "$.token");

        mockMvc.perform(get("/api/auth/yo").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value(CORREO))
                .andExpect(jsonPath("$.rol").value("COMERCIAL"));
    }

    @Test
    void yoSinTokenDevuelve401() throws Exception {
        mockMvc.perform(get("/api/auth/yo"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));
    }
}