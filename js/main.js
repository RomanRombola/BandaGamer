// main.js — AltoVicio V14


const NOMBRES_NIVEL = [
  "", "Novato", "Jugador", "Veterano", "Experto", "Élite",
  "Leyenda", "Maestro", "Campeón", "Gran Maestro", "Supremo"
];

const LOGROS = [
  { id: "primer_juego",    icon: "🎮", nombre: "Primera Partida",  desc: "Jugaste tu primer juego",       condicion: u => u.juegos_jugados >= 1 },
  { id: "cinco_juegos",    icon: "🕹️", nombre: "En Calentamiento", desc: "Jugaste 5 partidas",            condicion: u => u.juegos_jugados >= 5 },
  { id: "veinte_juegos",   icon: "👾", nombre: "Gamer Dedicado",   desc: "Jugaste 20 partidas",           condicion: u => u.juegos_jugados >= 20 },
  { id: "nivel_3",         icon: "⭐", nombre: "Veterano",         desc: "Llegaste al nivel 3",           condicion: u => u.nivel >= 3 },
  { id: "nivel_5",         icon: "🔥", nombre: "Élite",            desc: "Llegaste al nivel 5",           condicion: u => u.nivel >= 5 },
  { id: "nivel_10",        icon: "💎", nombre: "Supremo",          desc: "Alcanzaste el nivel máximo",    condicion: u => u.nivel >= 10 },
  { id: "mil_xp",          icon: "✨", nombre: "Mil Puntos",       desc: "Acumulaste 1000 XP",            condicion: u => u.xp >= 1000 },
  { id: "cinco_mil_xp",    icon: "⚡", nombre: "Power Gamer",      desc: "Acumulaste 5000 XP",            condicion: u => u.xp >= 5000 },
  { id: "cien_monedas",    icon: "🪙", nombre: "Ahorrista",        desc: "Tenés 100 VicioCoins",          condicion: u => u.monedas >= 100 },
  { id: "primer_favorito", icon: "❤️", nombre: "Me Gusta",         desc: "Marcaste tu primer favorito",   condicion: u => (u.favoritos || []).length >= 1 },
  { id: "cinco_favoritos", icon: "💝", nombre: "Coleccionista",    desc: "Tenés 5 juegos favoritos",      condicion: u => (u.favoritos || []).length >= 5 },
  { id: "hora_jugada",     icon: "⏰", nombre: "Una Hora",         desc: "Jugaste 1 hora en total",       condicion: u => u.tiempo_jugado_total >= 3600 },
  { id: "diez_horas",      icon: "🏆", nombre: "Sin Vida Social",  desc: "Jugaste 10 horas en total",     condicion: u => u.tiempo_jugado_total >= 36000 }
];


let categoriaActiva = "todos";
let terminoBusqueda = "";

