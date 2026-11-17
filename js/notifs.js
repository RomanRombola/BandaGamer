// notifs.js — Notificaciones sociales globales de BandaGamer
// ─────────────────────────────────────────────────────────────────────────────
// Se usa en el index, en la página de juego y en la página social.
//  · Contador en el header (elementos con [data-social-badge]) y en el título de la pestaña
//  · Toasts clickeables cuando llega algo NUEVO después de cargar la página:
//    solicitudes de amistad, invitaciones a jugar, mensajes de chat y de grupos.
// Requiere social.js cargado antes.
// ─────────────────────────────────────────────────────────────────────────────
const Notifs = (() => {
  const estado = { req: 0, inv: 0, chat: 0, grp: 0 };
  const unsubs = [];
  const oyentes = [];
  let uid = null;
  const BASE = location.pathname.includes('/pages/') ? (location.pathname.includes('/pages/games/') ? '../../' : '../') : '';
  const enSocial = () => location.pathname.endsWith('/social.html');
  const ms = ts => (ts && typeof ts.toMillis === 'function') ? ts.toMillis() : (typeof ts === 'number' ? ts : 0);
  const tituloBase = () => document.title.replace(/^\(\d+\+?\)\s/, '');

  function pintar() {
    const total = estado.req + estado.inv + estado.chat + estado.grp;
    document.querySelectorAll('[data-social-badge]').forEach(b => {
      b.textContent = total > 99 ? '99+' : String(total);
      b.style.display = total ? '' : 'none';
    });
    document.title = total ? `(${total > 99 ? '99+' : total}) ${tituloBase()}` : tituloBase();
    oyentes.forEach(fn => { try { fn(Object.assign({ total }, estado)); } catch (e) { } });
  }

  // Toast arriba a la derecha. url relativa a la raíz del sitio (ej. 'pages/social.html').
  function toast(texto, url) {
    let host = document.getElementById('social-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'social-toast-host';
      host.style.cssText = 'position:fixed;top:76px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;max-width:calc(100vw - 32px)';
      document.body.appendChild(host);
    }
    if (!document.getElementById('social-toast-style')) {
      const s = document.createElement('style');
      s.id = 'social-toast-style';
      s.textContent = '@keyframes slideInToast{from{transform:translateX(110%);opacity:0}to{transform:none;opacity:1}}@keyframes fadeOutToast{to{transform:translateX(110%);opacity:0}}' +
        '.social-toast{background:linear-gradient(135deg,#17172c,#22224a);border:1px solid rgba(0,170,255,.4);color:#fff;padding:12px 16px;border-radius:12px;font-family:Rajdhani,sans-serif;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.5),0 0 14px rgba(0,170,255,.15);cursor:pointer;pointer-events:auto;max-width:340px;animation:slideInToast .3s ease;line-height:1.3}' +
        '.social-toast:hover{border-color:rgba(255,102,0,.6)}';
      document.head.appendChild(s);
    }
    const t = document.createElement('div');
    t.className = 'social-toast';
    t.textContent = texto;
    t.addEventListener('click', () => { if (url) location.href = BASE + url; t.remove(); });
    host.appendChild(t);
    setTimeout(() => { t.style.animation = 'fadeOutToast .3s ease forwards'; setTimeout(() => t.remove(), 320); }, 6000);
  }

  function detener() {
    unsubs.splice(0).forEach(fn => { try { fn(); } catch (e) { } });
    uid = null;
    estado.req = estado.inv = estado.chat = estado.grp = 0;
    pintar();
  }

  function iniciar(nuevoUid) {
    if (!nuevoUid || typeof Social === 'undefined') return;
    if (uid === nuevoUid) return;            // ya escuchando para este usuario
    detener();
    uid = nuevoUid;
    try {
      // Solicitudes de amistad
      let reqsVistas = null;
      unsubs.push(Social.onSolicitudesEntrantes(reqs => {
        estado.req = reqs.length; pintar();
        if (reqsVistas !== null && !enSocial()) reqs.filter(r => !reqsVistas.has(r.uid)).forEach(r => toast(`👥 ${r.nombre || 'Alguien'} te envió una solicitud de amistad`, 'pages/social.html'));
        reqsVistas = new Set(reqs.map(r => r.uid));
      }));
      // Invitaciones a jugar
      let invVistas = null;
      unsubs.push(Social.onInvitaciones(invs => {
        estado.inv = invs.length; pintar();
        if (invVistas !== null && !enSocial()) invs.filter(i => !invVistas.has(i.id)).forEach(i => toast(`🎮 ${i.fromNombre || 'Alguien'} te invita a jugar ${i.juegoNombre || ''}`, 'pages/social.html'));
        invVistas = new Set(invs.map(i => i.id));
      }));
      // Chats 1 a 1 (campo unread_<uid> que escribe social.js)
      let chatsVistos = null;
      unsubs.push(Social.onChatsActivos(chats => {
        estado.chat = (chats || []).reduce((n, c) => n + Math.min(99, c['unread_' + uid] || 0), 0); pintar();
        if (chatsVistos !== null && !enSocial() && !window.__chatRapidoAbierto) {
          (chats || []).forEach(c => {
            if (ms(c.lastAt) > (chatsVistos[c.id] || 0) && c.lastSenderUid && c.lastSenderUid !== uid)
              toast(`💬 ${c.lastSenderNombre || 'Amigo'}: ${String(c.lastMessage || '(mensaje)').slice(0, 80)}`, 'pages/social.html#chat');
          });
        }
        chatsVistos = {}; (chats || []).forEach(c => { chatsVistos[c.id] = ms(c.lastAt); });
      }));
      // Grupos
      if (Social.onGrupos) {
        let grpVistos = null;
        unsubs.push(Social.onGrupos(grupos => {
          estado.grp = (grupos || []).reduce((n, g) => n + Math.min(99, g['unread_' + uid] || 0), 0); pintar();
          if (grpVistos !== null && !enSocial()) {
            (grupos || []).forEach(g => {
              if (ms(g.lastAt) > (grpVistos[g.id] || 0) && g.lastSenderUid && g.lastSenderUid !== uid)
                toast(`${g.emoji || '👥'} ${g.nombre}: ${g.lastSenderNombre || ''}: ${String(g.lastMessage || '').slice(0, 70)}`, 'pages/social.html#grupos');
            });
          }
          grpVistos = {}; (grupos || []).forEach(g => { grpVistos[g.id] = ms(g.lastAt); });
        }));
      }
    } catch (e) { console.warn('[Notifs]', e); }
  }

  return {
    iniciar, detener, toast,
    onChange(fn) { oyentes.push(fn); },
    get estado() { return Object.assign({ total: estado.req + estado.inv + estado.chat + estado.grp }, estado); },
  };
})();
window.Notifs = Notifs;
