package com.textilamazonas.crm.cliente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * JSON de PUT /api/clientes/{id} (contrato M2, CU07). Sin tipo ni número de documento:
 * no se pueden modificar (pantalla 07). Mismas reglas y mensajes del CU04 que ClienteSolicitud.
 */
public record ClienteEdicionSolicitud(

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

    /** Misma limpieza que el registro, antes de validar. */
    public ClienteEdicionSolicitud {
        razonSocial = ClienteSolicitud.limpiar(razonSocial);
        tipoCliente = ClienteSolicitud.limpiar(tipoCliente);
        personaContacto = ClienteSolicitud.limpiar(personaContacto);
        telefono = ClienteSolicitud.sinEspacios(telefono);
        correo = ClienteSolicitud.limpiar(correo);
        direccion = ClienteSolicitud.limpiar(direccion);
    }
}