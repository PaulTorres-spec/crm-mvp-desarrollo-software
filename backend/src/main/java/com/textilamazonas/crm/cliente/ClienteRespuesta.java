package com.textilamazonas.crm.cliente;

import java.time.LocalDateTime;

/** Respuesta 201 de POST /api/clientes (contrato M1, CU03). */
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
        LocalDateTime fechaRegistro) {

    public static ClienteRespuesta de(Cliente cliente) {
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
                cliente.getFechaRegistro().withNano(0));
    }
}