async function loginConGoogle() {
  if (!Storage.FIREBASE_OK) {
    mostrarToast("No se pudo conectar con Google. Revisá tu conexión o desactivá el bloqueador de anuncios.", "⚠️");
    return;
  }
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

function loginComoInvitado() {
  const input = document.getElementById("guest-name-input");
  const nombre = input ? input.value.trim().slice(0, 20) : "";
  if (!nombre || nombre.length < 2) {
    mostrarToast("Ingresá un nombre (mínimo 2 caracteres)", "⚠️");
    if (input) input.focus();
    return;
  }
  const u = { ...Storage.USUARIO_DEFAULT, nombre, uid: "", esInvitado: true };
  localStorage.setItem("bandagamer_usuario_v2", JSON.stringify(u));
  ocultarPantallaLogin();
  iniciarInterfaz(u);
  verificarLogros();
  mostrarToast(`¡Bienvenido a AltoVicio, ${nombre}!`, "🎮");
}

async function cerrarSesion() {
  const user = Storage.auth.currentUser;
  try { if (typeof Social !== "undefined") Social.goOffline(); } catch (e) {}
  if (user) {
    await Storage.auth.signOut();
  } else {
    localStorage.removeItem("bandagamer_usuario_v2");
    localStorage.removeItem("bandagamer_visitas_v2");
  }
  mostrarToast("Sesión cerrada", "👋");
  setTimeout(() => location.reload(), 800);
}

async function iniciarApp() {
  Storage.auth.onAuthStateChanged(async (user) => {
    if (user) {
      await Storage.migrarLocalAFirestore();
      const usuario = await Storage.getUsuario();
      Storage.publicarPerfil();
      ocultarPantallaLogin();
      iniciarInterfaz(usuario);
      verificarLogros();
    } else {
      const raw = localStorage.getItem("bandagamer_usuario_v2");
      if (raw) {
        try {
          const u = JSON.parse(raw);
          if (u && u.nombre && u.nombre.length >= 2) {
            ocultarPantallaLogin();
            iniciarInterfaz(u);
            verificarLogros();
            return;
          }
        } catch (e) {}
      }
      mostrarPantallaLogin();
    }
  });
}

function iniciarInterfaz(usuario) {
  configurarFavoritosDelegado();
  actualizarPerfil();
  renderizarHeroYMisiones();
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

async function renderizarDestacados() {
  const contenedor = document.getElementById("destacados-grid");
  if (!contenedor) return;
  // Antes eran los primeros 6 del catálogo (los mismos que aparecen arriba de todo en
  // "Todos los juegos"). Ahora: primero los online con amigos y después los renovados.
  const locales = juegos.filter(j => j.tipo === "local");
  const online  = locales.filter(j => j.multi);
  const nuevos  = locales.filter(j => !j.multi && j.nuevo);
  const destacados = [...online, ...nuevos.slice(6), ...nuevos].filter((j, i, arr) => arr.indexOf(j) === i).slice(0, 6);
  contenedor.innerHTML = await crearCardsHTML(destacados);
}

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

async function actualizarPerfil() {
  const u = await Storage.getUsuario();
  if (typeof Social !== "undefined" && u.uid) {
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
  if (el("perfil-avatar"))      el("perfil-avatar").innerHTML        = renderAvatar(u.avatar || "e_smile", u.accesorios, 34, u.fotoPerfil);
  if (el("xp-bar-fill"))        el("xp-bar-fill").style.width        = pct + "%";
  if (el("xp-texto"))           el("xp-texto").textContent           = maxNivel ? "NIVEL MÁXIMO" : `${xpAct}/1000 XP`;
  if (el("perfil-nivel-texto")) el("perfil-nivel-texto").textContent = NOMBRES_NIVEL[u.nivel] || "";
}

function iniciarNotificacionesSociales(uid) {
  if (typeof Notifs !== "undefined" && Storage.auth.currentUser) Notifs.iniciar(uid);
}
function showSocialToast(text, gotoUrl) {
  if (typeof Notifs !== "undefined") Notifs.toast(text, gotoUrl);
}

async function renderizarGrid(lista) {
  const grid = document.getElementById("games-grid");
  if (!grid) return;
  if (!lista.length) {
    grid.innerHTML = terminoBusqueda
      ? `<div class="sin-resultados"><p>No encontramos juegos para "<strong>${esc(terminoBusqueda)}</strong>"${categoriaActiva !== "todos" ? " en esta categoría" : ""}.</p></div>`
      : `<div class="sin-resultados"><p>No hay juegos en esta categoría.</p></div>`;
    return;
  }
  grid.innerHTML = await crearCardsHTML(lista);
}

async function crearCardsHTML(lista) {
  const [u, visitas] = await Promise.all([Storage.getUsuario(), Storage.getVisitas()]);
  const favs = new Set(u.favoritos || []);
  return lista.map((j, i) => crearCardHTML(j, i, favs.has(j.id), visitas[j.id] || 0)).join("");
}

function crearCardHTML(juego, indice, esFav, visitas) {
  const tieneThumb = juego.thumbnail && juego.thumbnail.length > 0;
  const badgeTipo  = { iframe: "", local: '<span class="badge badge-local">LOCAL</span>', emulador: '<span class="badge badge-emulador">RETRO</span>' }[juego.tipo] || "";
  const tienePreview = juego.tipo === "local" && juego.embed_url;
  const tieneVideo = juego.preview_video;
  const nombre = esc(juego.nombre);
  const sep = juego.embed_url && juego.embed_url.includes("?") ? "&" : "?";

  return `
    <a class="game-card" href="pages/juego.html?id=${esc(juego.id)}"
       ${tieneVideo ? `data-preview-video="${esc(juego.preview_video)}"` : (tienePreview ? `data-preview="pages/${esc(juego.embed_url)}${sep}preview=1"` : "")}
       onmouseenter="iniciarPreview(this)"
       onmouseleave="detenerPreview(this)">
      <div class="card-thumb">
        <div class="card-thumb-static">
          ${tieneThumb ? `<img src="${esc(juego.thumbnail)}" alt="${nombre}" loading="lazy" onerror="this.style.display='none';this.parentNode.querySelector('.thumb-fallback').style.display='flex'">` : ""}
          <div class="thumb-fallback" style="display:${tieneThumb ? 'none' : 'flex'}">
            <span class="thumb-fallback-nombre">${nombre}</span>
          </div>
        </div>
        <div class="card-preview-wrap" style="display:none">
          <div class="card-preview-label">GAMEPLAY</div>
        </div>
        <button class="btn-favorito ${esFav ? 'activo' : ''}" data-id="${esc(juego.id)}"
                title="${esFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">${esFav ? '♥' : '♡'}</button>
        ${badgeTipo}
      </div>
      <div class="card-info">
        <span class="card-nombre">${nombre}</span>
        <div class="card-meta">
          <span class="card-categoria">${esc(juego.categoria)}</span>
          ${visitas > 0 ? `<span class="card-visitas">${visitas} jugadas</span>` : ""}
        </div>
      </div>
    </a>`;
}

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
      document.querySelectorAll(`.btn-favorito[data-id="${btn.dataset.id}"]`).forEach(b => {
        b.classList.toggle("activo", ahora);
        b.textContent = ahora ? "♥" : "♡";
      });
      if (!ahora) {
        const cont = btn.closest("#favoritos-grid");
        if (cont) {
          const card = btn.closest(".game-card");
          if (card) card.remove();
          if (!cont.children.length) renderizarFavoritos();
        }
      }
      renderizarHeroYMisiones();
      verificarLogros();
    } catch (err) {
      mostrarToast("No se pudo guardar el favorito", "❌");
    } finally {
      delete btn.dataset.busy;
    }
  }, true);
}

function iniciarPreview(card) {
  const videoUrl = card.dataset.previewVideo;
  const iframeUrl = card.dataset.preview;
  if (!videoUrl && !iframeUrl) return;

  clearTimeout(card._previewTimer);
  clearTimeout(card._hideTimer);
  card._previewTimer = setTimeout(() => {
    const wrap = card.querySelector(".card-preview-wrap");
    const staticDiv = card.querySelector(".card-thumb-static");
    if (!wrap || !staticDiv) return;

    if (videoUrl) {
      if (!wrap.querySelector("video")) {
        const vid = document.createElement("video");
        vid.src = videoUrl;
        vid.autoplay = true;
        vid.loop = true;
        vid.muted = true;
        vid.playsInline = true;
        vid.style.cssText = "width:100%;height:100%;object-fit:cover;pointer-events:none;";
        wrap.insertBefore(vid, wrap.firstChild);
      } else {
        const vid = wrap.querySelector("video");
        vid.currentTime = 0;
        vid.play().catch(() => {});
      }
    } else {
      if (!wrap.querySelector("iframe")) {
        const iframe = document.createElement("iframe");
        iframe.src = iframeUrl;
        iframe.style.cssText = "width:100%;height:100%;border:none;pointer-events:none;";
        // Sin sandbox: son juegos propios del mismo dominio y "allow-scripts allow-same-origin"
        // juntos no protegían nada (Chrome lo avisaba en consola en cada vista previa).
        iframe.setAttribute("tabindex", "-1");
        iframe.setAttribute("loading", "lazy");
        wrap.insertBefore(iframe, wrap.firstChild);
      }
    }

    staticDiv.style.opacity = "0";
    wrap.style.display = "block";
    wrap.style.opacity = "1";
  }, 220);
}

