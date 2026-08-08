// 1. Importamos la conexión a Supabase que creamos en el paso anterior
import { supabase } from './conexion.js';

// ==========================================
// FUNCIÓN 1: CARGAR EL CATÁLOGO DINÁMICAMENTE
// ==========================================
async function cargarCatalogo() {
    const contenedor = document.getElementById('catalogo-container');
    
    try {
        // Hacemos un SELECT a la tabla T_PRODUCTO de Supabase
        const { data: productos, error } = await supabase
            .from('T_PRODUCTO')
            .select('*');
            
        if (error) throw error;
        
        // Limpiamos el mensaje de "Cargando..."
        contenedor.innerHTML = '';
        
        // Si no hay productos, mostramos un mensaje
        if (productos.length === 0) {
            contenedor.innerHTML = '<p style="color: var(--cafe-oscuro);">No hay productos disponibles en este momento.</p>';
            return;
        }
        
        // Recorremos los productos que llegaron de la Base de Datos
        productos.forEach(prod => {
            // Como no tenemos columna de imágenes en la BD, asignamos unas por defecto de tus archivos
            let imgUrl = 'fav-1.jpg'; // Por defecto
            if(prod.nombre.toLowerCase().includes('latte') || prod.nombre.toLowerCase().includes('jugo')) imgUrl = 'fav-3.jpg';
            else if(prod.nombre.toLowerCase().includes('mocha') || prod.nombre.toLowerCase().includes('descafeinado')) imgUrl = 'fav-2.jpg';
            
            // Creamos la tarjeta HTML inyectando las variables de la BD (nombre, descripcion, precio)
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
            
            // Inyectamos la tarjeta en el contenedor de la web
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
    event.preventDefault(); // Evita que la página se recargue
    
    // Capturamos los valores del formulario
    const nombre = document.getElementById('reg-nombre').value;
    const apaterno = document.getElementById('reg-apaterno').value;
    const amaterno = document.getElementById('reg-amaterno').value;
    const telefono = document.getElementById('reg-telefono').value;
    const dni = document.getElementById('reg-dni').value;
    const ruc = document.getElementById('reg-ruc').value;
    const correo = document.getElementById('reg-correo').value;
    const contrasena = document.getElementById('reg-password').value; 
    
    try {
        // Hacemos un INSERT a la tabla T_CLIENTE
        const { data, error } = await supabase
            .from('T_CLIENTE')
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
        
        // Si todo sale bien, mostramos mensaje y cerramos el modal
        alert('¡Cuenta creada exitosamente! Bienvenido a Starbucks Rewards.');
        document.getElementById('modal-registro').style.display = 'none';
        document.getElementById('form-registro').reset(); // Limpia los campos
        
    } catch (error) {
        console.error("Error al registrar:", error);
        alert('Hubo un error al crear la cuenta. Verifica que el correo no esté repetido.');
    }
}

// ==========================================
// INICIALIZACIÓN: Cuando cargue la página, ejecutamos el código
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargamos el catálogo de inmediato
    cargarCatalogo();
    
    // 2. Le decimos al formulario de registro qué hacer cuando hagan clic en "Registrarme"
    const formRegistro = document.getElementById('form-registro');
    if(formRegistro) {
        formRegistro.addEventListener('submit', registrarCliente);
    }
});