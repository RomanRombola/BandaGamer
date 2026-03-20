// main.js — Gor2Games V2
// Maneja autenticación, perfil en Firestore, ranking global y logros.

// ── Constantes ────────────────────────────────────────────────────────────
const NOMBRES_NIVEL = [
  "", "Novato Gor2", "Aficionado", "Gor2 Pro", "Maestro", "Gor2 Experto",
  "Leyenda Gamer", "Gamer Supremo", "Príncipe Gor2", "Rey Gor2", "Gor2 Supremo"
];

// Definición de logros
const LOGROS = [
  { id: "primer_juego",    icon: "🎮", nombre: "Primera Partida",    desc: "Jugaste tu primer juego",              condicion: u => u.juegos_jugados >= 1 },
  { id: "cinco_juegos",    icon: "🕹️", nombre: "En Calentamiento",   desc: "Jugaste 5 juegos distintos",           condicion: u => u.juegos_jugados >= 5 },
  { id: "veinte_juegos",   icon: "👾", nombre: "Gamer Dedicado",     desc: "Jugaste 20 partidas",                  condicion: u => u.juegos_jugados >= 20 },
  { id: "nivel_3",         icon: "⭐", nombre: "Gor2 Pro",           desc: "Llegaste al nivel 3",                  condicion: u => u.nivel >= 3 },
  { id: "nivel_5",         icon: "🔥", nombre: "Gor2 Experto",       desc: "Llegaste al nivel 5",                  condicion: u => u.nivel >= 5 },
  { id: "nivel_10",        icon: "💎", nombre: "Gor2 Supremo",       desc: "Alcanzaste el nivel máximo",           condicion: u => u.nivel >= 10 },
  { id: "mil_xp",          icon: "✨", nombre: "Mil Puntos",         desc: "Acumulaste 1000 XP",                   condicion: u => u.xp >= 1000 },
  { id: "cinco_mil_xp",    icon: "⚡", nombre: "Power Gamer",        desc: "Acumulaste 5000 XP",                   condicion: u => u.xp >= 5000 },
  { id: "cien_monedas",    icon: "🪙", nombre: "Ahorrista",          desc: "Tenés 100 Gor2 Coins",                 condicion: u => u.monedas >= 100 },
  { id: "primer_favorito", icon: "❤️", nombre: "Me Gusta",           desc: "Marcaste tu primer favorito",          condicion: u => u.favoritos.length >= 1 },
  { id: "cinco_favoritos", icon: "💝", nombre: "Coleccionista",      desc: "Tenés 5 juegos favoritos",             condicion: u => u.favoritos.length >= 5 },
  { id: "hora_jugada",     icon: "⏰", nombre: "Una Hora",           desc: "Jugaste 1 hora en total",              condicion: u => u.tiempo_jugado_total >= 3600 },
  { id: "diez_horas",      icon: "🏆", nombre: "Sin Vida Social",    desc: "Jugaste 10 horas en total",            condicion: u => u.tiempo_jugado_total >= 36000 },
];

