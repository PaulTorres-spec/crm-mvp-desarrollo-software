package com.textilamazonas.crm.cliente;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

/** Parámetros de GET /api/clientes (contrato M2, CU05). Spring los llena desde la URL. */
public record ClienteBusqueda(
        String texto,

        @Pattern(regexp = "CONFECCIONISTA|DISTRIBUIDOR|INSTITUCIONAL", message = "Selecciona un tipo de cliente válido.")
        String tipoCliente,

        @Min(value = 0, message = "La página no puede ser negativa.")
        Integer pagina,

        @Min(value = 1, message = "El tamaño de página debe estar entre 1 y 50.")
        @Max(value = 50, message = "El tamaño de página debe estar entre 1 y 50.")
        Integer tamano) {

    /** Valores por defecto y limpieza, antes de validar (igual que en ClienteSolicitud). */
    public ClienteBusqueda {
        texto = (texto == null) ? "" : texto.trim().toLowerCase();
        tipoCliente = (tipoCliente == null || tipoCliente.isBlank()) ? null : tipoCliente.trim();
        pagina = (pagina == null) ? 0 : pagina;
        tamano = (tamano == null) ? 8 : tamano;
    }
}