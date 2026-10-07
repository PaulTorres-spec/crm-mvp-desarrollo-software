-- V11: usuarios de demostracion para probar el inicio de sesion (CU01).
-- Contrasena de los tres usuarios: Clave2026!
-- Solo para desarrollo y demo: en produccion se crean usuarios con contrasenas propias.
INSERT INTO usuario (nombre, correo, contrasena_hash, rol) VALUES
    ('María Quispe',      'mquispe@amazonas.com.pe', '$2a$10$HEH/c4JuFy7XFpx7uF7be.O1SM7PmbEAdPxX0kpqYpUopmKBTpj2S', 'COMERCIAL'),
    ('Jorge Salas',       'jsalas@amazonas.com.pe',  '$2a$10$voHldUHSj7z42Z.5g2p8wufcN8SE3OJ2u6/Ae/08/qZYWhFtJQr5K', 'GERENCIA'),
    ('Administrador CRM', 'admin@amazonas.com.pe',   '$2a$10$HEH/c4JuFy7XFpx7uF7be.O1SM7PmbEAdPxX0kpqYpUopmKBTpj2S', 'ADMIN');