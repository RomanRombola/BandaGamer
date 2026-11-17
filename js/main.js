// main.js — AltoVicio V9 (Limpio y completo)
// Maneja autenticación, perfil en Firestore, ranking global, logros y tienda estilo Plato.

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function urlFotoSegura(u) {
  if (typeof u !== "string") return "";
  if (!/^(data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+\/=]+|https:\/\/[^\s"'<>]+)$/.test(u)) return "";
  return u;
}
window.urlFotoSeguraGlobal = urlFotoSegura;

const NOMBRES_NIVEL = [
  "", "Novato", "Jugador", "Veterano", "Experto", "Élite",
  "Leyenda", "Maestro", "Campeón", "Gran Maestro", "Supremo"
];

const LOGROS = [
  { id: "primer_juego",    icon: "🎮", nombre: "Primera Partida",  desc: "Jugaste tu primer juego",       condicion: u => u.juegos_jugados >= 1 },
  { id: "cinco_juegos",    icon: "🕹️", nombre: "En Calentamiento", desc: "Jugaste 5 partidas",            condicion: u => u.juegos_jugados >= 5 },
  { id: "veinte_juegos",   icon: "👾", nombre: "Gamer Dedicado",   desc: "Jugaste 20 partidas",           condicion: u => u.juegos_jugados >= 20 },
  { id: "nivel_3",         icon: "⭐", nombre: "Veterano",         desc: "Llegaste al nivel 3",           condicion: u => u.nivel >= 3 },
  { id: "nivel_5",         icon: "🔥", nombre: "Élite",            desc: "Llegaste al nivel 5",           condicion: u => u.nivel >= 5 },
  { id: "nivel_10",        icon: "💎", nombre: "Supremo",          desc: "Alcanzaste el nivel máximo",    condicion: u => u.nivel >= 10 },
  { id: "mil_xp",          icon: "✨", nombre: "Mil Puntos",       desc: "Acumulaste 1000 XP",            condicion: u => u.xp >= 1000 },
  { id: "cinco_mil_xp",    icon: "⚡", nombre: "Power Gamer",      desc: "Acumulaste 5000 XP",            condicion: u => u.xp >= 5000 },
  { id: "cien_monedas",    icon: "🪙", nombre: "Ahorrista",        desc: "Tenés 100 VicioCoins",          condicion: u => u.monedas >= 100 },
  { id: "primer_favorito", icon: "❤️", nombre: "Me Gusta",         desc: "Marcaste tu primer favorito",   condicion: u => (u.favoritos || []).length >= 1 },
  { id: "cinco_favoritos", icon: "💝", nombre: "Coleccionista",    desc: "Tenés 5 juegos favoritos",      condicion: u => (u.favoritos || []).length >= 5 },
  { id: "hora_jugada",     icon: "⏰", nombre: "Una Hora",         desc: "Jugaste 1 hora en total",       condicion: u => u.tiempo_jugado_total >= 3600 },
  { id: "diez_horas",      icon: "🏆", nombre: "Sin Vida Social",  desc: "Jugaste 10 horas en total",     condicion: u => u.tiempo_jugado_total >= 36000 }
];

const ACCESORIOS_DEFAULT = {
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
window.ACCESORIOS_DEFAULT = ACCESORIOS_DEFAULT;

const ACCESORIOS = {
  sombreros: [
    { id: "s_none",       emoji: "",     nombre: "Sin sombrero",    precio: 0,    reqNivel: 1, rareza: "comun" },
    { id: "s_gorra",      emoji: "🧢",   nombre: "Gorra Street",    precio: 40,   reqNivel: 1, rareza: "comun" },
    { id: "s_auris",      emoji: "🎧",   nombre: "Auris Streamer",  precio: 90,   reqNivel: 1, rareza: "raro" },
    { id: "s_cowboy",     emoji: "🤠",   nombre: "Vaquero Picante", precio: 120,  reqNivel: 2, rareza: "raro" },
    { id: "s_chef",       emoji: "👨‍🍳",  nombre: "Master Chef",     precio: 150,  reqNivel: 2, rareza: "raro" },
    { id: "s_casco",      emoji: "⛑️",   nombre: "Casco Rescate",   precio: 160,  reqNivel: 3, rareza: "raro" },
    { id: "s_bruja",      emoji: "🎩",   nombre: "Galera VIP",      precio: 220,  reqNivel: 3, rareza: "epico" },
    { id: "s_angel",      emoji: "😇",   nombre: "Santo Inocente",  precio: 260,  reqNivel: 4, rareza: "epico" },
    { id: "s_diablo",     emoji: "😈",   nombre: "Diablito",        precio: 280,  reqNivel: 4, rareza: "epico" },
    { id: "s_santa",      emoji: "🎅",   nombre: "Papá Noel",       precio: 250,  reqNivel: 4, rareza: "epico" },
    { id: "s_corona",     emoji: "👑",   nombre: "Corona del Rey",  precio: 400,  reqNivel: 5, rareza: "legendario" },
    { id: "s_vikingo",    emoji: "🪖",   nombre: "Casco Táctico",   precio: 420,  reqNivel: 6, rareza: "epico" },
    { id: "s_mago",       emoji: "🧙‍♂️",  nombre: "Hechicero",       precio: 500,  reqNivel: 7, rareza: "legendario" },
    { id: "s_astronauta", emoji: "👨‍🚀",  nombre: "Cosmonauta",      precio: 650,  reqNivel: 8, rareza: "legendario" },
    { id: "s_alien_hat",  emoji: "🛸",   nombre: "Abducción OVNI",  precio: 850,  reqNivel: 9, rareza: "mitico" },
    { id: "s_supremo",    emoji: "🏆",   nombre: "Copa del Mundo",  precio: 1000, reqNivel: 10, rareza: "mitico" }
  ],
  lentes: [
    { id: "l_none",  emoji: "",   nombre: "Sin lentes",     precio: 0,   reqNivel: 1, rareza: "comun" },
    { id: "l_cool",  emoji: "🕶️", nombre: "Deal With It",   precio: 60,  reqNivel: 1, rareza: "comun" },
    { id: "l_nerd",  emoji: "👓", nombre: "Intelectual",    precio: 90,  reqNivel: 1, rareza: "comun" },
    { id: "l_monoc", emoji: "🧐", nombre: "Fino Señores",   precio: 150, reqNivel: 2, rareza: "raro" },
    { id: "l_fuego", emoji: "🥸", nombre: "Incógnito",      precio: 160, reqNivel: 3, rareza: "raro" },
    { id: "l_star",  emoji: "🤩", nombre: "Ojos Estrella",  precio: 220, reqNivel: 4, rareza: "epico" },
    { id: "l_heart", emoji: "😍", nombre: "Enamorado",      precio: 240, reqNivel: 4, rareza: "epico" },
    { id: "l_vr",    emoji: "🥽", nombre: "Visor Meta VR",  precio: 350, reqNivel: 5, rareza: "epico" },
    { id: "l_fire",  emoji: "🔥", nombre: "Mirada Ígnea",   precio: 480, reqNivel: 6, rareza: "legendario" },
    { id: "l_cyber", emoji: "⚡", nombre: "Láser Voltaico", precio: 650, reqNivel: 8, rareza: "mitico" }
  ],
  bigotes: [
    { id: "b_none",   emoji: "",    nombre: "Sin accesorio",   precio: 0,   reqNivel: 1, rareza: "comun" },
    { id: "b_mate",   emoji: "🧉",  nombre: "Mate Amargo",     precio: 80,  reqNivel: 1, rareza: "raro" },
    { id: "b_fino",   emoji: "🥸",  nombre: "Mostacho",        precio: 60,  reqNivel: 1, rareza: "comun" },
    { id: "b_pizza",  emoji: "🍕",  nombre: "Porción Muzza",   precio: 120, reqNivel: 2, rareza: "raro" },
    { id: "b_largo",  emoji: "🧔",  nombre: "Barba Leñador",   precio: 140, reqNivel: 2, rareza: "raro" },
    { id: "b_rosa",   emoji: "🌹",  nombre: "Galán Seductor",  precio: 180, reqNivel: 3, rareza: "epico" },
    { id: "b_pirata", emoji: "🏴‍☠️", nombre: "Parche Pirata",   precio: 220, reqNivel: 4, rareza: "epico" },
    { id: "b_ninja",  emoji: "🥷",  nombre: "Máscara Shinobi", precio: 320, reqNivel: 5, rareza: "epico" },
    { id: "b_fuego",  emoji: "🌶️",  nombre: "Picante",         precio: 380, reqNivel: 6, rareza: "legendario" },
    { id: "b_king",   emoji: "💎",  nombre: "Grillz Diamante", precio: 550, reqNivel: 7, rareza: "mitico" }
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
    { id: "m_aurora",  css: "background:conic-gradient(#00ffcc,#00aaff,#a855f7,#ff00aa,#00ffcc);padding:3px;box-shadow:0 0 26px rgba(168,85,247,0.85);", nombre: "Galaxia Mítica", precio: 800, reqNivel: 8, rareza: "mitico", spin: true },
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
    { id: "pet_none",  emoji: "",   nombre: "Sin mascota",    precio: 0,   reqNivel: 1, rareza: "comun" },
    { id: "pet_capi",  emoji: "🦫", nombre: "Capibara Chill", precio: 150, reqNivel: 1, rareza: "raro" },
    { id: "pet_cat",   emoji: "🐱", nombre: "Michi Vicioso",  precio: 180, reqNivel: 2, rareza: "raro" },
    { id: "pet_dog",   emoji: "🐶", nombre: "Doge Guardián",  precio: 180, reqNivel: 2, rareza: "raro" },
    { id: "pet_duck",  emoji: "🦆", nombre: "Patito Táctico", precio: 260, reqNivel: 3, rareza: "epico" },
    { id: "pet_ghost", emoji: "👻", nombre: "Gasparín",       precio: 320, reqNivel: 4, rareza: "epico" },
    { id: "pet_alien", emoji: "👾", nombre: "Invasor 8-Bit",  precio: 450, reqNivel: 5, rareza: "legendario" },
    { id: "pet_drag",  emoji: "🐉", nombre: "Shenlong Mini",  precio: 700, reqNivel: 7, rareza: "mitico" }
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
    { id: "chat_default", nombre: "Clásica",        precio: 0,   reqNivel: 1, rareza: "comun",      css: "background:rgba(255,102,0,0.2);border:1px solid rgba(255,102,0,0.35);color:#fff;" },
    { id: "chat_cyber",   nombre: "Cyberpunk Neón", precio: 120, reqNivel: 1, rareza: "raro",       css: "background:linear-gradient(135deg,rgba(0,170,255,0.28),rgba(168,85,247,0.28));border:1px solid #00e5ff;color:#e0faff;box-shadow:0 0 12px rgba(0,229,255,0.25);" },
    { id: "chat_toxic",   nombre: "Ácido Verde",    precio: 180, reqNivel: 2, rareza: "raro",       css: "background:rgba(57,255,20,0.16);border:1px solid #39ff14;color:#d8ffd0;box-shadow:0 0 10px rgba(57,255,20,0.2);" },
    { id: "chat_fire",    nombre: "Fuego Infernal", precio: 280, reqNivel: 4, rareza: "epico",      css: "background:linear-gradient(135deg,rgba(255,0,60,0.3),rgba(255,120,0,0.3));border:1px solid #ff4500;color:#fff2e6;box-shadow:0 0 14px rgba(255,69,0,0.3);" },
    { id: "chat_gold",    nombre: "VIP Oro Real",   precio: 450, reqNivel: 6, rareza: "legendario", css: "background:linear-gradient(135deg,rgba(255,215,0,0.28),rgba(180,100,0,0.35));border:1px solid #ffd700;color:#fffbe0;box-shadow:0 0 16px rgba(255,215,0,0.35);font-weight:700;" }
  ],
  emojis: [
    { id: "e_smile",     emoji: "😊", nombre: "Sonrisa",   precio: 0,    reqNivel: 1, rareza: "comun" },
    { id: "e_cool",      emoji: "😎", nombre: "Fachero",   precio: 50,   reqNivel: 1, rareza: "comun" },
    { id: "e_clown",     emoji: "🤡", nombre: "Payaso",    precio: 80,   reqNivel: 1, rareza: "raro" },
    { id: "e_fire",      emoji: "🔥", nombre: "Fuego",     precio: 100,  reqNivel: 2, rareza: "raro" },
    { id: "e_Ghostface", emoji: "😱", nombre: "Scream",    precio: 150,  reqNivel: 2, rareza: "raro" },
    { id: "e_skull",     emoji: "💀", nombre: "Calavera",  precio: 220,  reqNivel: 3, rareza: "epico" },
    { id: "e_alien",     emoji: "👽", nombre: "Visitante", precio: 280,  reqNivel: 4, rareza: "epico" },
    { id: "e_robot",     emoji: "🤖", nombre: "Mecha",     precio: 340,  reqNivel: 5, rareza: "epico" },
    { id: "e_ninja",     emoji: "🥷", nombre: "Sombra",    precio: 420,  reqNivel: 6, rareza: "legendario" },
    { id: "e_dragon",    emoji: "🐲", nombre: "Dragón",    precio: 550,  reqNivel: 7, rareza: "legendario" },
    { id: "e_diamond",   emoji: "💎", nombre: "Diamante",  precio: 750,  reqNivel: 8, rareza: "mitico" },
    { id: "e_supreme",   emoji: "🌌", nombre: "Cósmico",   precio: 1000, reqNivel: 10, rareza: "mitico" }
  ]
};
window.ACCESORIOS = ACCESORIOS;

function renderAvatar(base, accesorios = {}, size = 44, fotoUrl = "") {
  if (base && typeof base === "object") {
    const uObj = base;
    accesorios = uObj.accesorios || {};
    fotoUrl = uObj.fotoPerfil || "";
    base = uObj.avatar || "😊";
  }
  const acc = { ...ACCESORIOS_DEFAULT, ...(accesorios || {}) };
  const foto = urlFotoSegura(fotoUrl);
  const emojiBase = ACCESORIOS.emojis.find(a => a.id === acc.emoji)?.emoji || base || "😊";
  const sombrero  = ACCESORIOS.sombreros.find(a => a.id === acc.sombrero)?.emoji || "";
  const lentes    = ACCESORIOS.lentes.find(a => a.id === acc.lentes)?.emoji || "";
  const bigote    = ACCESORIOS.bigotes.find(a => a.id === acc.bigote)?.emoji || "";
  const marcoAcc  = ACCESORIOS.marcos.find(a => a.id === acc.marco);
  const efectoAcc = ACCESORIOS.efectos.find(a => a.id === acc.efecto);
  const mascota   = ACCESORIOS.mascotas.find(a => a.id === acc.mascota)?.emoji || "";

  const offY = Math.max(-25, Math.min(25, Number(acc.offsetY) || 0)) * (size / 80);
  const sc   = Math.max(0.7, Math.min(1.4, (Number(acc.scale) || 100) / 100));

  const auraStyle  = efectoAcc?.css || "";
  const marcoStyle = marcoAcc?.css || "border:1.5px solid rgba(255,255,255,0.16);";
  const innerContent = foto
    ? `<img src="${foto}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block">`
    : `<span style="font-size:${Math.round(size * 0.64)}px;line-height:1;display:flex;align-items:center;justify-content:center;width:100%;height:100%">${emojiBase}</span>`;

  return `<div class="av-plato-wrap" style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;flex-shrink:0;vertical-align:middle;overflow:visible !important;">
    ${auraStyle ? `<div class="av-aura-layer" style="position:absolute;inset:-4px;border-radius:50%;pointer-events:none;${auraStyle}"></div>` : ""}
    <div class="av-frame-ring" style="position:relative;width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#161628;${marcoStyle}">
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
}
window.renderAvatar = renderAvatar;

function renderTituloBadge(accesorios = {}) {
  const id = accesorios?.titulo || "t_none";
  const t = ACCESORIOS.titulos.find(x => x.id === id);
  if (!t || !t.texto) return "";
  return `<span class="av-titulo-pill" style="display:inline-block;font-family:'Orbitron',sans-serif;font-size:9px;font-weight:800;padding:2px 8px;border-radius:99px;background:rgba(0,0,0,0.45);border:1px solid ${t.color};color:${t.color};letter-spacing:0.6px;box-shadow:0 0 8px ${t.color}33;vertical-align:middle">${t.texto}</span>`;
}
window.renderTituloBadge = renderTituloBadge;

function getChatBubbleCSS(accesorios = {}) {
  const id = accesorios?.burbuja || "chat_default";
  const b = ACCESORIOS.burbujas.find(x => x.id === id) || ACCESORIOS.burbujas[0];
  return b.css;
}
window.getChatBubbleCSS = getChatBubbleCSS;

let categoriaActiva = "todos";
let terminoBusqueda = "";

// ── AUTENTICACIÓN ─────────────────────────────────────────────────────────
async function loginConGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await Storage.auth.signInWithPopup(provider);
  } catch (e) {
    if (e.code !== "auth/popup-closed-by-user") {
      mostrarToast("Error al iniciar sesión", "❌");
      console.error("[Auth]", e);
    }
  }
}

function loginComoInvitado() {
  const input = document.getElementById("guest-name-input");
  const nombre = input ? input.value.trim().slice(0, 20) : "";
  if (!nombre || nombre.length < 2) {
    mostrarToast("Ingresá un nombre (mínimo 2 caracteres)", "⚠️");
    if (input) input.focus();
    return;
  }
  const u = { ...Storage.USUARIO_DEFAULT, nombre, uid: "", esInvitado: true };
  localStorage.setItem("bandagamer_usuario_v2", JSON.stringify(u));
  ocultarPantallaLogin();
  iniciarInterfaz(u);
  verificarLogros();
  mostrarToast(`¡Bienvenido a AltoVicio, ${nombre}!`, "👤");
}

async function cerrarSesion() {
  const user = Storage.auth.currentUser;
  try { if (typeof Social !== "undefined") Social.goOffline(); } catch (e) {}
  if (user) {
    await Storage.auth.signOut();
  } else {
    localStorage.removeItem("bandagamer_usuario_v2");
    localStorage.removeItem("bandagamer_visitas_v2");
  }
  mostrarToast("Sesión cerrada", "👋");
  setTimeout(() => location.reload(), 800);
}

// ── INICIO ────────────────────────────────────────────────────────────────
async function iniciarApp() {
  Storage.auth.onAuthStateChanged(async (user) => {
    if (user) {
      await Storage.migrarLocalAFirestore();
      const usuario = await Storage.getUsuario();
      Storage.publicarPerfil();
      ocultarPantallaLogin();
      iniciarInterfaz(usuario);
      verificarLogros();
    } else {
      const raw = localStorage.getItem("bandagamer_usuario_v2");
      if (raw) {
        try {
          const u = JSON.parse(raw);
          if (u && u.nombre && u.nombre.length >= 2) {
            ocultarPantallaLogin();
            iniciarInterfaz(u);
            verificarLogros();
            return;
          }
        } catch (e) {}
      }
      mostrarPantallaLogin();
    }
  });
}

function iniciarInterfaz(usuario) {
  configurarFavoritosDelegado();
  actualizarPerfil();
  renderizarHeroYMisiones();
  renderizarGrid(juegos);
  renderizarDestacados();
  renderizarSidebar();
  renderizarRecientes();
  renderizarMasJugados();
  configurarBuscador();
  configurarFiltrosCategorias();
  configurarNavMenu();
  mostrarSeccion("inicio");
}

async function renderizarDestacados() {
  const contenedor = document.getElementById("destacados-grid");
  if (!contenedor) return;
  const destacados = juegos.filter(j => j.tipo === "local").slice(0, 6);
  contenedor.innerHTML = await crearCardsHTML(destacados);
}

function mostrarPantallaLogin() {
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("app-body-wrap").style.display = "none";
  document.querySelector("header").style.display = "none";
}

function ocultarPantallaLogin() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("app-body-wrap").style.display = "block";
  document.querySelector("header").style.display = "flex";
}

// ── PERFIL EN HEADER ──────────────────────────────────────────────────────
async function actualizarPerfil() {
  const u = await Storage.getUsuario();
  if (typeof Social !== "undefined" && u.uid) {
    Social.initPresence(u.uid, u.nombre);
    iniciarNotificacionesSociales(u.uid);
  }
  const maxNivel = (u.nivel || 1) >= 10;
  const xpAct = maxNivel ? 1000 : (u.xp || 0) % 1000;
  const pct   = (xpAct / 1000) * 100;
  const el    = (id) => document.getElementById(id);

  if (el("perfil-nombre"))      el("perfil-nombre").textContent      = u.nombre || "—";
  if (el("perfil-nivel"))       el("perfil-nivel").textContent       = `Nv.${u.nivel}`;
  if (el("perfil-monedas"))     el("perfil-monedas").textContent     = (u.monedas || 0).toLocaleString();
  if (el("perfil-avatar"))      el("perfil-avatar").innerHTML        = renderAvatar(u.avatar || "😊", u.accesorios, 34, u.fotoPerfil);
  if (el("xp-bar-fill"))        el("xp-bar-fill").style.width        = pct + "%";
  if (el("xp-texto"))           el("xp-texto").textContent           = maxNivel ? "NIVEL MÁXIMO" : `${xpAct}/1000 XP`;
  if (el("perfil-nivel-texto")) el("perfil-nivel-texto").textContent = NOMBRES_NIVEL[u.nivel] || "";
}

function iniciarNotificacionesSociales(uid) {
  if (typeof Notifs !== "undefined" && Storage.auth.currentUser) Notifs.iniciar(uid);
}
function showSocialToast(text, gotoUrl) {
  if (typeof Notifs !== "undefined") Notifs.toast(text, gotoUrl);
}

// ── GRID DE JUEGOS ────────────────────────────────────────────────────────
async function renderizarGrid(lista) {
  const grid = document.getElementById("games-grid");
  if (!grid) return;
  if (!lista.length) {
    grid.innerHTML = `<div class="sin-resultados"><span class="sin-icon">🔍</span><p>No encontramos juegos para "<strong>${esc(terminoBusqueda)}</strong>". Probá con otra palabra.</p></div>`;
    return;
  }
  grid.innerHTML = await crearCardsHTML(lista);
}

async function crearCardsHTML(lista) {
  const [u, visitas] = await Promise.all([Storage.getUsuario(), Storage.getVisitas()]);
  const favs = new Set(u.favoritos || []);
  return lista.map((j, i) => crearCardHTML(j, i, favs.has(j.id), visitas[j.id] || 0)).join("");
}

function crearCardHTML(juego, indice, esFav, visitas) {
  const tieneThumb = juego.thumbnail && juego.thumbnail.length > 0;
  const badgeTipo  = { iframe: "", local: '<span class="badge badge-local">LOCAL</span>', emulador: '<span class="badge badge-emulador">RETRO</span>' }[juego.tipo] || "";
  const tienePreview = juego.tipo === "local" && juego.embed_url;
  const tieneVideo = juego.preview_video;
  const nombre = esc(juego.nombre);
  const sep = juego.embed_url && juego.embed_url.includes("?") ? "&" : "?";

  return `
    <a class="game-card" href="pages/juego.html?id=${esc(juego.id)}"
       style="animation-delay:${indice * 0.04}s"
       ${tieneVideo ? `data-preview-video="${esc(juego.preview_video)}"` : (tienePreview ? `data-preview="pages/${esc(juego.embed_url)}${sep}preview=1"` : "")}
       onmouseenter="iniciarPreview(this)"
       onmouseleave="detenerPreview(this)">
      <div class="card-thumb">
        <div class="card-thumb-static">
          ${tieneThumb ? `<img src="${esc(juego.thumbnail)}" alt="${nombre}" loading="lazy" onerror="this.style.display='none';this.parentNode.querySelector('.thumb-fallback').style.display='flex'">` : ""}
          <div class="thumb-fallback" style="display:${tieneThumb ? 'none' : 'flex'}">
            <span class="thumb-fallback-icon">🎮</span>
            <span class="thumb-fallback-nombre">${nombre}</span>
          </div>
        </div>
        <div class="card-preview-wrap" style="display:none">
          <div class="card-preview-label">🎬 GAMEPLAY</div>
        </div>
        <button class="btn-favorito ${esFav ? 'activo' : ''}" data-id="${esc(juego.id)}"
                title="${esFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">${esFav ? '♥' : '♡'}</button>
        ${badgeTipo}
      </div>
      <div class="card-info">
        <span class="card-nombre">${nombre}</span>
        <div class="card-meta">
          <span class="card-categoria">${esc(juego.categoria)}</span>
          ${visitas > 0 ? `<span class="card-visitas">▶ ${visitas}</span>` : ""}
        </div>
      </div>
    </a>`;
}

let _favDelegadoListo = false;
function configurarFavoritosDelegado() {
  if (_favDelegadoListo) return;
  _favDelegadoListo = true;
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest && e.target.closest(".btn-favorito");
    if (!btn || !btn.dataset.id) return;
    e.preventDefault(); e.stopPropagation();
    if (btn.dataset.busy) return;
    btn.dataset.busy = "1";
    try {
      const ahora = await Storage.toggleFavorito(btn.dataset.id);
      document.querySelectorAll(`.btn-favorito[data-id="${btn.dataset.id}"]`).forEach(b => {
        b.classList.toggle("activo", ahora);
        b.textContent = ahora ? "♥" : "♡";
        b.title = ahora ? "Quitar de favoritos" : "Agregar a favoritos";
      });
      if (!ahora) {
        const cont = btn.closest("#favoritos-grid");
        if (cont) {
          const card = btn.closest(".game-card");
          if (card) card.remove();
          if (!cont.children.length) renderizarFavoritos();
        }
      }
      renderizarHeroYMisiones();
      verificarLogros();
    } catch (err) {
      console.warn("[Favoritos]", err);
      mostrarToast("No se pudo guardar el favorito", "❌");
    } finally {
      delete btn.dataset.busy;
    }
  }, true);
}

// ── PREVIEW AL HOVER ──────────────────────────────────────────────────────
function iniciarPreview(card) {
  const videoUrl = card.dataset.previewVideo;
  const iframeUrl = card.dataset.preview;
  if (!videoUrl && !iframeUrl) return;

  clearTimeout(card._previewTimer);
  clearTimeout(card._hideTimer);
  card._previewTimer = setTimeout(() => {
    const wrap = card.querySelector(".card-preview-wrap");
    const staticDiv = card.querySelector(".card-thumb-static");
    if (!wrap || !staticDiv) return;

    if (videoUrl) {
      if (!wrap.querySelector("video")) {
        const vid = document.createElement("video");
        vid.src = videoUrl;
        vid.autoplay = true;
        vid.loop = true;
        vid.muted = true;
        vid.playsInline = true;
        vid.style.cssText = "width:100%;height:100%;object-fit:cover;pointer-events:none;";
        vid.onerror = () => {
          wrap.style.display = "none";
          staticDiv.style.opacity = "1";
        };
        wrap.insertBefore(vid, wrap.firstChild);
      } else {
        const vid = wrap.querySelector("video");
        vid.currentTime = 0;
        vid.play().catch(() => {});
      }
    } else {
      if (!wrap.querySelector("iframe")) {
        const iframe = document.createElement("iframe");
        iframe.src = iframeUrl;
        iframe.style.cssText = "width:100%;height:100%;border:none;pointer-events:none;";
        iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
        iframe.setAttribute("loading", "lazy");
        wrap.insertBefore(iframe, wrap.firstChild);
      }
    }

    staticDiv.style.opacity = "0";
    staticDiv.style.transition = "opacity .25s ease";
    wrap.style.display = "block";
    wrap.style.opacity = "0";
    wrap.style.transition = "opacity .25s ease";
    requestAnimationFrame(() => { wrap.style.opacity = "1"; });
  }, 220);
}

function detenerPreview(card) {
  clearTimeout(card._previewTimer);
  const wrap = card.querySelector(".card-preview-wrap");
  const staticDiv = card.querySelector(".card-thumb-static");
  if (wrap) {
    const vid = wrap.querySelector("video");
    if (vid) vid.pause();
    wrap.style.opacity = "0";
    clearTimeout(card._hideTimer);
    card._hideTimer = setTimeout(() => {
      wrap.style.display = "none";
      const f = wrap.querySelector("iframe");
      if (f) f.remove();
    }, 250);
  }
  if (staticDiv) staticDiv.style.opacity = "1";
}

// ── FILTROS Y SIDEBAR ─────────────────────────────────────────────────────
async function filtrarPorCategoria(categoria) {
  categoriaActiva = categoria;
  terminoBusqueda = "";
  const buscador = document.getElementById("buscador");
  if (buscador) buscador.value = "";

  const lista = categoria === "todos" ? juegos : juegos.filter(j => j.categoria === categoria);
  const grid = document.getElementById("games-grid");
  if (!grid) return;
  grid.style.opacity = "0"; grid.style.transform = "translateY(8px)";
  setTimeout(async () => {
    await renderizarGrid(lista);
    grid.style.transition = "opacity 0.25s ease, transform 0.25s ease";
    grid.style.opacity = "1"; grid.style.transform = "translateY(0)";
  }, 150);

  document.querySelectorAll("[data-categoria]").forEach(btn => {
    btn.classList.toggle("activo", btn.dataset.categoria === categoria);
  });
  const titulo = document.getElementById("catalogo-titulo");
  if (titulo) titulo.textContent = categoria === "todos" ? "Todos los Juegos" : `Juegos: ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`;
}

async function filtrarPorBusqueda(termino) {
  terminoBusqueda = termino;
  await renderizarGrid(buscar(termino));
  const titulo = document.getElementById("catalogo-titulo");
  if (titulo) titulo.textContent = termino ? `Resultados: "${termino}"` : "Todos los Juegos";
}

function buscar(termino) {
  const t = termino.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!t) return juegos;
  return juegos.filter(j => {
    const nombre = j.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return nombre.includes(t) || j.categoria.includes(t) || j.tags.some(tag => tag.includes(t));
  });
}

const ETIQUETAS_CATEGORIA = {
  todos: "🕹 Todos", accion: "⚔️ Acción", puzzle: "🧩 Puzzle", arcade: "👾 Arcade",
  multijugador: "🌐 Multi", carreras: "🏎️ Carreras", estrategia: "♟️ Estrategia",
  casual: "🎲 Casual", aventura: "🗺️ Aventura", deportes: "⚽ Deportes", retro: "📺 Retro"
};

function categoriasConJuegos() {
  const usadas = new Set(juegos.map(j => j.categoria));
  return Object.keys(ETIQUETAS_CATEGORIA).filter(id => id === "todos" || usadas.has(id));
}

function renderizarSidebar() {
  const cats = categoriasConJuegos().map(id => ({ id, label: ETIQUETAS_CATEGORIA[id] }));
  const sidebar = document.getElementById("sidebar-categorias");
  if (!sidebar) return;
  sidebar.innerHTML = cats.map(c => `
    <button class="sidebar-cat ${c.id === categoriaActiva ? 'activo' : ''}" data-categoria="${c.id}">${c.label}</button>
  `).join("");
  sidebar.querySelectorAll(".sidebar-cat").forEach(btn => {
    btn.addEventListener("click", () => filtrarPorCategoria(btn.dataset.categoria));
  });
}

async function renderizarMasJugados() {
  const contenedor = document.getElementById("mas-jugados");
  if (!contenedor) return;
  const ids = await Storage.getMasJugados(5);
  if (!ids.length) {
    contenedor.innerHTML = "<p class='muted-text'>Jugá para ver aquí tus más visitados.</p>";
    return;
  }
  const lista = ids.map(id => juegos.find(j => j.id === id)).filter(Boolean);
  contenedor.innerHTML = lista.map(j => `
    <a href="pages/juego.html?id=${j.id}" class="mini-juego-link">
      <span class="mini-juego-icon">🎮</span>
      <span class="mini-juego-nombre">${j.nombre}</span>
    </a>`).join("");
}

async function renderizarRecientes() {
  const contenedor = document.getElementById("recientes-grid");
  const bloque = document.getElementById("bloque-recientes");
  if (!contenedor) return;
  const ids = await Storage.getHistorial(5);
  if (!ids.length) {
    if (bloque) bloque.style.display = "none";
    return;
  }
  if (bloque) bloque.style.display = "block";
  const lista = ids.map(id => juegos.find(j => j.id === id)).filter(Boolean);
  contenedor.innerHTML = await crearCardsHTML(lista);
}

let _buscadorListo = false;
function configurarBuscador() {
  const input = document.getElementById("buscador");
  if (!input || _buscadorListo) return;
  _buscadorListo = true;
  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => filtrarPorBusqueda(input.value.trim()), 220);
  });
}

let _navListo = false;
function configurarNavMenu() {
  if (_navListo) return;
  _navListo = true;
  document.querySelectorAll("[data-seccion]").forEach(btn => {
    btn.addEventListener("click", () => mostrarSeccion(btn.dataset.seccion));
  });
  const hamburger = document.getElementById("hamburger");
  const navMenu   = document.getElementById("nav-menu");
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("abierto");
      hamburger.firstChild.nodeValue = navMenu.classList.contains("abierto") ? "✕" : "☰";
    });
  }
}

let _filtrosListos = false;
function configurarFiltrosCategorias() {
  const strip = document.getElementById("cat-strip");
  if (!strip || _filtrosListos) return;
  _filtrosListos = true;
  const validas = new Set(categoriasConJuegos());
  strip.querySelectorAll("[data-categoria]").forEach(btn => {
    if (!validas.has(btn.dataset.categoria)) { btn.style.display = "none"; return; }
    btn.addEventListener("click", () => filtrarPorCategoria(btn.dataset.categoria));
  });
}

function mostrarSeccion(seccion) {
  document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
  const target = document.getElementById(`seccion-${seccion}`);
  if (target) target.classList.add("activa");
  document.querySelectorAll("[data-seccion]").forEach(b => {
    b.classList.toggle("activo", b.dataset.seccion === seccion);
  });
  if (seccion === "favoritos") renderizarFavoritos();
  if (seccion === "ranking")   renderizarRankingGlobal();
  if (seccion === "perfil")    renderizarPerfil();
  if (seccion === "logros")    renderizarLogros();
  if (seccion === "tienda")    renderizarTienda();
}

async function renderizarFavoritos() {
  const u = await Storage.getUsuario();
  const contenedor = document.getElementById("favoritos-grid");
  if (!contenedor) return;
  if (!(u.favoritos || []).length) {
    contenedor.innerHTML = "<p class='muted-text sin-favs'>No tenés favoritos todavía. Hacé clic en ♡ en cualquier juego.</p>";
    return;
  }
  const lista = u.favoritos.map(id => juegos.find(j => j.id === id)).filter(Boolean);
  contenedor.innerHTML = await crearCardsHTML(lista);
}

// ── RANKING GLOBAL ────────────────────────────────────────────────────────
async function renderizarRankingGlobal() {
  const contenedor = document.getElementById("ranking-lista");
  if (!contenedor) return;
  contenedor.innerHTML = `<div class="ranking-loading">Cargando ranking<span class="loading-dots"></span></div>`;

  const lista = await Storage.getRankingGlobal(50);
  const miUid = Storage.auth.currentUser?.uid;

  if (!lista.length) {
    contenedor.innerHTML = `<div class="ranking-vacio">Todavía no hay jugadores en el ranking. ¡Sé el primero!</div>`;
    return;
  }

  contenedor.innerHTML = lista.map((p, i) => {
    const medal = ["🥇", "🥈", "🥉"][i] || `${i + 1}`;
    const esSoy = p.uid === miUid;
    const nivelNombre = NOMBRES_NIVEL[p.nivel] || "";
    const avatarHtml = renderAvatar(p.avatar || "😊", p.accesorios, 40, p.fotoPerfil);
    const tituloBadge = renderTituloBadge(p.accesorios);
    return `
      <div class="ranking-fila ${esSoy ? "ranking-yo" : ""}" data-uid="${esc(p.uid)}"
           style="cursor:pointer;transition:background .15s"
           onmouseenter="this.style.background='rgba(255,102,0,0.06)'"
           onmouseleave="this.style.background=''">
        <div class="ranking-pos">${medal}</div>
        <div class="ranking-avatar" style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;overflow:visible">${avatarHtml}</div>
        <div class="ranking-info">
          <div class="ranking-nombre">${esc(p.nombre)}${esSoy ? ' <span class="ranking-tu-tag">vos</span>' : ""}</div>
          <div class="ranking-nivel-txt">${esc(nivelNombre)} ${tituloBadge}</div>
        </div>
        <div class="ranking-xp">${(p.xp || 0).toLocaleString()} XP</div>
        <div class="ranking-nivel-badge">Nv.${Number(p.nivel) || 1}</div>
      </div>`;
  }).join("");

  contenedor.querySelectorAll(".ranking-fila").forEach(fila => {
    fila.addEventListener("click", () => verPerfilUsuario(fila.dataset.uid));
  });
}

// ── VER PERFIL DE OTRO USUARIO ────────────────────────────────────────────
async function verPerfilUsuario(uid) {
  const miUid = Storage.auth.currentUser?.uid;
  if (uid === miUid) { mostrarSeccion("perfil"); return; }

  let modal = document.getElementById("modal-perfil-usuario");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-perfil-usuario";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px";
    modal.innerHTML = `<div style="background:#111120;border:1px solid rgba(255,102,0,0.3);border-radius:18px;padding:24px;max-width:340px;width:100%;position:relative;text-align:center">
      <button onclick="document.getElementById('modal-perfil-usuario').remove()" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#aaa;padding:4px 10px;border-radius:8px;cursor:pointer">✕</button>
      <div id="mpf-avatar" style="margin-bottom:12px;display:flex;justify-content:center">😊</div>
      <div id="mpf-nombre" style="font-size:20px;font-weight:700;margin-bottom:4px">Cargando...</div>
      <div id="mpf-rango" style="font-size:12px;color:#ff6600;letter-spacing:1px;margin-bottom:14px"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
        <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:10px">
          <div id="mpf-xp" style="font-size:18px;font-weight:700;color:#00aaff">0</div>
          <div style="font-size:10px;color:#666;letter-spacing:1px">XP</div>
        </div>
        <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:10px">
          <div id="mpf-nivel" style="font-size:18px;font-weight:700;color:#ff6600">1</div>
          <div style="font-size:10px;color:#666;letter-spacing:1px">NIVEL</div>
        </div>
        <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:10px">
          <div id="mpf-juegos" style="font-size:18px;font-weight:700;color:#39ff14">0</div>
          <div style="font-size:10px;color:#666;letter-spacing:1px">PARTIDAS</div>
        </div>
      </div>
      <div id="mpf-acciones" style="display:flex;gap:8px;justify-content:center"></div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
  }

  try {
    const p = await Storage.getPerfilPublico(uid);
    if (!p) { modal.querySelector("#mpf-nombre").textContent = "Usuario no encontrado"; return; }

    modal.querySelector("#mpf-avatar").innerHTML = renderAvatar(p.avatar || "😊", p.accesorios, 84, p.fotoPerfil);
    modal.querySelector("#mpf-nombre").textContent = p.nombre || "Usuario";
    modal.querySelector("#mpf-rango").innerHTML = esc(NOMBRES_NIVEL[p.nivel] || "") + " " + renderTituloBadge(p.accesorios);
    modal.querySelector("#mpf-xp").textContent = (p.xp || 0).toLocaleString();
    modal.querySelector("#mpf-nivel").textContent = p.nivel || 1;
    modal.querySelector("#mpf-juegos").textContent = p.juegos_jugados || 0;

    if (typeof Social !== "undefined" && Social.uid) {
      const estado = await Social.estadoAmistad(uid);
      const acciones = modal.querySelector("#mpf-acciones");
      acciones.innerHTML = "";
      const crearBtn = (txt, color, onClick) => {
        const b = document.createElement("button");
        b.textContent = txt;
        b.style.cssText = `background:${color[0]};border:1px solid ${color[1]};color:${color[2]};padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:700`;
        b.addEventListener("click", onClick);
        acciones.appendChild(b);
        return b;
      };
      if (estado === "friends") {
        crearBtn("💬 Chat", ["rgba(0,170,255,0.15)", "rgba(0,170,255,0.4)", "#00aaff"], () => { window.location.href = "pages/social.html"; });
      } else if (estado === "none") {
        const b = crearBtn("+ Agregar amigo", ["rgba(255,102,0,0.15)", "rgba(255,102,0,0.4)", "#ff6600"], async () => {
          b.disabled = true;
          const r = await Social.enviarSolicitud(uid);
          b.textContent = r && r.ok ? (r.aceptada ? "✅ Ahora son amigos" : "✅ Enviado") : "❌ " + ((r && r.error) || "Error");
        });
      } else if (estado === "pending_out") {
        acciones.innerHTML = `<span style="color:#666;font-size:13px">⏳ Solicitud enviada</span>`;
      } else if (estado === "pending_in") {
        const b = crearBtn("✅ Aceptar solicitud", ["rgba(57,255,20,0.12)", "rgba(57,255,20,0.4)", "#39ff14"], async () => {
          b.disabled = true;
          await Social.aceptarSolicitud(uid);
          b.textContent = "✅ Ahora son amigos";
        });
      }
    }
  } catch (e) {
    console.error("Error cargando perfil:", e);
  }
}

// ── MI PERFIL ─────────────────────────────────────────────────────────────
async function renderizarPerfil() {
  const u = await Storage.getUsuario();
  const contenedor = document.getElementById("perfil-contenido");
  if (!contenedor) return;

  const maxNivel = (u.nivel || 1) >= 10;
  const xpAct = maxNivel ? 1000 : (u.xp || 0) % 1000;
  const pct   = (xpAct / 1000) * 100;
  const tiempoH = Math.floor((u.tiempo_jugado_total || 0) / 3600);
  const tiempoM = Math.floor(((u.tiempo_jugado_total || 0) % 3600) / 60);
  const logrosCount = (u.logros || []).length;
  const esInvitado = u.esInvitado || !u.uid;

  contenedor.innerHTML = `
    <div class="perfil-card">
      <div class="perfil-avatar-grande" title="Cambiar foto" onclick="document.getElementById('foto-input').click()" style="cursor:pointer;position:relative;padding:8px">
        ${renderAvatar(u.avatar || "😊", u.accesorios, 88, u.fotoPerfil)}
        <div style="position:absolute;bottom:2px;right:2px;background:rgba(255,102,0,0.9);border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:14px;z-index:10">📷</div>
      </div>
      <input type="file" id="foto-input" accept="image/*" style="display:none" onchange="cambiarFotoPerfil(this)">
      <div class="perfil-datos">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <div class="perfil-nombre-grande" id="perfil-nombre-display">${esc(u.nombre)}</div>
          <button onclick="editarNombre()" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:var(--color-muted);font-size:10px;padding:4px 8px;border-radius:6px;cursor:pointer;font-family:'Orbitron',sans-serif;font-weight:700;letter-spacing:1px">✏️</button>
        </div>
        <div id="nombre-edit-form" style="display:none;margin-bottom:8px">
          <div style="display:flex;gap:6px">
            <input type="text" id="nombre-nuevo-input" value="${esc(u.nombre)}" maxlength="20"
              style="flex:1;background:rgba(255,255,255,0.07);border:1px solid rgba(255,102,0,0.3);color:var(--color-text);font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;padding:7px 11px;border-radius:8px;outline:none;">
            <button onclick="guardarNombre()" style="background:linear-gradient(135deg,#ff6600,#ff9500);border:none;color:#fff;font-family:'Orbitron',sans-serif;font-size:10px;font-weight:700;padding:7px 12px;border-radius:8px;cursor:pointer;letter-spacing:1px;white-space:nowrap">✓ OK</button>
          </div>
        </div>
        <div class="perfil-rango">${esc(NOMBRES_NIVEL[u.nivel] || "")} ${renderTituloBadge(u.accesorios)}</div>
        ${esInvitado ? `<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:7px 12px;font-size:12px;color:var(--color-muted);margin-top:8px">👤 Modo invitado — <button onclick="loginConGoogle()" style="background:none;border:none;color:#00aaff;cursor:pointer;font-size:12px;font-weight:700;padding:0">Conectá con Google</button> para guardar tu progreso</div>` : ""}
        <div class="perfil-xp-barra-wrap" style="margin-top:10px">
          <div class="perfil-xp-barra"><div class="perfil-xp-fill" style="width:${pct}%"></div></div>
          <span class="perfil-xp-num">${maxNivel ? "NIVEL MÁXIMO" : xpAct + " / 1000 XP"}</span>
        </div>
      </div>
    </div>
    <div class="perfil-stats-grid">
      <div class="pstat-card">
        <span class="pstat-icon">⭐</span>
        <span class="pstat-val">${(u.xp || 0).toLocaleString()}</span>
        <span class="pstat-lbl">XP Total</span>
      </div>
      <div class="pstat-card">
        <span class="pstat-icon">🪙</span>
        <span class="pstat-val">${(u.monedas || 0).toLocaleString()}</span>
        <span class="pstat-lbl">VicioCoins</span>
      </div>
      <div class="pstat-card">
        <span class="pstat-icon">🎮</span>
        <span class="pstat-val">${u.juegos_jugados || 0}</span>
        <span class="pstat-lbl">Partidas</span>
      </div>
      <div class="pstat-card">
        <span class="pstat-icon">⏰</span>
        <span class="pstat-val">${tiempoH}h ${tiempoM}m</span>
        <span class="pstat-lbl">Tiempo jugado</span>
      </div>
      <div class="pstat-card">
        <span class="pstat-icon">❤️</span>
        <span class="pstat-val">${(u.favoritos || []).length}</span>
        <span class="pstat-lbl">Favoritos</span>
      </div>
      <div class="pstat-card">
        <span class="pstat-icon">🏆</span>
        <span class="pstat-val">${logrosCount}/${LOGROS.length}</span>
        <span class="pstat-lbl">Logros</span>
      </div>
    </div>
    <button class="btn-cerrar-sesion" onclick="cerrarSesion()">🚪 CERRAR SESIÓN</button>
  `;
}

// ── LOGROS ────────────────────────────────────────────────────────────────
async function renderizarLogros() {
  const u = await Storage.getUsuario();
  const contenedor = document.getElementById("logros-grid");
  if (!contenedor) return;

  contenedor.innerHTML = LOGROS.map(l => {
    const tiene = (u.logros || []).includes(l.id);
    return `
      <div class="logro-card ${tiene ? "logro-desbloqueado" : "logro-bloqueado"}">
        <div class="logro-icon">${l.icon}</div>
        <div class="logro-info">
          <div class="logro-nombre">${l.nombre}</div>
          <div class="logro-desc">${l.desc}</div>
        </div>
        ${tiene ? '<div class="logro-check">✓</div>' : '<div class="logro-lock">🔒</div>'}
      </div>`;
  }).join("");
}

let _verificandoLogros = false;
async function verificarLogros() {
  if (_verificandoLogros) return;
  _verificandoLogros = true;
  try { await _verificarLogros(); } finally { _verificandoLogros = false; }
}
async function _verificarLogros() {
  const u = await Storage.getUsuario();
  u.logros = u.logros || [];
  u.favoritos = u.favoritos || [];
  for (const logro of LOGROS) {
    if (!u.logros.includes(logro.id) && logro.condicion(u)) {
      const nuevo = await Storage.desbloquearLogro(logro.id);
      if (nuevo) {
        UISfx.win();
        mostrarToast(`🏆 Logro: ${logro.nombre}`, "✨");
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }
}

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
  const baseEquip = { ...ACCESORIOS_DEFAULT, ...(u.accesorios || {}) };
  const lookActual = _previewOverride ? { ...baseEquip, ..._previewOverride } : baseEquip;

  const monEl = document.getElementById("tienda-monedas");
  if (monEl) monEl.textContent = (u.monedas || 0).toLocaleString();

  const tituloHtml = renderTituloBadge(lookActual) || '<span style="font-size:11px;color:var(--color-muted)">Sin título equipado</span>';
  const bubbleCss  = getChatBubbleCSS(lookActual);

  const tabsHtml = CATEGORIAS_TIENDA.map(c =>
    `<button class="plato-tab-btn ${_catTiendaActiva === c.key ? 'activo' : ''}" onclick="cambiarCatTienda('${c.key}')">${c.label}</button>`
  ).join("");

  const catsAMostrar = _catTiendaActiva === "todos"
    ? CATEGORIAS_TIENDA.filter(c => c.key !== "todos")
    : CATEGORIAS_TIENDA.filter(c => c.key === _catTiendaActiva);

  const seccionesHtml = catsAMostrar.map(cat => {
    const items = ACCESORIOS[cat.plural] || [];
    const equipadoId = baseEquip[cat.key] || (items[0] && items[0].id);
    const cards = items.map(item => {
      const poseido  = item.precio === 0 || comprados.includes(item.id);
      const equipado = equipadoId === item.id;
      const bloq     = (u.nivel || 1) < item.reqNivel;
      const puede    = !bloq && (u.monedas || 0) >= item.precio;
      const rar      = item.rareza || "comun";

      const mockAcc = { ...baseEquip, [cat.key]: item.id };
      let previewHtml = "";
      if (cat.key === "titulo") {
        previewHtml = `<div style="min-height:54px;display:flex;align-items:center;justify-content:center">${item.texto ? renderTituloBadge(mockAcc) : '<span style="color:#666;font-size:12px">Ninguno</span>'}</div>`;
      } else if (cat.key === "burbuja") {
        previewHtml = `<div style="min-height:54px;display:flex;align-items:center;justify-content:center"><div style="padding:6px 10px;border-radius:10px;font-size:11px;${item.css}">¡Hola banda! 🎮</div></div>`;
      } else {
        previewHtml = `<div style="margin:6px 0">${renderAvatar(u.avatar || "😊", mockAcc, 54, u.fotoPerfil)}</div>`;
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
          ${renderAvatar(u.avatar || "😊", lookActual, 96, u.fotoPerfil)}
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
  UISfx.equip();
  renderizarTienda();
}

function probarLookAleatorio() {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)].id;
  _previewOverride = {
    sombrero: pick(ACCESORIOS.sombreros),
    lentes:   pick(ACCESORIOS.lentes),
    bigote:   pick(ACCESORIOS.bigotes),
    marco:    pick(ACCESORIOS.marcos),
    efecto:   pick(ACCESORIOS.efectos),
    mascota:  pick(ACCESORIOS.mascotas),
    titulo:   pick(ACCESORIOS.titulos),
    burbuja:  pick(ACCESORIOS.burbujas)
  };
  UISfx.equip();
  renderizarTienda();
}

async function resetearAccesorios() {
  _previewOverride = null;
  await Storage.actualizarUsuario(u => {
    u.accesorios = { ...ACCESORIOS_DEFAULT };
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
    u.accesorios = { ...ACCESORIOS_DEFAULT, ...(u.accesorios || {}), [campo]: num };
  });
  await Storage.publicarPerfil();
  await actualizarPerfil();
  await renderizarTienda();
}

function buscarAccesorio(id) {
  for (const lista of Object.values(ACCESORIOS)) {
    const it = lista.find(a => a.id === id);
    if (it) return it;
  }
  return null;
}

async function comprarAccesorio(id, catKey) {
  const item = buscarAccesorio(id);
  if (!item || !ACCESORIOS_DEFAULT.hasOwnProperty(catKey)) {
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
      u.accesorios = { ...ACCESORIOS_DEFAULT, ...(u.accesorios || {}), [catKey]: id };
    });
  } catch (e) { error = "No se pudo completar la compra"; console.error(e); }
  if (error) { mostrarToast(error, "❌"); return; }
  _previewOverride = null;
  await Storage.publicarPerfil();
  UISfx.coin();
  await actualizarPerfil();
  await renderizarTienda();
  mostrarToast(`¡Compraste y equipaste ${item.nombre}!`, "🎉");
}

async function equiparAccesorio(catKey, id) {
  const item = buscarAccesorio(id);
  if (!item || !ACCESORIOS_DEFAULT.hasOwnProperty(catKey)) return;
  let error = null;
  try {
    await Storage.actualizarUsuario(u => {
      const poseido = item.precio === 0 || (u.accesorios_comprados || []).includes(id);
      if (!poseido) { error = "Todavía no lo compraste"; return; }
      u.accesorios = { ...ACCESORIOS_DEFAULT, ...(u.accesorios || {}), [catKey]: id };
    });
  } catch (e) { error = "No se pudo equipar"; console.error(e); }
  if (error) { mostrarToast(error, "❌"); return; }
  _previewOverride = null;
  await Storage.publicarPerfil();
  UISfx.equip();
  await actualizarPerfil();
  await renderizarTienda();
  mostrarToast(`${item.nombre} equipado`, "✅");
}

// ── EDICIÓN DE PERFIL ─────────────────────────────────────────────────────
function editarNombre() {
  const form = document.getElementById("nombre-edit-form");
  const btn  = document.getElementById("nombre-nuevo-input");
  if (form) form.style.display = form.style.display === "none" ? "block" : "none";
  if (btn) btn.focus();
}

async function guardarNombre() {
  const input = document.getElementById("nombre-nuevo-input");
  const nombre = input ? input.value.trim().replace(/\s+/g, " ").slice(0, 20) : "";
  if (!nombre || nombre.length < 2) { mostrarToast("Nombre muy corto", "⚠️"); return; }
  try {
    await Storage.actualizarUsuario(u => { u.nombre = nombre; });
  } catch (e) { mostrarToast("No se pudo guardar el nombre", "❌"); return; }
  await Storage.publicarPerfil();
  await actualizarPerfil();
  await renderizarPerfil();
  mostrarToast("Nombre actualizado", "✅");
}

async function cambiarFotoPerfil(input) {
  const file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { mostrarToast("Seleccioná una imagen", "⚠️"); return; }
  if (file.size > 8 * 1024 * 1024) { mostrarToast("La imagen es muy pesada (máx. 8 MB)", "⚠️"); return; }

  const falla = () => mostrarToast("No se pudo leer la imagen", "❌");
  const reader = new FileReader();
  reader.onerror = falla;
  reader.onload = (e) => {
    const img = new Image();
    img.onerror = falla;
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 200; canvas.height = 200;
      const ctx2 = canvas.getContext("2d");
      const size = Math.min(img.width, img.height);
      const ox = (img.width - size) / 2;
      const oy = (img.height - size) / 2;
      ctx2.drawImage(img, ox, oy, size, size, 0, 0, 200, 200);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      try {
        await Storage.actualizarUsuario(u => { u.fotoPerfil = dataUrl; });
      } catch (err) { mostrarToast("No se pudo guardar la foto", "❌"); return; }
      input.value = "";
      await Storage.publicarPerfil();
      await actualizarPerfil();
      await renderizarPerfil();
      mostrarToast("Foto actualizada con tus accesorios", "📷");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ── OVERLAY DE NIVEL Y TOASTS ─────────────────────────────────────────────
function mostrarOverlayNivel(nombreNivel) {
  const overlay = document.getElementById("overlay-nivel");
  if (!overlay) return;
  overlay.querySelector(".overlay-nivel-nombre").textContent = nombreNivel;
  const particulas = overlay.querySelector(".particulas");
  particulas.innerHTML = "";
  for (let i = 0; i < 30; i++) {
    const p = document.createElement("span");
    p.className = "particula";
    p.style.setProperty("--x",     `${Math.random() * 100}%`);
    p.style.setProperty("--delay", `${Math.random() * 1}s`);
    p.style.setProperty("--dur",   `${0.8 + Math.random() * 0.8}s`);
    p.style.setProperty("--color", ["#ff6600", "#ffe600", "#00aaff", "#ff0055"][Math.floor(Math.random() * 4)]);
    particulas.appendChild(p);
  }
  UISfx.win();
  overlay.classList.add("visible");
  setTimeout(() => { overlay.classList.remove("visible"); verificarLogros(); }, 3000);
}

function mostrarToast(mensaje, icon = "ℹ️") {
  const container = document.getElementById("toast-container") || crearToastContainer();
  const toast = document.createElement("div");
  toast.className = "toast-notif";
  const i = document.createElement("span"); i.textContent = icon;
  const m = document.createElement("span"); m.textContent = mensaje;
  toast.append(i, m);
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function crearToastContainer() {
  const c = document.createElement("div");
  c.id = "toast-container";
  c.style.cssText = "position:fixed;top:70px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none";
  document.body.appendChild(c);
  return c;
}

// ── SONIDOS UI, HERO BANNER Y MISIONES DIARIAS ────────────────────────────
const UISfx = (() => {
  let ctx = null;
  function tone(f, dur, type = "triangle", delay = 0, vol = 0.12) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctx) ctx = new AC();
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator(), g = ctx.createGain();
      const t = ctx.currentTime + delay;
      osc.type = type; osc.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + dur + 0.02);
    } catch (e) {}
  }
  return {
    coin:  () => { tone(988, 0.08, "square", 0, 0.1); tone(1319, 0.22, "square", 0.07, 0.12); },
    win:   () => { [523, 659, 784, 1047].forEach((n, i) => tone(n, 0.16, "triangle", i * 0.08, 0.14)); },
    equip: () => { tone(587, 0.07, "sine", 0, 0.1); tone(880, 0.12, "sine", 0.06, 0.1); }
  };
})();

async function renderizarHeroYMisiones() {
  const heroEl = document.getElementById("av-hero-panel");
  const misEl  = document.getElementById("av-misiones-panel");
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
    { id: "m_jugar1", titulo: "Calentando motores", desc: "Jugá al menos 1 partida",   actual: Math.min(u.juegos_jugados || 0, 1), meta: 1,   premio: 25 },
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

document.addEventListener("DOMContentLoaded", iniciarApp);
