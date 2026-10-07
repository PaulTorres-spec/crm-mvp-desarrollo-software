package com.textilamazonas.crm.auth;

/**
 * El login falló: correo inexistente, contraseña incorrecta o usuario inactivo.
 * Siempre el mismo mensaje, para no revelar qué correos existen (contrato M1).
 */
public class CredencialesInvalidasException extends RuntimeException {

    public CredencialesInvalidasException() {
        super("Correo o contraseña incorrectos.");
    }
    /** Para otros 401 del módulo auth, con un mensaje propio. */
    public CredencialesInvalidasException(String mensaje) {
        super(mensaje);
    }
}