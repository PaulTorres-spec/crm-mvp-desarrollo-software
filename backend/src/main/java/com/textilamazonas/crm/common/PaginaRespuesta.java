package com.textilamazonas.crm.common;

import java.util.List;

import org.springframework.data.domain.Page;

/** Una página de resultados con el formato del contrato M2: { contenido, pagina, tamano, totalElementos, totalPaginas }. */
public record PaginaRespuesta<T>(List<T> contenido, int pagina, int tamano, long totalElementos, int totalPaginas) {

    public static <T> PaginaRespuesta<T> de(Page<T> pagina) {
        return new PaginaRespuesta<>(
                pagina.getContent(),
                pagina.getNumber(),
                pagina.getSize(),
                pagina.getTotalElements(),
                pagina.getTotalPages());
    }
}