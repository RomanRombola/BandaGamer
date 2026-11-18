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

// Si el SDK de Firebase no llegó a cargar (bloqueador de anuncios, red de colegio o
// empresa, sin conexión) la página tiene que seguir funcionando en modo invitado.
// Antes todo el sitio quedaba en blanco con "firebase is not defined".
const FIREBASE_OK = typeof firebase !== "undefined" && typeof firebase.initializeApp === "function";

let _auth, _db;
if (FIREBASE_OK) {
  // Inicializar Firebase (evitar duplicados si ya lo inicializaron Gartic o Impostor)
  if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
  _auth = firebase.auth();
  _db   = firebase.firestore();
} else {
  console.warn("[Storage] Firebase no está disponible: se usa solo el modo invitado.");
  _auth = {
    currentUser: null,
    onAuthStateChanged(cb) { setTimeout(() => cb(null), 0); return () => {}; },
    signInWithPopup() { return Promise.reject(Object.assign(new Error("Firebase no disponible"), { code: "firebase/no-disponible" })); },
    signOut() { return Promise.resolve(); },
  };
  _db = null;
}

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
    accesorios:   usuario.accesorios || null,
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

// ── Progreso diario (bonus, misiones y topes de premios) ──────────────────
// Se guarda DENTRO del usuario (Firestore o localStorage del invitado), no en una clave
// suelta del navegador: antes el bonus se volvía a cobrar en otro dispositivo o en
// incógnito, y las misiones (que medían totales acumulados) se cobraban todos los días.
// El día es el del reloj local del jugador (antes era UTC: en Argentina cambiaba a las 21 h).
const LIMITES_DIARIOS = {
  partidas_premiadas: 40,   // partidas que dan +5 XP y +5 VicioCoins por día
  records_premiados:  10,   // récords que dan premio extra por día
};
const PREMIOS = {
  partida:       { xp: 5,  monedas: 5 },
  record:        { xp: 25, monedas: 20 },   // se suma a la partida: total +30 XP y +25 VicioCoins
  primer_record: { xp: 10, monedas: 20 },
  bonus_diario:  { xp: 25, monedas: 50 },
};
// tipo "diaria": se reinicia cada día y mide lo hecho HOY · tipo "unica": se cobra una sola vez
const MISIONES = [
  { id: "m_jugar1", tipo: "diaria", titulo: "Calentando motores", desc: "Jugá al menos 1 partida hoy",  meta: 1,   premio: 25, xp: 30, progreso: (u, d) => d.partidas },
  { id: "m_fav3",   tipo: "unica",  titulo: "Curador del Vicio",  desc: "Marcá 3 juegos favoritos",     meta: 3,   premio: 40, xp: 30, progreso: (u)    => (u.favoritos || []).length },
  { id: "m_xp300",  tipo: "diaria", titulo: "Subiendo de Rango",  desc: "Ganá 300 XP hoy",              meta: 300, premio: 60, xp: 30, progreso: (u, d) => d.xp },
];

function _hoyLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
// Devuelve (y si hace falta crea/reinicia) el bloque diario del usuario. Muta u.
function _diarioDe(u) {
  const hoy = _hoyLocal();
  if (!u.diario || typeof u.diario !== "object" || u.diario.fecha !== hoy) {
    u.diario = { fecha: hoy, partidas: 0, xp: 0, partidas_premiadas: 0, records_premiados: 0, bonus: false, reclamadas: [] };
  }
  const d = u.diario;
  if (!Array.isArray(d.reclamadas)) d.reclamadas = [];
  for (const k of ["partidas", "xp", "partidas_premiadas", "records_premiados"]) d[k] = Number(d[k]) || 0;
  return d;
}
// Suma XP dentro de un mutador (actualiza nivel y el contador diario). Devuelve si subió de nivel.
function _sumarXPEn(u, cantidad) {
  const antes = u.nivel || 1;
  u.xp = (u.xp || 0) + cantidad;
  u.nivel = _nivelPorXP(u.xp);
  _diarioDe(u).xp += cantidad;
  return u.nivel > antes;
}

