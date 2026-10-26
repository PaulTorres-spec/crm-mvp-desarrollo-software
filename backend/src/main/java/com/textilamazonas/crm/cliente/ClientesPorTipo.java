package com.textilamazonas.crm.cliente;

/** Proyección de una fila del GROUP BY por tipo (CU12). Se llena con SELECT new … en ClienteRepositorio. */
public record ClientesPorTipo(TipoCliente tipoCliente, Long cantidad) {
}