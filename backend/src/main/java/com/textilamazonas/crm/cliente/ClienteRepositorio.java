package com.textilamazonas.crm.cliente;

import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso a la tabla cliente. */
public interface ClienteRepositorio extends JpaRepository<Cliente, Long> {

    /** SELECT count(*) > 0 FROM cliente WHERE numero_documento = ? — para el 409 DUPLICADO. */
    boolean existsByNumeroDocumento(String numeroDocumento);
}