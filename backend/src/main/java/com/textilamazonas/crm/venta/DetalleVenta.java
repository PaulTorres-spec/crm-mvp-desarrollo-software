package com.textilamazonas.crm.venta;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.textilamazonas.crm.producto.Producto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Línea de una venta: un producto con su cantidad y precio (tabla detalle_venta, migración V32). */
@Entity
@Table(name = "detalle_venta")
public class DetalleVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "venta_id", nullable = false, updatable = false)
    private Venta venta;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false, updatable = false)
    private Producto producto;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidad;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    /** cantidad × precioUnitario redondeado a 2 decimales (el CHECK de V32 exige lo mismo). */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    /** Constructor vacío que JPA necesita. */
    protected DetalleVenta() {
    }

    /** Sin "public": solo Venta.agregarItem (mismo paquete) crea líneas. */
    DetalleVenta(Venta venta, Producto producto, BigDecimal cantidad, BigDecimal precioUnitario) {
        this.venta = venta;
        this.producto = producto;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = cantidad.multiply(precioUnitario).setScale(2, RoundingMode.HALF_UP);
    }

    public Long getId() { return id; }
    public Venta getVenta() { return venta; }
    public Producto getProducto() { return producto; }
    public BigDecimal getCantidad() { return cantidad; }
    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public BigDecimal getSubtotal() { return subtotal; }
}