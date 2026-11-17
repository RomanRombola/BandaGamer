import os
import re

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

# -------------------------------------------------------------------------
# 1. MOTOR UNIVERSAL DE AVATARES Y TIENDA PLATO (INYIZADO EN STORAGE.JS)
# -------------------------------------------------------------------------
av_engine_js = r"""
// ═══════════════════════════════════════════════════════════════════════════
//  ALTOVICIO V9 — MOTOR PLATO DE AVATARES, TIENDA, TÍTULOS Y BURBUJAS
// ═══════════════════════════════════════════════════════════════════════════
window.ACCESORIOS_DEFAULT = {
  emoji: "e_smile",
  sombrero: "s_none",
  lentes: "l_none",
  bigote: "b_none",
  marco: "m_none",
  efecto: "ef_none",
  mascota: "pet_none",
  titulo: "t_none",
  burbuja: "chat_default",
  offsetY: 0,
  scale: 100
};

window.ACCESORIOS = {
  sombreros: [
    { id: "s_none",       emoji: "",     nombre: "Sin sombrero",   precio: 0,    reqNivel: 1, rareza: "comun" },
    { id: "s_gorra",      emoji: "🧢",   nombre: "Gorra Street",   precio: 40,   reqNivel: 1, rareza: "comun" },
    { id: "s_auris",      emoji: "🎧",   nombre: "Auris Streamer", precio: 90,   reqNivel: 1, rareza: "raro" },
    { id: "s_cowboy",     emoji: "🤠",   nombre: "Vaquero Picante",precio: 120,  reqNivel: 2, rareza: "raro" },
    { id: "s_chef",       emoji: "👨‍🍳",  nombre: "Master Chef",    precio: 150,  reqNivel: 2, rareza: "raro" },
    { id: "s_casco",      emoji: "⛑️",   nombre: "Casco Rescate",  precio: 160,  reqNivel: 3, rareza: "raro" },
    { id: "s_bruja",      emoji: "🎩",   nombre: "Galera VIP",     precio: 220,  reqNivel: 3, rareza: "epico" },
    { id: "s_angel",      emoji: "😇",   nombre: "Santo Inocente", precio: 260,  reqNivel: 4, rareza: "epico" },
    { id: "s_diablo",     emoji: "😈",   nombre: "Diablito",       precio: 280,  reqNivel: 4, rareza: "epico" },
    { id: "s_santa",      emoji: "🎅",   nombre: "Papá Noel",      precio: 250,  reqNivel: 4, rareza: "epico" },
    { id: "s_corona",     emoji: "👑",   nombre: "Corona del Rey", precio: 400,  reqNivel: 5, rareza: "legendario" },
    { id: "s_vikingo",    emoji: "🪖",   nombre: "Casco Táctico",  precio: 420,  reqNivel: 6, rareza: "epico" },
    { id: "s_mago",       emoji: "🧙‍♂️",  nombre: "Hechicero",      precio: 500,  reqNivel: 7, rareza: "legendario" },
    { id: "s_astronauta", emoji: "👨‍🚀",  nombre: "Cosmonauta",     precio: 650,  reqNivel: 8, rareza: "legendario" },
    { id: "s_alien_hat",  emoji: "🛸",   nombre: "Abducción OVNI", precio: 850,  reqNivel: 9, rareza: "mitico" },
    { id: "s_supremo",    emoji: "🏆",   nombre: "Copa del Mundo", precio: 1000, reqNivel: 10, rareza: "mitico" }
  ],
  lentes: [
    { id: "l_none",   emoji: "",    nombre: "Sin lentes",      precio: 0,   reqNivel: 1, rareza: "comun" },
    { id: "l_cool",   emoji: "🕶️",  nombre: "Deal With It",    precio: 60,  reqNivel: 1, rareza: "comun" },
    { id: "l_nerd",   emoji: "👓",  nombre: "Intelectual",     precio: 90,  reqNivel: 1, rareza: "comun" },
    { id: "l_monoc",  emoji: "🧐",  nombre: "Fino Señores",    precio: 150, reqNivel: 2, rareza: "raro" },
    { id: "l_fuego",  emoji: "🥸",  nombre: "Incógnito",       precio: 160, reqNivel: 3, rareza: "raro" },
    { id: "l_star",   emoji: "🤩",  nombre: "Ojos Estrella",   precio: 220, reqNivel: 4, rareza: "epico" },
    { id: "l_heart",  emoji: "😍",  nombre: "Enamorado",       precio: 240, reqNivel: 4, rareza: "epico" },
    { id: "l_vr",     emoji: "🥽",  nombre: "Visor Meta VR",   precio: 350, reqNivel: 5, rareza: "epico" },
    { id: "l_fire",   emoji: "🔥",  nombre: "Mirada Ígnea",    precio: 480, reqNivel: 6, rareza: "legendario" },
    { id: "l_cyber",  emoji: "⚡",  nombre: "Láser Voltaico",  precio: 650, reqNivel: 8, rareza: "mitico" }
  ],
  bigotes: [
    { id: "b_none",    emoji: "",    nombre: "Sin accesorio",  precio: 0,   reqNivel: 1, rareza: "comun" },
    { id: "b_mate",    emoji: "🧉",  nombre: "Mate Amargo",    precio: 80,  reqNivel: 1, rareza: "raro" },
    { id: "b_fino",    emoji: "🥸",  nombre: "Mostacho",       precio: 60,  reqNivel: 1, rareza: "comun" },
    { id: "b_pizza",   emoji: "🍕",  nombre: "Porción Muzza",  precio: 120, reqNivel: 2, rareza: "raro" },
    { id: "b_largo",   emoji: "🧔",  nombre: "Barba Leñador",  precio: 140, reqNivel: 2, rareza: "raro" },
    { id: "b_rosa",    emoji: "🌹",  nombre: "Galán Seductor", precio: 180, reqNivel: 3, rareza: "epico" },
    { id: "b_pirata",  emoji: "🏴‍☠️", nombre: "Parche Pirata",  precio: 220, reqNivel: 4, rareza: "epico" },
    { id: "b_ninja",   emoji: "🥷",  nombre: "Máscara Shinobi",precio: 320, reqNivel: 5, rareza: "epico" },
    { id: "b_fuego",   emoji: "🌶️",  nombre: "Picante",        precio: 380, reqNivel: 6, rareza: "legendario" },
    { id: "b_king",    emoji: "💎",  nombre: "Grillz Diamante",precio: 550, reqNivel: 7, rareza: "mitico" }
  ],
  marcos: [
    { id: "m_none",    css: "", nombre: "Sin marco", precio: 0, reqNivel: 1, rareza: "comun" },
    { id: "m_naranja", css: "box-shadow:0 0 0 3px #ff6600, 0 0 14px #ff6600;", nombre: "Neón Naranja", precio: 50, reqNivel: 1, rareza: "comun" },
    { id: "m_azul",    css: "box-shadow:0 0 0 3px #00aaff, 0 0 14px #00aaff;", nombre: "Láser Azul", precio: 50, reqNivel: 1, rareza: "comun" },
    { id: "m_verde",   css: "box-shadow:0 0 0 3px #39ff14, 0 0 16px #39ff14;", nombre: "Tóxico Radioactivo", precio: 100, reqNivel: 2, rareza: "raro" },
    { id: "m_rojo",    css: "box-shadow:0 0 0 3px #ff0055, 0 0 18px #ff0055;", nombre: "Furia Carmesí", precio: 150, reqNivel: 2, rareza: "raro" },
    { id: "m_dorado",  css: "box-shadow:0 0 0 3px #ffe600, 0 0 20px #ff9900;", nombre: "Oro Puro", precio: 220, reqNivel: 3, rareza: "epico" },
    { id: "m_arg",     css: "background:conic-gradient(#74acdf 0 33%, #fff 33% 66%, #ffd700 66% 100%);padding:3px;box-shadow:0 0 18px rgba(116,172,223,0.8);", nombre: "Campeón ⭐⭐⭐", precio: 350, reqNivel: 3, rareza: "legendario", spin: true },
    { id: "m_morado",  css: "box-shadow:0 0 0 3px #a855f7, 0 0 20px #a855f7;", nombre: "Abismo Púrpura", precio: 200, reqNivel: 3, rareza: "epico" },
    { id: "m_celeste", css: "box-shadow:0 0 0 3px #00ffcc, 0 0 20px #00ffcc;", nombre: "Hielo Eterno", precio: 260, reqNivel: 4, rareza: "epico" },
    { id: "m_galaxy",  css: "background:conic-gradient(#ff0055,#ff6600,#ffe600,#39ff14,#00aaff,#a855f7,#ff0055);padding:3px;box-shadow:0 0 22px rgba(0,170,255,0.7);", nombre: "RGB Gamer Pro", precio: 500, reqNivel: 5, rareza: "legendario", spin: true },
    { id: "m_fuego",   css: "background:conic-gradient(#ff0000,#ff6600,#ffe600,#ff6600,#ff0000);padding:3px;box-shadow:0 0 24px rgba(255,80,0,0.9);", nombre: "Llama Solar", precio: 650, reqNivel: 7, rareza: "legendario", spin: true },
    { id: "m_aurora",  css: "background:conic-gradient(#00ffcc,#00aaff,#a855f7,#ff00aa,#00ffcc);padding:3px;box-shadow:0 0 26px rgba(168,85,247,0.85);", nombre: " Galaxia Mítica", precio: 800, reqNivel: 8, rareza: "mitico", spin: true },
    { id: "m_banda",   css: "background:conic-gradient(#ffe600,#ff6600,#ffffff,#ff6600,#ffe600);padding:3.5px;box-shadow:0 0 30px rgba(255,215,0,0.95);", nombre: "Dios del Vicio", precio: 1000, reqNivel: 10, rareza: "mitico", spin: true }
  ],
  efectos: [
    { id: "ef_none",   badge: "",   css: "", nombre: "Sin aura", precio: 0, reqNivel: 1, rareza: "comun" },
    { id: "ef_stars",  badge: "✨", css: "box-shadow:0 0 24px rgba(255,230,0,0.55);", nombre: "Polvo Estelar", precio: 180, reqNivel: 2, rareza: "raro" },
    { id: "ef_hearts", badge: "💖", css: "box-shadow:0 0 24px rgba(255,51,153,0.65);", nombre: "Rompecorazones", precio: 240, reqNivel: 3, rareza: "epico" },
    { id: "ef_fire",   badge: "🔥", css: "box-shadow:0 0 28px rgba(255,80,0,0.8), 0 -6px 20px rgba(255,200,0,0.6);", nombre: "Aura Ígnea", precio: 380, reqNivel: 4, rareza: "epico" },
    { id: "ef_saiyan", badge: "⚡", css: "box-shadow:0 0 32px rgba(255,230,0,0.95), 0 0 12px #00e5ff;", nombre: "Ki Saiyajin", precio: 550, reqNivel: 6, rareza: "legendario" },
    { id: "ef_dark",   badge: "🌀", css: "box-shadow:0 0 32px rgba(147,51,234,0.9), inset 0 0 12px #000;", nombre: "Materia Oscura", precio: 750, reqNivel: 8, rareza: "mitico" }
  ],
  mascotas: [
    { id: "pet_none",  emoji: "",   nombre: "Sin mascota",     precio: 0,   reqNivel: 1, rareza: "comun" },
    { id: "pet_capi",  emoji: "🦫", nombre: "Capibara Chill",  precio: 150, reqNivel: 1, rareza: "raro" },
    { id: "pet_cat",   emoji: "🐱", nombre: "Michi Vicioso",   precio: 180, reqNivel: 2, rareza: "raro" },
    { id: "pet_dog",   emoji: "🐶", nombre: "Doge Guardián",   precio: 180, reqNivel: 2, rareza: "raro" },
    { id: "pet_duck",  emoji: "🦆", nombre: "Patito Táctico",  precio: 260, reqNivel: 3, rareza: "epico" },
    { id: "pet_ghost", emoji: "👻", nombre: "Gasparín",        precio: 320, reqNivel: 4, rareza: "epico" },
    { id: "pet_alien", emoji: "👾", nombre: "Invasor 8-Bit",   precio: 450, reqNivel: 5, rareza: "legendario" },
    { id: "pet_drag",  emoji: "🐉", nombre: "Shenlong Mini",   precio: 700, reqNivel: 7, rareza: "mitico" }
  ],
  titulos: [
    { id: "t_none",     texto: "",                     color: "#888888", precio: 0,   reqNivel: 1, rareza: "comun" },
    { id: "t_cebador",  texto: "🧉 Cebador Oficial",   color: "#39ff88", precio: 80,  reqNivel: 1, rareza: "comun" },
    { id: "t_tryhard",  texto: "💦 Tryhard 24/7",      color: "#00aaff", precio: 140, reqNivel: 2, rareza: "raro" },
    { id: "t_impostor", texto: "🔪 Impostor Pro",      color: "#ff3366", precio: 200, reqNivel: 3, rareza: "epico" },
    { id: "t_campeon",  texto: "⭐⭐⭐ Campeón Mundial", color: "#74acdf", precio: 300, reqNivel: 3, rareza: "legendario" },
    { id: "t_millo",    texto: "💸 Magnate VicioCoin", color: "#ffe600", precio: 500, reqNivel: 5, rareza: "legendario" },
    { id: "t_dios",     texto: "👑 Rey de AltoVicio",  color: "#ff6600", precio: 900, reqNivel: 8, rareza: "mitico" }
  ],
  burbujas: [
    { id: "chat_default", nombre: "Clásica",         precio: 0,   reqNivel: 1, rareza: "comun",      css: "background:rgba(255,102,0,0.2);border:1px solid rgba(255,102,0,0.35);color:#fff;" },
    { id: "chat_cyber",   nombre: "Cyberpunk Neón",  precio: 120, reqNivel: 1, rareza: "raro",       css: "background:linear-gradient(135deg,rgba(0,170,255,0.28),rgba(168,85,247,0.28));border:1px solid #00e5ff;color:#e0faff;box-shadow:0 0 12px rgba(0,229,255,0.25);" },
    { id: "chat_toxic",   nombre: "Ácido Verde",     precio: 180, reqNivel: 2, rareza: "raro",       css: "background:rgba(57,255,20,0.16);border:1px solid #39ff14;color:#d8ffd0;box-shadow:0 0 10px rgba(57,255,20,0.2);" },
    { id: "chat_fire",    nombre: "Fuego Infernal",  precio: 280, reqNivel: 4, rareza: "epico",      css: "background:linear-gradient(135deg,rgba(255,0,60,0.3),rgba(255,120,0,0.3));border:1px solid #ff4500;color:#fff2e6;box-shadow:0 0 14px rgba(255,69,0,0.3);" },
    { id: "chat_gold",    nombre: "VIP Oro Real",    precio: 450, reqNivel: 6, rareza: "legendario", css: "background:linear-gradient(135deg,rgba(255,215,0,0.28),rgba(180,100,0,0.35));border:1px solid #ffd700;color:#fffbe0;box-shadow:0 0 16px rgba(255,215,0,0.35);font-weight:700;" }
  ],
  emojis: [
    { id: "e_smile",     emoji: "😊", nombre: "Sonrisa",   precio: 0,    reqNivel: 1, rareza: "comun" },
    { id: "e_cool",      emoji: "😎", nombre: "Fachero",   precio: 50,   reqNivel: 1, rareza: "comun" },
    { id: "e_clown",     emoji: "🤡", nombre: "Payaso",    precio: 80,   reqNivel: 1, rareza: "raro" },
    { id: "e_fire",      emoji: "🔥", nombre: "Fuego",     precio: 100,  reqNivel: 2, rareza: "raro" },
    { id: "e_Ghostface", emoji: "😱", nombre: "Scream",    precio: 150,  reqNivel: 2, rareza: "raro" },
    { id: "e_skull",     emoji: "💀", nombre: "Calavera",  precio: 220,  reqNivel: 3, rareza: "epico" },
    { id: "e_alien",     emoji: "👽", nombre: "visitante", precio: 280,  reqNivel: 4, rareza: "epico" },
    { id: "e_robot",     emoji: "🤖", nombre: "Mecha",     precio: 340,  reqNivel: 5, rareza: "epico" },
    { id: "e_ninja",     emoji: "🥷", nombre: "Sombra",    precio: 420,  reqNivel: 6, rareza: "legendario" },
    { id: "e_dragon",    emoji: "🐲", nombre: "Dragón",    precio: 550,  reqNivel: 7, rareza: "legendario" },
    { id: "e_diamond",   emoji: "💎", nombre: "Diamante",  precio: 750,  reqNivel: 8, rareza: "mitico" },
    { id: "e_supreme",   emoji: "🌌", nombre: "Cósmico",   precio: 1000, reqNivel: 10, rareza: "mitico" }
  ]
};

window.urlFotoSeguraGlobal = function(u) {
  if (typeof u !== "string") return "";
  if (!/^(data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+\/=]+|https:\/\/[^\s"'<>]+)$/.test(u)) return "";
  return u;
};

// Renderiza el avatar completo estilo Plato: funciona TANTO sobre tu foto de perfil subida como sobre el emoji base
window.renderAvatar = function(base, accesorios={}, size=44, fotoUrl="") {
  // Permitir pasar el objeto usuario entero como primer parámetro si se desea
  if (base && typeof base === "object") {
    const uObj = base;
    accesorios = uObj.accesorios || {};
    fotoUrl = uObj.fotoPerfil || "";
    base = uObj.avatar || "😊";
  }
  const acc = { ...window.ACCESORIOS_DEFAULT, ...(accesorios || {}) };
  const foto = window.urlFotoSeguraGlobal(fotoUrl);
  const emojiBase = window.ACCESORIOS.emojis.find(a => a.id === acc.emoji)?.emoji || base || "😊";
  const sombrero  = window.ACCESORIOS.sombreros.find(a => a.id === acc.sombrero)?.emoji || "";
  const lentes    = window.ACCESORIOS.lentes.find(a => a.id === acc.lentes)?.emoji || "";
  const bigote    = window.ACCESORIOS.bigotes.find(a => a.id === acc.bigote)?.emoji || "";
  const marcoAcc  = window.ACCESORIOS.marcos.find(a => a.id === acc.marco);
  const efectoAcc = window.ACCESORIOS.efectos.find(a => a.id === acc.efecto);
  const mascota   = window.ACCESORIOS.mascotas.find(a => a.id === acc.mascota)?.emoji || "";

  const offY = Math.max(-25, Math.min(25, Number(acc.offsetY) || 0)) * (size / 80);
  const sc   = Math.max(0.7, Math.min(1.4, (Number(acc.scale) || 100) / 100));

  const auraStyle = efectoAcc?.css || "";
  const marcoStyle = marcoAcc?.css || "border:1.5px solid rgba(255,255,255,0.16);";
  const innerContent = foto
    ? `<img src="${foto}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block">`
    : `<span style="font-size:${Math.round(size * 0.64)}px;line-height:1;display:flex;align-items:center;justify-content:center;width:100%;height:100%">${emojiBase}</span>`;

  return `<div class="av-plato-wrap" style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;flex-shrink:0;vertical-align:middle;overflow:visible !important;">
    ${auraStyle ? `<div class="av-aura-layer" style="position:absolute;inset:-4px;border-radius:50%;pointer-events:none;${auraStyle}"></div>` : ""}
    <div class="av-frame-ring ${marcoAcc?.spin ? 'av-spin-ring' : ''}" style="position:relative;width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#161628;${marcoStyle}">
      <div style="width:100%;height:100%;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 30% 30%,#252542,#0f0f1d);display:flex;align-items:center;justify-content:center;">
        ${innerContent}
      </div>
    </div>
    ${sombrero ? `<span style="position:absolute;top:${Math.round(-size * 0.34 + offY)}px;left:50%;transform:translateX(-50%) scale(${sc});font-size:${Math.round(size * 0.52)}px;line-height:1;pointer-events:none;z-index:5;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.75))">${sombrero}</span>` : ""}
    ${lentes ? `<span style="position:absolute;top:${Math.round(size * 0.16 + offY)}px;left:50%;transform:translateX(-50%) scale(${sc});font-size:${Math.round(size * 0.42)}px;line-height:1;pointer-events:none;z-index:4;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.7))">${lentes}</span>` : ""}
    ${bigote ? `<span style="position:absolute;bottom:${Math.round(-size * 0.08 - offY * 0.6)}px;left:50%;transform:translateX(-50%) scale(${sc});font-size:${Math.round(size * 0.38)}px;line-height:1;pointer-events:none;z-index:4;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.75))">${bigote}</span>` : ""}
    ${mascota ? `<span class="av-pet-float" style="position:absolute;bottom:${Math.round(-size * 0.12)}px;right:${Math.round(-size * 0.20)}px;font-size:${Math.round(size * 0.44)}px;line-height:1;pointer-events:none;z-index:6;filter:drop-shadow(0 3px 5px rgba(0,0,0,0.8))">${mascota}</span>` : ""}
    ${efectoAcc?.badge ? `<span class="av-badge-spark" style="position:absolute;top:${Math.round(-size * 0.12)}px;left:${Math.round(-size * 0.14)}px;font-size:${Math.round(size * 0.30)}px;line-height:1;pointer-events:none;z-index:6">${efectoAcc.badge}</span>` : ""}
  </div>`;
};

window.renderTituloBadge = function(accesorios={}) {
  const id = accesorios?.titulo || "t_none";
  const t = window.ACCESORIOS.titulos.find(x => x.id === id);
  if (!t || !t.texto) return "";
  return `<span class="av-titulo-pill" style="display:inline-block;font-family:'Orbitron',sans-serif;font-size:9px;font-weight:800;padding:2px 8px;border-radius:99px;background:rgba(0,0,0,0.45);border:1px solid ${t.color};color:${t.color};letter-spacing:0.6px;box-shadow:0 0 8px ${t.color}33;vertical-align:middle">${t.texto}</span>`;
};

window.getChatBubbleCSS = function(accesorios={}) {
  const id = accesorios?.burbuja || "chat_default";
  const b = window.ACCESORIOS.burbujas.find(x => x.id === id) || window.ACCESORIOS.burbujas[0];
  return b.css;
};
"""

