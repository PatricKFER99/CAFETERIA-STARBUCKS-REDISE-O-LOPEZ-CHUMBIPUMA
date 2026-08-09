// ==========================================
// 1. IMPORTAR LA CONEXIÓN A SUPABASE
// ==========================================
import { supabase } from './conexion.js';

// ==========================================
// FUNCIÓN 1: CARGAR EL CATÁLOGO DINÁMICAMENTE
// ==========================================
async function cargarCatalogo() {
    const contenedor = document.getElementById('catalogo-container');
    
    try {
        const { data: productos, error } = await supabase
            .from('t_producto') // Tabla en minúsculas
            .select('*');
            
        if (error) throw error;
        
        contenedor.innerHTML = ''; 
        
        if (productos.length === 0) {
            contenedor.innerHTML = '<p style="color: var(--cafe-oscuro);">No hay productos disponibles en este momento.</p>';
            return;
        }
        
        productos.forEach(prod => {
            let imgUrl = 'fav-1.jpg'; 
            if(prod.nombre.toLowerCase().includes('latte') || prod.nombre.toLowerCase().includes('jugo')) imgUrl = 'fav-3.jpg';
            else if(prod.nombre.toLowerCase().includes('mocha') || prod.nombre.toLowerCase().includes('descafeinado')) imgUrl = 'fav-2.jpg';
            
            const tarjetaHTML = `
                <div class="card" style="width: 30%; min-width: 250px; background-color: var(--blanco); border-radius: 15px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05); transition: transform 0.3s; margin-bottom: 20px; display: flex; flex-direction: column;">
                    <img src="${imgUrl}" alt="${prod.nombre}" style="width: 100%; height: 250px; object-fit: cover;">
                    <div class="card-info" style="padding: 20px; text-align: center; display: flex; flex-direction: column; flex-grow: 1;">
                        <h3 style="color: var(--verde-sirena); margin-bottom: 10px;">${prod.nombre}</h3>
                        <p style="color: #555; margin-bottom: 15px; font-size: 0.9rem; flex-grow: 1;">${prod.descripcion}</p>
                        <span style="display: block; font-weight: bold; font-size: 1.3rem; color: var(--cafe-oscuro); margin-bottom: 15px;">S/ ${prod.precio.toFixed(2)}</span>
                        <button onclick="agregarAlCarrito('${prod.nombre}', ${prod.precio})" class="btn-primary" style="width: 100%; border: none; cursor: pointer; padding: 12px; border-radius: 25px;">Agregar al pedido</button>
                    </div>
                </div>
            `;
            contenedor.innerHTML += tarjetaHTML;
        });
        
    } catch (error) {
        console.error("Error al cargar productos:", error);
        contenedor.innerHTML = '<p style="color: red;">Error al conectar con la base de datos.</p>';
    }
}

// ==========================================
// FUNCIÓN 2: REGISTRAR UN NUEVO CLIENTE
// ==========================================
async function registrarCliente(event) {
    event.preventDefault(); 
    
    const nombre = document.getElementById('reg-nombre').value;
    const apaterno = document.getElementById('reg-apaterno').value;
    const amaterno = document.getElementById('reg-amaterno').value;
    const telefono = document.getElementById('reg-telefono').value;
    const dni = document.getElementById('reg-dni').value;
    const ruc = document.getElementById('reg-ruc').value;
    const correo = document.getElementById('reg-correo').value;
    const contrasena = document.getElementById('reg-password').value; 
    
    try {
        const { data, error } = await supabase
            .from('t_cliente') 
            .insert([
                { 
                    nombre_completo: nombre, 
                    apellido_paterno: apaterno,
                    apellido_materno: amaterno,
                    telefono: telefono,
                    dni: dni,
                    ruc: ruc,
                    correo: correo,
                    contrasena: contrasena
                }
            ])
            .select(); // <--- ESTO ES NUEVO: Pide que devuelva los datos creados
            
        if (error) throw error;
        
        const nuevoCliente = data[0]; // Obtenemos el registro recién creado
        
        // --- GUARDAR SESIÓN CON ID INCLUIDO ---
        localStorage.setItem('usuarioStarbucks', JSON.stringify({ 
            id_cliente: nuevoCliente.id_cliente, // Guardamos la llave foránea
            nombre: nombre, 
            ruc: ruc,
            correo: correo
        }));
        actualizarHeader(); 
        
        alert('¡Cuenta creada exitosamente! Bienvenido a Starbucks Rewards.');
        document.getElementById('modal-registro').style.display = 'none';
        document.getElementById('form-registro').reset(); 
        
    } catch (error) {
        console.error("Error al registrar:", error);
        alert('Hubo un error al crear la cuenta. Verifica que el correo no esté repetido.');
    }
}

