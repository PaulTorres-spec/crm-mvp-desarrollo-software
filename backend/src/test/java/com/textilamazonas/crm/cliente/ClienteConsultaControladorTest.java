package com.textilamazonas.crm.cliente;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import com.jayway.jsonpath.JsonPath;

/** Pruebas de CU05 Buscar cliente y CU06 Ver detalle. @Transactional deshace los clientes de prueba. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ClienteConsultaControladorTest {

    private static final String COMERCIAL = "mquispe@amazonas.com.pe";
    private static final String GERENCIA = "jsalas@amazonas.com.pe";
    /** Texto que solo tienen los clientes de estas pruebas: así no chocan con datos reales. */
    private static final String MARCA = "zz prueba";

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

    /** Registra un cliente con RUC y devuelve su id. */
    private long registrar(String token, String ruc, String razonSocial, String tipoCliente) throws Exception {
        String cuerpo = """
                {"tipoDocumento":"RUC","numeroDocumento":"%s","razonSocial":"%s",
                 "tipoCliente":"%s","telefono":"987654321"}""".formatted(ruc, razonSocial, tipoCliente);
        String respuesta = mockMvc.perform(post("/api/clientes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Number id = JsonPath.read(respuesta, "$.id");
        return id.longValue();
    }

    /** Tres clientes con la MARCA, registrados en desorden a propósito. */
    private void registrarTresClientes(String token) throws Exception {
        registrar(token, "20999990001", "ZZ Prueba Gamma S.A.C.", "INSTITUCIONAL");
        registrar(token, "20999990002", "ZZ Prueba Alfa S.A.C.", "CONFECCIONISTA");
        registrar(token, "20999990003", "ZZ Prueba Beta S.A.C.", "DISTRIBUIDOR");
    }

    /** GET /api/clientes con el token del usuario. */
    private MockHttpServletRequestBuilder buscar(String token) {
        return get("/api/clientes").header("Authorization", "Bearer " + token);
    }

    @Test
    void buscaPorTextoOrdenadoPorRazonSocialYPaginado() throws Exception {
        String token = tokenDe(COMERCIAL);
        registrarTresClientes(token);

        mockMvc.perform(buscar(token).param("texto", MARCA).param("tamano", "2").param("pagina", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contenido", hasSize(2)))
                .andExpect(jsonPath("$.contenido[0].razonSocial").value("ZZ Prueba Alfa S.A.C."))
                .andExpect(jsonPath("$.contenido[1].razonSocial").value("ZZ Prueba Beta S.A.C."))
                .andExpect(jsonPath("$.pagina").value(0))
                .andExpect(jsonPath("$.tamano").value(2))
                .andExpect(jsonPath("$.totalElementos").value(3))
                .andExpect(jsonPath("$.totalPaginas").value(2));
    }

    @Test
    void segundaPaginaTraeLoQueFalta() throws Exception {
        String token = tokenDe(COMERCIAL);
        registrarTresClientes(token);

        mockMvc.perform(buscar(token).param("texto", MARCA).param("tamano", "2").param("pagina", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contenido", hasSize(1)))
                .andExpect(jsonPath("$.contenido[0].razonSocial").value("ZZ Prueba Gamma S.A.C."))
                .andExpect(jsonPath("$.pagina").value(1));
    }

    @Test
    void filtraPorTipoDeCliente() throws Exception {
        String token = tokenDe(COMERCIAL);
        registrarTresClientes(token);

        mockMvc.perform(buscar(token).param("texto", MARCA).param("tipoCliente", "INSTITUCIONAL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contenido", hasSize(1)))
                .andExpect(jsonPath("$.contenido[0].tipoCliente").value("INSTITUCIONAL"));
    }

    @Test
    void buscaPorNumeroDeDocumento() throws Exception {
        String token = tokenDe(COMERCIAL);
        registrarTresClientes(token);

        mockMvc.perform(buscar(token).param("texto", "20999990003"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contenido", hasSize(1)))
                .andExpect(jsonPath("$.contenido[0].razonSocial").value("ZZ Prueba Beta S.A.C."));
    }

    @Test
    void gerenciaTambienPuedeBuscar() throws Exception {
        mockMvc.perform(buscar(tokenDe(GERENCIA)))
                .andExpect(status().isOk());
    }

    @Test
    void parametrosInvalidosDevuelven400ConCadaError() throws Exception {
        mockMvc.perform(buscar(tokenDe(COMERCIAL)).param("tamano", "100").param("tipoCliente", "OTRO"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACION"))
                .andExpect(jsonPath("$.errores", hasSize(2)));
    }

    @Test
    void buscarSinTokenDevuelve401() throws Exception {
        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void detalleMuestraQuienRegistroYSinEdicion() throws Exception {
        String token = tokenDe(COMERCIAL);
        long id = registrar(token, "20999990004", "ZZ Prueba Detalle S.A.C.", "DISTRIBUIDOR");

        mockMvc.perform(get("/api/clientes/{id}", id).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.razonSocial").value("ZZ Prueba Detalle S.A.C."))
                .andExpect(jsonPath("$.registradoPor").value("María Quispe"))
                .andExpect(jsonPath("$.editadoPor").value(nullValue()))
                .andExpect(jsonPath("$.fechaEdicion").value(nullValue()));
    }

    @Test
    void detalleDeClienteInexistenteDevuelve404() throws Exception {
        mockMvc.perform(get("/api/clientes/{id}", 999999999L)
                        .header("Authorization", "Bearer " + tokenDe(COMERCIAL)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("NO_ENCONTRADO"));
    }
}