storage_js = leer("js/storage.js")
if storage_js:
    # Asegurar que publicarPerfil y el ranking guarden accesorios y fotoPerfil en la nube
    if "accesorios: u.accesorios || {}" not in storage_js:
        storage_js = re.sub(
            r'(avatar:\s*u\.avatar\s*\|\|\s*"😊"\s*,)',
            r'\1\n        accesorios: u.accesorios || {},',
            storage_js
        )
    if "window.ACCESORIOS_DEFAULT =" not in storage_js:
        storage_js = storage_js.rstrip() + "\n\n" + av_engine_js + "\n"
    else:
        storage_js = storage_js.split("// ═══════════════════════════════════════════════════════════════════════════\n//  ALTOVICIO V9")[0].rstrip() + "\n\n" + av_engine_js + "\n"
    escribir("js/storage.js", storage_js)

# -------------------------------------------------------------------------
# 2. ACTUALIZAR CSS (ANIMACIONES PLATO, PROBADOR DE TIENDA Y RAREZAS)
# -------------------------------------------------------------------------
styles_css = leer("css/styles.css")
if styles_css:
    if "/* === PLATO V9 STORE & AVATAR FX ===" in styles_css:
        styles_css = styles_css.split("/* === PLATO V9 STORE & AVATAR FX ===")[0]

    plato_css = """
/* === PLATO V9 STORE & AVATAR FX === */
@keyframes avPetBob {
  0%, 100% { transform: translateY(0) rotate(-4deg); }
  50% { transform: translateY(-4px) rotate(6deg); }
}
@keyframes avSparkPulse {
  0%, 100% { transform: scale(0.9); opacity: 0.85; }
  50% { transform: scale(1.2); opacity: 1; }
}
.av-pet-float { animation: avPetBob 2.2s ease-in-out infinite; }
.av-badge-spark { animation: avSparkPulse 1.6s ease-in-out infinite; }
.av-aura-layer { animation: avSparkPulse 2s ease-in-out infinite; }

.ranking-avatar, .perfil-avatar-mini, .perfil-avatar-grande, .user-avatar, .am-av, .qc-av {
  overflow: visible !important;
  background: transparent !important;
  border: none !important;
}

/* Estudio en vivo estilo Plato */
.plato-studio {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;
  background: radial-gradient(circle at 20% 20%, rgba(255, 102, 0, 0.18), rgba(14, 14, 28, 0.96) 70%);
  border: 1px solid rgba(255, 102, 0, 0.4);
  border-radius: 18px;
  padding: 22px;
  margin-bottom: 20px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.65);
  align-items: center;
}
@media (max-width: 720px) {
  .plato-studio { grid-template-columns: 1fr; text-align: center; }
}
.plato-stage-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px;
  border-radius: 16px;
  background: rgba(8, 8, 16, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.plato-controls-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.plato-sliders {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 12px 14px;
}
.plato-slider-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--color-muted);
  font-weight: 700;
}
.plato-slider-row input[type="range"] {
  accent-color: var(--color-primary);
  width: 100%;
  cursor: pointer;
}
.plato-chat-preview {
  padding: 10px 14px;
  border-radius: 14px 14px 4px 14px;
  font-size: 13px;
  max-width: 320px;
  line-height: 1.35;
}
.plato-cat-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 10px;
  margin-bottom: 16px;
  scrollbar-width: none;
}
.plato-cat-tabs::-webkit-scrollbar { display: none; }
.plato-tab-btn {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-muted);
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  font-weight: 700;
  padding: 9px 14px;
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.2s;
}
.plato-tab-btn.activo, .plato-tab-btn:hover {
  background: linear-gradient(135deg, rgba(255, 102, 0, 0.25), rgba(255, 180, 0, 0.15));
  border-color: var(--color-primary);
  color: #fff;
  box-shadow: 0 0 14px rgba(255, 102, 0, 0.3);
}
.tienda-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)) !important;
  gap: 14px !important;
}
.tienda-card {
  position: relative;
  padding: 16px 12px 12px !important;
  border-radius: 14px !important;
  overflow: visible !important;
}
.rareza-tag {
  font-family: 'Orbitron', sans-serif;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 1px;
  padding: 2px 7px;
  border-radius: 99px;
  text-transform: uppercase;
}
.rareza-comun { background: rgba(255,255,255,0.08); color: #aaa; }
.rareza-raro { background: rgba(0,170,255,0.18); color: #38bdf8; border: 1px solid rgba(0,170,255,0.35); }
.rareza-epico { background: rgba(168,85,247,0.2); color: #c084fc; border: 1px solid rgba(168,85,247,0.4); }
.rareza-legendario { background: rgba(255,215,0,0.2); color: #fde047; border: 1px solid rgba(255,215,0,0.45); box-shadow: 0 0 10px rgba(255,215,0,0.2); }
.rareza-mitico { background: linear-gradient(90deg, #ff0055, #ff6600, #00aaff); color: #fff; box-shadow: 0 0 12px rgba(255,0,85,0.4); }
.av-btn-probar {
  background: rgba(255,255,255,0.06);
  color: #ccc;
  border: 1px solid rgba(255,255,255,0.12);
  font-size: 9px !important;
  padding: 4px 8px !important;
  margin-top: 2px;
}
.av-btn-probar:hover { border-color: #fff; color: #fff; }
"""
    escribir("css/styles.css", styles_css.rstrip() + "\n" + plato_css)

