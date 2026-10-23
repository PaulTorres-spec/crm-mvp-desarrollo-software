package com.textilamazonas.crm.common;

import java.util.List;

/**
 * 400 VALIDACION detectado en un servicio: reglas que necesitan consultar la BD
 * (por ejemplo, un cliente o producto que no existe). Lleva la lista de campos con error.
 */
public class DatosInvalidosException extends RuntimeException {

    private final List<ErrorRespuesta.CampoError> errores;

    public DatosInvalidosException(List<ErrorRespuesta.CampoError> errores) {
        super("Hay campos con errores.");
        this.errores = List.copyOf(errores);
    }

    public List<ErrorRespuesta.CampoError> getErrores() {
        return errores;
    }
}