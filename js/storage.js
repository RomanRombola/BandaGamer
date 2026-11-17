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


// ── CATÁLOGO DE ARTE VECTORIAL HD (CERO EMOJIS) ───────────────────────────
const SVG_AVATARS = {
  e_smile: `<svg viewBox="0 0 100 100"><defs><linearGradient id="av1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff7b00"/><stop offset="100%" stop-color="#ff3300"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#av1)"/><circle cx="50" cy="46" r="28" fill="#ffe0bd"/><path d="M22 42 C22 20, 78 20, 78 42 C72 28, 28 28, 22 42 Z" fill="#1a1d2e"/><circle cx="39" cy="46" r="4.5" fill="#1a1d2e"/><circle cx="61" cy="46" r="4.5" fill="#1a1d2e"/><circle cx="40.5" cy="44.5" r="1.5" fill="#fff"/><circle cx="62.5" cy="44.5" r="1.5" fill="#fff"/><path d="M40 57 Q50 65 60 57" stroke="#1a1d2e" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M20 92 C24 72, 76 72, 80 92 Z" fill="#1a1d2e"/></svg>`,
  e_cool: `<svg viewBox="0 0 100 100"><defs><linearGradient id="av2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00b4db"/><stop offset="100%" stop-color="#0083b0"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#av2)"/><polygon points="24,22 38,40 20,48" fill="#ff6600"/><polygon points="76,22 62,40 80,48" fill="#ff6600"/><circle cx="50" cy="52" r="27" fill="#fff"/><path d="M26 48 Q50 38 74 48" stroke="#ff6600" stroke-width="4" fill="none"/><ellipse cx="39" cy="51" rx="6" ry="3.5" fill="#00e5ff"/><ellipse cx="61" cy="51" rx="6" ry="3.5" fill="#00e5ff"/><path d="M44 62 Q50 66 56 62" stroke="#1a1d2e" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  e_fire: `<svg viewBox="0 0 100 100"><defs><linearGradient id="av3" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#ff0844"/><stop offset="100%" stop-color="#ffb199"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="#161224"/><path d="M50 14 C68 32, 78 48, 72 68 C68 82, 32 82, 28 68 C22 48, 32 32, 50 14 Z" fill="url(#av3)"/><path d="M50 28 C60 40, 65 52, 60 66 C56 75, 44 75, 40 66 C35 52, 40 40, 50 28 Z" fill="#ffe600"/><ellipse cx="41" cy="56" rx="4" ry="6" fill="#161224"/><ellipse cx="59" cy="56" rx="4" ry="6" fill="#161224"/></svg>`,
  e_skull: `<svg viewBox="0 0 100 100"><defs><linearGradient id="av4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2b3248"/><stop offset="100%" stop-color="#121622"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#av4)"/><path d="M26 46 C26 24, 74 24, 74 46 C74 58, 66 64, 64 74 L36 74 C34 64, 26 58, 26 46 Z" fill="#f1f5f9"/><circle cx="39" cy="48" r="7" fill="#00e5ff"/><circle cx="61" cy="48" r="7" fill="#00e5ff"/><polygon points="50,55 46,63 54,63" fill="#1e293b"/><line x1="42" y1="68" x2="42" y2="74" stroke="#1e293b" stroke-width="3"/><line x1="50" y1="68" x2="50" y2="74" stroke="#1e293b" stroke-width="3"/><line x1="58" y1="68" x2="58" y2="74" stroke="#1e293b" stroke-width="3"/></svg>`,
  e_robot: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#111927"/><rect x="25" y="28" width="50" height="44" rx="14" fill="#cbd5e1" stroke="#00aaff" stroke-width="3"/><line x1="50" y1="16" x2="50" y2="28" stroke="#00aaff" stroke-width="4"/><circle cx="50" cy="14" r="5" fill="#ff6600"/><rect x="32" y="38" width="36" height="14" rx="6" fill="#0f172a"/><circle cx="41" cy="45" r="4" fill="#39ff14"/><circle cx="59" cy="45" r="4" fill="#39ff14"/><rect x="38" y="59" width="24" height="5" rx="2.5" fill="#00aaff"/></svg>`,
  e_ninja: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#1e1b2e"/><circle cx="50" cy="50" r="30" fill="#11131c"/><path d="M22 42 Q50 36 78 42 L78 55 Q50 50 22 55 Z" fill="#fde68a"/><path d="M20 38 L80 38 L80 43 L20 43 Z" fill="#ff0055"/><ellipse cx="39" cy="48" rx="4.5" ry="3" fill="#11131c"/><ellipse cx="61" cy="48" rx="4.5" ry="3" fill="#11131c"/></svg>`,
  e_dragon: `<svg viewBox="0 0 100 100"><defs><linearGradient id="avDr" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="#18121e"/><polygon points="24,20 36,38 22,42" fill="#fde047"/><polygon points="76,20 64,38 78,42" fill="#fde047"/><path d="M26 42 C26 26, 74 26, 74 42 L68 72 L50 78 L32 72 Z" fill="url(#avDr)"/><polygon points="35,48 45,51 37,55" fill="#fff"/><polygon points="65,48 55,51 63,55" fill="#fff"/></svg>`,
  e_diamond: `<svg viewBox="0 0 100 100"><defs><linearGradient id="avDi" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#6366f1"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="#0f172a"/><polygon points="50,16 80,42 50,84 20,42" fill="url(#avDi)"/><polygon points="50,16 66,42 50,84 34,42" fill="#bae6fd" opacity="0.45"/><polygon points="20,42 80,42 50,28" fill="#fff" opacity="0.35"/></svg>`,
  e_supreme: `<svg viewBox="0 0 100 100"><defs><radialGradient id="avSu"><stop offset="0%" stop-color="#fde047"/><stop offset="55%" stop-color="#ff6600"/><stop offset="100%" stop-color="#3b0764"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#avSu)"/><circle cx="50" cy="50" r="24" fill="#fff"/><polygon points="50,14 57,36 80,36 61,50 68,72 50,58 32,72 39,50 20,36 43,36" fill="#fde047"/></svg>`
};

