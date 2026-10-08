package com.textilamazonas.crm.cliente;

import java.time.LocalDateTime;

import com.textilamazonas.crm.auth.Usuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Cliente de Textil El Amazonas (tabla cliente, migración V12). */
@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    private TipoDocumento tipoDocumento;

    @Column(nullable = false, length = 11, unique = true)
    private String numeroDocumento;

    @Column(nullable = false, length = 150)
    private String razonSocial;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoCliente tipoCliente;

    @Column(length = 100)
    private String personaContacto;

    @Column(nullable = false, length = 9)
    private String telefono;

    @Column(length = 120)
    private String correo;

    @Column(length = 200)
    private String direccion;

    /** Usuario que registró al cliente (FK registrado_por_id → usuario.id). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registrado_por_id", nullable = false, updatable = false)
    private Usuario registradoPor;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    /** Último usuario que lo editó (lo llenará el CU07 en M2). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "editado_por_id")
    private Usuario editadoPor;

    private LocalDateTime fechaEdicion;

    /** Constructor vacío que JPA necesita. */
    protected Cliente() {
    }

    public Cliente(TipoDocumento tipoDocumento, String numeroDocumento, String razonSocial,
            TipoCliente tipoCliente, String personaContacto, String telefono, String correo,
            String direccion, Usuario registradoPor) {
        this.tipoDocumento = tipoDocumento;
        this.numeroDocumento = numeroDocumento;
        this.razonSocial = razonSocial;
        this.tipoCliente = tipoCliente;
        this.personaContacto = personaContacto;
        this.telefono = telefono;
        this.correo = correo;
        this.direccion = direccion;
        this.registradoPor = registradoPor;
        this.fechaRegistro = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public TipoDocumento getTipoDocumento() { return tipoDocumento; }
    public String getNumeroDocumento() { return numeroDocumento; }
    public String getRazonSocial() { return razonSocial; }
    public TipoCliente getTipoCliente() { return tipoCliente; }
    public String getPersonaContacto() { return personaContacto; }
    public String getTelefono() { return telefono; }
    public String getCorreo() { return correo; }
    public String getDireccion() { return direccion; }
    public Usuario getRegistradoPor() { return registradoPor; }
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public Usuario getEditadoPor() { return editadoPor; }
    public LocalDateTime getFechaEdicion() { return fechaEdicion; }
}