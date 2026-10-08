package com.textilamazonas.crm.cliente;

/** CU04: ya existe un cliente con ese número de documento → 409 DUPLICADO. */
public class DocumentoDuplicadoException extends RuntimeException {

    public DocumentoDuplicadoException() {
        super("Ya existe un cliente registrado con este documento.");
    }
}