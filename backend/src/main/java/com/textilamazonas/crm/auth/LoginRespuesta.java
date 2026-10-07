package com.textilamazonas.crm.auth;

/** Respuesta 200 de POST /api/auth/login (contrato M1, CU01). */
public record LoginRespuesta(String token, String tipo, long expiraEn, UsuarioRespuesta usuario) {
}