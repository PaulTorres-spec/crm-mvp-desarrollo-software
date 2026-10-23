package com.textilamazonas.crm.producto;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Catálogo de productos para el formulario de venta (contrato M3: apoyo a CU08). */
@RestController
@RequestMapping("/api/productos")
public class ProductoControlador {

    private final ProductoRepositorio productos;

    public ProductoControlador(ProductoRepositorio productos) {
        this.productos = productos;
    }

    /** Productos activos ordenados por nombre. Cualquier rol con sesión. */
    @GetMapping
    public List<ProductoRespuesta> listar() {
        return productos.findByActivoTrueOrderByNombreAsc().stream()
                .map(ProductoRespuesta::de)
                .toList();
    }
}