// ==================== INICIALIZACIÓN VACÍA ====================
// Todo empieza vacío. SIN PRODUCTOS DE EJEMPLO.
if (!localStorage.getItem('usuarios')) {
    // Crear un usuario de prueba para facilitar las pruebas
    const usuarioPrueba = [
        {
            username: "Lautaro56",
            email: "lautaro@email.com",
            password: "123456"
        }
    ];
    localStorage.setItem('usuarios', JSON.stringify(usuarioPrueba));
}
if (!localStorage.getItem('productos')) {
    localStorage.setItem('productos', JSON.stringify([]));
}
if (!localStorage.getItem('mensajes')) {
    localStorage.setItem('mensajes', JSON.stringify([]));
}

// ==================== FUNCIONES DE AYUDA ====================
function getUsuarios() {
    return JSON.parse(localStorage.getItem('usuarios'));
}

function getProductos() {
    return JSON.parse(localStorage.getItem('productos'));
}

function getMensajes() {
    return JSON.parse(localStorage.getItem('mensajes'));
}

function guardarUsuarios(usuarios) {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

function guardarProductos(productos) {
    localStorage.setItem('productos', JSON.stringify(productos));
}

function guardarMensajes(mensajes) {
    localStorage.setItem('mensajes', JSON.stringify(mensajes));
}

function getUsuarioActual() {
    const user = localStorage.getItem('usuarioActual');
    return user ? JSON.parse(user) : null;
}

function setUsuarioActual(usuario) {
    localStorage.setItem('usuarioActual', JSON.stringify(usuario));
}

function cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    window.location.href = 'index.html';
}

// ==================== LOGIN ====================
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const usuarios = getUsuarios();
        const usuario = usuarios.find(u => u.username === username && u.password === password);
        
        if (usuario) {
            setUsuarioActual({ nombre: usuario.username, email: usuario.email });
            window.location.href = 'tienda.html';
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    });
    
    document.getElementById('btnRegistro').addEventListener('click', function() {
        window.location.href = 'registro.html';
    });
}

// ==================== REGISTRO ====================
if (document.getElementById('registroForm')) {
    document.getElementById('registroForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        
        if (username.length < 3) {
            alert('El usuario debe tener al menos 3 caracteres');
            return;
        }
        
        if (password.length < 4) {
            alert('La contraseña debe tener al menos 4 caracteres');
            return;
        }
        
        const usuarios = getUsuarios();
        
        if (usuarios.find(u => u.username === username)) {
            alert('Este usuario ya existe');
            return;
        }
        
        usuarios.push({ username, email, password });
        guardarUsuarios(usuarios);
        
        alert('Registro exitoso. Ahora inicia sesión');
        window.location.href = 'index.html';
    });
    
    document.getElementById('volverLogin').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
}

// ==================== TIENDA ====================
function cargarTienda() {
    const productos = getProductos();
    const contenedor = document.getElementById('productosList');
    
    if (!contenedor) return;
    
    if (productos.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: white; border-radius: 12px; grid-column: 1/-1;">
                <p style="font-size: 1.2rem; color: #666;">📭 No hay publicaciones aún</p>
                <p style="margin-top: 1rem;">Sé el primero en <a href="subir-camiseta.html" style="color: #f39c12;">subir una camiseta</a></p>
            </div>
        `;
        return;
    }
    
    contenedor.innerHTML = productos.map(producto => `
        <div class="producto-card">
            <div class="producto-imagen">👕</div>
            <div class="producto-info">
                <div class="producto-titulo">${producto.nombre}</div>
                <div class="producto-precio">$${producto.precio.toLocaleString()}</div>
                <span class="producto-estado ${!producto.disponible ? 'vendido' : ''}">
                    ${producto.disponible ? 'Disponible' : 'Vendido'}
                </span>
                <a href="publicacion.html?id=${producto.id}" class="btn-ver">Ver publicación</a>
            </div>
        </div>
    `).join('');
}

// ==================== PERFIL ====================
function cargarPerfil() {
    const usuarioActual = getUsuarioActual();
    
    if (!usuarioActual) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('nombreUsuario').textContent = usuarioActual.nombre;
    document.getElementById('emailUsuario').textContent = usuarioActual.email;
    
    const productos = getProductos();
    const misProductos = productos.filter(p => p.vendedor === usuarioActual.nombre);
    const contenedor = document.getElementById('misPublicaciones');
    
    if (misProductos.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: white; border-radius: 12px; grid-column: 1/-1;">
                <p style="font-size: 1.2rem; color: #666;">📭 No tienes publicaciones</p>
                <p style="margin-top: 1rem;"><a href="subir-camiseta.html" style="color: #f39c12;">Subí tu primera camiseta</a></p>
            </div>
        `;
        return;
    }
    
    contenedor.innerHTML = misProductos.map(producto => `
        <div class="producto-card">
            <div class="producto-imagen">👕</div>
            <div class="producto-info">
                <div class="producto-titulo">${producto.nombre}</div>
                <div class="producto-precio">$${producto.precio.toLocaleString()}</div>
                <span class="producto-estado ${!producto.disponible ? 'vendido' : ''}">
                    ${producto.disponible ? 'Disponible' : 'Vendido'}
                </span>
                <a href="publicacion.html?id=${producto.id}" class="btn-ver">Ver</a>
            </div>
        </div>
    `).join('');
}

