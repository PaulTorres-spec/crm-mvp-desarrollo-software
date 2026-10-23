package com.textilamazonas.crm.venta;

import java.time.Year;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.textilamazonas.crm.auth.CredencialesInvalidasException;
import com.textilamazonas.crm.auth.Usuario;
import com.textilamazonas.crm.auth.UsuarioRepositorio;
import com.textilamazonas.crm.cliente.Cliente;
import com.textilamazonas.crm.cliente.ClienteRepositorio;
import com.textilamazonas.crm.common.DatosInvalidosException;
import com.textilamazonas.crm.common.ErrorRespuesta.CampoError;
import com.textilamazonas.crm.producto.Producto;
import com.textilamazonas.crm.producto.ProductoRepositorio;

/** Lógica del CU08 Registrar venta y CU09 Asociar venta a cliente (las reglas de forma ya se validaron en VentaSolicitud). */
@Service
public class VentaServicio {

    private final VentaRepositorio ventas;
    private final ClienteRepositorio clientes;
    private final ProductoRepositorio productos;
    private final UsuarioRepositorio usuarios;

    public VentaServicio(VentaRepositorio ventas, ClienteRepositorio clientes,
            ProductoRepositorio productos, UsuarioRepositorio usuarios) {
        this.ventas = ventas;
        this.clientes = clientes;
        this.productos = productos;
        this.usuarios = usuarios;
    }

    @Transactional
    public VentaRespuesta registrar(VentaSolicitud solicitud, Long idUsuario) {
        List<CampoError> errores = new ArrayList<>();

        // CU09: la venta solo puede asociarse a un cliente registrado
        Cliente cliente = clientes.findById(solicitud.clienteId()).orElse(null);
        if (cliente == null) {
            errores.add(new CampoError("clienteId", "El cliente no existe."));
        }

        // Todos los productos en UNA consulta (WHERE id IN (...)), solo los activos
        Set<Long> ids = solicitud.items().stream()
                .map(ItemVentaSolicitud::productoId)
                .collect(Collectors.toSet());
        Map<Long, Producto> catalogo = productos.findAllById(ids).stream()
                .filter(Producto::isActivo)
                .collect(Collectors.toMap(Producto::getId, Function.identity()));

        // Cada ítem: el producto debe existir y no repetirse en la misma venta
        Set<Long> vistos = new HashSet<>();
        for (int i = 0; i < solicitud.items().size(); i++) {
            Long productoId = solicitud.items().get(i).productoId();
            String campo = "items[" + i + "].productoId";
            if (!catalogo.containsKey(productoId)) {
                errores.add(new CampoError(campo, "El producto no existe."));
            } else if (!vistos.add(productoId)) {
                errores.add(new CampoError(campo, "El producto está repetido."));
            }
        }

        // Todos los errores juntos, en una sola respuesta 400
        if (!errores.isEmpty()) {
            throw new DatosInvalidosException(errores);
        }

        // Quien registra es el usuario del token (nunca un dato que mande el frontend)
        Usuario registrador = usuarios.findById(idUsuario)
                .orElseThrow(() -> new CredencialesInvalidasException(
                        "Tu sesión ya no es válida. Inicia sesión de nuevo."));

        Venta venta = new Venta(siguienteNumero(), cliente, solicitud.fecha(),
                solicitud.observaciones(), registrador);
        for (ItemVentaSolicitud item : solicitud.items()) {
            // setScale(2): 120 → 120.00 (la validación ya garantizó como máximo 2 decimales)
            venta.agregarItem(catalogo.get(item.productoId()),
                    item.cantidad().setScale(2),
                    item.precioUnitario().setScale(2));
        }

        // Un solo save: la venta y sus líneas se guardan juntas (cascade); si algo falla, no se guarda nada
        return VentaRespuesta.de(ventas.save(venta));
    }

    /** V-AAAA-NNNN: año actual + correlativo de la secuencia con al menos 4 dígitos (V-2026-0001). */
    private String siguienteNumero() {
        return String.format("V-%d-%04d", Year.now().getValue(), ventas.siguienteCorrelativo());
    }
}