// Sistema de accesorios para el avatar
// Cada accesorio tiene una categoría (sombrero, lentes, bigote, marco)
const ACCESORIOS = {
  sombreros: [
    { id: "s_none",    emoji: "",    nombre: "Sin sombrero", precio: 0,   reqNivel: 1 },
    { id: "s_gorra",   emoji: "🧢",  nombre: "Gorra",        precio: 50,  reqNivel: 1 },
    { id: "s_cowboy",  emoji: "🤠",  nombre: "Cowboy",       precio: 100, reqNivel: 2 },
    { id: "s_corona",  emoji: "👑",  nombre: "Corona",       precio: 300, reqNivel: 5 },
    { id: "s_casco",   emoji: "⛑️",  nombre: "Casco",        precio: 150, reqNivel: 3 },
    { id: "s_bruja",   emoji: "🎩",  nombre: "Galera",       precio: 200, reqNivel: 4 },
    { id: "s_santa",   emoji: "🎅",  nombre: "Navidad",      precio: 250, reqNivel: 4 },
    { id: "s_vikingo", emoji: "🪖",  nombre: "Vikingo",      precio: 400, reqNivel: 6 },
    { id: "s_mago",    emoji: "🔮",  nombre: "Mago",         precio: 500, reqNivel: 7 },
    { id: "s_rey",     emoji: "👸",  nombre: "Realeza",      precio: 800, reqNivel: 9 },
  ],
  lentes: [
    { id: "l_none",    emoji: "",    nombre: "Sin lentes",   precio: 0,   reqNivel: 1 },
    { id: "l_cool",    emoji: "😎",  nombre: "Oscuros",      precio: 50,  reqNivel: 1 },
    { id: "l_nerd",    emoji: "🤓",  nombre: "Nerd",         precio: 100, reqNivel: 2 },
    { id: "l_fuego",   emoji: "🥸",  nombre: "Disfraz",      precio: 150, reqNivel: 3 },
    { id: "l_laser",   emoji: "🔭",  nombre: "Telescopio",   precio: 250, reqNivel: 5 },
    { id: "l_vr",      emoji: "🥽",  nombre: "VR",           precio: 350, reqNivel: 6 },
  ],
  bigotes: [
    { id: "b_none",    emoji: "",    nombre: "Sin bigote",   precio: 0,   reqNivel: 1 },
    { id: "b_fino",    emoji: "👨",  nombre: "Fino",         precio: 50,  reqNivel: 1 },
    { id: "b_largo",   emoji: "🧔",  nombre: "Barba",        precio: 100, reqNivel: 2 },
    { id: "b_vikingo", emoji: "👴",  nombre: "Sabio",        precio: 150, reqNivel: 3 },
    { id: "b_pirata",  emoji: "🏴‍☠️", nombre: "Pirata",      precio: 200, reqNivel: 4 },
  ],
  marcos: [
    { id: "m_none",    color: "",              nombre: "Sin marco",   precio: 0,   reqNivel: 1 },
    { id: "m_naranja", color: "var(--pr)",     nombre: "Naranja",     precio: 50,  reqNivel: 1 },
    { id: "m_azul",    color: "var(--se)",     nombre: "Azul",        precio: 50,  reqNivel: 1 },
    { id: "m_verde",   color: "var(--ok)",     nombre: "Verde",       precio: 100, reqNivel: 2 },
    { id: "m_dorado",  color: "var(--ac)",     nombre: "Dorado",      precio: 200, reqNivel: 3 },
    { id: "m_rojo",    color: "var(--da)",     nombre: "Rojo",        precio: 150, reqNivel: 2 },
    { id: "m_galaxy",  color: "linear-gradient(135deg,#ff6600,#00aaff)", nombre: "Galaxy", precio: 500, reqNivel: 7 },
    { id: "m_gold",    color: "linear-gradient(135deg,#ffe600,#ff6600)", nombre: "Premium", precio: 800, reqNivel: 9 },
  ]
};

// Default de accesorios
const ACCESORIOS_DEFAULT = { sombrero: "s_none", lentes: "l_none", bigote: "b_none", marco: "m_none" };

// Componer el avatar con accesorios
function renderAvatar(base, accesorios={}, size=40){
  const acc = { ...ACCESORIOS_DEFAULT, ...accesorios };
  const sombrero = ACCESORIOS.sombreros.find(a=>a.id===acc.sombrero)?.emoji||"";
  const lentes   = ACCESORIOS.lentes.find(a=>a.id===acc.lentes)?.emoji||"";
  const bigote   = ACCESORIOS.bigotes.find(a=>a.id===acc.bigote)?.emoji||"";
  const marcoAcc = ACCESORIOS.marcos.find(a=>a.id===acc.marco);
  const marcoBorder = marcoAcc?.color ? `border:2px solid; border-image:none; outline:2px solid ${marcoAcc.color}; outline-offset:1px;` : "";
  return `<div style="position:relative;display:inline-block;width:${size}px;height:${size}px;${marcoBorder}border-radius:50%">
    <span style="font-size:${size*0.7}px;line-height:${size}px;display:block;text-align:center">${base||"😊"}</span>
    ${sombrero?`<span style="position:absolute;top:-${size*0.3}px;left:50%;transform:translateX(-50%);font-size:${size*0.45}px">${sombrero}</span>`:""}
    ${lentes?`<span style="position:absolute;top:${size*0.25}px;left:50%;transform:translateX(-50%);font-size:${size*0.3}px">${lentes}</span>`:""}
    ${bigote?`<span style="position:absolute;bottom:${size*0.1}px;left:50%;transform:translateX(-50%);font-size:${size*0.25}px">${bigote}</span>`:""}
  </div>`;
}

let categoriaActiva = "todos";
let terminoBusqueda = "";

// ── AUTENTICACIÓN ─────────────────────────────────────────────────────────

// Login con Google — abre popup
async function loginConGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await Storage.auth.signInWithPopup(provider);
  } catch (e) {
    if (e.code !== "auth/popup-closed-by-user") {
      mostrarToast("Error al iniciar sesión", "❌");
      console.error("[Auth]", e);
    }
  }
}

