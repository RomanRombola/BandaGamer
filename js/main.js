// main.js — Lógica principal de Gor2Games (index.html)
// Importa Storage (storage.js) y juegos (games-data.js) vía <script> en HTML.

// Nombres de los niveles en orden
const NOMBRES_NIVEL = [
  "", // índice 0 vacío
  "Novato Gor2",
  "Aficionado",
  "Gor2 Pro",
  "Maestro",
  "Gor2 Experto",
  "Leyenda Gamer",
  "Gamer Supremo",
  "Príncipe Gor2",
  "Rey Gor2",
  "Gor2 Supremo"
];

let categoriaActiva = "todos";
let terminoBusqueda = "";
let errorLocalStorage = false;

// ── INICIO ────────────────────────────────────────────────────────────────

// Punto de entrada principal de la app
function iniciarApp() {
  verificarLocalStorage();
  const usuario = Storage.getUsuario();

  if (!usuario.nombre || usuario.nombre.length < 2) {
    mostrarModalBienvenida();
  } else {
    iniciarInterfaz(usuario);
  }

  document.getElementById("btn-reset")?.addEventListener("click", () => {
    Storage.resetUsuario();
    location.reload();
  });
}

// Verifica si localStorage funciona; muestra banner si no
function verificarLocalStorage() {
  try {
    localStorage.setItem("__test__", "1");
    localStorage.removeItem("__test__");
  } catch (e) {
    errorLocalStorage = true;
    mostrarBannerError("localStorage no disponible. El progreso no se guardará.");
  }
}

// Inicializa la interfaz principal después de tener un usuario válido
function iniciarInterfaz(usuario) {
  actualizarPerfil();
  renderizarGrid(juegos);
  renderizarSidebar();
  renderizarRecientes();
  renderizarMasJugados();
  configurarBuscador();
  configurarFiltrosCategorias();
  configurarNavMenu();
  mostrarSeccion("inicio");
}

// ── MODAL DE BIENVENIDA ────────────────────────────────────────────────────

// Muestra el modal bloqueante de primera visita
function mostrarModalBienvenida() {
  const modal = document.getElementById("modal-bienvenida");
  modal.style.display = "flex";

  document.getElementById("btn-comenzar").addEventListener("click", () => {
    const input = document.getElementById("input-nombre");
    const nombre = input.value.trim();
    if (nombre.length < 2 || nombre.length > 20) {
      input.classList.add("error");
      document.getElementById("error-nombre").style.display = "block";
      return;
    }
    input.classList.remove("error");
    const u = Storage.getUsuario();
    u.nombre = nombre;
    Storage.setUsuario(u);
    modal.style.display = "none";
    iniciarInterfaz(u);
  });

  document.getElementById("input-nombre").addEventListener("input", (e) => {
    e.target.classList.remove("error");
    document.getElementById("error-nombre").style.display = "none";
  });

  document.getElementById("input-nombre").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("btn-comenzar").click();
  });
}

// ── PERFIL EN HEADER ──────────────────────────────────────────────────────

// Actualiza el mini perfil del header con datos actuales del usuario
function actualizarPerfil() {
  const u = Storage.getUsuario();
  const xpActual = u.xp % 1000;
  const pct = (xpActual / 1000) * 100;

  const elNombre = document.getElementById("perfil-nombre");
  const elNivel = document.getElementById("perfil-nivel");
  const elMonedas = document.getElementById("perfil-monedas");
  const elXpBar = document.getElementById("xp-bar-fill");
  const elXpText = document.getElementById("xp-texto");
  const elNivelTexto = document.getElementById("perfil-nivel-texto");

  if (elNombre) elNombre.textContent = u.nombre || "—";
  if (elNivel) elNivel.textContent = `Nv.${u.nivel}`;
  if (elMonedas) elMonedas.textContent = u.monedas.toLocaleString();
  if (elXpBar) elXpBar.style.width = pct + "%";
  if (elXpText) elXpText.textContent = `${xpActual}/1000 XP`;
  if (elNivelTexto) elNivelTexto.textContent = NOMBRES_NIVEL[u.nivel] || "";
}

// ── GRID DE JUEGOS ────────────────────────────────────────────────────────

// Renderiza el grid completo con los juegos recibidos
function renderizarGrid(lista) {
  const grid = document.getElementById("games-grid");
  if (!grid) return;

  if (lista.length === 0) {
    grid.innerHTML = `
      <div class="sin-resultados">
        <span class="sin-icon">🔍</span>
        <p>No encontramos juegos para "<strong>${terminoBusqueda}</strong>". Probá con otra palabra.</p>
      </div>`;
    return;
  }

  grid.innerHTML = lista.map((j, i) => crearCardHTML(j, i)).join("");
  // Animación escalonada de aparición
  grid.querySelectorAll(".game-card").forEach((card, i) => {
    card.style.animationDelay = `${i * 0.04}s`;
  });
  // Eventos de favoritos
  grid.querySelectorAll(".btn-favorito").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.dataset.id;
      const ahora = Storage.toggleFavorito(id);
      btn.classList.toggle("activo", ahora);
      btn.setAttribute("title", ahora ? "Quitar de favoritos" : "Agregar a favoritos");
      btn.textContent = ahora ? "♥" : "♡";
    });
  });
}

