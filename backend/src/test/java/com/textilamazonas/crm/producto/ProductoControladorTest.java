package com.textilamazonas.crm.producto;

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

import com.jayway.jsonpath.JsonPath;

/** Pruebas de GET /api/productos (catálogo de V31, apoyo a CU08). */
@SpringBootTest
@AutoConfigureMockMvc
class ProductoControladorTest {

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

    @Test
    void cualquierRolVeElCatalogoOrdenadoPorNombre() throws Exception {
        mockMvc.perform(get("/api/productos")
                        .header("Authorization", "Bearer " + tokenDe("jsalas@amazonas.com.pe")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(6))
                .andExpect(jsonPath("$[0].codigo").value("HIL-PIMA-301"))
                .andExpect(jsonPath("$[0].precioReferencial").value(28.50))
                .andExpect(jsonPath("$[5].codigo").value("HIL-POL-402"));
    }

    @Test
    void sinTokenDevuelve401() throws Exception {
        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isUnauthorized());
    }
}