// Login como invitado — usa localStorage, sin Firebase Auth
function loginComoInvitado() {
  const input = document.getElementById("guest-name-input");
  const nombre = input ? input.value.trim() : "";
  if (!nombre || nombre.length < 2) {
    mostrarToast("Ingresá un nombre (mínimo 2 caracteres)", "⚠️");
    if (input) input.focus();
    return;
  }
  // Guardar como invitado en localStorage
  const u = { ...Storage.USUARIO_DEFAULT, nombre, uid: "", esInvitado: true };
  localStorage.setItem("gor2games_usuario_v2", JSON.stringify(u));
  // Ocultar pantalla de login y arrancar
  ocultarPantallaLogin();
  iniciarInterfaz(u);
  mostrarToast(`Bienvenido, ${nombre}!`, "👤");
}

// Cerrar sesión
async function cerrarSesion() {
  await Storage.auth.signOut();
  mostrarToast("Sesión cerrada", "👋");
}

// ── INICIO ────────────────────────────────────────────────────────────────

async function iniciarApp() {
  Storage.auth.onAuthStateChanged(async (user) => {
    if (user) {
      // Usuario con Google autenticado
      await Storage.migrarLocalAFirestore();
      const usuario = await Storage.getUsuario();
      ocultarPantallaLogin();
      iniciarInterfaz(usuario);
      verificarLogros();
    } else {
      // Sin Google — verificar si hay sesión de invitado activa en localStorage
      const raw = localStorage.getItem("gor2games_usuario_v2");
      if (raw) {
        try {
          const u = JSON.parse(raw);
          // Si tiene nombre y está marcado como invitado (o simplemente tiene nombre), entrar directo
          if (u && u.nombre && u.nombre.length >= 2) {
            ocultarPantallaLogin();
            iniciarInterfaz(u);
            return;
          }
        } catch(e) {}
      }
      // No hay sesión activa — mostrar login
      mostrarPantallaLogin();
    }
  });
}

function iniciarInterfaz(usuario) {
  actualizarPerfil();
  renderizarGrid(juegos);
  renderizarDestacados();
  renderizarSidebar();
  renderizarRecientes();
  renderizarMasJugados();
  configurarBuscador();
  configurarFiltrosCategorias();
  configurarNavMenu();
  mostrarSeccion("inicio");
}

// Renderiza la fila de juegos destacados (los marcados con badge HOT o los primeros 6 locales)
async function renderizarDestacados() {
  const contenedor = document.getElementById("destacados-grid");
  if (!contenedor) return;
  const destacados = juegos
    .filter(j => j.tipo === "local")
    .slice(0, 6);
  const cards = await Promise.all(destacados.map((j, i) => crearCardHTML(j, i)));
  contenedor.innerHTML = cards.join("");
  // Eventos de favoritos en destacados
  contenedor.querySelectorAll(".btn-favorito").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault(); e.stopPropagation();
      const ahora = await Storage.toggleFavorito(btn.dataset.id);
      btn.classList.toggle("activo", ahora);
      btn.textContent = ahora ? "♥" : "♡";
    });
  });
}

// ── PANTALLA DE LOGIN ─────────────────────────────────────────────────────

function mostrarPantallaLogin() {
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("app-body-wrap").style.display = "none";
  document.querySelector("header").style.display = "none";
}

function ocultarPantallaLogin() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("app-body-wrap").style.display = "block";
  document.querySelector("header").style.display = "flex";
}

// ── PERFIL EN HEADER ──────────────────────────────────────────────────────

async function actualizarPerfil() {
  const u     = await Storage.getUsuario();
  const xpAct = u.xp % 1000;
  const pct   = (xpAct / 1000) * 100;
  const el    = (id) => document.getElementById(id);

  if (el("perfil-nombre"))      el("perfil-nombre").textContent      = u.nombre || "—";
  if (el("perfil-nivel"))       el("perfil-nivel").textContent       = `Nv.${u.nivel}`;
  if (el("perfil-monedas"))     el("perfil-monedas").textContent     = u.monedas.toLocaleString();
  if (el("perfil-avatar"))      el("perfil-avatar").textContent      = u.avatar || "😊";
  if (el("xp-bar-fill"))        el("xp-bar-fill").style.width        = pct + "%";
  if (el("xp-texto"))           el("xp-texto").textContent           = `${xpAct}/1000 XP`;
  if (el("perfil-nivel-texto")) el("perfil-nivel-texto").textContent = NOMBRES_NIVEL[u.nivel] || "";
}

// ── GRID DE JUEGOS ────────────────────────────────────────────────────────

