# AltoVicio — Reglas para agentes de IA

Este repo lo trabajan varias IAs a la vez (Claude Code, Google Antigravity, Gemini) y Román como director y beta tester.
**Leé este archivo entero antes de tocar nada.**

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
| Lógica, Firebase, economía, salas online, Social | Claude Code | `js/*.js`, `firebase/`, `pages/social.html`, `pages/impostor/`, `pages/gartic/`, `pages/gartic-phone/` |
| Arte de tienda, gráficos de juegos, portadas | Antigravity / Gemini | `pages/games/juego-local-N.html`, `assets/`, la parte de dibujos SVG de `js/avatar.js` |
| 8 Ball Pool (en curso) | Antigravity | `pages/games/juego-local-41.html` |

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

### Comunicación juego ↔ portal (postMessage)
- Juego → portal: `{type:"bg-hello"}`, `{type:"bg-score", score, mode, order}`, `{type:"bg-room", code}` (código de sala o `null` al salir).
- Portal → juego: `{type:"bg-hello-ack", user, records}`.

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
- **Nunca insertes con `innerHTML` texto que venga de otro jugador** (nombres, chat, palabras, salas):
  pasalo por `esc()` / `escHtml()` o usá `textContent`. Las salas se pueden escribir sin cuenta.