function detenerPreview(card) {
  clearTimeout(card._previewTimer);
  const wrap = card.querySelector(".card-preview-wrap");
  const staticDiv = card.querySelector(".card-thumb-static");
  if (wrap) {
    const vid = wrap.querySelector("video");
    if (vid) vid.pause();
    wrap.style.opacity = "0";
    clearTimeout(card._hideTimer);
    card._hideTimer = setTimeout(() => {
      wrap.style.display = "none";
      const f = wrap.querySelector("iframe");
      if (f) f.remove();
    }, 200);
  }
  if (staticDiv) staticDiv.style.opacity = "1";
}

// Lista del catálogo según la categoría elegida Y lo escrito en el buscador.
// Antes buscar ignoraba la categoría y elegir una categoría borraba la búsqueda.
function listaFiltrada() {
  const base = buscar(terminoBusqueda);
  return categoriaActiva === "todos" ? base : base.filter(j => j.categoria === categoriaActiva);
}

function tituloCatalogo() {
  const cat = categoriaActiva === "todos" ? "" : (ETIQUETAS_CATEGORIA[categoriaActiva] || categoriaActiva);
  if (terminoBusqueda) return `Resultados para "${terminoBusqueda}"${cat ? " en " + cat : ""}`;
  return cat ? `Categoría: ${cat}` : "Todos los Juegos";
}

async function filtrarPorCategoria(categoria) {
  categoriaActiva = categoria;
  await renderizarGrid(listaFiltrada());

  document.querySelectorAll("[data-categoria]").forEach(btn => {
    btn.classList.toggle("activo", btn.dataset.categoria === categoria);
  });
  const titulo = document.getElementById("catalogo-titulo");
  if (titulo) titulo.textContent = tituloCatalogo();
}

async function filtrarPorBusqueda(termino) {
  terminoBusqueda = termino;
  await renderizarGrid(listaFiltrada());
  const titulo = document.getElementById("catalogo-titulo");
  if (titulo) titulo.textContent = tituloCatalogo();
}

function buscar(termino) {
  const t = termino.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!t) return juegos;
  return juegos.filter(j => {
    const nombre = j.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const sinTilde = x => String(x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return nombre.includes(t) || sinTilde(j.categoria).includes(t) || (j.tags || []).some(tag => sinTilde(tag).includes(t));
  });
}

const ETIQUETAS_CATEGORIA = {
  todos: "Todos los juegos", accion: "Acción", puzzle: "Puzzle y Lógica", arcade: "Arcade",
  multijugador: "Multijugador Online", carreras: "Carreras", estrategia: "Estrategia",
  casual: "Casual", aventura: "Aventura", deportes: "Deportes", retro: "Clásicos"
};

function categoriasConJuegos() {
  const usadas = new Set(juegos.map(j => j.categoria));
  return Object.keys(ETIQUETAS_CATEGORIA).filter(id => id === "todos" || usadas.has(id));
}

function renderizarSidebar() {
  const cats = categoriasConJuegos().map(id => ({ id, label: ETIQUETAS_CATEGORIA[id] }));
  const sidebar = document.getElementById("sidebar-categorias");
  if (!sidebar) return;
  sidebar.innerHTML = cats.map(c => `
    <button class="sidebar-cat ${c.id === categoriaActiva ? 'activo' : ''}" data-categoria="${c.id}">${c.label}</button>
  `).join("");
  sidebar.querySelectorAll(".sidebar-cat").forEach(btn => {
    btn.addEventListener("click", () => filtrarPorCategoria(btn.dataset.categoria));
  });
}

