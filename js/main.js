// main.js — AltoVicio V2
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
    { id: "m_banda",   color: "linear-gradient(135deg,#ff6600,#ffe600,#ff6600)", nombre: "AltoVicio", precio: 1000, reqNivel: 10 },
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
  renderizarHeroYMisiones();
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
  if (el("perfil-avatar")) el("perfil-avatar").innerHTML = window.renderAvatar(u.avatar || "😊", u.accesorios, 34, u.fotoPerfil); (estado === "none") {
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
        ${window.renderAvatar(u.avatar || "😊", u.accesorios, 88, u.fotoPerfil)}
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
        <div class="perfil-rango">${esc(NOMBRES_NIVEL[u.nivel] || "")} ${window.renderTituloBadge ? window.renderTituloBadge(u.accesorios) : ""}</div>
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

// ── TIENDA ESTILO PLATO (VICIOSHOP STUDIO V9) ─────────────────────────────
let _catTiendaActiva = "todos";
let _previewOverride = null;

const CATEGORIAS_TIENDA = [
  { key: "todos",    plural: "todos",     label: "✨ Todo" },
  { key: "marco",    plural: "marcos",    label: "🖼️ Marcos" },
  { key: "efecto",   plural: "efectos",   label: "⚡ Auras" },
  { key: "sombrero", plural: "sombreros", label: "👑 Sombreros" },
  { key: "lentes",   plural: "lentes",    label: "🕶️ Lentes" },
  { key: "bigote",   plural: "bigotes",   label: "🧉 Boca / Mate" },
  { key: "mascota",  plural: "mascotas",  label: "🦫 Mascotas" },
  { key: "titulo",   plural: "titulos",   label: "🏷️ Títulos" },
  { key: "burbuja",  plural: "burbujas",  label: "💬 Burbujas Chat" },
  { key: "emoji",    plural: "emojis",    label: "😎 Caras Base" }
];

async function renderizarTienda() {
  const u = await Storage.getUsuario();
  const contenedor = document.getElementById("tienda-grid");
  if (!contenedor) return;
  contenedor.style.display = "block";

  const comprados = u.accesorios_comprados || [];
  const baseEquip = { ...window.ACCESORIOS_DEFAULT, ...(u.accesorios || {}) };
  const lookActual = _previewOverride ? { ...baseEquip, ..._previewOverride } : baseEquip;

  const monEl = document.getElementById("tienda-monedas");
  if (monEl) monEl.textContent = (u.monedas || 0).toLocaleString();

  const tituloHtml = window.renderTituloBadge(lookActual) || '<span style="font-size:11px;color:var(--color-muted)">Sin título equipado</span>';
  const bubbleCss  = window.getChatBubbleCSS(lookActual);

  const tabsHtml = CATEGORIAS_TIENDA.map(c =>
    `<button class="plato-tab-btn ${_catTiendaActiva === c.key ? 'activo' : ''}" onclick="cambiarCatTienda('${c.key}')">${c.label}</button>`
  ).join("");

  const catsAMostrar = _catTiendaActiva === "todos"
    ? CATEGORIAS_TIENDA.filter(c => c.key !== "todos")
    : CATEGORIAS_TIENDA.filter(c => c.key === _catTiendaActiva);

  const seccionesHtml = catsAMostrar.map(cat => {
    const items = window.ACCESORIOS[cat.plural] || [];
    const equipadoId = baseEquip[cat.key] || (items[0] && items[0].id);
    const cards = items.map(item => {
      const poseido  = item.precio === 0 || comprados.includes(item.id);
      const equipado = equipadoId === item.id;
      const bloq     = (u.nivel || 1) < item.reqNivel;
      const puede    = !bloq && (u.monedas || 0) >= item.precio;
      const rar      = item.rareza || "comun";

      // Vista previa de cada ítem aplicada sobre la propia foto/avatar del usuario
      const mockAcc = { ...baseEquip, [cat.key]: item.id };
      let previewHtml = "";
      if (cat.key === "titulo") {
        previewHtml = `<div style="min-height:54px;display:flex;align-items:center;justify-content:center">${item.texto ? window.renderTituloBadge(mockAcc) : '<span style="color:#666;font-size:12px">Ninguno</span>'}</div>`;
      } else if (cat.key === "burbuja") {
        previewHtml = `<div style="min-height:54px;display:flex;align-items:center;justify-content:center"><div style="padding:6px 10px;border-radius:10px;font-size:11px;${item.css}">¡Hola banda! 🎮</div></div>`;
      } else {
        previewHtml = `<div style="margin:6px 0">${window.renderAvatar(u.avatar || "😊", mockAcc, 54, u.fotoPerfil)}</div>`;
      }

      let btnAccion = "";
      if (equipado)     btnAccion = `<button class="av-btn av-btn-equipado" disabled>✓ EQUIPADO</button>`;
      else if (poseido) btnAccion = `<button class="av-btn av-btn-equipar" onclick="equiparAccesorio('${cat.key}','${item.id}')">EQUIPAR</button>`;
      else if (bloq)    btnAccion = `<button class="av-btn av-btn-bloqueado" disabled>🔒 Nv.${item.reqNivel}</button>`;
      else              btnAccion = `<button class="av-btn av-btn-comprar ${puede ? '' : 'av-sin-fondos'}" onclick="comprarAccesorio('${item.id}','${cat.key}')" ${puede ? '' : 'disabled'}>🪙 ${item.precio}</button>`;

      const btnProbar = !equipado
        ? `<button class="av-btn av-btn-probar" onclick="probarEnEstudio('${cat.key}','${item.id}')">👁️ Probar en mí</button>`
        : "";

      return `<div class="tienda-card ${equipado ? 'tienda-card-equipado' : ''} ${bloq ? 'tienda-card-bloqueado' : ''}">
        <span class="rareza-tag rareza-${rar}">${rar}</span>
        ${previewHtml}
        <div class="tienda-avatar-nombre" style="color:#fff;font-size:13px">${esc(item.nombre)}</div>
        ${btnAccion}
        ${btnProbar}
      </div>`;
    }).join("");

    return `<div style="margin-bottom:24px">
      <div style="font-family:'Orbitron',sans-serif;font-size:12px;font-weight:800;color:var(--color-primary);letter-spacing:1.5px;margin-bottom:12px">${cat.label}</div>
      <div class="tienda-grid">${cards}</div>
    </div>`;
  }).join("");

  contenedor.innerHTML = `
    <div class="plato-studio">
      <div class="plato-stage-box">
        <div style="font-family:'Orbitron',sans-serif;font-size:10px;color:var(--color-accent);letter-spacing:1.5px">PROBADOR EN VIVO</div>
        <div id="studio-avatar-stage" style="padding:14px 0">
          ${window.renderAvatar(u.avatar || "😊", lookActual, 96, u.fotoPerfil)}
        </div>
        <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:15px;color:#fff">${esc(u.nombre || "Jugador")}</div>
        <div>${tituloHtml}</div>
        ${_previewOverride ? `<span style="font-size:11px;color:#38bdf8">👁️ Modo prueba activo</span>` : ""}
      </div>
      <div class="plato-controls-box">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
          <div>
            <div style="font-family:'Orbitron',sans-serif;font-size:14px;font-weight:800;color:#fff">Personalizá tu Avatar sobre tu Foto o Emoji</div>
            <div style="font-size:13px;color:var(--color-muted)">Los accesorios se ven en el header, ranking, salas de chat y dentro de los 45 juegos.</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="av-btn-glow secondary" style="padding:8px 12px;font-size:11px" onclick="probarLookAleatorio()">🎲 Probar Look Azar</button>
            <button class="av-btn-glow bonus" style="padding:8px 12px;font-size:11px" onclick="resetearAccesorios()">🧹 Quitar Todo</button>
          </div>
        </div>
        <div class="plato-sliders">
          <label class="plato-slider-row">
            <span>↕ Altura sobre tu foto (${lookActual.offsetY || 0}px)</span>
            <input type="range" min="-20" max="20" value="${lookActual.offsetY || 0}" onchange="ajustarCalibracion('offsetY', this.value)">
          </label>
          <label class="plato-slider-row">
            <span>🔍 Tamaño de accesorios (${lookActual.scale || 100}%)</span>
            <input type="range" min="75" max="135" value="${lookActual.scale || 100}" onchange="ajustarCalibracion('scale', this.value)">
          </label>
        </div>
        <div>
          <div style="font-size:11px;color:var(--color-muted);margin-bottom:4px;font-weight:700">VISTA PREVIA DE TU BURBUJA DE CHAT:</div>
          <div class="plato-chat-preview" style="${bubbleCss}">¡Sale ese Impostor o 8 Ball Pool en AltoVicio! 🚀</div>
        </div>
      </div>
    </div>
    <div class="plato-cat-tabs">${tabsHtml}</div>
    ${seccionesHtml}
  `;
}

function cambiarCatTienda(catKey) {
  _catTiendaActiva = catKey;
  renderizarTienda();
}

function probarEnEstudio(catKey, itemId) {
  _previewOverride = { ...(_previewOverride || {}), [catKey]: itemId };
  if (typeof UISfx !== "undefined") UISfx.equip();
  renderizarTienda();
}

function probarLookAleatorio() {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)].id;
  _previewOverride = {
    sombrero: pick(window.ACCESORIOS.sombreros),
    lentes:   pick(window.ACCESORIOS.lentes),
    bigote:   pick(window.ACCESORIOS.bigotes),
    marco:    pick(window.ACCESORIOS.marcos),
    efecto:   pick(window.ACCESORIOS.efectos),
    mascota:  pick(window.ACCESORIOS.mascotas),
    titulo:   pick(window.ACCESORIOS.titulos),
    burbuja:  pick(window.ACCESORIOS.burbujas)
  };
  if (typeof UISfx !== "undefined") UISfx.equip();
  renderizarTienda();
}

