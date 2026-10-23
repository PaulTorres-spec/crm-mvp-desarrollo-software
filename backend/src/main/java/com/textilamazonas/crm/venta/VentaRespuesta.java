package com.textilamazonas.crm.venta;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.textilamazonas.crm.cliente.Cliente;
import com.textilamazonas.crm.cliente.TipoCliente;
import com.textilamazonas.crm.cliente.TipoDocumento;
import com.textilamazonas.crm.producto.Producto;

/** Venta completa tal como la recibe el frontend (contrato M3, sección 5). También es el 201 del POST. */
public record VentaRespuesta(
        Long id,
        String numero,
        LocalDate fecha,
        ClienteVenta cliente,
        String observaciones,
        List<ItemVenta> items,
        BigDecimal subtotal,
        BigDecimal igv,
        BigDecimal total,
        String registradoPor,
        LocalDateTime fechaRegistro) {

    /** Datos mínimos del cliente para mostrar la venta. */
    public record ClienteVenta(Long id, TipoDocumento tipoDocumento, String numeroDocumento,
            String razonSocial, TipoCliente tipoCliente) {
    }

    /** Una línea de la venta con los datos del producto. */
    public record ItemVenta(Long productoId, String codigo, String nombre, String unidadMedida,
            BigDecimal cantidad, BigDecimal precioUnitario, BigDecimal subtotal) {
    }

    public static VentaRespuesta de(Venta venta) {
        Cliente c = venta.getCliente();
        return new VentaRespuesta(
                venta.getId(),
                venta.getNumero(),
                venta.getFecha(),
                new ClienteVenta(c.getId(), c.getTipoDocumento(), c.getNumeroDocumento(),
                        c.getRazonSocial(), c.getTipoCliente()),
                venta.getObservaciones(),
                venta.getItems().stream().map(VentaRespuesta::item).toList(),
                venta.getSubtotal(),
                venta.getIgv(),
                venta.getTotal(),
                venta.getRegistradoPor().getNombre(),
                venta.getFechaRegistro().withNano(0));
    }

    private static ItemVenta item(DetalleVenta detalle) {
        Producto p = detalle.getProducto();
        return new ItemVenta(p.getId(), p.getCodigo(), p.getNombre(), p.getUnidadMedida(),
                detalle.getCantidad(), detalle.getPrecioUnitario(), detalle.getSubtotal());
    }
}