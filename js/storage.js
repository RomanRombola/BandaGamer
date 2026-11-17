// storage.js — Capa de datos AltoVicio V2
// ─────────────────────────────────────────────────────────────────────────────
// Usa Firestore como driver principal cuando el usuario está autenticado.
// Si no hay usuario autenticado, usa localStorage como fallback temporal.
// El resto de la app (main.js, juego.html) no sabe qué driver está activo.
// ─────────────────────────────────────────────────────────────────────────────

// ── Estructura base del usuario ───────────────────────────────────────────
const USUARIO_DEFAULT = {
  uid:                 "",
  nombre:              "",
  xp:                  0,
  nivel:               1,
  monedas:             0,
  avatar:              "😊",
  favoritos:           [],
  historial:           [],
  tiempo_jugado_total: 0,
  juegos_jugados:      0,
  logros:              [],
  ultima_sesion:       null,
  fecha_registro:      null,
};

// ── Firebase config ───────────────────────────────────────────────────────
const FB_CONFIG = {
  apiKey:            "AIzaSyACkFsE_0cBEsLEPQPc3GLeZD3KZ0i89RE",
  authDomain:        "gor2games-657f7.firebaseapp.com",
  databaseURL:       "https://gor2games-657f7-default-rtdb.firebaseio.com",
  projectId:         "gor2games-657f7",
  storageBucket:     "gor2games-657f7.firebasestorage.app",
  messagingSenderId: "91189543289",
  appId:             "1:91189543289:web:2a6ffc41710279febb6fa8"
};

// Inicializar Firebase (evitar duplicados si ya lo inicializaron Gartic o Impostor)
if (!firebase.apps.length) {
  firebase.initializeApp(FB_CONFIG);
} else {
  firebase.app(); // usar instancia existente
}

const _auth = firebase.auth();
const _db   = firebase.firestore();

// Promesa que se resuelve cuando Firebase Auth terminó de restaurar la sesión.
// Sin esto, currentUser es null durante los primeros ms de cada página y el
// driver elegido era localStorage aunque el usuario estuviera logueado.
const _authReady = new Promise(resolve => {
  const unsub = _auth.onAuthStateChanged(u => { unsub(); resolve(u); });
});

function _clone(o) {
  return (typeof structuredClone === "function") ? structuredClone(o) : JSON.parse(JSON.stringify(o));
}

function _nivelPorXP(xp) {
  return Math.min(Math.floor((xp || 0) / 1000) + 1, 10);
}

function _baseUsuario(user) {
  return {
    ...USUARIO_DEFAULT,
    uid:            user.uid,
    nombre:         user.displayName || "Jugador",
    fecha_registro: new Date().toISOString(),
  };
}

// Publica el resumen público (users/ + ranking/). No bloquea ni rompe el flujo.
function _publicarPerfil(usuario) {
  const user = _auth.currentUser;
  if (!user) return;
  _db.doc(`users/${user.uid}`).set({
    nombre:       usuario.nombre || '',
    nombre_lower: (usuario.nombre || '').toLowerCase(),
    nivel:        usuario.nivel  || 1,
    xp:           usuario.xp    || 0,
    avatar:       usuario.avatar || '😊',
    fotoPerfil:   usuario.fotoPerfil || null,
    updatedAt:    firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).catch(() => {});
  _actualizarRanking(usuario).catch(() => {});
}

// ── Driver Firestore (V2) ─────────────────────────────────────────────────
const driverFirestore = {
  async leer() {
    const user = _auth.currentUser;
    if (!user) return { ...USUARIO_DEFAULT };
    // Si Firestore falla (offline, permisos) esto LANZA: nunca devolvemos un usuario
    // vacío, porque la siguiente escritura pisaría el XP/monedas reales.
    const doc = await _db.doc(`usuarios/${user.uid}`).get();
    if (!doc.exists) {
      const base = _baseUsuario(user);
      await _db.doc(`usuarios/${user.uid}`).set(base);
      return base;
    }
    return { ...USUARIO_DEFAULT, ...doc.data() };
  },

  // Lectura-modificación-escritura ATÓMICA (transacción). Soporta varias pestañas.
  async actualizar(mutador) {
    const user = _auth.currentUser;
    if (!user) throw new Error("no-auth");
    const ref = _db.doc(`usuarios/${user.uid}`);
    const resultado = await _db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      const actual = snap.exists ? { ...USUARIO_DEFAULT, ...snap.data() } : _baseUsuario(user);
      const copia = _clone(actual);
      const salida = mutador(copia);
      const nuevo = (salida && typeof salida === "object") ? salida : copia;
      nuevo.uid = user.uid;
      if (!nuevo.fecha_registro) nuevo.fecha_registro = new Date().toISOString();
      tx.set(ref, nuevo, { merge: true });
      return nuevo;
    });
    _publicarPerfil(resultado);
    return resultado;
  },

  async escribir(usuario) {
    const user = _auth.currentUser;
    if (!user) return false;
    try {
      // Siempre mantener uid sincronizado
      usuario.uid = user.uid;
      if (!usuario.fecha_registro) usuario.fecha_registro = new Date().toISOString();
      await _db.doc(`usuarios/${user.uid}`).set(usuario, { merge: true });
      _publicarPerfil(usuario);
      return true;
    } catch (e) {
      console.error("[Storage] Error escribiendo Firestore:", e);
      return false;
    }
  },

  async leerVisitas() {
    const user = _auth.currentUser;
    if (!user) return {};
    try {
      const doc = await _db.doc(`visitas/${user.uid}`).get();
      return doc.exists ? doc.data() : {};
    } catch (e) {
      return {};
    }
  },

  async escribirVisitas(visitas) {
    const user = _auth.currentUser;
    if (!user) return false;
    try {
      await _db.doc(`visitas/${user.uid}`).set(visitas);
      return true;
    } catch (e) {
      return false;
    }
  },

  async limpiar() {
    const user = _auth.currentUser;
    if (!user) return false;
    try {
      await _db.doc(`usuarios/${user.uid}`).delete();
      await _db.doc(`visitas/${user.uid}`).delete();
      await _db.doc(`ranking/${user.uid}`).delete();
      await _db.doc(`users/${user.uid}`).delete();
      return true;
    } catch (e) {
      return false;
    }
  }
};