// ── Ranking global ────────────────────────────────────────────────────────
// Escribe un resumen del usuario en /ranking para el leaderboard público.
async function _actualizarRanking(u) {
  const user = _auth.currentUser;
  if (!user) return;
  await _db.doc(`ranking/${user.uid}`).set({
    uid:        user.uid,
    nombre:     u.nombre,
    avatar:     u.avatar || '😊',
    accesorios: u.accesorios || null,       // sin esto el ranking mostraba a todos con el avatar por defecto
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
        _diarioDe(u).partidas += 1;
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
    const usuario = await actualizarUsuario(u => { subioNivel = _sumarXPEn(u, cantidad); });
    if (subioNivel) invalidarCacheRanking();
    return { usuario, subioNivel, nuevoNivel: usuario.nivel };
  }

  // ── Premios diarios ──────────────────────────────────────────────────────
  // Todos validan y cobran dentro de la misma transacción: no se puede cobrar dos veces
  // aunque haya dos pestañas abiertas ni pasando otro premio desde la consola.
  async function getEstadoDiario() {
    const u = await getUsuario();
    const d = _diarioDe(u);
    const misiones = MISIONES.map(m => {
      const actual = Math.min(Number(m.progreso(u, d)) || 0, m.meta);
      const reclamada = m.tipo === "unica" ? (u.misiones_unicas || []).includes(m.id) : d.reclamadas.includes(m.id);
      return { id: m.id, tipo: m.tipo, titulo: m.titulo, desc: m.desc, meta: m.meta, premio: m.premio, actual, reclamada, lista: actual >= m.meta && !reclamada };
    });
    return { usuario: u, bonusReclamado: !!d.bonus, misiones, limites: LIMITES_DIARIOS, diario: d };
  }

  async function reclamarBonusDiario() {
    let error = null, subioNivel = false;
    const usuario = await actualizarUsuario(u => {
      error = null;
      const d = _diarioDe(u);
      if (d.bonus) { error = "Ya reclamaste el bonus de hoy"; return; }
      d.bonus = true;
      u.monedas = (u.monedas || 0) + PREMIOS.bonus_diario.monedas;
      subioNivel = _sumarXPEn(u, PREMIOS.bonus_diario.xp);
    });
    if (subioNivel) invalidarCacheRanking();
    return { ok: !error, error, usuario, subioNivel, nuevoNivel: usuario.nivel, premio: PREMIOS.bonus_diario };
  }

  async function reclamarMision(id) {
    const m = MISIONES.find(x => x.id === id);
    if (!m) return { ok: false, error: "Misión inválida" };
    let error = null, subioNivel = false;
    const usuario = await actualizarUsuario(u => {
      error = null;
      const d = _diarioDe(u);
      u.misiones_unicas = Array.isArray(u.misiones_unicas) ? u.misiones_unicas : [];
      const ya = m.tipo === "unica" ? u.misiones_unicas.includes(m.id) : d.reclamadas.includes(m.id);
      if (ya) { error = "Ya reclamaste esta misión"; return; }
      if ((Number(m.progreso(u, d)) || 0) < m.meta) { error = "Todavía no completaste la misión"; return; }
      if (m.tipo === "unica") u.misiones_unicas.push(m.id); else d.reclamadas.push(m.id);
      u.monedas = (u.monedas || 0) + m.premio;
      subioNivel = _sumarXPEn(u, m.xp);
    });
    if (subioNivel) invalidarCacheRanking();
    return { ok: !error, error, usuario, subioNivel, nuevoNivel: usuario.nivel, premio: m.premio, xp: m.xp };
  }

  // Premio por partida terminada (y extra si fue récord), con tope diario.
  async function premiarPartida({ esRecord = false, primerRecord = false } = {}) {
    let xp = 0, monedas = 0, subioNivel = false;
    const usuario = await actualizarUsuario(u => {
      const d = _diarioDe(u);
      xp = 0; monedas = 0;
      if (d.partidas_premiadas < LIMITES_DIARIOS.partidas_premiadas) {
        d.partidas_premiadas++;
        xp += PREMIOS.partida.xp; monedas += PREMIOS.partida.monedas;
      }
      if (esRecord && d.records_premiados < LIMITES_DIARIOS.records_premiados) {
        d.records_premiados++;
        const p = primerRecord ? PREMIOS.primer_record : PREMIOS.record;
        xp += p.xp; monedas += p.monedas;
      }
      u.monedas = (u.monedas || 0) + monedas;
      subioNivel = xp > 0 && _sumarXPEn(u, xp);
    });
    if (subioNivel) invalidarCacheRanking();
    return { xp, monedas, subioNivel, nuevoNivel: usuario.nivel, usuario };
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
    if (!_db) return [];
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
    if (!_db) return null;
    try {
      const doc = await _db.doc(`ranking/${uid}`).get();
      return doc.exists ? doc.data() : null;
    } catch (e) {
      return null;
    }
  }

  // Migra el progreso de invitado (localStorage) a Firestore cuando el usuario entra con Google.
  // Solo se ejecuta si la cuenta de Google todavía no tiene datos. Antes buscaba únicamente la
  // clave V1 ("gor2games_usuario") y el progreso del invitado actual (bandagamer_usuario_v2)
  // se perdía al conectar la cuenta.
  async function migrarLocalAFirestore() {
    const user = _auth.currentUser;
    if (!user || !_db) return;
    try {
      const docFirestore = await _db.doc(`usuarios/${user.uid}`).get();
      if (docFirestore.exists) return;

      let clave = null, localData = null;
      for (const k of [STORAGE_KEY, "gor2games_usuario"]) {
        try {
          const d = JSON.parse(localStorage.getItem(k) || "null");
          if (d && d.nombre) { clave = k; localData = d; break; }
        } catch (e) {}
      }
      if (!localData) return;

      const merged = {
        ...USUARIO_DEFAULT,
        ...localData,
        uid:    user.uid,
        nombre: localData.nombre || user.displayName || "Jugador",
        fecha_registro: localData.fecha_registro || new Date().toISOString(),
      };
      delete merged.esInvitado;
      merged.nivel = _nivelPorXP(merged.xp);
      await _db.doc(`usuarios/${user.uid}`).set(merged);

      if (clave === STORAGE_KEY) {
        try {
          const visitas = JSON.parse(localStorage.getItem(VISITAS_KEY) || "null");
          if (visitas && typeof visitas === "object") await _db.doc(`visitas/${user.uid}`).set(visitas, { merge: true });
        } catch (e) {}
        // El progreso ya vive en la cuenta: si no se borra, reaparecía como invitado al cerrar sesión
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(VISITAS_KEY);
      }
      _invalidateCache();
      console.log("[Storage] Progreso de invitado migrado a la cuenta de Google.");
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
          accesorios: perfil.accesorios || null,
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
    if (!_db) return [];
    try {
      const snap = await _db.collection(_board(juegoId, modo)).orderBy("score", orden).limit(limite).get();
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.warn("[Storage] getRankingJuego:", e.message);
      return [];
    }
  }

  async function getPuntajesDe(juegoId, modo, uids) {
    if (!_db) return [];
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
    getEstadoDiario,
    reclamarBonusDiario,
    reclamarMision,
    premiarPartida,
    MISIONES,
    LIMITES_DIARIOS,
    FIREBASE_OK,
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
