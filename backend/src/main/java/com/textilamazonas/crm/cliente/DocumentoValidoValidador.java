package com.textilamazonas.crm.cliente;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/** Revisa numeroDocumento según tipoDocumento y marca el error en el campo numeroDocumento. */
public class DocumentoValidoValidador implements ConstraintValidator<DocumentoValido, ClienteSolicitud> {

    @Override
    public boolean isValid(ClienteSolicitud solicitud, ConstraintValidatorContext contexto) {
        // Si falta el tipo o el número, ya lo reportan @NotBlank/@Pattern: no repetimos el error
        if (solicitud == null || solicitud.tipoDocumento() == null || solicitud.numeroDocumento() == null) {
            return true;
        }

        String numero = solicitud.numeroDocumento();
        String mensaje = switch (solicitud.tipoDocumento()) {
            case "RUC" -> numero.matches("(10|20)\\d{9}") ? null : "El RUC debe tener 11 dígitos y empezar en 10 o 20.";
            case "DNI" -> numero.matches("\\d{8}") ? null : "El DNI debe tener 8 dígitos.";
            default -> null; // tipo inválido: ya lo reporta @Pattern en tipoDocumento
        };

        if (mensaje == null) {
            return true;
        }

        // Reemplazamos el mensaje por defecto y lo asignamos al campo numeroDocumento
        contexto.disableDefaultConstraintViolation();
        contexto.buildConstraintViolationWithTemplate(mensaje)
                .addPropertyNode("numeroDocumento")
                .addConstraintViolation();
        return false;
    }
}