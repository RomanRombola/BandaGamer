# BandaGamer — Changelog

## 🕹️ V6 — Clásicos de los 90 (desde el zip de 90s-games, licencia MIT)

Del repositorio **90s-games** (MIT © 2026 Prateek, 114 juegos de un archivo) se eligieron los que no existían en la plataforma. Los originales eran muy básicos (sin controles táctiles, con bugs), así que se reescribieron desde cero sobre el BG Kit. Licencia y créditos en `docs/LICENCIAS-TERCEROS.md`.

- **Bodeguero (Sokoban)** — 29 niveles propios generados "jugando al revés" desde la solución; un solucionador independiente verificó que todos se resuelven en el mínimo de empujes indicado. Caminar tocando una casilla, deshacer ilimitado, aviso de caja trabada, estrellas por nivel. (El original traía 3 niveles triviales.)
- **Salta Rana (estilo Frogger)** — ruta con autos, camiones, colectivos y motos; río con troncos, tortugas que se sumergen y cocodrilos; 5 nidos, mosca de bonus, cronómetro y niveles más rápidos. Arreglado el bug del original (carriles de autos superpuestos con el río).
- **Retro Racer** — motor pseudo-3D nuevo (proyección de segmentos, como los arcades de la época): curvas, lomas, tráfico con adelantamientos, nitro, choques con el decorado y contrarreloj con checkpoints por Costa, Desierto y Ciudad Neón. (El original era una vista cenital con errores de dibujo.)
- **8-Bit Quest** — plataformas con scroll y look pixel-art real (se dibuja a 400×225 y se agranda nítido): 6 niveles, espada, bloques "?" y ladrillos, babosas, murciélagos, erizos y esqueletos arqueros, plataformas móviles, checkpoints y bandera. Un bot terminó los 6 niveles sin morir. (El original era una sola pantalla fija.)
- **Galaga + modo Invasores** — fusión con el Space Invaders del zip en vez de duplicarlo: formación que marcha y acelera, escudos que se desgastan, platillo misterioso y ranking aparte.

### Arreglos de diseño encontrados al probar con bots
- 8-Bit Quest: dos plataformas móviles se movían sincronizadas y la distancia entre ellas nunca bajaba de 5 casillas; ahora las vecinas se mueven en sentidos opuestos y se cruzan.
- 8-Bit Quest: una cadena de plataformas de 2 casillas se hizo de 3 (más justa en celular).

---

## 🎮 V5 — Los juegos, a fondo

### Reescritos desde cero con el BG Kit (antes eran código viejo con bugs)
- **Snake**: frutas especiales (oro, picante ×2, fantasma, reloj), combos, 5 skins, cola de 3 giros, modos Clásico / Sin bordes / Laberinto (8 niveles con portal).
- **Space Shooter**: 5 tipos de enemigos, jefe de 3 fases cada 5 oleadas, armas nivel 1–5 (drones y misiles), bombas, roce de balas, imán de ítems, control táctil relativo.
- **¡Adrián Come!**: barra de hambre, la panza crece (más lento, más ancho) y la ensalada lo deshincha; picante (quema la basura), estrella ×2, imán, turbo, trébol; lluvia de pizza cada 5 niveles; arreglado el error que cerraba el juego.
- **Endless Runner**: el peso es una mecánica: comida sana adelgaza (salto más alto, doble salto desde GORDO, multiplicador hasta ×3) y la chatarra que flota engorda. Agacharse, pozos, bichos que ondulan, escudo/zapatillas/imán, 4 escenarios con parallax. Patrones verificados con un bot hasta la velocidad máxima.
- **Breakout Neon**: 10 niveles diseñados + infinitos, ladrillos duros/metal/bomba/regalo/oro, 8 cápsulas, combos y modo **Avalancha** (la pared baja sin parar). Colisión con sub-pasos, rebote por un solo eje, velocidad vertical mínima y anti-atasco del metal. Verificado con bot hasta el nivel 26.
- **Memory Match**: cartas con giro 3D, reparto animado, 4 temas, 4 dificultades (nueva: Experto 5×6), combos, estrellas, control con teclado y "juego rápido".
- **Maze Runner**: niebla con antorcha y memoria de lo explorado, movimiento fluido con giro anticipado, gemas, llave y salida cerrada, relojes de arena, mapa, sombras que te persiguen, brújula. Verificado con bot hasta el nivel 31.

