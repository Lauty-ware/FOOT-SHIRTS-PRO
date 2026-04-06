// ==================== INICIALIZACIÓN ====================
if (!localStorage.getItem('usuarios')) {
    localStorage.setItem('usuarios', JSON.stringify([
        {
            username: "Lautaro56",
            email: "lautaro@email.com",
            password: "123456",
            fotoPerfil: null
        }
    ]));
}
if (!localStorage.getItem('productos')) {
    localStorage.setItem('productos', JSON.stringify([]));
}
if (!localStorage.getItem('mensajes')) {
    localStorage.setItem('mensajes', JSON.stringify([]));
}
if (!localStorage.getItem('mensajesLeidos')) {
    localStorage.setItem('mensajesLeidos', JSON.stringify({}));
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

function getMensajesLeidos() {
    return JSON.parse(localStorage.getItem('mensajesLeidos')) || {};
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

function guardarMensajesLeidos(leidos) {
    localStorage.setItem('mensajesLeidos', JSON.stringify(leidos));
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

// ==================== FOTO DE PERFIL ====================
function getFotoPerfil(username) {
    const usuarios = getUsuarios();
    const usuario = usuarios.find(u => u.username === username);
    return usuario?.fotoPerfil || null;
}

function actualizarFotoPerfil(username, fotoBase64) {
    const usuarios = getUsuarios();
    const index = usuarios.findIndex(u => u.username === username);
    if (index !== -1) {
        usuarios[index].fotoPerfil = fotoBase64;
        guardarUsuarios(usuarios);
        
        const usuarioActual = getUsuarioActual();
        if (usuarioActual && usuarioActual.nombre === username) {
            usuarioActual.fotoPerfil = fotoBase64;
            setUsuarioActual(usuarioActual);
        }
        return true;
    }
    return false;
}

function configurarFotoPerfil() {
    const avatarContainer = document.getElementById('avatarContainer');
    const fotoInput = document.getElementById('fotoPerfilInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const usuarioActual = getUsuarioActual();
    
    if (!avatarContainer || !fotoInput || !usuarioActual) return;
    
    const fotoActual = getFotoPerfil(usuarioActual.nombre);
    if (fotoActual && avatarPreview) {
        avatarPreview.innerHTML = `<img src="${fotoActual}" style="width: 100%; height: 100%; object-fit: cover;">`;
    }
    
    avatarContainer.addEventListener('click', () => {
        fotoInput.click();
    });
    
    fotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('Por favor seleccioná una imagen válida');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            alert('La imagen es demasiado grande. Máximo 2MB.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const fotoBase64 = event.target.result;
            actualizarFotoPerfil(usuarioActual.nombre, fotoBase64);
            
            if (avatarPreview) {
                avatarPreview.innerHTML = `<img src="${fotoBase64}" style="width: 100%; height: 100%; object-fit: cover;">`;
            }
            
            alert('✅ Foto de perfil actualizada correctamente');
            setTimeout(() => {
                window.location.reload();
            }, 500);
        };
        reader.readAsDataURL(file);
    });
}

// ==================== CONTADOR DE MENSAJES NO LEÍDOS ====================
function actualizarContadorMensajes() {
    const usuarioActual = getUsuarioActual();
    if (!usuarioActual) return;
    
    const mensajes = getMensajes();
    const leidos = getMensajesLeidos();
    
    let noLeidos = 0;
    mensajes.forEach(m => {
        if (m.para === usuarioActual.nombre && !leidos[`${m.id}_${usuarioActual.nombre}`]) {
            noLeidos++;
        }
    });
    
    const contadorSpan = document.getElementById('mensajesCount');
    if (contadorSpan) {
        if (noLeidos > 0) {
            contadorSpan.textContent = noLeidos;
            contadorSpan.style.display = 'inline-block';
        } else {
            contadorSpan.style.display = 'none';
        }
    }
    
    if (noLeidos > 0) {
        document.title = `(${noLeidos}) Football Shirts Pro`;
    } else {
        document.title = `Football Shirts Pro`;
    }
}

function marcarConversacionComoLeida(conversacionId, otroUsuario) {
    const usuarioActual = getUsuarioActual();
    if (!usuarioActual) return;
    
    const mensajes = getMensajes();
    const leidos = getMensajesLeidos();
    let cambio = false;
    
    mensajes.forEach(m => {
        if (m.conversacionId === conversacionId && m.para === usuarioActual.nombre && !leidos[`${m.id}_${usuarioActual.nombre}`]) {
            leidos[`${m.id}_${usuarioActual.nombre}`] = true;
            cambio = true;
        }
    });
    
    if (cambio) {
        guardarMensajesLeidos(leidos);
        actualizarContadorMensajes();
    }
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
            setUsuarioActual({ nombre: usuario.username, email: usuario.email, fotoPerfil: usuario.fotoPerfil });
            window.location.href = 'tienda.html';
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    });
    
    const btnRegistro = document.getElementById('btnRegistro');
    if (btnRegistro) {
        btnRegistro.addEventListener('click', function() {
            window.location.href = 'registro.html';
        });
    }
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
        
        usuarios.push({ username, email, password, fotoPerfil: null });
        guardarUsuarios(usuarios);
        
        alert('Registro exitoso. Ahora inicia sesión');
        window.location.href = 'index.html';
    });
    
    const volverLogin = document.getElementById('volverLogin');
    if (volverLogin) {
        volverLogin.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
}

