// main.js — BandaGamer V2
// Maneja autenticación, perfil en Firestore, ranking global y logros.

// ── Helpers de seguridad ──────────────────────────────────────────────────
// Los nombres de usuario vienen de Firestore y los escribe cualquier usuario:
// hay que escaparlos SIEMPRE antes de meterlos en innerHTML (antes era XSS
// almacenado en el ranking, el perfil y los toasts).
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
// Solo se aceptan fotos como data:image o https (nunca javascript:, ni comillas que rompan el atributo)
function urlFotoSegura(u) {
  if (typeof u !== "string") return "";
  if (!/^(data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+\/=]+|https:\/\/[^\s"'<>]+)$/.test(u)) return "";
  return u;
}

// ── Constantes ────────────────────────────────────────────────────────────
const NOMBRES_NIVEL = [
  "", "Novato", "Jugador", "Veterano", "Experto", "Élite",
  "Leyenda", "Maestro", "Campeón", "Gran Maestro", "Supremo"
];

// Definición de logros
const LOGROS = [
  { id: "primer_juego",    icon: "🎮", nombre: "Primera Partida",    desc: "Jugaste tu primer juego",              condicion: u => u.juegos_jugados >= 1 },
  { id: "cinco_juegos",    icon: "🕹️", nombre: "En Calentamiento",   desc: "Jugaste 5 partidas",           condicion: u => u.juegos_jugados >= 5 },
  { id: "veinte_juegos",   icon: "👾", nombre: "Gamer Dedicado",     desc: "Jugaste 20 partidas",                  condicion: u => u.juegos_jugados >= 20 },
  { id: "nivel_3",         icon: "⭐", nombre: "Veterano",           desc: "Llegaste al nivel 3",                  condicion: u => u.nivel >= 3 },
  { id: "nivel_5",         icon: "🔥", nombre: "Élite",       desc: "Llegaste al nivel 5",                  condicion: u => u.nivel >= 5 },
  { id: "nivel_10",        icon: "💎", nombre: "Supremo",       desc: "Alcanzaste el nivel máximo",           condicion: u => u.nivel >= 10 },
  { id: "mil_xp",          icon: "✨", nombre: "Mil Puntos",         desc: "Acumulaste 1000 XP",                   condicion: u => u.xp >= 1000 },
  { id: "cinco_mil_xp",    icon: "⚡", nombre: "Power Gamer",        desc: "Acumulaste 5000 XP",                   condicion: u => u.xp >= 5000 },
  { id: "cien_monedas",    icon: "🪙", nombre: "Ahorrista",          desc: "Tenés 100 monedas",                 condicion: u => u.monedas >= 100 },
  { id: "primer_favorito", icon: "❤️", nombre: "Me Gusta",           desc: "Marcaste tu primer favorito",          condicion: u => u.favoritos.length >= 1 },
  { id: "cinco_favoritos", icon: "💝", nombre: "Coleccionista",      desc: "Tenés 5 juegos favoritos",             condicion: u => u.favoritos.length >= 5 },
  { id: "hora_jugada",     icon: "⏰", nombre: "Una Hora",           desc: "Jugaste 1 hora en total",              condicion: u => u.tiempo_jugado_total >= 3600 },
  { id: "diez_horas",      icon: "🏆", nombre: "Sin Vida Social",    desc: "Jugaste 10 horas en total",            condicion: u => u.tiempo_jugado_total >= 36000 },
];

// Sistema de accesorios para el avatar
// Cada accesorio tiene una categoría (sombrero, lentes, bigote, marco)
const ACCESORIOS = {
  sombreros: [
    { id: "s_none",    emoji: "",    nombre: "Sin sombrero",  precio: 0,    reqNivel: 1 },
    { id: "s_gorra",   emoji: "🧢",  nombre: "Gorra",         precio: 50,   reqNivel: 1 },
    { id: "s_cowboy",  emoji: "🤠",  nombre: "Cowboy",        precio: 100,  reqNivel: 2 },
    { id: "s_casco",   emoji: "⛑️",  nombre: "Casco",         precio: 150,  reqNivel: 3 },
    { id: "s_bruja",   emoji: "🎩",  nombre: "Galera",        precio: 200,  reqNivel: 4 },
    { id: "s_santa",   emoji: "🎅",  nombre: "Navidad",       precio: 250,  reqNivel: 4 },
    { id: "s_vikingo", emoji: "🪖",  nombre: "Vikingo",       precio: 400,  reqNivel: 6 },
    { id: "s_corona",  emoji: "👑",  nombre: "Corona",        precio: 300,  reqNivel: 5 },
    { id: "s_mago",    emoji: "🔮",  nombre: "Mago",          precio: 500,  reqNivel: 7 },
    { id: "s_astronauta", emoji: "👨‍🚀", nombre: "Astronauta", precio: 600,  reqNivel: 8 },
    { id: "s_rey",     emoji: "👸",  nombre: "Realeza",       precio: 800,  reqNivel: 9 },
    { id: "s_supremo", emoji: "🏆",  nombre: "Supremo",       precio: 1000, reqNivel: 10 },
  ],
  lentes: [
    { id: "l_none",    emoji: "",    nombre: "Sin lentes",    precio: 0,    reqNivel: 1 },
    { id: "l_cool",    emoji: "😎",  nombre: "Oscuros",       precio: 50,   reqNivel: 1 },
    { id: "l_nerd",    emoji: "🤓",  nombre: "Nerd",          precio: 100,  reqNivel: 2 },
    { id: "l_fuego",   emoji: "🥸",  nombre: "Disfraz",       precio: 150,  reqNivel: 3 },
    { id: "l_3d",      emoji: "🕶️",  nombre: "3D",            precio: 200,  reqNivel: 4 },
    { id: "l_laser",   emoji: "🔭",  nombre: "Telescopio",    precio: 250,  reqNivel: 5 },
    { id: "l_vr",      emoji: "🥽",  nombre: "VR",            precio: 350,  reqNivel: 6 },
    { id: "l_cyber",   emoji: "🤖",  nombre: "Cyber",         precio: 500,  reqNivel: 8 },
  ],
  bigotes: [
    { id: "b_none",    emoji: "",    nombre: "Sin bigote",    precio: 0,    reqNivel: 1 },
    { id: "b_fino",    emoji: "👨",  nombre: "Clásico",       precio: 50,   reqNivel: 1 },
    { id: "b_largo",   emoji: "🧔",  nombre: "Barba",         precio: 100,  reqNivel: 2 },
    { id: "b_vikingo", emoji: "👴",  nombre: "Sabio",         precio: 150,  reqNivel: 3 },
    { id: "b_pirata",  emoji: "🏴‍☠️", nombre: "Pirata",       precio: 200,  reqNivel: 4 },
    { id: "b_ninja",   emoji: "🥷",  nombre: "Ninja",         precio: 300,  reqNivel: 5 },
    { id: "b_king",    emoji: "🤴",  nombre: "Rey",           precio: 400,  reqNivel: 7 },
  ],
  marcos: [
    { id: "m_none",    color: "",                                          nombre: "Sin marco",  precio: 0,    reqNivel: 1 },
    { id: "m_naranja", color: "#ff6600",                                   nombre: "Naranja",    precio: 50,   reqNivel: 1 },
    { id: "m_azul",    color: "#00aaff",                                   nombre: "Azul",       precio: 50,   reqNivel: 1 },
    { id: "m_verde",   color: "#39ff14",                                   nombre: "Verde",      precio: 100,  reqNivel: 2 },
    { id: "m_rojo",    color: "#ff3366",                                   nombre: "Rojo",       precio: 150,  reqNivel: 2 },
    { id: "m_dorado",  color: "#ffe600",                                   nombre: "Dorado",     precio: 200,  reqNivel: 3 },
    { id: "m_morado",  color: "#a855f7",                                   nombre: "Morado",     precio: 200,  reqNivel: 3 },
    { id: "m_celeste", color: "#00ffcc",                                   nombre: "Celeste",    precio: 250,  reqNivel: 4 },
    { id: "m_galaxy",  color: "linear-gradient(135deg,#ff6600,#00aaff)",   nombre: "Galaxy",     precio: 500,  reqNivel: 7 },
    { id: "m_fuego",   color: "linear-gradient(135deg,#ff3300,#ffe600)",   nombre: "Fuego",      precio: 600,  reqNivel: 8 },
    { id: "m_aurora",  color: "linear-gradient(135deg,#39ff14,#00aaff,#a855f7)", nombre: "Aurora", precio: 700, reqNivel: 9 },
    { id: "m_gold",    color: "linear-gradient(135deg,#ffe600,#ff6600)",   nombre: "Premium",    precio: 800,  reqNivel: 9 },
    { id: "m_banda",   color: "linear-gradient(135deg,#ff6600,#ffe600,#ff6600)", nombre: "BandaGamer", precio: 1000, reqNivel: 10 },
  ],
  emojis: [
    { id: "e_smile",   emoji: "😊",  nombre: "Sonrisa",       precio: 0,    reqNivel: 1 },
    { id: "e_cool",    emoji: "😎",  nombre: "Cool",          precio: 50,   reqNivel: 1 },
    { id: "e_fire",    emoji: "🔥",  nombre: "Fuego",         precio: 100,  reqNivel: 2 },
    { id: "e_star",    emoji: "⭐",  nombre: "Estrella",      precio: 150,  reqNivel: 3 },
    { id: "e_lightning",emoji: "⚡", nombre: "Rayo",          precio: 200,  reqNivel: 3 },
    { id: "e_skull",   emoji: "💀",  nombre: "Skull",         precio: 250,  reqNivel: 4 },
    { id: "e_alien",   emoji: "👽",  nombre: "Alien",         precio: 300,  reqNivel: 5 },
    { id: "e_robot",   emoji: "🤖",  nombre: "Robot",         precio: 350,  reqNivel: 6 },
    { id: "e_dragon",  emoji: "🐉",  nombre: "Dragón",        precio: 500,  reqNivel: 7 },
    { id: "e_diamond", emoji: "💎",  nombre: "Diamante",      precio: 700,  reqNivel: 8 },
    { id: "e_crown",   emoji: "👑",  nombre: "Corona",        precio: 800,  reqNivel: 9 },
    { id: "e_supreme", emoji: "🌟",  nombre: "Supremo",       precio: 1000, reqNivel: 10 },
  ]
};

// Default de accesorios
const ACCESORIOS_DEFAULT = { sombrero: "s_none", lentes: "l_none", bigote: "b_none", marco: "m_none", emoji: "e_smile" };

// Componer el avatar con accesorios
function renderAvatar(base, accesorios={}, size=40){
  const acc = { ...ACCESORIOS_DEFAULT, ...accesorios };
  // El emoji base viene del accesorio seleccionado, no del parámetro base
  const emojiBase = ACCESORIOS.emojis?.find(a=>a.id===acc.emoji)?.emoji || base || "😊";
  const sombrero = ACCESORIOS.sombreros.find(a=>a.id===acc.sombrero)?.emoji||"";
  const lentes   = ACCESORIOS.lentes.find(a=>a.id===acc.lentes)?.emoji||"";
  const bigote   = ACCESORIOS.bigotes.find(a=>a.id===acc.bigote)?.emoji||"";
  const marcoAcc = ACCESORIOS.marcos.find(a=>a.id===acc.marco);
  const marcoBorder = marcoAcc?.color ? `border:2px solid; border-image:none; outline:2px solid ${marcoAcc.color}; outline-offset:1px;` : "";
  return `<div style="position:relative;display:inline-block;width:${size}px;height:${size}px;${marcoBorder}border-radius:50%">
    <span style="font-size:${size*0.7}px;line-height:${size}px;display:block;text-align:center">${emojiBase}</span>
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
  const nombre = input ? input.value.trim().slice(0, 20) : "";
  if (!nombre || nombre.length < 2) {
    mostrarToast("Ingresá un nombre (mínimo 2 caracteres)", "⚠️");
    if (input) input.focus();
    return;
  }
  // Guardar como invitado en localStorage
  const u = { ...Storage.USUARIO_DEFAULT, nombre, uid: "", esInvitado: true };
  localStorage.setItem("bandagamer_usuario_v2", JSON.stringify(u));
  // Ocultar pantalla de login y arrancar
  ocultarPantallaLogin();
  iniciarInterfaz(u);
  verificarLogros();
  mostrarToast(`Bienvenido, ${nombre}!`, "👤");
}

// Cerrar sesión
async function cerrarSesion() {
  const user = Storage.auth.currentUser;
  try { if (typeof Social !== "undefined") Social.goOffline(); } catch (e) {}
  if (user) {
    // Usuario con Google
    await Storage.auth.signOut();
  } else {
    // Invitado — borrar localStorage
    localStorage.removeItem("bandagamer_usuario_v2");
    localStorage.removeItem("bandagamer_visitas_v2");
  }
  mostrarToast("Sesión cerrada", "👋");
  // Recargar para volver al login
  setTimeout(() => location.reload(), 800);
}

// ── INICIO ────────────────────────────────────────────────────────────────

async function iniciarApp() {
  Storage.auth.onAuthStateChanged(async (user) => {
    if (user) {
      // Usuario con Google autenticado
      await Storage.migrarLocalAFirestore();
      const usuario = await Storage.getUsuario();
      Storage.publicarPerfil();   // usuarios viejos sin perfil público no aparecían en la búsqueda
      ocultarPantallaLogin();
      iniciarInterfaz(usuario);
      verificarLogros();
    } else {
      // Sin Google — verificar si hay sesión de invitado activa en localStorage
      const raw = localStorage.getItem("bandagamer_usuario_v2");
      if (raw) {
        try {
          const u = JSON.parse(raw);
          // Si tiene nombre y está marcado como invitado (o simplemente tiene nombre), entrar directo
          if (u && u.nombre && u.nombre.length >= 2) {
            ocultarPantallaLogin();
            iniciarInterfaz(u);
            verificarLogros();
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
  // onAuthStateChanged puede disparar más de una vez (login/logout): no duplicar listeners
  configurarFavoritosDelegado();
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

// Renderiza la fila de juegos destacados (los primeros 6 locales)
async function renderizarDestacados() {
  const contenedor = document.getElementById("destacados-grid");
  if (!contenedor) return;
  const destacados = juegos.filter(j => j.tipo === "local").slice(0, 6);
  contenedor.innerHTML = await crearCardsHTML(destacados);
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
  // V3: sincronizar presencia online (initPresence es idempotente)
  if (typeof Social !== 'undefined' && u.uid) {
    Social.initPresence(u.uid, u.nombre);
    iniciarNotificacionesSociales(u.uid);
  }
  const maxNivel = (u.nivel || 1) >= 10;
  const xpAct = maxNivel ? 1000 : (u.xp || 0) % 1000;
  const pct   = (xpAct / 1000) * 100;
  const el    = (id) => document.getElementById(id);

  if (el("perfil-nombre"))      el("perfil-nombre").textContent      = u.nombre || "—";
  if (el("perfil-nivel"))       el("perfil-nivel").textContent       = `Nv.${u.nivel}`;
  if (el("perfil-monedas"))     el("perfil-monedas").textContent     = (u.monedas || 0).toLocaleString();
  if (el("perfil-avatar"))      el("perfil-avatar").textContent      = u.avatar || "😊";
  if (el("xp-bar-fill"))        el("xp-bar-fill").style.width        = pct + "%";
  if (el("xp-texto"))           el("xp-texto").textContent           = maxNivel ? "NIVEL MÁXIMO" : `${xpAct}/1000 XP`;
  if (el("perfil-nivel-texto")) el("perfil-nivel-texto").textContent = NOMBRES_NIVEL[u.nivel] || "";
}

// ── Notificaciones sociales globales ──────────────────────────────────────
// Toda la lógica vive en js/notifs.js (compartida con la página de juego y la social):
// contador con número en el header + toasts de solicitudes, invitaciones, chats y grupos.
function iniciarNotificacionesSociales(uid) {
  if (typeof Notifs !== 'undefined' && Storage.auth.currentUser) Notifs.iniciar(uid);
}
function showSocialToast(text, gotoUrl) {
  if (typeof Notifs !== 'undefined') Notifs.toast(text, gotoUrl);
}

// ── GRID DE JUEGOS ────────────────────────────────────────────────────────

async function renderizarGrid(lista) {
  const grid = document.getElementById("games-grid");
  if (!grid) return;

  if (!lista.length) {
    grid.innerHTML = `<div class="sin-resultados"><span class="sin-icon">🔍</span><p>No encontramos juegos para "<strong>${esc(terminoBusqueda)}</strong>". Probá con otra palabra.</p></div>`;
    return;
  }

  grid.innerHTML = await crearCardsHTML(lista);
}

// Antes cada card hacía 2 lecturas (favorito + visitas) => ~100 lecturas de
// Firestore por cada render/filtro. Ahora se lee UNA vez y se reparte.
async function crearCardsHTML(lista) {
  const [u, visitas] = await Promise.all([Storage.getUsuario(), Storage.getVisitas()]);
  const favs = new Set(u.favoritos || []);
  return lista.map((j, i) => crearCardHTML(j, i, favs.has(j.id), visitas[j.id] || 0)).join("");
}

function crearCardHTML(juego, indice, esFav, visitas) {
  const tieneThumb = juego.thumbnail && juego.thumbnail.length > 0;
  const badgeTipo  = { iframe:"", local:'<span class="badge badge-local">LOCAL</span>', emulador:'<span class="badge badge-emulador">RETRO</span>' }[juego.tipo] || "";
  // Solo juegos locales y algunos iframes tienen preview jugable
  const tienePreview = juego.tipo === "local" && juego.embed_url;
  const tieneVideo = juego.preview_video;
  const nombre = esc(juego.nombre);

  return `
    <a class="game-card" href="pages/juego.html?id=${esc(juego.id)}"
       style="animation-delay:${indice*0.04}s"
       ${tieneVideo ? `data-preview-video="${esc(juego.preview_video)}"` : (tienePreview ? `data-preview="pages/${esc(juego.embed_url)}"` : "")}
       onmouseenter="iniciarPreview(this)"
       onmouseleave="detenerPreview(this)">
      <div class="card-thumb">
        <!-- Thumbnail estático -->
        <div class="card-thumb-static">
          ${tieneThumb ? `<img src="${esc(juego.thumbnail)}" alt="${nombre}" loading="lazy" onerror="this.style.display='none';this.parentNode.querySelector('.thumb-fallback').style.display='flex'">` : ""}
          <div class="thumb-fallback" style="display:${tieneThumb?'none':'flex'}">
            <span class="thumb-fallback-icon">🎮</span>
            <span class="thumb-fallback-nombre">${nombre}</span>
          </div>
        </div>
        <!-- Preview iframe — se muestra al hover -->
        <div class="card-preview-wrap" style="display:none">
          <div class="card-preview-label">▶ PREVIEW</div>
        </div>
        <button class="btn-favorito ${esFav?'activo':''}" data-id="${esc(juego.id)}"
                title="${esFav?'Quitar de favoritos':'Agregar a favoritos'}">${esFav?'♥':'♡'}</button>
        ${badgeTipo}
      </div>
      <div class="card-info">
        <span class="card-nombre">${nombre}</span>
        <div class="card-meta">
          <span class="card-categoria">${esc(juego.categoria)}</span>
          ${visitas > 0 ? `<span class="card-visitas">▶ ${visitas}</span>` : ""}
        </div>
      </div>
    </a>`;
}

// Un único listener para TODOS los botones de favorito (grid, destacados, recientes, favoritos).
// Antes había un onclick inline que llamaba a toggleFavorito() (que no existe) MÁS un listener
// por render, y en la sección Favoritos el botón no hacía nada.
let _favDelegadoListo = false;
function configurarFavoritosDelegado() {
  if (_favDelegadoListo) return;
  _favDelegadoListo = true;
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest && e.target.closest(".btn-favorito");
    if (!btn || !btn.dataset.id) return;
    e.preventDefault(); e.stopPropagation();
    if (btn.dataset.busy) return;
    btn.dataset.busy = "1";
    try {
      const ahora = await Storage.toggleFavorito(btn.dataset.id);
      // sincronizar todas las copias visibles del mismo juego
      document.querySelectorAll(`.btn-favorito[data-id="${btn.dataset.id}"]`).forEach(b => {
        b.classList.toggle("activo", ahora);
        b.textContent = ahora ? "♥" : "♡";
        b.title = ahora ? "Quitar de favoritos" : "Agregar a favoritos";
      });
      // Si estamos en la sección Favoritos, sacar la card al desmarcar
      if (!ahora) {
        const cont = btn.closest("#favoritos-grid");
        if (cont) { const card = btn.closest(".game-card"); if (card) card.remove(); if (!cont.children.length) renderizarFavoritos(); }
      }
      verificarLogros();
    } catch (err) {
      console.warn("[Favoritos]", err);
      mostrarToast("No se pudo guardar el favorito", "❌");
    } finally {
      delete btn.dataset.busy;
    }
  }, true);
}

// ── PREVIEW AL HOVER ──────────────────────────────────────────────────────
function iniciarPreview(card) {
  const videoUrl = card.dataset.previewVideo;
  const iframeUrl = card.dataset.preview;
  if (!videoUrl && !iframeUrl) return;

  clearTimeout(card._previewTimer);
  clearTimeout(card._hideTimer);   // si volvió el mouse antes de que se oculte, no ocultar
  card._previewTimer = setTimeout(() => {
    const wrap = card.querySelector('.card-preview-wrap');
    const staticDiv = card.querySelector('.card-thumb-static');
    if (!wrap || !staticDiv) return;

    if (videoUrl) {
      // Modo video: más rápido, mejor calidad, sin lag de iframe
      if (!wrap.querySelector('video')) {
        const vid = document.createElement('video');
        vid.src = videoUrl;
        vid.autoplay = true;
        vid.loop = true;
        vid.muted = true;
        vid.playsInline = true;
        vid.style.cssText = 'width:100%;height:100%;object-fit:cover;pointer-events:none;';
        vid.onerror = () => {
          // Video no encontrado - volver al thumbnail estático
          wrap.style.display = 'none';
          staticDiv.style.opacity = '1';
        };
        wrap.insertBefore(vid, wrap.firstChild);
      } else {
        const vid = wrap.querySelector('video');
        vid.currentTime = 0;
        vid.play().catch(() => {});
      }
    } else {
      // Modo iframe fallback
      if (!wrap.querySelector('iframe')) {
        const iframe = document.createElement('iframe');
        iframe.src = iframeUrl;
        iframe.style.cssText = 'width:100%;height:100%;border:none;pointer-events:none;';
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
        iframe.setAttribute('loading', 'lazy');
        wrap.insertBefore(iframe, wrap.firstChild);
      }
    }

    staticDiv.style.opacity = '0';
    staticDiv.style.transition = 'opacity .25s ease';
    wrap.style.display = 'block';
    wrap.style.opacity = '0';
    wrap.style.transition = 'opacity .25s ease';
    requestAnimationFrame(() => { wrap.style.opacity = '1'; });
  }, 500);
}

function detenerPreview(card) {
  clearTimeout(card._previewTimer);
  const wrap = card.querySelector('.card-preview-wrap');
  const staticDiv = card.querySelector('.card-thumb-static');
  if (wrap) {
    // Pausar video si existe
    const vid = wrap.querySelector('video');
    if (vid) vid.pause();
    wrap.style.opacity = '0';
    clearTimeout(card._hideTimer);
    card._hideTimer = setTimeout(() => {
      wrap.style.display = 'none';
      // liberar el iframe de preview: antes quedaban todos cargados en memoria
      const f = wrap.querySelector('iframe');
      if (f) f.remove();
    }, 250);
  }
  if (staticDiv) { staticDiv.style.opacity = '1'; }
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

const ETIQUETAS_CATEGORIA = {
  todos:"🕹 Todos", accion:"⚔️ Acción", puzzle:"🧩 Puzzle", arcade:"👾 Arcade",
  multijugador:"🌐 Multi", carreras:"🏎️ Carreras", estrategia:"♟️ Estrategia",
  casual:"🎲 Casual", aventura:"🗺️ Aventura", deportes:"⚽ Deportes", retro:"📺 Retro"
};
// Solo categorías que tienen juegos (antes se listaban Aventura/Deportes/Retro vacías
// y faltaba Casual, que tiene 5 juegos y solo se veían en "Todos")
function categoriasConJuegos() {
  const usadas = new Set(juegos.map(j => j.categoria));
  return Object.keys(ETIQUETAS_CATEGORIA).filter(id => id === "todos" || usadas.has(id));
}

function renderizarSidebar() {
  const cats = categoriasConJuegos().map(id => ({ id, label: ETIQUETAS_CATEGORIA[id] }));
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
  contenedor.innerHTML = await crearCardsHTML(lista);
}

// ── BUSCADOR ──────────────────────────────────────────────────────────────

let _buscadorListo = false;
function configurarBuscador() {
  const input = document.getElementById("buscador");
  if (!input || _buscadorListo) return;
  _buscadorListo = true;
  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => filtrarPorBusqueda(input.value.trim()), 220);
  });
}

// ── NAVEGACIÓN ────────────────────────────────────────────────────────────

let _navListo = false;
function configurarNavMenu() {
  if (_navListo) return;
  _navListo = true;
  document.querySelectorAll("[data-seccion]").forEach(btn => {
    btn.addEventListener("click", () => mostrarSeccion(btn.dataset.seccion));
  });
  const hamburger = document.getElementById("hamburger");
  const navMenu   = document.getElementById("nav-menu");
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("abierto");
      hamburger.firstChild.nodeValue = navMenu.classList.contains("abierto") ? "✕" : "☰";
    });
  }
}

let _filtrosListos = false;
function configurarFiltrosCategorias() {
  const strip = document.getElementById("cat-strip");
  if (!strip || _filtrosListos) return;
  _filtrosListos = true;
  const validas = new Set(categoriasConJuegos());
  strip.querySelectorAll("[data-categoria]").forEach(btn => {
    if (!validas.has(btn.dataset.categoria)) { btn.style.display = "none"; return; }
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
  contenedor.innerHTML = await crearCardsHTML(lista);
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
    const foto = urlFotoSegura(p.fotoPerfil);
    // Mostrar foto de perfil si tiene, si no el emoji avatar
    const avatarHtml = foto
      ? `<img src="${foto}" alt="" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,102,0,0.35)" onerror="this.style.display='none'">`
      : `<span style="font-size:26px">${esc(p.avatar || "😊")}</span>`;
    return `
      <div class="ranking-fila ${esSoy ? "ranking-yo" : ""}" data-uid="${esc(p.uid)}"
           style="cursor:pointer;transition:background .15s"
           onmouseenter="this.style.background='rgba(255,102,0,0.06)'"
           onmouseleave="this.style.background=''">
        <div class="ranking-pos">${medal}</div>
        <div class="ranking-avatar" style="display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;overflow:hidden;background:rgba(255,255,255,0.05)">${avatarHtml}</div>
        <div class="ranking-info">
          <div class="ranking-nombre">${esc(p.nombre)}${esSoy ? ' <span class="ranking-tu-tag">vos</span>' : ""}</div>
          <div class="ranking-nivel-txt">${esc(nivelNombre)}</div>
        </div>
        <div class="ranking-xp">${(p.xp || 0).toLocaleString()} XP</div>
        <div class="ranking-nivel-badge">Nv.${Number(p.nivel) || 1}</div>
      </div>`;
  }).join("");
  contenedor.querySelectorAll(".ranking-fila").forEach(fila => {
    fila.addEventListener("click", () => verPerfilUsuario(fila.dataset.uid));
  });
}