// Genera el HTML de una card de juego
function crearCardHTML(juego, indice) {
  const esFav = Storage.esFavorito(juego.id);
  const visitas = Storage.getContadorVisitas(juego.id);
  const tieneThumb = juego.thumbnail && juego.thumbnail.length > 0;

  const badgeTipo = {
    iframe: "",
    local: '<span class="badge badge-local">LOCAL</span>',
    emulador: '<span class="badge badge-emulador">RETRO</span>'
  }[juego.tipo] || "";

  return `
    <a class="game-card" href="pages/juego.html?id=${juego.id}" style="animation-delay:${indice * 0.04}s">
      <div class="card-thumb">
        ${tieneThumb
          ? `<img src="${juego.thumbnail}" alt="${juego.nombre}" loading="lazy"
               onerror="this.style.display='none';this.parentNode.querySelector('.thumb-fallback').style.display='flex'">`
          : ""}
        <div class="thumb-fallback" style="display:${tieneThumb ? 'none' : 'flex'}">
          <span class="thumb-fallback-icon">🎮</span>
          <span class="thumb-fallback-nombre">${juego.nombre}</span>
        </div>
        <button class="btn-favorito ${esFav ? 'activo' : ''}"
                data-id="${juego.id}"
                title="${esFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">${esFav ? '♥' : '♡'}</button>
        ${badgeTipo}
      </div>
      <div class="card-info">
        <span class="card-nombre">${juego.nombre}</span>
        <div class="card-meta">
          <span class="card-categoria">${juego.categoria}</span>
          ${visitas > 0 ? `<span class="card-visitas">▶ ${visitas}</span>` : ""}
        </div>
      </div>
    </a>`;
}

// ── FILTROS ───────────────────────────────────────────────────────────────

// Filtra el grid por categoría seleccionada
function filtrarPorCategoria(categoria) {
  categoriaActiva = categoria;
  terminoBusqueda = "";
  const buscador = document.getElementById("buscador");
  if (buscador) buscador.value = "";

  const lista = categoria === "todos"
    ? juegos
    : juegos.filter(j => j.categoria === categoria);

  // Animación de transición al cambiar categoría
  const grid = document.getElementById("games-grid");
  if (!grid) return;
  grid.style.opacity = "0";
  grid.style.transform = "translateY(8px)";
  setTimeout(() => {
    renderizarGrid(lista);
    grid.style.transition = "opacity 0.25s ease, transform 0.25s ease";
    grid.style.opacity = "1";
    grid.style.transform = "translateY(0)";
  }, 150);

  // Actualizar botones activos en sidebar y filtros mobile
  document.querySelectorAll("[data-categoria]").forEach(btn => {
    btn.classList.toggle("activo", btn.dataset.categoria === categoria);
  });

  mostrarSeccion("juegos");
}

// Filtra el grid en tiempo real según el término buscado
function filtrarPorBusqueda(termino) {
  terminoBusqueda = termino;
  const lista = buscar(termino);
  renderizarGrid(lista);
  mostrarSeccion("juegos");
}

// Búsqueda insensible a tildes y mayúsculas, con coincidencias parciales
function buscar(termino) {
  const t = termino.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!t) return juegos;
  return juegos.filter(j => {
    const nombre = j.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const cat = j.categoria;
    return nombre.includes(t) || cat.includes(t) || j.tags.some(tag => tag.includes(t));
  });
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────

// Renderiza las categorías y eventos del sidebar
function renderizarSidebar() {
  const cats = [
    { id: "todos",      label: "🕹 Todos" },
    { id: "accion",     label: "⚔️ Acción" },
    { id: "aventura",   label: "🗺️ Aventura" },
    { id: "puzzle",     label: "🧩 Puzzle" },
    { id: "deportes",   label: "⚽ Deportes" },
    { id: "carreras",   label: "🏎️ Carreras" },
    { id: "estrategia", label: "♟️ Estrategia" },
    { id: "arcade",     label: "👾 Arcade" },
    { id: "retro",      label: "📺 Retro" },
  ];

  const sidebar = document.getElementById("sidebar-categorias");
  if (!sidebar) return;
  sidebar.innerHTML = cats.map(c => `
    <button class="sidebar-cat ${c.id === categoriaActiva ? 'activo' : ''}"
            data-categoria="${c.id}">${c.label}</button>
  `).join("");

  sidebar.querySelectorAll(".sidebar-cat").forEach(btn => {
    btn.addEventListener("click", () => filtrarPorCategoria(btn.dataset.categoria));
  });
}