async function renderizarMasJugados() {
  const contenedor = document.getElementById("mas-jugados");
  if (!contenedor) return;
  const ids = await Storage.getMasJugados(5);
  if (!ids.length) {
    contenedor.innerHTML = "<p class='muted-text'>Jugá para ver aquí tus favoritos.</p>";
    return;
  }
  const lista = ids.map(id => juegos.find(j => j.id === id)).filter(Boolean);
  contenedor.innerHTML = lista.map(j => `
    <a href="pages/juego.html?id=${j.id}" class="mini-juego-link">
      <span class="mini-juego-nombre">${esc(j.nombre)}</span>
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

let _buscadorListo = false;
function configurarBuscador() {
  const input = document.getElementById("buscador");
  if (!input || _buscadorListo) return;
  _buscadorListo = true;
  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => filtrarPorBusqueda(input.value.trim()), 200);
  });
}

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
    btn.textContent = ETIQUETAS_CATEGORIA[btn.dataset.categoria] || btn.dataset.categoria;
    btn.addEventListener("click", () => filtrarPorCategoria(btn.dataset.categoria));
  });
}

function cerrarMenuMovil() {
  const navMenu = document.getElementById("nav-menu");
  const hamburger = document.getElementById("hamburger");
  if (navMenu && navMenu.classList.contains("abierto")) {
    navMenu.classList.remove("abierto");
    if (hamburger && hamburger.firstChild) hamburger.firstChild.nodeValue = "☰";
  }
}

function mostrarSeccion(seccion) {
  cerrarMenuMovil();
  window.scrollTo({ top: 0, behavior: "smooth" });
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
  if (!(u.favoritos || []).length) {
    contenedor.innerHTML = "<p class='muted-text sin-favs'>No tenés favoritos todavía. Hacé clic en ♡ en cualquier juego.</p>";
    return;
  }
  const lista = u.favoritos.map(id => juegos.find(j => j.id === id)).filter(Boolean);
  contenedor.innerHTML = await crearCardsHTML(lista);
}

async function renderizarRankingGlobal() {
  const contenedor = document.getElementById("ranking-lista");
  if (!contenedor) return;
  contenedor.innerHTML = `<div class="ranking-loading">Cargando ranking...</div>`;

  const lista = await Storage.getRankingGlobal(50);
  const miUid = Storage.auth.currentUser?.uid;

  if (!lista.length) {
    contenedor.innerHTML = `<div class="ranking-vacio">Todavía no hay jugadores en el ranking. ¡Sé el primero!</div>`;
    return;
  }

  contenedor.innerHTML = lista.map((p, i) => {
    const pos = `#${i + 1}`;
    const esSoy = p.uid === miUid;
    const nivelNombre = NOMBRES_NIVEL[p.nivel] || "";
    const avatarHtml = renderAvatar(p.avatar || "e_smile", p.accesorios, 42, p.fotoPerfil);
    const tituloBadge = renderTituloBadge(p.accesorios);
    return `
      <div class="ranking-fila ${esSoy ? "ranking-yo" : ""}" data-uid="${esc(p.uid)}" style="cursor:pointer">
        <div class="ranking-pos">${pos}</div>
        <div class="ranking-avatar" style="display:flex;align-items:center;justify-content:center;width:46px;height:46px;overflow:visible">${avatarHtml}</div>
        <div class="ranking-info">
          <div class="ranking-nombre">${esc(p.nombre)}${esSoy ? ' <span class="ranking-tu-tag">(vos)</span>' : ""}</div>
          <div class="ranking-nivel-txt">${esc(nivelNombre)} ${tituloBadge}</div>
        </div>
        <div class="ranking-xp">${(p.xp || 0).toLocaleString()} XP</div>
        <div class="ranking-nivel-badge">Nv.${Number(p.nivel) || 1}</div>
      </div>`;
  }).join("");

  contenedor.querySelectorAll(".ranking-fila").forEach(fila => {
    fila.addEventListener("click", () => verPerfilUsuario(fila.dataset.uid));
  });
}

