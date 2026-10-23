package com.textilamazonas.crm.venta;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItems;
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

import jakarta.persistence.EntityManager;

/** Pruebas de CU08 Registrar venta y CU09 Asociar venta a cliente. @Transactional deshace cada prueba. */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class VentaRegistroControladorTest {

    private static final String COMERCIAL = "mquispe@amazonas.com.pe";
    private static final String GERENCIA = "jsalas@amazonas.com.pe";
    private static final String ADMIN = "admin@amazonas.com.pe";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private VentaRepositorio ventas;

    private String tokenDe(String correo) throws Exception {
        String cuerpo = """
                {"correo":"%s","contrasena":"Clave2026!"}""".formatted(correo);
        String respuesta = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(respuesta, "$.token");
    }

    /** El Administrador registra un cliente de prueba (RUC 2099999200x) y se devuelve su id. */
    private long registrarCliente(String ruc) throws Exception {
        String cuerpo = """
                {"tipoDocumento":"RUC","numeroDocumento":"%s","razonSocial":"ZZ Prueba Ventas S.A.C.",
                 "tipoCliente":"CONFECCIONISTA","telefono":"987654321"}""".formatted(ruc);
        String respuesta = mockMvc.perform(post("/api/clientes")
                        .header("Authorization", "Bearer " + tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Number id = JsonPath.read(respuesta, "$.id");
        return id.longValue();
    }

    /** Ejemplo del contrato M3: 120 kg × 28,50 + 80 kg × 18,90 (productos 1 y 3 de V31). */
    private static String venta(long clienteId) {
        return """
                {"clienteId":%d,"fecha":"2026-10-03","observaciones":"  Entrega en almacén.  ",
                 "items":[{"productoId":1,"cantidad":120,"precioUnitario":28.50},
                          {"productoId":3,"cantidad":80,"precioUnitario":18.90}]}""".formatted(clienteId);
    }

    /** POST /api/ventas; si token es null, va sin header Authorization. */
    private ResultActions registrar(String token, String json) throws Exception {
        MockHttpServletRequestBuilder peticion = post("/api/ventas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json);
        if (token != null) {
            peticion.header("Authorization", "Bearer " + token);
        }
        return mockMvc.perform(peticion);
    }

    @Test
    void comercialRegistraYElBackendCalculaLosMontos() throws Exception {
        long clienteId = registrarCliente("20999992001");

        registrar(tokenDe(COMERCIAL), venta(clienteId))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", matchesPattern("/api/ventas/\\d+")))
                .andExpect(jsonPath("$.numero").value(matchesPattern("V-\\d{4}-\\d{4,}")))
                .andExpect(jsonPath("$.cliente.id").value(clienteId))
                .andExpect(jsonPath("$.observaciones").value("Entrega en almacén."))
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[0].subtotal").value(3420.00))
                .andExpect(jsonPath("$.items[1].subtotal").value(1512.00))
                .andExpect(jsonPath("$.subtotal").value(4932.00))
                .andExpect(jsonPath("$.igv").value(887.76))
                .andExpect(jsonPath("$.total").value(5819.76))
                .andExpect(jsonPath("$.registradoPor").value("María Quispe"));
    }

    @Test
    void laVentaYSusLineasQuedanGuardadasEnLaBase() throws Exception {
        long clienteId = registrarCliente("20999992002");
        String respuesta = registrar(tokenDe(COMERCIAL), venta(clienteId))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Number id = JsonPath.read(respuesta, "$.id");

        // Olvida lo que Hibernate tiene en memoria: la lectura siguiente va a PostgreSQL
        entityManager.flush();
        entityManager.clear();

        Venta guardada = ventas.findById(id.longValue()).orElseThrow();
        assertThat(guardada.getItems()).hasSize(2);
        assertThat(guardada.getTotal()).isEqualByComparingTo("5819.76");
        assertThat(guardada.getCliente().getId()).isEqualTo(clienteId);
    }

    @Test
    void datosConFormatoInvalidoDevuelven400() throws Exception {
        String json = """
                {"clienteId":1,"fecha":"2030-01-01","observaciones":"%s",
                 "items":[{"productoId":1,"cantidad":0,"precioUnitario":28.555}]}""".formatted("x".repeat(301));

        registrar(tokenDe(COMERCIAL), json)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACION"))
                .andExpect(jsonPath("$.errores[*].campo").value(hasItems(
                        "fecha", "observaciones", "items[0].cantidad", "items[0].precioUnitario")));
    }

    @Test
    void ventaSinProductosDevuelve400() throws Exception {
        registrar(tokenDe(COMERCIAL), """
                {"clienteId":1,"fecha":"2026-10-03","items":[]}""")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores[0].campo").value("items"));
    }

    @Test
    void clienteOProductoInexistenteYProductoRepetidoDevuelven400() throws Exception {
        String json = """
                {"clienteId":999999999,"fecha":"2026-10-03",
                 "items":[{"productoId":1,"cantidad":5,"precioUnitario":10},
                          {"productoId":1,"cantidad":5,"precioUnitario":10},
                          {"productoId":999999,"cantidad":1,"precioUnitario":1}]}""";

        registrar(tokenDe(COMERCIAL), json)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores[*].campo").value(hasItems(
                        "clienteId", "items[1].productoId", "items[2].productoId")));
    }

    @Test
    void gerenciaRecibe403() throws Exception {
        long clienteId = registrarCliente("20999992003");

        registrar(tokenDe(GERENCIA), venta(clienteId))
                .andExpect(status().isForbidden());
    }

    @Test
    void sinTokenRecibe401() throws Exception {
        registrar(null, venta(1))
                .andExpect(status().isUnauthorized());
    }
}