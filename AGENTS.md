# AltoVicio — Reglas para agentes de IA

Este repo lo trabajan varias IAs a la vez (Claude Code, Google Antigravity, Gemini) y Román como director y beta tester.
**Leé este archivo entero antes de tocar nada.** Las tareas repartidas entre los tres están en **`TAREAS.md`**.

## 1. Antes de empezar
1. Traé lo último de GitHub (`git fetch` y partí de `origin/main` actualizado). Nunca trabajes sobre una copia vieja
   guardada en memoria o en un ZIP: podés deshacer arreglos de otro agente.
2. Leé la última entrada de `CHANGELOG.md` para saber en qué versión está el sitio.

## 2. Cómo subir cambios
- Trabajá en **tu propia rama** y uní a `main` con **pull request**. No subas directo a `main`.
- GitHub Pages publica desde `main`: lo que entra a `main` queda online.
- Commits chicos y con mensaje claro. Agregá tu entrada al principio de `CHANGELOG.md`.
- Si cambiás JS/CSS compartido, subí el número de caché (`?v=N`) en `index.html`, `pages/juego.html` y `pages/social.html`.

## 3. División del trabajo (evitar editar el mismo archivo a la vez)
| Área | Responsable | Archivos |
|---|---|---|
| Lógica, Firebase, economía, salas online, Social, app (PWA) | Claude Code | `js/*.js`, `firebase/`, `pages/social.html`, `pages/impostor/`, `pages/gartic/`, `pages/gartic-phone/`, `sw.js`, `manifest.webmanifest` |
| Motor común de los juegos | Claude Code | `pages/games/kit/` (BG Kit) |
| Tienda: catálogo, integración del arte, estudio de avatar | Claude Code | `assets/tienda/`, `window.TIENDA_ILUSTRADA` y `renderAvatar` en `js/avatar.js` |
| Gráficos de juegos, portadas, arte nuevo | Antigravity / Gemini | `pages/games/juego-local-N.html`, `assets/` (salvo `assets/tienda/`), los dibujos SVG viejos de `js/avatar.js` |
| 8 Ball Pool y juegos de acción (ver `TAREAS.md`) | Antigravity | `pages/games/juego-local-41.html` y los de su lista |
| Rediseño de juegos de lógica y casuales (ver `TAREAS.md`) | Gemini | los de su lista; el Ajedrez HD (`juego-local-37.html`) es suyo en lo visual |

Si necesitás tocar un archivo del área de otro agente, hacé el cambio mínimo y explicalo en el pull request.

## 4. Restricciones del proyecto (no cambiar)
- Firebase: proyecto `gor2games-657f7`. Claves de localStorage `bandagamer_usuario_v2` y `bandagamer_visitas_v2`:
  **no renombrar** (se perderían cuentas y progreso).
- Estética lisa y moderna estilo Plato: fuentes `Outfit` y `Plus Jakarta Sans`. Nada de `Orbitron`, `Rajdhani`,
  scanlines, ni botones "al azar".
- Las reglas de `firebase/*.rules` **no se publican solas**: hay que copiarlas a mano en la consola de Firebase.

## 5. Arquitectura rápida
- `js/games-data.js` — catálogo (`juegos`).
- `js/storage.js` — datos del usuario (`Storage`): Firestore si hay login con Google, localStorage si es invitado.
  Funciona aunque Firebase no cargue (modo invitado).
  **Toda escritura del usuario va por `Storage.actualizarUsuario(fn)`** (transacción). No escribas el objeto entero.
- `js/avatar.js` — motor de avatares (`renderAvatar`, `ACCESORIOS`, SVG de la tienda). Lo cargan index, juego y social.
- `js/main.js` — portal (index): catálogo, tienda, perfil, ranking, misiones.
- `js/social.js` + `js/notifs.js` — amigos, chat, grupos, presencia, notificaciones.
- `pages/juego.html` — página de cada juego: carga el juego en un iframe, ranking por modo, amigos, chat rápido.
- `pages/games/kit/bg-kit.js` — motor común de los juegos (BG Kit).

