package com.textilamazonas.crm.producto;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso a la tabla producto. */
public interface ProductoRepositorio extends JpaRepository<Producto, Long> {

    /** SELECT * FROM producto WHERE activo = true ORDER BY nombre ASC — catálogo del formulario de venta. */
    List<Producto> findByActivoTrueOrderByNombreAsc();
}