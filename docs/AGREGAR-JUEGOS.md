# Cómo traer juegos viejos (o clásicos) a BandaGamer

Esta guía explica cómo pasarme el código de un juego viejo —un Mario, un clon de Minecraft, Doom, lo que sea— para que lo adapte, le arregle los bugs, lo mejore y quede integrado al portal (récords, ranking, XP, celular, portada).

---

## 1. Qué me podés pasar

Cualquiera de estas cosas sirve:

| Qué tenés | Cómo me lo pasás |
|---|---|
| Una carpeta con el juego (HTML/JS/CSS + imágenes/sonidos) | Comprimila en `.zip` y decime dónde quedó (ej: `Descargas\mario-clon.zip`) |
| Un solo archivo `.html` o `.js` | Decime la ruta o pegame el código en el chat |
| Un repositorio de GitHub | Pasame el link |
| Código en otro lenguaje (C, C++, Java, Python, Lua, Flash/ActionScript, Scratch…) | Igual que arriba: zip, link o archivo |
| Nada de código, solo la idea | Describime el juego ("un Mario pero con…"), con capturas o videos si tenés |

**Lenguajes:**
- **JavaScript / HTML5** (Canvas, Phaser, PixiJS, Three.js…): se adapta casi directo.
- **Otros lenguajes**: el código me sirve como plano de la lógica (física, IA de enemigos, niveles, puntajes) y lo reescribo en JavaScript con el motor del portal. Para motores grandes en C/C++ (como Doom) también se puede compilar el original a WebAssembly.

**Assets** (sprites, sonidos, mapas, niveles): pasámelos también. Si no se pueden usar legalmente (ver punto 2), hago reemplazos propios.

> Los archivos que me pases los descomprimo en una carpeta aparte y los reviso antes de ejecutar nada.

---

## 2. Lo legal (importante porque la página es pública)

La regla práctica: **la mecánica de un juego no tiene dueño; el nombre, los personajes, el arte y la música sí.**

- **Código con licencia libre** (MIT, BSD, GPL, zlib…): se puede usar respetando la licencia y dejando el crédito. Con GPL, la versión modificada también tiene que ser GPL (en una web estática el código ya queda público; solo hay que mantener la licencia).
- **Super Mario (Nintendo)**: Nintendo baja fan-games muy seguido. Hacemos un plataformas "inspirado en", con personaje propio (¡alguien de la Banda!), niveles y música propios. Nada de sprites, nombres ni música de Nintendo.
- **Minecraft (Mojang/Microsoft)**: los clones con nombre y texturas propias son comunes (ej. "BandaCraft"). No usar sus texturas ni su logo.
- **Doom (id Software)**: el motor original es libre (GPL desde 1997), pero los niveles y gráficos del Doom comercial no. Se combina con **Freedoom**, que tiene niveles/gráficos/sonidos libres. Eso sí es 100 % legal.
- **ROMs para el emulador**: solo homebrew o juegos con permiso. Nunca ROMs comerciales.

---

## 3. Qué hago yo con el código

1. **Lo leo entero** y armo el mapa: bucle principal, controles, física, colisiones, niveles, dibujo y sonido.
2. **Lo paso al BG Kit** (el motor del portal). Con eso gana automáticamente: bucle estable a 60 Hz, teclado + controles táctiles, pausa automática, sonidos y música, efectos (resplandor, partículas, temblor), menús, récords, **XP y ranking del portal** y modo portada.
3. **Le arreglo los bugs** del original y los del código que me pases. Algunos famosos que se pueden corregir:
   - *Pac-Man*: la "pantalla de la muerte" del nivel 256 (un desborde de memoria).
   - *Super Mario Bros*: atravesar paredes ("Minus World") y choques que fallan a mucha velocidad.
   - *Doom*: los enemigos tienen "altura infinita" (te bloquean aunque estén muy abajo o arriba) y el error de "visplane overflow" que cerraba el juego.
   - *Minecraft viejo*: las "Far Lands" (el terreno se deforma muy lejos del centro).
   - *Breakout*: la pelota que atraviesa ladrillos o queda rebotando horizontal para siempre (ya corregido en Breakout Neon).
