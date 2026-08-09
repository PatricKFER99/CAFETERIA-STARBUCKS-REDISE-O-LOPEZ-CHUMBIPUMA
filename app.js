// ==========================================
// 1. IMPORTAR LA CONEXIÓN A SUPABASE
// ==========================================
import { supabase } from './conexion.js';

// ==========================================
// FUNCIÓN 1: CARGAR EL CATÁLOGO (CON CACHÉ)
// ==========================================
async function cargarCatalogo() {
    const contenedor = document.getElementById('catalogo-container');
    
    // SEGURO MULTIPÁGINA: Si no estamos en la página del catálogo, detenemos la función aquí para que no haya errores.
    if (!contenedor) return; 

    const catalogoGuardado = sessionStorage.getItem('catalogoStarbucks');
    
    if (catalogoGuardado) {
        renderizarTarjetas(JSON.parse(catalogoGuardado), contenedor);
        return; 
    }

    try {
        contenedor.innerHTML = `
            <div style="text-align: center; width: 100%; padding: 40px;">
                <div style="border: 4px solid rgba(0,0,0,0.1); width: 40px; height: 40px; border-radius: 50%; border-left-color: var(--verde-sirena); animation: spin 1s linear infinite; margin: 0 auto;"></div>
                <p style="color: #777; margin-top: 15px; font-weight: bold;">Conectando con Supabase...</p>
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
        
        const idDelCafe = prod.id_producto || prod.id;

        const tarjetaHTML = `
            <div class="card" style="width: 30%; min-width: 250px; background-color: var(--blanco); border-radius: 15px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05); transition: transform 0.3s; margin-bottom: 20px; display: flex; flex-direction: column;">
                <img src="${imgUrl}" alt="${prod.nombre}" style="width: 100%; height: 250px; object-fit: cover;">
                <div class="card-info" style="padding: 20px; text-align: center; display: flex; flex-direction: column; flex-grow: 1;">
                    <h3 style="color: var(--verde-sirena); margin-bottom: 10px;">${prod.nombre}</h3>
                    <p style="color: #555; margin-bottom: 15px; font-size: 0.9rem; flex-grow: 1;">${prod.descripcion}</p>
                    <span style="display: block; font-weight: bold; font-size: 1.3rem; color: var(--cafe-oscuro); margin-bottom: 15px;">S/ ${prod.precio.toFixed(2)}</span>
                    <button onclick="agregarAlCarrito('${idDelCafe}', '${prod.nombre}', ${prod.precio})" class="btn-primary" style="width: 100%; border: none; cursor: pointer; padding: 12px; border-radius: 25px; transition: 0.3s;">Agregar al pedido</button>
                </div>
            </div>
        `;
        contenedor.innerHTML += tarjetaHTML;
    });
}

// ==========================================
// FUNCIÓN 2: REGISTRAR CLIENTE
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
        localStorage.setItem('usuarioStarbucks', JSON.stringify({ id_cliente: nuevoCliente.id_cliente, nombre: nombre, ruc: ruc, correo: correo }));
        actualizarHeader(); 
        alert('¡Cuenta creada exitosamente!');
        document.getElementById('modal-registro').style.display = 'none';
        document.getElementById('form-registro').reset(); 
    } catch (error) {
        console.error("Error al registrar:", error);
        alert('Hubo un error al crear la cuenta. Verifica que el correo no esté repetido.');
    }
}

// ==========================================
// FUNCIÓN 3 & 4: HEADER Y SESIÓN
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

window.cerrarSesion = function() {
    localStorage.removeItem('usuarioStarbucks'); 
    localStorage.removeItem('carritoStarbucks'); 
    location.reload(); 
}

async function iniciarSesion(event) {
    event.preventDefault();
    const correo = document.getElementById('login-correo').value;
    const contrasena = document.getElementById('login-password').value;
    
    try {
        const { data: cliente, error } = await supabase.from('t_cliente').select('*').eq('correo', correo).eq('contrasena', contrasena).single(); 
        if (error) throw error;
        
        if (cliente) {
            localStorage.setItem('usuarioStarbucks', JSON.stringify({ id_cliente: cliente.id_cliente, nombre: cliente.nombre_completo, ruc: cliente.ruc, correo: cliente.correo }));
            actualizarHeader(); 
            const primerNombre = cliente.nombre_completo.split(' ')[0];
            alert(`¡Qué bueno verte de nuevo, ${primerNombre}!`);
            document.getElementById('modal-login').style.display = 'none';
            document.getElementById('form-login').reset();
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert('Correo o contraseña incorrectos.');
    }
}

// ==========================================
// FUNCIÓN 5: CARRITO
// ==========================================
window.agregarAlCarrito = function(idProducto, nombreProducto, precio) {
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioStarbucks'));
    if (!usuarioGuardado) {
        alert(`Por favor inicia sesión para pedir: ${nombreProducto}.`);
        const modalLogin = document.getElementById('modal-login');
        if(modalLogin) modalLogin.style.display = 'flex';
        return; 
    }

    let carrito = JSON.parse(localStorage.getItem('carritoStarbucks')) || [];
    const indice = carrito.findIndex(item => item.id_producto === idProducto);
    if(indice !== -1) carrito[indice].cantidad += 1;
    else carrito.push({ id_producto: idProducto, nombre: nombreProducto, precio: precio, cantidad: 1 });

    localStorage.setItem('carritoStarbucks', JSON.stringify(carrito));
    renderizarCarrito(); 
    abrirCarrito(); 
}

window.renderizarCarrito = function() {
    const contenedor = document.getElementById('items-carrito');
    const totalElemento = document.getElementById('total-carrito');
    
    // Seguro multipágina por si la vista actual no tiene el modal de carrito
    if (!contenedor || !totalElemento) return;

    const carrito = JSON.parse(localStorage.getItem('carritoStarbucks')) || [];
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
    const panel = document.getElementById('panel-carrito');
    const overlay = document.getElementById('overlay-carrito');
    if(panel && overlay) {
        panel.style.display = 'flex';
        overlay.style.display = 'block';
        renderizarCarrito();
        setTimeout(() => { panel.style.right = '0'; }, 10);
    }
}

window.cerrarCarrito = function() {
    const panel = document.getElementById('panel-carrito');
    const overlay = document.getElementById('overlay-carrito');
    if(panel && overlay) {
        panel.style.right = '-400px';
        overlay.style.display = 'none';
        setTimeout(() => { panel.style.display = 'none'; }, 300);
    }
}

// ==========================================
// FUNCIÓN 6: CARGAR DISTRITOS Y ABRIR PAGO
// ==========================================
window.procesarCompra = async function() {
    const carrito = JSON.parse(localStorage.getItem('carritoStarbucks')) || [];
    if (carrito.length === 0) {
        alert("Agrega al menos un producto para confirmar tu pedido.");
        return;
    }

    // Abrimos el modal de pago
    const modalPago = document.getElementById('modal-pago');
    if(modalPago) modalPago.style.display = 'flex';

    // Cargamos los distritos en el selector si está vacío
    const selectDistrito = document.getElementById('select-distrito');
    if (selectDistrito && selectDistrito.options.length <= 1) {
        try {
            const { data: distritos, error } = await supabase
                .from('t_distrito')
                .select('id_distrito, nombre')
                .order('nombre', { ascending: true });

            if (error) throw error;

            selectDistrito.innerHTML = '<option value="">-- Selecciona tu distrito --</option>';
            distritos.forEach(d => {
                selectDistrito.innerHTML += `<option value="${d.id_distrito}">${d.nombre}</option>`;
            });
        } catch (err) {
            console.error("Error al cargar distritos:", err);
            selectDistrito.innerHTML = '<option value="">Error al cargar distritos</option>';
        }
    }
}

// ==========================================
// FUNCIÓN 7: FINALIZAR PEDIDO (CON DISTRITO, DIRECCIÓN Y TIEMPO)
// ==========================================
window.finalizarPedido = async function(metodoPago) {
    const carrito = JSON.parse(localStorage.getItem('carritoStarbucks')) || [];
    const usuario = JSON.parse(localStorage.getItem('usuarioStarbucks'));
    const selectDistrito = document.getElementById('select-distrito');
    const inputDireccion = document.getElementById('input-direccion');
    
    if (!usuario || !usuario.id_cliente) {
        alert("Tu sesión está desactualizada. Vuelve a iniciar sesión.");
        return;
    }

    if (!selectDistrito || !selectDistrito.value) {
        alert("Por favor selecciona un distrito para el envío.");
        return;
    }

    if (!inputDireccion || !inputDireccion.value.trim()) {
        alert("Por favor escribe tu dirección exacta.");
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

        // --- LÓGICA DE TIEMPO (Detecta la fecha actual automáticamente) ---
        const fechaHoy = new Date();
        const idAnoCalculado = fechaHoy.getFullYear() - 2023; // 2024=1, 2025=2, 2026=3...
        const idMesCalculado = fechaHoy.getMonth() + 1; // 1 a 12 (Enero a Diciembre)
        let idDiaCalculado = fechaHoy.getDay(); // 1 a 6 (Lunes a Sábado), 0 es Domingo
        if (idDiaCalculado === 0) idDiaCalculado = 7; // Convertimos el 0 del Domingo al ID 7

        // --- 1. INSERTAR CABECERA ---
        const { data: ventaNueva, error: errorVenta } = await supabase
            .from('t_ventas')
            .insert([{ 
                id_cliente: usuario.id_cliente, 
                id_forma_pago: idFormaPago, 
                id_comprobante: idComprobante, 
                subtotal: totalVenta, 
                total: totalVenta, 
                estado_orden: 'Recibido',
                id_distrito: parseInt(selectDistrito.value),
                direccion_envio: inputDireccion.value.trim(),
                id_ano: idAnoCalculado,
                id_mes: idMesCalculado,
                id_dia: idDiaCalculado
            }])
            .select(); 

        if (errorVenta) throw errorVenta;
        const idVentaGenerada = ventaNueva[0].id_venta;

        // --- 2. INSERTAR DETALLES ---
        const detallesVenta = carrito.map(item => ({
            id_venta: idVentaGenerada,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: item.precio,
            subtotal: (item.precio * item.cantidad)
        }));

        const { error: errorDetalles } = await supabase
            .from('t_detalle_venta')
            .insert(detallesVenta);

        if (errorDetalles) throw errorDetalles;

        alert(`¡Pedido registrado con éxito!\n\nTu ${textoComprobante} ha sido generada. Enviaremos tu pedido a tu distrito seleccionado.`);
        
        document.getElementById('modal-pago').style.display = 'none';
        localStorage.removeItem('carritoStarbucks');
        renderizarCarrito();
        cerrarCarrito();

    } catch (error) {
        console.error("Error crítico al procesar venta:", error);
        alert("Hubo un problema procesando tu pedido.");
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    cargarCatalogo();
    actualizarHeader(); 
    
    const formRegistro = document.getElementById('form-registro');
    if(formRegistro) formRegistro.addEventListener('submit', registrarCliente);

    const formLogin = document.getElementById('form-login');
    if(formLogin) formLogin.addEventListener('submit', iniciarSesion);
});