// ── VER PERFIL DE OTRO USUARIO ───────────────────────────────────────────

async function verPerfilUsuario(uid) {
  const miUid = Storage.auth.currentUser?.uid;
  if (uid === miUid) { mostrarSeccion("perfil"); return; }   // irSeccion() no existía

  // Modal de perfil
  let modal = document.getElementById("modal-perfil-usuario");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-perfil-usuario";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px";
    modal.innerHTML = `<div style="background:#111120;border:1px solid rgba(255,102,0,0.3);border-radius:18px;padding:24px;max-width:340px;width:100%;position:relative;text-align:center">
      <button onclick="document.getElementById('modal-perfil-usuario').remove()" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#aaa;padding:4px 10px;border-radius:8px;cursor:pointer">✕</button>
      <div id="mpf-avatar" style="font-size:52px;margin-bottom:8px">😊</div>
      <div id="mpf-nombre" style="font-size:20px;font-weight:700;margin-bottom:4px">Cargando...</div>
      <div id="mpf-rango" style="font-size:12px;color:#ff6600;letter-spacing:1px;margin-bottom:14px"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
        <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:10px">
          <div id="mpf-xp" style="font-size:18px;font-weight:700;color:#00aaff">0</div>
          <div style="font-size:10px;color:#666;letter-spacing:1px">XP</div>
        </div>
        <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:10px">
          <div id="mpf-nivel" style="font-size:18px;font-weight:700;color:#ff6600">1</div>
          <div style="font-size:10px;color:#666;letter-spacing:1px">NIVEL</div>
        </div>
        <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:10px">
          <div id="mpf-juegos" style="font-size:18px;font-weight:700;color:#39ff14">0</div>
          <div style="font-size:10px;color:#666;letter-spacing:1px">PARTIDAS</div>
        </div>
      </div>
      <div id="mpf-acciones" style="display:flex;gap:8px;justify-content:center"></div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
  }

  // Cargar el perfil PÚBLICO (ranking/). Antes se leía usuarios/{uid}, que es el perfil
  // privado de otra persona (y las reglas de seguridad deberían bloquearlo).
  try {
    const p = await Storage.getPerfilPublico(uid);
    if (!p) { modal.querySelector("#mpf-nombre").textContent = "Usuario no encontrado"; return; }

    const avatarEl = modal.querySelector("#mpf-avatar");
    const fotoP = urlFotoSegura(p.fotoPerfil);
    if (fotoP) {
      avatarEl.innerHTML = `<img src="${fotoP}" alt="" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,102,0,0.4)">`;
    } else {
      avatarEl.textContent = p.avatar || "😊";
    }
    modal.querySelector("#mpf-nombre").textContent = p.nombre || "Usuario";
    modal.querySelector("#mpf-rango").textContent = NOMBRES_NIVEL[p.nivel] || "";
    modal.querySelector("#mpf-xp").textContent = (p.xp || 0).toLocaleString();
    modal.querySelector("#mpf-nivel").textContent = p.nivel || 1;
    modal.querySelector("#mpf-juegos").textContent = p.juegos_jugados || 0;

    // Acciones: ir a chat si es amigo
    if (typeof Social !== "undefined" && Social.uid) {
      const estado = await Social.estadoAmistad(uid);
      const acciones = modal.querySelector("#mpf-acciones");
      acciones.innerHTML = "";
      const crearBtn = (txt, color, onClick) => {
        const b = document.createElement("button");
        b.textContent = txt;
        b.style.cssText = `background:${color[0]};border:1px solid ${color[1]};color:${color[2]};padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:700`;
        b.addEventListener("click", onClick);
        acciones.appendChild(b);
        return b;
      };
      if (estado === "friends") {
        crearBtn("💬 Chat", ["rgba(0,170,255,0.15)","rgba(0,170,255,0.4)","#00aaff"], () => { window.location.href = "pages/social.html"; });
      } else if (estado === "none") {
        const b = crearBtn("+ Agregar amigo", ["rgba(255,102,0,0.15)","rgba(255,102,0,0.4)","#ff6600"], async () => {
          b.disabled = true;
          const r = await Social.enviarSolicitud(uid);
          b.textContent = r && r.ok ? (r.aceptada ? "✅ Ahora son amigos" : "✅ Enviado") : "❌ " + ((r && r.error) || "Error");
        });
      } else if (estado === "pending_out") {
        acciones.innerHTML = `<span style="color:#666;font-size:13px">⏳ Solicitud enviada</span>`;
      } else if (estado === "pending_in") {
        const b = crearBtn("✅ Aceptar solicitud", ["rgba(57,255,20,0.12)","rgba(57,255,20,0.4)","#39ff14"], async () => {
          b.disabled = true;
          await Social.aceptarSolicitud(uid);
          b.textContent = "✅ Ahora son amigos";
        });
      }
    }
  } catch(e) {
    console.error("Error cargando perfil:", e);
  }
}

