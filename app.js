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
                        <button class="btn-primary" style="width: 100%; border: none; cursor: pointer; padding: 12px; border-radius: 25px;">Agregar al pedido</button>
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
            .from('t_cliente') // Tabla en minúsculas
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
            ]);
            
        if (error) throw error;
        
        // --- GUARDAR SESIÓN EN EL NAVEGADOR ---
        localStorage.setItem('usuarioStarbucks', JSON.stringify({ 
            nombre: nombre, 
            ruc: ruc,
            correo: correo
        }));
        actualizarHeader(); // Cambia los botones por el saludo
        
        alert('¡Cuenta creada exitosamente! Bienvenido a Starbucks Rewards.');
        document.getElementById('modal-registro').style.display = 'none';
        document.getElementById('form-registro').reset(); 
        
    } catch (error) {
        console.error("Error al registrar:", error);
        alert('Hubo un error al crear la cuenta. Verifica que el correo no esté repetido.');
    }
}

// ==========================================
// FUNCIÓN 3: ACTUALIZAR EL HEADER (BIENVENIDA)
// ==========================================
function actualizarHeader() {
    const contenedorUsuario = document.getElementById('menu-usuario');
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioStarbucks'));

    if (usuarioGuardado && contenedorUsuario) {
        // Extraemos el primer nombre
        const primerNombre = usuarioGuardado.nombre.split(' ')[0];
        
        // Reemplazamos los botones por el saludo y el botón de salir
        contenedorUsuario.innerHTML = `
            <span style="color: var(--blanco); font-weight: bold; margin-right: 15px; font-size: 1.1rem;">
                Bienvenido, ${primerNombre}
            </span>
            <button onclick="cerrarSesion()" style="background: transparent; border: 1px solid var(--blanco); color: var(--blanco); padding: 8px 20px; border-radius: 25px; cursor: pointer; font-weight: bold; transition: background 0.3s;">
                Salir
            </button>
        `;
    }
}

// ==========================================
// FUNCIÓN 4: CERRAR SESIÓN
// ==========================================
window.cerrarSesion = function() {
    localStorage.removeItem('usuarioStarbucks'); // Borramos la memoria
    location.reload(); // Recargamos la página
}

// ==========================================
// INICIALIZACIÓN: Ejecutar al cargar la página
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    cargarCatalogo();
    actualizarHeader(); // Verifica si hay alguien logueado al abrir la página
    
    const formRegistro = document.getElementById('form-registro');
    if(formRegistro) {
        formRegistro.addEventListener('submit', registrarCliente);
    }
});