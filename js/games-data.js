// games-data.js — Catálogo Gor2Games

const juegos = [
  // ── LOCALES (siempre funcionan) ──────────────────────────────────────────
  { id:"game-011", nombre:"Snake Gor2",         categoria:"arcade",       tags:["serpiente","clasico","musica"],         thumbnail:"", embed_url:"games/juego-local-1.html",  descripcion:"Snake con gráficos mejorados, partículas y música chiptune.",                tipo:"local" },
  { id:"game-012", nombre:"Breakout Neon",       categoria:"arcade",       tags:["pelota","ladrillos","retro"],           thumbnail:"", embed_url:"games/juego-local-2.html",  descripcion:"Rompé todos los ladrillos con la pelota. Estética neon.",                   tipo:"local" },
  { id:"game-013", nombre:"Memory Match",        categoria:"puzzle",       tags:["memoria","cartas","parejas"],           thumbnail:"", embed_url:"games/juego-local-3.html",  descripcion:"Encontrá todos los pares. Entrenás la memoria.",                            tipo:"local" },
  { id:"game-014", nombre:"Space Shooter",       categoria:"accion",       tags:["naves","disparos","espacio","shooter"], thumbnail:"", embed_url:"games/juego-local-4.html",  descripcion:"5 tipos de enemigos, power-ups, partículas. Shooter espacial.",            tipo:"local" },
  { id:"game-015", nombre:"Gor2 Run",        categoria:"accion",       tags:["correr","saltar","correr","saltar","ciudad","adelgazar"],     thumbnail:"", embed_url:"games/juego-local-5.html",  descripcion:"Saltá la comida chatarra. El personaje adelgaza a medida que avanzás. Bichos voladores incluidos.",    tipo:"local" },
  { id:"game-016", nombre:"2048 Gor2",           categoria:"puzzle",       tags:["numeros","logica","2048"],              thumbnail:"", embed_url:"games/juego-local-6.html",  descripcion:"Combiná losetas para llegar al 2048. Con swipe mobile.",                   tipo:"local" },
  { id:"game-017", nombre:"Tetris Gor2",         categoria:"puzzle",       tags:["bloques","tetris","lineas"],            thumbnail:"", embed_url:"games/juego-local-7.html",  descripcion:"Tetris clásico con ghost piece, niveles y pausa.",                         tipo:"local" },
  { id:"game-018", nombre:"Buscaminas",          categoria:"puzzle",       tags:["minas","logica","clasico"],             thumbnail:"", embed_url:"games/juego-local-8.html",  descripcion:"Buscaminas propio. Fácil, Medio y Difícil. Flag con click derecho.",       tipo:"local" },
  { id:"game-019", nombre:"Wordle ES",           categoria:"puzzle",       tags:["palabras","adivinar","español"],        thumbnail:"", embed_url:"games/juego-local-9.html",  descripcion:"Adiviná la palabra de 5 letras en 6 intentos. En español.",               tipo:"local" },
  { id:"game-020", nombre:"¡Adrián Come!",       categoria:"accion",       tags:["atrapar","comida","esquivar"],          thumbnail:"", embed_url:"games/juego-local-10.html", descripcion:"Ayudá a Adrián a atrapar comida y esquivar la basura.",                   tipo:"local" },
  { id:"game-022", nombre:"Impostor Online",     categoria:"multijugador", tags:["online","social","palabras","impostor"],thumbnail:"", embed_url:"impostor/index.html",        descripcion:"Impostor entre amigos. Online en tiempo real. Hasta 10 jugadores.",       tipo:"local" },
  { id:"game-024", nombre:"Gor2 Phone", categoria:"multijugador", tags:["online","dibujo","adivinar","cadena","telefono"], thumbnail:"", embed_url:"gartic-phone/index.html", descripcion:"El teléfono descompuesto. Escribí una frase, dibujá lo que ves, adiviná el dibujo. Con cadenas paralelas.", tipo:"local" },

  // ── IFRAME (pueden fallar dependiendo del sitio) ─────────────────────────
  { id:"game-001", nombre:"Cookie Clicker",  categoria:"arcade",     tags:["idle","clicker"],        thumbnail:"", embed_url:"https://orteil.dashnet.org/cookieclicker/",   descripcion:"Hacé click en la galletita. El idle game más adictivo.",          tipo:"iframe" },
  { id:"game-003", nombre:"Slither.io",      categoria:"accion",     tags:["serpiente","io","multi"], thumbnail:"", embed_url:"https://slither.io/",                         descripcion:"Serpiente multijugador. Comé orbes y crecé.",                    tipo:"iframe" },
  { id:"game-004", nombre:"Krunker.io",      categoria:"accion",     tags:["fps","shooter","multi"],  thumbnail:"", embed_url:"https://krunker.io/",                         descripcion:"FPS multijugador en el navegador.",                              tipo:"iframe" },
  { id:"game-005", nombre:"HexGL Racing",    categoria:"carreras",   tags:["naves","3d","webgl"],     thumbnail:"", embed_url:"https://hexgl.bkcore.com/play/",              descripcion:"Carreras de naves futuristas en WebGL.",                         tipo:"iframe" },
  { id:"game-006", nombre:"Diep.io",         categoria:"accion",     tags:["tanques","io","multi"],   thumbnail:"", embed_url:"https://diep.io/",                            descripcion:"Tanques multijugador. Evolucioná y destruí a todos.",            tipo:"iframe" },
  { id:"game-009", nombre:"Pacman",          categoria:"arcade",     tags:["clasico","laberinto"],    thumbnail:"", embed_url:"https://freepacman.org/",                     descripcion:"Pacman clásico en el navegador.",                                tipo:"iframe" },
];

if (typeof module !== "undefined") module.exports = { juegos };
