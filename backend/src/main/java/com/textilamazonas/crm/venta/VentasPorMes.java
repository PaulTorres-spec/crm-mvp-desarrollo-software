package com.textilamazonas.crm.venta;

import java.math.BigDecimal;

/** Proyección de una fila del GROUP BY por año y mes (CU13, gráfico "Monto vendido por mes"). */
public record VentasPorMes(Integer anio, Integer mes, Long cantidad, BigDecimal montoTotal) {
}