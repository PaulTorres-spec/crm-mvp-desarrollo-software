package com.textilamazonas.crm.cliente;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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

import jakarta.persistence.EntityManager;

/** Pruebas de CU07 Editar cliente. @Transactional deshace los cambios de cada prueba. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ClienteEdicionControladorTest {

    private static final String COMERCIAL = "mquispe@amazonas.com.pe";
    private static final String GERENCIA = "jsalas@amazonas.com.pe";
    private static final String ADMIN = "admin@amazonas.com.pe";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EntityManager entityManager;

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

    /** El Administrador registra un cliente con RUC y se devuelve su id. */
    private long registrar(String ruc) throws Exception {
        String cuerpo = """
                {"tipoDocumento":"RUC","numeroDocumento":"%s","razonSocial":"ZZ Prueba Original S.A.C.",
                 "tipoCliente":"DISTRIBUIDOR","telefono":"987654321"}""".formatted(ruc);
        String respuesta = mockMvc.perform(post("/api/clientes")
                        .header("Authorization", "Bearer " + tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Number id = JsonPath.read(respuesta, "$.id");
        return id.longValue();
    }

    /** JSON del PUT. Incluye un numeroDocumento a propósito: el backend debe ignorarlo. */
    private static String edicion(String razonSocial, String telefono) {
        return """
                {"razonSocial":"%s","tipoCliente":"INSTITUCIONAL","personaContacto":"Contacto Editado",
                 "telefono":"%s","correo":"editado@prueba.pe","direccion":"Av. Editada 123",
                 "numeroDocumento":"10999999999"}""".formatted(razonSocial, telefono);
    }

    /** PUT /api/clientes/{id}; si token es null, va sin header Authorization. */
    private ResultActions editar(String token, long id, String json) throws Exception {
        MockHttpServletRequestBuilder peticion = put("/api/clientes/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json);
        if (token != null) {
            peticion.header("Authorization", "Bearer " + token);
        }
        return mockMvc.perform(peticion);
    }

    @Test
    void comercialEditaYQuedaQuienEditoYCuando() throws Exception {
        long id = registrar("20999991001");

        editar(tokenDe(COMERCIAL), id, edicion("ZZ Prueba Editada S.A.C.", "912 345 678"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.razonSocial").value("ZZ Prueba Editada S.A.C."))
                .andExpect(jsonPath("$.tipoCliente").value("INSTITUCIONAL"))
                .andExpect(jsonPath("$.telefono").value("912345678"))
                .andExpect(jsonPath("$.registradoPor").value("Administrador CRM"))
                .andExpect(jsonPath("$.editadoPor").value("María Quispe"))
                .andExpect(jsonPath("$.fechaEdicion").value(notNullValue()));
    }

    @Test
    void laEdicionSeGuardaEnLaBaseYElDocumentoNoCambia() throws Exception {
        long id = registrar("20999991002");
        String token = tokenDe(COMERCIAL);

        editar(token, id, edicion("ZZ Prueba Guardada S.A.C.", "912345678"))
                .andExpect(status().isOk());

        // Obliga a Hibernate a escribir el UPDATE y olvida lo que tiene en memoria:
        // el GET siguiente lee de verdad desde PostgreSQL
        entityManager.flush();
        entityManager.clear();

        mockMvc.perform(get("/api/clientes/{id}", id).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.razonSocial").value("ZZ Prueba Guardada S.A.C."))
                .andExpect(jsonPath("$.numeroDocumento").value("20999991002"))
                .andExpect(jsonPath("$.editadoPor").value("María Quispe"));
    }

    @Test
    void datosInvalidosDevuelven400() throws Exception {
        long id = registrar("20999991003");

        editar(tokenDe(COMERCIAL), id, edicion("ZZ Prueba S.A.C.", "12"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACION"))
                .andExpect(jsonPath("$.errores[0].campo").value("telefono"));
    }

    @Test
    void gerenciaRecibe403() throws Exception {
        long id = registrar("20999991004");

        editar(tokenDe(GERENCIA), id, edicion("ZZ Prueba S.A.C.", "912345678"))
                .andExpect(status().isForbidden());
    }

    @Test
    void clienteInexistenteDevuelve404() throws Exception {
        editar(tokenDe(COMERCIAL), 999999999L, edicion("ZZ Prueba S.A.C.", "912345678"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("NO_ENCONTRADO"));
    }

    @Test
    void sinTokenDevuelve401() throws Exception {
        editar(null, 1L, edicion("ZZ Prueba S.A.C.", "912345678"))
                .andExpect(status().isUnauthorized());
    }
}