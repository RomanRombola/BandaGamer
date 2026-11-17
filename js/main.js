// main.js — AltoVicio V12 (Vectorial HD sin colisiones)

window.SVG_AVATARS = {
  e_smile: `<svg viewBox="0 0 100 100"><defs><linearGradient id="av1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff7b00"/><stop offset="100%" stop-color="#e11d48"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#av1)"/><circle cx="50" cy="48" r="27" fill="#ffdfc4"/><path d="M22 44 C22 18, 78 18, 78 44 C70 28, 30 28, 22 44 Z" fill="#1e293b"/><circle cx="39" cy="47" r="4.2" fill="#0f172a"/><circle cx="61" cy="47" r="4.2" fill="#0f172a"/><circle cx="40.5" cy="45.5" r="1.5" fill="#fff"/><circle cx="62.5" cy="45.5" r="1.5" fill="#fff"/><path d="M41 58 Q50 65 59 58" stroke="#0f172a" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M22 94 C26 73, 74 73, 78 94 Z" fill="#0f172a"/></svg>`,
  e_cool: `<svg viewBox="0 0 100 100"><defs><linearGradient id="av2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00b4ff"/><stop offset="100%" stop-color="#3b82f6"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#av2)"/><polygon points="24,20 40,38 20,46" fill="#ff6600"/><polygon points="76,20 60,38 80,46" fill="#ff6600"/><circle cx="50" cy="52" r="27" fill="#ffffff"/><path d="M25 46 Q50 36 75 46" stroke="#ff6600" stroke-width="4" fill="none"/><ellipse cx="39" cy="50" rx="6" ry="3.5" fill="#00b4ff"/><ellipse cx="61" cy="50" rx="6" ry="3.5" fill="#00b4ff"/><path d="M43 62 Q50 66 57 62" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  e_fire: `<svg viewBox="0 0 100 100"><defs><linearGradient id="av3" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#e11d48"/><stop offset="100%" stop-color="#ff7b00"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="#131824"/><path d="M50 14 C68 32, 78 48, 72 68 C68 82, 32 82, 28 68 C22 48, 32 32, 50 14 Z" fill="url(#av3)"/><path d="M50 28 C60 40, 65 52, 60 66 C56 75, 44 75, 40 66 C35 52, 40 40, 50 28 Z" fill="#ffb800"/><ellipse cx="41" cy="56" rx="4" ry="6" fill="#131824"/><ellipse cx="59" cy="56" rx="4" ry="6" fill="#131824"/></svg>`,
  e_skull: `<svg viewBox="0 0 100 100"><defs><linearGradient id="av4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#334155"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#av4)"/><path d="M26 46 C26 24, 74 24, 74 46 C74 58, 66 64, 64 74 L36 74 C34 64, 26 58, 26 46 Z" fill="#f8fafc"/><circle cx="39" cy="48" r="7" fill="#00b4ff"/><circle cx="61" cy="48" r="7" fill="#00b4ff"/><polygon points="50,55 46,63 54,63" fill="#1e293b"/><line x1="42" y1="68" x2="42" y2="74" stroke="#1e293b" stroke-width="3"/><line x1="50" y1="68" x2="50" y2="74" stroke="#1e293b" stroke-width="3"/><line x1="58" y1="68" x2="58" y2="74" stroke="#1e293b" stroke-width="3"/></svg>`,
  e_robot: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#0f172a"/><rect x="25" y="28" width="50" height="44" rx="14" fill="#e2e8f0" stroke="#00b4ff" stroke-width="3"/><line x1="50" y1="16" x2="50" y2="28" stroke="#00b4ff" stroke-width="4"/><circle cx="50" cy="14" r="5" fill="#ff6600"/><rect x="32" y="38" width="36" height="14" rx="6" fill="#0f172a"/><circle cx="41" cy="45" r="4" fill="#10b981"/><circle cx="59" cy="45" r="4" fill="#10b981"/><rect x="38" y="59" width="24" height="5" rx="2.5" fill="#00b4ff"/></svg>`,
  e_ninja: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#1e1b2e"/><circle cx="50" cy="50" r="30" fill="#0f172a"/><path d="M22 42 Q50 36 78 42 L78 55 Q50 50 22 55 Z" fill="#fde68a"/><path d="M20 38 L80 38 L80 43 L20 43 Z" fill="#ff2a5f"/><ellipse cx="39" cy="48" rx="4.5" ry="3" fill="#0f172a"/><ellipse cx="61" cy="48" rx="4.5" ry="3" fill="#0f172a"/></svg>`,
  e_dragon: `<svg viewBox="0 0 100 100"><defs><linearGradient id="avDr" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffb800"/><stop offset="100%" stop-color="#ea580c"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="#18121e"/><polygon points="24,20 36,38 22,42" fill="#fde047"/><polygon points="76,20 64,38 78,42" fill="#fde047"/><path d="M26 42 C26 26, 74 26, 74 42 L68 72 L50 78 L32 72 Z" fill="url(#avDr)"/><polygon points="35,48 45,51 37,55" fill="#fff"/><polygon points="65,48 55,51 63,55" fill="#fff"/></svg>`,
  e_diamond: `<svg viewBox="0 0 100 100"><defs><linearGradient id="avDi" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#6366f1"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="#0f172a"/><polygon points="50,16 80,42 50,84 20,42" fill="url(#avDi)"/><polygon points="50,16 66,42 50,84 34,42" fill="#bae6fd" opacity="0.45"/><polygon points="20,42 80,42 50,28" fill="#fff" opacity="0.35"/></svg>`,
  e_supreme: `<svg viewBox="0 0 100 100"><defs><radialGradient id="avSu"><stop offset="0%" stop-color="#fde047"/><stop offset="55%" stop-color="#ff6600"/><stop offset="100%" stop-color="#3b0764"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#avSu)"/><circle cx="50" cy="50" r="24" fill="#fff"/><polygon points="50,14 57,36 80,36 61,50 68,72 50,58 32,72 39,50 20,36 43,36" fill="#fde047"/></svg>`
};

