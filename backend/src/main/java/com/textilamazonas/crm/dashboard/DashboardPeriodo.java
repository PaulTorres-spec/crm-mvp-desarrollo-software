package com.textilamazonas.crm.dashboard;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

/**
 * Parámetros de GET /api/dashboard (contrato M4, CU14). Spring los llena desde la URL.
 * Un texto que no es fecha da 400 "El valor no tiene un formato válido." (handler existente).
 * Las reglas que comparan las dos fechas las revisa DashboardServicio.
 */
public record DashboardPeriodo(

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate desde,

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate hasta) {
}