const SVG_SOMBREROS = {
  s_gorra: `<svg viewBox="0 0 120 70"><path d="M24 48 C24 18, 92 18, 92 48 Z" fill="#ff6600"/><path d="M20 45 L106 45 C112 45, 112 53, 102 53 L20 53 Z" fill="#1e293b"/><circle cx="58" cy="22" r="4" fill="#fff"/><rect x="44" y="32" width="28" height="8" rx="4" fill="#fff"/></svg>`,
  s_auris: `<svg viewBox="0 0 120 90"><path d="M18 62 C18 14, 102 14, 102 62" stroke="#1e293b" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M22 58 C22 18, 98 18, 98 58" stroke="#00e5ff" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="8" y="48" width="16" height="30" rx="8" fill="#ff6600" stroke="#fff" stroke-width="2"/><rect x="96" y="48" width="16" height="30" rx="8" fill="#ff6600" stroke="#fff" stroke-width="2"/></svg>`,
  s_corona: `<svg viewBox="0 0 120 75"><defs><linearGradient id="crG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs><polygon points="16,58 24,22 44,42 60,14 76,42 96,22 104,58" fill="url(#crG)" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><rect x="16" y="54" width="88" height="10" rx="5" fill="#b45309"/><circle cx="60" cy="40" r="5" fill="#ff0055"/><circle cx="36" cy="46" r="4" fill="#00e5ff"/><circle cx="84" cy="46" r="4" fill="#00e5ff"/></svg>`,
  s_angel: `<svg viewBox="0 0 120 60"><ellipse cx="60" cy="30" rx="42" ry="12" fill="none" stroke="#fde047" stroke-width="7"/><ellipse cx="60" cy="30" rx="42" ry="12" fill="none" stroke="#ffffff" stroke-width="2.5"/></svg>`,
  s_diablo: `<svg viewBox="0 0 120 70"><path d="M18 56 C10 34, 22 14, 38 12 C30 28, 32 42, 40 54 Z" fill="#ef4444"/><path d="M102 56 C110 34, 98 14, 82 12 C90 28, 88 42, 80 54 Z" fill="#ef4444"/></svg>`,
  s_bruja: `<svg viewBox="0 0 120 80"><rect x="14" y="54" width="92" height="10" rx="5" fill="#1e293b"/><rect x="32" y="14" width="56" height="44" rx="6" fill="#0f172a" stroke="#334155" stroke-width="2"/><rect x="32" y="44" width="56" height="8" fill="#ff6600"/></svg>`,
  s_mago: `<svg viewBox="0 0 120 85"><polygon points="60,8 22,64 98,64" fill="#4f46e5"/><ellipse cx="60" cy="64" rx="48" ry="10" fill="#312e81"/><polygon points="60,30 63,38 71,38 65,43 67,51 60,46 53,51 55,43 49,38 57,38" fill="#fde047"/></svg>`,
  s_vikingo: `<svg viewBox="0 0 120 75"><path d="M22 50 C8 32, 14 14, 28 12 C24 28, 28 38, 36 44 Z" fill="#fef3c7"/><path d="M98 50 C112 32, 106 14, 92 12 C96 28, 92 38, 84 44 Z" fill="#fef3c7"/><path d="M30 56 C30 26, 90 26, 90 56 Z" fill="#64748b" stroke="#cbd5e1" stroke-width="3"/></svg>`,
  s_chef: `<svg viewBox="0 0 120 80"><circle cx="40" cy="34" r="18" fill="#fff"/><circle cx="60" cy="28" r="22" fill="#fff"/><circle cx="80" cy="34" r="18" fill="#fff"/><rect x="32" y="44" width="56" height="18" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/></svg>`,
  s_alien_hat: `<svg viewBox="0 0 120 75"><path d="M40 36 C40 16, 80 16, 80 36 Z" fill="#38bdf8" opacity="0.8"/><ellipse cx="60" cy="38" rx="44" ry="12" fill="#94a3b8" stroke="#00e5ff" stroke-width="2.5"/><circle cx="36" cy="38" r="3.5" fill="#fde047"/><circle cx="60" cy="41" r="3.5" fill="#39ff14"/><circle cx="84" cy="38" r="3.5" fill="#ff0055"/></svg>`,
  s_supremo: `<svg viewBox="0 0 120 80"><defs><linearGradient id="supG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff"/><stop offset="40%" stop-color="#fde047"/><stop offset="100%" stop-color="#ff6600"/></linearGradient></defs><polygon points="12,60 22,18 44,40 60,8 76,40 98,18 108,60" fill="url(#supG)" stroke="#fff" stroke-width="2.5"/><circle cx="60" cy="36" r="6" fill="#00e5ff"/><circle cx="35" cy="44" r="4.5" fill="#ff0055"/><circle cx="85" cy="44" r="4.5" fill="#ff0055"/></svg>`
};

