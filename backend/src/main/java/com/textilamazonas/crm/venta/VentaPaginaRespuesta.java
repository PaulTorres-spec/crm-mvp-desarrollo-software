package com.textilamazonas.crm.venta;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;

/**
 * Respuesta de GET /api/ventas (contrato M3, sección 4): una página de ventas
 * más el monto total de TODAS las ventas del filtro (chip "Total: S/ …" de la pantalla 08).
 */
public record VentaPaginaRespuesta(
        List<VentaResumen> contenido,
        int pagina,
        int tamano,
        long totalElementos,
        int totalPaginas,
        BigDecimal montoTotal) {

    public static VentaPaginaRespuesta de(Page<VentaResumen> pagina, BigDecimal montoTotal) {
        return new VentaPaginaRespuesta(
                pagina.getContent(),
                pagina.getNumber(),
                pagina.getSize(),
                pagina.getTotalElements(),
                pagina.getTotalPages(),
                montoTotal);
    }
}