window.SVG_SOMBREROS = {
  s_gorra: `<svg viewBox="0 0 120 70"><path d="M24 48 C24 18, 92 18, 92 48 Z" fill="#ff6600"/><path d="M20 45 L106 45 C112 45, 112 53, 102 53 L20 53 Z" fill="#1e293b"/><circle cx="58" cy="22" r="4" fill="#fff"/><rect x="44" y="32" width="28" height="8" rx="4" fill="#fff"/></svg>`,
  s_auris: `<svg viewBox="0 0 120 90"><path d="M18 62 C18 14, 102 14, 102 62" stroke="#1e293b" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M22 58 C22 18, 98 18, 98 58" stroke="#00b4ff" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="8" y="48" width="16" height="30" rx="8" fill="#ff6600" stroke="#fff" stroke-width="2"/><rect x="96" y="48" width="16" height="30" rx="8" fill="#ff6600" stroke="#fff" stroke-width="2"/></svg>`,
  s_corona: `<svg viewBox="0 0 120 75"><defs><linearGradient id="crG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs><polygon points="16,58 24,22 44,42 60,14 76,42 96,22 104,58" fill="url(#crG)" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><rect x="16" y="54" width="88" height="10" rx="5" fill="#b45309"/><circle cx="60" cy="40" r="5" fill="#ff2a5f"/><circle cx="36" cy="46" r="4" fill="#00b4ff"/><circle cx="84" cy="46" r="4" fill="#00b4ff"/></svg>`,
  s_angel: `<svg viewBox="0 0 120 60"><ellipse cx="60" cy="30" rx="42" ry="12" fill="none" stroke="#fde047" stroke-width="7"/><ellipse cx="60" cy="30" rx="42" ry="12" fill="none" stroke="#ffffff" stroke-width="2.5"/></svg>`,
  s_diablo: `<svg viewBox="0 0 120 70"><path d="M18 56 C10 34, 22 14, 38 12 C30 28, 32 42, 40 54 Z" fill="#ef4444"/><path d="M102 56 C110 34, 98 14, 82 12 C90 28, 88 42, 80 54 Z" fill="#ef4444"/></svg>`,
  s_bruja: `<svg viewBox="0 0 120 80"><rect x="14" y="54" width="92" height="10" rx="5" fill="#1e293b"/><rect x="32" y="14" width="56" height="44" rx="6" fill="#0f172a" stroke="#334155" stroke-width="2"/><rect x="32" y="44" width="56" height="8" fill="#ff6600"/></svg>`,
  s_mago: `<svg viewBox="0 0 120 85"><polygon points="60,8 22,64 98,64" fill="#4f46e5"/><ellipse cx="60" cy="64" rx="48" ry="10" fill="#312e81"/><polygon points="60,30 63,38 71,38 65,43 67,51 60,46 53,51 55,43 49,38 57,38" fill="#fde047"/></svg>`,
  s_vikingo: `<svg viewBox="0 0 120 75"><path d="M22 50 C8 32, 14 14, 28 12 C24 28, 28 38, 36 44 Z" fill="#fef3c7"/><path d="M98 50 C112 32, 106 14, 92 12 C96 28, 92 38, 84 44 Z" fill="#fef3c7"/><path d="M30 56 C30 26, 90 26, 90 56 Z" fill="#64748b" stroke="#cbd5e1" stroke-width="3"/></svg>`,
  s_chef: `<svg viewBox="0 0 120 80"><circle cx="40" cy="34" r="18" fill="#fff"/><circle cx="60" cy="28" r="22" fill="#fff"/><circle cx="80" cy="34" r="18" fill="#fff"/><rect x="32" y="44" width="56" height="18" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/></svg>`,
  s_alien_hat: `<svg viewBox="0 0 120 75"><path d="M40 36 C40 16, 80 16, 80 36 Z" fill="#38bdf8" opacity="0.8"/><ellipse cx="60" cy="38" rx="44" ry="12" fill="#94a3b8" stroke="#00b4ff" stroke-width="2.5"/><circle cx="36" cy="38" r="3.5" fill="#fde047"/><circle cx="60" cy="41" r="3.5" fill="#10b981"/><circle cx="84" cy="38" r="3.5" fill="#ff2a5f"/></svg>`,
  s_supremo: `<svg viewBox="0 0 120 80"><defs><linearGradient id="supG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff"/><stop offset="40%" stop-color="#fde047"/><stop offset="100%" stop-color="#ff6600"/></linearGradient></defs><polygon points="12,60 22,18 44,40 60,8 76,40 98,18 108,60" fill="url(#supG)" stroke="#fff" stroke-width="2.5"/><circle cx="60" cy="36" r="6" fill="#00b4ff"/><circle cx="35" cy="44" r="4.5" fill="#ff2a5f"/><circle cx="85" cy="44" r="4.5" fill="#ff2a5f"/></svg>`
};

window.SVG_LENTES = {
  l_cool: `<svg viewBox="0 0 120 50"><rect x="14" y="14" width="40" height="22" rx="5" fill="#0f172a" stroke="#fff" stroke-width="2"/><rect x="66" y="14" width="40" height="22" rx="5" fill="#0f172a" stroke="#fff" stroke-width="2"/><line x1="54" y1="22" x2="66" y2="22" stroke="#fff" stroke-width="3"/><line x1="22" y1="19" x2="32" y2="31" stroke="#fff" stroke-width="3" stroke-linecap="round"/><line x1="74" y1="19" x2="84" y2="31" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`,
  l_cyber: `<svg viewBox="0 0 120 50"><defs><linearGradient id="cyG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#00b4ff"/><stop offset="50%" stop-color="#ff2a5f"/><stop offset="100%" stop-color="#ff6600"/></linearGradient></defs><polygon points="10,14 110,14 102,36 66,36 60,26 54,36 18,36" fill="url(#cyG)" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><line x1="24" y1="21" x2="96" y2="21" stroke="#fff" stroke-width="2" opacity="0.7"/></svg>`,
  l_nerd: `<svg viewBox="0 0 120 50"><circle cx="36" cy="25" r="16" fill="rgba(56,189,248,0.22)" stroke="#f8fafc" stroke-width="3.5"/><circle cx="84" cy="25" r="16" fill="rgba(56,189,248,0.22)" stroke="#f8fafc" stroke-width="3.5"/><path d="M52 25 Q60 20 68 25" stroke="#f8fafc" stroke-width="3.5" fill="none"/></svg>`,
  l_monoc: `<svg viewBox="0 0 120 55"><circle cx="80" cy="24" r="16" fill="rgba(253,224,71,0.2)" stroke="#fde047" stroke-width="3.5"/><path d="M94 32 Q98 46 90 54" stroke="#fde047" stroke-width="2.5" fill="none" stroke-dasharray="3,3"/></svg>`,
  l_star: `<svg viewBox="0 0 120 55"><polygon points="36,8 41,20 54,20 43,28 47,41 36,33 25,41 29,28 18,20 31,20" fill="#fde047" stroke="#fff" stroke-width="2"/><polygon points="84,8 89,20 102,20 91,28 95,41 84,33 73,41 77,28 66,20 79,20" fill="#fde047" stroke="#fff" stroke-width="2"/><line x1="50" y1="24" x2="70" y2="24" stroke="#fde047" stroke-width="3"/></svg>`,
  l_heart: `<svg viewBox="0 0 120 55"><path d="M36 38 L22 24 A10 10 0 0 1 36 12 A10 10 0 0 1 50 24 Z" fill="#ff2a5f" stroke="#fff" stroke-width="2"/><path d="M84 38 L70 24 A10 10 0 0 1 84 12 A10 10 0 0 1 98 24 Z" fill="#ff2a5f" stroke="#fff" stroke-width="2"/><line x1="50" y1="22" x2="70" y2="22" stroke="#fff" stroke-width="2.5"/></svg>`,
  l_vr: `<svg viewBox="0 0 120 55"><rect x="12" y="10" width="96" height="32" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/><rect x="20" y="16" width="80" height="20" rx="8" fill="#0f172a"/><path d="M28 26 L92 26" stroke="#00b4ff" stroke-width="3" stroke-linecap="round"/></svg>`,
  l_fire: `<svg viewBox="0 0 120 55"><circle cx="36" cy="26" r="12" fill="#ff6600"/><circle cx="36" cy="26" r="6" fill="#fde047"/><circle cx="84" cy="26" r="12" fill="#ff6600"/><circle cx="84" cy="26" r="6" fill="#fde047"/></svg>`
};

