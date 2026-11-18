// avatar.js — Motor de avatares AltoVicio (compartido por index, juego y social)
// Define los SVG de la tienda, ACCESORIOS y renderAvatar / renderTituloBadge / getChatBubbleCSS.
// Se carga ANTES de main.js / del script de cada página.

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
  cara: "c_none",
  cuello: "k_none",
  espalda: "w_none",
  pin: "p_none",
  fondo: "fd_none",
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

// ── Tienda ilustrada (V15) ────────────────────────────────────────────────
// Arte en assets/tienda/ (acc/, marcos/, fondos/). Colocación relativa al tamaño del avatar:
// w = ancho, x/y = centro, yb = borde inferior (0 = arriba del avatar, 1 = abajo), doble = un par simétrico.
// Para calibrar un ítem, cambiá sus números acá y miralo en la tienda.
window.TIENDA_ILUSTRADA = {
  sombreros: [
    {"id":"s_cotillon","nombre":"Gorrito de Cumple","precio":70,"reqNivel":1,"rareza":"comun","img":"acc/cotillon.webp","ar":0.975,"w":0.5,"x":0.6,"yb":0.2},
    {"id":"s_mono_rojo","nombre":"Moño Rojo","precio":80,"reqNivel":1,"rareza":"comun","img":"acc/mono_rojo.webp","ar":0.832,"w":0.46,"x":0.74,"y":0.1},
    {"id":"s_mono_violeta","nombre":"Moño Lila","precio":90,"reqNivel":1,"rareza":"comun","img":"acc/mono_violeta.webp","ar":0.822,"w":0.46,"x":0.74,"y":0.1},
    {"id":"s_mono_cafe","nombre":"Moño Caramelo","precio":70,"reqNivel":1,"rareza":"comun","img":"acc/mono_cafe.webp","ar":0.864,"w":0.46,"x":0.74,"y":0.1},
    {"id":"s_hebilla","nombre":"Hebilla Estrella","precio":80,"reqNivel":1,"rareza":"comun","img":"acc/hebilla_estrella.webp","ar":0.596,"w":0.4,"x":0.74,"y":0.16},
    {"id":"s_flor","nombre":"Flor al Pelo","precio":90,"reqNivel":1,"rareza":"comun","img":"acc/flor.webp","ar":1.106,"w":0.3,"x":0.8,"y":0.18},
    {"id":"s_orejas_gato","nombre":"Orejitas de Michi","precio":180,"reqNivel":2,"rareza":"raro","img":"acc/orejas_gato.webp","ar":0.453,"w":1.0,"yb":0.24},
    {"id":"s_cuernos","nombre":"Cuernitos","precio":190,"reqNivel":2,"rareza":"raro","img":"acc/cuernos.webp","ar":0.46,"w":0.86,"yb":0.2},
    {"id":"s_detective","nombre":"Gorra Detective","precio":200,"reqNivel":2,"rareza":"raro","img":"acc/detective.webp","ar":0.694,"w":0.92,"yb":0.3},
    {"id":"s_vaquero","nombre":"Sombrero Vaquero","precio":180,"reqNivel":2,"rareza":"raro","img":"acc/vaquero.webp","ar":0.668,"w":1.12,"yb":0.3},
    {"id":"s_corona_flores","nombre":"Corona de Flores","precio":190,"reqNivel":2,"rareza":"raro","img":"acc/corona_flores.webp","ar":0.469,"w":1.0,"yb":0.24},
    {"id":"s_mono_lazo","nombre":"Lazo Vintage","precio":200,"reqNivel":2,"rareza":"raro","img":"acc/mono_lazo.webp","ar":0.494,"w":0.6,"x":0.5,"y":0.02},
    {"id":"s_auriculares","nombre":"Auris Gamer","precio":340,"reqNivel":4,"rareza":"epico","img":"acc/auriculares.webp","ar":1.009,"w":1.16,"y":0.44},
    {"id":"s_aureola","nombre":"Aureola","precio":350,"reqNivel":4,"rareza":"epico","img":"acc/aureola.webp","ar":0.369,"w":0.8,"y":-0.06},
    {"id":"s_sombrero_bruja","nombre":"Sombrero de Bruja","precio":360,"reqNivel":4,"rareza":"epico","img":"acc/bruja.webp","ar":0.842,"w":1.02,"yb":0.3},
    {"id":"s_aviador","nombre":"Casco Aviador","precio":560,"reqNivel":6,"rareza":"legendario","img":"acc/aviador.webp","ar":1.014,"w":1.06,"yb":0.5},
    {"id":"s_corona_real","nombre":"Corona Real","precio":910,"reqNivel":8,"rareza":"mitico","img":"acc/corona.webp","ar":0.724,"w":0.66,"yb":0.2}
  ],
  lentes: [
    {"id":"l_redondos","nombre":"Lentes Redondos","precio":70,"reqNivel":1,"rareza":"comun","img":"acc/lentes_redondos.webp","ar":0.438,"w":0.8,"y":0.44},
    {"id":"l_finos","nombre":"Lentes de Lectura","precio":80,"reqNivel":1,"rareza":"comun","img":"acc/lentes_finos.webp","ar":0.294,"w":0.8,"y":0.46},
    {"id":"l_sol","nombre":"Lentes de Sol","precio":200,"reqNivel":2,"rareza":"raro","img":"acc/lentes_sol.webp","ar":0.398,"w":0.84,"y":0.44},
    {"id":"l_parche","nombre":"Parche Pirata","precio":180,"reqNivel":2,"rareza":"raro","img":"acc/parche.webp","ar":0.498,"w":0.84,"y":0.4},
    {"id":"l_monoculo","nombre":"Monóculo","precio":350,"reqNivel":4,"rareza":"epico","img":"acc/monoculo.webp","ar":1.234,"w":0.3,"x":0.66,"y":0.5},
    {"id":"l_antifaz","nombre":"Antifaz de Carnaval","precio":580,"reqNivel":6,"rareza":"legendario","img":"acc/antifaz.webp","ar":0.441,"w":0.86,"y":0.42}
  ],
  bigotes: [
    {"id":"b_bigote_castano","nombre":"Bigote Castaño","precio":70,"reqNivel":1,"rareza":"comun","img":"acc/bigote_castano.webp","ar":0.36,"w":0.5,"y":0.66},
    {"id":"b_bigote_gris","nombre":"Bigote Gris","precio":80,"reqNivel":1,"rareza":"comun","img":"acc/bigote_gris.webp","ar":0.35,"w":0.5,"y":0.66},
    {"id":"b_pipa","nombre":"Pipa del Abuelo","precio":360,"reqNivel":4,"rareza":"epico","img":"acc/pipa.webp","ar":0.8,"w":0.42,"x":0.72,"y":0.76}
  ],
  caras: [
    {"id":"c_rubor","nombre":"Cachetes Rosados","precio":70,"reqNivel":1,"rareza":"comun","img":"acc/rubor.webp","ar":0.566,"w":0.3,"y":0.62,"doble":true},
    {"id":"c_pecas","nombre":"Pecas","precio":80,"reqNivel":1,"rareza":"comun","img":"acc/pecas.webp","ar":0.511,"w":0.56,"y":0.56},
    {"id":"c_lunar","nombre":"Lunar","precio":90,"reqNivel":1,"rareza":"comun","img":"acc/lunar.webp","ar":1.0,"w":0.07,"x":0.7,"y":0.66},
    {"id":"c_curita","nombre":"Curita","precio":70,"reqNivel":1,"rareza":"comun","img":"acc/curita.webp","ar":0.985,"w":0.3,"x":0.28,"y":0.62},
    {"id":"c_curitas","nombre":"Curitas Cruzadas","precio":190,"reqNivel":2,"rareza":"raro","img":"acc/curitas.webp","ar":1.0,"w":0.32,"x":0.72,"y":0.64},
    {"id":"c_cicatriz","nombre":"Cicatriz","precio":200,"reqNivel":2,"rareza":"raro","img":"acc/cicatriz.webp","ar":1.157,"w":0.26,"x":0.3,"y":0.36},
    {"id":"c_cicatrices","nombre":"Arañazo","precio":340,"reqNivel":4,"rareza":"epico","img":"acc/cicatrices.webp","ar":1.203,"w":0.32,"x":0.7,"y":0.4}
  ],
  cuellos: [
    {"id":"k_mono_negro","nombre":"Moño de Gala","precio":70,"reqNivel":1,"rareza":"comun","img":"acc/mono_negro.webp","ar":0.553,"w":0.42,"y":0.97},
    {"id":"k_monito","nombre":"Moñito Lila","precio":80,"reqNivel":1,"rareza":"comun","img":"acc/monito_violeta.webp","ar":0.574,"w":0.42,"y":0.97},
    {"id":"k_panuelo","nombre":"Pañuelo","precio":200,"reqNivel":2,"rareza":"raro","img":"acc/panuelo.webp","ar":0.824,"w":0.56,"y":0.96},
    {"id":"k_corbata","nombre":"Corbata","precio":180,"reqNivel":2,"rareza":"raro","img":"acc/corbata.webp","ar":1.556,"w":0.34,"y":1.0},
    {"id":"k_medalla","nombre":"Medalla de Oro","precio":350,"reqNivel":4,"rareza":"epico","img":"acc/medalla.webp","ar":1.231,"w":0.3,"y":0.98},
    {"id":"k_sheriff","nombre":"Condecoración","precio":580,"reqNivel":6,"rareza":"legendario","img":"acc/estrella_sheriff.webp","ar":1.983,"w":0.26,"y":1.0}
  ],
  espaldas: [
    {"id":"w_alas_angel","nombre":"Alas de Ángel","precio":340,"reqNivel":4,"rareza":"epico","img":"acc/alas_angel.webp","ar":0.57,"w":1.62,"y":0.5},
    {"id":"w_alas_murcielago","nombre":"Alas de Murciélago","precio":350,"reqNivel":4,"rareza":"epico","img":"acc/alas_murcielago.webp","ar":0.359,"w":1.72,"y":0.44},
    {"id":"w_espadas","nombre":"Espadas Cruzadas","precio":580,"reqNivel":6,"rareza":"legendario","img":"acc/espadas.webp","ar":0.966,"w":1.36,"y":0.5},
    {"id":"w_rayos","nombre":"Electrizado","precio":900,"reqNivel":8,"rareza":"mitico","img":"acc/rayos.webp","ar":0.707,"w":1.6,"y":0.5}
  ],
  pins: [
    {"id":"p_corazon","nombre":"Corazón","precio":70,"reqNivel":1,"rareza":"comun","img":"acc/corazon.webp","ar":0.875},
    {"id":"p_estrella","nombre":"Estrella","precio":80,"reqNivel":1,"rareza":"comun","img":"acc/estrella.webp","ar":0.989},
    {"id":"p_hoja","nombre":"Hojita","precio":90,"reqNivel":1,"rareza":"comun","img":"acc/hoja.webp","ar":1.255},
    {"id":"p_gota","nombre":"Gota","precio":70,"reqNivel":1,"rareza":"comun","img":"acc/gota.webp","ar":1.425},
    {"id":"p_rayo","nombre":"Rayo","precio":190,"reqNivel":2,"rareza":"raro","img":"acc/rayo.webp","ar":1.558},
    {"id":"p_trebol","nombre":"Trébol de la Suerte","precio":200,"reqNivel":2,"rareza":"raro","img":"acc/trebol.webp","ar":1.212},
    {"id":"p_notas","nombre":"Notas Musicales","precio":180,"reqNivel":2,"rareza":"raro","img":"acc/notas.webp","ar":1.255},
    {"id":"p_destello","nombre":"Destello","precio":190,"reqNivel":2,"rareza":"raro","img":"acc/destello.webp","ar":1.036},
    {"id":"p_brillo","nombre":"Brillo Dorado","precio":200,"reqNivel":2,"rareza":"raro","img":"acc/brillo.webp","ar":1.016},
    {"id":"p_varita","nombre":"Varita Mágica","precio":340,"reqNivel":4,"rareza":"epico","img":"acc/varita.webp","ar":1.044},
    {"id":"p_placa","nombre":"Placa de Sheriff","precio":350,"reqNivel":4,"rareza":"epico","img":"acc/placa_sheriff.webp","ar":1.131},
    {"id":"p_gema_verde","nombre":"Gema Esmeralda","precio":360,"reqNivel":4,"rareza":"epico","img":"acc/gema_verde.webp","ar":1.462},
    {"id":"p_gema_violeta","nombre":"Gema Amatista","precio":340,"reqNivel":4,"rareza":"epico","img":"acc/gema_violeta.webp","ar":1.033},
    {"id":"p_broche","nombre":"Broche Antiguo","precio":570,"reqNivel":6,"rareza":"legendario","img":"acc/broche_esmeralda.webp","ar":1.085},
    {"id":"p_broche_gema","nombre":"Joya Arcoíris","precio":920,"reqNivel":8,"rareza":"mitico","img":"acc/broche_gema.webp","ar":1.165}
  ],
  marcos: [
    {"id":"mk_plata","nombre":"Plata","precio":70,"reqNivel":1,"rareza":"comun","img":"marcos/mk_plata.webp"},
    {"id":"mk_oro_fino","nombre":"Oro Fino","precio":80,"reqNivel":1,"rareza":"comun","img":"marcos/mk_oro_fino.webp"},
    {"id":"mk_neon_cian","nombre":"Neón Cian","precio":90,"reqNivel":1,"rareza":"comun","img":"marcos/mk_neon_cian.webp"},
    {"id":"mk_soga","nombre":"Soga","precio":70,"reqNivel":1,"rareza":"comun","img":"marcos/mk_soga.webp"},
    {"id":"mk_cadena","nombre":"Cadena","precio":80,"reqNivel":1,"rareza":"comun","img":"marcos/mk_cadena.webp"},
    {"id":"mk_pixel","nombre":"Pixel","precio":90,"reqNivel":1,"rareza":"comun","img":"marcos/mk_pixel.webp"},
    {"id":"mk_geometrico","nombre":"Geométrico","precio":70,"reqNivel":1,"rareza":"comun","img":"marcos/mk_geometrico.webp"},
    {"id":"mk_hielo","nombre":"Hielo","precio":80,"reqNivel":1,"rareza":"comun","img":"marcos/mk_hielo.webp"},
    {"id":"mk_trenza","nombre":"Trenza","precio":200,"reqNivel":2,"rareza":"raro","img":"marcos/mk_trenza.webp"},
    {"id":"mk_neon_doble","nombre":"Neón Doble","precio":180,"reqNivel":2,"rareza":"raro","img":"marcos/mk_neon_doble.webp"},
    {"id":"mk_holo_puntos","nombre":"Holograma","precio":190,"reqNivel":2,"rareza":"raro","img":"marcos/mk_holo_puntos.webp"},
    {"id":"mk_ramas","nombre":"Ramas","precio":200,"reqNivel":2,"rareza":"raro","img":"marcos/mk_ramas.webp"},
    {"id":"mk_enredadera","nombre":"Enredadera","precio":180,"reqNivel":2,"rareza":"raro","img":"marcos/mk_enredadera.webp"},
    {"id":"mk_espinas","nombre":"Espinas","precio":190,"reqNivel":2,"rareza":"raro","img":"marcos/mk_espinas.webp"},
    {"id":"mk_ramas_secas","nombre":"Otoño","precio":200,"reqNivel":2,"rareza":"raro","img":"marcos/mk_ramas_secas.webp"},
    {"id":"mk_orbitas","nombre":"Órbitas","precio":180,"reqNivel":2,"rareza":"raro","img":"marcos/mk_orbitas.webp"},
    {"id":"mk_rosado_diamante","nombre":"Oro Rosa","precio":350,"reqNivel":4,"rareza":"epico","img":"marcos/mk_rosado_diamante.webp"},
    {"id":"mk_plata_puntas","nombre":"Plata Estelar","precio":360,"reqNivel":4,"rareza":"epico","img":"marcos/mk_plata_puntas.webp"},
    {"id":"mk_circuito","nombre":"Circuito","precio":340,"reqNivel":4,"rareza":"epico","img":"marcos/mk_circuito.webp"},
    {"id":"mk_orbita_azul","nombre":"Órbita Azul","precio":350,"reqNivel":4,"rareza":"epico","img":"marcos/mk_orbita_azul.webp"},
    {"id":"mk_laureles","nombre":"Laureles","precio":360,"reqNivel":4,"rareza":"epico","img":"marcos/mk_laureles.webp"},
    {"id":"mk_flores_doradas","nombre":"Flores Doradas","precio":340,"reqNivel":4,"rareza":"epico","img":"marcos/mk_flores_doradas.webp"},
    {"id":"mk_luna","nombre":"Luna","precio":350,"reqNivel":4,"rareza":"epico","img":"marcos/mk_luna.webp"},
    {"id":"mk_constelaciones","nombre":"Constelaciones","precio":360,"reqNivel":4,"rareza":"epico","img":"marcos/mk_constelaciones.webp"},
    {"id":"mk_burbujas","nombre":"Burbujas","precio":340,"reqNivel":4,"rareza":"epico","img":"marcos/mk_burbujas.webp"},
    {"id":"mk_ola","nombre":"Marea","precio":350,"reqNivel":4,"rareza":"epico","img":"marcos/mk_ola.webp"},
    {"id":"mk_diamantes","nombre":"Diamantes","precio":580,"reqNivel":6,"rareza":"legendario","img":"marcos/mk_diamantes.webp"},
    {"id":"mk_chispas_violeta","nombre":"Chispas Lila","precio":560,"reqNivel":6,"rareza":"legendario","img":"marcos/mk_chispas_violeta.webp"},
    {"id":"mk_halo_violeta","nombre":"Halo Lila","precio":570,"reqNivel":6,"rareza":"legendario","img":"marcos/mk_halo_violeta.webp"},
    {"id":"mk_torbellino","nombre":"Torbellino","precio":580,"reqNivel":6,"rareza":"legendario","img":"marcos/mk_torbellino.webp"},
    {"id":"mk_polvo_estelar","nombre":"Polvo Estelar","precio":560,"reqNivel":6,"rareza":"legendario","img":"marcos/mk_polvo_estelar.webp"},
    {"id":"mk_alado","nombre":"Alado","precio":570,"reqNivel":6,"rareza":"legendario","img":"marcos/mk_alado.webp"},
    {"id":"mk_nebulosa","nombre":"Nebulosa","precio":920,"reqNivel":8,"rareza":"mitico","img":"marcos/mk_nebulosa.webp"},
    {"id":"mk_planeta","nombre":"Planeta","precio":900,"reqNivel":8,"rareza":"mitico","img":"marcos/mk_planeta.webp"},
    {"id":"mk_runas","nombre":"Runas","precio":910,"reqNivel":8,"rareza":"mitico","img":"marcos/mk_runas.webp"},
    {"id":"mk_fuego","nombre":"Anillo de Fuego","precio":920,"reqNivel":8,"rareza":"mitico","img":"marcos/mk_fuego.webp"}
  ],
  fondos: [
    {"id":"fd_none","nombre":"Sin fondo","precio":0,"reqNivel":1,"rareza":"comun"},
    {"id":"fd_selva","nombre":"Selva Perdida","precio":110,"reqNivel":1,"rareza":"comun","img":"fondos/fd_selva.webp"},
    {"id":"fd_sabana","nombre":"Sabana","precio":120,"reqNivel":1,"rareza":"comun","img":"fondos/fd_sabana.webp"},
    {"id":"fd_oeste","nombre":"Salvaje Oeste","precio":130,"reqNivel":1,"rareza":"comun","img":"fondos/fd_oeste.webp"},
    {"id":"fd_oceano","nombre":"Fondo del Mar","precio":220,"reqNivel":2,"rareza":"raro","img":"fondos/fd_oceano.webp"},
    {"id":"fd_hielo","nombre":"Cueva de Hielo","precio":230,"reqNivel":2,"rareza":"raro","img":"fondos/fd_hielo.webp"},
    {"id":"fd_volcan","nombre":"Volcán","precio":240,"reqNivel":2,"rareza":"raro","img":"fondos/fd_volcan.webp"},
    {"id":"fd_piratas","nombre":"Bahía Pirata","precio":380,"reqNivel":4,"rareza":"epico","img":"fondos/fd_piratas.webp"},
    {"id":"fd_concierto","nombre":"Concierto","precio":390,"reqNivel":4,"rareza":"epico","img":"fondos/fd_concierto.webp"},
    {"id":"fd_arcade","nombre":"Arcade Retro","precio":400,"reqNivel":4,"rareza":"epico","img":"fondos/fd_arcade.webp"},
    {"id":"fd_steampunk","nombre":"Steampunk","precio":600,"reqNivel":6,"rareza":"legendario","img":"fondos/fd_steampunk.webp"},
    {"id":"fd_magia","nombre":"Academia de Magia","precio":610,"reqNivel":6,"rareza":"legendario","img":"fondos/fd_magia.webp"},
    {"id":"fd_electrico","nombre":"Ciudad Eléctrica","precio":620,"reqNivel":6,"rareza":"legendario","img":"fondos/fd_electrico.webp"},
    {"id":"fd_galaxia","nombre":"Galaxia","precio":940,"reqNivel":8,"rareza":"mitico","img":"fondos/fd_galaxia.webp"}
  ]
};