const SVG_LENTES = {
  l_cool: `<svg viewBox="0 0 120 50"><rect x="14" y="14" width="40" height="22" rx="4" fill="#0f172a" stroke="#fff" stroke-width="2"/><rect x="66" y="14" width="40" height="22" rx="4" fill="#0f172a" stroke="#fff" stroke-width="2"/><line x1="54" y1="22" x2="66" y2="22" stroke="#fff" stroke-width="3"/><line x1="22" y1="19" x2="32" y2="31" stroke="#fff" stroke-width="3" stroke-linecap="round"/><line x1="74" y1="19" x2="84" y2="31" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`,
  l_cyber: `<svg viewBox="0 0 120 50"><defs><linearGradient id="cyG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#00e5ff"/><stop offset="50%" stop-color="#ff007f"/><stop offset="100%" stop-color="#ff6600"/></linearGradient></defs><polygon points="10,14 110,14 102,36 66,36 60,26 54,36 18,36" fill="url(#cyG)" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><line x1="24" y1="21" x2="96" y2="21" stroke="#fff" stroke-width="2" opacity="0.7"/></svg>`,
  l_nerd: `<svg viewBox="0 0 120 50"><circle cx="36" cy="25" r="16" fill="rgba(56,189,248,0.22)" stroke="#f8fafc" stroke-width="3.5"/><circle cx="84" cy="25" r="16" fill="rgba(56,189,248,0.22)" stroke="#f8fafc" stroke-width="3.5"/><path d="M52 25 Q60 20 68 25" stroke="#f8fafc" stroke-width="3.5" fill="none"/></svg>`,
  l_monoc: `<svg viewBox="0 0 120 55"><circle cx="80" cy="24" r="16" fill="rgba(253,224,71,0.2)" stroke="#fde047" stroke-width="3.5"/><path d="M94 32 Q98 46 90 54" stroke="#fde047" stroke-width="2.5" fill="none" stroke-dasharray="3,3"/></svg>`,
  l_star: `<svg viewBox="0 0 120 55"><polygon points="36,8 41,20 54,20 43,28 47,41 36,33 25,41 29,28 18,20 31,20" fill="#fde047" stroke="#fff" stroke-width="2"/><polygon points="84,8 89,20 102,20 91,28 95,41 84,33 73,41 77,28 66,20 79,20" fill="#fde047" stroke="#fff" stroke-width="2"/><line x1="50" y1="24" x2="70" y2="24" stroke="#fde047" stroke-width="3"/></svg>`,
  l_heart: `<svg viewBox="0 0 120 55"><path d="M36 38 L22 24 A10 10 0 0 1 36 12 A10 10 0 0 1 50 24 Z" fill="#ff0055" stroke="#fff" stroke-width="2"/><path d="M84 38 L70 24 A10 10 0 0 1 84 12 A10 10 0 0 1 98 24 Z" fill="#ff0055" stroke="#fff" stroke-width="2"/><line x1="50" y1="22" x2="70" y2="22" stroke="#fff" stroke-width="2.5"/></svg>`,
  l_vr: `<svg viewBox="0 0 120 55"><rect x="12" y="10" width="96" height="32" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/><rect x="20" y="16" width="80" height="20" rx="8" fill="#0f172a"/><path d="M28 26 L92 26" stroke="#00e5ff" stroke-width="3" stroke-linecap="round"/></svg>`,
  l_fire: `<svg viewBox="0 0 120 55"><circle cx="36" cy="26" r="12" fill="#ff6600"/><circle cx="36" cy="26" r="6" fill="#fde047"/><circle cx="84" cy="26" r="12" fill="#ff6600"/><circle cx="84" cy="26" r="6" fill="#fde047"/></svg>`
};

