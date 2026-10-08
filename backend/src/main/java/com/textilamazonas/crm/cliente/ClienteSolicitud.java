package com.textilamazonas.crm.cliente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** JSON que envía el frontend para registrar un cliente (contrato M1, CU03 y reglas del CU04). */
@DocumentoValido
public record ClienteSolicitud(

        @NotBlank(message = "Selecciona el tipo de documento.")
        @Pattern(regexp = "RUC|DNI", message = "Selecciona el tipo de documento.")
        String tipoDocumento,

        @NotBlank(message = "Ingresa el número de documento.")
        String numeroDocumento,

        @NotBlank(message = "Este campo es obligatorio.")
        @Size(min = 3, max = 150, message = "La razón social debe tener entre 3 y 150 caracteres.")
        String razonSocial,

        @NotBlank(message = "Selecciona el tipo de cliente.")
        @Pattern(regexp = "CONFECCIONISTA|DISTRIBUIDOR|INSTITUCIONAL", message = "Selecciona el tipo de cliente.")
        String tipoCliente,

        @Size(max = 100, message = "La persona de contacto puede tener como máximo 100 caracteres.")
        String personaContacto,

        @NotBlank(message = "Ingresa el teléfono.")
        @Pattern(regexp = "\\d{7,9}", message = "El teléfono debe tener entre 7 y 9 dígitos.")
        String telefono,

        @Email(message = "Ingresa un correo válido, por ejemplo nombre@empresa.com.")
        @Size(max = 120, message = "El correo puede tener como máximo 120 caracteres.")
        String correo,

        @Size(max = 200, message = "La dirección puede tener como máximo 200 caracteres.")
        String direccion) {

    /** Constructor compacto: limpia los datos ANTES de validarlos. */
    public ClienteSolicitud {
        tipoDocumento = limpiar(tipoDocumento);
        numeroDocumento = sinEspacios(numeroDocumento);
        razonSocial = limpiar(razonSocial);
        tipoCliente = limpiar(tipoCliente);
        personaContacto = limpiar(personaContacto);
        telefono = sinEspacios(telefono);
        correo = limpiar(correo);
        direccion = limpiar(direccion);
    }

    /** Quita espacios al inicio y al final; un texto vacío pasa a null. */
    private static String limpiar(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }
        return texto.trim();
    }

    /** Para números: quita TODOS los espacios ("987 654 321" → "987654321"). */
    private static String sinEspacios(String texto) {
        String limpio = limpiar(texto);
        return limpio == null ? null : limpio.replace(" ", "");
    }
}