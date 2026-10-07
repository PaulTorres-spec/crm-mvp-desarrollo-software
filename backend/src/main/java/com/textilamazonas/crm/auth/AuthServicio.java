package com.textilamazonas.crm.auth;

import java.time.Instant;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Lógica del inicio de sesión (CU01): valida credenciales y entrega el JWT. */
@Service
public class AuthServicio {

    private final UsuarioRepositorio usuarios;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final long expiracionSegundos;

    public AuthServicio(UsuarioRepositorio usuarios, PasswordEncoder passwordEncoder, JwtEncoder jwtEncoder,
            @Value("${app.jwt.expiracion-segundos}") long expiracionSegundos) {
        this.usuarios = usuarios;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.expiracionSegundos = expiracionSegundos;
    }

    @Transactional(readOnly = true)
    public LoginRespuesta iniciarSesion(LoginSolicitud solicitud) {
        String correo = solicitud.correo().trim().toLowerCase(Locale.ROOT);

        Usuario usuario = usuarios.findByCorreo(correo)
                .filter(Usuario::isActivo)
                .filter(u -> passwordEncoder.matches(solicitud.contrasena(), u.getContrasenaHash()))
                .orElseThrow(CredencialesInvalidasException::new);

        return new LoginRespuesta(generarToken(usuario), "Bearer", expiracionSegundos,
                UsuarioRespuesta.de(usuario));
    }

    /** GET /api/auth/yo: datos del usuario dueño del token. */
    @Transactional(readOnly = true)
    public UsuarioRespuesta usuarioActual(Long id) {
        return usuarios.findById(id)
                .filter(Usuario::isActivo)
                .map(UsuarioRespuesta::de)
                .orElseThrow(() -> new CredencialesInvalidasException(
                        "Tu sesión ya no es válida. Inicia sesión de nuevo."));
    }

    /** Arma y firma el JWT (HS256) con la clave de JWT_SECRET. */
    private String generarToken(Usuario usuario) {
        Instant ahora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("crm-amazonas")
                .subject(String.valueOf(usuario.getId()))
                .issuedAt(ahora)
                .expiresAt(ahora.plusSeconds(expiracionSegundos))
                .claim("rol", usuario.getRol().name())
                .claim("nombre", usuario.getNombre())
                .build();
        JwsHeader cabecera = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(cabecera, claims)).getTokenValue();
    }
}