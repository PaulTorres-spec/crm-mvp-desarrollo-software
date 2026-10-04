package com.textilamazonas.crm.common;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Convierte las excepciones en respuestas con el formato estándar de error.
 */
@RestControllerAdvice
public class ManejadorGlobalErrores {

    /** 400: un @Valid falló (campo vacío, formato inválido, etc.). */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorRespuesta> validacion(MethodArgumentNotValidException ex) {
        List<ErrorRespuesta.CampoError> errores = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new ErrorRespuesta.CampoError(error.getField(), error.getDefaultMessage()))
                .toList();
        return ResponseEntity.badRequest()
                .body(ErrorRespuesta.de(400, "VALIDACION", "Hay campos con errores.", errores));
    }
}