// ── PERFIL ────────────────────────────────────────────────────────────────

async function renderizarPerfil() {
  const u = await Storage.getUsuario();
  const contenedor = document.getElementById("perfil-contenido");
  if (!contenedor) return;

  const maxNivel = (u.nivel || 1) >= 10;
  const xpAct = maxNivel ? 1000 : (u.xp || 0) % 1000;
  const pct   = (xpAct / 1000) * 100;
  const fotoSegura = urlFotoSegura(u.fotoPerfil);
  const tiempoH = Math.floor((u.tiempo_jugado_total || 0) / 3600);
  const tiempoM = Math.floor(((u.tiempo_jugado_total || 0) % 3600) / 60);
  const logrosCount = (u.logros || []).length;

  const esInvitado = u.esInvitado || !u.uid;

  contenedor.innerHTML = `
    <div class="perfil-card">
      <div class="perfil-avatar-grande" title="Cambiar foto" onclick="document.getElementById('foto-input').click()" style="cursor:pointer;position:relative">
        ${fotoSegura
          ? `<img src="${fotoSegura}" alt="" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,102,0,0.4)">`
          : `<span style="font-size:64px">${esc(u.avatar||"😊")}</span>`}
        <div style="position:absolute;bottom:0;right:0;background:rgba(255,102,0,0.8);border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:14px">📷</div>
      </div>
      <input type="file" id="foto-input" accept="image/*" style="display:none" onchange="cambiarFotoPerfil(this)">
      <div class="perfil-datos">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <div class="perfil-nombre-grande" id="perfil-nombre-display">${esc(u.nombre)}</div>
          <button onclick="editarNombre()" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:var(--color-muted);font-size:10px;padding:4px 8px;border-radius:6px;cursor:pointer;font-family:'Orbitron',sans-serif;font-weight:700;letter-spacing:1px">✏️</button>
        </div>
        <div id="nombre-edit-form" style="display:none;margin-bottom:8px">
          <div style="display:flex;gap:6px">
            <input type="text" id="nombre-nuevo-input" value="${esc(u.nombre)}" maxlength="20"
              style="flex:1;background:rgba(255,255,255,0.07);border:1px solid rgba(255,102,0,0.3);color:var(--color-text);font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;padding:7px 11px;border-radius:8px;outline:none;">
            <button onclick="guardarNombre()" style="background:linear-gradient(135deg,#ff6600,#ff9500);border:none;color:#fff;font-family:'Orbitron',sans-serif;font-size:10px;font-weight:700;padding:7px 12px;border-radius:8px;cursor:pointer;letter-spacing:1px;white-space:nowrap">✓ OK</button>
          </div>
        </div>
        <div class="perfil-rango">${esc(NOMBRES_NIVEL[u.nivel] || "")}</div>
        ${esInvitado ? `<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:7px 12px;font-size:12px;color:var(--color-muted);margin-top:8px">👤 Modo invitado — <button onclick="loginConGoogle()" style="background:none;border:none;color:#00aaff;cursor:pointer;font-size:12px;font-weight:700;padding:0">Conectá con Google</button> para guardar tu progreso</div>` : ""}
        <div class="perfil-xp-barra-wrap" style="margin-top:10px">
          <div class="perfil-xp-barra"><div class="perfil-xp-fill" style="width:${pct}%"></div></div>
          <span class="perfil-xp-num">${maxNivel ? "NIVEL MÁXIMO" : xpAct + " / 1000 XP"}</span>
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
        <span class="pstat-val">${(u.favoritos || []).length}</span>
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
    const tiene = (u.logros || []).includes(l.id);
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
let _verificandoLogros = false;
async function verificarLogros() {
  if (_verificandoLogros) return;
  _verificandoLogros = true;
  try { await _verificarLogros(); } finally { _verificandoLogros = false; }
}
async function _verificarLogros() {
  const u = await Storage.getUsuario();
  let alguno = false;
  u.logros = u.logros || [];
  u.favoritos = u.favoritos || [];
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
  if (monEl) monEl.textContent = (u.monedas || 0).toLocaleString();

  const cats = [
    { key: "emoji",    plural: "emojis",    label: "😊 Avatar base" },
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

function buscarAccesorio(id) {
  for (const lista of Object.values(ACCESORIOS)) {
    const it = lista.find(a => a.id === id);
    if (it) return it;
  }
  return null;
}

async function comprarAccesorio(id, catKey /*, precio ignorado: se toma del catálogo */) {
  const item = buscarAccesorio(id);
  if (!item || !ACCESORIOS_DEFAULT.hasOwnProperty(catKey)) { mostrarToast("Accesorio inválido", "❌"); return; }
  let error = null;
  try {
    // Atómico: verificar saldo y descontar en la misma transacción (antes se podía
    // comprar dos veces con un doble click, o pisar XP ganado en ese instante)
    await Storage.actualizarUsuario(u => {
      u.accesorios_comprados = u.accesorios_comprados || [];
      if (u.accesorios_comprados.includes(id)) { error = "Ya lo tenés"; return; }
      if ((u.nivel || 1) < item.reqNivel) { error = `Requiere nivel ${item.reqNivel}`; return; }
      if ((u.monedas || 0) < item.precio) { error = "No tenés suficientes monedas"; return; }
      u.monedas -= item.precio;
      u.accesorios_comprados.push(id);
      u.accesorios = { ...ACCESORIOS_DEFAULT, ...(u.accesorios || {}), [catKey]: id };
    });
  } catch (e) { error = "No se pudo completar la compra"; console.error(e); }
  if (error) { mostrarToast(error, "❌"); return; }
  await actualizarPerfil();
  await renderizarTienda();
  mostrarToast("Accesorio comprado y equipado", "🎉");
}

async function equiparAccesorio(catKey, id) {
  const item = buscarAccesorio(id);
  if (!item || !ACCESORIOS_DEFAULT.hasOwnProperty(catKey)) return;
  let error = null;
  try {
    await Storage.actualizarUsuario(u => {
      const poseido = item.precio === 0 || (u.accesorios_comprados || []).includes(id);
      if (!poseido) { error = "Todavía no lo compraste"; return; }
      u.accesorios = { ...ACCESORIOS_DEFAULT, ...(u.accesorios || {}), [catKey]: id };
    });
  } catch (e) { error = "No se pudo equipar"; console.error(e); }
  if (error) { mostrarToast(error, "❌"); return; }
  await actualizarPerfil();
  await renderizarTienda();
  mostrarToast("Accesorio equipado", "✅");
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
  const nombre = input ? input.value.trim().replace(/\s+/g, " ").slice(0, 20) : "";
  if (!nombre || nombre.length < 2) { mostrarToast("Nombre muy corto","⚠️"); return; }
  try {
    await Storage.actualizarUsuario(u => { u.nombre = nombre; });
  } catch (e) { mostrarToast("No se pudo guardar el nombre", "❌"); return; }
  await actualizarPerfil();
  await renderizarPerfil();
  mostrarToast("Nombre actualizado","✅");
}

// Cambiar foto de perfil — guarda como base64 reducida
async function cambiarFotoPerfil(input) {
  const file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { mostrarToast("Seleccioná una imagen","⚠️"); return; }
  if (file.size > 8 * 1024 * 1024) { mostrarToast("La imagen es muy pesada (máx. 8 MB)","⚠️"); return; }

  const falla = () => mostrarToast("No se pudo leer la imagen","❌");
  const reader = new FileReader();
  reader.onerror = falla;
  reader.onload = (e) => {
    const img = new Image();
    img.onerror = falla;
    img.onload = async () => {
      // Redimensionar a 200x200 (crop centrado) para no ocupar mucho espacio
      const canvas = document.createElement("canvas");
      canvas.width = 200; canvas.height = 200;
      const ctx2 = canvas.getContext("2d");
      const size = Math.min(img.width, img.height);
      const ox = (img.width - size) / 2;
      const oy = (img.height - size) / 2;
      ctx2.drawImage(img, ox, oy, size, size, 0, 0, 200, 200);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      try {
        await Storage.actualizarUsuario(u => { u.fotoPerfil = dataUrl; });
      } catch (err) { mostrarToast("No se pudo guardar la foto","❌"); return; }
      input.value = "";   // permitir volver a elegir el mismo archivo
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
  const i = document.createElement("span"); i.textContent = icon;
  const m = document.createElement("span"); m.textContent = mensaje;
  toast.append(i, m);
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
