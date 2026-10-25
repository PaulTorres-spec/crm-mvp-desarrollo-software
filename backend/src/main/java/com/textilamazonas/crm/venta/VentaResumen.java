package com.textilamazonas.crm.venta;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.textilamazonas.crm.cliente.TipoCliente;

/** Una fila de la tabla de ventas (pantalla 08 y ventas del cliente en la pantalla 04). */
public record VentaResumen(
        Long id,
        String numero,
        LocalDate fecha,
        Long clienteId,
        String clienteRazonSocial,
        TipoCliente tipoCliente,
        String registradoPor,
        BigDecimal total) {

    public static VentaResumen de(Venta venta) {
        return new VentaResumen(
                venta.getId(),
                venta.getNumero(),
                venta.getFecha(),
                venta.getCliente().getId(),
                venta.getCliente().getRazonSocial(),
                venta.getCliente().getTipoCliente(),
                venta.getRegistradoPor().getNombre(),
                venta.getTotal());
    }
}