### Gráficos
- Nuevo post-proceso del kit (`BG.post`): resplandor (bloom), viñeta y scanlines; baja la calidad solo si el equipo no llega a ~42 fps y se puede cambiar desde la pausa.
- Aplicado a 27 juegos con valores por juego.
- En celulares en vertical, los juegos apaisados sugieren girar la pantalla.
- Rediseño visual de **Pong** (arena neón, red que late, fiebre de peloteo), **Asteroids** (rocas sombreadas con cráteres, nebulosas, planeta, nave nueva), **Geometry Dash** (sprites neón por nivel, siluetas en parallax, cubo con estela) y **Piano Tiles** (piano neón oscuro con ecualizador y notas).

### Bugs
- **Sudoku**: se cerraba si tocabas una tecla o el tablero en el instante entre elegir nivel y que se generara el tablero.

### Portadas
- Las 44 portadas no mostraban la captura del juego (bug de base64 en el generador). Regeneradas todas con captura real.

### Para agregar juegos
- `docs/AGREGAR-JUEGOS.md`: cómo pasarme juegos viejos para adaptarlos (formatos, licencias, qué hago, qué es factible).
- `pages/games/plantilla-juego.html`: plantilla comentada del BG Kit.

---

# Gor2Games V3 — Changelog (histórico)

## 🔧 V3.3 — Revisión de bugs (análisis completo del código)

### Críticos
- **Página Social no funcionaba** (`social.html`): `init()` llamaba a `Storage.leer()`, que no existe en la API pública. Fallaba dentro del try/catch, nunca se ejecutaba `initPresence` y todas las funciones de `Social` quedaban inertes (`_currentUid` null). Ahora usa `Storage.getUsuario()` y `Social` sigue directamente a Firebase Auth.
- **Visitas, perfil y presencia en `juego.html` iban al driver equivocado**: `auth.currentUser` es `null` los primeros ms de cada página, así que `Storage` elegía localStorage aunque estuvieras logueado. Nuevo `Storage.authListo`; todas las operaciones esperan a que Auth restaure la sesión.
- **Posible pérdida de XP/monedas**: si la lectura de Firestore fallaba (offline, permisos) se devolvía un usuario vacío y la siguiente escritura lo pisaba. Ahora la lectura lanza error y no se escribe nada.
- **Race conditions de XP/monedas/favoritos/tienda**: todas las escrituras pasan por `Storage.actualizarUsuario(fn)`, una transacción de Firestore serializada en una cola (soporta varias pestañas). 20 sumas concurrentes dan exactamente el total esperado.
- **Caché de usuario compartida entre cuentas**: se invalida al cambiar la sesión y está atada al uid. Antes, login/logout podía mezclar datos de invitado y de Google.
- **XSS almacenado**: nombres de usuario sin escapar en ranking, perfil, toasts, búsqueda y social. Fotos de perfil ahora validadas (solo `data:image` / `https`). Los `onclick="fn('${nombre}')"` se reemplazaron por `data-*` + delegación de eventos (un apóstrofe en el nombre rompía el JS).

