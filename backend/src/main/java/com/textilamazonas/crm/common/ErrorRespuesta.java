package com.textilamazonas.crm.common;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Formato estándar de error de la API (ver docs/api/contrato-M1.md).
 */
public record ErrorRespuesta(int estado, String codigo, String mensaje, List<CampoError> errores, LocalDateTime fecha) {

    /** Error de un campo concreto, por ejemplo: numeroDocumento → "El RUC debe tener 11 dígitos." */
    public record CampoError(String campo, String mensaje) {
    }

    public static ErrorRespuesta de(int estado, String codigo, String mensaje, List<CampoError> errores) {
        return new ErrorRespuesta(estado, codigo, mensaje, errores, LocalDateTime.now().withNano(0));
    }
}