async function verPerfilUsuario(uid) {
  const miUid = Storage.auth.currentUser?.uid;
  if (uid === miUid) { mostrarSeccion("perfil"); return; }

  let modal = document.getElementById("modal-perfil-usuario");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-perfil-usuario";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(10,14,24,0.82);backdrop-filter:blur(8px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px";
    modal.innerHTML = `<div style="background:#141b29;border:1px solid rgba(255,255,255,0.1);border-radius:22px;padding:26px;max-width:350px;width:100%;position:relative;text-align:center">
      <button onclick="document.getElementById('modal-perfil-usuario').remove()" style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.06);border:none;color:#94a3b8;padding:6px 10px;border-radius:10px;cursor:pointer">✕</button>
      <div id="mpf-avatar" style="margin-bottom:14px;display:flex;justify-content:center"></div>
      <div id="mpf-nombre" style="font-family:'Outfit',sans-serif;font-size:21px;font-weight:800;margin-bottom:4px">Cargando...</div>
      <div id="mpf-rango" style="font-size:13px;color:#00b4ff;margin-bottom:16px"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
        <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:10px">
          <div id="mpf-xp" style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:800;color:#00b4ff">0</div>
          <div style="font-size:10px;color:#94a3b8">XP</div>
        </div>
        <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:10px">
          <div id="mpf-nivel" style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:800;color:#ff6600">1</div>
          <div style="font-size:10px;color:#94a3b8">NIVEL</div>
        </div>
        <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:10px">
          <div id="mpf-juegos" style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:800;color:#10b981">0</div>
          <div style="font-size:10px;color:#94a3b8">PARTIDAS</div>
        </div>
      </div>
      <div id="mpf-acciones" style="display:flex;gap:8px;justify-content:center"></div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
  }

  try {
    const p = await Storage.getPerfilPublico(uid);
    if (!p) { modal.querySelector("#mpf-nombre").textContent = "Usuario no encontrado"; return; }
    modal.querySelector("#mpf-avatar").innerHTML = renderAvatar(p.avatar || "e_smile", p.accesorios, 84, p.fotoPerfil);
    modal.querySelector("#mpf-nombre").textContent = p.nombre || "Usuario";
    modal.querySelector("#mpf-rango").innerHTML = esc(NOMBRES_NIVEL[p.nivel] || "") + " " + renderTituloBadge(p.accesorios);
    modal.querySelector("#mpf-xp").textContent = (p.xp || 0).toLocaleString();
    modal.querySelector("#mpf-nivel").textContent = p.nivel || 1;
    modal.querySelector("#mpf-juegos").textContent = p.juegos_jugados || 0;
  } catch (e) {
    console.error("Error cargando perfil:", e);
  }
}

async function renderizarPerfil() {
  const u = await Storage.getUsuario();
  const contenedor = document.getElementById("perfil-contenido");
  if (!contenedor) return;

  const maxNivel = (u.nivel || 1) >= 10;
  const xpAct = maxNivel ? 1000 : (u.xp || 0) % 1000;
  const pct   = (xpAct / 1000) * 100;
  const tiempoH = Math.floor((u.tiempo_jugado_total || 0) / 3600);
  const tiempoM = Math.floor(((u.tiempo_jugado_total || 0) % 3600) / 60);
  const logrosCount = (u.logros || []).length;
  const esInvitado = u.esInvitado || !u.uid;

  contenedor.innerHTML = `
    <div class="perfil-card">
      <div class="perfil-avatar-grande" title="Cambiar foto de perfil" onclick="document.getElementById('foto-input').click()" style="cursor:pointer;position:relative;padding:8px">
        ${renderAvatar(u.avatar || "e_smile", u.accesorios, 92, u.fotoPerfil)}
        <div style="position:absolute;bottom:2px;right:2px;background:#ff6600;color:#fff;border-radius:99px;padding:3px 8px;font-size:10px;font-weight:800;z-index:10">FOTO</div>
      </div>
      <input type="file" id="foto-input" accept="image/*" style="display:none" onchange="cambiarFotoPerfil(this)">
      <div class="perfil-datos">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
          <div class="perfil-nombre-grande" id="perfil-nombre-display">${esc(u.nombre)}</div>
          <button onclick="editarNombre()" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:var(--color-muted);font-size:11px;padding:5px 10px;border-radius:8px;cursor:pointer;font-weight:700">Editar</button>
        </div>
        <div id="nombre-edit-form" style="display:none;margin-bottom:8px">
          <div style="display:flex;gap:6px">
            <input type="text" id="nombre-nuevo-input" value="${esc(u.nombre)}" maxlength="20"
              style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,102,0,0.4);color:#fff;font-size:14px;font-weight:700;padding:8px 12px;border-radius:10px;outline:none;">
            <button onclick="guardarNombre()" style="background:#ff6600;border:none;color:#fff;font-size:12px;font-weight:800;padding:8px 14px;border-radius:10px;cursor:pointer">Guardar</button>
          </div>
        </div>
        <div class="perfil-rango">${esc(NOMBRES_NIVEL[u.nivel] || "")} ${renderTituloBadge(u.accesorios)}</div>
        ${esInvitado ? `<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:8px 12px;font-size:12px;color:var(--color-muted);margin-top:8px">Modo invitado — <button onclick="loginConGoogle()" style="background:none;border:none;color:#00b4ff;cursor:pointer;font-size:12px;font-weight:700">Conectá con Google</button> para sincronizar en la nube</div>` : ""}
        <div class="perfil-xp-barra-wrap" style="margin-top:12px">
          <div class="perfil-xp-barra"><div class="perfil-xp-fill" style="width:${pct}%"></div></div>
          <span class="perfil-xp-num">${maxNivel ? "NIVEL MÁXIMO" : xpAct + " / 1000 XP"}</span>
        </div>
      </div>
    </div>
    <div class="perfil-stats-grid">
      <div class="pstat-card"><span class="pstat-val">${(u.xp || 0).toLocaleString()}</span><span class="pstat-lbl">XP Total</span></div>
      <div class="pstat-card"><span class="pstat-val">${(u.monedas || 0).toLocaleString()}</span><span class="pstat-lbl">VicioCoins</span></div>
      <div class="pstat-card"><span class="pstat-val">${u.juegos_jugados || 0}</span><span class="pstat-lbl">Partidas</span></div>
      <div class="pstat-card"><span class="pstat-val">${tiempoH}h ${tiempoM}m</span><span class="pstat-lbl">Tiempo jugado</span></div>
      <div class="pstat-card"><span class="pstat-val">${(u.favoritos || []).length}</span><span class="pstat-lbl">Favoritos</span></div>
      <div class="pstat-card"><span class="pstat-val">${logrosCount}/${LOGROS.length}</span><span class="pstat-lbl">Logros</span></div>
    </div>
    <button class="btn-cerrar-sesion" onclick="cerrarSesion()">CERRAR SESIÓN</button>
  `;
}

async function renderizarLogros() {
  const u = await Storage.getUsuario();
  const contenedor = document.getElementById("logros-grid");
  if (!contenedor) return;

  contenedor.innerHTML = LOGROS.map(l => {
    const tiene = (u.logros || []).includes(l.id);
    return `
      <div class="logro-card ${tiene ? "logro-desbloqueado" : "logro-bloqueado"}">
        <div class="logro-info">
          <div class="logro-nombre">${esc(l.nombre)}</div>
          <div class="logro-desc">${esc(l.desc)}</div>
        </div>
        ${tiene ? '<div class="logro-check" style="color:#10b981;font-weight:900">COMPLETADO</div>' : '<div class="logro-lock" style="color:#64748b;font-size:12px">BLOQUEADO</div>'}
      </div>`;
  }).join("");
}

let _verificandoLogros = false;
async function verificarLogros() {
  if (_verificandoLogros) return;
  _verificandoLogros = true;
  try { await _verificarLogros(); } finally { _verificandoLogros = false; }
}
async function _verificarLogros() {
  const u = await Storage.getUsuario();
  u.logros = u.logros || [];
  u.favoritos = u.favoritos || [];
  for (const logro of LOGROS) {
    if (!u.logros.includes(logro.id) && logro.condicion(u)) {
      const nuevo = await Storage.desbloquearLogro(logro.id);
      if (nuevo) {
        UISfx.win();
        mostrarToast(`Logro desbloqueado: ${logro.nombre}`, "🏆");
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }
}

// ── TIENDA ESTILO PLATO (VICIOSHOP STUDIO V12) ────────────────────────────
let _catTiendaActiva = "todos";
let _previewOverride = null;

const CATEGORIAS_TIENDA = [
  { key: "todos",    plural: "todos",     label: "Todo el Catálogo" },
  { key: "marco",    plural: "marcos",    label: "Marcos HD" },
  { key: "efecto",   plural: "efectos",   label: "Auras" },
  { key: "sombrero", plural: "sombreros", label: "Sombreros y Cascos" },
  { key: "lentes",   plural: "lentes",    label: "Lentes y Visores" },
  { key: "bigote",   plural: "bigotes",   label: "Boca y Mate" },
  { key: "mascota",  plural: "mascotas",  label: "Mascotas" },
  { key: "titulo",   plural: "titulos",   label: "Títulos" },
  { key: "burbuja",  plural: "burbujas",  label: "Burbujas de Chat" },
  { key: "emoji",    plural: "emojis",    label: "Avatares Base" }
];

async function renderizarTienda() {
  const u = await Storage.getUsuario();
  const contenedor = document.getElementById("tienda-grid");
  if (!contenedor) return;
  contenedor.style.display = "block";

  const comprados = u.accesorios_comprados || [];
  const baseEquip = { ...ACCESORIOS_DEFAULT, ...(u.accesorios || {}) };
  const lookActual = _previewOverride ? { ...baseEquip, ..._previewOverride } : baseEquip;

  const monEl = document.getElementById("tienda-monedas");
  if (monEl) monEl.textContent = (u.monedas || 0).toLocaleString();

  const tituloHtml = renderTituloBadge(lookActual) || '<span style="font-size:11px;color:var(--color-muted)">Sin título equipado</span>';
  const bubbleCss  = getChatBubbleCSS(lookActual);

  const tabsHtml = CATEGORIAS_TIENDA.map(c =>
    `<button class="plato-tab-btn ${_catTiendaActiva === c.key ? 'activo' : ''}" onclick="cambiarCatTienda('${c.key}')">${c.label}</button>`
  ).join("");

  const catsAMostrar = _catTiendaActiva === "todos"
    ? CATEGORIAS_TIENDA.filter(c => c.key !== "todos")
    : CATEGORIAS_TIENDA.filter(c => c.key === _catTiendaActiva);

  const seccionesHtml = catsAMostrar.map(cat => {
    const items = ACCESORIOS[cat.plural] || [];
    const equipadoId = baseEquip[cat.key] || (items[0] && items[0].id);
    const cards = items.map(item => {
      const poseido  = item.precio === 0 || comprados.includes(item.id);
      const equipado = equipadoId === item.id;
      const bloq     = (u.nivel || 1) < item.reqNivel;
      const puede    = !bloq && (u.monedas || 0) >= item.precio;
      const rar      = item.rareza || "comun";

      const mockAcc = { ...baseEquip, [cat.key]: item.id };
      let previewHtml = "";
      if (cat.key === "titulo") {
        previewHtml = `<div style="min-height:58px;display:flex;align-items:center;justify-content:center">${item.texto ? renderTituloBadge(mockAcc) : '<span style="color:#64748b;font-size:12px">Ninguno</span>'}</div>`;
      } else if (cat.key === "burbuja") {
        previewHtml = `<div style="min-height:58px;display:flex;align-items:center;justify-content:center"><div style="padding:6px 12px;border-radius:12px;font-size:11px;${item.css}">¡Hola amigos!</div></div>`;
      } else {
        previewHtml = `<div style="margin:8px 0">${renderAvatar(u.avatar || "e_smile", mockAcc, 58, u.fotoPerfil)}</div>`;
      }

      let btnAccion = "";
      if (equipado)     btnAccion = `<button class="av-btn av-btn-equipado" disabled>EQUIPADO</button>`;
      else if (poseido) btnAccion = `<button class="av-btn av-btn-equipar" onclick="equiparAccesorio('${cat.key}','${item.id}')">EQUIPAR</button>`;
      else if (bloq)    btnAccion = `<button class="av-btn av-btn-bloqueado" disabled>Nivel ${item.reqNivel}</button>`;
      else              btnAccion = `<button class="av-btn av-btn-comprar ${puede ? '' : 'av-sin-fondos'}" onclick="comprarAccesorio('${item.id}','${cat.key}')" ${puede ? '' : 'disabled'}>${item.precio} VicioCoins</button>`;

      const btnProbar = !equipado
        ? `<button class="av-btn av-btn-probar" onclick="probarEnEstudio('${cat.key}','${item.id}')">Probar en mi avatar</button>`
        : "";

      return `<div class="tienda-card ${equipado ? 'tienda-card-equipado' : ''} ${bloq ? 'tienda-card-bloqueado' : ''}">
        <span class="rareza-tag rareza-${rar}">${rar}</span>
        ${previewHtml}
        <div class="tienda-avatar-nombre">${esc(item.nombre)}</div>
        ${btnAccion}
        ${btnProbar}
      </div>`;
    }).join("");

    return `<div style="margin-bottom:26px">
      <div style="font-family:'Outfit',sans-serif;font-size:14px;font-weight:800;color:#fff;margin-bottom:12px">${cat.label}</div>
      <div class="tienda-grid">${cards}</div>
    </div>`;
  }).join("");

  contenedor.innerHTML = `
    <div class="plato-studio">
      <div class="plato-stage-box">
        <div style="font-family:'Outfit',sans-serif;font-size:11px;font-weight:800;color:var(--color-accent)">TU AVATAR EN VIVO</div>
        <div id="studio-avatar-stage" style="padding:14px 0">
          ${renderAvatar(u.avatar || "e_smile", lookActual, 96, u.fotoPerfil)}
        </div>
        <div style="font-family:'Outfit',sans-serif;font-weight:900;font-size:16px;color:#fff">${esc(u.nombre || "Jugador")}</div>
        <div>${tituloHtml}</div>
        ${_previewOverride ? `<span style="font-size:11px;color:#38bdf8">Vista previa activa</span>` : ""}
      </div>
      <div class="plato-controls-box">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
          <div>
            <div style="font-family:'Outfit',sans-serif;font-size:16px;font-weight:800;color:#fff">Estudio de Personalización HD</div>
            <div style="font-size:13px;color:var(--color-muted)">Todos los accesorios son ilustraciones vectoriales que se adaptan sobre tu foto de perfil o avatar.</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="av-btn-glow bonus" style="padding:8px 14px;font-size:12px" onclick="resetearAccesorios()">Restaurar por defecto</button>
          </div>
        </div>
        <div class="plato-sliders">
          <label class="plato-slider-row">
            <span>Posición vertical sobre tu foto (${lookActual.offsetY || 0}px)</span>
            <input type="range" min="-20" max="20" value="${lookActual.offsetY || 0}" onchange="ajustarCalibracion('offsetY', this.value)">
          </label>
          <label class="plato-slider-row">
            <span>Escala de accesorios (${lookActual.scale || 100}%)</span>
            <input type="range" min="75" max="135" value="${lookActual.scale || 100}" onchange="ajustarCalibracion('scale', this.value)">
          </label>
        </div>
        <div>
          <div style="font-size:11px;color:var(--color-muted);margin-bottom:4px;font-weight:700">VISTA PREVIA DE TU BURBUJA DE CHAT:</div>
          <div class="plato-chat-preview" style="${bubbleCss}">¡Sale partida con amigos en AltoVicio!</div>
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
  UISfx.equip();
  renderizarTienda();
}

