package com.textilamazonas.crm.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.textilamazonas.crm.cliente.ClienteRepositorio;
import com.textilamazonas.crm.cliente.ClientesPorTipo;
import com.textilamazonas.crm.cliente.TipoCliente;
import com.textilamazonas.crm.common.DatosInvalidosException;
import com.textilamazonas.crm.common.ErrorRespuesta.CampoError;
import com.textilamazonas.crm.venta.VentaRepositorio;
import com.textilamazonas.crm.venta.VentasPorMes;

/** Indicadores del dashboard (contrato M4: CU12, CU13, CU14). Solo lee; no modifica datos. */
@Service
public class DashboardServicio {

    private static final long MAXIMO_DIAS = 366;
    private static final int MESES_GRAFICO = 6;
    private static final BigDecimal CERO = new BigDecimal("0.00");

    private final ClienteRepositorio clientes;
    private final VentaRepositorio ventas;

    public DashboardServicio(ClienteRepositorio clientes, VentaRepositorio ventas) {
        this.clientes = clientes;
        this.ventas = ventas;
    }

    @Transactional(readOnly = true)
    public DashboardRespuesta obtener(DashboardPeriodo periodo) {
        // 1. Periodo aplicado (sin parámetros = mes actual) y validaciones (CU14)
        LocalDate desde;
        LocalDate hasta;
        if (periodo.desde() == null && periodo.hasta() == null) {
            YearMonth mesActual = YearMonth.now();
            desde = mesActual.atDay(1);
            hasta = mesActual.atEndOfMonth();
        } else {
            validar(periodo);
            desde = periodo.desde();
            hasta = periodo.hasta();
        }

        // 2. Periodo anterior: misma cantidad de días, termina el día antes de "desde"
        long dias = ChronoUnit.DAYS.between(desde, hasta) + 1;
        LocalDate anteriorHasta = desde.minusDays(1);
        LocalDate anteriorDesde = desde.minusDays(dias);

        return new DashboardRespuesta(
                desde,
                hasta,
                indicadoresClientes(desde, hasta),
                new DashboardRespuesta.Ventas(
                        ventas.countByFechaBetween(desde, hasta),
                        montoEntre(desde, hasta),
                        new DashboardRespuesta.Anterior(
                                anteriorDesde,
                                anteriorHasta,
                                ventas.countByFechaBetween(anteriorDesde, anteriorHasta),
                                montoEntre(anteriorDesde, anteriorHasta))),
                ventasPorMes(hasta));
    }

    /** Reglas del contrato que comparan las dos fechas (el formato lo valida Spring antes). */
    private void validar(DashboardPeriodo periodo) {
        String campo;
        String mensaje;
        if (periodo.desde() == null) {
            campo = "desde";
            mensaje = "Indica la fecha de inicio del periodo.";
        } else if (periodo.hasta() == null) {
            campo = "hasta";
            mensaje = "Indica la fecha de fin del periodo.";
        } else if (periodo.desde().isAfter(periodo.hasta())) {
            campo = "hasta";
            mensaje = "La fecha final no puede ser anterior a la inicial.";
        } else if (ChronoUnit.DAYS.between(periodo.desde(), periodo.hasta()) + 1 > MAXIMO_DIAS) {
            campo = "hasta";
            mensaje = "El periodo admite hasta 366 días.";
        } else {
            return; // todo bien
        }
        throw new DatosInvalidosException(List.of(new CampoError(campo, mensaje)));
    }

    /** CU12: fecha_registro tiene hora → intervalo semiabierto [desde 00:00, hasta+1 00:00). */
    private DashboardRespuesta.Clientes indicadoresClientes(LocalDate desde, LocalDate hasta) {
        LocalDateTime inicio = desde.atStartOfDay();
        LocalDateTime fin = hasta.plusDays(1).atStartOfDay();

        // El GROUP BY solo trae los tipos que tienen clientes → se completan los 3 en orden fijo
        Map<TipoCliente, Long> conteo = clientes.contarPorTipo(fin).stream()
                .collect(Collectors.toMap(ClientesPorTipo::tipoCliente, ClientesPorTipo::cantidad));
        List<ClientesPorTipo> porTipo = new ArrayList<>();
        for (TipoCliente tipo : TipoCliente.values()) {
            porTipo.add(new ClientesPorTipo(tipo, conteo.getOrDefault(tipo, 0L)));
        }

        return new DashboardRespuesta.Clientes(
                clientes.countByFechaRegistroBefore(fin),
                clientes.contarRegistradosEntre(inicio, fin),
                porTipo);
    }

    /** CU13: reutiliza la suma de M3 (clienteId 0 = todos); setScale(2) para que 0 salga como 0.00. */
    private BigDecimal montoEntre(LocalDate desde, LocalDate hasta) {
        return ventas.sumarTotal(desde, hasta, 0).setScale(2);
    }

    /** CU13: 6 meses que terminan en el mes de "hasta"; los meses sin ventas salen en 0. */
    private List<DashboardRespuesta.Mes> ventasPorMes(LocalDate hasta) {
        YearMonth ultimo = YearMonth.from(hasta);
        YearMonth primero = ultimo.minusMonths(MESES_GRAFICO - 1);

        Map<YearMonth, VentasPorMes> porMes = ventas.sumarPorMes(primero.atDay(1), ultimo.atEndOfMonth())
                .stream()
                .collect(Collectors.toMap(f -> YearMonth.of(f.anio(), f.mes()), Function.identity()));

        List<DashboardRespuesta.Mes> resultado = new ArrayList<>();
        for (YearMonth mes = primero; !mes.isAfter(ultimo); mes = mes.plusMonths(1)) {
            VentasPorMes fila = porMes.get(mes);
            resultado.add(fila == null
                    ? new DashboardRespuesta.Mes(mes.toString(), 0, CERO)
                    : new DashboardRespuesta.Mes(mes.toString(), fila.cantidad(), fila.montoTotal()));
        }
        return resultado;
    }
}