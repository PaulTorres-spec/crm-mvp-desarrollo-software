package com.textilamazonas.crm.cliente;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/** CU04: el número de documento debe cumplir la regla de su tipo (RUC o DNI). */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = DocumentoValidoValidador.class)
public @interface DocumentoValido {

    String message() default "El número de documento no es válido.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}