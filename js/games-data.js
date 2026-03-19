const juegos = [
  { id:"game-011", nombre:"Snake Gor2", categoria:"arcade", tags:["serpiente","clasico","musica"], thumbnail:"", embed_url:"games/juego-local-1.html", descripcion:"Snake con gráficos mejorados, partículas y música chiptune.", tipo:"local" },
  { id:"game-012", nombre:"Breakout Neon", categoria:"arcade", tags:["pelota","ladrillos","retro"], thumbnail:"", embed_url:"games/juego-local-2.html", descripcion:"Rompé todos los ladrillos con la pelota. Estética neon.", tipo:"local" },
  { id:"game-013", nombre:"Memory Match", categoria:"puzzle", tags:["memoria","cartas","parejas"], thumbnail:"", embed_url:"games/juego-local-3.html", descripcion:"Encontrá todos los pares. Entrenás la memoria.", tipo:"local" },
  { id:"game-014", nombre:"Space Shooter", categoria:"accion", tags:["naves","disparos","espacio"], thumbnail:"", embed_url:"games/juego-local-4.html", descripcion:"Destruí oleadas de naves enemigas con partículas.", tipo:"local" },
  { id:"game-015", nombre:"Dino Runner", categoria:"accion", tags:["dinosaurio","saltar","infinito"], thumbnail:"", embed_url:"games/juego-local-5.html", descripcion:"Saltá obstáculos infinitamente. Inspirado en el dino de Chrome.", tipo:"local" },
  { id:"game-016", nombre:"2048 Gor2", categoria:"puzzle", tags:["numeros","logica","2048"], thumbnail:"", embed_url:"games/juego-local-6.html", descripcion:"Combiná losetas para llegar al 2048. Con swipe mobile.", tipo:"local" },
  { id:"game-017", nombre:"Tetris Gor2", categoria:"puzzle", tags:["bloques","tetris","lineas"], thumbnail:"", embed_url:"games/juego-local-7.html", descripcion:"Tetris clásico con ghost piece, niveles y pausa.", tipo:"local" },
  { id:"game-018", nombre:"Buscaminas", categoria:"puzzle", tags:["minas","logica","clasico"], thumbnail:"", embed_url:"games/juego-local-8.html", descripcion:"Buscaminas propio. Fácil, Medio y Difícil.", tipo:"local" },
  { id:"game-019", nombre:"Wordle ES", categoria:"puzzle", tags:["palabras","adivinar","español"], thumbnail:"", embed_url:"games/juego-local-9.html", descripcion:"Adiviná la palabra de 5 letras en 6 intentos. En español.", tipo:"local" },
  { id:"game-020", nombre:"¡Adrián Come!", categoria:"accion", tags:["atrapar","comida","esquivar","original"], thumbnail:"", embed_url:"games/juego-local-10.html", descripcion:"Ayudá a Adrián a atrapar comida y esquivar la basura.", tipo:"local" },
  { id:"game-022", nombre:"El Impostor", categoria:"multijugador", tags:["online","social","palabras","impostor"], thumbnail:"", embed_url:"impostor/index.html", descripcion:"Juego de palabras online. Todos tienen la misma palabra... menos el impostor. Hasta 10 jugadores.", tipo:"local" },
  { id:"game-001", nombre:"Cookie Clicker", categoria:"arcade", tags:["idle","clicker","galletitas"], thumbnail:"", embed_url:"https://orteil.dashnet.org/cookieclicker/", descripcion:"Hacé click en la galletita. El idle game más adictivo.", tipo:"iframe" },
  { id:"game-002", nombre:"Tetris React", categoria:"puzzle", tags:["bloques","tetris","react"], thumbnail:"", embed_url:"https://chvin.github.io/react-tetris/", descripcion:"Tetris hecho en React. Versión alternativa.", tipo:"iframe" },
  { id:"game-003", nombre:"Slither.io", categoria:"accion", tags:["serpiente","io","multijugador"], thumbnail:"", embed_url:"https://slither.io/", descripcion:"Serpiente multijugador. Comé orbes y crecé.", tipo:"iframe" },
  { id:"game-004", nombre:"Krunker.io", categoria:"accion", tags:["fps","shooter","multijugador"], thumbnail:"", embed_url:"https://krunker.io/", descripcion:"FPS multijugador en el navegador. Sin instalación.", tipo:"iframe" },
  { id:"game-005", nombre:"HexGL Racing", categoria:"carreras", tags:["naves","velocidad","3d","webgl"], thumbnail:"", embed_url:"https://hexgl.bkcore.com/play/", descripcion:"Carreras de naves futuristas en WebGL.", tipo:"iframe" },
  { id:"game-006", nombre:"Diep.io", categoria:"accion", tags:["tanques","io","multijugador"], thumbnail:"", embed_url:"https://diep.io/", descripcion:"Tanques multijugador. Evolucioná y destruí a todos.", tipo:"iframe" },
  { id:"game-007", nombre:"2048 Original", categoria:"puzzle", tags:["numeros","logica","original"], thumbnail:"", embed_url:"https://gabrielecirulli.github.io/2048/", descripcion:"El 2048 original de Gabriele Cirulli.", tipo:"iframe" },
  { id:"game-008", nombre:"Gartic.io", categoria:"accion", tags:["dibujo","adivinar","multijugador"], thumbnail:"", embed_url:"https://gartic.io/", descripcion:"Pictionary online. Dibujá y adiviná con otros.", tipo:"iframe" },
  { id:"game-009", nombre:"Pacman", categoria:"arcade", tags:["clasico","laberinto","fantasmas"], thumbnail:"", embed_url:"https://freepacman.org/", descripcion:"Pacman clásico en el navegador.", tipo:"iframe" },
  { id:"game-010", nombre:"Wordle Original", categoria:"puzzle", tags:["palabras","adivinar","daily"], thumbnail:"", embed_url:"https://wordle.danielfrg.com/", descripcion:"Wordle en español. Adiviná la palabra del día.", tipo:"iframe" }
  ,
  { id:"game-023", nombre:"Gartic Gor2", categoria:"multijugador", tags:["online","dibujo","adivinar","social"], thumbnail:"", embed_url:"gartic/index.html", descripcion:"Dibujá la palabra y que los demás la adivinen. Juego online en tiempo real hasta 8 jugadores.", tipo:"local" }
];

if (typeof module !== "undefined") module.exports = { juegos };