// Renderiza el panel "🔥 Más jugados"
function renderizarMasJugados() {
  const contenedor = document.getElementById("mas-jugados");
  if (!contenedor) return;
  const ids = Storage.getMasJugados(5);
  if (ids.length === 0) { contenedor.innerHTML = "<p class='muted-text'>Jugá para ver aquí tus más visitados.</p>"; return; }
  const lista = ids.map(id => juegos.find(j => j.id === id)).filter(Boolean);
  contenedor.innerHTML = lista.map(j => `
    <a href="pages/juego.html?id=${j.id}" class="mini-juego-link">
      <span class="mini-juego-icon">🎮</span>
      <span class="mini-juego-nombre">${j.nombre}</span>
    </a>`).join("");
}

// Renderiza la sección "🕹 Recientes"
function renderizarRecientes() {
  const contenedor = document.getElementById("recientes-grid");
  if (!contenedor) return;
  const ids = Storage.getHistorial(5);
  if (ids.length === 0) { contenedor.innerHTML = "<p class='muted-text'>Todavía no jugaste nada.</p>"; return; }
  const lista = ids.map(id => juegos.find(j => j.id === id)).filter(Boolean);
  contenedor.innerHTML = lista.map((j, i) => crearCardHTML(j, i)).join("");
}

// ── BUSCADOR ──────────────────────────────────────────────────────────────

// Configura el buscador con debounce
function configurarBuscador() {
  const input = document.getElementById("buscador");
  if (!input) return;
  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => filtrarPorBusqueda(input.value.trim()), 220);
  });
}

// ── NAVEGACIÓN ────────────────────────────────────────────────────────────

// Configura los botones del menú principal
function configurarNavMenu() {
  document.querySelectorAll("[data-seccion]").forEach(btn => {
    btn.addEventListener("click", () => mostrarSeccion(btn.dataset.seccion));
  });

  // Hamburguesa mobile
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("abierto");
      hamburger.textContent = navMenu.classList.contains("abierto") ? "✕" : "☰";
    });
  }
}

// Configura los filtros de categorías en el strip mobile
function configurarFiltrosCategorias() {
  const strip = document.getElementById("cat-strip");
  if (!strip) return;
  strip.querySelectorAll("[data-categoria]").forEach(btn => {
    btn.addEventListener("click", () => filtrarPorCategoria(btn.dataset.categoria));
  });
}

// Muestra una sección específica (inicio, juegos, favoritos)
function mostrarSeccion(seccion) {
  document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
  const target = document.getElementById(`seccion-${seccion}`);
  if (target) target.classList.add("activa");

  document.querySelectorAll("[data-seccion]").forEach(b => {
    b.classList.toggle("activo", b.dataset.seccion === seccion);
  });

  if (seccion === "favoritos") renderizarFavoritos();
}

// Renderiza la sección de favoritos
function renderizarFavoritos() {
  const u = Storage.getUsuario();
  const contenedor = document.getElementById("favoritos-grid");
  if (!contenedor) return;
  if (u.favoritos.length === 0) {
    contenedor.innerHTML = "<p class='muted-text sin-favs'>No tenés favoritos todavía. Hacé clic en ♡ en cualquier juego.</p>";
    return;
  }
  const lista = u.favoritos.map(id => juegos.find(j => j.id === id)).filter(Boolean);
  contenedor.innerHTML = lista.map((j, i) => crearCardHTML(j, i)).join("");
}

// ── OVERLAY DE NIVEL ──────────────────────────────────────────────────────

// Muestra el overlay de celebración al subir de nivel
function mostrarOverlayNivel(nombreNivel) {
  const overlay = document.getElementById("overlay-nivel");
  if (!overlay) return;

  overlay.querySelector(".overlay-nivel-nombre").textContent = nombreNivel;

  // Crear partículas CSS (máx 30)
  const particulas = overlay.querySelector(".particulas");
  particulas.innerHTML = "";
  for (let i = 0; i < 30; i++) {
    const p = document.createElement("span");
    p.className = "particula";
    p.style.setProperty("--x", `${Math.random() * 100}%`);
    p.style.setProperty("--delay", `${Math.random() * 1}s`);
    p.style.setProperty("--dur", `${0.8 + Math.random() * 0.8}s`);
    p.style.setProperty("--color", ["#ff6600","#ffe600","#00aaff","#ff0055"][Math.floor(Math.random()*4)]);
    particulas.appendChild(p);
  }

  overlay.classList.add("visible");
  setTimeout(() => overlay.classList.remove("visible"), 3000);
}

// ── BANNER DE ERROR ───────────────────────────────────────────────────────

// Muestra un banner de error con botón de resetear
function mostrarBannerError(mensaje) {
  const banner = document.getElementById("banner-error");
  if (!banner) return;
  banner.querySelector(".banner-msg").textContent = mensaje;
  banner.style.display = "flex";
}

// ── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", iniciarApp);
