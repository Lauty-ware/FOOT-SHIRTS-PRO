// ==================== INICIALIZACIÓN ====================
if (!localStorage.getItem('usuarios')) {
    localStorage.setItem('usuarios', JSON.stringify([
        {
            username: "Lautaro56",
            email: "lautaro@email.com",
            password: "123456"
        }
    ]));
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

// ==================== FILTRADO DE PRODUCTOS ====================
function filtrarProductos() {
    const productos = getProductos();
    const searchText = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const precioMin = parseInt(document.getElementById('precioMin')?.value) || 0;
    const precioMax = parseInt(document.getElementById('precioMax')?.value) || Infinity;
    const etiquetaFiltro = document.getElementById('filtroEtiqueta')?.value || '';
    
    // Verificar si hay tag en la URL (para click en etiquetas)
    const urlParams = new URLSearchParams(window.location.search);
    const urlTag = urlParams.get('tag');
    const tagActiva = urlTag || etiquetaFiltro;
    
    return productos.filter(producto => {
        // Solo mostrar productos disponibles
        if (!producto.disponible) return false;
        
        // Búsqueda por texto (nombre, descripción, etiquetas)
        const tagsString = producto.etiquetas ? producto.etiquetas.join(' ').toLowerCase() : '';
        const matchesSearch = searchText === '' || 
            producto.nombre.toLowerCase().includes(searchText) ||
            producto.descripcion.toLowerCase().includes(searchText) ||
            tagsString.includes(searchText);
        
        // Filtro por precio
        const matchesPrice = producto.precio >= precioMin && producto.precio <= precioMax;
        
        // Filtro por etiqueta específica
        const matchesTag = tagActiva === '' || 
            (producto.etiquetas && producto.etiquetas.includes(tagActiva));
        
        return matchesSearch && matchesPrice && matchesTag;
    });
}

function actualizarSelectEtiquetas() {
    const select = document.getElementById('filtroEtiqueta');
    if (!select) return;
    
    const productos = getProductos();
    const todasEtiquetas = new Set();
    
    productos.forEach(producto => {
        if (producto.etiquetas && producto.etiquetas.length > 0) {
            producto.etiquetas.forEach(etiqueta => {
                todasEtiquetas.add(etiqueta);
            });
        }
    });
    
    const valorActual = select.value;
    
    select.innerHTML = '<option value="">Todas las etiquetas</option>';
    Array.from(todasEtiquetas).sort().forEach(etiqueta => {
        const option = document.createElement('option');
        option.value = etiqueta;
        option.textContent = etiqueta;
        select.appendChild(option);
    });
    
    if (valorActual && Array.from(todasEtiquetas).includes(valorActual)) {
        select.value = valorActual;
    }
}

// ==================== TIENDA ====================
function cargarTienda() {
    const productosFiltrados = filtrarProductos();
    const contenedor = document.getElementById('productosList');
    
    if (!contenedor) return;
    
    if (productosFiltrados.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: white; border-radius: 12px; grid-column: 1/-1;">
                <p style="font-size: 1.2rem; color: #666;">📭 No hay publicaciones que coincidan con tu búsqueda</p>
                <p style="margin-top: 1rem;"><a href="subir-camiseta.html" style="color: #f39c12;">Subí una camiseta</a> o <a href="#" id="resetFiltrosLink" style="color: #f39c12;">limpiá los filtros</a></p>
            </div>
        `;
        const resetLink = document.getElementById('resetFiltrosLink');
        if (resetLink) {
            resetLink.addEventListener('click', (e) => {
                e.preventDefault();
                limpiarFiltros();
            });
        }
        return;
    }
    
    contenedor.innerHTML = productosFiltrados.map(producto => `
        <div class="producto-card">
            <div class="producto-imagen">👕</div>
            <div class="producto-info">
                <div class="producto-titulo">${producto.nombre}</div>
                <div class="producto-precio">$${producto.precio.toLocaleString()}</div>
                <div class="producto-etiquetas">
                    ${producto.etiquetas ? producto.etiquetas.map(tag => `<span class="etiqueta" data-tag="${tag}">${tag}</span>`).join('') : ''}
                </div>
                <span class="producto-estado">
                    Disponible
                </span>
                <a href="publicacion.html?id=${producto.id}" class="btn-ver">Ver publicación</a>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.etiqueta').forEach(etiqueta => {
        etiqueta.addEventListener('click', () => {
            const tag = etiqueta.getAttribute('data-tag');
            window.location.href = `tienda.html?tag=${encodeURIComponent(tag)}`;
        });
    });
}

