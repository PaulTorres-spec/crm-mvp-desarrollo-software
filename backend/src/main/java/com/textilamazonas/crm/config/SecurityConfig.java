package com.textilamazonas.crm.config;

import java.util.Base64;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

/**
 * Reglas de seguridad del CRM: API sin sesiones, autenticada con JWT firmado (HS256).
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    /** Qué rutas son públicas y cuáles exigen token. */
    @Bean
    SecurityFilterChain filtrosDeSeguridad(HttpSecurity http) throws Exception {
        http
            // CSRF protege formularios con cookies; esta API usa tokens, no cookies
            .csrf(csrf -> csrf.disable())
            // Sin sesión en el servidor: cada petición trae su propio token
            .sessionManagement(sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(rutas -> rutas
                .requestMatchers("/api/health", "/api/auth/login").permitAll()
                .anyRequest().authenticated())
            // Valida el JWT que llega en la cabecera "Authorization: Bearer <token>"
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        return http.build();
    }

    /** La clave secreta, leída de app.jwt.secreto (que viene de JWT_SECRET en .env). */
    @Bean
    SecretKey claveJwt(@Value("${app.jwt.secreto}") String secretoBase64) {
        byte[] bytes = Base64.getDecoder().decode(secretoBase64);
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    /** Verifica la firma de los tokens que recibimos. */
    @Bean
    JwtDecoder jwtDecoder(SecretKey claveJwt) {
        return NimbusJwtDecoder.withSecretKey(claveJwt).macAlgorithm(MacAlgorithm.HS256).build();
    }

    /** Firma los tokens que entregamos en el login (se usa en el paso 4). */
    @Bean
    JwtEncoder jwtEncoder(SecretKey claveJwt) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(claveJwt));
    }

    /** Toma el claim "rol" del token (ej. COMERCIAL) y lo convierte en ROLE_COMERCIAL. */
    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter roles = new JwtGrantedAuthoritiesConverter();
        roles.setAuthoritiesClaimName("rol");
        roles.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter conversor = new JwtAuthenticationConverter();
        conversor.setJwtGrantedAuthoritiesConverter(roles);
        return conversor;
    }

    /** Cifra contraseñas con BCrypt; nunca se guardan en texto plano (se usa en el paso 4). */
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}