async function resetearAccesorios() {
  _previewOverride = null;
  await Storage.actualizarUsuario(u => {
    u.accesorios = { ...window.ACCESORIOS_DEFAULT };
  });
  await Storage.publicarPerfil();
  await actualizarPerfil();
  await renderizarTienda();
  mostrarToast("Accesorios restaurados", "🧹");
}

async function ajustarCalibracion(campo, valor) {
  const num = Number(valor) || 0;
  _previewOverride = null;
  await Storage.actualizarUsuario(u => {
    u.accesorios = { ...window.ACCESORIOS_DEFAULT, ...(u.accesorios || {}), [campo]: num };
  });
  await Storage.publicarPerfil();
  await actualizarPerfil();
  await renderizarTienda();
}

function buscarAccesorio(id) {
  for (const lista of Object.values(window.ACCESORIOS)) {
    const it = lista.find(a => a.id === id);
    if (it) return it;
  }
  return null;
}

async function comprarAccesorio(id, catKey) {
  const item = buscarAccesorio(id);
  if (!item || !window.ACCESORIOS_DEFAULT.hasOwnProperty(catKey)) {
    mostrarToast("Accesorio inválido", "❌");
    return;
  }
  let error = null;
  try {
    await Storage.actualizarUsuario(u => {
      u.accesorios_comprados = u.accesorios_comprados || [];
      if (u.accesorios_comprados.includes(id)) { error = "Ya lo tenés en tu colección"; return; }
      if ((u.nivel || 1) < item.reqNivel) { error = `Requiere nivel ${item.reqNivel}`; return; }
      if ((u.monedas || 0) < item.precio) { error = "No tenés suficientes VicioCoins"; return; }
      u.monedas -= item.precio;
      u.accesorios_comprados.push(id);
      u.accesorios = { ...window.ACCESORIOS_DEFAULT, ...(u.accesorios || {}), [catKey]: id };
    });
  } catch (e) { error = "No se pudo completar la compra"; console.error(e); }
  if (error) { mostrarToast(error, "❌"); return; }
  _previewOverride = null;
  await Storage.publicarPerfil();
  if (typeof UISfx !== "undefined") UISfx.coin();
  await actualizarPerfil();
  await renderizarTienda();
  mostrarToast(`¡Compraste y equipaste ${item.nombre}!`, "🎉");
}

