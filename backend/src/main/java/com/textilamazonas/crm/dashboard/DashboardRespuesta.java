package com.textilamazonas.crm.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.textilamazonas.crm.cliente.ClientesPorTipo;

/** Respuesta de GET /api/dashboard (contrato M4). Los nombres de los campos son las claves del JSON. */
public record DashboardRespuesta(
        LocalDate desde,
        LocalDate hasta,
        Clientes clientes,
        Ventas ventas,
        List<Mes> ventasPorMes) {

    /** CU12: total hasta el fin del periodo, nuevos dentro del periodo y reparto por tipo. */
    public record Clientes(long total, long nuevosEnPeriodo, List<ClientesPorTipo> porTipo) {
    }

    /** CU13: ventas del periodo y del periodo anterior (mismo número de días). */
    public record Ventas(long cantidad, BigDecimal montoTotal, Anterior anterior) {
    }

    public record Anterior(LocalDate desde, LocalDate hasta, long cantidad, BigDecimal montoTotal) {
    }

    /** Una barra del gráfico: mes en formato AAAA-MM. */
    public record Mes(String mes, long cantidad, BigDecimal montoTotal) {
    }
}