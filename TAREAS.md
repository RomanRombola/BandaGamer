# AltoVicio — Tareas repartidas

Lo coordina Román; lo mantiene al día cada agente. **Antes de empezar, leé `AGENTS.md` entero.**
Cuando termines una tarea, marcala con `[x]`, agregá tu entrada en `CHANGELOG.md` y abrí un pull request.

Estado: ✅ hecho · 🔄 en curso · ⬜ pendiente

---

## Claude Code — lógica, Firebase, economía, motor común, app
- ✅ Tienda ilustrada: 107 ítems, fondos de perfil y categorías nuevas (V15).
- ✅ Ajedrez HD de Gemini integrado: compras por el portal, online seguro, chat sin inyección.
- ✅ Fuera los 7 juegos externos (Krunker, HexGL, Diep.io, 1v1.lol, Smash Karts, Narrow One, Shell Shockers).
- ✅ BG Kit en celular: barra compacta en una fila y aviso único de "girá el celular".
- ✅ App instalable: `manifest.webmanifest`, íconos y `sw.js` (abre sin conexión).
- ✅ Compra de cosméticos dentro de los juegos: mensaje `bg-buy` → `Storage.comprarItemJuego` (ver AGENTS.md).
- ➡️ Las tareas pendientes de Claude pasaron a **Antigravity** (A9 a A13), porque Román necesita sus tokens en otro proyecto.

## Antigravity — 8 Ball Pool y juegos de acción
- ⬜ **A1 · Pool, cartel largo:** en vertical, los carteles ("Falta del rival… ¡Bola en mano!") se salen de la pantalla. Que hagan salto de línea o achiquen la letra.
- ⬜ **A2 · Pool, identidad en las salas** (`gameRooms`): igual que Impostor y Ajedrez.
  - Cargar `firebase-auth-compat.js` y entrar con `asegurarIdentidad()`: Google o anónima, `signInAnonymously()`.
  - Usar el `uid` como id del jugador, en lugar de `bg_anon_id`.
  - Cuando esté, avisar: Claude cierra la regla de `gameRooms`.
- ⬜ **A3 · Pool con VicioCoins:** sacar la billetera propia (`bg_pool_v2.coins`).
  - Los tacos, mesas y bolas se compran con `{type:"bg-buy", item, price}`, y lo comprado llega en `bg-hello-ack.items`.
  - El ejemplo completo está en `pages/games/juego-local-37.html` (ajedrez), en la sección "COSMÉTICOS".
  - Las victorias ya dan monedas por `bg-score`: el juego no debe sumar monedas.
  - Los tacos que la gente ya compró con la billetera vieja se pueden regalar una sola vez al migrar.
- ⬜ **A4 · Maze Runner** (`juego-local-31.html`): la pantalla es casi toda negra. Hace falta más luz alrededor del jugador, piso con textura y objetos visibles.
- ⬜ **A5 · Tower Defense** (`juego-local-16.html`): enemigos y torres dibujados (hoy son círculos), y que se vea más grande en el celular.
- ⬜ **A6 · Geometry Dash** (`juego-local-17.html`): tiene solo 3 niveles. Sumar al menos 5 más, con dificultad creciente.
- ⬜ **A7 · Space Shooter (`juego-local-4.html`) y Asteroids (`juego-local-14.html`):** naves, enemigos y asteroides dibujados, en lugar de formas geométricas.
- ⬜ **A8 · Marca vieja:**
  - Sacar el texto "BG" del auto y "BANDA GAMER" del cartel en Retro Racer (`juego-local-44.html`), y el "BG" de Endless Runner (`juego-local-5.html`).
  - Reemplazar `Orbitron` y `Rajdhani` por `Outfit` en los 15 juegos que todavía los nombran (`grep -l Orbitron pages/games/*.html`).

- ⬜ **A9 · Cerrar `gameRooms`** (después de A2). En `firebase/database.rules.json`, `gameRooms` pasa a `".read": "auth != null", ".write": "auth != null"`, igual que `chessRooms`.
  - Avisarle a Román que la publique en la consola **después** de aceptar el pull request.
