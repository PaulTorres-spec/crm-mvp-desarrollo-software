package com.textilamazonas.crm.cliente;

/** CU06/CU07: no existe un cliente con ese id → 404 NO_ENCONTRADO. */
public class ClienteNoEncontradoException extends RuntimeException {

    public ClienteNoEncontradoException() {
        super("No existe un cliente con ese identificador.");
    }
}