// Base de las imágenes, relativa a este archivo (sirve desde index, pages/ y pages/games/)
const TIENDA_BASE = (function () {
  try { return new URL("../assets/tienda/", document.currentScript.src).href; } catch (e) { return "assets/tienda/"; }
})();
(function fusionarTiendaIlustrada() {
  const T = window.TIENDA_ILUSTRADA, A = window.ACCESORIOS;
  // Los ítems viejos (dibujos SVG / aros CSS) se dejan de vender, pero quien los compró los sigue teniendo.
  for (const k of ["sombreros", "lentes", "bigotes", "marcos"]) {
    A[k].forEach(it => { if (it.precio > 0) it.legacy = true; });
    A[k] = [A[k][0], ...T[k], ...A[k].slice(1)];
  }
  A.caras    = [{ id: "c_none", nombre: "Nada", precio: 0, reqNivel: 1, rareza: "comun" }, ...T.caras];
  A.cuellos  = [{ id: "k_none", nombre: "Nada", precio: 0, reqNivel: 1, rareza: "comun" }, ...T.cuellos];
  A.espaldas = [{ id: "w_none", nombre: "Nada", precio: 0, reqNivel: 1, rareza: "comun" }, ...T.espaldas];
  A.pins     = [{ id: "p_none", nombre: "Sin pin", precio: 0, reqNivel: 1, rareza: "comun" }, ...T.pins];
  A.fondos   = T.fondos;
})();
const ACCESORIOS = window.ACCESORIOS;

