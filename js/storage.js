// storage.js — Capa de datos Gor2Games V2
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

// ── Driver Firestore (V2) ─────────────────────────────────────────────────
const driverFirestore = {
  async leer() {
    const user = _auth.currentUser;
    if (!user) return { ...USUARIO_DEFAULT };
    try {
      const doc = await _db.doc(`usuarios/${user.uid}`).get();
      if (!doc.exists) {
        // Primera vez: crear perfil base con datos de Google
        const base = {
          ...USUARIO_DEFAULT,
          uid:            user.uid,
          nombre:         user.displayName || "GorPlayer",
          fecha_registro: new Date().toISOString(),
        };
        await _db.doc(`usuarios/${user.uid}`).set(base);
        return base;
      }
      return { ...USUARIO_DEFAULT, ...doc.data() };
    } catch (e) {
      console.error("[Storage] Error leyendo Firestore:", e);
      return { ...USUARIO_DEFAULT };
    }
  },

  async escribir(usuario) {
    const user = _auth.currentUser;
    if (!user) return false;
    try {
      // Siempre mantener uid sincronizado
      usuario.uid = user.uid;
      if (!usuario.fecha_registro) usuario.fecha_registro = new Date().toISOString();
      await _db.doc(`usuarios/${user.uid}`).set(usuario, { merge: true });
      // Actualizar ranking en paralelo (no bloqueante)
      _actualizarRanking(usuario).catch(() => {});
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
      return true;
    } catch (e) {
      return false;
    }
  }
};

// ── Driver localStorage (fallback para no autenticados) ───────────────────
const STORAGE_KEY = "gor2games_usuario_v2";
const VISITAS_KEY = "gor2games_visitas_v2";

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
// Devuelve Firestore si hay usuario autenticado, localStorage si no.
function _driver() {
  return _auth.currentUser ? driverFirestore : driverLocal;
}

// ── Ranking global ────────────────────────────────────────────────────────
// Escribe un resumen del usuario en /ranking para el leaderboard público.
async function _actualizarRanking(u) {
  const user = _auth.currentUser;
  if (!user) return;
  await _db.doc(`ranking/${user.uid}`).set({
    uid:    user.uid,
    nombre: u.nombre,
    avatar: u.avatar,
    xp:     u.xp,
    nivel:  u.nivel,
    juegos_jugados: u.juegos_jugados || 0,
    ultima_sesion:  u.ultima_sesion || null,
  }, { merge: true });
}

