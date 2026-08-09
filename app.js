// ==========================================
// 1. IMPORTAR LA CONEXIÓN A SUPABASE
// ==========================================
import { supabase } from './conexion.js';

// ==========================================
// FUNCIÓN 1: CARGAR EL CATÁLOGO (CON CACHÉ Y ANIMACIÓN)
// ==========================================
async function cargarCatalogo() {
    const contenedor = document.getElementById('catalogo-container');
    const catalogoGuardado = sessionStorage.getItem('catalogoStarbucks');
    
    if (catalogoGuardado) {
        renderizarTarjetas(JSON.parse(catalogoGuardado), contenedor);
        return; 
    }

    try {
        contenedor.innerHTML = `
            <div style="text-align: center; width: 100%; padding: 40px;">
                <div style="border: 4px solid rgba(0,0,0,0.1); width: 40px; height: 40px; border-radius: 50%; border-left-color: var(--verde-sirena); animation: spin 1s linear infinite; margin: 0 auto;"></div>
                <p style="color: #777; margin-top: 15px; font-weight: bold;">Conectando con Supabase y preparando tu café...</p>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            </div>
        `;

        const { data: productos, error } = await supabase.from('t_producto').select('*');
        if (error) throw error;
        
        sessionStorage.setItem('catalogoStarbucks', JSON.stringify(productos));
        renderizarTarjetas(productos, contenedor);
        
    } catch (error) {
        console.error("Error al cargar productos:", error);
        contenedor.innerHTML = '<p style="color: red; text-align: center; width: 100%;">Error al conectar con la base de datos.</p>';
    }
}

function renderizarTarjetas(productos, contenedor) {
    contenedor.innerHTML = ''; 
    if (productos.length === 0) {
        contenedor.innerHTML = '<p style="color: var(--cafe-oscuro); text-align: center; width: 100%;">No hay productos disponibles.</p>';
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
                    <button onclick="agregarAlCarrito('${prod.nombre}', ${prod.precio})" class="btn-primary" style="width: 100%; border: none; cursor: pointer; padding: 12px; border-radius: 25px; transition: 0.3s;">Agregar al pedido</button>
                </div>
            </div>
        `;
        contenedor.innerHTML += tarjetaHTML;
    });
}

// ==========================================
// FUNCIÓN 2: REGISTRAR UN NUEVO CLIENTE (Guarda ID)
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
            .insert([{ nombre_completo: nombre, apellido_paterno: apaterno, apellido_materno: amaterno, telefono: telefono, dni: dni, ruc: ruc, correo: correo, contrasena: contrasena }])
            .select(); 
            
        if (error) throw error;
        
        const nuevoCliente = data[0]; 
        localStorage.setItem('usuarioStarbucks', JSON.stringify({ 
            id_cliente: nuevoCliente.id_cliente, 
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
// FUNCIÓN 3: ACTUALIZAR EL HEADER
// ==========================================
function actualizarHeader() {
    const contenedorUsuario = document.getElementById('menu-usuario');
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioStarbucks'));

    if (usuarioGuardado && contenedorUsuario) {
        const primerNombre = usuarioGuardado.nombre.split(' ')[0];
        contenedorUsuario.innerHTML = `
            <span style="color: var(--blanco); font-weight: bold; margin-right: 15px; font-size: 1.1rem;">Bienvenido, ${primerNombre}</span>
            <button onclick="abrirCarrito()" style="background: var(--verde-menta); color: var(--verde-sirena); border: none; padding: 8px 15px; border-radius: 20px; cursor: pointer; font-weight: bold; margin-right: 10px;">🛒 Carrito</button>
            <button onclick="cerrarSesion()" style="background: transparent; border: 1px solid var(--blanco); color: var(--blanco); padding: 8px 15px; border-radius: 20px; cursor: pointer; font-weight: bold;">Salir</button>
        `;
    }
}

// ==========================================
// FUNCIÓN 4: CERRAR SESIÓN
// ==========================================
window.cerrarSesion = function() {
    localStorage.removeItem('usuarioStarbucks'); 
    localStorage.removeItem('carritoStarbucks'); 
    location.reload(); 
}

// ==========================================
// FUNCIÓN 5: INICIAR SESIÓN (Guarda ID)
// ==========================================
async function iniciarSesion(event) {
    event.preventDefault();
    const correo = document.getElementById('login-correo').value;
    const contrasena = document.getElementById('login-password').value;
    
    try {
        const { data: cliente, error } = await supabase.from('t_cliente').select('*').eq('correo', correo).eq('contrasena', contrasena).single(); 
        if (error) throw error;
        
        if (cliente) {
            localStorage.setItem('usuarioStarbucks', JSON.stringify({ 
                id_cliente: cliente.id_cliente, 
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
// FUNCIÓN 6: SISTEMA DEL CARRITO
// ==========================================
window.agregarAlCarrito = function(nombreProducto, precio) {
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioStarbucks'));
    if (!usuarioGuardado) {
        alert(`¡Hola! Para pedir un ${nombreProducto}, por favor inicia sesión o regístrate primero.`);
        document.getElementById('modal-login').style.display = 'flex';
        return; 
    }

    let carrito = JSON.parse(localStorage.getItem('carritoStarbucks')) || [];
    const indice = carrito.findIndex(item => item.nombre === nombreProducto);
    if(indice !== -1) carrito[indice].cantidad += 1;
    else carrito.push({ nombre: nombreProducto, precio: precio, cantidad: 1 });

    localStorage.setItem('carritoStarbucks', JSON.stringify(carrito));
    renderizarCarrito(); 
    abrirCarrito(); 
}

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
                    <div><h4 style="color: var(--verde-sirena); margin: 0 0 5px 0; font-size: 1.1rem;">${item.nombre}</h4><span style="color: #777; font-size: 0.9rem;">S/ ${item.precio.toFixed(2)} x ${item.cantidad}</span></div>
                    <div style="display: flex; align-items: center; gap: 15px;"><span style="font-weight: bold; font-size: 1.1rem;">S/ ${(item.precio * item.cantidad).toFixed(2)}</span><button onclick="eliminarDelCarrito(${index})" style="background: #ff4d4d; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-weight: bold;">X</button></div>
                </div>
            `;
        });
    }
    totalElemento.innerText = `S/ ${total.toFixed(2)}`;
}