window.SVG_BOCA = {
  b_mate: `<svg viewBox="0 0 100 70"><line x1="62" y1="8" x2="48" y2="36" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round"/><circle cx="64" cy="7" r="4" fill="#e2e8f0"/><path d="M30 32 C26 56, 74 56, 70 32 Z" fill="#78350f" stroke="#d97706" stroke-width="3"/><ellipse cx="50" cy="32" rx="20" ry="5" fill="#4ade80" stroke="#cbd5e1" stroke-width="2.5"/></svg>`,
  b_ninja: `<svg viewBox="0 0 120 65"><path d="M22 14 Q60 24 98 14 L90 50 Q60 62 30 50 Z" fill="#0f172a" stroke="#00b4ff" stroke-width="2.5"/><line x1="42" y1="32" x2="78" y2="32" stroke="#00b4ff" stroke-width="3" stroke-linecap="round"/><line x1="48" y1="41" x2="72" y2="41" stroke="#ff6600" stroke-width="3" stroke-linecap="round"/></svg>`,
  b_fino: `<svg viewBox="0 0 120 50"><path d="M60 22 C46 12, 26 28, 16 18 C22 36, 46 34, 60 26 C74 34, 98 36, 104 18 C94 28, 74 12, 60 22 Z" fill="#1e293b" stroke="#fff" stroke-width="1.5"/></svg>`,
  b_rosa: `<svg viewBox="0 0 120 55"><path d="M24 32 Q60 36 88 26" stroke="#22c55e" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="88" cy="24" r="11" fill="#e11d48"/><path d="M82 22 Q88 14 94 24 Q88 30 82 22 Z" fill="#fb7185"/></svg>`,
  b_king: `<svg viewBox="0 0 120 60"><path d="M22 16 Q60 54 98 16" stroke="#fde047" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="8,4"/><polygon points="60,34 68,46 60,56 52,46" fill="#00b4ff" stroke="#fff" stroke-width="1.5"/></svg>`,
  b_pizza: `<svg viewBox="0 0 100 65"><polygon points="50,8 22,54 78,54" fill="#fde047" stroke="#d97706" stroke-width="3" stroke-linejoin="round"/><path d="M20 52 Q50 60 80 52" stroke="#b45309" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="46" cy="34" r="5" fill="#ef4444"/><circle cx="58" cy="44" r="5" fill="#ef4444"/><circle cx="42" cy="46" r="4" fill="#ef4444"/></svg>`
};