// ── Driver localStorage (fallback para no autenticados) ───────────────────
const STORAGE_KEY = "bandagamer_usuario_v2";
const VISITAS_KEY = "bandagamer_visitas_v2";

const driverLocal = {
  leer() {
    return new Promise(resolve => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        resolve(raw ? { ...USUARIO_DEFAULT, ...JSON.parse(raw) } : { ...USUARIO_DEFAULT });
      } catch (e) {
        resolve({ ...USUARIO_DEFAULT });
      }
    });
  },
  escribir(u) {
    return new Promise(resolve => {
      try {
        if (!u.fecha_registro) u.fecha_registro = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        resolve(true);
      } catch (e) { resolve(false); }
    });
  },
  async actualizar(mutador) {
    const actual = await this.leer();
    const copia = _clone(actual);
    const salida = mutador(copia);
    const nuevo = (salida && typeof salida === "object") ? salida : copia;
    await this.escribir(nuevo);
    return nuevo;
  },
  leerVisitas() {
    return new Promise(resolve => {
      try {
        const raw = localStorage.getItem(VISITAS_KEY);
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) { resolve({}); }
    });
  },
  escribirVisitas(v) {
    return new Promise(resolve => {
      try { localStorage.setItem(VISITAS_KEY, JSON.stringify(v)); resolve(true); }
      catch (e) { resolve(false); }
    });
  },
  limpiar() {
    return new Promise(resolve => {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(VISITAS_KEY);
        resolve(true);
      } catch (e) { resolve(false); }
    });
  }
};

// ── Selector de driver automático ─────────────────────────────────────────
function _driver() {
  return _auth.currentUser ? driverFirestore : driverLocal;
}
function _claveDriver() {
  return _auth.currentUser ? _auth.currentUser.uid : "local";
}

// ── Caché en memoria (SOLO para lecturas rápidas) ─────────────────────────
// Las escrituras ya no dependen de la caché: van por actualizarUsuario(),
// que lee y escribe de forma atómica. La caché está atada al usuario actual
// para no filtrar datos de una cuenta a otra al hacer login/logout.
let _cachedUser = null;
let _cachedKey  = null;
let _cacheTimestamp = 0;
const CACHE_TTL = 5000; // 5 segundos

function _setCache(u) {
  _cachedUser = _clone(u);
  _cachedKey = _claveDriver();
  _cacheTimestamp = Date.now();
}

function _invalidateCache() {
  _cachedUser = null;
  _cachedKey = null;
  _cacheTimestamp = 0;
}

// Al cambiar de sesión (login / logout) la caché deja de ser válida
_auth.onAuthStateChanged(() => { _invalidateCache(); });

// Cola de escrituras: se ejecutan de a una, en orden.
let _cola = Promise.resolve();
function _encolar(fn) {
  const corrida = _cola.then(fn);
  _cola = corrida.catch(() => {});
  return corrida;
}

// ── Ranking global ────────────────────────────────────────────────────────
// Escribe un resumen del usuario en /ranking para el leaderboard público.
async function _actualizarRanking(u) {
  const user = _auth.currentUser;
  if (!user) return;
  await _db.doc(`ranking/${user.uid}`).set({
    uid:        user.uid,
    nombre:     u.nombre,
    avatar:     u.avatar,
    fotoPerfil: u.fotoPerfil || null,
    xp:         u.xp,
    nivel:      u.nivel,
    juegos_jugados: u.juegos_jugados || 0,
    ultima_sesion:  u.ultima_sesion || null,
  }, { merge: true });
}

