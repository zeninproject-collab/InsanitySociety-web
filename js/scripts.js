// ----------------------------
// SELECCIÓN DE ELEMENTOS
// ----------------------------
const botonesAgregar = document.querySelectorAll(".agregar-carrito");
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
function agregarProducto(nombre, precio, talla = null, coleccion = null) {
  const key = `${nombre}__${talla ?? "SN"}`;
  const existente = carrito.find(item => item.key === key);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ key, nombre, precio, talla, coleccion, cantidad: 1 });
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
    const etiquetaTalla = item.talla ? ` <small>(Talla: ${item.talla})</small>` : "";
    li.innerHTML = `
      ${item.nombre}${etiquetaTalla} x${item.cantidad}
      <span>${formatearDinero(item.precio * item.cantidad)}</span>
      <button class="eliminar">X</button>
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
  if (!tallas.length) {
    // Si no hay tallas definidas, agregar directo al carrito
    const nombre = boton.dataset.nombre;
    const precio = parseFloat(boton.dataset.precio);
    const coleccion = boton.dataset.coleccion || null;
    agregarProducto(nombre, precio, null, coleccion);
    return;
  }

  // Ocultar botón y mostrar opciones
  boton.style.display = "none";
  const contenedor = document.createElement("div");
  contenedor.className = "tallas-menu";

  const label = document.createElement("p");
  label.textContent = "Elige tu talla:";
  contenedor.appendChild(label);

  tallas.forEach(talla => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "talla-opcion";
    chip.textContent = talla;
    chip.addEventListener("click", () => {
      // Al seleccionar talla, se quita el menú y reaparece botón
      contenedor.remove();
      boton.style.display = "inline-block";
      boton.textContent = "Agregar al carrito";
      agregarProducto(
        boton.dataset.nombre,
        parseFloat(boton.dataset.precio),
        talla,
        boton.dataset.coleccion || null
      );
    });
    contenedor.appendChild(chip);
  });

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
    };
    if (toggleCarritoMobile) toggleCarritoMobile.addEventListener("click", abrirCarritoMovil);
    if (mobileOpenCarrito) mobileOpenCarrito.addEventListener("click", abrirCarritoMovil);
  }
}

configurarCarritoPorDispositivo();

cerrarCarrito.addEventListener("click", () => {
  carritoFijado = false;
  carritoPanel.classList.remove("active", "hover-open");
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
if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', toggleMobileMenu);
if (mobileMenuLinks && mobileMenuLinks.length) {
  mobileMenuLinks.forEach(btn => btn.addEventListener('click', () => {
    // activar tab
    const tabId = btn.dataset.tab;
    if (tabId) {
      document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
      activarTabConAnimacion(tabId);
      // marcar activo el tab-link correspondiente en desktop
      const desktopBtn = document.querySelector(`.tab-link[data-tab="${tabId}"]`);
      if (desktopBtn) desktopBtn.classList.add('active');
    }
    cerrarMobileMenu();
  }));
}

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
  }, 250);
}

tabLinks.forEach(link => {
  link.addEventListener("click", () => {
    tabLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    activarTabConAnimacion(link.dataset.tab);
  });
});
