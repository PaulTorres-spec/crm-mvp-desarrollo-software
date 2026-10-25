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

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

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

    /** CU10 + CU11. Ejemplo: GET /api/ventas?desde=2026-10-01&hasta=2026-10-31&clienteId=1&pagina=0&tamano=8 */
    @GetMapping
    public VentaPaginaRespuesta buscar(@Valid VentaBusqueda busqueda) {
        return ventaServicio.buscar(busqueda);
    }

    /** CU10 Ver detalle de una venta. Cualquier rol con sesión. */
    @GetMapping("/{id}")
    public VentaRespuesta obtener(@PathVariable Long id) {
        return ventaServicio.obtener(id);
    }
}