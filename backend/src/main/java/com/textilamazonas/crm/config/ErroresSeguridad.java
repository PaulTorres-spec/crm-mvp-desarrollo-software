package com.textilamazonas.crm.config;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Responde 401 y 403 con el formato estándar de error del contrato.
 */
@Component
public class ErroresSeguridad implements AuthenticationEntryPoint, AccessDeniedHandler {

    /** 401: sin token, token vencido o con firma inválida. */
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException ex) throws IOException {
        response.setHeader("WWW-Authenticate", "Bearer");
        escribir(response, 401, "NO_AUTENTICADO", "Debes iniciar sesión para acceder a este recurso.");
    }

    /** 403: el token es válido, pero el rol no tiene permiso. */
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException ex) throws IOException {
        escribir(response, 403, "SIN_PERMISO", "No tienes permiso para realizar esta acción.");
    }

    private void escribir(HttpServletResponse response, int estado, String codigo, String mensaje)
            throws IOException {
        response.setStatus(estado);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String json = """
                {"estado":%d,"codigo":"%s","mensaje":"%s","errores":[],"fecha":"%s"}"""
                .formatted(estado, codigo, mensaje, LocalDateTime.now().withNano(0));
        response.getWriter().write(json);
    }
}