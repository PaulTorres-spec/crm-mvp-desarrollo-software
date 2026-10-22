package com.textilamazonas.crm.cliente;

import java.util.Collection;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Acceso a la tabla cliente. */
public interface ClienteRepositorio extends JpaRepository<Cliente, Long> {

    /** SELECT count(*) > 0 FROM cliente WHERE numero_documento = ? — para el 409 DUPLICADO. */
    boolean existsByNumeroDocumento(String numeroDocumento);

    /**
     * CU05: busca por texto (razón social o documento) y por tipos de cliente, de a una página.
     * Spring Data agrega el ORDER BY, el LIMIT/OFFSET y un SELECT COUNT para el total.
     */
    @Query("""
            SELECT c FROM Cliente c
            WHERE c.tipoCliente IN :tipos
              AND (LOWER(c.razonSocial) LIKE CONCAT('%', :texto, '%')
                   OR c.numeroDocumento LIKE CONCAT('%', :texto, '%'))
            """)
    Page<Cliente> buscar(@Param("texto") String texto,
                         @Param("tipos") Collection<TipoCliente> tipos,
                         Pageable pageable);
}