async function equiparAccesorio(catKey, id) {
  const item = buscarAccesorio(id);
  if (!item || !window.ACCESORIOS_DEFAULT.hasOwnProperty(catKey)) return;
  let error = null;
  try {
    await Storage.actualizarUsuario(u => {
      const poseido = item.precio === 0 || (u.accesorios_comprados || []).includes(id);
      if (!poseido) { error = "Todavía no lo compraste"; return; }
      u.accesorios = { ...window.ACCESORIOS_DEFAULT, ...(u.accesorios || {}), [catKey]: id };
    });
  } catch (e) { error = "No se pudo equipar"; console.error(e); }
  if (error) { mostrarToast(error, "❌"); return; }
  _previewOverride = null;
  await Storage.publicarPerfil();
  if (typeof UISfx !== "undefined") UISfx.equip();
  await actualizarPerfil();
  await renderizarTienda();
  mostrarToast(`${item.nombre} equipado`, "✅");
}

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
  UISfx.win(); overlay.classList.add("visible");
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

// ── ALTOVICIO V8: SONIDOS UI, HERO BANNER Y MISIONES DIARIAS ──────────────
const UISfx = (() => {
  let ctx = null;
  function tone(f, dur, type='triangle', delay=0, vol=0.12) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctx) ctx = new AC();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator(), g = ctx.createGain();
      const t = ctx.currentTime + delay;
      osc.type = type; osc.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + dur + 0.02);
    } catch(e) {}
  }
  return {
    coin: () => { tone(988, 0.08, 'square', 0, 0.1); tone(1319, 0.22, 'square', 0.07, 0.12); },
    win: () => { [523, 659, 784, 1047].forEach((n, i) => tone(n, 0.16, 'triangle', i * 0.08, 0.14)); },
    equip: () => { tone(587, 0.07, 'sine', 0, 0.1); tone(880, 0.12, 'sine', 0.06, 0.1); }
  };
})();