# -------------------------------------------------------------------------
# 3. ACTUALIZAR MAIN.JS: AVATAR CON FOTO + ACCESORIOS Y TIENDA PLATO STUDIO
# -------------------------------------------------------------------------
main_js = leer("js/main.js")
if main_js:
    # A) Asegurar que actualizarPerfil siempre llame a renderAvatar pasando fotoPerfil
    main_js = re.sub(
        r'if \(el\("perfil-avatar"\)\)\s*\{.*?\}\s*else if|if \(el\("perfil-avatar"\)\)\s*\{[^}]+\}|if \(el\("perfil-avatar"\)\)\s*el\("perfil-avatar"\)\.textContent\s*=\s*u\.avatar\s*\|\|\s*"😊";',
        'if (el("perfil-avatar")) el("perfil-avatar").innerHTML = window.renderAvatar(u.avatar || "😊", u.accesorios, 34, u.fotoPerfil);',
        main_js,
        flags=re.DOTALL
    )

    # B) En Ranking Global: usar siempre renderAvatar con foto + accesorios + título
    old_rk_block = re.search(r'const foto = urlFotoSegura\(p\.fotoPerfil\);.*?return `\s*<div class="ranking-fila', main_js, flags=re.DOTALL)
    if old_rk_block:
        nuevo_rk_inicio = """const avatarHtml = window.renderAvatar(p.avatar || "😊", p.accesorios, 40, p.fotoPerfil);
    const tituloBadge = window.renderTituloBadge ? window.renderTituloBadge(p.accesorios) : "";
    return `
      <div class="ranking-fila"""
        main_js = main_js[:old_rk_block.start()] + nuevo_rk_inicio + main_js[old_rk_block.end():]
        main_js = main_js.replace(
            'style="display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;overflow:hidden;background:rgba(255,255,255,0.05)">${avatarHtml}</div>',
            'style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;overflow:visible">${avatarHtml}</div>'
        )
        main_js = main_js.replace(
            '<div class="ranking-nivel-txt">${esc(nivelNombre)}</div>',
            '<div class="ranking-nivel-txt">${esc(nivelNombre)} ${tituloBadge}</div>'
        )

    # C) En Modal de verPerfilUsuario: usar renderAvatar con foto + accesorios
    main_js = re.sub(
        r'const avatarEl = modal\.querySelector\("#mpf-avatar"\);\s*const fotoP = urlFotoSegura\(p\.fotoPerfil\);\s*if \(fotoP\) \{.*?\}\s*else \{.*?\}',
        'const avatarEl = modal.querySelector("#mpf-avatar");\n    avatarEl.innerHTML = window.renderAvatar(p.avatar || "😊", p.accesorios, 84, p.fotoPerfil);',
        main_js,
        flags=re.DOTALL
    )

    # D) En Mi Perfil (renderizarPerfil): mostrar foto CON todos los accesorios encima + título
    main_js = re.sub(
        r'\$\{fotoSegura\s*\?\s*`<img src="\$\{fotoSegura\}".*?`\s*:\s*[^}]+\}',
        '${window.renderAvatar(u.avatar || "😊", u.accesorios, 88, u.fotoPerfil)}',
        main_js,
        flags=re.DOTALL
    )
    main_js = main_js.replace(
        '<div class="perfil-rango">${esc(NOMBRES_NIVEL[u.nivel] || "")}</div>',
        '<div class="perfil-rango">${esc(NOMBRES_NIVEL[u.nivel] || "")} ${window.renderTituloBadge ? window.renderTituloBadge(u.accesorios) : ""}</div>'
    )

    # E) Reemplazar renderizarTienda, comprarAccesorio y equiparAccesorio por el nuevo VicioShop Studio estilo Plato
    plato_shop_functions = r"""
// ── TIENDA ESTILO PLATO (VICIOSHOP STUDIO V9) ─────────────────────────────
let _catTiendaActiva = "todos";
let _previewOverride = null;

const CATEGORIAS_TIENDA = [
  { key: "todos",    plural: "todos",     label: "✨ Todo" },
  { key: "marco",    plural: "marcos",    label: "🖼️ Marcos" },
  { key: "efecto",   plural: "efectos",   label: "⚡ Auras" },
  { key: "sombrero", plural: "sombreros", label: "👑 Sombreros" },
  { key: "lentes",   plural: "lentes",    label: "🕶️ Lentes" },
  { key: "bigote",   plural: "bigotes",   label: "🧉 Boca / Mate" },
  { key: "mascota",  plural: "mascotas",  label: "🦫 Mascotas" },
  { key: "titulo",   plural: "titulos",   label: "🏷️ Títulos" },
  { key: "burbuja",  plural: "burbujas",  label: "💬 Burbujas Chat" },
  { key: "emoji",    plural: "emojis",    label: "😎 Caras Base" }
];

async function renderizarTienda() {
  const u = await Storage.getUsuario();
  const contenedor = document.getElementById("tienda-grid");
  if (!contenedor) return;
  contenedor.style.display = "block";

  const comprados = u.accesorios_comprados || [];
  const baseEquip = { ...window.ACCESORIOS_DEFAULT, ...(u.accesorios || {}) };
  const lookActual = _previewOverride ? { ...baseEquip, ..._previewOverride } : baseEquip;

  const monEl = document.getElementById("tienda-monedas");
  if (monEl) monEl.textContent = (u.monedas || 0).toLocaleString();

  const tituloHtml = window.renderTituloBadge(lookActual) || '<span style="font-size:11px;color:var(--color-muted)">Sin título equipado</span>';
  const bubbleCss  = window.getChatBubbleCSS(lookActual);

  const tabsHtml = CATEGORIAS_TIENDA.map(c =>
    `<button class="plato-tab-btn ${_catTiendaActiva === c.key ? 'activo' : ''}" onclick="cambiarCatTienda('${c.key}')">${c.label}</button>`
  ).join("");

  const catsAMostrar = _catTiendaActiva === "todos"
    ? CATEGORIAS_TIENDA.filter(c => c.key !== "todos")
    : CATEGORIAS_TIENDA.filter(c => c.key === _catTiendaActiva);

  const seccionesHtml = catsAMostrar.map(cat => {
    const items = window.ACCESORIOS[cat.plural] || [];
    const equipadoId = baseEquip[cat.key] || (items[0] && items[0].id);
    const cards = items.map(item => {
      const poseido  = item.precio === 0 || comprados.includes(item.id);
      const equipado = equipadoId === item.id;
      const bloq     = (u.nivel || 1) < item.reqNivel;
      const puede    = !bloq && (u.monedas || 0) >= item.precio;
      const rar      = item.rareza || "comun";

      // Vista previa de cada ítem aplicada sobre la propia foto/avatar del usuario
      const mockAcc = { ...baseEquip, [cat.key]: item.id };
      let previewHtml = "";
      if (cat.key === "titulo") {
        previewHtml = `<div style="min-height:54px;display:flex;align-items:center;justify-content:center">${item.texto ? window.renderTituloBadge(mockAcc) : '<span style="color:#666;font-size:12px">Ninguno</span>'}</div>`;
      } else if (cat.key === "burbuja") {
        previewHtml = `<div style="min-height:54px;display:flex;align-items:center;justify-content:center"><div style="padding:6px 10px;border-radius:10px;font-size:11px;${item.css}">¡Hola banda! 🎮</div></div>`;
      } else {
        previewHtml = `<div style="margin:6px 0">${window.renderAvatar(u.avatar || "😊", mockAcc, 54, u.fotoPerfil)}</div>`;
      }

      let btnAccion = "";
      if (equipado)     btnAccion = `<button class="av-btn av-btn-equipado" disabled>✓ EQUIPADO</button>`;
      else if (poseido) btnAccion = `<button class="av-btn av-btn-equipar" onclick="equiparAccesorio('${cat.key}','${item.id}')">EQUIPAR</button>`;
      else if (bloq)    btnAccion = `<button class="av-btn av-btn-bloqueado" disabled>🔒 Nv.${item.reqNivel}</button>`;
      else              btnAccion = `<button class="av-btn av-btn-comprar ${puede ? '' : 'av-sin-fondos'}" onclick="comprarAccesorio('${item.id}','${cat.key}')" ${puede ? '' : 'disabled'}>🪙 ${item.precio}</button>`;

      const btnProbar = !equipado
        ? `<button class="av-btn av-btn-probar" onclick="probarEnEstudio('${cat.key}','${item.id}')">👁️ Probar en mí</button>`
        : "";

      return `<div class="tienda-card ${equipado ? 'tienda-card-equipado' : ''} ${bloq ? 'tienda-card-bloqueado' : ''}">
        <span class="rareza-tag rareza-${rar}">${rar}</span>
        ${previewHtml}
        <div class="tienda-avatar-nombre" style="color:#fff;font-size:13px">${esc(item.nombre)}</div>
        ${btnAccion}
        ${btnProbar}
      </div>`;
    }).join("");

    return `<div style="margin-bottom:24px">
      <div style="font-family:'Orbitron',sans-serif;font-size:12px;font-weight:800;color:var(--color-primary);letter-spacing:1.5px;margin-bottom:12px">${cat.label}</div>
      <div class="tienda-grid">${cards}</div>
    </div>`;
  }).join("");

  contenedor.innerHTML = `
    <div class="plato-studio">
      <div class="plato-stage-box">
        <div style="font-family:'Orbitron',sans-serif;font-size:10px;color:var(--color-accent);letter-spacing:1.5px">PROBADOR EN VIVO</div>
        <div id="studio-avatar-stage" style="padding:14px 0">
          ${window.renderAvatar(u.avatar || "😊", lookActual, 96, u.fotoPerfil)}
        </div>
        <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:15px;color:#fff">${esc(u.nombre || "Jugador")}</div>
        <div>${tituloHtml}</div>
        ${_previewOverride ? `<span style="font-size:11px;color:#38bdf8">👁️ Modo prueba activo</span>` : ""}
      </div>
      <div class="plato-controls-box">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
          <div>
            <div style="font-family:'Orbitron',sans-serif;font-size:14px;font-weight:800;color:#fff">Personalizá tu Avatar sobre tu Foto o Emoji</div>
            <div style="font-size:13px;color:var(--color-muted)">Los accesorios se ven en el header, ranking, salas de chat y dentro de los 45 juegos.</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="av-btn-glow secondary" style="padding:8px 12px;font-size:11px" onclick="probarLookAleatorio()">🎲 Probar Look Azar</button>
            <button class="av-btn-glow bonus" style="padding:8px 12px;font-size:11px" onclick="resetearAccesorios()">🧹 Quitar Todo</button>
          </div>
        </div>
        <div class="plato-sliders">
          <label class="plato-slider-row">
            <span>↕ Altura sobre tu foto (${lookActual.offsetY || 0}px)</span>
            <input type="range" min="-20" max="20" value="${lookActual.offsetY || 0}" onchange="ajustarCalibracion('offsetY', this.value)">
          </label>
          <label class="plato-slider-row">
            <span>🔍 Tamaño de accesorios (${lookActual.scale || 100}%)</span>
            <input type="range" min="75" max="135" value="${lookActual.scale || 100}" onchange="ajustarCalibracion('scale', this.value)">
          </label>
        </div>
        <div>
          <div style="font-size:11px;color:var(--color-muted);margin-bottom:4px;font-weight:700">VISTA PREVIA DE TU BURBUJA DE CHAT:</div>
          <div class="plato-chat-preview" style="${bubbleCss}">¡Sale ese Impostor o 8 Ball Pool en AltoVicio! 🚀</div>
        </div>
      </div>
    </div>
    <div class="plato-cat-tabs">${tabsHtml}</div>
    ${seccionesHtml}
  `;
}

function cambiarCatTienda(catKey) {
  _catTiendaActiva = catKey;
  renderizarTienda();
}

function probarEnEstudio(catKey, itemId) {
  _previewOverride = { ...(_previewOverride || {}), [catKey]: itemId };
  if (typeof UISfx !== "undefined") UISfx.equip();
  renderizarTienda();
}

function probarLookAleatorio() {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)].id;
  _previewOverride = {
    sombrero: pick(window.ACCESORIOS.sombreros),
    lentes:   pick(window.ACCESORIOS.lentes),
    bigote:   pick(window.ACCESORIOS.bigotes),
    marco:    pick(window.ACCESORIOS.marcos),
    efecto:   pick(window.ACCESORIOS.efectos),
    mascota:  pick(window.ACCESORIOS.mascotas),
    titulo:   pick(window.ACCESORIOS.titulos),
    burbuja:  pick(window.ACCESORIOS.burbujas)
  };
  if (typeof UISfx !== "undefined") UISfx.equip();
  renderizarTienda();
}

async function resetearAccesorios() {
  _previewOverride = null;
  await Storage.actualizarUsuario(u => {
    u.accesorios = { ...window.ACCESORIOS_DEFAULT };
  });
  await Storage.publicarPerfil();
  await actualizarPerfil();
  await renderizarTienda();
  mostrarToast("Accesorios restaurados", "🧹");
}

async function ajustarCalibracion(campo, valor) {
  const num = Number(valor) || 0;
  _previewOverride = null;
  await Storage.actualizarUsuario(u => {
    u.accesorios = { ...window.ACCESORIOS_DEFAULT, ...(u.accesorios || {}), [campo]: num };
  });
  await Storage.publicarPerfil();
  await actualizarPerfil();
  await renderizarTienda();
}

function buscarAccesorio(id) {
  for (const lista of Object.values(window.ACCESORIOS)) {
    const it = lista.find(a => a.id === id);
    if (it) return it;
  }
  return null;
}

async function comprarAccesorio(id, catKey) {
  const item = buscarAccesorio(id);
  if (!item || !window.ACCESORIOS_DEFAULT.hasOwnProperty(catKey)) {
    mostrarToast("Accesorio inválido", "❌");
    return;
  }
  let error = null;
  try {
    await Storage.actualizarUsuario(u => {
      u.accesorios_comprados = u.accesorios_comprados || [];
      if (u.accesorios_comprados.includes(id)) { error = "Ya lo tenés en tu colección"; return; }
      if ((u.nivel || 1) < item.reqNivel) { error = `Requiere nivel ${item.reqNivel}`; return; }
      if ((u.monedas || 0) < item.precio) { error = "No tenés suficientes VicioCoins"; return; }
      u.monedas -= item.precio;
      u.accesorios_comprados.push(id);
      u.accesorios = { ...window.ACCESORIOS_DEFAULT, ...(u.accesorios || {}), [catKey]: id };
    });
  } catch (e) { error = "No se pudo completar la compra"; console.error(e); }
  if (error) { mostrarToast(error, "❌"); return; }
  _previewOverride = null;
  await Storage.publicarPerfil();
  if (typeof UISfx !== "undefined") UISfx.coin();
  await actualizarPerfil();
  await renderizarTienda();
  mostrarToast(`¡Compraste y equipaste ${item.nombre}!`, "🎉");
}

async function equiparAccesorio(catKey, id) {
  const item = buscarAccesorio(id);
  if (!item || !window.ACCESORIOS_DEFAULT.hasOwnProperty(catKey)) return;
  let error = null;
  try {
    await Storage.actualizarUsuario(u => {
      const poseido = item.precio === 0 || (u.accesorios_comprados || []).includes(id);
      if (!poseido) { error = "Todavía no lo compraste"; return; }
      u.accesorios = { ...window.ACCESORIOS_DEFAULT, ...(u.accesorios || {}), [catKey]: id };
    });
  } catch (e) { error = "No se pudo equipar"; console.error(e); }
  if (error) { mostrarToast(error, "❌"); return; }
  _previewOverride = null;
  await Storage.publicarPerfil();
  if (typeof UISfx !== "undefined") UISfx.equip();
  await actualizarPerfil();
  await renderizarTienda();
  mostrarToast(`${item.nombre} equipado`, "✅");
}
"""
    main_js = re.sub(
        r'// ── TIENDA DE AVATARES.*?async function equiparAvatar\(emoji\)\s*\{[^\}]+\}',
        plato_shop_functions.strip(),
        main_js,
        flags=re.DOTALL
    )
    escribir("js/main.js", main_js)