// ── API pública ───────────────────────────────────────────────────────────
const Storage = (() => {

  // Lectura para mostrar en pantalla. Nunca lanza: si falla devuelve la última
  // copia conocida (o un usuario vacío SOLO para dibujar, nunca para escribir).
  async function getUsuario() {
    await _authReady;
    try { await _cola; } catch (e) {}          // esperar escrituras en curso
    const ahora = Date.now();
    if (_cachedUser && _cachedKey === _claveDriver() && (ahora - _cacheTimestamp) < CACHE_TTL) {
      return _clone(_cachedUser);
    }
    try {
      const u = await _driver().leer();
      _setCache(u);
      return _clone(u);
    } catch (e) {
      console.error("[Storage] Error leyendo usuario:", e);
      if (_cachedUser && _cachedKey === _claveDriver()) return _clone(_cachedUser);
      return { ...USUARIO_DEFAULT };
    }
  }

  // Lectura-modificación-escritura atómica y serializada.
  //   await Storage.actualizarUsuario(u => { u.monedas += 5; });
  // Si la lectura falla, LANZA y no escribe nada (no se pisan datos reales).
  async function actualizarUsuario(mutador) {
    await _authReady;
    return _encolar(async () => {
      const nuevo = await _driver().actualizar(mutador);
      _setCache(nuevo);
      return _clone(nuevo);
    });
  }

  // Compatibilidad: guarda el objeto completo. Preferir actualizarUsuario().
  async function setUsuario(usuario) {
    await _authReady;
    return _encolar(async () => {
      const ok = await _driver().escribir(usuario);
      if (ok) _setCache(usuario); else _invalidateCache();
      return ok;
    });
  }

  async function resetUsuario() {
    await _authReady;
    const ok = await _encolar(() => _driver().limpiar());
    _invalidateCache();
    return ok;
  }

  async function toggleFavorito(juegoId) {
    const u = await actualizarUsuario(u => {
      u.favoritos = Array.isArray(u.favoritos) ? u.favoritos : [];
      const idx = u.favoritos.indexOf(juegoId);
      if (idx === -1) u.favoritos.push(juegoId);
      else u.favoritos.splice(idx, 1);
    });
    return u.favoritos.includes(juegoId);
  }

  async function esFavorito(juegoId) {
    const u = await getUsuario();
    return (u.favoritos || []).includes(juegoId);
  }

  async function registrarVisita(juegoId) {
    try {
      await _authReady;
      const visitas = await _driver().leerVisitas();
      visitas[juegoId] = (visitas[juegoId] || 0) + 1;
      await _driver().escribirVisitas(visitas);

      await actualizarUsuario(u => {
        // Dedup: quitar el juego del historial si ya estaba, y ponerlo al frente
        u.historial = (u.historial || []).filter(id => id !== juegoId);
        u.historial.unshift(juegoId);
        if (u.historial.length > 20) u.historial.length = 20;
        u.juegos_jugados = (u.juegos_jugados || 0) + 1;
        u.ultima_sesion  = new Date().toISOString();
      });
    } catch (e) {
      console.warn("[Storage] Error al registrar visita:", e);
    }
  }

  async function getVisitas() {
    await _authReady;
    try { return await _driver().leerVisitas(); } catch (e) { return {}; }
  }

  async function getContadorVisitas(juegoId) {
    const visitas = await getVisitas();
    return visitas[juegoId] || 0;
  }

  async function getMasJugados(limite = 5) {
    const visitas = await getVisitas();
    return Object.entries(visitas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limite)
      .map(([id]) => id);
  }

  async function getHistorial(limite = 5) {
    const u = await getUsuario();
    return (u.historial || []).slice(0, limite);
  }

  async function sumarXP(cantidad) {
    cantidad = Number(cantidad);
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      return { usuario: await getUsuario(), subioNivel: false, nuevoNivel: null };
    }
    let subioNivel = false;
    const usuario = await actualizarUsuario(u => {
      const nivelAntes = u.nivel || 1;
      u.xp = (u.xp || 0) + cantidad;
      u.nivel = _nivelPorXP(u.xp);
      subioNivel = u.nivel > nivelAntes;
    });
    if (subioNivel) invalidarCacheRanking();
    return { usuario, subioNivel, nuevoNivel: usuario.nivel };
  }

  async function sumarMonedas(cantidad) {
    cantidad = Number(cantidad);
    if (!Number.isFinite(cantidad) || cantidad === 0) return await getUsuario();
    return await actualizarUsuario(u => {
      u.monedas = Math.max(0, (u.monedas || 0) + cantidad);
    });
  }

  async function sumarTiempoJugado(segundos) {
    segundos = Number(segundos);
    if (!Number.isFinite(segundos) || segundos <= 0) return await getUsuario();
    return await actualizarUsuario(u => {
      u.tiempo_jugado_total = (u.tiempo_jugado_total || 0) + segundos;
    });
  }

  async function desbloquearLogro(logroId) {
    let nuevo = false;
    await actualizarUsuario(u => {
      u.logros = Array.isArray(u.logros) ? u.logros : [];
      if (!u.logros.includes(logroId)) { u.logros.push(logroId); nuevo = true; }
    });
    return nuevo;
  }

  async function tieneLogro(logroId) {
    const u = await getUsuario();
    return (u.logros || []).includes(logroId);
  }

  // Devuelve los top N jugadores del ranking global.
  // Caché local de 3 minutos para no hacer query en cada apertura.
  const _rankingCache = { data: null, ts: 0 };
  const RANKING_TTL = 3 * 60 * 1000;

  async function getRankingGlobal(limite = 50) {
    const ahora = Date.now();
    if (_rankingCache.data && (ahora - _rankingCache.ts) < RANKING_TTL) {
      return _rankingCache.data.slice(0, limite);
    }
    try {
      const snap = await _db.collection("ranking")
        .orderBy("xp", "desc")
        .limit(Math.max(limite, 50))
        .get();
      const lista = snap.docs.map(d => d.data());
      _rankingCache.data = lista;
      _rankingCache.ts = ahora;
      return lista.slice(0, limite);
    } catch (e) {
      console.warn("[Storage] Error leyendo ranking:", e);
      return (_rankingCache.data || []).slice(0, limite);
    }
  }

  // Fuerza actualización del ranking (llamar después de subir de nivel)
  function invalidarCacheRanking() {
    _rankingCache.data = null;
    _rankingCache.ts = 0;
  }

  // Devuelve el perfil público de cualquier usuario por uid.
  async function getPerfilPublico(uid) {
    try {
      const doc = await _db.doc(`ranking/${uid}`).get();
      return doc.exists ? doc.data() : null;
    } catch (e) {
      return null;
    }
  }

  // Migra datos de localStorage (clave V1) a Firestore cuando el usuario hace login.
  // Solo se ejecuta una vez (si Firestore no tiene datos del usuario todavía).
  async function migrarLocalAFirestore() {
    const user = _auth.currentUser;
    if (!user) return;
    try {
      const docFirestore = await _db.doc(`usuarios/${user.uid}`).get();
      if (docFirestore.exists) return;

      const rawLocal = localStorage.getItem("gor2games_usuario"); // clave V1
      if (!rawLocal) return;

      const localData = JSON.parse(rawLocal);
      if (!localData.nombre) return;

      const merged = {
        ...USUARIO_DEFAULT,
        ...localData,
        uid:    user.uid,
        nombre: localData.nombre || user.displayName || "Jugador",
        fecha_registro: localData.fecha_registro || new Date().toISOString(),
      };
      await _db.doc(`usuarios/${user.uid}`).set(merged);
      console.log("[Storage] Datos migrados de localStorage a Firestore.");
    } catch (e) {
      console.warn("[Storage] Error en migración:", e);
    }
  }

  // ── Récords por juego ─────────────────────────────────────────────────────
  // Se guardan en el usuario: u.records = { 'game-017': { default: 12345, sprint: 65432 } }
  // orden 'desc' = más alto es mejor (puntos) · 'asc' = más bajo es mejor (tiempos, movimientos)
  function _modoValido(m) { return String(m || 'default').replace(/[^a-z0-9_-]/gi, '').slice(0, 24) || 'default'; }

  async function registrarPuntaje(juegoId, modo, puntaje, orden = 'desc') {
    puntaje = Math.round(Number(puntaje));
    if (!juegoId || !Number.isFinite(puntaje) || puntaje <= 0) return { isRecord: false, prev: null, best: null };
    modo = _modoValido(modo);
    let prev = null, isRecord = false;
    const usuario = await actualizarUsuario(u => {
      u.records = (u.records && typeof u.records === "object") ? u.records : {};
      const r = (u.records[juegoId] && typeof u.records[juegoId] === "object") ? u.records[juegoId] : {};
      prev = Number.isFinite(r[modo]) ? r[modo] : null;
      isRecord = prev == null || (orden === "asc" ? puntaje < prev : puntaje > prev);
      if (isRecord) r[modo] = puntaje;
      u.records[juegoId] = r;
      u.partidas_puntuadas = (u.partidas_puntuadas || 0) + 1;
    });
    return { isRecord, prev, best: isRecord ? puntaje : prev, usuario };
  }

  async function getRecords(juegoId) {
    const u = await getUsuario();
    return (u.records && u.records[juegoId]) || {};
  }

  // ── Ranking por juego ─────────────────────────────────────────────────────
  // Firestore: leaderboards/{juegoId}__{modo}/scores/{uid}  (lectura pública, cada uno escribe el suyo)
  function _board(juegoId, modo) { return `leaderboards/${juegoId}__${_modoValido(modo)}/scores`; }

  async function enviarPuntajeRanking(juegoId, modo, puntaje, orden = "desc", perfil = {}) {
    const user = _auth.currentUser;
    if (!user || !Number.isFinite(puntaje) || puntaje <= 0) return false;
    const ref = _db.doc(`${_board(juegoId, modo)}/${user.uid}`);
    try {
      await _db.runTransaction(async tx => {
        const s = await tx.get(ref);
        const prev = s.exists ? s.data().score : null;
        if (prev != null && (orden === "asc" ? puntaje >= prev : puntaje <= prev)) return;   // no empeorar
        tx.set(ref, {
          uid: user.uid,
          nombre: String(perfil.nombre || "Jugador").slice(0, 24),
          avatar: perfil.avatar || "😊",
          nivel: perfil.nivel || 1,
          score: puntaje,
          at: firebase.firestore.FieldValue.serverTimestamp(),
        });
      });
      return true;
    } catch (e) {
      console.warn("[Storage] enviarPuntajeRanking:", e.message);
      return false;
    }
  }

  async function getRankingJuego(juegoId, modo, orden = "desc", limite = 20) {
    try {
      const snap = await _db.collection(_board(juegoId, modo)).orderBy("score", orden).limit(limite).get();
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.warn("[Storage] getRankingJuego:", e.message);
      return [];
    }
  }

  async function getPuntajesDe(juegoId, modo, uids) {
    const res = await Promise.all((uids || []).map(uid =>
      _db.doc(`${_board(juegoId, modo)}/${uid}`).get().then(s => s.exists ? s.data() : null).catch(() => null)));
    return res.filter(Boolean);
  }

  // Publica el perfil (users/ + ranking/) al iniciar sesión, para que los usuarios
  // viejos que nunca volvieron a escribir su perfil aparezcan en la búsqueda social.
  async function publicarPerfil() {
    await _authReady;
    if (!_auth.currentUser) return;
    try {
      const u = await getUsuario();
      // getUsuario puede devolver un usuario vacío si Firestore falló: nunca publicar eso
      if (u && u.uid === _auth.currentUser.uid && u.nombre) _publicarPerfil(u);
    } catch (e) { }
  }

  return {
    registrarPuntaje,
    getRecords,
    enviarPuntajeRanking,
    getRankingJuego,
    getPuntajesDe,
    publicarPerfil,
    getUsuario,
    actualizarUsuario,
    setUsuario,
    resetUsuario,
    toggleFavorito,
    esFavorito,
    registrarVisita,
    getVisitas,
    getContadorVisitas,
    getMasJugados,
    getHistorial,
    sumarXP,
    sumarMonedas,
    sumarTiempoJugado,
    desbloquearLogro,
    tieneLogro,
    getRankingGlobal,
    invalidarCacheRanking,
    getPerfilPublico,
    migrarLocalAFirestore,
    USUARIO_DEFAULT,
    // Promesa que resuelve cuando Auth restauró la sesión (usuario o null)
    authListo: _authReady,
    // Exponer auth para que main.js pueda escuchar cambios de sesión
    auth: _auth,
  };

})();


