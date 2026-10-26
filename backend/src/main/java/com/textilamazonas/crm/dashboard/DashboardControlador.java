package com.textilamazonas.crm.dashboard;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/** Endpoint del dashboard (contrato M4). Cualquier rol con sesión: no lleva @PreAuthorize. */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardControlador {

    private final DashboardServicio dashboardServicio;

    public DashboardControlador(DashboardServicio dashboardServicio) {
        this.dashboardServicio = dashboardServicio;
    }

    /** CU12 + CU13 + CU14. Ejemplo: GET /api/dashboard?desde=2026-10-01&hasta=2026-10-31 */
    @GetMapping
    public DashboardRespuesta obtener(@Valid DashboardPeriodo periodo) {
        return dashboardServicio.obtener(periodo);
    }
}