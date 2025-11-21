// ----------------------------
// SELECCIÓN DE ELEMENTOS
// ----------------------------
let botonesAgregar = document.querySelectorAll(".agregar-carrito");
const listaCarrito = document.querySelector("#lista-carrito");
const totalCarrito = document.querySelector("#total");
const contadorCarrito = document.querySelector("#contadorCarrito");
const carritoPanel = document.querySelector("#carrito");
const abrirCarrito = document.querySelector("#toggleCarrito");
const cerrarCarrito = document.querySelector("#cerrarCarrito");

// Controles móviles
const mobileMenuToggle = document.querySelector('#mobileMenuToggle');
const toggleCarritoMobile = document.querySelector('#toggleCarritoMobile');
const mobileMenu = document.querySelector('#mobileMenu');
const mobileOpenCarrito = document.querySelector('#mobileOpenCarrito');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');

// Navbar
const navbar = document.querySelector('.navbar');
const root = document.documentElement;

// Estado para anclar el carrito al hacer click
let carritoFijado = false;

// Array para guardar productos en el carrito
let carrito = [];

// Utilidad: formato de moneda con separadores
const formatearDinero = (valor) => {
  const n = Number(valor) || 0;
  return n.toLocaleString('es-CO', { minimumFractionDigits: 0 });
};

// ----------------------------
// FUNCIÓN: AGREGAR PRODUCTO
// ----------------------------
function agregarProducto(nombre, precio, talla = null, coleccion = null, color = null) {
  const key = `${nombre}__${color ?? 'SC'}__${talla ?? "SN"}`;
  const existente = carrito.find(item => item.key === key);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ key, nombre, precio, talla, coleccion, color, cantidad: 1 });
  }
  actualizarCarrito();
}

// ----------------------------
// FUNCIÓN: ELIMINAR PRODUCTO
// ----------------------------
function eliminarProducto(nombre) {
  carrito = carrito.filter(item => item.nombre !== nombre);
  actualizarCarrito();
}

