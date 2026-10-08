package com.textilamazonas.crm.cliente;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.textilamazonas.crm.auth.CredencialesInvalidasException;
import com.textilamazonas.crm.auth.Usuario;
import com.textilamazonas.crm.auth.UsuarioRepositorio;

/** Lógica del CU03 Registrar cliente (las reglas del CU04 ya se validaron en ClienteSolicitud). */
@Service
public class ClienteServicio {

    private final ClienteRepositorio clientes;
    private final UsuarioRepositorio usuarios;

    public ClienteServicio(ClienteRepositorio clientes, UsuarioRepositorio usuarios) {
        this.clientes = clientes;
        this.usuarios = usuarios;
    }

    @Transactional
    public ClienteRespuesta registrar(ClienteSolicitud solicitud, Long idUsuario) {
        // CU04: el documento no puede repetirse
        if (clientes.existsByNumeroDocumento(solicitud.numeroDocumento())) {
            throw new DocumentoDuplicadoException();
        }

        // Quien registra es el usuario del token (nunca un dato que mande el frontend)
        Usuario registrador = usuarios.findById(idUsuario)
                .orElseThrow(() -> new CredencialesInvalidasException(
                        "Tu sesión ya no es válida. Inicia sesión de nuevo."));

        Cliente cliente = new Cliente(
                TipoDocumento.valueOf(solicitud.tipoDocumento()),
                solicitud.numeroDocumento(),
                solicitud.razonSocial(),
                TipoCliente.valueOf(solicitud.tipoCliente()),
                solicitud.personaContacto(),
                solicitud.telefono(),
                solicitud.correo(),
                solicitud.direccion(),
                registrador);

        try {
            cliente = clientes.saveAndFlush(cliente);
        } catch (DataIntegrityViolationException ex) {
            // Dos registros del mismo documento al mismo tiempo: el UNIQUE de la V12 lo frena
            throw new DocumentoDuplicadoException();
        }

        return ClienteRespuesta.de(cliente);
    }
}