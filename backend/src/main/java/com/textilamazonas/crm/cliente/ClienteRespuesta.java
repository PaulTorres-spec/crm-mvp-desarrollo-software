package com.textilamazonas.crm.cliente;

import java.time.LocalDateTime;

/** Datos completos de un cliente: respuesta del registro (CU03), del detalle (CU06) y de la edición (CU07). */
public record ClienteRespuesta(
        Long id,
        TipoDocumento tipoDocumento,
        String numeroDocumento,
        String razonSocial,
        TipoCliente tipoCliente,
        String personaContacto,
        String telefono,
        String correo,
        String direccion,
        String registradoPor,
        LocalDateTime fechaRegistro,
        String editadoPor,
        LocalDateTime fechaEdicion) {

    public static ClienteRespuesta de(Cliente cliente) {
        // Mientras nadie lo edite, editado_por_id y fecha_edicion están en NULL
        String editadoPor = cliente.getEditadoPor() == null ? null : cliente.getEditadoPor().getNombre();
        LocalDateTime fechaEdicion = cliente.getFechaEdicion() == null ? null : cliente.getFechaEdicion().withNano(0);

        return new ClienteRespuesta(
                cliente.getId(),
                cliente.getTipoDocumento(),
                cliente.getNumeroDocumento(),
                cliente.getRazonSocial(),
                cliente.getTipoCliente(),
                cliente.getPersonaContacto(),
                cliente.getTelefono(),
                cliente.getCorreo(),
                cliente.getDireccion(),
                cliente.getRegistradoPor().getNombre(),
                cliente.getFechaRegistro().withNano(0),
                editadoPor,
                fechaEdicion);
    }
}