// ==================== FILTRADO DE PRODUCTOS ====================
function filtrarProductos() {
    const productos = getProductos();
    const searchInput = document.getElementById('searchInput');
    const precioMinInput = document.getElementById('precioMin');
    const precioMaxInput = document.getElementById('precioMax');
    const filtroEtiquetaSelect = document.getElementById('filtroEtiqueta');
    
    const searchText = searchInput ? searchInput.value.toLowerCase() : '';
    const precioMin = precioMinInput ? (parseInt(precioMinInput.value) || 0) : 0;
    const precioMax = precioMaxInput ? (parseInt(precioMaxInput.value) || Infinity) : Infinity;
    const etiquetaFiltro = filtroEtiquetaSelect ? filtroEtiquetaSelect.value : '';
    
    const urlParams = new URLSearchParams(window.location.search);
    const urlTag = urlParams.get('tag');
    const tagActiva = urlTag || etiquetaFiltro;
    
    return productos.filter(producto => {
        if (!producto.disponible) return false;
        
        const tagsString = producto.etiquetas ? producto.etiquetas.join(' ').toLowerCase() : '';
        const matchesSearch = searchText === '' || 
            producto.nombre.toLowerCase().includes(searchText) ||
            producto.descripcion.toLowerCase().includes(searchText) ||
            tagsString.includes(searchText);
        
        const matchesPrice = producto.precio >= precioMin && producto.precio <= precioMax;
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
    
    contenedor.innerHTML = productosFiltrados.map(producto => {
        const fotoVendedor = getFotoPerfil(producto.vendedor);
        return `
        <div class="producto-card">
            <div class="producto-imagen">
                ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}" style="width: 100%; height: 100%; object-fit: cover;">` : '👕'}
            </div>
            <div class="producto-info">
                <div class="producto-titulo">${escapeHtml(producto.nombre)}</div>
                <div class="producto-precio">$${producto.precio.toLocaleString()}</div>
                <div class="producto-etiquetas">
                    ${producto.etiquetas ? producto.etiquetas.map(tag => `<span class="etiqueta" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`).join('') : ''}
                </div>
                <div class="vendedor-info">
                    <div class="vendedor-avatar">
                        ${fotoVendedor ? `<img src="${fotoVendedor}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : '👤'}
                    </div>
                    <div class="vendedor-nombre">
                        <strong>${escapeHtml(producto.vendedor)}</strong>
                    </div>
                </div>
                <span class="producto-estado">Disponible</span>
                <a href="publicacion.html?id=${producto.id}" class="btn-ver">Ver publicación</a>
            </div>
        </div>
    `}).join('');
    
    document.querySelectorAll('.etiqueta').forEach(etiqueta => {
        etiqueta.addEventListener('click', () => {
            const tag = etiqueta.getAttribute('data-tag');
            window.location.href = `tienda.html?tag=${encodeURIComponent(tag)}`;
        });
    });
}

function aplicarFiltros() {
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
    
    const nombreUsuario = document.getElementById('nombreUsuario');
    const emailUsuario = document.getElementById('emailUsuario');
    
    if (nombreUsuario) nombreUsuario.textContent = usuarioActual.nombre;
    if (emailUsuario) emailUsuario.textContent = usuarioActual.email;
    
    configurarFotoPerfil();
    
    const productos = getProductos();
    const misProductos = productos.filter(p => p.vendedor === usuarioActual.nombre);
    const contenedor = document.getElementById('misPublicaciones');
    
    if (!contenedor) return;
    
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
            <div class="producto-imagen">
                ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}" style="width: 100%; height: 100%; object-fit: cover;">` : '👕'}
            </div>
            <div class="producto-info">
                <div class="producto-titulo">${escapeHtml(producto.nombre)}</div>
                <div class="producto-precio">$${producto.precio.toLocaleString()}</div>
                <div class="producto-etiquetas">
                    ${producto.etiquetas ? producto.etiquetas.map(tag => `<span class="etiqueta">${escapeHtml(tag)}</span>`).join('') : ''}
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
    let imagenSeleccionada = null;
    
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('imagen');
    const previewContainer = document.getElementById('previewContainer');
    
    if (dropZone && fileInput && previewContainer) {
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                procesarImagen(file);
            } else {
                alert('Por favor, seleccioná un archivo de imagen válido');
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                procesarImagen(file);
            }
        });
        
        function procesarImagen(file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('La imagen es demasiado grande. Máximo 2MB.');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                imagenSeleccionada = event.target.result;
                previewContainer.innerHTML = `<img src="${imagenSeleccionada}" class="imagen-preview" style="max-width: 100%; max-height: 150px; border-radius: 8px;">`;
            };
            reader.readAsDataURL(file);
        }
    }
    
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
            alert('Completa todos los campos obligatorios (*)');
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
            imagen: imagenSeleccionada || null,
            vendedor: usuarioActual.nombre,
            disponible: true,
            fecha: new Date().toISOString()
        });
        
        guardarProductos(productos);
        alert('¡Publicación creada con éxito!');
        window.location.href = 'tienda.html';
    });
}

