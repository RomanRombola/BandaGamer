// storage.js — Capa de datos BandaGamer V2
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
