package com.textilamazonas.crm.venta;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.textilamazonas.crm.auth.Usuario;
import com.textilamazonas.crm.cliente.Cliente;
import com.textilamazonas.crm.producto.Producto;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

/** Venta registrada a un cliente (tabla venta, migración V32). CU08 y CU09. */
@Entity
@Table(name = "venta")
public class Venta {

    /** IGV vigente en Perú: 18 %. */
    public static final BigDecimal TASA_IGV = new BigDecimal("0.18");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** V-AAAA-NNNN, generado por el servicio con la secuencia venta_correlativo_seq. */
    @Column(nullable = false, length = 15, unique = true, updatable = false)
    private String numero;

    /** CU09: toda venta pertenece a un cliente registrado. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false, updatable = false)
    private Cliente cliente;

    @Column(nullable = false, updatable = false)
    private LocalDate fecha;

    @Column(length = 300)
    private String observaciones;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal igv;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registrado_por_id", nullable = false, updatable = false)
    private Usuario registradoPor;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    /** Líneas de la venta. Se guardan junto con la venta (cascade) y en el orden en que se agregaron. */
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    private List<DetalleVenta> items = new ArrayList<>();

    /** Constructor vacío que JPA necesita. */
    protected Venta() {
    }

    public Venta(String numero, Cliente cliente, LocalDate fecha, String observaciones, Usuario registradoPor) {
        this.numero = numero;
        this.cliente = cliente;
        this.fecha = fecha;
        this.observaciones = observaciones;
        this.registradoPor = registradoPor;
        this.fechaRegistro = LocalDateTime.now();
        recalcularTotales();
    }

    /** Agrega una línea y recalcula los montos: los totales nunca quedan desactualizados. */
    public void agregarItem(Producto producto, BigDecimal cantidad, BigDecimal precioUnitario) {
        items.add(new DetalleVenta(this, producto, cantidad, precioUnitario));
        recalcularTotales();
    }

    private void recalcularTotales() {
        this.subtotal = items.stream()
                .map(DetalleVenta::getSubtotal)
                .reduce(BigDecimal.ZERO.setScale(2), BigDecimal::add);
        this.igv = subtotal.multiply(TASA_IGV).setScale(2, RoundingMode.HALF_UP);
        this.total = subtotal.add(igv);
    }

    public Long getId() { return id; }
    public String getNumero() { return numero; }
    public Cliente getCliente() { return cliente; }
    public LocalDate getFecha() { return fecha; }
    public String getObservaciones() { return observaciones; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getIgv() { return igv; }
    public BigDecimal getTotal() { return total; }
    public Usuario getRegistradoPor() { return registradoPor; }
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    /** Solo lectura: las líneas se agregan con agregarItem. */
    public List<DetalleVenta> getItems() { return Collections.unmodifiableList(items); }
}