package com.textilamazonas.crm.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso a la tabla usuario. Spring Data genera la implementación sola. */
public interface UsuarioRepositorio extends JpaRepository<Usuario, Long> {

    /** Spring arma el SQL a partir del nombre: SELECT ... FROM usuario WHERE correo = ? */
    Optional<Usuario> findByCorreo(String correo);
}