async function renderizarHeroYMisiones() {
  const heroEl = document.getElementById("av-hero-panel");
  const misEl = document.getElementById("av-misiones-panel");
  if (!heroEl || !misEl) return;

  const u = await Storage.getUsuario();
  const hoy = new Date().toISOString().slice(0, 10);
  const bonusReclamado = localStorage.getItem("av_bonus_diario") === hoy;

  heroEl.innerHTML = `
    <div class="av-hero">
      <div class="av-hero-info">
        <span class="av-hero-badge">🔥 PORTAL OFICIAL ALTOVICIO</span>
        <div class="av-hero-title">¡Viciá con amigos sin descargar nada!</div>
        <div class="av-hero-desc">Salas online en tiempo real para Impostor, Gartic Phone, 8 Ball Pool y Ajedrez + 45 arcades con ranking global y VicioCoins.</div>
      </div>
      <div class="av-hero-actions">
        <button class="av-btn-glow primary" onclick="jugarAlAzar()">🎲 JUEGO AL AZAR</button>
        <a class="av-btn-glow secondary" href="pages/juego.html?id=game-022">🕵️ IMPOSTOR ONLINE</a>
        <button class="av-btn-glow bonus" onclick="reclamarBonusDiario()" ${bonusReclamado ? "disabled style='opacity:0.5;cursor:default'" : ""}>
          ${bonusReclamado ? "✅ BONUS RECLAMADO" : "🎁 +50 VICIOCOINS GRATIS"}
        </button>
      </div>
    </div>
  `;

  const reclamadas = JSON.parse(localStorage.getItem("av_misiones_" + hoy) || "[]");
  const misiones = [
    { id: "m_jugar1", titulo: "Calentando motores", desc: "Jugá al menos 1 partida", actual: Math.min(u.juegos_jugados || 0, 1), meta: 1, premio: 25 },
    { id: "m_fav3",   titulo: "Curador del Vicio",  desc: "Marcá 3 juegos favoritos", actual: Math.min((u.favoritos || []).length, 3), meta: 3, premio: 40 },
    { id: "m_xp300",  titulo: "Subiendo de Rango",  desc: "Alcanzá 300 XP totales",   actual: Math.min(u.xp || 0, 300), meta: 300, premio: 60 }
  ];

  misEl.innerHTML = `<div class="av-misiones-bar">` + misiones.map(m => {
    const pct = Math.min(100, Math.round((m.actual / m.meta) * 100));
    const ya = reclamadas.includes(m.id);
    const lista = m.actual >= m.meta && !ya;
    return `
      <div class="av-mision-card ${lista ? 'lista' : ''}">
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:14px;color:#fff">${m.titulo} <span style="color:var(--color-accent);font-size:12px">+${m.premio} 🪙</span></div>
          <div style="font-size:12px;color:var(--color-muted)">${m.desc} (${m.actual}/${m.meta})</div>
          <div class="av-mision-prog"><div class="av-mision-fill" style="width:${pct}%"></div></div>
        </div>
        ${ya
          ? `<button class="av-mision-btn done" disabled>✓ LISTO</button>`
          : (lista
              ? `<button class="av-mision-btn claim" onclick="reclamarMision('${m.id}', ${m.premio})">RECLAMAR</button>`
              : `<span style="font-family:'Orbitron',sans-serif;font-size:11px;color:var(--color-muted)">${pct}%</span>`
            )
        }
      </div>`;
  }).join("") + `</div>`;
}

function jugarAlAzar() {
  const locales = juegos.filter(j => j.tipo === "local");
  const elegido = locales[Math.floor(Math.random() * locales.length)] || juegos[0];
  if (elegido) window.location.href = `pages/juego.html?id=${encodeURIComponent(elegido.id)}`;
}

async function reclamarBonusDiario() {
  const hoy = new Date().toISOString().slice(0, 10);
  if (localStorage.getItem("av_bonus_diario") === hoy) return;
  localStorage.setItem("av_bonus_diario", hoy);
  await Storage.sumarMonedas(50);
  await Storage.sumarXP(25);
  UISfx.coin();
  mostrarToast("¡Bonus diario: +50 VicioCoins y +25 XP!", "🎁");
  await actualizarPerfil();
  await renderizarHeroYMisiones();
}

async function reclamarMision(id, premio) {
  const hoy = new Date().toISOString().slice(0, 10);
  const key = "av_misiones_" + hoy;
  const reclamadas = JSON.parse(localStorage.getItem(key) || "[]");
  if (reclamadas.includes(id)) return;
  reclamadas.push(id);
  localStorage.setItem(key, JSON.stringify(reclamadas));
  await Storage.sumarMonedas(premio);
  await Storage.sumarXP(30);
  UISfx.win();
  mostrarToast(`¡Misión completada! +${premio} VicioCoins`, "🏆");
  await actualizarPerfil();
  await renderizarHeroYMisiones();
}

document.addEventListener("DOMContentLoaded", iniciarApp);