function aplicarFiltros() {
    // Limpiar URL de parámetro tag cuando se usan filtros manuales
    if (window.location.search.includes('tag')) {
        window.history.replaceState({}, '', 'tienda.html');
    }
    cargarTienda();
}

function limpiarFiltros() {
    const searchInput = document.getElementById('searchInput');
    const precioMin = document.getElementById('precioMin');
    const precioMax = document.getElementById('precioMax');
    const filtroEtiqueta = document.getElementById('filtroEtiqueta');
    
    if (searchInput) searchInput.value = '';
    if (precioMin) precioMin.value = '';
    if (precioMax) precioMax.value = '';
    if (filtroEtiqueta) filtroEtiqueta.value = '';
    
    window.history.replaceState({}, '', 'tienda.html');
    cargarTienda();
}

function configurarFiltros() {
    const searchInput = document.getElementById('searchInput');
    const precioMin = document.getElementById('precioMin');
    const precioMax = document.getElementById('precioMax');
    const filtroEtiqueta = document.getElementById('filtroEtiqueta');
    const limpiarBtn = document.getElementById('limpiarFiltros');
    
    if (searchInput) searchInput.addEventListener('input', () => aplicarFiltros());
    if (precioMin) precioMin.addEventListener('input', () => aplicarFiltros());
    if (precioMax) precioMax.addEventListener('input', () => aplicarFiltros());
    if (filtroEtiqueta) filtroEtiqueta.addEventListener('change', () => aplicarFiltros());
    if (limpiarBtn) limpiarBtn.addEventListener('click', () => limpiarFiltros());
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
                <div class="producto-etiquetas">
                    ${producto.etiquetas ? producto.etiquetas.map(tag => `<span class="etiqueta">${tag}</span>`).join('') : ''}
                </div>
                <span class="producto-estado ${!producto.disponible ? 'vendido' : ''}">
                    ${producto.disponible ? 'Disponible' : 'Vendido'}
                </span>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                    <a href="publicacion.html?id=${producto.id}" class="btn-ver" style="flex: 1;">Ver</a>
                </div>
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
        const etiquetasInput = document.getElementById('etiquetas').value;
        const descripcion = document.getElementById('descripcion').value;
        
        if (!nombre || !precio || !descripcion) {
            alert('Completa todos los campos');
            return;
        }
        
        let etiquetas = [];
        if (etiquetasInput) {
            etiquetas = etiquetasInput.split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
        }
        
        const productos = getProductos();
        const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
        
        productos.push({
            id: nuevoId,
            nombre: nombre,
            precio: precio,
            descripcion: descripcion,
            etiquetas: etiquetas,
            vendedor: usuarioActual.nombre,
            disponible: true,
            fecha: new Date().toISOString()
        });
        
        guardarProductos(productos);
        alert('¡Publicación creada con éxito!');
        window.location.href = 'tienda.html';
    });
}

