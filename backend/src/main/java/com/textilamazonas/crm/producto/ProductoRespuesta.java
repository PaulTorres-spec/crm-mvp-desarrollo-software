package com.textilamazonas.crm.producto;

import java.math.BigDecimal;

/** Un producto del catálogo tal como lo recibe el frontend (contrato M3, sección 2). */
public record ProductoRespuesta(
        Long id,
        String codigo,
        String nombre,
        String unidadMedida,
        BigDecimal precioReferencial) {

    public static ProductoRespuesta de(Producto producto) {
        return new ProductoRespuesta(
                producto.getId(),
                producto.getCodigo(),
                producto.getNombre(),
                producto.getUnidadMedida(),
                producto.getPrecioReferencial());
    }
}