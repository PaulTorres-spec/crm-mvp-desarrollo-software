package com.textilamazonas.crm.venta;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

/** Acceso a las tablas venta y detalle_venta (el detalle se guarda en cascada con la venta). */
public interface VentaRepositorio extends JpaRepository<Venta, Long> {

    /** Pide el siguiente número a la secuencia de PostgreSQL (nunca repite, aunque haya usuarios simultáneos). */
    @Query(value = "SELECT nextval('venta_correlativo_seq')", nativeQuery = true)
    long siguienteCorrelativo();

    /**
     * CU10/CU11: una página de ventas entre dos fechas y, si clienteId > 0, solo de ese cliente.
     * JOIN FETCH trae el cliente y el usuario en la MISMA consulta (evita el problema N+1).
     * Un JOIN FETCH no sirve para contar, por eso el COUNT va aparte en countQuery.
     */
    @Query(value = """
            SELECT v FROM Venta v
            JOIN FETCH v.cliente
            JOIN FETCH v.registradoPor
            WHERE v.fecha BETWEEN :desde AND :hasta
              AND (:clienteId = 0 OR v.cliente.id = :clienteId)
            """,
            countQuery = """
            SELECT COUNT(v) FROM Venta v
            WHERE v.fecha BETWEEN :desde AND :hasta
              AND (:clienteId = 0 OR v.cliente.id = :clienteId)
            """)
    Page<Venta> buscar(@Param("desde") LocalDate desde,
                       @Param("hasta") LocalDate hasta,
                       @Param("clienteId") long clienteId,
                       Pageable pageable);

    /** Suma de los totales de TODAS las ventas del mismo filtro (0 si no hay ninguna). */
    @Query("""
            SELECT COALESCE(SUM(v.total), 0) FROM Venta v
            WHERE v.fecha BETWEEN :desde AND :hasta
              AND (:clienteId = 0 OR v.cliente.id = :clienteId)
            """)
    BigDecimal sumarTotal(@Param("desde") LocalDate desde,
                          @Param("hasta") LocalDate hasta,
                          @Param("clienteId") long clienteId);
}