// ==========================================
// FUNCIÓN 3: ACTUALIZAR EL HEADER (BIENVENIDA + CARRITO)
// ==========================================
function actualizarHeader() {
    const contenedorUsuario = document.getElementById('menu-usuario');
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioStarbucks'));

    if (usuarioGuardado && contenedorUsuario) {
        const primerNombre = usuarioGuardado.nombre.split(' ')[0];
        
        // Agregamos el botón del carrito al menú superior
        contenedorUsuario.innerHTML = `
            <span style="color: var(--blanco); font-weight: bold; margin-right: 15px; font-size: 1.1rem;">
                Bienvenido, ${primerNombre}
            </span>
            <button onclick="abrirCarrito()" style="background: var(--verde-menta); color: var(--verde-sirena); border: none; padding: 8px 15px; border-radius: 20px; cursor: pointer; font-weight: bold; margin-right: 10px;">
                🛒 Carrito
            </button>
            <button onclick="cerrarSesion()" style="background: transparent; border: 1px solid var(--blanco); color: var(--blanco); padding: 8px 15px; border-radius: 20px; cursor: pointer; font-weight: bold;">
                Salir
            </button>
        `;
    }
}

// ==========================================
// FUNCIÓN 4: CERRAR SESIÓN
// ==========================================
window.cerrarSesion = function() {
    localStorage.removeItem('usuarioStarbucks'); 
    localStorage.removeItem('carritoStarbucks'); // Vaciamos el carrito al salir
    location.reload(); 
}

// ==========================================
// FUNCIÓN 5: INICIAR SESIÓN
// ==========================================
async function iniciarSesion(event) {
    event.preventDefault();
    
    const correo = document.getElementById('login-correo').value;
    const contrasena = document.getElementById('login-password').value;
    
    try {
        const { data: cliente, error } = await supabase
            .from('t_cliente')
            .select('*')
            .eq('correo', correo)
            .eq('contrasena', contrasena)
            .single(); 
            
        if (error) throw error;
        
        if (cliente) {
            // --- GUARDAR SESIÓN CON ID INCLUIDO ---
            localStorage.setItem('usuarioStarbucks', JSON.stringify({ 
                id_cliente: cliente.id_cliente, // Guardamos la llave foránea
                nombre: cliente.nombre_completo, 
                ruc: cliente.ruc,
                correo: cliente.correo
            }));
            
            actualizarHeader(); 
            
            const primerNombre = cliente.nombre_completo.split(' ')[0];
            alert(`¡Qué bueno verte de nuevo, ${primerNombre}!`);
            
            document.getElementById('modal-login').style.display = 'none';
            document.getElementById('form-login').reset();
        }
        
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert('Correo o contraseña incorrectos. Por favor, intenta de nuevo.');
    }
}

// ==========================================
// FUNCIÓN 6: SISTEMA DEL CARRITO (NUEVO)
// ==========================================

// 6.1 Agregar un producto a la memoria
window.agregarAlCarrito = function(nombreProducto, precio) {
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioStarbucks'));

    if (!usuarioGuardado) {
        alert(`¡Hola! Para pedir un ${nombreProducto}, por favor inicia sesión o regístrate primero.`);
        document.getElementById('modal-login').style.display = 'flex';
        return; 
    }

    let carrito = JSON.parse(localStorage.getItem('carritoStarbucks')) || [];
    
    // Verificamos si ya existe para sumar cantidad
    const indice = carrito.findIndex(item => item.nombre === nombreProducto);
    if(indice !== -1) {
        carrito[indice].cantidad += 1;
    } else {
        carrito.push({ nombre: nombreProducto, precio: precio, cantidad: 1 });
    }

    localStorage.setItem('carritoStarbucks', JSON.stringify(carrito));
    renderizarCarrito(); // Actualizamos la vista
    abrirCarrito(); // Desplegamos el menú lateral automáticamente
}

