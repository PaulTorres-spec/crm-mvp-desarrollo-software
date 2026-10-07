package com.textilamazonas.crm.auth;

/** Datos públicos del usuario: se devuelven en el login y en GET /api/auth/yo. */
public record UsuarioRespuesta(Long id, String nombre, String correo, Rol rol) {

    /** Convierte la entidad en DTO, dejando fuera contrasenaHash. */
    public static UsuarioRespuesta de(Usuario usuario) {
        return new UsuarioRespuesta(usuario.getId(), usuario.getNombre(),
                usuario.getCorreo(), usuario.getRol());
    }
}