package com.textilamazonas.crm.venta;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/** Endpoints de ventas (contrato M3). */
@RestController
@RequestMapping("/api/ventas")
public class VentaControlador {

    private final VentaServicio ventaServicio;

    public VentaControlador(VentaServicio ventaServicio) {
        this.ventaServicio = ventaServicio;
    }

    /** CU08 Registrar venta + CU09 Asociar a cliente. Solo COMERCIAL y ADMIN; GERENCIA recibe 403. */
    @PostMapping
    @PreAuthorize("hasAnyRole('COMERCIAL', 'ADMIN')")
    public ResponseEntity<VentaRespuesta> registrar(@Valid @RequestBody VentaSolicitud solicitud,
            @AuthenticationPrincipal Jwt jwt) {
        VentaRespuesta creada = ventaServicio.registrar(solicitud, Long.valueOf(jwt.getSubject()));
        return ResponseEntity.created(URI.create("/api/ventas/" + creada.id())).body(creada);
    }
}