### Sistema social
- Notificaciones globales: las solicitudes leían `fromUid/fromNombre` (el doc guarda `uid/nombre`) y el toast salía en cada snapshot; los chats leían campos que nunca se escribían (`lastSenderUid`, `lastTs`, `lastMsg`), por lo que no había avisos de mensajes. Alineado con `social.js`.
- Los 3 listeners se pisaban el mismo punto de notificación: ahora se combinan.
- Los toasts solo avisan de novedades posteriores a la carga (antes repetían las invitaciones viejas en cada página).
- Invitaciones: se borran al aceptar, se pueden descartar y vencen a las 2 h. Ya no se crea una sala RTDB "falsa" sin anfitrión: la sala real (código creado en 8 Ball / Ajedrez) se publica en la presencia vía `postMessage` y el invitado entra a esa sala.
- Ajedrez ahora aparece en la lista de invitaciones.
- Presencia: `initPresence` es idempotente (antes cada refresco de perfil borraba la presencia y acumulaba listeners de `.info/connected`); el estado "jugando a" sobrevive a reconexiones; se quitó el `goOffline` de `beforeunload` que pisaba el "online" de la página siguiente.
- `onChatsActivos` usaba `array-contains` + `orderBy`, que exige un índice compuesto no creado y fallaba en silencio: ahora se ordena en el cliente. Todos los `onSnapshot` tienen handler de error.
- Solicitudes: valida duplicados/auto-solicitud, se aceptan solas si la otra persona ya había enviado una, y se escriben en batch. Mensaje + metadata del chat también en batch, con límite de 500 caracteres.
- Marcar leído también al recibir mensajes con el chat abierto; la lista de chats se re-renderiza cuando llegan los nombres de amigos.

### Rendimiento
- `crearCardHTML` hacía 2 lecturas de Firestore **por card** (~130 por render). Ahora se leen usuario y visitas una sola vez (9 lecturas en la carga inicial).
- Los iframes de preview ya no quedan cargados en memoria tras el hover; se corrigió la carrera entre `mouseenter` y `mouseleave`.

### Otros bugs
- Botón de favorito: el `onclick` inline llamaba a `toggleFavorito()` (inexistente) y además había un listener por render. En la sección Favoritos no hacía nada. Ahora hay un único listener delegado, sincroniza todas las copias y evalúa logros.
- `irSeccion()` no existía (clic en tu propia fila del ranking tiraba error).
- `mostrarToastJuego()` no estaba definida: tiraba ReferenceError justo después de acreditar las +10 monedas.
- `verPerfilUsuario` leía el perfil privado (`usuarios/`) de otro usuario; ahora usa el público (`ranking/`).
- Tienda: precio y nivel se toman del catálogo (no del parámetro del botón) y la compra es atómica.
- Sidebar: faltaba "Casual" (5 juegos) y listaba Aventura/Deportes/Retro vacías; ahora se arma según el catálogo.
- Barra de XP en nivel 10 mostraba `xp % 1000`; ahora "NIVEL MÁXIMO".
- Nombres de nivel inconsistentes entre `main.js` y `juego.html`.
- Logro "5 juegos distintos" contaba partidas totales: descripción corregida.
- Los logros no se evaluaban para invitados.
- Tiempo jugado al salir: `beforeunload` + promesa async no es confiable; ahora `pagehide` / `visibilitychange`.
- Emulador: los `<script>` insertados con `innerHTML` nunca se ejecutan; ahora se crean con `createElement`.
- Foto de perfil: errores de `FileReader`/`Image` sin manejar, sin límite de tamaño.
- `game-015`: tags duplicados y raros.
- `limpiar()` no borraba `users/{uid}`.

### Pendiente / no tocado
- **Reglas de seguridad de Firebase** (sin publicar): hoy cualquier usuario podría escribir su propio `xp`/`monedas`. La validación del cliente no alcanza; hay que publicarlas.
- `assets/og-image.png` no existe (la referencian `og:image` en `index.html`).
- `pages/gartic/` es una carpeta huérfana (el catálogo usa `pages/gartic-phone/`).
- Impostor Online y Gartic Phone no tienen thumbnail.
- 8 Ball y Ajedrez usan `window.parent.Auth`, que no existe en el portal (los uid de sala caen a `anon_*`).

---
Build acumulativo. Mantiene la estructura original del portal (login, Firebase, perfil, tienda, social, impostor, gartic). Todas las mejoras son aditivas o fixes puntuales.

---

## 🐛 Bugs críticos arreglados en V3

### XP no se acreditaba (`storage.js`)
**Problema reportado**: tenías 420 XP, ganabas 120, y volvías a 420. El XP no subía.

**Causa**: race condition entre `sumarXP()` y `registrarVisita()`. La primera escribía a Firestore en background sin `await`, y `registrarVisita` leía Firestore fresh ignorando la caché — se llevaba el valor viejo y al hacer su propio `setUsuario(u)` pisaba el XP recién sumado.

