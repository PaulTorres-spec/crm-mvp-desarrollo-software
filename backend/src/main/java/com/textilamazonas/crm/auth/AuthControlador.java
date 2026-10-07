package com.textilamazonas.crm.auth;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/** Endpoints de autenticación (contrato M1: CU01 y usuario de la sesión). */
@RestController
@RequestMapping("/api/auth")
public class AuthControlador {

    private final AuthServicio authServicio;

    public AuthControlador(AuthServicio authServicio) {
        this.authServicio = authServicio;
    }

    /** CU01 Iniciar sesión. Público (permitAll en SecurityConfig). */
    @PostMapping("/login")
    public LoginRespuesta login(@Valid @RequestBody LoginSolicitud solicitud) {
        return authServicio.iniciarSesion(solicitud);
    }

    /** Usuario de la sesión actual. Requiere el header Authorization: Bearer <token>. */
    @GetMapping("/yo")
    public UsuarioRespuesta yo(@AuthenticationPrincipal Jwt jwt) {
        return authServicio.usuarioActual(Long.valueOf(jwt.getSubject()));
    }
}