async function resetearAccesorios() {
  _previewOverride = null;
  await Storage.actualizarUsuario(u => {
    u.accesorios = { ...ACCESORIOS_DEFAULT };
  });
  await Storage.publicarPerfil();
  await actualizarPerfil();
  await renderizarTienda();
  mostrarToast("Accesorios restaurados", "✅");
}

async function ajustarCalibracion(campo, valor) {
  const num = Number(valor) || 0;
  _previewOverride = null;
  await Storage.actualizarUsuario(u => {
    u.accesorios = { ...ACCESORIOS_DEFAULT, ...(u.accesorios || {}), [campo]: num };
  });
  await Storage.publicarPerfil();
  await actualizarPerfil();
  await renderizarTienda();
}

function buscarAccesorio(id) {
  for (const lista of Object.values(ACCESORIOS)) {
    const it = lista.find(a => a.id === id);
    if (it) return it;
  }
  return null;
}

async function comprarAccesorio(id, catKey) {
  const item = buscarAccesorio(id);
  if (!item || !ACCESORIOS_DEFAULT.hasOwnProperty(catKey)) {
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
      u.accesorios = { ...ACCESORIOS_DEFAULT, ...(u.accesorios || {}), [catKey]: id };
    });
  } catch (e) { error = "No se pudo completar la compra"; console.error(e); }
  if (error) { mostrarToast(error, "❌"); return; }
  _previewOverride = null;
  await Storage.publicarPerfil();
  UISfx.coin();
  await actualizarPerfil();
  await renderizarTienda();
  mostrarToast(`¡Compraste y equipaste ${item.nombre}!`, "🎉");
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
  _previewOverride = null;
  await Storage.publicarPerfil();
  UISfx.equip();
  await actualizarPerfil();
  await renderizarTienda();
  mostrarToast(`${item.nombre} equipado`, "✅");
}