// ==================== ESCAPE HTML ====================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== DETALLE PUBLICACIÓN ====================
function cargarDetallePublicacion() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const contenedor = document.getElementById('detallePublicacion');
    
    if (!contenedor) return;
    
    if (!id) {
        contenedor.innerHTML = '<p>Publicación no encontrada</p>';
        return;
    }
    
    const productos = getProductos();
    const producto = productos.find(p => p.id === id);
    
    if (!producto) {
        contenedor.innerHTML = '<p>Publicación no encontrada</p>';
        return;
    }
    
    const usuarioActual = getUsuarioActual();
    if (!usuarioActual) {
        window.location.href = 'index.html';
        return;
    }
    
    const esMiPublicacion = usuarioActual.nombre === producto.vendedor;
    const fotoVendedor = getFotoPerfil(producto.vendedor);
    
    let html = `
        <div>
            <div style="background: white; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
                    <div style="flex: 1; text-align: center; background: #f8f9fa; border-radius: 12px; padding: 2rem; min-width: 200px;">
                        ${producto.imagen ? 
                            `<img src="${producto.imagen}" alt="${escapeHtml(producto.nombre)}" style="max-width: 100%; max-height: 250px; border-radius: 8px; object-fit: contain;">` : 
                            '<div style="font-size: 6rem;">👕</div>'
                        }
                    </div>
                    
                    <div style="flex: 2;">
                        <h1 style="margin-bottom: 0.5rem;">${escapeHtml(producto.nombre)}</h1>
                        
                        <div class="producto-etiquetas" style="margin: 0.5rem 0 1rem 0;">
                            ${producto.etiquetas ? producto.etiquetas.map(tag => `<span class="etiqueta" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`).join('') : ''}
                        </div>
                        
                        <div style="background: #f39c12; display: inline-block; padding: 0.5rem 1.5rem; border-radius: 30px; margin: 0.5rem 0;">
                            <span style="font-size: 1.8rem; font-weight: bold; color: white;">$${producto.precio.toLocaleString()}</span>
                        </div>
                        
                        <div style="margin: 1.5rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                            <p style="line-height: 1.6;">${escapeHtml(producto.descripcion)}</p>
                        </div>
                        
                        <div style="margin: 1rem 0; padding: 0.5rem 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 0.8rem;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: #f39c12; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                ${fotoVendedor ? `<img src="${fotoVendedor}" style="width: 100%; height: 100%; object-fit: cover;">` : '👤'}
                            </div>
                            <div>
                                <p><strong>Vendedor:</strong> ${escapeHtml(producto.vendedor)}</p>
                                <p><strong>Publicado:</strong> ${new Date(producto.fecha).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <p><strong>Estado:</strong> ${producto.disponible ? '<span style="color: #27ae60;">✅ Disponible</span>' : '<span style="color: #e74c3c;">❌ Vendido</span>'}</p>
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
        </div>
    `;
    
    contenedor.innerHTML = html;
    
    document.querySelectorAll('.etiqueta').forEach(etiqueta => {
        etiqueta.addEventListener('click', () => {
            const tag = etiqueta.getAttribute('data-tag');
            window.location.href = `tienda.html?tag=${encodeURIComponent(tag)}`;
        });
    });
    
    if (esMiPublicacion) {
        const btnEditar = document.getElementById('btnEditar');
        const btnToggleEstado = document.getElementById('btnToggleEstado');
        const btnEliminar = document.getElementById('btnEliminar');
        
        if (btnEditar) {
            btnEditar.addEventListener('click', () => {
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
        }
        
        if (btnToggleEstado) {
            btnToggleEstado.addEventListener('click', () => {
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
        }
        
        if (btnEliminar) {
            btnEliminar.addEventListener('click', () => {
                if (confirm('⚠️ ¿Estás SEGURO de eliminar esta publicación? Esta acción no se puede deshacer.')) {
                    const nuevosProductos = productos.filter(p => p.id !== id);
                    guardarProductos(nuevosProductos);
                    alert('🗑️ Publicación eliminada correctamente');
                    window.location.href = 'tienda.html';
                }
            });
        }
    }
    
    if (!esMiPublicacion && producto.disponible) {
        const btnContactar = document.getElementById('btnContactar');
        const btnComprar = document.getElementById('btnComprar');
        
        if (btnContactar) {
            btnContactar.addEventListener('click', () => {
                abrirModalMensaje(producto.id, producto.nombre, producto.vendedor);
            });
        }
        
        if (btnComprar) {
            btnComprar.addEventListener('click', () => {
                if (confirm(`¿Confirmar compra de "${producto.nombre}" por $${producto.precio.toLocaleString()}?\n\nEl vendedor será notificado y se pondrá en contacto contigo.`)) {
                    const index = productos.findIndex(p => p.id === id);
                    productos[index].disponible = false;
                    guardarProductos(productos);
                    
                    enviarMensajePrivado(
                        producto.id,
                        producto.nombre,
                        producto.vendedor,
                        `🎉 ¡Hola! Quiero COMPRAR esta camiseta. Por favor contactame para coordinar la entrega. Producto: ${producto.nombre} - $${producto.precio.toLocaleString()}`
                    );
                    
                    alert(`✅ ¡Solicitud de compra enviada!\n\nEl vendedor (${producto.vendedor}) recibirá tu mensaje y se contactará contigo.`);
                    cargarDetallePublicacion();
                }
            });
        }
    }
}

// ==================== MENSAJES PRIVADOS ====================
function enviarMensajePrivado(productoId, productoNombre, paraUsuario, texto) {
    const usuarioActual = getUsuarioActual();
    if (!usuarioActual) {
        alert('Debes iniciar sesión');
        return false;
    }
    
    const conversacionId = `${Math.min(usuarioActual.nombre, paraUsuario)}_${Math.max(usuarioActual.nombre, paraUsuario)}_${productoId}`;
    
    const mensajes = getMensajes();
    mensajes.push({
        id: Date.now(),
        conversacionId: conversacionId,
        productoId: productoId,
        productoNombre: productoNombre,
        de: usuarioActual.nombre,
        para: paraUsuario,
        texto: texto,
        fecha: new Date().toISOString(),
        leido: false
    });
    guardarMensajes(mensajes);
    
    actualizarContadorMensajes();
    return true;
}

function abrirModalMensaje(productoId, productoNombre, vendedor) {
    const usuarioActual = getUsuarioActual();
    if (!usuarioActual) {
        alert('Debes iniciar sesión');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    const conversacionId = `${Math.min(usuarioActual.nombre, vendedor)}_${Math.max(usuarioActual.nombre, vendedor)}_${productoId}`;
    const mensajes = getMensajes();
    const conversacion = mensajes.filter(m => m.conversacionId === conversacionId);
    
    let mensajesHtml = '';
    conversacion.forEach(m => {
        const esPropio = m.de === usuarioActual.nombre;
        mensajesHtml += `
            <div class="${esPropio ? 'mensaje-propio' : 'mensaje-otro'}" style="margin: 0.5rem 0; ${esPropio ? 'margin-left: auto;' : 'margin-right: auto;'}">
                <small style="font-size: 0.7rem; ${esPropio ? 'color: #ddd;' : 'color: #666;'}">${m.de} - ${new Date(m.fecha).toLocaleString()}</small>
                <p style="margin: 0.3rem 0 0 0;">${escapeHtml(m.texto)}</p>
            </div>
        `;
    });
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>💬 ${escapeHtml(productoNombre)}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body" id="modalMensajesBody">
                ${mensajesHtml || '<p style="text-align: center; color: #999;">No hay mensajes aún. Escribí tu consulta.</p>'}
            </div>
            <div class="modal-footer">
                <input type="text" id="modalMensajeInput" placeholder="Escribí tu mensaje...">
                <button id="modalEnviarBtn" class="btn btn-primary">Enviar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    marcarConversacionComoLeida(conversacionId, vendedor);
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    const enviarBtn = modal.querySelector('#modalEnviarBtn');
    const input = modal.querySelector('#modalMensajeInput');
    
    const enviarMensaje = () => {
        const texto = input.value.trim();
        if (!texto) {
            alert('Escribí un mensaje');
            return;
        }
        
        const mensajes = getMensajes();
        mensajes.push({
            id: Date.now(),
            conversacionId: conversacionId,
            productoId: productoId,
            productoNombre: productoNombre,
            de: usuarioActual.nombre,
            para: vendedor,
            texto: texto,
            fecha: new Date().toISOString(),
            leido: false
        });
        guardarMensajes(mensajes);
        
        input.value = '';
        
        const body = modal.querySelector('#modalMensajesBody');
        const nuevoMensajeHtml = `
            <div class="mensaje-propio" style="margin: 0.5rem 0; margin-left: auto;">
                <small style="font-size: 0.7rem; color: #ddd;">${usuarioActual.nombre} - ${new Date().toLocaleString()}</small>
                <p style="margin: 0.3rem 0 0 0;">${escapeHtml(texto)}</p>
            </div>
        `;
        
        if (body.innerHTML.includes('No hay mensajes')) {
            body.innerHTML = nuevoMensajeHtml;
        } else {
            body.innerHTML += nuevoMensajeHtml;
        }
        body.scrollTop = body.scrollHeight;
        
        actualizarContadorMensajes();
        alert('💬 Mensaje enviado');
    };
    
    enviarBtn.addEventListener('click', enviarMensaje);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            enviarMensaje();
        }
    });
    
    const body = modal.querySelector('#modalMensajesBody');
    if (body) body.scrollTop = body.scrollHeight;
}

// ==================== PÁGINA DE MENSAJES ====================
function cargarMensajesPage() {
    const usuarioActual = getUsuarioActual();
    if (!usuarioActual) {
        window.location.href = 'index.html';
        return;
    }
    
    const mensajes = getMensajes();
    const conversacionesMap = new Map();
    
    mensajes.forEach(m => {
        if (m.para === usuarioActual.nombre || m.de === usuarioActual.nombre) {
            if (!conversacionesMap.has(m.conversacionId)) {
                conversacionesMap.set(m.conversacionId, {
                    id: m.conversacionId,
                    productoId: m.productoId,
                    productoNombre: m.productoNombre,
                    otroUsuario: m.de === usuarioActual.nombre ? m.para : m.de,
                    ultimoMensaje: m.texto,
                    ultimaFecha: m.fecha,
                    noLeidos: 0
                });
            }
            
            const conv = conversacionesMap.get(m.conversacionId);
            if (new Date(m.fecha) > new Date(conv.ultimaFecha)) {
                conv.ultimoMensaje = m.texto;
                conv.ultimaFecha = m.fecha;
            }
            if (m.para === usuarioActual.nombre) {
                const leidos = getMensajesLeidos();
                if (!leidos[`${m.id}_${usuarioActual.nombre}`]) {
                    conv.noLeidos++;
                }
            }
        }
    });
    
    const contenedor = document.getElementById('conversacionesList');
    if (!contenedor) return;
    
    if (conversacionesMap.size === 0) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: white; border-radius: 12px;">
                <p style="font-size: 1.2rem; color: #666;">📭 No hay conversaciones aún</p>
                <p style="margin-top: 1rem;">Cuando contactes a un vendedor, aparecerán aquí tus mensajes.</p>
            </div>
        `;
        return;
    }
    
    const conversacionesArray = Array.from(conversacionesMap.values());
    conversacionesArray.sort((a, b) => new Date(b.ultimaFecha) - new Date(a.ultimaFecha));
    
    contenedor.innerHTML = conversacionesArray.map(conv => `
        <div class="conversacion-card ${conv.noLeidos > 0 ? 'no-leido' : ''}" data-producto-id="${conv.productoId}" data-producto-nombre="${conv.productoNombre}" data-otro-usuario="${conv.otroUsuario}">
            <div class="conversacion-info">
                <div class="conversacion-producto">👕 ${escapeHtml(conv.productoNombre)}</div>
                <div class="conversacion-ultimo">💬 ${escapeHtml(conv.otroUsuario)}: ${escapeHtml(conv.ultimoMensaje.substring(0, 50))}${conv.ultimoMensaje.length > 50 ? '...' : ''}</div>
                <div class="conversacion-fecha">${new Date(conv.ultimaFecha).toLocaleString()}</div>
            </div>
            ${conv.noLeidos > 0 ? `<div class="conversacion-estado">${conv.noLeidos}</div>` : ''}
        </div>
    `).join('');
    
    document.querySelectorAll('.conversacion-card').forEach(card => {
        card.addEventListener('click', () => {
            const productoId = parseInt(card.getAttribute('data-producto-id'));
            const productoNombre = card.getAttribute('data-producto-nombre');
            const otroUsuario = card.getAttribute('data-otro-usuario');
            abrirModalMensaje(productoId, productoNombre, otroUsuario);
        });
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
actualizarContadorMensajes();

const pagina = window.location.pathname.split('/').pop();

if (pagina === 'tienda.html') {
    actualizarSelectEtiquetas();
    cargarTienda();
    configurarFiltros();
    setInterval(actualizarContadorMensajes, 5000);
} else if (pagina === 'perfil.html') {
    cargarPerfil();
} else if (pagina === 'publicacion.html') {
    cargarDetallePublicacion();
} else if (pagina === 'mensajes.html') {
    cargarMensajesPage();
}