const _ACC_IDX = {};
function itemDe(lista, id) {
  const key = lista + ":" + id;
  if (!(key in _ACC_IDX)) _ACC_IDX[key] = (ACCESORIOS[lista] || []).find(a => a.id === id) || null;
  return _ACC_IDX[key];
}
function urlTienda(it) { return it && it.img ? TIENDA_BASE + it.img : ""; }

// Capa de imagen de un accesorio ilustrado. def = colocación por defecto del slot.
function capaImg(it, size, def, z, calib, offY, sc) {
  const w = (it.w ?? def.w) * size;
  const h = w * (it.ar || 1);
  const cx = (it.x ?? def.x ?? 0.5) * size;
  let top = it.yb != null ? it.yb * size - h : (it.y ?? def.y) * size - h / 2;
  if (calib) top += offY;
  const t = calib ? ` scale(${sc})` : "";
  const sombra = size >= 40 ? "filter:drop-shadow(0 2px 3px rgba(0,0,0,0.45));" : "";
  const una = x => `<img src="${urlTienda(it)}" alt="" draggable="false" style="position:absolute;left:${(x - w / 2).toFixed(1)}px;top:${top.toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;transform:${t || "none"};pointer-events:none;max-width:none;max-height:none;z-index:${z};${sombra}">`;
  return it.doble ? una(size * 0.26) + una(size * 0.74) : una(cx);
}

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
  const marcoAcc    = itemDe("marcos", acc.marco);
  const efectoAcc   = itemDe("efectos", acc.efecto);
  const img = (lista, id) => { const it = itemDe(lista, id); return it && it.img ? it : null; };
  const iSombrero = img("sombreros", acc.sombrero), iLentes = img("lentes", acc.lentes), iBoca = img("bigotes", acc.bigote);
  const iCara = img("caras", acc.cara), iCuello = img("cuellos", acc.cuello), iEspalda = img("espaldas", acc.espalda), iPin = img("pins", acc.pin);

  const offY = Math.max(-25, Math.min(25, Number(acc.offsetY) || 0)) * (size / 80);
  const sc   = Math.max(0.75, Math.min(1.35, (Number(acc.scale) || 100) / 100));

  const auraStyle  = efectoAcc?.css || "";
  const marcoImg   = marcoAcc && marcoAcc.img;
  const marcoStyle = marcoImg ? "" : (marcoAcc?.css || "box-shadow:0 0 0 2px rgba(255,255,255,0.14);");
  const innerContent = foto
    ? `<img src="${foto}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block">`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">${svgBase}</div>`;
  const mk = size * 1.3;

  return `<div class="av-plato-wrap" style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;flex-shrink:0;vertical-align:middle;overflow:visible !important;">
    ${iEspalda ? capaImg(iEspalda, size, { w: 1.6, y: 0.5 }, 0, false) : ""}
    ${auraStyle ? `<div class="av-aura-layer" style="position:absolute;inset:-4px;border-radius:50%;pointer-events:none;z-index:1;${auraStyle}"></div>` : ""}
    <div class="av-frame-ring" style="position:relative;z-index:1;width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#131722;${marcoStyle}">
      <div style="width:100%;height:100%;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;">
        ${innerContent}
      </div>
    </div>
    ${marcoImg ? `<img src="${urlTienda(marcoAcc)}" alt="" draggable="false" style="position:absolute;left:${((size - mk) / 2).toFixed(1)}px;top:${((size - mk) / 2).toFixed(1)}px;width:${mk.toFixed(1)}px;height:${mk.toFixed(1)}px;max-width:none;max-height:none;pointer-events:none;z-index:2">` : ""}
    ${iCara ? capaImg(iCara, size, { w: 0.3, y: 0.62 }, 3, true, offY, sc) : ""}
    ${iBoca ? capaImg(iBoca, size, { w: 0.5, y: 0.66 }, 4, true, offY, sc) : ""}
    ${iLentes ? capaImg(iLentes, size, { w: 0.8, y: 0.44 }, 5, true, offY, sc) : ""}
    ${iCuello ? capaImg(iCuello, size, { w: 0.42, y: 0.97 }, 5, false) : ""}
    ${iSombrero ? capaImg(iSombrero, size, { w: 0.9, y: 0.05 }, 6, true, offY, sc) : ""}
    ${iPin ? capaImg(iPin, size, { w: 0.34, x: 0.13, y: 0.86 }, 7, false) : ""}
    ${!iSombrero && svgSombrero ? `<div style="position:absolute;top:${Math.round(-size * 0.36 + offY)}px;left:50%;width:${Math.round(size * 0.95)}px;transform:translateX(-50%) scale(${sc});pointer-events:none;z-index:6;filter:drop-shadow(0 3px 5px rgba(0,0,0,0.6))">${svgSombrero}</div>` : ""}
    ${!iLentes && svgLentes ? `<div style="position:absolute;top:${Math.round(size * 0.18 + offY)}px;left:50%;width:${Math.round(size * 0.86)}px;transform:translateX(-50%) scale(${sc});pointer-events:none;z-index:5;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.55))">${svgLentes}</div>` : ""}
    ${!iBoca && svgBoca ? `<div style="position:absolute;bottom:${Math.round(-size * 0.14 - offY * 0.5)}px;left:50%;width:${Math.round(size * 0.76)}px;transform:translateX(-50%) scale(${sc});pointer-events:none;z-index:4;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6))">${svgBoca}</div>` : ""}
    ${svgMascota ? `<div class="av-pet-float" style="position:absolute;bottom:${Math.round(-size * 0.14)}px;right:${Math.round(-size * 0.24)}px;width:${Math.round(size * 0.52)}px;height:${Math.round(size * 0.52)}px;pointer-events:none;z-index:8;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.7))">${svgMascota}</div>` : ""}
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

// URL del fondo (banner) de perfil equipado, o "" si no tiene.
function urlFondoPerfil(accesorios = {}) {
  const it = itemDe("fondos", accesorios?.fondo || "fd_none");
  return urlTienda(it);
}
window.urlFondoPerfil = urlFondoPerfil;
window.urlItemTienda = urlTienda;

function getChatBubbleCSS(accesorios = {}) {
  const id = accesorios?.burbuja || "chat_default";
  const b = ACCESORIOS.burbujas.find(x => x.id === id) || ACCESORIOS.burbujas[0];
  return b.css;
}
window.getChatBubbleCSS = getChatBubbleCSS;
