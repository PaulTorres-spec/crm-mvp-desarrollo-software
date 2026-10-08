package com.textilamazonas.crm.cliente;

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

/** Endpoints de clientes (contrato M1: CU03 y CU04). */
@RestController
@RequestMapping("/api/clientes")
public class ClienteControlador {

    private final ClienteServicio clienteServicio;

    public ClienteControlador(ClienteServicio clienteServicio) {
        this.clienteServicio = clienteServicio;
    }

    /** CU03 Registrar cliente. Solo COMERCIAL y ADMIN; GERENCIA recibe 403. */
    @PostMapping
    @PreAuthorize("hasAnyRole('COMERCIAL', 'ADMIN')")
    public ResponseEntity<ClienteRespuesta> registrar(@Valid @RequestBody ClienteSolicitud solicitud,
            @AuthenticationPrincipal Jwt jwt) {
        ClienteRespuesta creado = clienteServicio.registrar(solicitud, Long.valueOf(jwt.getSubject()));
        URI ubicacion = URI.create("/api/clientes/" + creado.id());
        return ResponseEntity.created(ubicacion).body(creado);
    }
}