window.SVG_MASCOTAS = {
  pet_capi: `<svg viewBox="0 0 80 80"><ellipse cx="40" cy="46" rx="26" ry="22" fill="#b45309"/><ellipse cx="52" cy="42" rx="14" ry="11" fill="#92400e"/><circle cx="26" cy="26" r="6" fill="#78350f"/><circle cx="46" cy="36" r="3.5" fill="#0f172a"/><ellipse cx="62" cy="40" rx="3" ry="2" fill="#0f172a"/><path d="M34 22 Q40 12 48 20" stroke="#4ade80" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
  pet_cat: `<svg viewBox="0 0 80 80"><polygon points="16,40 20,12 38,28" fill="#00b4ff"/><polygon points="64,40 60,12 42,28" fill="#00b4ff"/><circle cx="40" cy="46" r="24" fill="#1e293b" stroke="#00b4ff" stroke-width="2.5"/><circle cx="31" cy="44" r="4" fill="#fde047"/><circle cx="49" cy="44" r="4" fill="#fde047"/><polygon points="40,50 37,54 43,54" fill="#ff2a5f"/></svg>`,
  pet_dog: `<svg viewBox="0 0 80 80"><polygon points="16,38 22,14 36,28" fill="#f59e0b"/><polygon points="64,38 58,14 44,28" fill="#f59e0b"/><circle cx="40" cy="46" r="24" fill="#fbbf24"/><ellipse cx="40" cy="52" rx="14" ry="10" fill="#fef3c7"/><circle cx="31" cy="42" r="3.5" fill="#0f172a"/><circle cx="49" cy="42" r="3.5" fill="#0f172a"/><ellipse cx="40" cy="49" rx="4" ry="3" fill="#0f172a"/></svg>`,
  pet_duck: `<svg viewBox="0 0 80 80"><circle cx="40" cy="44" r="22" fill="#fde047"/><ellipse cx="40" cy="48" rx="11" ry="6" fill="#ff6600"/><circle cx="32" cy="38" r="3.5" fill="#0f172a"/><circle cx="48" cy="38" r="3.5" fill="#0f172a"/></svg>`,
  pet_ghost: `<svg viewBox="0 0 80 80"><path d="M18 42 C18 18, 62 18, 62 42 L62 66 L52 58 L40 66 L28 58 L18 66 Z" fill="#f8fafc" stroke="#38bdf8" stroke-width="2.5"/><circle cx="32" cy="40" r="4" fill="#0f172a"/><circle cx="48" cy="40" r="4" fill="#0f172a"/><ellipse cx="26" cy="46" rx="4" ry="2" fill="#f43f5e" opacity="0.6"/><ellipse cx="54" cy="46" rx="4" ry="2" fill="#f43f5e" opacity="0.6"/></svg>`,
  pet_alien: `<svg viewBox="0 0 80 80"><circle cx="40" cy="44" r="22" fill="#0f172a" stroke="#10b981" stroke-width="3"/><ellipse cx="40" cy="44" rx="14" ry="8" fill="#10b981"/><circle cx="40" cy="44" r="4" fill="#fff"/><line x1="40" y1="10" x2="40" y2="22" stroke="#10b981" stroke-width="3"/><circle cx="40" cy="10" r="4" fill="#ff6600"/></svg>`,
  pet_drag: `<svg viewBox="0 0 80 80"><polygon points="16,24 28,34 18,40" fill="#fde047"/><polygon points="64,24 52,34 62,40" fill="#fde047"/><circle cx="40" cy="46" r="22" fill="#ef4444" stroke="#fde047" stroke-width="2.5"/><circle cx="32" cy="42" r="4" fill="#fde047"/><circle cx="48" cy="42" r="4" fill="#fde047"/></svg>`
};

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
const ACCESORIOS_DEFAULT = window.ACCESORIOS_DEFAULT;

window.ACCESORIOS = {
  sombreros: [
    { id: "s_none",      nombre: "Sin sombrero",    precio: 0,    reqNivel: 1, rareza: "comun" },
    { id: "s_gorra",     nombre: "Gorra Street",    precio: 40,   reqNivel: 1, rareza: "comun" },
    { id: "s_auris",     nombre: "Auris Streamer",  precio: 90,   reqNivel: 1, rareza: "raro" },
    { id: "s_chef",      nombre: "Master Chef",     precio: 150,  reqNivel: 2, rareza: "raro" },
    { id: "s_bruja",     nombre: "Galera VIP",      precio: 220,  reqNivel: 3, rareza: "epico" },
    { id: "s_angel",     nombre: "Aureola Ángel",   precio: 260,  reqNivel: 4, rareza: "epico" },
    { id: "s_diablo",    nombre: "Cuernos Demonio", precio: 280,  reqNivel: 4, rareza: "epico" },
    { id: "s_corona",    nombre: "Corona del Rey",  precio: 400,  reqNivel: 5, rareza: "legendario" },
    { id: "s_vikingo",   nombre: "Casco Vikingo",   precio: 420,  reqNivel: 6, rareza: "epico" },
    { id: "s_mago",      nombre: "Sombrero Mago",   precio: 500,  reqNivel: 7, rareza: "legendario" },
    { id: "s_alien_hat", nombre: "Platillo OVNI",   precio: 850,  reqNivel: 9, rareza: "mitico" },
    { id: "s_supremo",   nombre: "Corona Suprema",  precio: 1000, reqNivel: 10, rareza: "mitico" }
  ],
  lentes: [
    { id: "l_none",  nombre: "Sin lentes",     precio: 0,   reqNivel: 1, rareza: "comun" },
    { id: "l_cool",  nombre: "Deal With It",   precio: 60,  reqNivel: 1, rareza: "comun" },
    { id: "l_nerd",  nombre: "Cristal HD",     precio: 90,  reqNivel: 1, rareza: "comun" },
    { id: "l_monoc", nombre: "Monóculo Dorado",precio: 150, reqNivel: 2, rareza: "raro" },
    { id: "l_star",  nombre: "Estrellas Pop",  precio: 220, reqNivel: 4, rareza: "epico" },
    { id: "l_heart", nombre: "Corazones",      precio: 240, reqNivel: 4, rareza: "epico" },
    { id: "l_vr",    nombre: "Visor Pro VR",   precio: 350, reqNivel: 5, rareza: "epico" },
    { id: "l_fire",  nombre: "Mirada Ígnea",   precio: 480, reqNivel: 6, rareza: "legendario" },
    { id: "l_cyber", nombre: "Visor Cyberpunk",precio: 650, reqNivel: 8, rareza: "mitico" }
  ],
  bigotes: [
    { id: "b_none",  nombre: "Sin accesorio",   precio: 0,   reqNivel: 1, rareza: "comun" },
    { id: "b_mate",  nombre: "Mate Argentino",  precio: 80,  reqNivel: 1, rareza: "raro" },
    { id: "b_fino",  nombre: "Mostacho Fino",   precio: 60,  reqNivel: 1, rareza: "comun" },
    { id: "b_pizza", nombre: "Pizza Caliente",  precio: 120, reqNivel: 2, rareza: "raro" },
    { id: "b_rosa",  nombre: "Rosa Seductora",  precio: 180, reqNivel: 3, rareza: "epico" },
    { id: "b_ninja", nombre: "Máscara Shinobi", precio: 320, reqNivel: 5, rareza: "epico" },
    { id: "b_king",  nombre: "Collar Diamante", precio: 550, reqNivel: 7, rareza: "mitico" }
  ],
  marcos: [
    { id: "m_none",    css: "", nombre: "Sin marco", precio: 0, reqNivel: 1, rareza: "comun" },
    { id: "m_naranja", css: "box-shadow:0 0 0 3px #ff6600, 0 0 14px #ff6600;", nombre: "Neón Naranja", precio: 50, reqNivel: 1, rareza: "comun" },
    { id: "m_azul",    css: "box-shadow:0 0 0 3px #00b4ff, 0 0 14px #00b4ff;", nombre: "Láser Azul", precio: 50, reqNivel: 1, rareza: "comun" },
    { id: "m_verde",   css: "box-shadow:0 0 0 3px #10b981, 0 0 16px #10b981;", nombre: "Esmeralda", precio: 100, reqNivel: 2, rareza: "raro" },
    { id: "m_rojo",    css: "box-shadow:0 0 0 3px #ff2a5f, 0 0 18px #ff2a5f;", nombre: "Carmesí", precio: 150, reqNivel: 2, rareza: "raro" },
    { id: "m_dorado",  css: "box-shadow:0 0 0 3px #ffb800, 0 0 20px #ff9900;", nombre: "Oro Puro", precio: 220, reqNivel: 3, rareza: "epico" },
    { id: "m_arg",     css: "background:conic-gradient(#74acdf 0 33%, #fff 33% 66%, #ffd700 66% 100%);padding:3px;box-shadow:0 0 18px rgba(116,172,223,0.8);", nombre: "Campeón Mundial", precio: 350, reqNivel: 3, rareza: "legendario" },
    { id: "m_galaxy",  css: "background:conic-gradient(#ff2a5f,#ff6600,#ffb800,#10b981,#00b4ff,#a855f7,#ff2a5f);padding:3px;box-shadow:0 0 22px rgba(0,180,255,0.7);", nombre: "RGB Gamer Pro", precio: 500, reqNivel: 5, rareza: "legendario" },
    { id: "m_fuego",   css: "background:conic-gradient(#ff0000,#ff6600,#ffb800,#ff6600,#ff0000);padding:3px;box-shadow:0 0 24px rgba(255,80,0,0.9);", nombre: "Llama Solar", precio: 650, reqNivel: 7, rareza: "legendario" },
    { id: "m_aurora",  css: "background:conic-gradient(#00ffcc,#00b4ff,#a855f7,#ff2a5f,#00ffcc);padding:3px;box-shadow:0 0 26px rgba(168,85,247,0.85);", nombre: "Galaxia Mítica", precio: 800, reqNivel: 8, rareza: "mitico" }
  ],
  efectos: [
    { id: "ef_none",   css: "", nombre: "Sin aura", precio: 0, reqNivel: 1, rareza: "comun" },
    { id: "ef_stars",  css: "box-shadow:0 0 24px rgba(255,184,0,0.6);", nombre: "Polvo Estelar", precio: 180, reqNivel: 2, rareza: "raro" },
    { id: "ef_hearts", css: "box-shadow:0 0 24px rgba(255,42,95,0.7);", nombre: "Pulso Carmesí", precio: 240, reqNivel: 3, rareza: "epico" },
    { id: "ef_fire",   css: "box-shadow:0 0 28px rgba(255,102,0,0.85);", nombre: "Aura Ígnea", precio: 380, reqNivel: 4, rareza: "epico" },
    { id: "ef_saiyan", css: "box-shadow:0 0 32px rgba(0,180,255,0.9);", nombre: "Energía Voltaica", precio: 550, reqNivel: 6, rareza: "legendario" },
    { id: "ef_dark",   css: "box-shadow:0 0 32px rgba(168,85,247,0.95);", nombre: "Materia Oscura", precio: 750, reqNivel: 8, rareza: "mitico" }
  ],
  mascotas: [
    { id: "pet_none",  nombre: "Sin mascota",    precio: 0,   reqNivel: 1, rareza: "comun" },
    { id: "pet_capi",  nombre: "Capibara Chill", precio: 150, reqNivel: 1, rareza: "raro" },
    { id: "pet_cat",   nombre: "Michi Neón",     precio: 180, reqNivel: 2, rareza: "raro" },
    { id: "pet_dog",   nombre: "Doge Guardián",  precio: 180, reqNivel: 2, rareza: "raro" },
    { id: "pet_duck",  nombre: "Patito Táctico", precio: 260, reqNivel: 3, rareza: "epico" },
    { id: "pet_ghost", nombre: "Fantasmita HD",  precio: 320, reqNivel: 4, rareza: "epico" },
    { id: "pet_alien", nombre: "Dron Alien",     precio: 450, reqNivel: 5, rareza: "legendario" },
    { id: "pet_drag",  nombre: "Dragón Carmesí", precio: 700, reqNivel: 7, rareza: "mitico" }
  ],
  titulos: [
    { id: "t_none",     texto: "",                 color: "#94a3b8", precio: 0,   reqNivel: 1, rareza: "comun" },
    { id: "t_cebador",  texto: "Cebador Oficial",  color: "#10b981", precio: 80,  reqNivel: 1, rareza: "comun" },
    { id: "t_tryhard",  texto: "Tryhard 24/7",     color: "#00b4ff", precio: 140, reqNivel: 2, rareza: "raro" },
    { id: "t_impostor", texto: "Impostor Pro",     color: "#ff2a5f", precio: 200, reqNivel: 3, rareza: "epico" },
    { id: "t_campeon",  texto: "Campeón Mundial",  color: "#38bdf8", precio: 300, reqNivel: 3, rareza: "legendario" },
    { id: "t_millo",    texto: "Magnate VicioCoin",color: "#ffb800", precio: 500, reqNivel: 5, rareza: "legendario" },
    { id: "t_dios",     texto: "Rey de AltoVicio", color: "#ff6600", precio: 900, reqNivel: 8, rareza: "mitico" }
  ],
  burbujas: [
    { id: "chat_default", nombre: "Clásica",        precio: 0,   reqNivel: 1, rareza: "comun",      css: "background:rgba(255,102,0,0.2);border:1px solid rgba(255,102,0,0.35);color:#fff;" },
    { id: "chat_cyber",   nombre: "Cyberpunk Neón", precio: 120, reqNivel: 1, rareza: "raro",       css: "background:linear-gradient(135deg,rgba(0,180,255,0.28),rgba(168,85,247,0.28));border:1px solid #00b4ff;color:#e0faff;" },
    { id: "chat_toxic",   nombre: "Esmeralda Pro",  precio: 180, reqNivel: 2, rareza: "raro",       css: "background:rgba(16,185,129,0.2);border:1px solid #10b981;color:#d8ffd0;" },
    { id: "chat_fire",    nombre: "Fuego Solar",    precio: 280, reqNivel: 4, rareza: "epico",      css: "background:linear-gradient(135deg,rgba(255,42,95,0.3),rgba(255,120,0,0.3));border:1px solid #ff6600;color:#fff2e6;" },
    { id: "chat_gold",    nombre: "VIP Oro Real",   precio: 450, reqNivel: 6, rareza: "legendario", css: "background:linear-gradient(135deg,rgba(255,184,0,0.28),rgba(180,100,0,0.35));border:1px solid #ffb800;color:#fffbe0;font-weight:700;" }
  ],
  emojis: [
    { id: "e_smile",   nombre: "Clásico HD",  precio: 0,    reqNivel: 1, rareza: "comun" },
    { id: "e_cool",    nombre: "Kitsune",     precio: 60,   reqNivel: 1, rareza: "comun" },
    { id: "e_fire",    nombre: "Espíritu",    precio: 120,  reqNivel: 2, rareza: "raro" },
    { id: "e_skull",   nombre: "Calavera",    precio: 220,  reqNivel: 3, rareza: "epico" },
    { id: "e_robot",   nombre: "Mecha Bot",   precio: 340,  reqNivel: 5, rareza: "epico" },
    { id: "e_ninja",   nombre: "Shinobi",     precio: 420,  reqNivel: 6, rareza: "legendario" },
    { id: "e_dragon",  nombre: "Dragón",      precio: 550,  reqNivel: 7, rareza: "legendario" },
    { id: "e_diamond", nombre: "Cristal",     precio: 750,  reqNivel: 8, rareza: "mitico" },
    { id: "e_supreme", nombre: "Cósmico",     precio: 1000, reqNivel: 10, rareza: "mitico" }
  ]
};
const ACCESORIOS = window.ACCESORIOS;

function renderAvatar(base, accesorios = {}, size = 44, fotoUrl = "") {
  if (base && typeof base === "object") {
    const uObj = base;
    accesorios = uObj.accesorios || {};
    fotoUrl = uObj.fotoPerfil || "";
    base = uObj.avatar || "e_smile";
  }
  const acc = { ...ACCESORIOS_DEFAULT, ...(accesorios || {}) };
  const foto = urlFotoSegura(fotoUrl);
  const avatarId = acc.emoji && window.SVG_AVATARS[acc.emoji] ? acc.emoji : "e_smile";
  const svgBase     = window.SVG_AVATARS[avatarId] || window.SVG_AVATARS.e_smile;
  const svgSombrero = window.SVG_SOMBREROS[acc.sombrero] || "";
  const svgLentes   = window.SVG_LENTES[acc.lentes] || "";
  const svgBoca     = window.SVG_BOCA[acc.bigote] || "";
  const svgMascota  = window.SVG_MASCOTAS[acc.mascota] || "";
  const marcoAcc    = ACCESORIOS.marcos.find(a => a.id === acc.marco);
  const efectoAcc   = ACCESORIOS.efectos.find(a => a.id === acc.efecto);

  const offY = Math.max(-25, Math.min(25, Number(acc.offsetY) || 0)) * (size / 80);
  const sc   = Math.max(0.75, Math.min(1.35, (Number(acc.scale) || 100) / 100));

  const auraStyle  = efectoAcc?.css || "";
  const marcoStyle = marcoAcc?.css || "box-shadow:0 0 0 2px rgba(255,255,255,0.14);";
  const innerContent = foto
    ? `<img src="${foto}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block">`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">${svgBase}</div>`;

  return `<div class="av-plato-wrap" style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;flex-shrink:0;vertical-align:middle;overflow:visible !important;">
    ${auraStyle ? `<div class="av-aura-layer" style="position:absolute;inset:-4px;border-radius:50%;pointer-events:none;${auraStyle}"></div>` : ""}
    <div class="av-frame-ring" style="position:relative;width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#131722;${marcoStyle}">
      <div style="width:100%;height:100%;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;">
        ${innerContent}
      </div>
    </div>
    ${svgSombrero ? `<div style="position:absolute;top:${Math.round(-size * 0.36 + offY)}px;left:50%;width:${Math.round(size * 0.95)}px;transform:translateX(-50%) scale(${sc});pointer-events:none;z-index:5;filter:drop-shadow(0 3px 5px rgba(0,0,0,0.6))">${svgSombrero}</div>` : ""}
    ${svgLentes ? `<div style="position:absolute;top:${Math.round(size * 0.18 + offY)}px;left:50%;width:${Math.round(size * 0.86)}px;transform:translateX(-50%) scale(${sc});pointer-events:none;z-index:4;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.55))">${svgLentes}</div>` : ""}
    ${svgBoca ? `<div style="position:absolute;bottom:${Math.round(-size * 0.14 - offY * 0.5)}px;left:50%;width:${Math.round(size * 0.76)}px;transform:translateX(-50%) scale(${sc});pointer-events:none;z-index:4;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6))">${svgBoca}</div>` : ""}
    ${svgMascota ? `<div class="av-pet-float" style="position:absolute;bottom:${Math.round(-size * 0.14)}px;right:${Math.round(-size * 0.24)}px;width:${Math.round(size * 0.52)}px;height:${Math.round(size * 0.52)}px;pointer-events:none;z-index:6;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.7))">${svgMascota}</div>` : ""}
  </div>`;
}
window.renderAvatar = renderAvatar;

