package com.textilamazonas.crm.auth;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Usuario que inicia sesión en el CRM (tabla usuario, migración V10). */
@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 120, unique = true)
    private String correo;

    @Column(nullable = false, length = 100)
    private String contrasenaHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Rol rol;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    /** Constructor vacío que JPA necesita para crear el objeto al leer de la base. */
    protected Usuario() {
    }

    public Usuario(String nombre, String correo, String contrasenaHash, Rol rol) {
        this.nombre = nombre;
        this.correo = correo;
        this.contrasenaHash = contrasenaHash;
        this.rol = rol;
        this.fechaCreacion = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getCorreo() { return correo; }
    public String getContrasenaHash() { return contrasenaHash; }
    public Rol getRol() { return rol; }
    public boolean isActivo() { return activo; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
}