# -------------------------------------------------------------------------
# 4. INTEGRAR AVATAR PLATO Y BURBUJAS EN JUEGO.HTML Y EN LOS 45 JUEGOS
# -------------------------------------------------------------------------
juego_html = leer("pages/juego.html")
if juego_html:
    # Avatar del header con foto + accesorios
    juego_html = juego_html.replace(
        '$("perfil-avatar").textContent = u.avatar || "😊";',
        '$("perfil-avatar").innerHTML = window.renderAvatar ? window.renderAvatar(u.avatar || "😊", u.accesorios, 32, u.fotoPerfil) : (u.avatar || "😊");'
    )
    # Enviar fotoPerfil y accesorios al iframe del juego en bg-hello-ack
    juego_html = juego_html.replace(
        'user: { uid: logueado ? u.uid : null, nombre: u.nombre || "Jugador", avatar: u.avatar || "😊", nivel: u.nivel || 1 },',
        'user: { uid: logueado ? u.uid : null, nombre: u.nombre || "Jugador", avatar: u.avatar || "😊", nivel: u.nivel || 1, fotoPerfil: u.fotoPerfil || "", accesorios: u.accesorios || {}, avatarHtml: window.renderAvatar ? window.renderAvatar(u.avatar || "😊", u.accesorios, 30, u.fotoPerfil) : "" },'
    )
    # Aplicar burbuja de chat comprada en el chat rápido de juego.html
    juego_html = juego_html.replace(
        '`<div class="qc-msg ${m.from === Social.uid ? "mio" : ""}">${esc(m.texto)}</div>`',
        '`<div class="qc-msg ${m.from === Social.uid ? "mio" : ""}" style="${m.from === Social.uid && window.getChatBubbleCSS ? window.getChatBubbleCSS((window._miUsuarioCache||{}).accesorios) : ""}">${esc(m.texto)}</div>`'
    )
    juego_html = juego_html.replace(
        'const u = await Storage.getUsuario();',
        'const u = await Storage.getUsuario(); window._miUsuarioCache = u;'
    )
    escribir("pages/juego.html", juego_html)

