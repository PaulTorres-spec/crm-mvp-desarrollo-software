package com.textilamazonas.crm.venta;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** Acceso a las tablas venta y detalle_venta (el detalle se guarda en cascada con la venta). */
public interface VentaRepositorio extends JpaRepository<Venta, Long> {

    /** Pide el siguiente número a la secuencia de PostgreSQL (nunca repite, aunque haya usuarios simultáneos). */
    @Query(value = "SELECT nextval('venta_correlativo_seq')", nativeQuery = true)
    long siguienteCorrelativo();
}