**Fix**:
- `registrarVisita`, `sumarTiempoJugado` y `desbloquearLogro` ahora usan `_getCachedUser()` en vez de `getUsuario()`
- `sumarXP` y `sumarMonedas` ahora hacen `await setUsuario(u)` para garantizar persistencia antes de devolver

### 8 Ball Pool: bola embolsada no se contaba en pantalla
**Problema reportado**: embolsabas la violeta (rayada) con la mesa abierta, no aparecía tachada en el rack lateral, después tirabas la 8 pensando que terminaste tu color, perdías por meterla antes de tiempo.

**Causa**: la función `updateRack()` decidía qué bolas mostrar según `pType[curP]`. Cuando la mesa estaba abierta (`pType=-1`), por defecto mostraba SÓLIDAS (1-7) en el lado del jugador. Si embolsabas una rayada, la 12 sí entraba a `potted[]` pero el rack no la mostraba porque no existe en la lista de sólidas.

**Fix**: con mesa abierta, ahora ambos lados muestran TODAS las bolas (1-15 sin la 8). Cualquier bola embolsada se ve correctamente tachada hasta que se asigne el color.

### `endless-runner.mp4` 404 + duplicados en "Jugados recientemente" (V2)
- Quitados los `preview_video` que apuntaban a archivos inexistentes
- `registrarVisita` ahora hace dedup del historial antes de insertar al frente

---

## 🌐 Sistema social mejorado

### Presencia con juego activo
Tus amigos ven en tiempo real **a qué juego estás jugando**, no solo si estás online.

- `Social.setJugando(juegoNombre, juegoId, roomId)` — actualiza tu estado de presencia con el juego actual
- `Social.clearJugando()` — limpia el estado al salir
- `juego.html` llama automáticamente a `setJugando` al cargar un juego, y a `clearJugando` al salir
- En la página social, los amigos en juego salen primero en la lista, con un badge "Jugando a Snake"
- Si el amigo está en una **sala con código** (8 Ball Pool, Ajedrez), aparece un botón **▶ UNIRSE** que abre directamente el juego con el `?room=` correspondiente

### Notificaciones globales (toast en cualquier página)
Antes solo te enterabas de mensajes/invitaciones/solicitudes si entrabas a /social. Ahora:

- En cualquier página del portal (index, perfil, ranking, tienda, etc.) aparece un **toast clickeable** arriba a la derecha cuando:
  - Te llega una solicitud de amistad (te lleva a /social al click)
  - Te invitan a un juego (te lleva directo al juego con `?room=` si corresponde)
  - Recibís un mensaje de chat (te lleva a /social → tab Chat)
- Estilo glassmorphism con backdrop-blur, animación de slide
- Auto-dismiss en 6 segundos
- Solo se disparan los **mensajes nuevos** posteriores a la carga de página, no los acumulados

### Bug aceptarInvitacion (V2)
- Antes el botón "Unirse" desde una invitación NO pasaba el `roomId`, solo el `juegoId`. Ahora pasa ambos.

---

## ♟️ Ajedrez completamente rediseñado (V2 — sigue en V3)

3 dificultades de IA con minimax + alpha-beta:
- 🐣 Novato (~ELO 800)
- ⚔ Intermedio (~ELO 1400)
- 🏆 Experto (~ELO 1900)

Sistema ELO del jugador persistido en localStorage. Modo online 1v1 con código de sala de 6 chars (compartible por link). Historial de movimientos, captura visible, sonidos por acción, casilla del último movimiento resaltada, jaque animado.

---

## 🎱 8 Ball Pool con modo online 1v1 (V2)

Billar 8 Ball completo con física realista, efecto, timer 30s/turno y 3 modos:
- VS CPU (3 niveles de IA)
- Crear sala online (código de 6 chars + link)
- Unirse con código

Auto-join por URL, host autoritativo, snapshots ~9 Hz durante animación, sincronización de estado al final del turno.

---

## 🎨 Gráficos mejorados

