// storage.js — Capa de datos de Gor2Games
// Toda lectura/escritura de localStorage pasa por aquí.
// Preparado para migrar a Firebase reemplazando las funciones internas.

const STORAGE_KEY = "gor2games_usuario";
const VISITAS_KEY = "gor2games_visitas";

const USUARIO_DEFAULT = {
  nombre: "",
  xp: 0,
  nivel: 1,
  monedas: 0,
  favoritos: [],
  historial: [],
  tiempo_jugado_total: 0,
  ultima_sesion: null
};

const Storage = (() => {

  // Lee el usuario del localStorage. Si hay error, retorna default.
  function getUsuario() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...USUARIO_DEFAULT };
      const parsed = JSON.parse(raw);
      // Merge defensivo: asegura que todas las claves existan
      return { ...USUARIO_DEFAULT, ...parsed };
    } catch (e) {
      console.warn("[Storage] JSON inválido, retornando default:", e);
      return { ...USUARIO_DEFAULT };
    }
  }

  // Guarda el objeto usuario en localStorage.
  function setUsuario(usuario) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
      return true;
    } catch (e) {
      console.error("[Storage] No se pudo guardar usuario:", e);
      return false;
    }
  }

  // Reinicia el usuario a los valores por defecto.
  function resetUsuario() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(VISITAS_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Alterna un juego en la lista de favoritos del usuario.
  function toggleFavorito(juegoId) {
    const u = getUsuario();
    const idx = u.favoritos.indexOf(juegoId);
    if (idx === -1) {
      u.favoritos.push(juegoId);
    } else {
      u.favoritos.splice(idx, 1);
    }
    setUsuario(u);
    return u.favoritos.includes(juegoId);
  }

  // Devuelve true si el juego está en favoritos.
  function esFavorito(juegoId) {
    const u = getUsuario();
    return u.favoritos.includes(juegoId);
  }

  // Registra una visita a un juego y lo agrega al historial.
  function registrarVisita(juegoId) {
    try {
      // Contador de visitas por juego
      const raw = localStorage.getItem(VISITAS_KEY);
      const visitas = raw ? JSON.parse(raw) : {};
      visitas[juegoId] = (visitas[juegoId] || 0) + 1;
      localStorage.setItem(VISITAS_KEY, JSON.stringify(visitas));

      // Historial en el usuario (últimos 20, sin duplicados consecutivos)
      const u = getUsuario();
      if (u.historial[0] !== juegoId) {
        u.historial.unshift(juegoId);
        if (u.historial.length > 20) u.historial.pop();
      }
      u.ultima_sesion = new Date().toISOString();
      setUsuario(u);
    } catch (e) {
      console.warn("[Storage] Error al registrar visita:", e);
    }
  }

  // Devuelve el contador de visitas de un juego específico.
  function getContadorVisitas(juegoId) {
    try {
      const raw = localStorage.getItem(VISITAS_KEY);
      if (!raw) return 0;
      const visitas = JSON.parse(raw);
      return visitas[juegoId] || 0;
    } catch (e) {
      return 0;
    }
  }

  // Devuelve los IDs de los juegos más jugados, ordenados por visitas.
  function getMasJugados(limite = 5) {
    try {
      const raw = localStorage.getItem(VISITAS_KEY);
      if (!raw) return [];
      const visitas = JSON.parse(raw);
      return Object.entries(visitas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limite)
        .map(([id]) => id);
    } catch (e) {
      return [];
    }
  }

  // Devuelve los IDs del historial del usuario.
  function getHistorial(limite = 5) {
    const u = getUsuario();
    return u.historial.slice(0, limite);
  }

  // Suma XP al usuario y calcula el nuevo nivel.
  function sumarXP(cantidad) {
    const u = getUsuario();
    u.xp += cantidad;
    const nuevoNivel = Math.min(Math.floor(u.xp / 1000) + 1, 10);
    const subioNivel = nuevoNivel > u.nivel;
    u.nivel = nuevoNivel;
    setUsuario(u);
    return { usuario: u, subioNivel, nuevoNivel };
  }

  // Suma monedas al usuario.
  function sumarMonedas(cantidad) {
    const u = getUsuario();
    u.monedas += cantidad;
    setUsuario(u);
    return u;
  }

  // Suma tiempo jugado (en segundos).
  function sumarTiempoJugado(segundos) {
    const u = getUsuario();
    u.tiempo_jugado_total = (u.tiempo_jugado_total || 0) + segundos;
    setUsuario(u);
    return u;
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
    sumarTiempoJugado
  };

})();