// ═══════════════════════════════════════════════════════════════════════════
//  ALTOVICIO V9 — MOTOR PLATO DE AVATARES, TIENDA, TÍTULOS Y BURBUJAS
// ═══════════════════════════════════════════════════════════════════════════
window.ACCESORIOS_DEFAULT = {
  emoji: "e_smile",
  sombrero: "s_none",
  lentes: "l_none",
  bigote: "b_none",
  marco: "m_none",
  efecto: "ef_none",
  mascota: "pet_none",
  titulo: "t_none",
  burbuja: "chat_default",
  offsetY: 0,
  scale: 100
};

window.ACCESORIOS = {
  sombreros: [
    { id: "s_none",       emoji: "",     nombre: "Sin sombrero",   precio: 0,    reqNivel: 1, rareza: "comun" },
    { id: "s_gorra",      emoji: "🧢",   nombre: "Gorra Street",   precio: 40,   reqNivel: 1, rareza: "comun" },
    { id: "s_auris",      emoji: "🎧",   nombre: "Auris Streamer", precio: 90,   reqNivel: 1, rareza: "raro" },
    { id: "s_cowboy",     emoji: "🤠",   nombre: "Vaquero Picante",precio: 120,  reqNivel: 2, rareza: "raro" },
    { id: "s_chef",       emoji: "👨‍🍳",  nombre: "Master Chef",    precio: 150,  reqNivel: 2, rareza: "raro" },
    { id: "s_casco",      emoji: "⛑️",   nombre: "Casco Rescate",  precio: 160,  reqNivel: 3, rareza: "raro" },
    { id: "s_bruja",      emoji: "🎩",   nombre: "Galera VIP",     precio: 220,  reqNivel: 3, rareza: "epico" },
    { id: "s_angel",      emoji: "😇",   nombre: "Santo Inocente", precio: 260,  reqNivel: 4, rareza: "epico" },
    { id: "s_diablo",     emoji: "😈",   nombre: "Diablito",       precio: 280,  reqNivel: 4, rareza: "epico" },
    { id: "s_santa",      emoji: "🎅",   nombre: "Papá Noel",      precio: 250,  reqNivel: 4, rareza: "epico" },
    { id: "s_corona",     emoji: "👑",   nombre: "Corona del Rey", precio: 400,  reqNivel: 5, rareza: "legendario" },
    { id: "s_vikingo",    emoji: "🪖",   nombre: "Casco Táctico",  precio: 420,  reqNivel: 6, rareza: "epico" },
    { id: "s_mago",       emoji: "🧙‍♂️",  nombre: "Hechicero",      precio: 500,  reqNivel: 7, rareza: "legendario" },
    { id: "s_astronauta", emoji: "👨‍🚀",  nombre: "Cosmonauta",     precio: 650,  reqNivel: 8, rareza: "legendario" },
    { id: "s_alien_hat",  emoji: "🛸",   nombre: "Abducción OVNI", precio: 850,  reqNivel: 9, rareza: "mitico" },
    { id: "s_supremo",    emoji: "🏆",   nombre: "Copa del Mundo", precio: 1000, reqNivel: 10, rareza: "mitico" }
  ],
  lentes: [
    { id: "l_none",   emoji: "",    nombre: "Sin lentes",      precio: 0,   reqNivel: 1, rareza: "comun" },
    { id: "l_cool",   emoji: "🕶️",  nombre: "Deal With It",    precio: 60,  reqNivel: 1, rareza: "comun" },
    { id: "l_nerd",   emoji: "👓",  nombre: "Intelectual",     precio: 90,  reqNivel: 1, rareza: "comun" },
    { id: "l_monoc",  emoji: "🧐",  nombre: "Fino Señores",    precio: 150, reqNivel: 2, rareza: "raro" },
    { id: "l_fuego",  emoji: "🥸",  nombre: "Incógnito",       precio: 160, reqNivel: 3, rareza: "raro" },
    { id: "l_star",   emoji: "🤩",  nombre: "Ojos Estrella",   precio: 220, reqNivel: 4, rareza: "epico" },
    { id: "l_heart",  emoji: "😍",  nombre: "Enamorado",       precio: 240, reqNivel: 4, rareza: "epico" },
    { id: "l_vr",     emoji: "🥽",  nombre: "Visor Meta VR",   precio: 350, reqNivel: 5, rareza: "epico" },
    { id: "l_fire",   emoji: "🔥",  nombre: "Mirada Ígnea",    precio: 480, reqNivel: 6, rareza: "legendario" },
    { id: "l_cyber",  emoji: "⚡",  nombre: "Láser Voltaico",  precio: 650, reqNivel: 8, rareza: "mitico" }
  ],
  bigotes: [
    { id: "b_none",    emoji: "",    nombre: "Sin accesorio",  precio: 0,   reqNivel: 1, rareza: "comun" },
    { id: "b_mate",    emoji: "🧉",  nombre: "Mate Amargo",    precio: 80,  reqNivel: 1, rareza: "raro" },
    { id: "b_fino",    emoji: "🥸",  nombre: "Mostacho",       precio: 60,  reqNivel: 1, rareza: "comun" },
    { id: "b_pizza",   emoji: "🍕",  nombre: "Porción Muzza",  precio: 120, reqNivel: 2, rareza: "raro" },
    { id: "b_largo",   emoji: "🧔",  nombre: "Barba Leñador",  precio: 140, reqNivel: 2, rareza: "raro" },
    { id: "b_rosa",    emoji: "🌹",  nombre: "Galán Seductor", precio: 180, reqNivel: 3, rareza: "epico" },
    { id: "b_pirata",  emoji: "🏴‍☠️", nombre: "Parche Pirata",  precio: 220, reqNivel: 4, rareza: "epico" },
    { id: "b_ninja",   emoji: "🥷",  nombre: "Máscara Shinobi",precio: 320, reqNivel: 5, rareza: "epico" },
    { id: "b_fuego",   emoji: "🌶️",  nombre: "Picante",        precio: 380, reqNivel: 6, rareza: "legendario" },
    { id: "b_king",    emoji: "💎",  nombre: "Grillz Diamante",precio: 550, reqNivel: 7, rareza: "mitico" }
  ],
  marcos: [
    { id: "m_none",    css: "", nombre: "Sin marco", precio: 0, reqNivel: 1, rareza: "comun" },
    { id: "m_naranja", css: "box-shadow:0 0 0 3px #ff6600, 0 0 14px #ff6600;", nombre: "Neón Naranja", precio: 50, reqNivel: 1, rareza: "comun" },
    { id: "m_azul",    css: "box-shadow:0 0 0 3px #00aaff, 0 0 14px #00aaff;", nombre: "Láser Azul", precio: 50, reqNivel: 1, rareza: "comun" },
    { id: "m_verde",   css: "box-shadow:0 0 0 3px #39ff14, 0 0 16px #39ff14;", nombre: "Tóxico Radioactivo", precio: 100, reqNivel: 2, rareza: "raro" },
    { id: "m_rojo",    css: "box-shadow:0 0 0 3px #ff0055, 0 0 18px #ff0055;", nombre: "Furia Carmesí", precio: 150, reqNivel: 2, rareza: "raro" },
    { id: "m_dorado",  css: "box-shadow:0 0 0 3px #ffe600, 0 0 20px #ff9900;", nombre: "Oro Puro", precio: 220, reqNivel: 3, rareza: "epico" },
    { id: "m_arg",     css: "background:conic-gradient(#74acdf 0 33%, #fff 33% 66%, #ffd700 66% 100%);padding:3px;box-shadow:0 0 18px rgba(116,172,223,0.8);", nombre: "Campeón ⭐⭐⭐", precio: 350, reqNivel: 3, rareza: "legendario", spin: true },
    { id: "m_morado",  css: "box-shadow:0 0 0 3px #a855f7, 0 0 20px #a855f7;", nombre: "Abismo Púrpura", precio: 200, reqNivel: 3, rareza: "epico" },
    { id: "m_celeste", css: "box-shadow:0 0 0 3px #00ffcc, 0 0 20px #00ffcc;", nombre: "Hielo Eterno", precio: 260, reqNivel: 4, rareza: "epico" },
    { id: "m_galaxy",  css: "background:conic-gradient(#ff0055,#ff6600,#ffe600,#39ff14,#00aaff,#a855f7,#ff0055);padding:3px;box-shadow:0 0 22px rgba(0,170,255,0.7);", nombre: "RGB Gamer Pro", precio: 500, reqNivel: 5, rareza: "legendario", spin: true },
    { id: "m_fuego",   css: "background:conic-gradient(#ff0000,#ff6600,#ffe600,#ff6600,#ff0000);padding:3px;box-shadow:0 0 24px rgba(255,80,0,0.9);", nombre: "Llama Solar", precio: 650, reqNivel: 7, rareza: "legendario", spin: true },
    { id: "m_aurora",  css: "background:conic-gradient(#00ffcc,#00aaff,#a855f7,#ff00aa,#00ffcc);padding:3px;box-shadow:0 0 26px rgba(168,85,247,0.85);", nombre: " Galaxia Mítica", precio: 800, reqNivel: 8, rareza: "mitico", spin: true },
    { id: "m_banda",   css: "background:conic-gradient(#ffe600,#ff6600,#ffffff,#ff6600,#ffe600);padding:3.5px;box-shadow:0 0 30px rgba(255,215,0,0.95);", nombre: "Dios del Vicio", precio: 1000, reqNivel: 10, rareza: "mitico", spin: true }
  ],
  efectos: [
    { id: "ef_none",   badge: "",   css: "", nombre: "Sin aura", precio: 0, reqNivel: 1, rareza: "comun" },
    { id: "ef_stars",  badge: "✨", css: "box-shadow:0 0 24px rgba(255,230,0,0.55);", nombre: "Polvo Estelar", precio: 180, reqNivel: 2, rareza: "raro" },
    { id: "ef_hearts", badge: "💖", css: "box-shadow:0 0 24px rgba(255,51,153,0.65);", nombre: "Rompecorazones", precio: 240, reqNivel: 3, rareza: "epico" },
    { id: "ef_fire",   badge: "🔥", css: "box-shadow:0 0 28px rgba(255,80,0,0.8), 0 -6px 20px rgba(255,200,0,0.6);", nombre: "Aura Ígnea", precio: 380, reqNivel: 4, rareza: "epico" },
    { id: "ef_saiyan", badge: "⚡", css: "box-shadow:0 0 32px rgba(255,230,0,0.95), 0 0 12px #00e5ff;", nombre: "Ki Saiyajin", precio: 550, reqNivel: 6, rareza: "legendario" },
    { id: "ef_dark",   badge: "🌀", css: "box-shadow:0 0 32px rgba(147,51,234,0.9), inset 0 0 12px #000;", nombre: "Materia Oscura", precio: 750, reqNivel: 8, rareza: "mitico" }
  ],
  mascotas: [
    { id: "pet_none",  emoji: "",   nombre: "Sin mascota",     precio: 0,   reqNivel: 1, rareza: "comun" },
    { id: "pet_capi",  emoji: "🦫", nombre: "Capibara Chill",  precio: 150, reqNivel: 1, rareza: "raro" },
    { id: "pet_cat",   emoji: "🐱", nombre: "Michi Vicioso",   precio: 180, reqNivel: 2, rareza: "raro" },
    { id: "pet_dog",   emoji: "🐶", nombre: "Doge Guardián",   precio: 180, reqNivel: 2, rareza: "raro" },
    { id: "pet_duck",  emoji: "🦆", nombre: "Patito Táctico",  precio: 260, reqNivel: 3, rareza: "epico" },
    { id: "pet_ghost", emoji: "👻", nombre: "Gasparín",        precio: 320, reqNivel: 4, rareza: "epico" },
    { id: "pet_alien", emoji: "👾", nombre: "Invasor 8-Bit",   precio: 450, reqNivel: 5, rareza: "legendario" },
    { id: "pet_drag",  emoji: "🐉", nombre: "Shenlong Mini",   precio: 700, reqNivel: 7, rareza: "mitico" }
  ],
  titulos: [
    { id: "t_none",     texto: "",                     color: "#888888", precio: 0,   reqNivel: 1, rareza: "comun" },
    { id: "t_cebador",  texto: "🧉 Cebador Oficial",   color: "#39ff88", precio: 80,  reqNivel: 1, rareza: "comun" },
    { id: "t_tryhard",  texto: "💦 Tryhard 24/7",      color: "#00aaff", precio: 140, reqNivel: 2, rareza: "raro" },
    { id: "t_impostor", texto: "🔪 Impostor Pro",      color: "#ff3366", precio: 200, reqNivel: 3, rareza: "epico" },
    { id: "t_campeon",  texto: "⭐⭐⭐ Campeón Mundial", color: "#74acdf", precio: 300, reqNivel: 3, rareza: "legendario" },
    { id: "t_millo",    texto: "💸 Magnate VicioCoin", color: "#ffe600", precio: 500, reqNivel: 5, rareza: "legendario" },
    { id: "t_dios",     texto: "👑 Rey de AltoVicio",  color: "#ff6600", precio: 900, reqNivel: 8, rareza: "mitico" }
  ],
  burbujas: [
    { id: "chat_default", nombre: "Clásica",         precio: 0,   reqNivel: 1, rareza: "comun",      css: "background:rgba(255,102,0,0.2);border:1px solid rgba(255,102,0,0.35);color:#fff;" },
    { id: "chat_cyber",   nombre: "Cyberpunk Neón",  precio: 120, reqNivel: 1, rareza: "raro",       css: "background:linear-gradient(135deg,rgba(0,170,255,0.28),rgba(168,85,247,0.28));border:1px solid #00e5ff;color:#e0faff;box-shadow:0 0 12px rgba(0,229,255,0.25);" },
    { id: "chat_toxic",   nombre: "Ácido Verde",     precio: 180, reqNivel: 2, rareza: "raro",       css: "background:rgba(57,255,20,0.16);border:1px solid #39ff14;color:#d8ffd0;box-shadow:0 0 10px rgba(57,255,20,0.2);" },
    { id: "chat_fire",    nombre: "Fuego Infernal",  precio: 280, reqNivel: 4, rareza: "epico",      css: "background:linear-gradient(135deg,rgba(255,0,60,0.3),rgba(255,120,0,0.3));border:1px solid #ff4500;color:#fff2e6;box-shadow:0 0 14px rgba(255,69,0,0.3);" },
    { id: "chat_gold",    nombre: "VIP Oro Real",    precio: 450, reqNivel: 6, rareza: "legendario", css: "background:linear-gradient(135deg,rgba(255,215,0,0.28),rgba(180,100,0,0.35));border:1px solid #ffd700;color:#fffbe0;box-shadow:0 0 16px rgba(255,215,0,0.35);font-weight:700;" }
  ],
  emojis: [
    { id: "e_smile",     emoji: "😊", nombre: "Sonrisa",   precio: 0,    reqNivel: 1, rareza: "comun" },
    { id: "e_cool",      emoji: "😎", nombre: "Fachero",   precio: 50,   reqNivel: 1, rareza: "comun" },
    { id: "e_clown",     emoji: "🤡", nombre: "Payaso",    precio: 80,   reqNivel: 1, rareza: "raro" },
    { id: "e_fire",      emoji: "🔥", nombre: "Fuego",     precio: 100,  reqNivel: 2, rareza: "raro" },
    { id: "e_Ghostface", emoji: "😱", nombre: "Scream",    precio: 150,  reqNivel: 2, rareza: "raro" },
    { id: "e_skull",     emoji: "💀", nombre: "Calavera",  precio: 220,  reqNivel: 3, rareza: "epico" },
    { id: "e_alien",     emoji: "👽", nombre: "visitante", precio: 280,  reqNivel: 4, rareza: "epico" },
    { id: "e_robot",     emoji: "🤖", nombre: "Mecha",     precio: 340,  reqNivel: 5, rareza: "epico" },
    { id: "e_ninja",     emoji: "🥷", nombre: "Sombra",    precio: 420,  reqNivel: 6, rareza: "legendario" },
    { id: "e_dragon",    emoji: "🐲", nombre: "Dragón",    precio: 550,  reqNivel: 7, rareza: "legendario" },
    { id: "e_diamond",   emoji: "💎", nombre: "Diamante",  precio: 750,  reqNivel: 8, rareza: "mitico" },
    { id: "e_supreme",   emoji: "🌌", nombre: "Cósmico",   precio: 1000, reqNivel: 10, rareza: "mitico" }
  ]
};

