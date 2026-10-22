package com.textilamazonas.crm.cliente;

/** Una fila de la tabla de clientes (pantalla 03): solo lo que se muestra. */
public record ClienteResumen(
        Long id,
        TipoDocumento tipoDocumento,
        String numeroDocumento,
        String razonSocial,
        TipoCliente tipoCliente,
        String telefono,
        String correo) {

    public static ClienteResumen de(Cliente cliente) {
        return new ClienteResumen(
                cliente.getId(),
                cliente.getTipoDocumento(),
                cliente.getNumeroDocumento(),
                cliente.getRazonSocial(),
                cliente.getTipoCliente(),
                cliente.getTelefono(),
                cliente.getCorreo());
    }
}