package com.textilamazonas.crm.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** JSON que envía el frontend al iniciar sesión (contrato M1, CU01). */
public record LoginSolicitud(

        @NotBlank(message = "Ingresa tu correo.")
        @Email(message = "Ingresa un correo válido, por ejemplo nombre@empresa.com.")
        String correo,

        @NotBlank(message = "Ingresa tu contraseña.")
        String contrasena) {

    /** Constructor compacto: quita espacios al inicio y al final del correo antes de validarlo. */
    public LoginSolicitud {
        if (correo != null) {
            correo = correo.trim();
        }
    }
}