function renderTituloBadge(accesorios = {}) {
  const id = accesorios?.titulo || "t_none";
  const t = ACCESORIOS.titulos.find(x => x.id === id);
  if (!t || !t.texto) return "";
  return `<span class="av-titulo-pill" style="display:inline-block;font-family:'Outfit',sans-serif;font-size:10px;font-weight:800;padding:2px 9px;border-radius:99px;background:rgba(15,23,42,0.75);border:1px solid ${t.color};color:${t.color};vertical-align:middle">${t.texto}</span>`;
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
  mostrarToast(`¡Bienvenido a AltoVicio, ${nombre}!`, "🎮");
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
  if (el("perfil-avatar"))      el("perfil-avatar").innerHTML        = renderAvatar(u.avatar || "e_smile", u.accesorios, 34, u.fotoPerfil);
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

async function renderizarGrid(lista) {
  const grid = document.getElementById("games-grid");
  if (!grid) return;
  if (!lista.length) {
    grid.innerHTML = `<div class="sin-resultados"><p>No encontramos juegos para "<strong>${esc(terminoBusqueda)}</strong>".</p></div>`;
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
       ${tieneVideo ? `data-preview-video="${esc(juego.preview_video)}"` : (tienePreview ? `data-preview="pages/${esc(juego.embed_url)}${sep}preview=1"` : "")}
       onmouseenter="iniciarPreview(this)"
       onmouseleave="detenerPreview(this)">
      <div class="card-thumb">
        <div class="card-thumb-static">
          ${tieneThumb ? `<img src="${esc(juego.thumbnail)}" alt="${nombre}" loading="lazy" onerror="this.style.display='none';this.parentNode.querySelector('.thumb-fallback').style.display='flex'">` : ""}
          <div class="thumb-fallback" style="display:${tieneThumb ? 'none' : 'flex'}">
            <span class="thumb-fallback-nombre">${nombre}</span>
          </div>
        </div>
        <div class="card-preview-wrap" style="display:none">
          <div class="card-preview-label">GAMEPLAY</div>
        </div>
        <button class="btn-favorito ${esFav ? 'activo' : ''}" data-id="${esc(juego.id)}"
                title="${esFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">${esFav ? '♥' : '♡'}</button>
        ${badgeTipo}
      </div>
      <div class="card-info">
        <span class="card-nombre">${nombre}</span>
        <div class="card-meta">
          <span class="card-categoria">${esc(juego.categoria)}</span>
          ${visitas > 0 ? `<span class="card-visitas">${visitas} jugadas</span>` : ""}
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
      mostrarToast("No se pudo guardar el favorito", "❌");
    } finally {
      delete btn.dataset.busy;
    }
  }, true);
}

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
    wrap.style.display = "block";
    wrap.style.opacity = "1";
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
    }, 200);
  }
  if (staticDiv) staticDiv.style.opacity = "1";
}