# Mostrar el avatar equipado (con foto y sombrero) dentro de la barra de los 45 minijuegos (bg-kit.js)
bg_kit_js = leer("pages/games/kit/bg-kit.js")
if bg_kit_js and "bg-player-plato" not in bg_kit_js:
    badge_hook = """      BG.portal.user = d.user || null;
      if (d.user && d.user.avatarHtml) {
        let pBadge = document.getElementById('bg-player-plato');
        const btns = document.getElementById('bg-btns');
        if (!pBadge && btns) {
          pBadge = U.el('div', { id: 'bg-player-plato', style: 'display:flex;align-items:center;gap:6px;padding:2px 8px;border-radius:99px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);font-size:12px;font-weight:700' });
          btns.parentNode.insertBefore(pBadge, btns);
        }
        if (pBadge) pBadge.innerHTML = d.user.avatarHtml + `<span style="max-width:85px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${U.esc(d.user.nombre || '')}</span>`;
      }"""
    bg_kit_js = bg_kit_js.replace("      BG.portal.user = d.user || null;", badge_hook)
    escribir("pages/games/kit/bg-kit.js", bg_kit_js)

# -------------------------------------------------------------------------
# 5. INTEGRAR AVATAR PLATO Y BURBUJAS EN SOCIAL.HTML
# -------------------------------------------------------------------------
social_html = leer("pages/social.html")
if social_html:
    social_html = social_html.replace(
        "document.getElementById('mi-avatar').textContent = userData.avatar || '😊';",
        "document.getElementById('mi-avatar').innerHTML = window.renderAvatar ? window.renderAvatar(userData.avatar || '😊', userData.accesorios, 62, userData.fotoPerfil) : (userData.avatar || '😊');"
    )
    social_html = social_html.replace(
        "`<div class=\"msg ${isMine?'mine':'theirs'}\">`",
        "`<div class=\"msg ${isMine?'mine':'theirs'}\" style=\"${isMine && window.getChatBubbleCSS && _userData ? window.getChatBubbleCSS(_userData.accesorios) : ''}\">`"
    )
    escribir("pages/social.html", social_html)

print("\n🚀 ¡ACTUALIZACIÓN PLATO V9 APLICADA CON ÉXITO!")