// ==================== DETALLE PUBLICACIÓN (COMPLETA) ====================
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
    if (!usuarioActual) {
        window.location.href = 'index.html';
        return;
    }
    
    const esMiPublicacion = usuarioActual.nombre === producto.vendedor;
    const mensajes = getMensajes();
    const mensajesProducto = mensajes.filter(m => m.publicacionId === id);
    
    let html = `
        <div>
            <div style="background: white; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
                    <div style="flex: 1; text-align: center; background: #f8f9fa; border-radius: 12px; padding: 2rem; min-width: 200px;">
                        <div style="font-size: 6rem;">👕</div>
                    </div>
                    
                    <div style="flex: 2;">
                        <h1 style="margin-bottom: 0.5rem;">${producto.nombre}</h1>
                        
                        <div class="producto-etiquetas" style="margin: 0.5rem 0 1rem 0;">
                            ${producto.etiquetas ? producto.etiquetas.map(tag => `<span class="etiqueta" data-tag="${tag}">${tag}</span>`).join('') : ''}
                        </div>
                        
                        <div style="background: #f39c12; display: inline-block; padding: 0.5rem 1.5rem; border-radius: 30px; margin: 0.5rem 0;">
                            <span style="font-size: 1.8rem; font-weight: bold; color: white;">$${producto.precio.toLocaleString()}</span>
                        </div>
                        
                        <div style="margin: 1.5rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                            <p style="line-height: 1.6;">${producto.descripcion}</p>
                        </div>
                        
                        <div style="margin: 1rem 0; padding: 0.5rem 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
                            <p>👤 <strong>Vendedor:</strong> ${producto.vendedor}</p>
                            <p>📅 <strong>Publicado:</strong> ${new Date(producto.fecha).toLocaleDateString()}</p>
                            <p>🏷️ <strong>Estado:</strong> ${producto.disponible ? '<span style="color: #27ae60;">✅ Disponible</span>' : '<span style="color: #e74c3c;">❌ Vendido</span>'}</p>
                        </div>
    `;
    
    if (esMiPublicacion) {
        html += `
                        <div style="display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap;">
                            <button id="btnEditar" class="btn btn-primary" style="background-color: #3498db;">✏️ Editar publicación</button>
                            <button id="btnToggleEstado" class="btn btn-secondary" style="background-color: ${producto.disponible ? '#e67e22' : '#27ae60'}">
                                ${producto.disponible ? '🔴 Marcar como Vendido' : '🟢 Marcar como Disponible'}
                            </button>
                            <button id="btnEliminar" class="btn btn-secondary" style="background-color: #e74c3c;">🗑️ Eliminar publicación</button>
                        </div>
        `;
    } else if (producto.disponible) {
        html += `
                        <div style="display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap;">
                            <button id="btnContactar" class="btn btn-primary" style="background-color: #3498db;">💬 Contactar al vendedor</button>
                            <button id="btnComprar" class="btn btn-primary" style="background-color: #27ae60;">🛒 Comprar / Reservar</button>
                        </div>
        `;
    } else {
        html += `
                        <div style="margin-top: 1.5rem; padding: 1rem; background: #fdf0f0; border-radius: 8px; text-align: center;">
                            <p style="color: #e74c3c;">❌ Este producto ya fue vendido</p>
                        </div>
        `;
    }
    
    html += `
                    </div>
                </div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3>💬 Conversación sobre esta publicación</h3>
                <div id="mensajesContainer" style="max-height: 400px; overflow-y: auto; margin: 1rem 0;">
    `;
    
    if (mensajesProducto.length === 0) {
        html += '<p style="text-align: center; color: #999; padding: 2rem;">No hay mensajes aún. Sé el primero en consultar.</p>';
    } else {
        mensajesProducto.forEach(m => {
            const esMiMensaje = m.remitente === usuarioActual.nombre;
            html += `
                <div class="mensaje" style="${esMiMensaje ? 'background: #e8f4fd; border-left-color: #3498db;' : ''}">
                    <div class="mensaje-header">
                        <strong>${m.remitente}</strong>
                        <small>${new Date(m.fecha).toLocaleString()}</small>
                    </div>
                    <p style="margin-top: 0.5rem;">${m.texto}</p>
                </div>
            `;
        });
    }
    
    html += `
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <textarea id="nuevoMensaje" rows="3" placeholder="Escribí tu mensaje..." style="flex: 1; padding: 0.8rem; border: 1px solid #ddd; border-radius: 8px; font-family: inherit; resize: vertical;"></textarea>
                    <button id="enviarMensaje" class="btn btn-primary" style="align-self: flex-end; background-color: #3498db;">Enviar</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('detallePublicacion').innerHTML = html;
    
    document.querySelectorAll('.etiqueta').forEach(etiqueta => {
        etiqueta.addEventListener('click', () => {
            window.location.href = `tienda.html?tag=${etiqueta.getAttribute('data-tag')}`;
        });
    });
    
    // Funciones del VENDEDOR
    if (esMiPublicacion) {
        document.getElementById('btnEditar')?.addEventListener('click', () => {
            const nuevoNombre = prompt('✏️ Editar nombre:', producto.nombre);
            if (!nuevoNombre) return;
            
            const nuevoPrecio = prompt('💰 Editar precio:', producto.precio);
            if (!nuevoPrecio) return;
            
            const nuevasEtiquetas = prompt('🏷️ Editar etiquetas (separadas por comas):', producto.etiquetas ? producto.etiquetas.join(', ') : '');
            
            const nuevaDesc = prompt('📝 Editar descripción:', producto.descripcion);
            if (!nuevaDesc) return;
            
            const index = productos.findIndex(p => p.id === id);
            productos[index].nombre = nuevoNombre;
            productos[index].precio = parseInt(nuevoPrecio);
            productos[index].descripcion = nuevaDesc;
            if (nuevasEtiquetas) {
                productos[index].etiquetas = nuevasEtiquetas.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            }
            guardarProductos(productos);
            alert('✅ Publicación actualizada correctamente');
            cargarDetallePublicacion();
        });
        
        document.getElementById('btnToggleEstado')?.addEventListener('click', () => {
            const nuevoEstado = !producto.disponible;
            const estadoTexto = nuevoEstado ? 'disponible' : 'vendido';
            if (confirm(`¿Marcar esta publicación como ${estadoTexto}?`)) {
                const index = productos.findIndex(p => p.id === id);
                productos[index].disponible = nuevoEstado;
                guardarProductos(productos);
                alert(`✅ Publicación marcada como ${estadoTexto}`);
                cargarDetallePublicacion();
            }
        });
        
        document.getElementById('btnEliminar')?.addEventListener('click', () => {
            if (confirm('⚠️ ¿Estás SEGURO de eliminar esta publicación? Esta acción no se puede deshacer.')) {
                const nuevosProductos = productos.filter(p => p.id !== id);
                guardarProductos(nuevosProductos);
                
                const todosMensajes = getMensajes();
                const nuevosMensajes = todosMensajes.filter(m => m.publicacionId !== id);
                guardarMensajes(nuevosMensajes);
                
                alert('🗑️ Publicación eliminada correctamente');
                window.location.href = 'tienda.html';
            }
        });
    }
    
    // Funciones del COMPRADOR
    if (!esMiPublicacion && producto.disponible) {
        document.getElementById('btnContactar')?.addEventListener('click', () => {
            const mensajeBox = document.getElementById('nuevoMensaje');
            if (mensajeBox) {
                mensajeBox.focus();
                mensajeBox.scrollIntoView({ behavior: 'smooth' });
                mensajeBox.placeholder = 'Escribí tu consulta aquí...';
            }
        });
        
        document.getElementById('btnComprar')?.addEventListener('click', () => {
            if (confirm(`¿Confirmar compra de "${producto.nombre}" por $${producto.precio.toLocaleString()}?\n\nEl vendedor será notificado y se pondrá en contacto contigo.`)) {
                const index = productos.findIndex(p => p.id === id);
                productos[index].disponible = false;
                guardarProductos(productos);
                
                const mensajes = getMensajes();
                mensajes.push({
                    id: Date.now(),
                    publicacionId: id,
                    remitente: usuarioActual.nombre,
                    texto: `🎉 ¡Hola! Quiero COMPRAR esta camiseta. Por favor contactame para coordinar la entrega. Mi consulta es sobre: ${producto.nombre} - $${producto.precio.toLocaleString()}`,
                    fecha: new Date().toISOString()
                });
                guardarMensajes(mensajes);
                
                alert(`✅ ¡Solicitud de compra enviada!\n\nEl vendedor (${producto.vendedor}) recibirá tu mensaje y se contactará contigo.`);
                cargarDetallePublicacion();
            }
        });
    }
    
    // ENVIAR MENSAJE
    document.getElementById('enviarMensaje')?.addEventListener('click', () => {
        const texto = document.getElementById('nuevoMensaje').value.trim();
        if (!texto) {
            alert('✏️ Escribí un mensaje antes de enviar');
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
        
        if (usuarioActual.nombre !== producto.vendedor) {
            alert('💬 Mensaje enviado al vendedor. Te responderá a la brevedad.');
        }
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
    actualizarSelectEtiquetas();
    cargarTienda();
    configurarFiltros();
} else if (pagina === 'perfil.html') {
    cargarPerfil();
} else if (pagina === 'publicacion.html') {
    cargarDetallePublicacion();
}