window.eliminarDelCarrito = function(index) {
    let carrito = JSON.parse(localStorage.getItem('carritoStarbucks')) || [];
    carrito.splice(index, 1);
    localStorage.setItem('carritoStarbucks', JSON.stringify(carrito));
    renderizarCarrito();
}

window.abrirCarrito = function() {
    document.getElementById('panel-carrito').style.display = 'flex';
    document.getElementById('overlay-carrito').style.display = 'block';
    renderizarCarrito();
    setTimeout(() => { document.getElementById('panel-carrito').style.right = '0'; }, 10);
}

window.cerrarCarrito = function() {
    document.getElementById('panel-carrito').style.right = '-400px';
    document.getElementById('overlay-carrito').style.display = 'none';
    setTimeout(() => { document.getElementById('panel-carrito').style.display = 'none'; }, 300);
}

// ==========================================
// FUNCIÓN 7: ABRIR MODAL DE PAGOS
// ==========================================
window.procesarCompra = function() {
    const carrito = JSON.parse(localStorage.getItem('carritoStarbucks')) || [];
    if (carrito.length === 0) {
        alert("Agrega al menos un producto para confirmar tu pedido.");
        return;
    }
    document.getElementById('modal-pago').style.display = 'flex';
}

// ==========================================
// FUNCIÓN 8: FINALIZAR PEDIDO EN SUPABASE (VENTA REAL)
// ==========================================
window.finalizarPedido = async function(metodoPago) {
    const carrito = JSON.parse(localStorage.getItem('carritoStarbucks')) || [];
    const usuario = JSON.parse(localStorage.getItem('usuarioStarbucks'));
    
    if (!usuario.id_cliente) {
        alert("Tu sesión está desactualizada. Por favor, cierra sesión y vuelve a ingresar para comprar.");
        return;
    }

    try {
        let totalVenta = 0;
        carrito.forEach(item => totalVenta += (item.precio * item.cantidad));

        let idFormaPago = 4; // 4 = Efectivo
        if (metodoPago === 'Yape' || metodoPago === 'Plin') idFormaPago = 1;
        else if (metodoPago === 'Tarjeta') idFormaPago = 2; 

        let idComprobante = 1; // 1 = Boleta
        let textoComprobante = "BOLETA ELECTRÓNICA";
        if (usuario.ruc && usuario.ruc.trim() !== "" && usuario.ruc !== "EMPTY") {
            idComprobante = 2; // 2 = Factura
            textoComprobante = "FACTURA ELECTRÓNICA";
        }

        // Insertar en tu tabla t_ventas
        const { data: venta, error: errorVenta } = await supabase
            .from('t_ventas')
            .insert([{ id_cliente: usuario.id_cliente, id_forma_pago: idFormaPago, id_comprobante: idComprobante, subtotal: totalVenta, total: totalVenta, estado_orden: 'Recibido' }]);

        if (errorVenta) throw errorVenta;

        alert(`¡Venta registrada oficialmente en base de datos!\n\nPagaste con ${metodoPago} y tu ${textoComprobante} ha sido generada por un total de S/ ${totalVenta.toFixed(2)}.`);
        
        document.getElementById('modal-pago').style.display = 'none';
        localStorage.removeItem('carritoStarbucks');
        renderizarCarrito();
        cerrarCarrito();

    } catch (error) {
        console.error("Error crítico al procesar venta en Supabase:", error);
        alert("Hubo un problema procesando tu pedido. Intenta nuevamente.");
    }
}

// ==========================================
// INICIALIZACIÓN: (¡EL MOTOR DE ARRANQUE!)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    cargarCatalogo();
    actualizarHeader(); 
    
    const formRegistro = document.getElementById('form-registro');
    if(formRegistro) formRegistro.addEventListener('submit', registrarCliente);

    const formLogin = document.getElementById('form-login');
    if(formLogin) formLogin.addEventListener('submit', iniciarSesion);
});