package com.textilamazonas.crm.venta;

/** CU10: no existe una venta con ese id → 404 NO_ENCONTRADO. */
public class VentaNoEncontradaException extends RuntimeException {

    public VentaNoEncontradaException() {
        super("No existe una venta con ese identificador.");
    }
}