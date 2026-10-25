package com.textilamazonas.crm.venta;

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
import org.springframework.transaction.annotation.Transactional;

import com.jayway.jsonpath.JsonPath;

/**
 * Pruebas de CU10 Consultar ventas y CU11 Filtrar por fecha o cliente.
 * Cada prueba crea su propio cliente (RUC 2099999300x) y filtra por él: así no le afectan
 * las ventas que ya existan en la base. @Transactional deshace todo al terminar.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class VentaConsultaControladorTest {

    private static final String COMERCIAL = "mquispe@amazonas.com.pe";
    private static final String GERENCIA = "jsalas@amazonas.com.pe";
    private static final String ADMIN = "admin@amazonas.com.pe";

    @Autowired
    private MockMvc mockMvc;

    private String tokenDe(String correo) throws Exception {
        String cuerpo = """
                {"correo":"%s","contrasena":"Clave2026!"}""".formatted(correo);
        String respuesta = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(respuesta, "$.token");
    }

    private long registrarCliente(String ruc) throws Exception {
        String cuerpo = """
                {"tipoDocumento":"RUC","numeroDocumento":"%s","razonSocial":"ZZ Prueba Consulta Ventas S.A.C.",
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

    /** María registra una venta de 10 kg × S/ 10,00 → subtotal 100, IGV 18, total 118. */
    private long registrarVenta(long clienteId, String fecha) throws Exception {
        String cuerpo = """
                {"clienteId":%d,"fecha":"%s",
                 "items":[{"productoId":1,"cantidad":10,"precioUnitario":10}]}""".formatted(clienteId, fecha);
        String respuesta = mockMvc.perform(post("/api/ventas")
                        .header("Authorization", "Bearer " + tokenDe(COMERCIAL))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Number id = JsonPath.read(respuesta, "$.id");
        return id.longValue();
    }

    @Test
    void filtraPorClienteOrdenaPorFechaYSumaElTotal() throws Exception {
        long cliente = registrarCliente("20999993001");
        long otro = registrarCliente("20999993002");
        registrarVenta(cliente, "2026-10-01");
        long reciente = registrarVenta(cliente, "2026-10-05");
        registrarVenta(otro, "2026-10-03");

        // GERENCIA también puede consultar (solo no puede registrar)
        mockMvc.perform(get("/api/ventas")
                        .param("clienteId", String.valueOf(cliente))
                        .header("Authorization", "Bearer " + tokenDe(GERENCIA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElementos").value(2))
                .andExpect(jsonPath("$.contenido[0].id").value(reciente))
                .andExpect(jsonPath("$.contenido[0].fecha").value("2026-10-05"))
                .andExpect(jsonPath("$.contenido[0].clienteRazonSocial").value("ZZ Prueba Consulta Ventas S.A.C."))
                .andExpect(jsonPath("$.contenido[0].registradoPor").value("María Quispe"))
                .andExpect(jsonPath("$.montoTotal").value(236.00));
    }

    @Test
    void filtraPorRangoDeFechasIncluyendoLosExtremos() throws Exception {
        long cliente = registrarCliente("20999993003");
        registrarVenta(cliente, "2026-10-01");
        registrarVenta(cliente, "2026-10-05");
        registrarVenta(cliente, "2026-10-09");

        mockMvc.perform(get("/api/ventas")
                        .param("clienteId", String.valueOf(cliente))
                        .param("desde", "2026-10-05")
                        .param("hasta", "2026-10-09")
                        .header("Authorization", "Bearer " + tokenDe(COMERCIAL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElementos").value(2))
                .andExpect(jsonPath("$.montoTotal").value(236.00));
    }

    @Test
    void elMontoTotalSumaTodasLasPaginasNoSoloLaActual() throws Exception {
        long cliente = registrarCliente("20999993004");
        registrarVenta(cliente, "2026-10-01");
        registrarVenta(cliente, "2026-10-02");
        registrarVenta(cliente, "2026-10-03");

        mockMvc.perform(get("/api/ventas")
                        .param("clienteId", String.valueOf(cliente))
                        .param("pagina", "1")
                        .param("tamano", "2")
                        .header("Authorization", "Bearer " + tokenDe(COMERCIAL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contenido.length()").value(1))
                .andExpect(jsonPath("$.totalElementos").value(3))
                .andExpect(jsonPath("$.totalPaginas").value(2))
                .andExpect(jsonPath("$.montoTotal").value(354.00));
    }

    @Test
    void rangoSinVentasDevuelveListaVaciaYMontoCero() throws Exception {
        long cliente = registrarCliente("20999993005");
        registrarVenta(cliente, "2026-10-01");

        mockMvc.perform(get("/api/ventas")
                        .param("clienteId", String.valueOf(cliente))
                        .param("desde", "2020-01-01")
                        .param("hasta", "2020-01-31")
                        .header("Authorization", "Bearer " + tokenDe(COMERCIAL)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contenido.length()").value(0))
                .andExpect(jsonPath("$.totalElementos").value(0))
                .andExpect(jsonPath("$.montoTotal").value(0.0));
    }

    @Test
    void desdePosteriorAHastaDevuelve400() throws Exception {
        mockMvc.perform(get("/api/ventas")
                        .param("desde", "2026-10-31")
                        .param("hasta", "2026-10-01")
                        .header("Authorization", "Bearer " + tokenDe(COMERCIAL)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores[0].campo").value("hasta"));
    }

    @Test
    void fechaConFormatoInvalidoDevuelve400() throws Exception {
        mockMvc.perform(get("/api/ventas")
                        .param("desde", "2026-13-01")
                        .header("Authorization", "Bearer " + tokenDe(COMERCIAL)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores[0].campo").value("desde"))
                .andExpect(jsonPath("$.errores[0].mensaje").value("El valor no tiene un formato válido."));
    }

    @Test
    void tamanoFueraDeRangoDevuelve400() throws Exception {
        mockMvc.perform(get("/api/ventas")
                        .param("tamano", "51")
                        .header("Authorization", "Bearer " + tokenDe(COMERCIAL)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores[0].campo").value("tamano"));
    }

    @Test
    void detalleDevuelveClienteLineasYMontos() throws Exception {
        long cliente = registrarCliente("20999993006");
        long venta = registrarVenta(cliente, "2026-10-02");

        mockMvc.perform(get("/api/ventas/{id}", venta)
                        .header("Authorization", "Bearer " + tokenDe(GERENCIA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cliente.id").value(cliente))
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].codigo").value("HIL-PIMA-301"))
                .andExpect(jsonPath("$.subtotal").value(100.00))
                .andExpect(jsonPath("$.igv").value(18.00))
                .andExpect(jsonPath("$.total").value(118.00));
    }

    @Test
    void ventaInexistenteDevuelve404() throws Exception {
        mockMvc.perform(get("/api/ventas/{id}", 999999999L)
                        .header("Authorization", "Bearer " + tokenDe(COMERCIAL)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("NO_ENCONTRADO"));
    }

    @Test
    void sinTokenDevuelve401() throws Exception {
        mockMvc.perform(get("/api/ventas"))
                .andExpect(status().isUnauthorized());
    }
}