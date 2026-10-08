package com.textilamazonas.crm.cliente;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import com.jayway.jsonpath.JsonPath;

/** Pruebas de CU03 y CU04. @Transactional deshace lo que cada prueba guarda en la base. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ClienteControladorTest {

    private static final String COMERCIAL = "mquispe@amazonas.com.pe";
    private static final String GERENCIA = "jsalas@amazonas.com.pe";
    private static final String ADMIN = "admin@amazonas.com.pe";

    @Autowired
    private MockMvc mockMvc;

    /** Inicia sesión con un usuario semilla (V11) y devuelve su token. */
    private String tokenDe(String correo) throws Exception {
        String cuerpo = """
                {"correo":"%s","contrasena":"Clave2026!"}""".formatted(correo);
        String respuesta = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(respuesta, "$.token");
    }

    /** JSON mínimo de un cliente (solo los campos obligatorios). */
    private static String cliente(String tipoDocumento, String numeroDocumento, String telefono) {
        return """
                {"tipoDocumento":"%s","numeroDocumento":"%s","razonSocial":"Cliente de Prueba S.A.C.",
                 "tipoCliente":"DISTRIBUIDOR","telefono":"%s"}""".formatted(tipoDocumento, numeroDocumento, telefono);
    }

    /** POST /api/clientes; si token es null, va sin header Authorization. */
    private ResultActions registrar(String token, String json) throws Exception {
        MockHttpServletRequestBuilder peticion = post("/api/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json);
        if (token != null) {
            peticion.header("Authorization", "Bearer " + token);
        }
        return mockMvc.perform(peticion);
    }

    @Test
    void comercialRegistraClienteYRecibe201ConLocation() throws Exception {
        registrar(tokenDe(COMERCIAL), cliente("RUC", "20999999991", "987 654 321"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", matchesPattern("/api/clientes/\\d+")))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.tipoDocumento").value("RUC"))
                .andExpect(jsonPath("$.telefono").value("987654321"))
                .andExpect(jsonPath("$.registradoPor").isNotEmpty());
    }

    @Test
    void adminTambienPuedeRegistrar() throws Exception {
        registrar(tokenDe(ADMIN), cliente("DNI", "70000001", "912345678"))
                .andExpect(status().isCreated());
    }

    @Test
    void documentoDuplicadoDevuelve409() throws Exception {
        String token = tokenDe(COMERCIAL);
        String json = cliente("RUC", "20999999992", "987654321");

        registrar(token, json).andExpect(status().isCreated());
        registrar(token, json)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("DUPLICADO"))
                .andExpect(jsonPath("$.errores[0].campo").value("numeroDocumento"));
    }

    @Test
    void rucQueNoEmpiezaEn10o20Devuelve400() throws Exception {
        registrar(tokenDe(COMERCIAL), cliente("RUC", "30123456789", "987654321"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACION"))
                .andExpect(jsonPath("$.errores", hasSize(1)))
                .andExpect(jsonPath("$.errores[0].campo").value("numeroDocumento"));
    }

    @Test
    void dniDeSieteDigitosDevuelve400() throws Exception {
        registrar(tokenDe(COMERCIAL), cliente("DNI", "1234567", "987654321"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores[0].campo").value("numeroDocumento"));
    }

    @Test
    void sinCamposObligatoriosDevuelve400ConCincoErrores() throws Exception {
        registrar(tokenDe(COMERCIAL), "{}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores", hasSize(5)));
    }

    @Test
    void gerenciaRecibe403() throws Exception {
        registrar(tokenDe(GERENCIA), cliente("DNI", "70000002", "912345678"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.codigo").value("SIN_PERMISO"));
    }

    @Test
    void sinTokenRecibe401() throws Exception {
        registrar(null, cliente("DNI", "70000003", "912345678"))
                .andExpect(status().isUnauthorized());
    }
}