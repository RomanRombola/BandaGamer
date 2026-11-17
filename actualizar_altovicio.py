import os
import re
import glob

base = os.path.dirname(os.path.abspath(__file__))
if os.path.exists(os.path.join(base, "gor2games")):
    base = os.path.join(base, "gor2games")

def leer(rel):
    p = os.path.join(base, rel)
    if not os.path.exists(p):
        return None
    with open(p, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()

def escribir(rel, contenido):
    p = os.path.join(base, rel)
    with open(p, "w", encoding="utf-8") as f:
        f.write(contenido)
    print(f"✔ Actualizado: {rel}")

# ---------------------------------------------------------
# 1. REBRANDING SEGURO A ALTOVICIO Y VICIOCOINS
# ---------------------------------------------------------
extensiones = ("*.html", "*.js", "*.css", "*.md")
archivos_texto = []
for ext in extensiones:
    archivos_texto.extend(glob.glob(os.path.join(base, "**", ext), recursive=True))

for ruta in archivos_texto:
    if os.path.basename(ruta) in ("extraer.py", "mejorar_diseno.py", "actualizar_altovicio.py", "codigo_para_ia.txt"):
        continue
    with open(ruta, "r", encoding="utf-8", errors="ignore") as f:
        txt = f.read()
    original = txt

    # Proteger claves de localStorage y URL del repo GitHub para no romper sesiones ni enlaces
    txt = txt.replace("romanrombola.github.io/BandaGamer", "__GH_REPO_URL__")
    txt = txt.replace("bandagamer_usuario_v2", "__LS_USER_V2__")
    txt = txt.replace("bandagamer_visitas_v2", "__LS_VISITAS_V2__")

    # Reemplazos de marca
    txt = txt.replace("BandaGamer — Jugá en Banda", "AltoVicio — Jugá y Viciá en Banda")
    txt = txt.replace("El portal para jugar en banda", "El portal definitivo para viciar con amigos")
    txt = txt.replace("BANDAGAMER", "ALTOVICIO")
    txt = txt.replace("BandaGamer", "AltoVicio")
    txt = txt.replace("BandaCoins", "VicioCoins")
    txt = txt.replace("keywords\" content=\"bandagamer", "keywords\" content=\"altovicio, bandagamer")

    # Restaurar claves protegidas
    txt = txt.replace("__GH_REPO_URL__", "romanrombola.github.io/BandaGamer")
    txt = txt.replace("__LS_USER_V2__", "bandagamer_usuario_v2")
    txt = txt.replace("__LS_VISITAS_V2__", "bandagamer_visitas_v2")

    if txt != original:
        with open(ruta, "w", encoding="utf-8") as f:
            f.write(txt)

print("✔ Rebranding global a AltoVicio y VicioCoins aplicado.")

# ---------------------------------------------------------
# 2. MODO VIDEO GAMEPLAY AUTOMÁTICO EN BG-KIT.JS (?preview=1)
# ---------------------------------------------------------
bg_kit_js = leer("pages/games/kit/bg-kit.js")
if bg_kit_js:
    # Activar flag BG.preview
    bg_kit_js = bg_kit_js.replace(
        "BG.thumb = params.has('thumb');",
        "BG.thumb = params.has('thumb') || params.has('preview');\n  BG.preview = params.has('preview');"
    )
    # Silenciar audio por completo en modo preview sin tocar localStorage
    bg_kit_js = bg_kit_js.replace(
        "const a = ctx(); if (!a || muted) return;",
        "if (BG.preview) return;\n      const a = ctx(); if (!a || muted) return;"
    )
    # Auto-iniciar y auto-reiniciar partida sin mostrar menús ni pantallas de Game Over en modo preview
    old_ui_show = "if (o.onShow) o.onShow(card);\n      return card;"
    new_ui_show = """if (o.onShow) o.onShow(card);
      if (BG.preview) {
        setTimeout(() => {
          const btn = card.querySelector('.bg-btn.primary') || card.querySelector('.bg-btn');
          if (btn) { UI. _shownAt = 0; btn.click(); }
        }, 50);
      }
      return card;"""
    if "if (BG.preview)" not in bg_kit_js:
        bg_kit_js = bg_kit_js.replace(old_ui_show, new_ui_show)

    # Inyectar piloto automático (demo bot) al final de BG.init para que el video tenga movimiento real
    autopilot_code = """
    if (BG.preview) {
      const acts = ['left', 'right', 'up', 'down', 'action'];
      let stepAuto = 0;
      setInterval(() => {
        stepAuto++;
        const a = acts[stepAuto % acts.length];
        Input._pressed.add(a);
        fire(a, {});
        Input.virt[a] = true;
        setTimeout(() => { Input.virt[a] = false; }, 180);
        if (BG.view && BG.view.canvas) {
          const rect = BG.view.canvas.getBoundingClientRect();
          const cx = rect.left + rect.width * (0.25 + 0.5 * Math.abs(Math.sin(stepAuto * 0.7)));
          const cy = rect.top + rect.height * (0.3 + 0.4 * Math.abs(Math.cos(stepAuto * 0.5)));
          BG.view.canvas.dispatchEvent(new PointerEvent('pointermove', { clientX: cx, clientY: cy, pointerType: 'mouse', buttons: 1 }));
        }
      }, 280);
    }
    return BG;"""
    if "stepAuto" not in bg_kit_js:
        bg_kit_js = bg_kit_js.replace("    return BG;\n  };", autopilot_code + "\n  };")
    escribir("pages/games/kit/bg-kit.js", bg_kit_js)

# ---------------------------------------------------------
# 3. INDEX.HTML: LIMPIAR BANNER ROTO Y SUMAR HERO + MISIONES
# ---------------------------------------------------------
index_html = leer("index.html")
if index_html:
    # Quitar banner-error huérfano
    index_html = re.sub(
        r'<!-- ── BANNER ERROR.*?</div>\s*',
        '',
        index_html,
        flags=re.DOTALL
    )
    # Inyectar contenedor de Hero Banner y Misiones Diarias en seccion-inicio
    if 'id="av-hero-panel"' not in index_html:
        index_html = index_html.replace(
            '<section id="seccion-inicio" class="seccion activa">',
            '<section id="seccion-inicio" class="seccion activa">\n      <div id="av-hero-panel"></div>\n      <div id="av-misiones-panel"></div>'
        )
    escribir("index.html", index_html)

# ---------------------------------------------------------
# 4. CSS: ESTILOS DE HERO BANNER, MISIONES Y VIDEO PREVIEW
# ---------------------------------------------------------
styles_css = leer("css/styles.css")
if styles_css and "/* === ALTOVICIO V8 FEATURES ===" not in styles_css:
    extra_css = """
/* === ALTOVICIO V8 FEATURES === */
.av-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
  margin-bottom: 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 102, 0, 0.22) 0%, rgba(18, 18, 34, 0.95) 55%, rgba(0, 170, 255, 0.18) 100%);
  border: 1px solid rgba(255, 102, 0, 0.4);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 24px rgba(255, 102, 0, 0.15);
  flex-wrap: wrap;
}
.av-hero-info { flex: 1; min-width: 240px; }
.av-hero-badge {
  display: inline-block;
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1.5px;
  padding: 4px 10px;
  border-radius: 99px;
  background: rgba(255, 230, 0, 0.15);
  color: var(--color-accent);
  border: 1px solid rgba(255, 230, 0, 0.4);
  margin-bottom: 8px;
}
.av-hero-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(20px, 3vw, 28px);
  font-weight: 900;
  color: #fff;
  margin-bottom: 6px;
}
.av-hero-desc { color: #b8b8cc; font-size: 15px; max-width: 580px; }
.av-hero-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.av-btn-glow {
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
  padding: 12px 18px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
}
.av-btn-glow.primary {
  background: linear-gradient(135deg, #ff6600, #ffb300);
  color: #fff;
  box-shadow: 0 6px 20px rgba(255, 102, 0, 0.45);
}
.av-btn-glow.secondary {
  background: rgba(0, 170, 255, 0.14);
  color: #38bdf8;
  border: 1px solid rgba(0, 170, 255, 0.4);
}
.av-btn-glow.bonus {
  background: rgba(57, 255, 20, 0.14);
  color: #39ff88;
  border: 1px solid rgba(57, 255, 20, 0.4);
}
.av-btn-glow:hover { transform: translateY(-2px); filter: brightness(1.12); }

.av-misiones-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}
.av-mision-card {
  background: rgba(20, 20, 34, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.av-mision-card.lista { border-color: rgba(57, 255, 20, 0.45); background: rgba(57, 255, 20, 0.06); }
.av-mision-prog { height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; margin-top: 6px; }
.av-mision-fill { height: 100%; background: linear-gradient(90deg, #ff6600, #ffe600); border-radius: 3px; }
.av-mision-btn {
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 700;
  padding: 7px 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}
.av-mision-btn.claim { background: linear-gradient(135deg, #39ff14, #00c853); color: #051b05; }
.av-mision-btn.done { background: rgba(255,255,255,0.06); color: #888; cursor: default; }

.card-preview-wrap iframe, .card-preview-wrap video {
  filter: contrast(1.06) saturate(1.12);
  transform: scale(1.02);
}
"""
    escribir("css/styles.css", styles_css.rstrip() + "\n" + extra_css)

# ---------------------------------------------------------
# 5. MAIN.JS: AVATARES CON ACCESORIOS, VIDEO PREVIEW, AUDIO Y MISIONES
# ---------------------------------------------------------
main_js = leer("js/main.js")
if main_js:
    # A) Conectar renderAvatar en el header
    main_js = main_js.replace(
        'if (el("perfil-avatar"))      el("perfil-avatar").textContent      = u.avatar || "😊";',
        '''if (el("perfil-avatar")) {
    const f = urlFotoSegura(u.fotoPerfil);
    el("perfil-avatar").innerHTML = f
      ? `<img src="${f}" alt="" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid var(--color-primary)">`
      : renderAvatar(u.avatar || "😊", u.accesorios, 30);
  }'''
    )
    # B) Conectar renderAvatar en la sección Mi Perfil
    main_js = main_js.replace(
        ': `<span style="font-size:64px">${esc(u.avatar||"😊")}</span>`}',
        ': renderAvatar(u.avatar || "😊", u.accesorios, 78)}'
    )
    # C) Conectar renderAvatar en el Ranking Global
    main_js = main_js.replace(
        ': `<span style="font-size:26px">${esc(p.avatar || "😊")}</span>`;',
        ': renderAvatar(p.avatar || "😊", p.accesorios, 36);'
    )
    # D) Cambiar el preview para que cargue el modo ?preview=1 (gameplay en vivo sin menú) y etiqueta GAMEPLAY
    main_js = main_js.replace(
        '`data-preview="pages/${esc(juego.embed_url)}"`',
        '`data-preview="pages/${esc(juego.embed_url)}${juego.embed_url.includes("?") ? "&" : "?"}preview=1"`'
    )
    main_js = main_js.replace(
        '<div class="card-preview-label">▶ PREVIEW</div>',
        '<div class="card-preview-label">🎬 GAMEPLAY</div>'
    )
    main_js = main_js.replace("}, 500);", "}, 220);")

    # E) Inyectar sintetizador UISfx, Hero Banner y Misiones Diarias
    bloque_v8_js = """
// ── ALTOVICIO V8: SONIDOS UI, HERO BANNER Y MISIONES DIARIAS ──────────────
const UISfx = (() => {
  let ctx = null;
  function tone(f, dur, type='triangle', delay=0, vol=0.12) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctx) ctx = new AC();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator(), g = ctx.createGain();
      const t = ctx.currentTime + delay;
      osc.type = type; osc.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + dur + 0.02);
    } catch(e) {}
  }
  return {
    coin: () => { tone(988, 0.08, 'square', 0, 0.1); tone(1319, 0.22, 'square', 0.07, 0.12); },
    win: () => { [523, 659, 784, 1047].forEach((n, i) => tone(n, 0.16, 'triangle', i * 0.08, 0.14)); },
    equip: () => { tone(587, 0.07, 'sine', 0, 0.1); tone(880, 0.12, 'sine', 0.06, 0.1); }
  };
})();

async function renderizarHeroYMisiones() {
  const heroEl = document.getElementById("av-hero-panel");
  const misEl = document.getElementById("av-misiones-panel");
  if (!heroEl || !misEl) return;

  const u = await Storage.getUsuario();
  const hoy = new Date().toISOString().slice(0, 10);
  const bonusReclamado = localStorage.getItem("av_bonus_diario") === hoy;

  heroEl.innerHTML = `
    <div class="av-hero">
      <div class="av-hero-info">
        <span class="av-hero-badge">🔥 PORTAL OFICIAL ALTOVICIO</span>
        <div class="av-hero-title">¡Viciá con amigos sin descargar nada!</div>
        <div class="av-hero-desc">Salas online en tiempo real para Impostor, Gartic Phone, 8 Ball Pool y Ajedrez + 45 arcades con ranking global y VicioCoins.</div>
      </div>
      <div class="av-hero-actions">
        <button class="av-btn-glow primary" onclick="jugarAlAzar()">🎲 JUEGO AL AZAR</button>
        <a class="av-btn-glow secondary" href="pages/juego.html?id=game-022">🕵️ IMPOSTOR ONLINE</a>
        <button class="av-btn-glow bonus" onclick="reclamarBonusDiario()" ${bonusReclamado ? "disabled style='opacity:0.5;cursor:default'" : ""}>
          ${bonusReclamado ? "✅ BONUS RECLAMADO" : "🎁 +50 VICIOCOINS GRATIS"}
        </button>
      </div>
    </div>
  `;

  const reclamadas = JSON.parse(localStorage.getItem("av_misiones_" + hoy) || "[]");
  const misiones = [
    { id: "m_jugar1", titulo: "Calentando motores", desc: "Jugá al menos 1 partida", actual: Math.min(u.juegos_jugados || 0, 1), meta: 1, premio: 25 },
    { id: "m_fav3",   titulo: "Curador del Vicio",  desc: "Marcá 3 juegos favoritos", actual: Math.min((u.favoritos || []).length, 3), meta: 3, premio: 40 },
    { id: "m_xp300",  titulo: "Subiendo de Rango",  desc: "Alcanzá 300 XP totales",   actual: Math.min(u.xp || 0, 300), meta: 300, premio: 60 }
  ];

  misEl.innerHTML = `<div class="av-misiones-bar">` + misiones.map(m => {
    const pct = Math.min(100, Math.round((m.actual / m.meta) * 100));
    const ya = reclamadas.includes(m.id);
    const lista = m.actual >= m.meta && !ya;
    return `
      <div class="av-mision-card ${lista ? 'lista' : ''}">
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:14px;color:#fff">${m.titulo} <span style="color:var(--color-accent);font-size:12px">+${m.premio} 🪙</span></div>
          <div style="font-size:12px;color:var(--color-muted)">${m.desc} (${m.actual}/${m.meta})</div>
          <div class="av-mision-prog"><div class="av-mision-fill" style="width:${pct}%"></div></div>
        </div>
        ${ya
          ? `<button class="av-mision-btn done" disabled>✓ LISTO</button>`
          : (lista
              ? `<button class="av-mision-btn claim" onclick="reclamarMision('${m.id}', ${m.premio})">RECLAMAR</button>`
              : `<span style="font-family:'Orbitron',sans-serif;font-size:11px;color:var(--color-muted)">${pct}%</span>`
            )
        }
      </div>`;
  }).join("") + `</div>`;
}

function jugarAlAzar() {
  const locales = juegos.filter(j => j.tipo === "local");
  const elegido = locales[Math.floor(Math.random() * locales.length)] || juegos[0];
  if (elegido) window.location.href = `pages/juego.html?id=${encodeURIComponent(elegido.id)}`;
}

async function reclamarBonusDiario() {
  const hoy = new Date().toISOString().slice(0, 10);
  if (localStorage.getItem("av_bonus_diario") === hoy) return;
  localStorage.setItem("av_bonus_diario", hoy);
  await Storage.sumarMonedas(50);
  await Storage.sumarXP(25);
  UISfx.coin();
  mostrarToast("¡Bonus diario: +50 VicioCoins y +25 XP!", "🎁");
  await actualizarPerfil();
  await renderizarHeroYMisiones();
}

async function reclamarMision(id, premio) {
  const hoy = new Date().toISOString().slice(0, 10);
  const key = "av_misiones_" + hoy;
  const reclamadas = JSON.parse(localStorage.getItem(key) || "[]");
  if (reclamadas.includes(id)) return;
  reclamadas.push(id);
  localStorage.setItem(key, JSON.stringify(reclamadas));
  await Storage.sumarMonedas(premio);
  await Storage.sumarXP(30);
  UISfx.win();
  mostrarToast(`¡Misión completada! +${premio} VicioCoins`, "🏆");
  await actualizarPerfil();
  await renderizarHeroYMisiones();
}
"""
    if "renderizarHeroYMisiones" not in main_js:
        main_js = main_js.replace(
            "  renderizarDestacados();",
            "  renderizarHeroYMisiones();\n  renderizarDestacados();"
        )
        main_js = main_js.replace(
            'mostrarToast("Accesorio comprado y equipado", "🎉");',
            'UISfx.coin(); mostrarToast("Accesorio comprado y equipado", "🎉");'
        )
        main_js = main_js.replace(
            'mostrarToast("Accesorio equipado", "✅");',
            'UISfx.equip(); mostrarToast("Accesorio equipado", "✅");'
        )
        main_js = main_js.replace(
            'overlay.classList.add("visible");',
            'UISfx.win(); overlay.classList.add("visible");'
        )
        main_js = main_js.replace(
            "document.addEventListener(\"DOMContentLoaded\", iniciarApp);",
            bloque_v8_js + "\ndocument.addEventListener(\"DOMContentLoaded\", iniciarApp);"
        )
    escribir("js/main.js", main_js)

# ---------------------------------------------------------
# 6. JUEGO.HTML: PREMIOS DE VICIOCOINS POR PARTIDA Y RÉCORD
# ---------------------------------------------------------
juego_html = leer("pages/juego.html")
if juego_html:
    # Bajar el tiempo de monedas de 600s (10 min) a 300s (5 min)
    juego_html = juego_html.replace("if (monedaAcum >= 600)", "if (monedaAcum >= 300)")
    juego_html = juego_html.replace("+10 🪙 por jugar 10 minutos", "+10 🪙 VicioCoins por jugar 5 minutos")
    juego_html = juego_html.replace("+10 🪙 cada 10 min.", "+5 🪙 por partida · +25 🪙 por récord · +10 🪙 cada 5 min.")

    # Dar VicioCoins al terminar partida y al romper récord
    old_score_reward = "  if (xp) darXP(xp);"
    new_score_reward = """  if (xp) darXP(xp);
  const monedasGanadas = (res.isRecord ? 25 : 5);
  Storage.sumarMonedas(monedasGanadas).then(() => actualizarPerfil()).catch(() => {});"""
    if "monedasGanadas" not in juego_html:
        juego_html = juego_html.replace(old_score_reward, new_score_reward)
    escribir("pages/juego.html", juego_html)

# ---------------------------------------------------------
# 7. IMPOSTOR ONLINE: FIX DE SALA, ANFITRIÓN Y PREMIOS DEL PORTAL
# ---------------------------------------------------------
impostor_html = leer("pages/impostor/index.html")
if impostor_html:
    # A) Evitar que un invitado borre toda la sala cuando toca Volver
    old_back = "function backToHome(){\n  // Volver al lobby manteniendo la sala y los jugadores\n  if(!roomCode){ _resetCompleto(); return; }"
    new_back = "function backToHome(){\n  if(!roomCode || !isHost){ _resetCompleto(); return; }"
    impostor_html = impostor_html.replace(old_back, new_back)

    # B) Si el host sale, transferir el host al siguiente jugador en vez de destruir la sala activa
    old_leave = "  if(isHost){ await rref(`impost/${roomCode}`).remove(); }\n  else { await rref(`impost/${roomCode}/players/${myId}`).remove(); }"
    new_leave = """  if(isHost){
    const snap = await rref(`impost/${roomCode}/players`).once("value");
    const pls = snap.val() || {};
    delete pls[myId];
    const rem = Object.keys(pls);
    if(rem.length > 0){
      const nextHost = rem[0];
      await rref(`impost/${roomCode}/players/${myId}`).remove();
      await rref(`impost/${roomCode}/players/${nextHost}/isHost`).set(true);
      await rref(`impost/${roomCode}/host`).set(nextHost);
    } else {
      await rref(`impost/${roomCode}`).remove();
    }
  } else {
    await rref(`impost/${roomCode}/players/${myId}`).remove();
  }"""
    impostor_html = impostor_html.replace(old_leave, new_leave)

    # C) Avisar al portal el código de sala (para botón UNIRSE de amigos) y dar XP al terminar ronda
    impostor_html = impostor_html.replace(
        'toast("Sala creada. ¡Compartí el código!","🏠");',
        'toast("Sala creada. ¡Compartí el código!","🏠");\n    try{ window.parent.postMessage({type:"bg-room", code:roomCode}, "*"); }catch(e){}'
    )
    impostor_html = impostor_html.replace(
        'toast(`Te uniste a la sala ${roomCode}`,"🚪");',
        'toast(`Te uniste a la sala ${roomCode}`,"🚪");\n  try{ window.parent.postMessage({type:"bg-room", code:roomCode}, "*"); }catch(e){}'
    )
    impostor_html = impostor_html.replace(
        'show("s-result");',
        'show("s-result");\n  try{ window.parent.postMessage({type:"bg-score", score:100, mode:"default"}, "*"); }catch(e){}'
    )
    escribir("pages/impostor/index.html", impostor_html)

# ---------------------------------------------------------
# 8. SOCIAL.HTML, SNAKE Y LIMPIEZA DE DUPLICADOS
# ---------------------------------------------------------
social_html = leer("pages/social.html")
if social_html:
    social_html = social_html.replace(
        "const ONLINE_GAMES = new Set(['game-055','game-051','game-022','game-024']);",
        "const ONLINE_GAMES = new Set(['game-055','game-051','game-022','game-023','game-024']);"
    )
    escribir("pages/social.html", social_html)

snake_html = leer("pages/games/juego-local-1.html")
if snake_html and "¡LABERINTO COMPLETADO!" not in snake_html:
    old_next_lvl = "  if (level >= MAZES.length) { BG.submitScore(score, { mode, won: true }); }\n  state = 'next'; start('maze');"
    new_next_lvl = """  if (level >= MAZES.length) {
    state = 'over'; BG.stop(); BG.music.stop();
    const r = BG.submitScore(score, { mode, won: true });
    BG.ui.gameOver({
      win: true, icon: '🏆', title: '¡LABERINTO COMPLETADO!', score,
      isRecord: r.isRecord || r.first,
      stats: [{ label: 'Niveles', value: MAZES.length }, { label: 'Récord', value: BG.getBest(mode) || score }],
      onRetry: () => { level = 0; state = 'menu'; start('maze'); }, onMenu: showMenu
    });
    return;
  }
  state = 'next'; start('maze');"""
    snake_html = snake_html.replace(old_next_lvl, new_next_lvl)
    escribir("pages/games/juego-local-1.html", snake_html)

games_data = leer("js/games-data.js")
if games_data:
    # Eliminar el Pacman externo duplicado (game-009) dejando el Pac-Man propio local (game-039)
    games_data = re.sub(r'^\s*\{\s*id:"game-009".*?\},\r?\n', '', games_data, flags=re.MULTILINE)
    escribir("js/games-data.js", games_data)

# Eliminar los 41 SVGs viejos duplicados en assets/thumbs/
svgs_viejos = glob.glob(os.path.join(base, "assets", "thumbs", "juego-local-*.svg"))
for svg in svgs_viejos:
    try:
        os.remove(svg)
    except OSError:
        pass
if svgs_viejos:
    print(f"✔ Limpiados {len(svgs_viejos)} archivos SVG antiguos duplicados.")

print("\n🚀 ¡ACTUALIZACIÓN ALTOVICIO V8 COMPLETADA CON ÉXITO!")