window.urlFotoSeguraGlobal = function(u) {
  if (typeof u !== "string") return "";
  if (!/^(data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+\/=]+|https:\/\/[^\s"'<>]+)$/.test(u)) return "";
  return u;
};

// Renderiza el avatar completo estilo Plato: funciona TANTO sobre tu foto de perfil subida como sobre el emoji base
window.renderAvatar = function(base, accesorios={}, size=44, fotoUrl="") {
  // Permitir pasar el objeto usuario entero como primer parámetro si se desea
  if (base && typeof base === "object") {
    const uObj = base;
    accesorios = uObj.accesorios || {};
    fotoUrl = uObj.fotoPerfil || "";
    base = uObj.avatar || "😊";
  }
  const acc = { ...window.ACCESORIOS_DEFAULT, ...(accesorios || {}) };
  const foto = window.urlFotoSeguraGlobal(fotoUrl);
  const emojiBase = window.ACCESORIOS.emojis.find(a => a.id === acc.emoji)?.emoji || base || "😊";
  const sombrero  = window.ACCESORIOS.sombreros.find(a => a.id === acc.sombrero)?.emoji || "";
  const lentes    = window.ACCESORIOS.lentes.find(a => a.id === acc.lentes)?.emoji || "";
  const bigote    = window.ACCESORIOS.bigotes.find(a => a.id === acc.bigote)?.emoji || "";
  const marcoAcc  = window.ACCESORIOS.marcos.find(a => a.id === acc.marco);
  const efectoAcc = window.ACCESORIOS.efectos.find(a => a.id === acc.efecto);
  const mascota   = window.ACCESORIOS.mascotas.find(a => a.id === acc.mascota)?.emoji || "";

  const offY = Math.max(-25, Math.min(25, Number(acc.offsetY) || 0)) * (size / 80);
  const sc   = Math.max(0.7, Math.min(1.4, (Number(acc.scale) || 100) / 100));

  const auraStyle = efectoAcc?.css || "";
  const marcoStyle = marcoAcc?.css || "border:1.5px solid rgba(255,255,255,0.16);";
  const innerContent = foto
    ? `<img src="${foto}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block">`
    : `<span style="font-size:${Math.round(size * 0.64)}px;line-height:1;display:flex;align-items:center;justify-content:center;width:100%;height:100%">${emojiBase}</span>`;

  return `<div class="av-plato-wrap" style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;flex-shrink:0;vertical-align:middle;overflow:visible !important;">
    ${auraStyle ? `<div class="av-aura-layer" style="position:absolute;inset:-4px;border-radius:50%;pointer-events:none;${auraStyle}"></div>` : ""}
    <div class="av-frame-ring ${marcoAcc?.spin ? 'av-spin-ring' : ''}" style="position:relative;width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#161628;${marcoStyle}">
      <div style="width:100%;height:100%;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 30% 30%,#252542,#0f0f1d);display:flex;align-items:center;justify-content:center;">
        ${innerContent}
      </div>
    </div>
    ${sombrero ? `<span style="position:absolute;top:${Math.round(-size * 0.34 + offY)}px;left:50%;transform:translateX(-50%) scale(${sc});font-size:${Math.round(size * 0.52)}px;line-height:1;pointer-events:none;z-index:5;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.75))">${sombrero}</span>` : ""}
    ${lentes ? `<span style="position:absolute;top:${Math.round(size * 0.16 + offY)}px;left:50%;transform:translateX(-50%) scale(${sc});font-size:${Math.round(size * 0.42)}px;line-height:1;pointer-events:none;z-index:4;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.7))">${lentes}</span>` : ""}
    ${bigote ? `<span style="position:absolute;bottom:${Math.round(-size * 0.08 - offY * 0.6)}px;left:50%;transform:translateX(-50%) scale(${sc});font-size:${Math.round(size * 0.38)}px;line-height:1;pointer-events:none;z-index:4;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.75))">${bigote}</span>` : ""}
    ${mascota ? `<span class="av-pet-float" style="position:absolute;bottom:${Math.round(-size * 0.12)}px;right:${Math.round(-size * 0.20)}px;font-size:${Math.round(size * 0.44)}px;line-height:1;pointer-events:none;z-index:6;filter:drop-shadow(0 3px 5px rgba(0,0,0,0.8))">${mascota}</span>` : ""}
    ${efectoAcc?.badge ? `<span class="av-badge-spark" style="position:absolute;top:${Math.round(-size * 0.12)}px;left:${Math.round(-size * 0.14)}px;font-size:${Math.round(size * 0.30)}px;line-height:1;pointer-events:none;z-index:6">${efectoAcc.badge}</span>` : ""}
  </div>`;
};

window.renderTituloBadge = function(accesorios={}) {
  const id = accesorios?.titulo || "t_none";
  const t = window.ACCESORIOS.titulos.find(x => x.id === id);
  if (!t || !t.texto) return "";
  return `<span class="av-titulo-pill" style="display:inline-block;font-family:'Orbitron',sans-serif;font-size:9px;font-weight:800;padding:2px 8px;border-radius:99px;background:rgba(0,0,0,0.45);border:1px solid ${t.color};color:${t.color};letter-spacing:0.6px;box-shadow:0 0 8px ${t.color}33;vertical-align:middle">${t.texto}</span>`;
};

window.getChatBubbleCSS = function(accesorios={}) {
  const id = accesorios?.burbuja || "chat_default";
  const b = window.ACCESORIOS.burbujas.find(x => x.id === id) || window.ACCESORIOS.burbujas[0];
  return b.css;
};