// 6.2 Dibujar los productos en el panel lateral
window.renderizarCarrito = function() {
    const carrito = JSON.parse(localStorage.getItem('carritoStarbucks')) || [];
    const contenedor = document.getElementById('items-carrito');
    const totalElemento = document.getElementById('total-carrito');
    
    contenedor.innerHTML = '';
    let total = 0;

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; color: #777; margin-top: 20px;">Tu carrito está vacío.</p>';
    } else {
        carrito.forEach((item, index) => {
            total += item.precio * item.cantidad;
            contenedor.innerHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                    <div>
                        <h4 style="color: var(--verde-sirena); margin: 0 0 5px 0; font-size: 1.1rem;">${item.nombre}</h4>
                        <span style="color: #777; font-size: 0.9rem;">S/ ${item.precio.toFixed(2)} x ${item.cantidad}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-weight: bold; font-size: 1.1rem;">S/ ${(item.precio * item.cantidad).toFixed(2)}</span>
                        <button onclick="eliminarDelCarrito(${index})" style="background: #ff4d4d; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-weight: bold;">X</button>
                    </div>
                </div>
            `;
        });
    }
    totalElemento.innerText = `S/ ${total.toFixed(2)}`;
}

// 6.3 Eliminar un producto
window.eliminarDelCarrito = function(index) {
    let carrito = JSON.parse(localStorage.getItem('carritoStarbucks')) || [];
    carrito.splice(index, 1);
    localStorage.setItem('carritoStarbucks', JSON.stringify(carrito));
    renderizarCarrito();
}

// 6.4 Efectos visuales de abrir y cerrar
window.abrirCarrito = function() {
    document.getElementById('panel-carrito').style.display = 'flex';
    document.getElementById('overlay-carrito').style.display = 'block';
    renderizarCarrito();
    // Truco para que la animación fluya
    setTimeout(() => {
        document.getElementById('panel-carrito').style.right = '0';
    }, 10);
}

window.cerrarCarrito = function() {
    document.getElementById('panel-carrito').style.right = '-400px';
    document.getElementById('overlay-carrito').style.display = 'none';
    setTimeout(() => {
        document.getElementById('panel-carrito').style.display = 'none';
    }, 300);
}

// ==========================================
// FUNCIÓN 7: PROCESAR LA COMPRA (ABRIR MODAL DE PAGO)
// ==========================================
window.procesarCompra = function() {
    const carrito = JSON.parse(localStorage.getItem('carritoStarbucks')) || [];
    if (carrito.length === 0) {
        alert("Agrega al menos un producto para confirmar tu pedido.");
        return;
    }
    // Abrimos la pasarela de pagos
    document.getElementById('modal-pago').style.display = 'flex';
}

// ==========================================
// FUNCIÓN 8: FINALIZAR PEDIDO EN SUPABASE
// ==========================================
window.finalizarPedido = async function(metodoPago) {
    const carrito = JSON.parse(localStorage.getItem('carritoStarbucks')) || [];
    const usuario = JSON.parse(localStorage.getItem('usuarioStarbucks'));
    
    // Validamos que la sesión no esté corrupta
    if (!usuario.id_cliente) {
        alert("Tu sesión está desactualizada. Por favor, cierra sesión y vuelve a ingresar para comprar.");
        return;
    }

    try {
        // 1. Calculamos el total
        let totalVenta = 0;
        carrito.forEach(item => totalVenta += (item.precio * item.cantidad));

        // 2. Mapeamos tu tabla t_forma_pago (Tus códigos de DataCraft)
        let idFormaPago = 4; // Efectivo por defecto
        if (metodoPago === 'Yape' || metodoPago === 'Plin') idFormaPago = 1;
        else if (metodoPago === 'Tarjeta') idFormaPago = 2; 

        // 3. Mapeamos tu tabla t_comprobante_pago
        let idComprobante = 1; // 1 = Boleta
        let textoComprobante = "BOLETA ELECTRÓNICA";
        if (usuario.ruc && usuario.ruc.trim() !== "" && usuario.ruc !== "EMPTY") {
            idComprobante = 2; // 2 = Factura
            textoComprobante = "FACTURA ELECTRÓNICA";
        }

        // 4. INSERTAR LA VENTA OFICIAL EN SUPABASE
        const { data: venta, error: errorVenta } = await supabase
            .from('t_ventas')
            .insert([
                {
                    id_cliente: usuario.id_cliente,
                    id_forma_pago: idFormaPago,
                    id_comprobante: idComprobante,
                    subtotal: totalVenta,
                    total: totalVenta,
                    estado_orden: 'Recibido' 
                }
            ]);

        if (errorVenta) throw errorVenta;

        // 5. Mostrar éxito al cliente y limpiar todo
        alert(`¡Venta registrada oficialmente en base de datos!\n\nPagaste con ${metodoPago} y tu ${textoComprobante} ha sido generada por un total de S/ ${totalVenta.toFixed(2)}.`);
        
        document.getElementById('modal-pago').style.display = 'none';
        localStorage.removeItem('carritoStarbucks');
        renderizarCarrito();
        cerrarCarrito();

    } catch (error) {
        console.error("Error crítico al procesar venta en Supabase:", error);
        alert("Lo sentimos, hubo un problema de conexión al procesar tu pedido. Intenta nuevamente.");
    }
}