package com.textilamazonas.crm.venta;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;

/** Parámetros de GET /api/ventas (contrato M3, CU10 y CU11). Spring los llena desde la URL. */
public record VentaBusqueda(

        /** ?desde=2026-10-01 — ISO.DATE le dice a Spring que el texto viene como AAAA-MM-DD. */
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate desde,

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate hasta,

        @Positive(message = "Selecciona un cliente válido.")
        Long clienteId,

        @Min(value = 0, message = "La página no puede ser negativa.")
        Integer pagina,

        @Min(value = 1, message = "El tamaño de página debe estar entre 1 y 50.")
        @Max(value = 50, message = "El tamaño de página debe estar entre 1 y 50.")
        Integer tamano) {

    /** Valores por defecto (igual que ClienteBusqueda). Que desde ≤ hasta lo revisa el servicio. */
    public VentaBusqueda {
        pagina = (pagina == null) ? 0 : pagina;
        tamano = (tamano == null) ? 8 : tamano;
    }
}