async function filtrarPorCategoria(categoria) {
  categoriaActiva = categoria;
  terminoBusqueda = "";
  const buscador = document.getElementById("buscador");
  if (buscador) buscador.value = "";

  const lista = categoria === "todos" ? juegos : juegos.filter(j => j.categoria === categoria);
  await renderizarGrid(lista);

  document.querySelectorAll("[data-categoria]").forEach(btn => {
    btn.classList.toggle("activo", btn.dataset.categoria === categoria);
  });
  const titulo = document.getElementById("catalogo-titulo");
  if (titulo) titulo.textContent = categoria === "todos" ? "Todos los Juegos" : `Categoría: ${ETIQUETAS_CATEGORIA[categoria] || categoria}`;
}

async function filtrarPorBusqueda(termino) {
  terminoBusqueda = termino;
  await renderizarGrid(buscar(termino));
  const titulo = document.getElementById("catalogo-titulo");
  if (titulo) titulo.textContent = termino ? `Resultados para "${termino}"` : "Todos los Juegos";
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
  todos: "Todos los juegos", accion: "Acción", puzzle: "Puzzle y Lógica", arcade: "Arcade",
  multijugador: "Multijugador Online", carreras: "Carreras", estrategia: "Estrategia",
  casual: "Casual", aventura: "Aventura", deportes: "Deportes", retro: "Clásicos"
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
    contenedor.innerHTML = "<p class='muted-text'>Jugá para ver aquí tus favoritos.</p>";
    return;
  }
  const lista = ids.map(id => juegos.find(j => j.id === id)).filter(Boolean);
  contenedor.innerHTML = lista.map(j => `
    <a href="pages/juego.html?id=${j.id}" class="mini-juego-link">
      <span class="mini-juego-nombre">${esc(j.nombre)}</span>
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
    timer = setTimeout(() => filtrarPorBusqueda(input.value.trim()), 200);
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
    btn.textContent = ETIQUETAS_CATEGORIA[btn.dataset.categoria] || btn.dataset.categoria;
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

async function renderizarRankingGlobal() {
  const contenedor = document.getElementById("ranking-lista");
  if (!contenedor) return;
  contenedor.innerHTML = `<div class="ranking-loading">Cargando ranking...</div>`;

  const lista = await Storage.getRankingGlobal(50);
  const miUid = Storage.auth.currentUser?.uid;

  if (!lista.length) {
    contenedor.innerHTML = `<div class="ranking-vacio">Todavía no hay jugadores en el ranking. ¡Sé el primero!</div>`;
    return;
  }

  contenedor.innerHTML = lista.map((p, i) => {
    const pos = `#${i + 1}`;
    const esSoy = p.uid === miUid;
    const nivelNombre = NOMBRES_NIVEL[p.nivel] || "";
    const avatarHtml = renderAvatar(p.avatar || "e_smile", p.accesorios, 42, p.fotoPerfil);
    const tituloBadge = renderTituloBadge(p.accesorios);
    return `
      <div class="ranking-fila ${esSoy ? "ranking-yo" : ""}" data-uid="${esc(p.uid)}" style="cursor:pointer">
        <div class="ranking-pos">${pos}</div>
        <div class="ranking-avatar" style="display:flex;align-items:center;justify-content:center;width:46px;height:46px;overflow:visible">${avatarHtml}</div>
        <div class="ranking-info">
          <div class="ranking-nombre">${esc(p.nombre)}${esSoy ? ' <span class="ranking-tu-tag">(vos)</span>' : ""}</div>
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

async function verPerfilUsuario(uid) {
  const miUid = Storage.auth.currentUser?.uid;
  if (uid === miUid) { mostrarSeccion("perfil"); return; }

  let modal = document.getElementById("modal-perfil-usuario");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-perfil-usuario";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(10,14,24,0.82);backdrop-filter:blur(8px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px";
    modal.innerHTML = `<div style="background:#141b29;border:1px solid rgba(255,255,255,0.1);border-radius:22px;padding:26px;max-width:350px;width:100%;position:relative;text-align:center">
      <button onclick="document.getElementById('modal-perfil-usuario').remove()" style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.06);border:none;color:#94a3b8;padding:6px 10px;border-radius:10px;cursor:pointer">✕</button>
      <div id="mpf-avatar" style="margin-bottom:14px;display:flex;justify-content:center"></div>
      <div id="mpf-nombre" style="font-family:'Outfit',sans-serif;font-size:21px;font-weight:800;margin-bottom:4px">Cargando...</div>
      <div id="mpf-rango" style="font-size:13px;color:#00b4ff;margin-bottom:16px"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
        <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:10px">
          <div id="mpf-xp" style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:800;color:#00b4ff">0</div>
          <div style="font-size:10px;color:#94a3b8">XP</div>
        </div>
        <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:10px">
          <div id="mpf-nivel" style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:800;color:#ff6600">1</div>
          <div style="font-size:10px;color:#94a3b8">NIVEL</div>
        </div>
        <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:10px">
          <div id="mpf-juegos" style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:800;color:#10b981">0</div>
          <div style="font-size:10px;color:#94a3b8">PARTIDAS</div>
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
    modal.querySelector("#mpf-avatar").innerHTML = renderAvatar(p.avatar || "e_smile", p.accesorios, 84, p.fotoPerfil);
    modal.querySelector("#mpf-nombre").textContent = p.nombre || "Usuario";
    modal.querySelector("#mpf-rango").innerHTML = esc(NOMBRES_NIVEL[p.nivel] || "") + " " + renderTituloBadge(p.accesorios);
    modal.querySelector("#mpf-xp").textContent = (p.xp || 0).toLocaleString();
    modal.querySelector("#mpf-nivel").textContent = p.nivel || 1;
    modal.querySelector("#mpf-juegos").textContent = p.juegos_jugados || 0;
  } catch (e) {
    console.error("Error cargando perfil:", e);
  }
}

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
      <div class="perfil-avatar-grande" title="Cambiar foto de perfil" onclick="document.getElementById('foto-input').click()" style="cursor:pointer;position:relative;padding:8px">
        ${renderAvatar(u.avatar || "e_smile", u.accesorios, 92, u.fotoPerfil)}
        <div style="position:absolute;bottom:2px;right:2px;background:#ff6600;color:#fff;border-radius:99px;padding:3px 8px;font-size:10px;font-weight:800;z-index:10">FOTO</div>
      </div>
      <input type="file" id="foto-input" accept="image/*" style="display:none" onchange="cambiarFotoPerfil(this)">
      <div class="perfil-datos">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
          <div class="perfil-nombre-grande" id="perfil-nombre-display">${esc(u.nombre)}</div>
          <button onclick="editarNombre()" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:var(--color-muted);font-size:11px;padding:5px 10px;border-radius:8px;cursor:pointer;font-weight:700">Editar</button>
        </div>
        <div id="nombre-edit-form" style="display:none;margin-bottom:8px">
          <div style="display:flex;gap:6px">
            <input type="text" id="nombre-nuevo-input" value="${esc(u.nombre)}" maxlength="20"
              style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,102,0,0.4);color:#fff;font-size:14px;font-weight:700;padding:8px 12px;border-radius:10px;outline:none;">
            <button onclick="guardarNombre()" style="background:#ff6600;border:none;color:#fff;font-size:12px;font-weight:800;padding:8px 14px;border-radius:10px;cursor:pointer">Guardar</button>
          </div>
        </div>
        <div class="perfil-rango">${esc(NOMBRES_NIVEL[u.nivel] || "")} ${renderTituloBadge(u.accesorios)}</div>
        ${esInvitado ? `<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:8px 12px;font-size:12px;color:var(--color-muted);margin-top:8px">Modo invitado — <button onclick="loginConGoogle()" style="background:none;border:none;color:#00b4ff;cursor:pointer;font-size:12px;font-weight:700">Conectá con Google</button> para sincronizar en la nube</div>` : ""}
        <div class="perfil-xp-barra-wrap" style="margin-top:12px">
          <div class="perfil-xp-barra"><div class="perfil-xp-fill" style="width:${pct}%"></div></div>
          <span class="perfil-xp-num">${maxNivel ? "NIVEL MÁXIMO" : xpAct + " / 1000 XP"}</span>
        </div>
      </div>
    </div>
    <div class="perfil-stats-grid">
      <div class="pstat-card"><span class="pstat-val">${(u.xp || 0).toLocaleString()}</span><span class="pstat-lbl">XP Total</span></div>
      <div class="pstat-card"><span class="pstat-val">${(u.monedas || 0).toLocaleString()}</span><span class="pstat-lbl">VicioCoins</span></div>
      <div class="pstat-card"><span class="pstat-val">${u.juegos_jugados || 0}</span><span class="pstat-lbl">Partidas</span></div>
      <div class="pstat-card"><span class="pstat-val">${tiempoH}h ${tiempoM}m</span><span class="pstat-lbl">Tiempo jugado</span></div>
      <div class="pstat-card"><span class="pstat-val">${(u.favoritos || []).length}</span><span class="pstat-lbl">Favoritos</span></div>
      <div class="pstat-card"><span class="pstat-val">${logrosCount}/${LOGROS.length}</span><span class="pstat-lbl">Logros</span></div>
    </div>
    <button class="btn-cerrar-sesion" onclick="cerrarSesion()">CERRAR SESIÓN</button>
  `;
}

async function renderizarLogros() {
  const u = await Storage.getUsuario();
  const contenedor = document.getElementById("logros-grid");
  if (!contenedor) return;

  contenedor.innerHTML = LOGROS.map(l => {
    const tiene = (u.logros || []).includes(l.id);
    return `
      <div class="logro-card ${tiene ? "logro-desbloqueado" : "logro-bloqueado"}">
        <div class="logro-info">
          <div class="logro-nombre">${esc(l.nombre)}</div>
          <div class="logro-desc">${esc(l.desc)}</div>
        </div>
        ${tiene ? '<div class="logro-check" style="color:#10b981;font-weight:900">COMPLETADO</div>' : '<div class="logro-lock" style="color:#64748b;font-size:12px">BLOQUEADO</div>'}
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
        mostrarToast(`Logro desbloqueado: ${logro.nombre}`, "🏆");
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }
}