- ⬜ **A10 · Integrar lo que mande Gemini** (G1 a G6). Román te pasa el HTML; antes de subirlo, revisá:
  - que no haya scripts que hagan `git push`, pisen `.gitignore` o cambien los `?v=N`;
  - que las monedas pasen solo por `bg-score` y `bg-buy`, sin tocar `bandagamer_usuario_v2`;
  - que el texto de otros jugadores no se meta con `innerHTML`;
  - que se vea bien en el celular (390×844), que `?preview=1` funcione y que no haya errores en la consola.
  - Ejemplo de integración: el ajedrez (`juego-local-37.html`), que vino de Gemini.
- ⬜ **A11 · App para Play Store** (Trusted Web Activity con Bubblewrap). El manifest y el service worker ya están.
  - Hace falta la cuenta de Google Play Console de Román y publicar `.well-known/assetlinks.json` en el sitio.
- ⬜ **A12 · Juegos repetidos:** tres de correr (Endless Runner, Infinite Runner, Geometry Dash), dos de ladrillos (Breakout Neon, Arkanoid) y tres de naves (Space Shooter, Galaga, Asteroids).
  - Proponerle a Román fusionarlos o diferenciarlos, y hacerlo.
- ⬜ **A13 · Monedas y rankings validados en un servidor** (Cloud Functions de Firebase).
  - Solo si Román activa el plan Blaze. Hoy cualquiera con conocimientos puede editarse las monedas o mandar un récord falso.

Si Antigravity necesita tocar archivos del área de Claude (`js/`, `firebase/`, `pages/games/kit/`), puede hacerlo: hacé cambios chicos, probalos y explicalos en el pull request.

## Gemini (Argon 4) — rediseño gráfico de juegos de lógica y casuales (los integra Antigravity, A10)
- ✅ Ajedrez HD (lo integró Claude).
- ⬜ **G1 · Ahorcado** (`juego-local-40.html`): hoy es un muñequito de palitos y ocupa el 21% de la pantalla del celular. Hace falta un escenario ilustrado, un personaje con animación por cada error y que ocupe la pantalla.
- ⬜ **G2 · Snake** (`juego-local-1.html`): tablero con estilo (pasto, piedras), serpiente y frutas dibujadas.
- ⬜ **G3 · Memory Match** (`juego-local-3.html`): el dorso de las cartas dice "BG". Hacer un dorso nuevo de AltoVicio y caras ilustradas.
- ⬜ **G4 · Doodle Jump** (`juego-local-13.html`): personaje, plataformas y fondos con más vida.
- ⬜ **G5 · Curve Fever (`juego-local-26.html`) y Color Flood (`juego-local-21.html`):** ambientación, animaciones y recompensa visual al ganar.
- ⬜ **G6 · Piedra Papel Tijera** (`juego-local-22.html`): hoy es pura suerte. Agregar algo de estrategia (por ejemplo, la CPU aprende tus patrones y se ven sus tendencias), o un modo online.

---

## Reglas para Gemini y Antigravity al rehacer un juego
1. **Un solo archivo HTML por juego**, en su mismo lugar (`pages/games/juego-local-N.html`), en una rama propia y con pull request.
   - Nada de scripts que hagan `git push` a `main`, pisen `.gitignore` o cambien los números `?v=N`.
2. **Las monedas y la XP las da solo el portal.**
   - El juego avisa `{type:"bg-score", score, mode}` al terminar.
   - Los cosméticos se compran con `{type:"bg-buy"}`.
   - Prohibido leer o escribir `bandagamer_usuario_v2` desde el juego.
3. **Nada de texto de otro jugador con `innerHTML`:** usar `textContent` (ver AGENTS.md §7).
4. **Salas online:** `asegurarIdentidad()` y su regla en `firebase/database.rules.json` (avisar a Claude).
5. **Estilo Plato:** fuentes `Outfit` y `Plus Jakarta Sans`, sin Orbitron, sin scanlines, sin emojis del sistema como gráfico principal.
6. **Que funcione en el celular:**
   - controles táctiles (el BG Kit tiene `touch:{dpad, buttons}`);
   - que entre en la pantalla vertical o pida girar;
   - probarlo en 390×844.
7. **Vista previa del catálogo:** con `?preview=1` el juego se juega solo, sin sonido y sin errores.
