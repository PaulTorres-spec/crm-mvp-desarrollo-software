package com.textilamazonas.crm.venta;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

/** Una línea del POST /api/ventas: el frontend solo manda producto, cantidad y precio (contrato M3). */
public record ItemVentaSolicitud(

        @NotNull(message = "Selecciona un producto.")
        Long productoId,

        @NotNull(message = "La cantidad debe ser mayor que 0.")
        @DecimalMin(value = "0", inclusive = false, message = "La cantidad debe ser mayor que 0.")
        @DecimalMax(value = "99999.99", message = "La cantidad no puede superar 99 999,99.")
        @Digits(integer = 8, fraction = 2, message = "La cantidad admite hasta 2 decimales.")
        BigDecimal cantidad,

        @NotNull(message = "El precio debe ser mayor que 0.")
        @DecimalMin(value = "0", inclusive = false, message = "El precio debe ser mayor que 0.")
        @DecimalMax(value = "99999.99", message = "El precio no puede superar 99 999,99.")
        @Digits(integer = 8, fraction = 2, message = "El precio admite hasta 2 decimales.")
        BigDecimal precioUnitario) {
}