### Tienda ilustrada (V15)
- Arte en `assets/tienda/acc/`, `assets/tienda/marcos/` y `assets/tienda/fondos/`, en WebP con fondo transparente.
- Catálogo en `window.TIENDA_ILUSTRADA` (`js/avatar.js`).
  - Cada ítem tiene `id`, `nombre`, `precio`, `reqNivel`, `rareza`, `img` y su colocación relativa al tamaño del avatar: `w` (ancho), `x`/`y` (centro) o `yb` (borde de abajo), `ar` (alto/ancho de la imagen) y `doble` (un par simétrico, por ejemplo cachetes).
  - Para calibrar un ítem, cambiá esos números y miralo en la tienda.
- Slots de `usuario.accesorios`: `sombrero`, `lentes`, `cara`, `bigote` (boca), `cuello`, `espalda`, `pin`, `marco`, `fondo` (más `efecto`, `mascota`, `titulo`, `burbuja`, `emoji`).
- Los marcos se normalizan: lienzo de 320×320 con el aro centrado y de radio 128 px. Así cualquier marco nuevo calza solo.
- Los ítems con `legacy: true` no se venden más, pero quien los tiene los sigue viendo. Los ids no se reutilizan nunca, porque ya están guardados en las cuentas.
- **Cómo pedir arte nuevo:** una lámina con un ítem por casilla y fondo liso (mejor PNG con transparencia), cada ítem de al menos 256 px.

### Comunicación juego ↔ portal (postMessage)
- Juego → portal: `{type:"bg-hello"}`, `{type:"bg-score", score, mode, order}`, `{type:"bg-room", code}` (código de sala o `null` al salir),
  `{type:"bg-buy", item, price}` (comprar un cosmético propio del juego con VicioCoins).
- Portal → juego: `{type:"bg-hello-ack", user, records, coins, items}` (`items` = cosméticos de ese juego que el jugador ya tiene),
  `{type:"bg-buy-result", item, ok, error, coins, items}`.
- Lo comprado se guarda en `usuario.items_juegos[juegoId]` (lo maneja `Storage.comprarItemJuego`). Ejemplo completo: el ajedrez (`juego-local-37.html`).
- **Solo juegos propios.** No se agregan juegos externos de otros sitios: no dan premios, no siguen el estilo y complican la app de Play Store.

### App (PWA)
- `manifest.webmanifest` e íconos en `assets/logo/` (192, 512 y maskable).
- `sw.js` usa "primero la red": siempre baja lo último y la copia guardada solo se usa sin internet.
  Si agregás un archivo central nuevo, sumalo a `PRECARGA` y subí `CACHE` junto con el `?v=N`.

### Economía (V14)
- Los premios los da **solo** `storage.js` (`premiarPartida`, `reclamarMision`, `reclamarBonusDiario`, `sumarXP`).
  Los juegos **no** deben sumar monedas/XP por su cuenta: solo mandan `bg-score`.
- Topes diarios en `LIMITES_DIARIOS`; misiones en `MISIONES`; progreso del día en `usuario.diario`.
- XP y monedas por tiempo solo con actividad real (sin tocar nada 60 s, se pausa).

## 6. Cómo probar sin tocar la base real
Con los emuladores de Firebase (`npx firebase-tools emulators:start --only auth,firestore,database`
usando `firebase/firestore.rules` y `firebase/database.rules.json`) se pueden jugar salas con varios
navegadores y crear cuentas de Google de prueba. En la página, antes de usar la base, se llama a
`useEmulator()` en `firebase.auth()`, `firebase.firestore()` y `firebase.database()`.
Para iniciar sesión en el emulador de Auth sirve una credencial falsa:
`firebase.auth.GoogleAuthProvider.credential(JSON.stringify({sub:"ana1", email:"ana1@test.com", email_verified:true}))`.

## 7. Seguridad (obligatorio)
- Las salas de Impostor / Gartic / Gartic Phone exigen identidad: usan `asegurarIdentidad()` (Google o cuenta
  anónima) y el id del jugador es el `uid`. `Storage.auth` y `Social` **ignoran las cuentas anónimas** a propósito.
  Si agregás una sala nueva en Realtime Database, hacé lo mismo y agregá su regla en `firebase/database.rules.json`.
- **Nunca insertes con `innerHTML` texto que venga de otro jugador** (nombres, chat, palabras, salas):
  pasalo por `esc()` / `escHtml()` o usá `textContent`. Las salas se pueden escribir sin cuenta.