4. **Lo mejoro**: gráficos, modos de juego, dificultad progresiva, controles para celular, guardado de récords.
5. **Lo pruebo** con los tests automáticos: revisión de sintaxis, test de "humo" (teclas y toques al azar en PC y celular buscando errores) y, cuando aplica, **bots que juegan solos** para comprobar que todos los niveles se pueden pasar.
6. **Lo agrego al catálogo** con su portada, ranking y modos.

---

## 4. Qué tan factible es cada tipo de juego en la web

| Juego | Factibilidad | Cómo |
|---|---|---|
| Plataformas 2D (tipo Mario, Sonic, Mega Man) | ✅ Total | Canvas 2D con el BG Kit, niveles por mapas de casillas |
| Doom / Wolfenstein | ✅ Total | (a) Motor propio de "raycasting" en JS, liviano y 100 % nuestro, o (b) el motor real compilado a WebAssembly + Freedoom (pesa varios MB) |
| Minecraft | ⚠️ Versión simplificada | Three.js con bloques: mundo por chunks, poner/romper bloques, día/noche. En celulares viejos va justo |
| Juegos de NES/SNES/GBA | ✅ Con emulador | Solo homebrew o con permiso |
| Juegos 3D grandes de PC | ❌ En general no | Se hace una versión "demake" (2D o 3D simple) |

---

## 5. Cómo pedírmelo (copiá y completá)

```
Juego base: (nombre / link / ruta del zip)
Qué me gusta del original:
Qué quiero cambiar o agregar:
¿Para celular también? (sí/no)
¿Multijugador? (no / misma pantalla / online)
Personaje o temática propia (opcional):
```

---

## 6. Parte técnica (por si querés tocar algo vos)

- **Dónde van los juegos:** `pages/games/juego-local-N.html` (N = el siguiente número libre).
- **Plantilla lista para copiar:** `pages/games/plantilla-juego.html` (un juego chico y comentado que usa todo el BG Kit).
- **Registro en el catálogo:** agregá una línea en `js/games-data.js`:

  ```js
  { id:"game-060", nombre:"Mi Juego", categoria:"accion", tags:["plataformas"],
    thumbnail:"assets/thumbs/cover-game-060.jpg", embed_url:"games/juego-local-46.html",
    descripcion:"Descripción corta.", tipo:"local", nuevo:true, movil:true },
  ```

  Campos opcionales: `modos:[{id:"facil",nombre:"Fácil"}]` (un ranking por modo), `orden:"asc"` (menos es mejor, ej. tiempos), `formato:"seg"|"ms"|"mov"`, `multi:true` (online), `ranking:false` (sin ranking).
- **Récords y XP:** al terminar la partida, `BG.submitScore(puntos, { mode, order })`. El portal da XP y actualiza el ranking.
- **Juegos que no usan el kit** (por ejemplo, un juego viejo que quiero tocar lo mínimo): se agregan `kit/bg-bridge.js` y dos líneas:

  ```html
  <script src="kit/bg-bridge.js"></script>
  <script>BGBridge.init("mi-juego");</script>
  <!-- y al terminar: BGBridge.score(puntos, { mode: "default" }); -->
  ```
- **Portada:** el juego se abre con `?thumb=1` y dibuja una escena fija; la herramienta `_dev/covers.js` (fuera de la carpeta que se sube) saca la captura y arma la imagen.

---

## 7. Ejemplo real: el zip de 90s-games

Así se hizo con el zip de 90s-games (V6):

1. Se descomprimió en una carpeta aparte y se leyó la licencia: **MIT**, que permite usar y modificar el código conservando el aviso de copyright (quedó en `docs/LICENCIAS-TERCEROS.md`).
2. Se descartaron los juegos que ya estaban en la plataforma (Snake, Tetris, Pac-Man, 2048, Buscaminas…). Space Invaders se fusionó con Galaga como modo nuevo.
3. Se eligieron 4 que faltaban (Sokoban, Frogger, Retro Racer y 8-Bit Quest). Como eran muy básicos, se reescribieron con el BG Kit y se mejoraron: niveles generados y verificados, motor pseudo-3D, plataformas con scroll, controles táctiles, ranking y portada.
4. Se probaron con bots que juegan solos para asegurar que todos los niveles se pueden pasar.