// ── TIENDA ESTILO PLATO (VICIOSHOP STUDIO V12) ────────────────────────────
let _catTiendaActiva = "todos";
let _previewOverride = null;

const CATEGORIAS_TIENDA = [
  { key: "todos",    plural: "todos",     label: "Todo el Catálogo" },
  { key: "marco",    plural: "marcos",    label: "Marcos HD" },
  { key: "efecto",   plural: "efectos",   label: "Auras" },
  { key: "sombrero", plural: "sombreros", label: "Sombreros y Cascos" },
  { key: "lentes",   plural: "lentes",    label: "Lentes y Visores" },
  { key: "bigote",   plural: "bigotes",   label: "Boca y Mate" },
  { key: "mascota",  plural: "mascotas",  label: "Mascotas" },
  { key: "titulo",   plural: "titulos",   label: "Títulos" },
  { key: "burbuja",  plural: "burbujas",  label: "Burbujas de Chat" },
  { key: "emoji",    plural: "emojis",    label: "Avatares Base" }
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
        previewHtml = `<div style="min-height:58px;display:flex;align-items:center;justify-content:center">${item.texto ? renderTituloBadge(mockAcc) : '<span style="color:#64748b;font-size:12px">Ninguno</span>'}</div>`;
      } else if (cat.key === "burbuja") {
        previewHtml = `<div style="min-height:58px;display:flex;align-items:center;justify-content:center"><div style="padding:6px 12px;border-radius:12px;font-size:11px;${item.css}">¡Hola amigos!</div></div>`;
      } else {
        previewHtml = `<div style="margin:8px 0">${renderAvatar(u.avatar || "e_smile", mockAcc, 58, u.fotoPerfil)}</div>`;
      }

      let btnAccion = "";
      if (equipado)     btnAccion = `<button class="av-btn av-btn-equipado" disabled>EQUIPADO</button>`;
      else if (poseido) btnAccion = `<button class="av-btn av-btn-equipar" onclick="equiparAccesorio('${cat.key}','${item.id}')">EQUIPAR</button>`;
      else if (bloq)    btnAccion = `<button class="av-btn av-btn-bloqueado" disabled>Nivel ${item.reqNivel}</button>`;
      else              btnAccion = `<button class="av-btn av-btn-comprar ${puede ? '' : 'av-sin-fondos'}" onclick="comprarAccesorio('${item.id}','${cat.key}')" ${puede ? '' : 'disabled'}>${item.precio} VicioCoins</button>`;

      const btnProbar = !equipado
        ? `<button class="av-btn av-btn-probar" onclick="probarEnEstudio('${cat.key}','${item.id}')">Probar en mi avatar</button>`
        : "";

      return `<div class="tienda-card ${equipado ? 'tienda-card-equipado' : ''} ${bloq ? 'tienda-card-bloqueado' : ''}">
        <span class="rareza-tag rareza-${rar}">${rar}</span>
        ${previewHtml}
        <div class="tienda-avatar-nombre">${esc(item.nombre)}</div>
        ${btnAccion}
        ${btnProbar}
      </div>`;
    }).join("");

    return `<div style="margin-bottom:26px">
      <div style="font-family:'Outfit',sans-serif;font-size:14px;font-weight:800;color:#fff;margin-bottom:12px">${cat.label}</div>
      <div class="tienda-grid">${cards}</div>
    </div>`;
  }).join("");

  contenedor.innerHTML = `
    <div class="plato-studio">
      <div class="plato-stage-box">
        <div style="font-family:'Outfit',sans-serif;font-size:11px;font-weight:800;color:var(--color-accent)">TU AVATAR EN VIVO</div>
        <div id="studio-avatar-stage" style="padding:14px 0">
          ${renderAvatar(u.avatar || "e_smile", lookActual, 96, u.fotoPerfil)}
        </div>
        <div style="font-family:'Outfit',sans-serif;font-weight:900;font-size:16px;color:#fff">${esc(u.nombre || "Jugador")}</div>
        <div>${tituloHtml}</div>
        ${_previewOverride ? `<span style="font-size:11px;color:#38bdf8">Vista previa activa</span>` : ""}
      </div>
      <div class="plato-controls-box">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
          <div>
            <div style="font-family:'Outfit',sans-serif;font-size:16px;font-weight:800;color:#fff">Estudio de Personalización HD</div>
            <div style="font-size:13px;color:var(--color-muted)">Todos los accesorios son ilustraciones vectoriales que se adaptan sobre tu foto de perfil o avatar.</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="av-btn-glow bonus" style="padding:8px 14px;font-size:12px" onclick="resetearAccesorios()">Restaurar por defecto</button>
          </div>
        </div>
        <div class="plato-sliders">
          <label class="plato-slider-row">
            <span>Posición vertical sobre tu foto (${lookActual.offsetY || 0}px)</span>
            <input type="range" min="-20" max="20" value="${lookActual.offsetY || 0}" onchange="ajustarCalibracion('offsetY', this.value)">
          </label>
          <label class="plato-slider-row">
            <span>Escala de accesorios (${lookActual.scale || 100}%)</span>
            <input type="range" min="75" max="135" value="${lookActual.scale || 100}" onchange="ajustarCalibracion('scale', this.value)">
          </label>
        </div>
        <div>
          <div style="font-size:11px;color:var(--color-muted);margin-bottom:4px;font-weight:700">VISTA PREVIA DE TU BURBUJA DE CHAT:</div>
          <div class="plato-chat-preview" style="${bubbleCss}">¡Sale partida con amigos en AltoVicio!</div>
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

async function resetearAccesorios() {
  _previewOverride = null;
  await Storage.actualizarUsuario(u => {
    u.accesorios = { ...ACCESORIOS_DEFAULT };
  });
  await Storage.publicarPerfil();
  await actualizarPerfil();
  await renderizarTienda();
  mostrarToast("Accesorios restaurados", "✅");
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
      const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
      try {
        await Storage.actualizarUsuario(u => { u.fotoPerfil = dataUrl; });
      } catch (err) { mostrarToast("No se pudo guardar la foto", "❌"); return; }
      input.value = "";
      await Storage.publicarPerfil();
      await actualizarPerfil();
      await renderizarPerfil();
      mostrarToast("Foto de perfil actualizada", "📷");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function mostrarOverlayNivel(nombreNivel) {
  const overlay = document.getElementById("overlay-nivel");
  if (!overlay) return;
  overlay.querySelector(".overlay-nivel-nombre").textContent = nombreNivel;
  UISfx.win();
  overlay.classList.add("visible");
  setTimeout(() => { overlay.classList.remove("visible"); verificarLogros(); }, 3000);
}

function mostrarToast(mensaje, icon = "") {
  const container = document.getElementById("toast-container") || crearToastContainer();
  const toast = document.createElement("div");
  toast.className = "toast-notif";
  const m = document.createElement("span");
  m.textContent = (icon ? icon + " " : "") + mensaje;
  toast.append(m);
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function crearToastContainer() {
  const c = document.createElement("div");
  c.id = "toast-container";
  c.style.cssText = "position:fixed;top:76px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none";
  document.body.appendChild(c);
  return c;
}

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
    coin:  () => { tone(988, 0.08, "sine", 0, 0.1); tone(1319, 0.22, "sine", 0.07, 0.12); },
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
        <span class="av-hero-badge">PORTAL OFICIAL ALTOVICIO</span>
        <div class="av-hero-title">Jugá y competí con amigos sin descargar nada</div>
        <div class="av-hero-desc">Salas multijugador en tiempo real para Impostor, Gartic Phone, 8 Ball Pool y Ajedrez, más de 45 juegos con ranking global y personalización HD.</div>
      </div>
      <div class="av-hero-actions">
        <button class="av-btn-glow primary" onclick="mostrarSeccion('tienda')">Personalizar Avatar</button>
        <a class="av-btn-glow secondary" href="pages/juego.html?id=game-022">Impostor Online</a>
        <button class="av-btn-glow bonus" onclick="reclamarBonusDiario()" ${bonusReclamado ? "disabled style='opacity:0.5;cursor:default'" : ""}>
          ${bonusReclamado ? "Bonus Diario Reclamado" : "Reclamar +50 VicioCoins"}
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
          <div style="font-weight:700;font-size:14px;color:#fff">${m.titulo} <span style="color:var(--color-accent);font-size:12px">+${m.premio} VicioCoins</span></div>
          <div style="font-size:12px;color:var(--color-muted)">${m.desc} (${m.actual}/${m.meta})</div>
          <div class="av-mision-prog"><div class="av-mision-fill" style="width:${pct}%"></div></div>
        </div>
        ${ya
          ? `<button class="av-mision-btn done" disabled>LISTO</button>`
          : (lista
              ? `<button class="av-mision-btn claim" onclick="reclamarMision('${m.id}', ${m.premio})">RECLAMAR</button>`
              : `<span style="font-family:'Outfit',sans-serif;font-size:12px;font-weight:800;color:var(--color-muted)">${pct}%</span>`
            )
        }
      </div>`;
  }).join("") + `</div>`;
}

async function reclamarBonusDiario() {
  const hoy = new Date().toISOString().slice(0, 10);
  if (localStorage.getItem("av_bonus_diario") === hoy) return;
  localStorage.setItem("av_bonus_diario", hoy);
  await Storage.sumarMonedas(50);
  await Storage.sumarXP(25);
  UISfx.coin();
  mostrarToast("Bonus diario: +50 VicioCoins y +25 XP", "🎁");
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
  mostrarToast(`Misión completada: +${premio} VicioCoins`, "🏆");
  await actualizarPerfil();
  await renderizarHeroYMisiones();
}

document.addEventListener("DOMContentLoaded", iniciarApp);
