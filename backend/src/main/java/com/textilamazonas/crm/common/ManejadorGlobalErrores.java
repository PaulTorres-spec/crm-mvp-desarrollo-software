package com.textilamazonas.crm.common;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.http.HttpStatus;
import com.textilamazonas.crm.auth.CredencialesInvalidasException;

import com.textilamazonas.crm.cliente.DocumentoDuplicadoException;

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
        /** 401: el login falló (mismo mensaje para correo o contraseña incorrectos). */
    @ExceptionHandler(CredencialesInvalidasException.class)
    public ResponseEntity<ErrorRespuesta> credencialesInvalidas(CredencialesInvalidasException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorRespuesta.de(401, "NO_AUTENTICADO", ex.getMessage(), List.of()));
    }

        /** 409: el número de documento ya está registrado (CU04). */
    @ExceptionHandler(DocumentoDuplicadoException.class)
    public ResponseEntity<ErrorRespuesta> duplicado(DocumentoDuplicadoException ex) {
        List<ErrorRespuesta.CampoError> errores =
                List.of(new ErrorRespuesta.CampoError("numeroDocumento", ex.getMessage()));
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorRespuesta.de(409, "DUPLICADO", ex.getMessage(), errores));
    }
}