function editarNombre() {
  const form = document.getElementById("nombre-edit-form");
  const btn  = document.getElementById("nombre-nuevo-input");
  if (form) form.style.display = form.style.display === "none" ? "block" : "none";
  if (btn) btn.focus();
}

async function guardarNombre() {
  const input = document.getElementById("nombre-nuevo-input");
  const nombre = input ? input.value.trim().replace(/\s+/g, " ").slice(0, 20) : "";
  if (!nombre || nombre.length < 2) { mostrarToast("Nombre muy corto", "⚠️"); return; }
  try {
    await Storage.actualizarUsuario(u => { u.nombre = nombre; });
  } catch (e) { mostrarToast("No se pudo guardar el nombre", "❌"); return; }
  await Storage.publicarPerfil();
  await actualizarPerfil();
  await renderizarPerfil();
  mostrarToast("Nombre actualizado", "✅");
}

async function cambiarFotoPerfil(input) {
  const file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { mostrarToast("Seleccioná una imagen", "⚠️"); return; }
  if (file.size > 8 * 1024 * 1024) { mostrarToast("La imagen es muy pesada (máx. 8 MB)", "⚠️"); return; }

  const falla = () => mostrarToast("No se pudo leer la imagen", "❌");
  const reader = new FileReader();
  reader.onerror = falla;
  reader.onload = (e) => {
    const img = new Image();
    img.onerror = falla;
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 200; canvas.height = 200;
      const ctx2 = canvas.getContext("2d");
      const size = Math.min(img.width, img.height);
      const ox = (img.width - size) / 2;
      const oy = (img.height - size) / 2;
      ctx2.drawImage(img, ox, oy, size, size, 0, 0, 200, 200);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
      try {
        await Storage.actualizarUsuario(u => { u.fotoPerfil = dataUrl; });
      } catch (err) { mostrarToast("No se pudo guardar la foto", "❌"); return; }
      input.value = "";
      await Storage.publicarPerfil();
      await actualizarPerfil();
      await renderizarPerfil();
      mostrarToast("Foto de perfil actualizada", "📷");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Antes esta función existía pero nadie la llamaba: subir de nivel con el bonus o las
// misiones no mostraba nada. Ahora la usan los premios del inicio.
function mostrarOverlayNivel(nombreNivel) {
  const overlay = document.getElementById("overlay-nivel");
  if (!overlay) return;
  overlay.querySelector(".overlay-nivel-nombre").textContent = nombreNivel;
  UISfx.win();
  overlay.classList.add("visible");
  setTimeout(() => { overlay.classList.remove("visible"); verificarLogros(); }, 3000);
}

function mostrarToast(mensaje, icon = "") {
  const container = document.getElementById("toast-container") || crearToastContainer();
  const toast = document.createElement("div");
  toast.className = "toast-notif";
  const m = document.createElement("span");
  m.textContent = (icon ? icon + " " : "") + mensaje;
  toast.append(m);
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function crearToastContainer() {
  const c = document.createElement("div");
  c.id = "toast-container";
  c.style.cssText = "position:fixed;top:76px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none";
  document.body.appendChild(c);
  return c;
}

const UISfx = (() => {
  let ctx = null;
  function tone(f, dur, type = "triangle", delay = 0, vol = 0.12) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctx) ctx = new AC();
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator(), g = ctx.createGain();
      const t = ctx.currentTime + delay;
      osc.type = type; osc.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + dur + 0.02);
    } catch (e) {}
  }
  return {
    coin:  () => { tone(988, 0.08, "sine", 0, 0.1); tone(1319, 0.22, "sine", 0.07, 0.12); },
    win:   () => { [523, 659, 784, 1047].forEach((n, i) => tone(n, 0.16, "triangle", i * 0.08, 0.14)); },
    equip: () => { tone(587, 0.07, "sine", 0, 0.1); tone(880, 0.12, "sine", 0.06, 0.1); }
  };
})();

