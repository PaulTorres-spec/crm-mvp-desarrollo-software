package com.textilamazonas.crm.producto;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Producto del catálogo (tabla producto, migraciones V30 y V31). En el MVP es de solo lectura. */
@Entity
@Table(name = "producto")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20, unique = true)
    private String codigo;

    @Column(nullable = false, length = 120, unique = true)
    private String nombre;

    @Column(nullable = false, length = 10)
    private String unidadMedida;

    /** NUMERIC(10,2) en la BD: BigDecimal guarda el valor exacto, sin errores de redondeo. */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioReferencial;

    @Column(nullable = false)
    private boolean activo;

    /** Constructor vacío que JPA necesita. No hay otro: el catálogo se carga por migración. */
    protected Producto() {
    }

    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public String getNombre() { return nombre; }
    public String getUnidadMedida() { return unidadMedida; }
    public BigDecimal getPrecioReferencial() { return precioReferencial; }
    public boolean isActivo() { return activo; }
}