const SVG_BOCA = {
  b_mate: `<svg viewBox="0 0 100 70"><line x1="62" y1="8" x2="48" y2="36" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round"/><circle cx="64" cy="7" r="4" fill="#e2e8f0"/><path d="M30 32 C26 56, 74 56, 70 32 Z" fill="#78350f" stroke="#d97706" stroke-width="3"/><ellipse cx="50" cy="32" rx="20" ry="5" fill="#4ade80" stroke="#cbd5e1" stroke-width="2.5"/></svg>`,
  b_ninja: `<svg viewBox="0 0 120 65"><path d="M22 14 Q60 24 98 14 L90 50 Q60 62 30 50 Z" fill="#0f172a" stroke="#00e5ff" stroke-width="2.5"/><line x1="42" y1="32" x2="78" y2="32" stroke="#00e5ff" stroke-width="3" stroke-linecap="round"/><line x1="48" y1="41" x2="72" y2="41" stroke="#ff6600" stroke-width="3" stroke-linecap="round"/></svg>`,
  b_fino: `<svg viewBox="0 0 120 50"><path d="M60 22 C46 12, 26 28, 16 18 C22 36, 46 34, 60 26 C74 34, 98 36, 104 18 C94 28, 74 12, 60 22 Z" fill="#1e293b" stroke="#fff" stroke-width="1.5"/></svg>`,
  b_rosa: `<svg viewBox="0 0 120 55"><path d="M24 32 Q60 36 88 26" stroke="#22c55e" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="88" cy="24" r="11" fill="#e11d48"/><path d="M82 22 Q88 14 94 24 Q88 30 82 22 Z" fill="#fb7185"/></svg>`,
  b_king: `<svg viewBox="0 0 120 60"><path d="M22 16 Q60 54 98 16" stroke="#fde047" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="8,4"/><polygon points="60,34 68,46 60,56 52,46" fill="#00e5ff" stroke="#fff" stroke-width="1.5"/></svg>`,
  b_pizza: `<svg viewBox="0 0 100 65"><polygon points="50,8 22,54 78,54" fill="#fde047" stroke="#d97706" stroke-width="3" stroke-linejoin="round"/><path d="M20 52 Q50 60 80 52" stroke="#b45309" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="46" cy="34" r="5" fill="#ef4444"/><circle cx="58" cy="44" r="5" fill="#ef4444"/><circle cx="42" cy="46" r="4" fill="#ef4444"/></svg>`
};