async function renderizarGrid(lista) {
  const grid = document.getElementById("games-grid");
  if (!grid) return;

  if (!lista.length) {
    grid.innerHTML = `<div class="sin-resultados"><span class="sin-icon">🔍</span><p>No encontramos juegos para "<strong>${terminoBusqueda}</strong>". Probá con otra palabra.</p></div>`;
    return;
  }

  const cards = await Promise.all(lista.map((j, i) => crearCardHTML(j, i)));
  grid.innerHTML = cards.join("");
  grid.querySelectorAll(".game-card").forEach((card, i) => {
    card.style.animationDelay = `${i * 0.04}s`;
  });
  grid.querySelectorAll(".btn-favorito").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault(); e.stopPropagation();
      const ahora = await Storage.toggleFavorito(btn.dataset.id);
      btn.classList.toggle("activo", ahora);
      btn.textContent = ahora ? "♥" : "♡";
    });
  });
}

async function crearCardHTML(juego, indice) {
  const esFav  = await Storage.esFavorito(juego.id);
  const visitas = await Storage.getContadorVisitas(juego.id);
  const tieneThumb = juego.thumbnail && juego.thumbnail.length > 0;
  const badgeTipo = { iframe:"", local:'<span class="badge badge-local">LOCAL</span>', emulador:'<span class="badge badge-emulador">RETRO</span>' }[juego.tipo] || "";

  return `
    <a class="game-card" href="pages/juego.html?id=${juego.id}" style="animation-delay:${indice*0.04}s">
      <div class="card-thumb">
        ${tieneThumb ? `<img src="${juego.thumbnail}" alt="${juego.nombre}" loading="lazy" onerror="this.style.display='none';this.parentNode.querySelector('.thumb-fallback').style.display='flex'">` : ""}
        <div class="thumb-fallback" style="display:${tieneThumb?'none':'flex'}">
          <span class="thumb-fallback-icon">🎮</span>
          <span class="thumb-fallback-nombre">${juego.nombre}</span>
        </div>
        <button class="btn-favorito ${esFav?'activo':''}" data-id="${juego.id}" title="${esFav?'Quitar de favoritos':'Agregar a favoritos'}">${esFav?'♥':'♡'}</button>
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

async function filtrarPorCategoria(categoria) {
  categoriaActiva = categoria;
  terminoBusqueda = "";
  const buscador = document.getElementById("buscador");
  if (buscador) buscador.value = "";

  const lista = categoria === "todos" ? juegos : juegos.filter(j => j.categoria === categoria);
  const grid = document.getElementById("games-grid");
  if (!grid) return;
  grid.style.opacity = "0"; grid.style.transform = "translateY(8px)";
  setTimeout(async () => {
    await renderizarGrid(lista);
    grid.style.transition = "opacity 0.25s ease, transform 0.25s ease";
    grid.style.opacity = "1"; grid.style.transform = "translateY(0)";
  }, 150);

  document.querySelectorAll("[data-categoria]").forEach(btn => {
    btn.classList.toggle("activo", btn.dataset.categoria === categoria);
  });
  // Actualizar título del catálogo
  const titulo = document.getElementById("catalogo-titulo");
  if (titulo) titulo.textContent = categoria === "todos" ? "Todos los Juegos" : `Juegos: ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`;
}

async function filtrarPorBusqueda(termino) {
  terminoBusqueda = termino;
  await renderizarGrid(buscar(termino));
  const titulo = document.getElementById("catalogo-titulo");
  if (titulo) titulo.textContent = termino ? `Resultados: "${termino}"` : "Todos los Juegos";
}

function buscar(termino) {
  const t = termino.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!t) return juegos;
  return juegos.filter(j => {
    const nombre = j.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return nombre.includes(t) || j.categoria.includes(t) || j.tags.some(tag => tag.includes(t));
  });
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────

function renderizarSidebar() {
  const cats = [
    { id:"todos",        label:"🕹 Todos" },
    { id:"accion",       label:"⚔️ Acción" },
    { id:"puzzle",       label:"🧩 Puzzle" },
    { id:"arcade",       label:"👾 Arcade" },
    { id:"multijugador", label:"🌐 Multi" },
    { id:"carreras",     label:"🏎️ Carreras" },
    { id:"estrategia",   label:"♟️ Estrategia" },
    { id:"aventura",     label:"🗺️ Aventura" },
    { id:"deportes",     label:"⚽ Deportes" },
    { id:"retro",        label:"📺 Retro" },
  ];
  const sidebar = document.getElementById("sidebar-categorias");
  if (!sidebar) return;
  sidebar.innerHTML = cats.map(c => `
    <button class="sidebar-cat ${c.id===categoriaActiva?'activo':''}" data-categoria="${c.id}">${c.label}</button>
  `).join("");
  sidebar.querySelectorAll(".sidebar-cat").forEach(btn => {
    btn.addEventListener("click", () => filtrarPorCategoria(btn.dataset.categoria));
  });
}

async function renderizarMasJugados() {
  const contenedor = document.getElementById("mas-jugados");
  if (!contenedor) return;
  const ids = await Storage.getMasJugados(5);
  if (!ids.length) { contenedor.innerHTML = "<p class='muted-text'>Jugá para ver aquí tus más visitados.</p>"; return; }
  const lista = ids.map(id => juegos.find(j => j.id === id)).filter(Boolean);
  contenedor.innerHTML = lista.map(j => `
    <a href="pages/juego.html?id=${j.id}" class="mini-juego-link">
      <span class="mini-juego-icon">🎮</span>
      <span class="mini-juego-nombre">${j.nombre}</span>
    </a>`).join("");
}

async function renderizarRecientes() {
  const contenedor = document.getElementById("recientes-grid");
  const bloque = document.getElementById("bloque-recientes");
  if (!contenedor) return;
  const ids = await Storage.getHistorial(5);
  if (!ids.length) {
    if (bloque) bloque.style.display = "none";
    return;
  }
  if (bloque) bloque.style.display = "block";
  const lista = ids.map(id => juegos.find(j => j.id === id)).filter(Boolean);
  const cards = await Promise.all(lista.map((j, i) => crearCardHTML(j, i)));
  contenedor.innerHTML = cards.join("");
  contenedor.querySelectorAll(".btn-favorito").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault(); e.stopPropagation();
      const ahora = await Storage.toggleFavorito(btn.dataset.id);
      btn.classList.toggle("activo", ahora);
      btn.textContent = ahora ? "♥" : "♡";
    });
  });
}

// ── BUSCADOR ──────────────────────────────────────────────────────────────

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

function configurarNavMenu() {
  document.querySelectorAll("[data-seccion]").forEach(btn => {
    btn.addEventListener("click", () => mostrarSeccion(btn.dataset.seccion));
  });
  const hamburger = document.getElementById("hamburger");
  const navMenu   = document.getElementById("nav-menu");
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("abierto");
      hamburger.textContent = navMenu.classList.contains("abierto") ? "✕" : "☰";
    });
  }
}

function configurarFiltrosCategorias() {
  const strip = document.getElementById("cat-strip");
  if (!strip) return;
  strip.querySelectorAll("[data-categoria]").forEach(btn => {
    btn.addEventListener("click", () => filtrarPorCategoria(btn.dataset.categoria));
  });
}

function mostrarSeccion(seccion) {
  document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
  const target = document.getElementById(`seccion-${seccion}`);
  if (target) target.classList.add("activa");
  document.querySelectorAll("[data-seccion]").forEach(b => {
    b.classList.toggle("activo", b.dataset.seccion === seccion);
  });
  if (seccion === "favoritos") renderizarFavoritos();
  if (seccion === "ranking")   renderizarRankingGlobal();
  if (seccion === "perfil")    renderizarPerfil();
  if (seccion === "logros")    renderizarLogros();
  if (seccion === "tienda")    renderizarTienda();
}

async function renderizarFavoritos() {
  const u = await Storage.getUsuario();
  const contenedor = document.getElementById("favoritos-grid");
  if (!contenedor) return;
  if (!u.favoritos.length) {
    contenedor.innerHTML = "<p class='muted-text sin-favs'>No tenés favoritos todavía. Hacé clic en ♡ en cualquier juego.</p>";
    return;
  }
  const lista = u.favoritos.map(id => juegos.find(j => j.id === id)).filter(Boolean);
  const cards = await Promise.all(lista.map((j, i) => crearCardHTML(j, i)));
  contenedor.innerHTML = cards.join("");
}

// ── RANKING GLOBAL ────────────────────────────────────────────────────────

async function renderizarRankingGlobal() {
  const contenedor = document.getElementById("ranking-lista");
  if (!contenedor) return;
  contenedor.innerHTML = `<div class="ranking-loading">Cargando ranking<span class="loading-dots"></span></div>`;

  const lista = await Storage.getRankingGlobal(50);
  const miUid = Storage.auth.currentUser?.uid;

  if (!lista.length) {
    contenedor.innerHTML = `<div class="ranking-vacio">Todavía no hay jugadores en el ranking. ¡Sé el primero!</div>`;
    return;
  }

  contenedor.innerHTML = lista.map((p, i) => {
    const medal = ["🥇","🥈","🥉"][i] || `${i+1}`;
    const esSoy = p.uid === miUid;
    const nivelNombre = NOMBRES_NIVEL[p.nivel] || "";
    return `
      <div class="ranking-fila ${esSoy ? "ranking-yo" : ""}">
        <div class="ranking-pos">${medal}</div>
        <div class="ranking-avatar">${p.avatar || "😊"}</div>
        <div class="ranking-info">
          <div class="ranking-nombre">${p.nombre}${esSoy ? ' <span class="ranking-tu-tag">vos</span>' : ""}</div>
          <div class="ranking-nivel-txt">${nivelNombre}</div>
        </div>
        <div class="ranking-xp">${(p.xp || 0).toLocaleString()} XP</div>
        <div class="ranking-nivel-badge">Nv.${p.nivel || 1}</div>
      </div>`;
  }).join("");
}

// ── PERFIL ────────────────────────────────────────────────────────────────

async function renderizarPerfil() {
  const u = await Storage.getUsuario();
  const contenedor = document.getElementById("perfil-contenido");
  if (!contenedor) return;

  const xpAct = u.xp % 1000;
  const pct   = (xpAct / 1000) * 100;
  const tiempoH = Math.floor((u.tiempo_jugado_total || 0) / 3600);
  const tiempoM = Math.floor(((u.tiempo_jugado_total || 0) % 3600) / 60);
  const logrosCount = u.logros.length;

  const esInvitado = u.esInvitado || !u.uid;

  contenedor.innerHTML = `
    <div class="perfil-card">
      <div class="perfil-avatar-grande" title="Cambiar foto" onclick="document.getElementById('foto-input').click()" style="cursor:pointer;position:relative">
        ${u.fotoPerfil
          ? `<img src="${u.fotoPerfil}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,102,0,0.4)">`
          : `<span style="font-size:64px">${u.avatar||"😊"}</span>`}
        <div style="position:absolute;bottom:0;right:0;background:rgba(255,102,0,0.8);border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:14px">📷</div>
      </div>
      <input type="file" id="foto-input" accept="image/*" style="display:none" onchange="cambiarFotoPerfil(this)">
      <div class="perfil-datos">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <div class="perfil-nombre-grande" id="perfil-nombre-display">${u.nombre}</div>
          <button onclick="editarNombre()" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:var(--color-muted);font-size:10px;padding:4px 8px;border-radius:6px;cursor:pointer;font-family:'Orbitron',sans-serif;font-weight:700;letter-spacing:1px">✏️</button>
        </div>
        <div id="nombre-edit-form" style="display:none;margin-bottom:8px">
          <div style="display:flex;gap:6px">
            <input type="text" id="nombre-nuevo-input" value="${u.nombre}" maxlength="20"
              style="flex:1;background:rgba(255,255,255,0.07);border:1px solid rgba(255,102,0,0.3);color:var(--color-text);font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;padding:7px 11px;border-radius:8px;outline:none;">
            <button onclick="guardarNombre()" style="background:linear-gradient(135deg,#ff6600,#ff9500);border:none;color:#fff;font-family:'Orbitron',sans-serif;font-size:10px;font-weight:700;padding:7px 12px;border-radius:8px;cursor:pointer;letter-spacing:1px;white-space:nowrap">✓ OK</button>
          </div>
        </div>
        <div class="perfil-rango">${NOMBRES_NIVEL[u.nivel]}</div>
        ${esInvitado ? `<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:7px 12px;font-size:12px;color:var(--color-muted);margin-top:8px">👤 Modo invitado — <button onclick="loginConGoogle()" style="background:none;border:none;color:#00aaff;cursor:pointer;font-size:12px;font-weight:700;padding:0">Conectá con Google</button> para guardar tu progreso</div>` : ""}
        <div class="perfil-xp-barra-wrap" style="margin-top:10px">
          <div class="perfil-xp-barra"><div class="perfil-xp-fill" style="width:${pct}%"></div></div>
          <span class="perfil-xp-num">${xpAct} / 1000 XP</span>
        </div>
      </div>
    </div>
    <div class="perfil-stats-grid">
      <div class="pstat-card">
        <span class="pstat-icon">⭐</span>
        <span class="pstat-val">${(u.xp || 0).toLocaleString()}</span>
        <span class="pstat-lbl">XP Total</span>
      </div>
      <div class="pstat-card">
        <span class="pstat-icon">🪙</span>
        <span class="pstat-val">${(u.monedas || 0).toLocaleString()}</span>
        <span class="pstat-lbl">Monedas</span>
      </div>
      <div class="pstat-card">
        <span class="pstat-icon">🎮</span>
        <span class="pstat-val">${u.juegos_jugados || 0}</span>
        <span class="pstat-lbl">Partidas</span>
      </div>
      <div class="pstat-card">
        <span class="pstat-icon">⏰</span>
        <span class="pstat-val">${tiempoH}h ${tiempoM}m</span>
        <span class="pstat-lbl">Tiempo jugado</span>
      </div>
      <div class="pstat-card">
        <span class="pstat-icon">❤️</span>
        <span class="pstat-val">${u.favoritos.length}</span>
        <span class="pstat-lbl">Favoritos</span>
      </div>
      <div class="pstat-card">
        <span class="pstat-icon">🏆</span>
        <span class="pstat-val">${logrosCount}/${LOGROS.length}</span>
        <span class="pstat-lbl">Logros</span>
      </div>
    </div>
    <button class="btn-cerrar-sesion" onclick="cerrarSesion()">🚪 CERRAR SESIÓN</button>
  `;
}

// ── LOGROS ────────────────────────────────────────────────────────────────

async function renderizarLogros() {
  const u = await Storage.getUsuario();
  const contenedor = document.getElementById("logros-grid");
  if (!contenedor) return;

  contenedor.innerHTML = LOGROS.map(l => {
    const tiene = u.logros.includes(l.id);
    return `
      <div class="logro-card ${tiene ? "logro-desbloqueado" : "logro-bloqueado"}">
        <div class="logro-icon">${l.icon}</div>
        <div class="logro-info">
          <div class="logro-nombre">${l.nombre}</div>
          <div class="logro-desc">${l.desc}</div>
        </div>
        ${tiene ? '<div class="logro-check">✓</div>' : '<div class="logro-lock">🔒</div>'}
      </div>`;
  }).join("");
}

// Verifica y desbloquea logros automáticamente en segundo plano
async function verificarLogros() {
  const u = await Storage.getUsuario();
  let alguno = false;
  for (const logro of LOGROS) {
    if (!u.logros.includes(logro.id) && logro.condicion(u)) {
      const nuevo = await Storage.desbloquearLogro(logro.id);
      if (nuevo) {
        mostrarToast(`🏆 Logro: ${logro.nombre}`, "✨");
        alguno = true;
        await new Promise(r => setTimeout(r, 1500)); // mostrar uno a la vez
      }
    }
  }
}

// ── TIENDA DE AVATARES ────────────────────────────────────────────────────

async function renderizarTienda() {
  const u = await Storage.getUsuario();
  const contenedor = document.getElementById("tienda-grid");
  if (!contenedor) return;
  const comprados = u.accesorios_comprados || [];
  const equipados = { ...ACCESORIOS_DEFAULT, ...(u.accesorios || {}) };
  const monEl = document.getElementById("tienda-monedas");
  if (monEl) monEl.textContent = u.monedas.toLocaleString();

  const cats = [
    { key: "sombrero", plural: "sombreros", label: "🎩 Sombreros" },
    { key: "lentes",   plural: "lentes",    label: "😎 Lentes" },
    { key: "bigote",   plural: "bigotes",   label: "🧔 Bigotes" },
    { key: "marco",    plural: "marcos",    label: "🖼️ Marcos" },
  ];

  contenedor.innerHTML = cats.map(cat => {
    const items = ACCESORIOS[cat.plural];
    const equipadoId = equipados[cat.key] || items[0].id;
    const html = items.map(item => {
      const poseido  = item.precio === 0 || comprados.includes(item.id);
      const equipado = equipadoId === item.id;
      const bloq     = u.nivel < item.reqNivel;
      const puede    = !bloq && u.monedas >= item.precio;
      let accion = "";
      if (equipado)     accion = `<button class="av-btn av-btn-equipado" disabled>✓</button>`;
      else if (poseido) accion = `<button class="av-btn av-btn-equipar" onclick="equiparAccesorio('${cat.key}','${item.id}')">Equipar</button>`;
      else if (bloq)    accion = `<button class="av-btn av-btn-bloqueado" disabled>Nv.${item.reqNivel}</button>`;
      else              accion = `<button class="av-btn av-btn-comprar ${puede?'':'av-sin-fondos'}" onclick="comprarAccesorio('${item.id}','${cat.key}',${item.precio})" ${puede?'':'disabled'}>🪙 ${item.precio}</button>`;
      const preview = cat.key === "marco"
        ? `<div style="width:36px;height:36px;border-radius:50%;${item.color?'outline:2px solid '+item.color+';outline-offset:1px':'border:1px solid rgba(255,255,255,0.1)'};display:flex;align-items:center;justify-content:center;font-size:20px">😊</div>`
        : `<div style="font-size:28px;line-height:1.3">${item.emoji||"—"}</div>`;
      return `<div class="tienda-card ${equipado?'tienda-card-equipado':''} ${bloq?'tienda-card-bloqueado':''}">
        ${preview}<div class="tienda-avatar-nombre">${item.nombre}</div>${accion}</div>`;
    }).join("");
    return `<div style="width:100%;margin-bottom:18px">
      <div style="font-family:'Orbitron',sans-serif;font-size:11px;font-weight:700;color:var(--color-muted);letter-spacing:2px;margin-bottom:10px;padding-left:2px">${cat.label}</div>
      <div class="tienda-grid">${html}</div></div>`;
  }).join("");
}

async function comprarAccesorio(id, catKey, precio) {
  const u = await Storage.getUsuario();
  if (u.monedas < precio) { mostrarToast("No tenés suficientes monedas","❌"); return; }
  u.monedas -= precio;
  u.accesorios_comprados = u.accesorios_comprados || [];
  if (!u.accesorios_comprados.includes(id)) u.accesorios_comprados.push(id);
  u.accesorios = { ...ACCESORIOS_DEFAULT, ...(u.accesorios||{}), [catKey]: id };
  await Storage.setUsuario(u);
  await actualizarPerfil();
  await renderizarTienda();
  mostrarToast("Accesorio comprado y equipado","🎉");
}

async function equiparAccesorio(catKey, id) {
  const u = await Storage.getUsuario();
  u.accesorios = { ...ACCESORIOS_DEFAULT, ...(u.accesorios||{}), [catKey]: id };
  await Storage.setUsuario(u);
  await actualizarPerfil();
  await renderizarTienda();
  mostrarToast("Accesorio equipado","✅");
}

async function comprarAvatar(avId, emoji, precio) { await comprarAccesorio(avId,"sombrero",precio); }
async function equiparAvatar(emoji) { mostrarToast("Usá la tienda de accesorios","ℹ️"); }

// Editar nombre en el perfil
function editarNombre() {
  const form = document.getElementById("nombre-edit-form");
  const btn  = document.getElementById("nombre-nuevo-input");
  if(form) { form.style.display = form.style.display === "none" ? "block" : "none"; }
  if(btn) btn.focus();
}

async function guardarNombre() {
  const input = document.getElementById("nombre-nuevo-input");
  const nombre = input ? input.value.trim() : "";
  if (!nombre || nombre.length < 2) { mostrarToast("Nombre muy corto","⚠️"); return; }
  const u = await Storage.getUsuario();
  u.nombre = nombre;
  await Storage.setUsuario(u);
  await actualizarPerfil();
  await renderizarPerfil();
  mostrarToast("Nombre actualizado","✅");
}

// Cambiar foto de perfil — guarda como base64 reducida
async function cambiarFotoPerfil(input) {
  const file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { mostrarToast("Seleccioná una imagen","⚠️"); return; }

  const reader = new FileReader();
  reader.onload = async (e) => {
    // Redimensionar a 200x200 para no ocupar mucho espacio
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 200; canvas.height = 200;
      const ctx2 = canvas.getContext("2d");
      // Crop centrado
      const size = Math.min(img.width, img.height);
      const ox = (img.width - size) / 2;
      const oy = (img.height - size) / 2;
      ctx2.drawImage(img, ox, oy, size, size, 0, 0, 200, 200);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      const u = await Storage.getUsuario();
      u.fotoPerfil = dataUrl;
      await Storage.setUsuario(u);
      await actualizarPerfil();
      await renderizarPerfil();
      mostrarToast("Foto actualizada","📷");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}



// ── OVERLAY DE NIVEL ──────────────────────────────────────────────────────

function mostrarOverlayNivel(nombreNivel) {
  const overlay = document.getElementById("overlay-nivel");
  if (!overlay) return;
  overlay.querySelector(".overlay-nivel-nombre").textContent = nombreNivel;
  const particulas = overlay.querySelector(".particulas");
  particulas.innerHTML = "";
  for (let i = 0; i < 30; i++) {
    const p = document.createElement("span");
    p.className = "particula";
    p.style.setProperty("--x",     `${Math.random()*100}%`);
    p.style.setProperty("--delay", `${Math.random()*1}s`);
    p.style.setProperty("--dur",   `${0.8+Math.random()*0.8}s`);
    p.style.setProperty("--color", ["#ff6600","#ffe600","#00aaff","#ff0055"][Math.floor(Math.random()*4)]);
    particulas.appendChild(p);
  }
  overlay.classList.add("visible");
  // Verificar logros después de subir de nivel
  setTimeout(() => { overlay.classList.remove("visible"); verificarLogros(); }, 3000);
}

// ── TOAST ─────────────────────────────────────────────────────────────────

function mostrarToast(mensaje, icon = "ℹ️") {
  const container = document.getElementById("toast-container") || crearToastContainer();
  const toast = document.createElement("div");
  toast.className = "toast-notif";
  toast.innerHTML = `<span>${icon}</span><span>${mensaje}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function crearToastContainer() {
  const c = document.createElement("div");
  c.id = "toast-container";
  c.style.cssText = "position:fixed;top:70px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none";
  document.body.appendChild(c);
  return c;
}

// ── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", iniciarApp);
