package com.textilamazonas.crm.venta;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo del POST /api/ventas (contrato M3, CU08 y CU09).
 * No trae subtotal, IGV, total ni número: los calcula el backend.
 */
public record VentaSolicitud(

        @NotNull(message = "Selecciona un cliente.")
        Long clienteId,

        @NotNull(message = "La fecha es obligatoria.")
        @PastOrPresent(message = "La fecha no puede ser futura.")
        LocalDate fecha,

        @Size(max = 300, message = "Las observaciones admiten hasta 300 caracteres.")
        String observaciones,

        @NotEmpty(message = "Agrega al menos un producto.")
        @Size(max = 20, message = "Una venta admite hasta 20 productos.")
        List<@NotNull(message = "Selecciona un producto.") @Valid ItemVentaSolicitud> items) {

    /** Constructor compacto: observaciones sin espacios sobrantes; si queda vacía, null. */
    public VentaSolicitud {
        if (observaciones != null) {
            observaciones = observaciones.isBlank() ? null : observaciones.trim();
        }
    }
}