const SVG_MASCOTAS = {
  pet_capi: `<svg viewBox="0 0 80 80"><ellipse cx="40" cy="46" rx="26" ry="22" fill="#b45309"/><ellipse cx="52" cy="42" rx="14" ry="11" fill="#92400e"/><circle cx="26" cy="26" r="6" fill="#78350f"/><circle cx="46" cy="36" r="3.5" fill="#0f172a"/><ellipse cx="62" cy="40" rx="3" ry="2" fill="#0f172a"/><path d="M34 22 Q40 12 48 20" stroke="#4ade80" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
  pet_cat: `<svg viewBox="0 0 80 80"><polygon points="16,40 20,12 38,28" fill="#00e5ff"/><polygon points="64,40 60,12 42,28" fill="#00e5ff"/><circle cx="40" cy="46" r="24" fill="#1e293b" stroke="#00e5ff" stroke-width="2.5"/><circle cx="31" cy="44" r="4" fill="#fde047"/><circle cx="49" cy="44" r="4" fill="#fde047"/><polygon points="40,50 37,54 43,54" fill="#ff007f"/></svg>`,
  pet_dog: `<svg viewBox="0 0 80 80"><polygon points="16,38 22,14 36,28" fill="#f59e0b"/><polygon points="64,38 58,14 44,28" fill="#f59e0b"/><circle cx="40" cy="46" r="24" fill="#fbbf24"/><ellipse cx="40" cy="52" rx="14" ry="10" fill="#fef3c7"/><circle cx="31" cy="42" r="3.5" fill="#0f172a"/><circle cx="49" cy="42" r="3.5" fill="#0f172a"/><ellipse cx="40" cy="49" rx="4" ry="3" fill="#0f172a"/></svg>`,
  pet_duck: `<svg viewBox="0 0 80 80"><circle cx="40" cy="44" r="22" fill="#fde047"/><ellipse cx="40" cy="48" rx="11" ry="6" fill="#ff6600"/><circle cx="32" cy="38" r="3.5" fill="#0f172a"/><circle cx="48" cy="38" r="3.5" fill="#0f172a"/></svg>`,
  pet_ghost: `<svg viewBox="0 0 80 80"><path d="M18 42 C18 18, 62 18, 62 42 L62 66 L52 58 L40 66 L28 58 L18 66 Z" fill="#f8fafc" stroke="#38bdf8" stroke-width="2.5"/><circle cx="32" cy="40" r="4" fill="#0f172a"/><circle cx="48" cy="40" r="4" fill="#0f172a"/><ellipse cx="26" cy="46" rx="4" ry="2" fill="#f43f5e" opacity="0.6"/><ellipse cx="54" cy="46" rx="4" ry="2" fill="#f43f5e" opacity="0.6"/></svg>`,
  pet_alien: `<svg viewBox="0 0 80 80"><circle cx="40" cy="44" r="22" fill="#0f172a" stroke="#39ff14" stroke-width="3"/><ellipse cx="40" cy="44" rx="14" ry="8" fill="#39ff14"/><circle cx="40" cy="44" r="4" fill="#fff"/><line x1="40" y1="10" x2="40" y2="22" stroke="#39ff14" stroke-width="3"/><circle cx="40" cy="10" r="4" fill="#ff6600"/></svg>`,
  pet_drag: `<svg viewBox="0 0 80 80"><polygon points="16,24 28,34 18,40" fill="#fde047"/><polygon points="64,24 52,34 62,40" fill="#fde047"/><circle cx="40" cy="46" r="22" fill="#ef4444" stroke="#fde047" stroke-width="2.5"/><circle cx="32" cy="42" r="4" fill="#fde047"/><circle cx="48" cy="42" r="4" fill="#fde047"/></svg>`
};

window.SVG_STORE = {
  avatares: SVG_AVATARS,
  sombreros: SVG_SOMBREROS,
  lentes: SVG_LENTES,
  boca: SVG_BOCA,
  mascotas: SVG_MASCOTAS
};


function renderAvatar(base, accesorios = {}, size = 44, fotoUrl = "") {
  if (base && typeof base === "object") {
    const uObj = base;
    accesorios = uObj.accesorios || {};
    fotoUrl = uObj.fotoPerfil || "";
    base = uObj.avatar || "e_smile";
  }
  const acc = { ...ACCESORIOS_DEFAULT, ...(accesorios || {}) };
  const foto = urlFotoSegura(fotoUrl);
  const avatarId = acc.emoji && SVG_AVATARS[acc.emoji] ? acc.emoji : "e_smile";
  const svgBase = SVG_AVATARS[avatarId] || SVG_AVATARS.e_smile;
  const svgSombrero = SVG_SOMBREROS[acc.sombrero] || "";
  const svgLentes   = SVG_LENTES[acc.lentes] || "";
  const svgBoca     = SVG_BOCA[acc.bigote] || "";
  const svgMascota  = SVG_MASCOTAS[acc.mascota] || "";
  const marcoAcc    = ACCESORIOS.marcos.find(a => a.id === acc.marco);
  const efectoAcc   = ACCESORIOS.efectos.find(a => a.id === acc.efecto);

  const offY = Math.max(-25, Math.min(25, Number(acc.offsetY) || 0)) * (size / 80);
  const sc   = Math.max(0.75, Math.min(1.35, (Number(acc.scale) || 100) / 100));

  const auraStyle  = efectoAcc?.css || "";
  const marcoStyle = marcoAcc?.css || "box-shadow:0 0 0 2px rgba(255,255,255,0.16);";
  const innerContent = foto
    ? `<img src="${foto}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block">`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">${svgBase}</div>`;

  return `<div class="av-plato-wrap" style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;flex-shrink:0;vertical-align:middle;overflow:visible !important;">
    ${auraStyle ? `<div class="av-aura-layer" style="position:absolute;inset:-4px;border-radius:50%;pointer-events:none;${auraStyle}"></div>` : ""}
    <div class="av-frame-ring" style="position:relative;width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#131722;${marcoStyle}">
      <div style="width:100%;height:100%;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;">
        ${innerContent}
      </div>
    </div>
    ${svgSombrero ? `<div style="position:absolute;top:${Math.round(-size * 0.36 + offY)}px;left:50%;width:${Math.round(size * 0.95)}px;transform:translateX(-50%) scale(${sc});pointer-events:none;z-index:5;filter:drop-shadow(0 3px 5px rgba(0,0,0,0.6))">${svgSombrero}</div>` : ""}
    ${svgLentes ? `<div style="position:absolute;top:${Math.round(size * 0.18 + offY)}px;left:50%;width:${Math.round(size * 0.86)}px;transform:translateX(-50%) scale(${sc});pointer-events:none;z-index:4;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.55))">${svgLentes}</div>` : ""}
    ${svgBoca ? `<div style="position:absolute;bottom:${Math.round(-size * 0.14 - offY * 0.5)}px;left:50%;width:${Math.round(size * 0.76)}px;transform:translateX(-50%) scale(${sc});pointer-events:none;z-index:4;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6))">${svgBoca}</div>` : ""}
    ${svgMascota ? `<div class="av-pet-float" style="position:absolute;bottom:${Math.round(-size * 0.14)}px;right:${Math.round(-size * 0.24)}px;width:${Math.round(size * 0.52)}px;height:${Math.round(size * 0.52)}px;pointer-events:none;z-index:6;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.7))">${svgMascota}</div>` : ""}
  </div>`;
}
window.renderAvatar = renderAvatar;