### Snake (`juego-local-1.html`)
- Fondo con nebula gradient radial
- Estrellas parallax centelleantes
- Partículas mejoradas al comer (con glow, mucho más vistosas)
- Sparkles ascendentes desde la manzana (humo amarillo)
- Halo pulsante alrededor de la comida
- Burst de partículas rojas + amarillas al comer
- **Shake de cámara** al morir
- Bonus (manzana mágica) genera burst doble (10 amarillas + 10 rojas)

### Adrián Come (`juego-local-10.html`)
- Cielo con gradiente más rico (violeta de fondo)
- **Luna con halo y cráteres** (antes no estaba)
- **Nubes parallax** que cruzan el cielo lentamente
- **Edificios parallax en 2 capas** (lejana y media) con ventanas iluminadas pseudo-aleatorias
- Línea del suelo con **glow naranja**
- Líneas de pista **animadas** (se mueven con la velocidad)
- **Speed lines** horizontales cuando te movés (efecto de velocidad)

### Endless Runner (`juego-local-5.html`)
- **Capa adicional de edificios lejanos** (parallax lento)
- **Scroll infinito** de la ciudad: los edificios ya no están fijos, se mueven con la velocidad del juego (efecto real de correr)
- Mantiene los edificios principales con luces, antenas con luz roja parpadeante y nubes

---

## 🎮 Resto de mejoras (V2)

### Bugs críticos arreglados
- Piano Tiles — loop infinito que colgaba la pestaña
- Bubble Shooter — `level=undefined` hacía crash
- Typing Speed — id HTML duplicado + texto corto cortaba el juego

### Bugs menores arreglados
- 15 Puzzle — best por tamaño de grilla
- Ahorcado — palabras con tildes + match acento-insensible
- Color Flood — reset a nivel 1 al perder

### Juegos rediseñados
- Memory Match — 3 dificultades, flip 3D, sonidos, combo, bests persistidos
- Breakout Neon — 5 power-ups, ladrillos con HP, patrones por nivel, partículas
- Maze Runner — DFS iterativo, pista BFS (tecla H), trail, partículas

---

## 🔐 Reglas de Firebase

Para que funcione el portal completo, configurar en **Firebase Console**:

**Firestore → Reglas** (las tuyas que pegaste están perfectas, no las cambies):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{uid} { allow read, write: if request.auth != null && request.auth.uid == uid; }
    match /users/{uid} { allow read: if request.auth != null; allow write: if request.auth != null && request.auth.uid == uid; }
    match /ranking/{uid} { allow read: if true; allow write: if request.auth != null && request.auth.uid == uid; }
    match /visitas/{uid} { allow read, write: if request.auth != null && request.auth.uid == uid; }
    match /friends/{uid}/list/{friendUid} { allow read: if request.auth != null && request.auth.uid == uid; allow write: if request.auth != null; }
    match /friendRequests/{uid}/{direction}/{fromUid} { allow read: if request.auth != null && request.auth.uid == uid; allow write: if request.auth != null; }
    match /chats/{chatId} {
      allow read, write: if request.auth != null && request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      match /messages/{msgId} { allow read, write: if request.auth != null; }
    }
    match /gameInvites/{uid}/pending/{inviteId} { allow read: if request.auth != null && request.auth.uid == uid; allow write: if request.auth != null; }
  }
}
```

**Realtime Database → Reglas**:
```json
{
  "rules": {
    "gameRooms":  { "$room": { ".read": true, ".write": true } },
    "chessRooms": { "$room": { ".read": true, ".write": true } },
    "presence":   { "$uid":  { ".read": true, ".write": "auth != null && auth.uid == $uid" } }
  }
}
```

---

## 🔜 Próximas etapas pendientes

1. ~~Ajedrez multi + ELO + bots~~ ✅
2. ~~Gráficos Snake/Adrián/Endless~~ ✅ (parcial — todavía hay margen para mejorar Snake con más detalle)
3. ~~Sistema social (presencia en juego, notificaciones globales)~~ ✅
4. **Gartic mejorado considerablemente** — pendiente
5. **Impostor mejorado** — pendiente
6. **Tienda + personalización** — pendiente