// ── API pública ───────────────────────────────────────────────────────────
const Storage = (() => {

  async function getUsuario() {
    return await _driver().leer();
  }

  async function setUsuario(usuario) {
    return await _driver().escribir(usuario);
  }

  async function resetUsuario() {
    return await _driver().limpiar();
  }

  async function toggleFavorito(juegoId) {
    const u = await getUsuario();
    const idx = u.favoritos.indexOf(juegoId);
    if (idx === -1) u.favoritos.push(juegoId);
    else u.favoritos.splice(idx, 1);
    await setUsuario(u);
    return u.favoritos.includes(juegoId);
  }

  async function esFavorito(juegoId) {
    const u = await getUsuario();
    return u.favoritos.includes(juegoId);
  }

  async function registrarVisita(juegoId) {
    try {
      const visitas = await _driver().leerVisitas();
      visitas[juegoId] = (visitas[juegoId] || 0) + 1;
      await _driver().escribirVisitas(visitas);

      const u = await getUsuario();
      if (u.historial[0] !== juegoId) {
        u.historial.unshift(juegoId);
        if (u.historial.length > 20) u.historial.pop();
      }
      u.juegos_jugados = (u.juegos_jugados || 0) + 1;
      u.ultima_sesion  = new Date().toISOString();
      await setUsuario(u);
    } catch (e) {
      console.warn("[Storage] Error al registrar visita:", e);
    }
  }

  async function getContadorVisitas(juegoId) {
    const visitas = await _driver().leerVisitas();
    return visitas[juegoId] || 0;
  }

  async function getMasJugados(limite = 5) {
    const visitas = await _driver().leerVisitas();
    return Object.entries(visitas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limite)
      .map(([id]) => id);
  }

  async function getHistorial(limite = 5) {
    const u = await getUsuario();
    return u.historial.slice(0, limite);
  }

  async function sumarXP(cantidad) {
    const u = await getUsuario();
    u.xp += cantidad;
    const nuevoNivel = Math.min(Math.floor(u.xp / 1000) + 1, 10);
    const subioNivel = nuevoNivel > u.nivel;
    u.nivel = nuevoNivel;
    await setUsuario(u);
    // Si subió de nivel, invalidar caché del ranking para que se refresque
    if (subioNivel) invalidarCacheRanking();
    return { usuario: u, subioNivel, nuevoNivel };
  }

  async function sumarMonedas(cantidad) {
    const u = await getUsuario();
    u.monedas += cantidad;
    await setUsuario(u);
    return u;
  }

  async function sumarTiempoJugado(segundos) {
    const u = await getUsuario();
    u.tiempo_jugado_total = (u.tiempo_jugado_total || 0) + segundos;
    await setUsuario(u);
    return u;
  }

  async function desbloquearLogro(logroId) {
    const u = await getUsuario();
    if (u.logros.includes(logroId)) return false;
    u.logros.push(logroId);
    await setUsuario(u);
    return true;
  }

  async function tieneLogro(logroId) {
    const u = await getUsuario();
    return u.logros.includes(logroId);
  }

  // Devuelve los top N jugadores del ranking global.
  // Optimización B: caché local de 3 minutos para no hacer query en cada apertura.
  const _rankingCache = { data: null, ts: 0 };
  const RANKING_TTL = 3 * 60 * 1000; // 3 minutos en ms

  async function getRankingGlobal(limite = 50) {
    // Si el caché es fresco, devolver sin ir a Firestore
    const ahora = Date.now();
    if (_rankingCache.data && (ahora - _rankingCache.ts) < RANKING_TTL) {
      return _rankingCache.data.slice(0, limite);
    }
    try {
      const snap = await _db.collection("ranking")
        .orderBy("xp", "desc")
        .limit(limite)
        .get();
      const lista = snap.docs.map(d => d.data());
      // Guardar en caché
      _rankingCache.data = lista;
      _rankingCache.ts = ahora;
      return lista;
    } catch (e) {
      console.warn("[Storage] Error leyendo ranking:", e);
      // Si falla Firestore, devolver caché viejo si existe
      return _rankingCache.data || [];
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

  // Migra datos de localStorage a Firestore cuando el usuario hace login.
  // Solo se ejecuta una vez (si Firestore no tiene datos del usuario todavía).
  async function migrarLocalAFirestore() {
    const user = _auth.currentUser;
    if (!user) return;
    try {
      const docFirestore = await _db.doc(`usuarios/${user.uid}`).get();
      if (docFirestore.exists) return; // ya tiene datos en Firestore, no migrar

      const rawLocal = localStorage.getItem("gor2games_usuario"); // clave V1
      if (!rawLocal) return;

      const localData = JSON.parse(rawLocal);
      if (!localData.nombre) return;

      // Combinar datos locales con uid de Google
      const merged = {
        ...USUARIO_DEFAULT,
        ...localData,
        uid:    user.uid,
        nombre: localData.nombre || user.displayName || "GorPlayer",
        fecha_registro: localData.fecha_registro || new Date().toISOString(),
      };
      await _db.doc(`usuarios/${user.uid}`).set(merged);
      console.log("[Storage] Datos migrados de localStorage a Firestore.");
    } catch (e) {
      console.warn("[Storage] Error en migración:", e);
    }
  }

  return {
    getUsuario,
    setUsuario,
    resetUsuario,
    toggleFavorito,
    esFavorito,
    registrarVisita,
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
    // Exponer auth para que main.js pueda escuchar cambios de sesión
    auth: _auth,
  };

})();