// ==================== SUBIR CAMISETA ====================
if (document.getElementById('publicarForm')) {
    document.getElementById('publicarForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const usuarioActual = getUsuarioActual();
        if (!usuarioActual) {
            alert('Debes iniciar sesión');
            window.location.href = 'index.html';
            return;
        }
        
        const nombre = document.getElementById('nombre').value;
        const precio = parseInt(document.getElementById('precio').value);
        const descripcion = document.getElementById('descripcion').value;
        
        if (!nombre || !precio || !descripcion) {
            alert('Completa todos los campos');
            return;
        }
        
        const productos = getProductos();
        const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
        
        productos.push({
            id: nuevoId,
            nombre: nombre,
            precio: precio,
            descripcion: descripcion,
            vendedor: usuarioActual.nombre,
            disponible: true,
            fecha: new Date().toISOString()
        });
        
        guardarProductos(productos);
        alert('¡Publicación creada con éxito!');
        window.location.href = 'tienda.html';
    });
}

// ==================== DETALLE PUBLICACIÓN ====================
function cargarDetallePublicacion() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    
    if (!id) {
        document.getElementById('detallePublicacion').innerHTML = '<p>Publicación no encontrada</p>';
        return;
    }
    
    const productos = getProductos();
    const producto = productos.find(p => p.id === id);
    
    if (!producto) {
        document.getElementById('detallePublicacion').innerHTML = '<p>Publicación no encontrada</p>';
        return;
    }
    
    const usuarioActual = getUsuarioActual();
    const esMiPublicacion = usuarioActual && usuarioActual.nombre === producto.vendedor;
    
    const mensajes = getMensajes();
    const mensajesProducto = mensajes.filter(m => m.publicacionId === id);
    
    let html = `
        <div>
            <div style="background: white; border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
                    <div style="flex: 1; text-align: center; font-size: 5rem;">👕</div>
                    <div style="flex: 2;">
                        <h1>${producto.nombre}</h1>
                        <p style="margin: 1rem 0;">${producto.descripcion}</p>
                        <p><strong>Precio:</strong> <span style="color: #f39c12; font-size: 1.5rem;">$${producto.precio.toLocaleString()}</span></p>
                        <p><strong>Vendedor:</strong> ${producto.vendedor}</p>
                        <p><strong>Estado:</strong> ${producto.disponible ? '✅ Disponible' : '❌ Vendido'}</p>
    `;
    
    if (esMiPublicacion) {
        html += `
            <div style="margin-top: 1rem;">
                <button id="btnEditar" class="btn btn-primary">Editar</button>
                <button id="btnToggleEstado" class="btn btn-secondary">${producto.disponible ? 'Marcar como Vendido' : 'Marcar como Disponible'}</button>
                <button id="btnEliminar" class="btn btn-secondary" style="background-color: #e74c3c;">Eliminar</button>
            </div>
        `;
    }
    
    html += `
                    </div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 2rem;">
                <h3>💬 Mensajes</h3>
                <div id="mensajesContainer">
    `;
    
    if (mensajesProducto.length === 0) {
        html += '<p>No hay mensajes aún. Sé el primero en comentar.</p>';
    } else {
        mensajesProducto.forEach(m => {
            html += `
                <div class="mensaje">
                    <div class="mensaje-header">
                        <strong>${m.remitente}</strong>
                        <small>${new Date(m.fecha).toLocaleString()}</small>
                    </div>
                    <p>${m.texto}</p>
                </div>
            `;
        });
    }
    
    html += `
                </div>
                <textarea id="nuevoMensaje" rows="3" placeholder="Escribí tu mensaje..." style="width: 100%; padding: 0.5rem; margin: 1rem 0; border: 1px solid #ddd; border-radius: 8px;"></textarea>
                <button id="enviarMensaje" class="btn btn-primary">Enviar mensaje</button>
            </div>
        </div>
    `;
    
    document.getElementById('detallePublicacion').innerHTML = html;
    
    if (esMiPublicacion) {
        document.getElementById('btnEditar')?.addEventListener('click', () => {
            const nuevoNombre = prompt('Nuevo nombre:', producto.nombre);
            const nuevoPrecio = prompt('Nuevo precio:', producto.precio);
            const nuevaDesc = prompt('Nueva descripción:', producto.descripcion);
            
            if (nuevoNombre && nuevoPrecio && nuevaDesc) {
                const index = productos.findIndex(p => p.id === id);
                productos[index].nombre = nuevoNombre;
                productos[index].precio = parseInt(nuevoPrecio);
                productos[index].descripcion = nuevaDesc;
                guardarProductos(productos);
                cargarDetallePublicacion();
            }
        });
        
        document.getElementById('btnToggleEstado')?.addEventListener('click', () => {
            const index = productos.findIndex(p => p.id === id);
            productos[index].disponible = !productos[index].disponible;
            guardarProductos(productos);
            cargarDetallePublicacion();
        });
        
        document.getElementById('btnEliminar')?.addEventListener('click', () => {
            if (confirm('¿Eliminar esta publicación?')) {
                const nuevosProductos = productos.filter(p => p.id !== id);
                guardarProductos(nuevosProductos);
                
                const todosMensajes = getMensajes();
                const nuevosMensajes = todosMensajes.filter(m => m.publicacionId !== id);
                guardarMensajes(nuevosMensajes);
                
                alert('Publicación eliminada');
                window.location.href = 'tienda.html';
            }
        });
    }
    
    document.getElementById('enviarMensaje')?.addEventListener('click', () => {
        const texto = document.getElementById('nuevoMensaje').value.trim();
        if (!texto) {
            alert('Escribe un mensaje');
            return;
        }
        
        const usuarioActual = getUsuarioActual();
        if (!usuarioActual) {
            alert('Debes iniciar sesión');
            window.location.href = 'index.html';
            return;
        }
        
        const mensajes = getMensajes();
        mensajes.push({
            id: Date.now(),
            publicacionId: id,
            remitente: usuarioActual.nombre,
            texto: texto,
            fecha: new Date().toISOString()
        });
        guardarMensajes(mensajes);
        
        document.getElementById('nuevoMensaje').value = '';
        cargarDetallePublicacion();
    });
}

// ==================== CERRAR SESIÓN ====================
document.querySelectorAll('#cerrarSesion').forEach(btn => {
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            cerrarSesion();
        });
    }
});

// ==================== VERIFICAR AUTENTICACIÓN ====================
function verificarAuth() {
    const usuarioActual = getUsuarioActual();
    const paginaActual = window.location.pathname.split('/').pop();
    const paginasPublicas = ['index.html', 'registro.html'];
    
    if (!usuarioActual && !paginasPublicas.includes(paginaActual)) {
        window.location.href = 'index.html';
    }
}

// ==================== INICIAR SEGÚN PÁGINA ====================
verificarAuth();

const pagina = window.location.pathname.split('/').pop();

if (pagina === 'tienda.html') {
    cargarTienda();
} else if (pagina === 'perfil.html') {
    cargarPerfil();
} else if (pagina === 'publicacion.html') {
    cargarDetallePublicacion();
}