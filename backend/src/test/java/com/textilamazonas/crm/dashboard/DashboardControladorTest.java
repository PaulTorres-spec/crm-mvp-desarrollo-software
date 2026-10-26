package com.textilamazonas.crm.dashboard;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.assertj.core.api.Assertions.assertThat;

import java.time.YearMonth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import com.jayway.jsonpath.JsonPath;

/**
 * Pruebas de CU12, CU13 y CU14 (contrato M4, sección 3).
 * Las ventas de prueba van en 2001, donde no hay datos reales: así los números son exactos.
 * Los clientes siempre se registran "hoy", por eso se comprueba la diferencia antes/después.
 * Clientes de prueba: RUC 2099999400x. @Transactional deshace todo al terminar.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class DashboardControladorTest {

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

    private long registrarCliente(String ruc, String tipoCliente) throws Exception {
        String cuerpo = """
                {"tipoDocumento":"RUC","numeroDocumento":"%s","razonSocial":"ZZ Prueba Dashboard S.A.C.",
                 "tipoCliente":"%s","telefono":"987654321"}""".formatted(ruc, tipoCliente);
        String respuesta = mockMvc.perform(post("/api/clientes")
                        .header("Authorization", "Bearer " + tokenDe(ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Number id = JsonPath.read(respuesta, "$.id");
        return id.longValue();
    }

    /** María registra una venta de 10 kg × S/ 10,00 → total 118,00 (con IGV). */
    private void registrarVenta(long clienteId, String fecha) throws Exception {
        String cuerpo = """
                {"clienteId":%d,"fecha":"%s",
                 "items":[{"productoId":1,"cantidad":10,"precioUnitario":10}]}""".formatted(clienteId, fecha);
        mockMvc.perform(post("/api/ventas")
                        .header("Authorization", "Bearer " + tokenDe(COMERCIAL))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpo))
                .andExpect(status().isCreated());
    }

    /** 1 venta en el periodo anterior (15/02/2001) y 2 en los extremos de marzo de 2001. */
    private void prepararVentasDe2001() throws Exception {
        long cliente = registrarCliente("20999994001", "CONFECCIONISTA");
        registrarVenta(cliente, "2001-02-15");
        registrarVenta(cliente, "2001-03-01");
        registrarVenta(cliente, "2001-03-31");
    }

    /** GET /api/dashboard con desde/hasta opcionales (null = no se envía). */
    private MockHttpServletRequestBuilder dashboard(String desde, String hasta, String correo) throws Exception {
        MockHttpServletRequestBuilder peticion = get("/api/dashboard")
                .header("Authorization", "Bearer " + tokenDe(correo));
        if (desde != null) {
            peticion.param("desde", desde);
        }
        if (hasta != null) {
            peticion.param("hasta", hasta);
        }
        return peticion;
    }

    @Test
    void sinTokenResponde401() throws Exception {
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void sinParametrosUsaElMesActual() throws Exception {
        YearMonth mes = YearMonth.now();
        mockMvc.perform(dashboard(null, null, COMERCIAL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.desde").value(mes.atDay(1).toString()))
                .andExpect(jsonPath("$.hasta").value(mes.atEndOfMonth().toString()));
    }

    @Test
    void cuentaLasVentasDelPeriodoYDelPeriodoAnterior() throws Exception {
        prepararVentasDe2001();

        // GERENCIA puede ver el dashboard; los extremos (01/03 y 31/03) se incluyen
        mockMvc.perform(dashboard("2001-03-01", "2001-03-31", GERENCIA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ventas.cantidad").value(2))
                .andExpect(jsonPath("$.ventas.montoTotal").value(236.00))
                .andExpect(jsonPath("$.ventas.anterior.desde").value("2001-01-29"))
                .andExpect(jsonPath("$.ventas.anterior.hasta").value("2001-02-28"))
                .andExpect(jsonPath("$.ventas.anterior.cantidad").value(1))
                .andExpect(jsonPath("$.ventas.anterior.montoTotal").value(118.00))
                // los clientes se registraron "hoy": en 2001 todavía no existía ninguno
                .andExpect(jsonPath("$.clientes.total").value(0));
    }

    @Test
    void ventasPorMesTraeSeisMesesYRellenaLosVaciosConCero() throws Exception {
        prepararVentasDe2001();

        mockMvc.perform(dashboard("2001-03-01", "2001-03-31", ADMIN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ventasPorMes.length()").value(6))
                .andExpect(jsonPath("$.ventasPorMes[0].mes").value("2000-10"))
                .andExpect(jsonPath("$.ventasPorMes[0].cantidad").value(0))
                .andExpect(jsonPath("$.ventasPorMes[4].mes").value("2001-02"))
                .andExpect(jsonPath("$.ventasPorMes[4].montoTotal").value(118.00))
                .andExpect(jsonPath("$.ventasPorMes[5].mes").value("2001-03"))
                .andExpect(jsonPath("$.ventasPorMes[5].cantidad").value(2))
                .andExpect(jsonPath("$.ventasPorMes[5].montoTotal").value(236.00));
    }

    @Test
    void periodoSinVentasDevuelveCerosConDosDecimales() throws Exception {
        mockMvc.perform(dashboard("2002-01-01", "2002-01-31", COMERCIAL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ventas.cantidad").value(0))
                // se revisa el texto: el contrato pide 0.00 (no 0 ni 0.0)
                .andExpect(content().string(containsString("\"montoTotal\":0.00")));
    }

    @Test
    void unClienteNuevoSumaEnTotalNuevosYSuTipo() throws Exception {
        String antes = mockMvc.perform(dashboard(null, null, COMERCIAL))
                .andReturn().getResponse().getContentAsString();

        registrarCliente("20999994002", "INSTITUCIONAL");

        String despues = mockMvc.perform(dashboard(null, null, COMERCIAL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientes.porTipo.length()").value(3))
                .andExpect(jsonPath("$.clientes.porTipo[2].tipoCliente").value("INSTITUCIONAL"))
                .andReturn().getResponse().getContentAsString();

        assertThat(numero(despues, "$.clientes.total")).isEqualTo(numero(antes, "$.clientes.total") + 1);
        assertThat(numero(despues, "$.clientes.nuevosEnPeriodo"))
                .isEqualTo(numero(antes, "$.clientes.nuevosEnPeriodo") + 1);
        assertThat(numero(despues, "$.clientes.porTipo[2].cantidad"))
                .isEqualTo(numero(antes, "$.clientes.porTipo[2].cantidad") + 1);

        // la suma de los 3 tipos es igual al total
        long sumaTipos = numero(despues, "$.clientes.porTipo[0].cantidad")
                + numero(despues, "$.clientes.porTipo[1].cantidad")
                + numero(despues, "$.clientes.porTipo[2].cantidad");
        assertThat(sumaTipos).isEqualTo(numero(despues, "$.clientes.total"));
    }

    @Test
    void rechazaPeriodosInvalidos() throws Exception {
        esperar400("2026-10-31", "2026-10-01", "hasta", "La fecha final no puede ser anterior a la inicial.");
        esperar400("2026-10-01", null, "hasta", "Indica la fecha de fin del periodo.");
        esperar400(null, "2026-10-31", "desde", "Indica la fecha de inicio del periodo.");
        esperar400("2025-01-01", "2026-01-02", "hasta", "El periodo admite hasta 366 días.");
        esperar400("2026-13-01", "2026-12-31", "desde", "El valor no tiene un formato válido.");
    }

    @Test
    void aceptaUnPeriodoDeExactamente366Dias() throws Exception {
        // 2024 es bisiesto: del 01/01 al 31/12 son 366 días (el límite, todavía válido)
        mockMvc.perform(dashboard("2024-01-01", "2024-12-31", COMERCIAL))
                .andExpect(status().isOk());
    }

    private void esperar400(String desde, String hasta, String campo, String mensaje) throws Exception {
        mockMvc.perform(dashboard(desde, hasta, COMERCIAL))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("VALIDACION"))
                .andExpect(jsonPath("$.errores[0].campo").value(campo))
                .andExpect(jsonPath("$.errores[0].mensaje").value(mensaje));
    }

    private long numero(String json, String ruta) {
        Number valor = JsonPath.read(json, ruta);
        return valor.longValue();
    }
}