async function renderizarHeroYMisiones() {
  const heroEl = document.getElementById("av-hero-panel");
  const misEl  = document.getElementById("av-misiones-panel");
  if (!heroEl || !misEl) return;

  // El estado diario vive en la cuenta (Firestore) o en el perfil del invitado,
  // ya no en claves sueltas del navegador.
  const { bonusReclamado, misiones } = await Storage.getEstadoDiario();
  const totalJuegos = juegos.length;

  heroEl.innerHTML = `
    <div class="av-hero">
      <div class="av-hero-info">
        <span class="av-hero-badge">PORTAL OFICIAL ALTOVICIO</span>
        <div class="av-hero-title">Jugá y competí con amigos sin descargar nada</div>
        <div class="av-hero-desc">Salas multijugador en tiempo real para Impostor, Gartic Phone, 8 Ball Pool y Ajedrez, más de ${Math.floor((totalJuegos - 1) / 5) * 5} juegos con ranking global y personalización HD.</div>
      </div>
      <div class="av-hero-actions">
        <button class="av-btn-glow primary" onclick="mostrarSeccion('tienda')">Personalizar Avatar</button>
        <a class="av-btn-glow secondary" href="pages/juego.html?id=game-022">Impostor Online</a>
        <button class="av-btn-glow bonus" onclick="reclamarBonusDiario(this)" ${bonusReclamado ? "disabled style='opacity:0.5;cursor:default'" : ""}>
          ${bonusReclamado ? "Bonus Diario Reclamado" : "Reclamar +50 VicioCoins"}
        </button>
      </div>
    </div>
  `;

  misEl.innerHTML = `<div class="av-misiones-bar">` + misiones.map(m => {
    const pct = Math.min(100, Math.round((m.actual / m.meta) * 100));
    return `
      <div class="av-mision-card ${m.lista ? 'lista' : ''}">
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:14px;color:#fff">${esc(m.titulo)} <span style="color:var(--color-accent);font-size:12px">+${m.premio} VicioCoins</span></div>
          <div style="font-size:12px;color:var(--color-muted)">${esc(m.desc)} (${m.actual}/${m.meta})${m.tipo === "diaria" ? " · se renueva cada día" : ""}</div>
          <div class="av-mision-prog"><div class="av-mision-fill" style="width:${pct}%"></div></div>
        </div>
        ${m.reclamada
          ? `<button class="av-mision-btn done" disabled>LISTO</button>`
          : (m.lista
              ? `<button class="av-mision-btn claim" onclick="reclamarMision('${m.id}', this)">RECLAMAR</button>`
              : `<span style="font-family:'Outfit',sans-serif;font-size:12px;font-weight:800;color:var(--color-muted)">${pct}%</span>`
            )
        }
      </div>`;
  }).join("") + `</div>`;
}

function celebrarSubidaNivel(res) {
  if (res && res.subioNivel) mostrarOverlayNivel(NOMBRES_NIVEL[res.nuevoNivel] || "");
}

async function reclamarBonusDiario(btn) {
  if (btn) btn.disabled = true;
  let res;
  try { res = await Storage.reclamarBonusDiario(); }
  catch (e) { mostrarToast("No se pudo reclamar el bonus", "❌"); if (btn) btn.disabled = false; return; }
  if (!res.ok) { mostrarToast(res.error, "⚠️"); }
  else {
    UISfx.coin();
    mostrarToast(`Bonus diario: +${res.premio.monedas} VicioCoins y +${res.premio.xp} XP`, "🎁");
    celebrarSubidaNivel(res);
  }
  await actualizarPerfil();
  await renderizarHeroYMisiones();
  verificarLogros();
}

async function reclamarMision(id, btn) {
  if (btn) btn.disabled = true;
  let res;
  try { res = await Storage.reclamarMision(id); }
  catch (e) { mostrarToast("No se pudo reclamar la misión", "❌"); if (btn) btn.disabled = false; return; }
  if (!res.ok) { mostrarToast(res.error, "⚠️"); }
  else {
    UISfx.win();
    mostrarToast(`Misión completada: +${res.premio} VicioCoins y +${res.xp} XP`, "🏆");
    celebrarSubidaNivel(res);
  }
  await actualizarPerfil();
  await renderizarHeroYMisiones();
  verificarLogros();
}

document.addEventListener("DOMContentLoaded", iniciarApp);