// ----------------------------
// FUNCIÓN: ACTUALIZAR CARRITO
// ----------------------------
function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;
  let cantidadTotal = 0;

  carrito.forEach(item => {
    const li = document.createElement("li");
    const tallaTxt = item.talla ? `Talla: ${item.talla}` : 'Talla: N/A';
    const qty = item.cantidad;
    const unit = formatearDinero(item.precio);
    const subtotal = formatearDinero(item.precio * qty);
    const colorTxt = item.color ? ` · Color: ${item.color}` : '';
    li.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:2px; max-width: 100%;">
        <strong>${item.nombre}</strong>
        <small style="color:#bbb;">${tallaTxt}${colorTxt} · Cant: x${qty} · Unit: ${unit}</small>
      </div>
      <span style="margin-left:auto; font-weight:700; color: var(--accent);">${subtotal}</span>
      <button class="eliminar" title="Quitar">X</button>
    `;

    li.querySelector(".eliminar").addEventListener("click", () => {
      eliminarProducto(item.nombre);
    });

    listaCarrito.appendChild(li);

    total += item.precio * item.cantidad;
    cantidadTotal += item.cantidad;
  });

  totalCarrito.textContent = `${formatearDinero(total)}`;
  
  // Mostrar u ocultar contador
  if (cantidadTotal > 0) {
    contadorCarrito.textContent = cantidadTotal;
    contadorCarrito.classList.remove("hidden");
  } else {
    contadorCarrito.classList.add("hidden");
  }

  // Habilita o deshabilita el botón de pedido
  const btnPedido = document.querySelector('#realizarPedido');
  if (btnPedido) btnPedido.disabled = carrito.length === 0;
}

// ----------------------------
// EVENTOS EN BOTONES DE PRODUCTOS
// ----------------------------
function crearSelectorTallas(boton) {
  // Evitar duplicados
  if (boton.nextElementSibling && boton.nextElementSibling.classList.contains("tallas-menu")) return;

  const tallas = (boton.dataset.tallas || "").split(",").map(t => t.trim()).filter(Boolean);

  // Detectar si el producto tiene variación de color por la UI (color-toggle presente)
  const card = boton.closest('.card.producto');
  const colorBtns = card ? card.querySelectorAll('.color-btn') : null;
  const tieneColor = colorBtns && colorBtns.length > 0;

  const nombre = boton.dataset.nombre;
  const precio = parseFloat(boton.dataset.precio);
  const coleccion = boton.dataset.coleccion || null;

  // Si no hay tallas y no hay color, agregar directo
  if (!tallas.length && !tieneColor) {
    agregarProducto(nombre, precio, null, coleccion, null);
    return;
  }

  // Ocultar botón y construir selector(es)
  boton.style.display = "none";
  const contenedor = document.createElement("div");
  contenedor.className = "tallas-menu";

  let colorSeleccionado = null;

  // Bloque de color si aplica
  if (tieneColor) {
    const labelColor = document.createElement('p');
    labelColor.textContent = 'Elige color:';
    contenedor.appendChild(labelColor);

    colorBtns.forEach(btn => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'talla-opcion';
      chip.textContent = btn.dataset.color.charAt(0).toUpperCase() + btn.dataset.color.slice(1);
      chip.addEventListener('click', () => {
        colorSeleccionado = btn.dataset.color; // 'blanco' | 'negro'
        // Reflejar visualmente selección de color en tarjeta
        card.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Cambiar imagen acorde al color manteniendo vista actual
        const media = card.querySelector('.product-media');
        const img = card.querySelector('.product-img');
        const viewBtnActivo = card.querySelector('.view-btn.active');
        const view = viewBtnActivo ? viewBtnActivo.dataset.view : 'front';
        const key = `${view}-${colorSeleccionado}`;
        const src = media.dataset[key];
        if (src) img.src = src;
      });
      contenedor.appendChild(chip);
    });
  }

  // Bloque de tallas si aplica
  if (tallas.length) {
    const label = document.createElement("p");
    label.textContent = "Elige tu talla:";
    contenedor.appendChild(label);

    tallas.forEach(talla => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "talla-opcion";
      chip.textContent = talla;
      chip.addEventListener("click", () => {
        // Validar color requerido si aplica
        if (tieneColor && !colorSeleccionado) {
          // Auto-seleccionar el color activo en la tarjeta si existe
          const activo = card.querySelector('.color-btn.active');
          colorSeleccionado = activo ? activo.dataset.color : null;
          if (!colorSeleccionado) return; // obliga a elegir color primero
        }
        // Al seleccionar talla, agregar al carrito y cerrar menú
        contenedor.remove();
        boton.style.display = "inline-block";
        boton.textContent = "Agregar al carrito";

        const nombreConColor = (tieneColor && colorSeleccionado)
          ? `${nombre} (${colorSeleccionado.charAt(0).toUpperCase() + colorSeleccionado.slice(1)})`
          : nombre;

        agregarProducto(
          nombreConColor,
          precio,
          talla,
          coleccion,
          tieneColor ? colorSeleccionado : null
        );
      });
      contenedor.appendChild(chip);
    });
  }

  // Botón para cancelar selección
  const cancelar = document.createElement("button");
  cancelar.type = "button";
  cancelar.className = "talla-opcion";
  cancelar.textContent = "Cancelar";
  cancelar.style.background = "#333";
  cancelar.addEventListener("click", () => {
    contenedor.remove();
    boton.style.display = "inline-block";
  });
  contenedor.appendChild(cancelar);

  boton.parentElement.appendChild(contenedor);
}

botonesAgregar.forEach(boton => {
  boton.addEventListener("click", e => {
    crearSelectorTallas(e.currentTarget);
  });
});

// ----------------------------
// TOGGLE DEL CARRITO (según dispositivo)
// ----------------------------
const mediaDesktop = window.matchMedia('(hover: hover) and (pointer: fine)');

function configurarCarritoPorDispositivo() {
  // Reset de estado visual
  carritoFijado = false;
  carritoPanel.classList.remove('active', 'hover-open');

  if (mediaDesktop.matches) {
    // Escritorio: hover para previsualizar, click para fijar/desfijar
    if (abrirCarrito) {
      abrirCarrito.addEventListener("click", () => {
        carritoFijado = !carritoFijado;
        carritoPanel.classList.toggle("active", carritoFijado);
      });

      abrirCarrito.addEventListener("mouseenter", () => {
        if (!carritoFijado) carritoPanel.classList.add("hover-open");
      });
      abrirCarrito.addEventListener("mouseleave", () => {
        if (!carritoFijado) carritoPanel.classList.remove("hover-open");
      });
    }

    carritoPanel.addEventListener("mouseenter", () => {
      if (!carritoFijado) carritoPanel.classList.add("hover-open");
    });
    carritoPanel.addEventListener("mouseleave", () => {
      if (!carritoFijado) carritoPanel.classList.remove("hover-open");
    });
  } else {
    // Móvil/Tablet: solo click para abrir y se mantiene hasta cerrar con X
    const abrirCarritoMovil = () => {
      carritoFijado = true;
      carritoPanel.classList.add("active");
      carritoPanel.classList.remove("hover-open");
      cerrarMobileMenu();
      // Evitar scroll del body cuando carrito está abierto en móvil
      document.body.style.overflow = 'hidden';
    };
    if (toggleCarritoMobile) toggleCarritoMobile.addEventListener("click", abrirCarritoMovil);
    if (mobileOpenCarrito) mobileOpenCarrito.addEventListener("click", abrirCarritoMovil);
  }
}

configurarCarritoPorDispositivo();

cerrarCarrito.addEventListener("click", () => {
  carritoFijado = false;
  carritoPanel.classList.remove("active", "hover-open");
  // Restaurar scroll del body
  document.body.style.overflow = '';
});

// ----------------------------
// NAVBAR móvil: shrink al hacer scroll + menú
// ----------------------------
function onScrollMobileNavbar() {
  if (mediaDesktop.matches) return; // solo móvil/tablet
  const scrolled = window.scrollY > 20;
  navbar.classList.toggle('shrink', scrolled);
}
window.addEventListener('scroll', onScrollMobileNavbar, { passive: true });

// Ajustar padding-top dinámico según altura de la navbar en móvil
function updateHeaderOffset() {
  if (!navbar) return;
  const h = navbar.getBoundingClientRect().height;
  root.style.setProperty('--header-offset', `${Math.ceil(h) + 8}px`);
}
window.addEventListener('load', updateHeaderOffset);
window.addEventListener('resize', updateHeaderOffset);
const ro = new ResizeObserver(updateHeaderOffset);
if (navbar && ro) ro.observe(navbar);

function cerrarMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.add('hidden');
  mobileMenu.setAttribute('aria-hidden', 'true');
}
function toggleMobileMenu() {
  if (!mobileMenu) return;
  const opened = mobileMenu.classList.toggle('hidden');
  mobileMenu.setAttribute('aria-hidden', opened ? 'true' : 'false');
}
if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleMobileMenu();
});
if (mobileMenu) {
  mobileMenu.addEventListener('click', (e) => e.stopPropagation());
}
if (mobileMenuLinks && mobileMenuLinks.length) {
  mobileMenuLinks.forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const tabId = btn.dataset.tab;
    if (tabId) {
      document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
      activarTabConAnimacion(tabId);
      const desktopBtn = document.querySelector(`.tab-link[data-tab="${tabId}"]`);
      if (desktopBtn) desktopBtn.classList.add('active');
    }
    cerrarMobileMenu();
  }));
}
// Cerrar menú al hacer click/tap fuera
window.addEventListener('click', (e) => {
  const target = e.target;
  const clickedToggle = mobileMenuToggle && mobileMenuToggle.contains(target);
  const clickedMenu = mobileMenu && mobileMenu.contains(target);
  const clickedCartButtons = (toggleCarritoMobile && toggleCarritoMobile.contains(target)) || (mobileOpenCarrito && mobileOpenCarrito.contains(target));
  if (!clickedToggle && !clickedMenu && !clickedCartButtons) {
    cerrarMobileMenu();
  }
}, { passive: true });

// ----------------------------
// REALIZAR PEDIDO (modal resumen)
// ----------------------------
const btnPedido = document.querySelector('#realizarPedido');
const modal = document.querySelector('#pedidoModal');
const modalCerrarIcon = document.querySelector('#cerrarPedidoModal');
const modalCerrarBtn = document.querySelector('#cerrarPedido');
const modalDetalle = document.querySelector('#pedidoDetalle');
const modalConfirmar = document.querySelector('#confirmarPedido');

function abrirModalPedido() {
  // Construir detalle del pedido
  if (!modal || !modalDetalle) return;

  if (!carrito.length) {
    modalDetalle.innerHTML = '<p>Tu carrito está vacío.</p>';
  } else {
    const itemsHtml = carrito.map(item => {
      const tallaTxt = item.talla ? `Talla: ${item.talla}` : 'Talla: N/A';
      const colTxt = item.coleccion ? `Colección: ${item.coleccion}` : 'Colección: N/A';
      const subtotal = `${formatearDinero(item.precio * item.cantidad)}`;
      return `<li>${item.nombre} — ${tallaTxt} — ${colTxt} — Cant: ${item.cantidad} — Subtotal: ${subtotal}</li>`;
    }).join('');

    modalDetalle.innerHTML = `
      <ul style="padding-left: 1rem; list-style: disc;">
        ${itemsHtml}
      </ul>
      <p style="margin-top: .75rem; font-weight: 700;">Total: ${totalCarrito.textContent}</p>
    `;
  }

  modal.classList.remove('hidden');
}

function cerrarModalPedido() {
  if (!modal) return;
  modal.classList.add('hidden');
}

if (btnPedido) btnPedido.addEventListener('click', abrirModalPedido);
if (modalCerrarIcon) modalCerrarIcon.addEventListener('click', cerrarModalPedido);
if (modalCerrarBtn) modalCerrarBtn.addEventListener('click', cerrarModalPedido);
if (modal) modal.addEventListener('click', (e) => {
  if (e.target === modal) cerrarModalPedido();
});

// Confirmar pedido -> abrir checkout
if (modalConfirmar) {
  modalConfirmar.addEventListener('click', () => {
    if (!carrito.length) return;
    cerrarModalPedido();
    abrirCheckout();
  });
}

// ----------------------------
// CHECKOUT: Modal con datos de envío y WhatsApp
// ----------------------------
const checkoutModal = document.querySelector('#checkoutModal');
const checkoutResumen = document.querySelector('#checkoutResumen');
const checkoutTotal = document.querySelector('#checkoutTotal');
const cerrarCheckout = document.querySelector('#cerrarCheckout');
const cerrarCheckoutModal = document.querySelector('#cerrarCheckoutModal');
const enviarWhatsapp = document.querySelector('#enviarWhatsapp');
const checkoutForm = document.querySelector('#checkoutForm');
const fNombreApellido = document.querySelector('#nombreApellido');
const fCedula = document.querySelector('#cedula');
const fDepartamento = document.querySelector('#departamento');
const fCiudad = document.querySelector('#ciudad');
const fCiudadOtra = document.querySelector('#ciudadOtra');
const fDireccion = document.querySelector('#direccion');
const fBarrio = document.querySelector('#barrio');

// Mapa de departamentos -> ciudades (lista acotada + opción "Otra")
const CIUDADES_CO = {
  'Amazonas': ['Leticia', 'Otra'],
  'Antioquia': ['Medellín', 'Bello', 'Envigado', 'Itagüí', 'Rionegro', 'Apartadó', 'Turbo', 'Caucasia', 'La Ceja', 'Sabaneta', 'Otra'],
  'Arauca': ['Arauca', 'Saravena', 'Otra'],
  'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Galapa', 'Sabanalarga', 'Puerto Colombia', 'Otra'],
  'Bolívar': ['Cartagena', 'Magangué', 'Turbaco', 'Otra'],
  'Boyacá': ['Tunja', 'Duitama', 'Sogamoso', 'Otra'],
  'Caldas': ['Manizales', 'Villamaría', 'Chinchiná', 'Otra'],
  'Caquetá': ['Florencia', 'San Vicente del Caguán', 'Otra'],
  'Casanare': ['Yopal', 'Villanueva', 'Otra'],
  'Cauca': ['Popayán', 'Santander de Quilichao', 'Otra'],
  'Cesar': ['Valledupar', 'Aguachica', 'Otra'],
  'Chocó': ['Quibdó', 'Istmina', 'Otra'],
  'Córdoba': ['Montería', 'Lorica', 'Cereté', 'Otra'],
  'Cundinamarca': ['Soacha', 'Chía', 'Zipaquirá', 'Facatativá', 'Girardot', 'Fusagasugá', 'Cajicá', 'Mosquera', 'Otra'],
  'Guainía': ['Inírida', 'Otra'],
  'Guaviare': ['San José del Guaviare', 'Otra'],
  'Huila': ['Neiva', 'Pitalito', 'Garzón', 'Otra'],
  'La Guajira': ['Riohacha', 'Maicao', 'Uribia', 'Otra'],
  'Magdalena': ['Santa Marta', 'Ciénaga', 'Fundación', 'Otra'],
  'Meta': ['Villavicencio', 'Acacías', 'Granada', 'Otra'],
  'Nariño': ['Pasto', 'Ipiales', 'Tumaco', 'Otra'],
  'Norte de Santander': ['Cúcuta', 'Ocaña', 'Villa del Rosario', 'Los Patios', 'Otra'],
  'Putumayo': ['Mocoa', 'Puerto Asís', 'Orito', 'Otra'],
  'Quindío': ['Armenia', 'La Tebaida', 'Montenegro', 'Otra'],
  'Risaralda': ['Pereira', 'Dosquebradas', 'La Virginia', 'Otra'],
  'San Andrés y Providencia': ['San Andrés', 'Providencia', 'Otra'],
  'Santander': ['Bucaramanga', 'Floridablanca', 'Giron', 'Piedecuesta', 'Barrancabermeja', 'Otra'],
  'Sucre': ['Sincelejo', 'Corozal', 'Otra'],
  'Tolima': ['Ibagué', 'Espinal', 'Honda', 'Otra'],
  'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Buga', 'Yumbo', 'Otra'],
  'Vaupés': ['Mitú', 'Otra'],
  'Vichada': ['Puerto Carreño', 'Otra']
};

function abrirCheckout() {
  if (!checkoutModal) return;

  // Construir resumen
  const itemsHtml = carrito.map(item => {
    const tallaTxt = item.talla ? `Talla: ${item.talla}` : 'Talla: N/A';
    const colTxt = item.coleccion ? `Colección: ${item.coleccion}` : 'Colección: N/A';
    const subtotal = `${formatearDinero(item.precio * item.cantidad)}`;
    return `<li>${item.nombre} — ${tallaTxt} — ${colTxt} — Cant: ${item.cantidad} — Subtotal: ${subtotal}</li>`;
  }).join('');

  if (checkoutResumen) {
    checkoutResumen.innerHTML = `<ul style="padding-left: 1rem; list-style: disc;">${itemsHtml}</ul>`;
  }
  if (checkoutTotal) {
    checkoutTotal.textContent = `Total: ${totalCarrito.textContent}`;
  }

  // Reset de formulario
  if (checkoutForm) checkoutForm.reset();
  if (fCiudadOtra) fCiudadOtra.classList.add('hidden');

  checkoutModal.classList.remove('hidden');
  checkoutModal.setAttribute('aria-hidden', 'false');

  validarCheckout();
}

function cerrarCheckoutFn() {
  if (!checkoutModal) return;
  checkoutModal.classList.add('hidden');
  checkoutModal.setAttribute('aria-hidden', 'true');
}

function poblarCiudades(dep) {
  if (!fCiudad) return;
  fCiudad.innerHTML = '';
  const lista = CIUDADES_CO[dep] || ['Otra'];
  const opt0 = document.createElement('option');
  opt0.value = '';
  opt0.textContent = 'Seleccione una ciudad';
  opt0.disabled = true; opt0.selected = true;
  fCiudad.appendChild(opt0);
  lista.forEach(c => {
    const op = document.createElement('option');
    op.value = c;
    op.textContent = c;
    fCiudad.appendChild(op);
  });
}

function validarCheckout() {
  const mark = (el, ok) => {
    if (!el) return;
    el.classList.toggle('is-invalid', !ok);
    el.classList.toggle('is-valid', ok);
  };

  const nombreOk = fNombreApellido && fNombreApellido.value.trim().length >= 3;
  const cedulaOk = fCedula && /^[0-9]{5,}$/.test(fCedula.value.trim());
  const depOk = fDepartamento && fDepartamento.value.trim().length > 0;
  let ciudadOk = false;
  if (fCiudad && fCiudad.value === 'Otra') {
    if (fCiudadOtra) fCiudadOtra.classList.remove('hidden');
    ciudadOk = fCiudadOtra && fCiudadOtra.value.trim().length >= 2;
  } else {
    if (fCiudadOtra) {
      fCiudadOtra.classList.add('hidden');
      fCiudadOtra.classList.remove('is-invalid', 'is-valid');
    }
    ciudadOk = fCiudad && fCiudad.value && fCiudad.value !== '';
  }
  const dirOk = fDireccion && fDireccion.value.trim().length >= 4;
  const barrioOk = fBarrio && fBarrio.value.trim().length >= 2;

  // Aplicar estilos de validación
  mark(fNombreApellido, !!nombreOk);
  mark(fCedula, !!cedulaOk);
  mark(fDepartamento, !!depOk);
  if (fCiudad) {
    const ciudadSelectOk = fCiudad.value && fCiudad.value !== '';
    mark(fCiudad, !!ciudadSelectOk);
  }
  if (fCiudad && fCiudad.value === 'Otra') {
    mark(fCiudadOtra, !!ciudadOk);
  }
  mark(fDireccion, !!dirOk);
  mark(fBarrio, !!barrioOk);

  const valido = nombreOk && cedulaOk && depOk && ciudadOk && dirOk && barrioOk;
  if (enviarWhatsapp) enviarWhatsapp.disabled = !valido;
  return valido;
}

// Cierre checkout
if (cerrarCheckout) cerrarCheckout.addEventListener('click', cerrarCheckoutFn);
if (cerrarCheckoutModal) cerrarCheckoutModal.addEventListener('click', cerrarCheckoutFn);
if (checkoutModal) checkoutModal.addEventListener('click', (e) => {
  if (e.target === checkoutModal) cerrarCheckoutFn();
});

// Eventos del formulario
if (checkoutForm) {
  ['input','change'].forEach(evt => checkoutForm.addEventListener(evt, validarCheckout));
}
if (fDepartamento) {
  fDepartamento.addEventListener('change', (e) => {
    const dep = e.target.value;
    poblarCiudades(dep);
    validarCheckout();
  });
}
if (fCiudad) {
  fCiudad.addEventListener('change', () => {
    validarCheckout();
  });
}

// Enviar WhatsApp con todos los datos
if (enviarWhatsapp) {
  enviarWhatsapp.addEventListener('click', () => {
    if (!validarCheckout() || !carrito.length) return;

    const dep = fDepartamento.value;
    const ciudad = (fCiudad.value === 'Otra' ? (fCiudadOtra.value.trim()) : fCiudad.value);
    const datos = {
      nombre: fNombreApellido.value.trim(),
      cedula: fCedula.value.trim(),
      departamento: dep,
      ciudad,
      direccion: fDireccion.value.trim(),
      barrio: fBarrio.value.trim(),
    };

    const items = carrito.map(item => {
      const col = item.coleccion ? `Colección: ${item.coleccion}` : 'Colección: N/A';
      const talla = item.talla ? `Talla: ${item.talla}` : 'Talla: N/A';
      const subtotal = formatearDinero(item.precio * item.cantidad);
      return `• ${item.nombre} | ${col} | ${talla} | Cant: ${item.cantidad} | Subtotal: ${subtotal}`;
    }).join('\n');

    const totalTxt = totalCarrito.textContent;

    const mensaje = [
      'Hola, quiero realizar el siguiente pedido:',
      items,
      '',
      `Total: ${totalTxt}`,
      '',
      'Datos del cliente:',
      `Nombre y Apellido: ${datos.nombre}`,
      `Cédula: ${datos.cedula}`,
      `Departamento: ${datos.departamento}`,
      `Ciudad: ${datos.ciudad}`,
      `Dirección: ${datos.direccion}`,
      `Barrio: ${datos.barrio}`
    ].join('\n');

    const numero = '573241457674'; // +57 Colombia
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

    // Abrir WhatsApp en nueva pestaña/ventana
    window.open(url, '_blank');

    // Post-acción: cerrar checkout y vaciar carrito para dejar la página limpia al volver
    cerrarCheckoutFn();
    carrito = [];
    actualizarCarrito();
    carritoPanel.classList.remove('active', 'hover-open');
    carritoFijado = false;
  });
}

// ----------------------------
// SISTEMA DE TABS (SPA)
// ----------------------------
const tabLinks = document.querySelectorAll(".tab-link");
const tabContents = document.querySelectorAll(".tab-content");

function activarTabConAnimacion(id) {
  const actual = document.querySelector(".tab-content.active");
  const siguiente = document.getElementById(id);
  if (actual === siguiente) return;

  if (actual) {
    actual.classList.remove("active", "fade-in");
    actual.classList.add("fade-out");
  }

  // Espera la animación de salida y luego muestra la siguiente
  setTimeout(() => {
    if (actual) actual.classList.remove("fade-out");
    siguiente.classList.add("active", "fade-in");
    // Re-vincular listeners de tallas y vista/color tras cambiar de pestaña
    inicializarInteraccionesCatalogo();
  }, 250);
}

tabLinks.forEach(link => {
  link.addEventListener("click", () => {
    tabLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    activarTabConAnimacion(link.dataset.tab);
  });
});

// ----------------------------
// PREVISUALIZACIÓN DE PRODUCTO: Vista pecho/espalda y color
// ----------------------------
function inicializarInteraccionesCatalogo() {
  // Botones agregar (recolectar de nuevo por si se cargaron nuevos nodos)
  botonesAgregar = document.querySelectorAll('.agregar-carrito');
  botonesAgregar.forEach(boton => {
    if (!boton.__tallasBinded) {
      boton.addEventListener('click', (e) => crearSelectorTallas(e.currentTarget));
      boton.__tallasBinded = true;
    }
  });

  // Vista pecho/espalda
  // Asignación de rutas pecho/espalda por mapa (si existe)
  document.querySelectorAll('.producto').forEach(card => {
    const name = (card.querySelector('h3')?.textContent || '').trim();
    if (PRODUCT_IMAGE_MAP[name]) {
      const media = card.querySelector('.product-media');
      if (media) {
        media.dataset.front = PRODUCT_IMAGE_MAP[name].front;
        media.dataset.back = PRODUCT_IMAGE_MAP[name].back;
      }
    }
  });

  document.querySelectorAll('.producto .view-btn').forEach(btn => {
    if (btn.__viewBinded) return;
    btn.addEventListener('click', () => {
      const cont = btn.closest('.producto');
      const media = cont.querySelector('.product-media');
      const img = cont.querySelector('.product-img');
      const view = btn.dataset.view; // 'front' | 'back'

      // Alternar estado visual
      cont.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Soporte para productos con colores (dragon)
      const colorActivoBtn = cont.querySelector('.color-btn.active');
      const color = colorActivoBtn ? colorActivoBtn.dataset.color : null; // 'blanco' | 'negro'

      let src = '';
      if (color && media.dataset[`front-${color}`]) {
        // Producto con colores
        const key = `${view}-${color}`; // ej: front-blanco
        src = media.dataset[key];
      } else {
        // Producto sin colores
        src = media.dataset[view === 'front' ? 'front' : 'back'];
      }
      if (src) img.src = src;
    });
    btn.__viewBinded = true;
  });

  // Selector de color (solo Dragon)
  document.querySelectorAll('.producto .color-btn').forEach(btn => {
    if (btn.__colorBinded) return;
    btn.addEventListener('click', () => {
      const cont = btn.closest('.producto');
      const media = cont.querySelector('.product-media');
      const img = cont.querySelector('.product-img');
      const color = btn.dataset.color; // 'blanco' | 'negro'

      cont.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Mantener vista actual (pecho/espalda)
      const viewBtnActivo = cont.querySelector('.view-btn.active');
      const view = viewBtnActivo ? viewBtnActivo.dataset.view : 'front';

      const key = `${view}-${color}`;
      const src = media.dataset[key];
      if (src) img.src = src;
    });
    btn.__colorBinded = true;
  });
}

// Inicializar al cargar
window.addEventListener('load', inicializarInteraccionesCatalogo);

// ----------------------------
// FILTROS DE TIENDA
// ----------------------------
(function initFiltros() {
  const tienda = document.querySelector('#tienda');
  if (!tienda) return;

  const panel = document.querySelector('#filtersPanel');
  const overlay = document.querySelector('#filtersOverlay');
  const btnOpen = document.querySelector('#openFilters');
  const btnClose = document.querySelector('#closeFilters');
  const btnApply = document.querySelector('#applyFilters');
  const btnReset = document.querySelector('#resetFilters');
  const btnClear = document.querySelector('#clearFilters');
  const noResultados = document.querySelector('#noResultados');

  const contCategoria = document.querySelector('#filtroCategoria');
  const contColeccion = document.querySelector('#filtroColeccion');
  const contTalla = document.querySelector('#filtroTalla');
  const contColor = document.querySelector('#filtroColor');

  const productos = Array.from(tienda.querySelectorAll('.card.producto'));

  // Mapa de imágenes por producto (opcional): permite definir rutas de pecho/espalda
  // clave: texto exacto del h3 del producto
  const PRODUCT_IMAGE_MAP = {
    // Ejemplo:
    // 'Camiseta Oversize KYO-KI': {
    //   front: 'img/KYO-KI/camiseta-oversize/negro-frente.png',
    //   back:  'img/KYO-KI/camiseta-oversize/negro-espalda.png'
    // }
  };

  // Inferir y normalizar atributos de productos
  const normaliza = (s) => (s || '').toString().trim().toLowerCase();
  productos.forEach(prod => {
    // Colección: ya existe en data-coleccion
    const col = prod.getAttribute('data-coleccion');
    if (col) prod.setAttribute('data-coleccion', col);

    // Categoría: inferir por texto del h3 o párrafo
    let categoria = 'camiseta';
    const title = (prod.querySelector('h3')?.textContent || '').toLowerCase();
    const ptxt = (prod.querySelector('p')?.textContent || '').toLowerCase();
    if (title.includes('sudadera')) categoria = 'sudadera';
    else if (title.includes('pantaloneta')) categoria = 'pantaloneta';
    else if (title.includes('crop')) categoria = 'top';
    else if (title.includes('short')) categoria = 'short';
    else if (title.includes('compresión') || title.includes('compresion')) categoria = 'camiseta';
    prod.setAttribute('data-categoria', categoria);

    // Tallas: a partir de data-tallas del botón
    const btn = prod.querySelector('.agregar-carrito');
    const tallas = (btn?.dataset.tallas || '')
      .split(',').map(t=>t.trim().toUpperCase()).filter(Boolean);
    if (tallas.length) prod.setAttribute('data-tallas', tallas.join(','));

    // Colores: buscar en el texto del párrafo principal
    let colores = [];
    const coloresTxt = ptxt.split('colores:')[1] || ptxt.split(' • ')[2] || '';
    if (coloresTxt) {
      colores = coloresTxt
        .replace(/\.|\n/g,'')
        .split(/[\/•,]/)
        .map(c=>c.trim())
        .filter(Boolean);
    }
    // Si no detecta, intenta por imagen (negro por defecto)
    if (!colores.length) colores = ['negro'];
    prod.setAttribute('data-colores', colores.join(','));
  });

  // Construir opciones únicas
  const setCategorias = new Set();
  const setColecciones = new Set();
  const setTallas = new Set();
  const setColores = new Set();

  productos.forEach(prod => {
    setCategorias.add(normaliza(prod.dataset.categoria));
    setColecciones.add(prod.dataset.coleccion);
    (prod.dataset.tallas || '').split(',').filter(Boolean).forEach(t => setTallas.add(t.toUpperCase()));
    (prod.dataset.colores || '').split(',').filter(Boolean).forEach(c => setColores.add(normaliza(c)));
  });

  const crearChip = (name, value) => {
    const id = `${name}-${value}`.replace(/\s+/g,'-').toLowerCase();
    const label = document.createElement('label');
    label.className = 'filter-chip';
    label.setAttribute('for', id);
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.name = name;
    input.value = value;
    label.appendChild(input);
    label.appendChild(document.createTextNode(' ' + value));
    return label;
  };

  // Poblar contenedores (inicial)
  function renderOpciones({ cats, cols, tllas, colsColores }, keepChecked = true) {
    const render = (cont, name, valores) => {
      const checked = new Set(Array.from(cont.querySelectorAll('input[name="'+name+'"]:checked')).map(i=>i.value.toLowerCase()));
      cont.innerHTML = '';
      valores.forEach(v => {
        const chip = crearChip(name, v);
        if (keepChecked && checked.has(v.toLowerCase())) chip.querySelector('input').checked = true;
        cont.appendChild(chip);
      });
    };
    render(contCategoria, 'categoria', Array.from(cats).sort());
    render(contColeccion, 'coleccion', Array.from(cols).sort());
    render(contTalla, 'talla', Array.from(tllas).sort());
    render(contColor, 'color', Array.from(colsColores).sort());
  }
  renderOpciones({ cats: setCategorias, cols: setColecciones, tllas: setTallas, colsColores: setColores });

  // Estado de filtros
  const filtros = { categoria: new Set(), coleccion: new Set(), talla: new Set(), color: new Set() };

  function leerSeleccion() {
    ['categoria','coleccion','talla','color'].forEach(key => {
      filtros[key].clear();
      tienda.querySelectorAll(`input[name="${key}"]:checked`).forEach(chk => filtros[key].add(normaliza(chk.value)));
    });
  }

  function coincide(prod) {
    const by = (key, valGetter) => {
      if (!filtros[key].size) return true; // sin filtro en ese grupo
      const val = valGetter();
      if (Array.isArray(val)) {
        return Array.from(filtros[key]).every(v => val.includes(v));
      }
      return filtros[key].has(normaliza(val));
    };

    const okCategoria = by('categoria', () => normaliza(prod.dataset.categoria));
    const okColeccion = by('coleccion', () => prod.dataset.coleccion);
    const okTalla = by('talla', () => (prod.dataset.tallas || '').split(',').map(t=>t.trim().toUpperCase()));
    const okColor = by('color', () => (prod.dataset.colores || '').split(',').map(c=>normaliza(c)));

    return okCategoria && okColeccion && okTalla && okColor;
  }

  function opcionesDisponibles() {
    // Calcula opciones válidas restantes dado el estado actual de filtros (parciales)
    const cats = new Set();
    const cols = new Set();
    const tllas = new Set();
    const colsColores = new Set();

    productos.forEach(prod => {
      if (!coincide(prod)) return;
      cats.add(prod.dataset.categoria.toLowerCase());
      cols.add(prod.dataset.coleccion);
      (prod.dataset.tallas || '').split(',').filter(Boolean).forEach(t => tllas.add(t.toUpperCase()));
      (prod.dataset.colores || '').split(',').filter(Boolean).map(c=>c.toLowerCase()).forEach(c => colsColores.add(c));
    });
    return { cats, cols, tllas, colsColores };
  }

  function rebindCheckboxChange() {
    tienda.querySelectorAll('#filtersPanel input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', () => {
        aplicarFiltros(false);
      }, { once: true });
    });
  }

  function aplicarFiltros(closePanel = true) {
    leerSeleccion();
    let visibles = 0;
    productos.forEach(prod => {
      const show = coincide(prod);
      prod.style.display = show ? '' : 'none';
      if (show) visibles++;
    });
    if (noResultados) noResultados.classList.toggle('hidden', visibles !== 0);

    // Ocultar/mostrar secciones (contenedor .productos) y su h3 previo según resultados
    const secciones = tienda.querySelectorAll('.catalogo-titulo + .productos');
    secciones.forEach(sec => {
      const cards = Array.from(sec.querySelectorAll('.card.producto'));
      const visiblesSec = cards.filter(c => c.style.display !== 'none');
      const hayVisibles = visiblesSec.length > 0;
      const titulo = sec.previousElementSibling && sec.previousElementSibling.matches('.catalogo-titulo') ? sec.previousElementSibling : null;
      sec.style.display = hayVisibles ? '' : 'none';
      if (titulo) titulo.style.display = hayVisibles ? '' : 'none';
    });

    // Recalcular opciones disponibles y re-render de checkboxes conservando los seleccionados
    const disp = opcionesDisponibles();
    renderOpciones(disp, true);
    // Volver a enlazar eventos change a los inputs nuevos
    rebindCheckboxChange();

    if (closePanel) cerrarPanel();
  }

  function limpiarFiltrosUI() {
    tienda.querySelectorAll('#filtersPanel input[type="checkbox"]').forEach(chk => chk.checked = false);
  }

  function abrirPanel() {
    if (!panel || !overlay) return;
    panel.classList.add('open');
    panel.classList.remove('hidden');
    overlay.classList.remove('hidden');
    panel.setAttribute('aria-hidden','false');
    overlay.setAttribute('aria-hidden','false');
    btnOpen?.setAttribute('aria-expanded','true');
  }
  function cerrarPanel() {
    if (!panel || !overlay) return;
    panel.classList.remove('open');
    overlay.classList.add('hidden');
    panel.setAttribute('aria-hidden','true');
    overlay.setAttribute('aria-hidden','true');
    btnOpen?.setAttribute('aria-expanded','false');
  }

  // Bindings
  btnOpen?.addEventListener('click', (e)=>{ e.stopPropagation(); abrirPanel(); });
  btnClose?.addEventListener('click', cerrarPanel);
  overlay?.addEventListener('click', cerrarPanel);

  // Click fuera del panel (desktop)
  window.addEventListener('click', (e) => {
    if (!panel || panel.classList.contains('hidden')) return;
    const t = e.target;
    if (panel.contains(t) || (btnOpen && btnOpen.contains(t))) return;
    cerrarPanel();
  });

  btnApply?.addEventListener('click', () => { aplicarFiltros(true); });
  btnReset?.addEventListener('click', () => { limpiarFiltrosUI(); aplicarFiltros(false); });
  btnClear?.addEventListener('click', () => { limpiarFiltrosUI(); aplicarFiltros(false); });

  // Respuesta inmediata en desktop y recalculo de disponibilidad
  rebindCheckboxChange();

  // Aplicar inicialmente sin filtros
  aplicarFiltros(false);
})();
