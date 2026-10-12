// social.js — Sistema social V3 BandaGamer
// Firestore: perfiles, amigos, solicitudes, historial de chat
// Realtime DB: presencia online, salas de juego
// ─────────────────────────────────────────────────────────────────────────────

const _rtdb = firebase.database();

// ── Colecciones Firestore ─────────────────────────────────────────────────
// /users/{uid}                     → perfil público
// /friendRequests/{uid}/incoming   → solicitudes recibidas
// /friendRequests/{uid}/outgoing   → solicitudes enviadas
// /friends/{uid}/list/{friendUid}  → lista de amigos
// /chats/{chatId}/messages         → mensajes (chatId = uid1_uid2 ordenados)
// /gameInvites/{uid}/pending       → invitaciones a juegos
// Realtime DB:
// /presence/{uid}                  → { online, lastSeen, displayName, jugandoA, juegoId, roomId }
// /gameRooms/{roomId}              → sala de juego

const MAX_MENSAJE        = 500;            // caracteres por mensaje
const INVITE_TTL_MS      = 2 * 60 * 60 * 1000; // las invitaciones vencen a las 2 h

// ── Usuario actual ────────────────────────────────────────────────────────
// Antes _currentUid solo se seteaba en initPresence(), y si una página no lo
// llamaba (o fallaba antes) TODAS las funciones sociales quedaban inertes.
// Ahora sigue directamente a Firebase Auth.
let _currentUid = null;
firebase.auth().onAuthStateChanged(u => {
  _currentUid = u ? u.uid : null;
  if (!u) Social_goOffline();
});

// ── Presencia online ──────────────────────────────────────────────────────
let _presenceRef   = null;
let _presenceUid   = null;
let _connRef       = null;
let _connHandler   = null;
let _presenceName  = 'Usuario';

// Estado "jugando" recordado en memoria: si setJugando() se llama antes de que la
// presencia esté lista, o si hay una reconexión, no se pierde.
let _estadoJuego = { jugandoA: null, juegoId: null, roomId: null };

function _presenciaBase(extra) {
  return Object.assign({
    online:      true,
    lastSeen:    firebase.database.ServerValue.TIMESTAMP,
    displayName: _presenceName,
    jugandoA:    _estadoJuego.jugandoA,
    juegoId:     _estadoJuego.juegoId,
    roomId:      _estadoJuego.roomId
  }, extra || {});
}
// Lo que queda guardado si se corta la conexión: offline y sin juego
const _PRESENCIA_OFFLINE = { online: false, jugandoA: null, juegoId: null, roomId: null };

function Social_initPresence(uid, displayName) {
  if (!uid) return;
  _currentUid   = uid;                 // por si Auth todavía no notificó el cambio
  _presenceName = displayName || 'Usuario';

  // Idempotente: main.js/juego.html lo llaman cada vez que refrescan el perfil.
  // Antes cada llamada borraba la presencia y sumaba otro listener a .info/connected.
  if (_presenceRef && _presenceUid === uid) {
    _presenceRef.update({ displayName: _presenceName }).catch(() => {});
    return;
  }

  Social_goOffline();                       // limpia la sesión anterior si cambió el usuario
  _presenceUid = uid;
  _presenceRef = _rtdb.ref(`presence/${uid}`);
  _connRef     = _rtdb.ref('.info/connected');

  const ref = _presenceRef;
  _connHandler = _connRef.on('value', snap => {
    if (!snap.val()) return;
    ref.onDisconnect().set(_presenciaBase(_PRESENCIA_OFFLINE)).then(() => {
      ref.set(_presenciaBase());
    }).catch(e => console.warn('[Presence]', e.message));
  });
}

// Actualiza el estado "estoy jugando a X" para que los amigos lo vean
function Social_setJugando(juegoNombre, juegoId, roomId) {
  _estadoJuego = { jugandoA: juegoNombre || null, juegoId: juegoId || null, roomId: roomId || null };
  if (!_presenceRef) return;     // se aplicará solo cuando initPresence cree la referencia
  _presenceRef.update(Object.assign({ lastSeen: firebase.database.ServerValue.TIMESTAMP }, _estadoJuego)).catch(() => {});
}

function Social_clearJugando() {
  _estadoJuego = { jugandoA: null, juegoId: null, roomId: null };
  if (!_presenceRef) return;
  _presenceRef.update(Object.assign({ lastSeen: firebase.database.ServerValue.TIMESTAMP }, _estadoJuego)).catch(() => {});
}

function Social_goOffline() {
  // Dejar de escuchar la conexión: si no, al reconectar volvería a marcarse "online"
  if (_connRef && _connHandler) { _connRef.off('value', _connHandler); }
  _connRef = null; _connHandler = null;
  if (_presenceRef) {
    const ref = _presenceRef;
    ref.onDisconnect().cancel();
    ref.set(_presenciaBase(_PRESENCIA_OFFLINE)).catch(() => {});
  }
  _presenceRef = null;
  _presenceUid = null;
}

// ── Buscar usuarios ───────────────────────────────────────────────────────
async function Social_buscarUsuarios(query) {
  query = (query || '').trim();
  if (query.length < 2) return [];
  const q = query.toLowerCase();
  const results = [];
  const seen = new Set();

  try {
    // Búsqueda principal en colección users (perfil público)
    const snap = await _db.collection('users')
      .where('nombre_lower', '>=', q)
      .where('nombre_lower', '<=', q + '\uf8ff')
      .limit(20)
      .get();
    snap.forEach(doc => {
      if (doc.id !== _currentUid && !seen.has(doc.id)) {
        seen.add(doc.id);
        results.push({ uid: doc.id, ...doc.data() });
      }
    });
  } catch (e) {
    console.warn('[Social] Búsqueda en users falló:', e.message);
  }

  // Respaldo: buscar también en el ranking público (los usuarios viejos que todavía no tienen
  // perfil en users/ sí suelen estar ahí). Coincide en cualquier parte del nombre.
  if (results.length < 15) {
    try {
      const snap = await _db.collection('ranking').orderBy('xp', 'desc').limit(300).get();
      snap.forEach(doc => {
        const d = doc.data() || {};
        const uid = d.uid || doc.id;
        if (uid === _currentUid || seen.has(uid)) return;
        if (String(d.nombre || '').toLowerCase().includes(q)) {
          seen.add(uid);
          results.push({ uid, nombre: d.nombre, avatar: d.avatar, nivel: d.nivel, xp: d.xp });
        }
      });
    } catch (e) {
      console.warn('[Social] Búsqueda en ranking falló:', e.message);
    }
  }

  return results.slice(0, 15);
}

// ── Solicitudes de amistad ────────────────────────────────────────────────
async function Social_enviarSolicitud(toUid) {
  if (!_currentUid) return { error: 'No autenticado' };
  if (!toUid || toUid === _currentUid) return { error: 'Usuario inválido' };

  try {
    // Evitar duplicados / estados inconsistentes
    const estado = await Social_estadoAmistad(toUid);
    if (estado === 'friends')     return { error: 'Ya son amigos' };
    if (estado === 'pending_out') return { error: 'Ya enviaste una solicitud' };
    if (estado === 'pending_in') {
      // La otra persona ya me había enviado una: aceptar directamente
      await Social_aceptarSolicitud(toUid);
      return { ok: true, aceptada: true };
    }

    const myDoc  = await _db.collection('users').doc(_currentUid).get();
    const myData = myDoc.data() || {};
    const ts     = firebase.firestore.FieldValue.serverTimestamp();

    // Ambas escrituras en un batch: o quedan las dos o ninguna
    const batch = _db.batch();
    batch.set(
      _db.collection('friendRequests').doc(_currentUid).collection('outgoing').doc(toUid),
      { uid: toUid, sentAt: ts, status: 'pending' }
    );
    batch.set(
      _db.collection('friendRequests').doc(toUid).collection('incoming').doc(_currentUid),
      { uid: _currentUid, nombre: myData.nombre || 'Usuario', avatar: myData.avatar || '😊', sentAt: ts, status: 'pending' }
    );
    await batch.commit();
    return { ok: true };
  } catch (e) {
    console.error('[Social] enviarSolicitud', e);
    return { error: e.message || 'Error al enviar' };
  }
}

async function Social_aceptarSolicitud(fromUid) {
  if (!_currentUid || !fromUid) return { error: 'No autenticado' };
  const batch = _db.batch();
  const ts = firebase.firestore.FieldValue.serverTimestamp();

  // Agregar a lista de amigos de ambos
  batch.set(_db.collection('friends').doc(_currentUid).collection('list').doc(fromUid), { uid: fromUid, since: ts });
  batch.set(_db.collection('friends').doc(fromUid).collection('list').doc(_currentUid), { uid: _currentUid, since: ts });

  // Eliminar solicitudes (en ambos sentidos, por si se cruzaron)
  batch.delete(_db.collection('friendRequests').doc(_currentUid).collection('incoming').doc(fromUid));
  batch.delete(_db.collection('friendRequests').doc(fromUid).collection('outgoing').doc(_currentUid));
  batch.delete(_db.collection('friendRequests').doc(_currentUid).collection('outgoing').doc(fromUid));
  batch.delete(_db.collection('friendRequests').doc(fromUid).collection('incoming').doc(_currentUid));

  await batch.commit();
  return { ok: true };
}

async function Social_rechazarSolicitud(fromUid) {
  if (!_currentUid || !fromUid) return;
  const batch = _db.batch();
  batch.delete(_db.collection('friendRequests').doc(_currentUid).collection('incoming').doc(fromUid));
  batch.delete(_db.collection('friendRequests').doc(fromUid).collection('outgoing').doc(_currentUid));
  await batch.commit();
}

async function Social_eliminarAmigo(friendUid) {
  if (!_currentUid || !friendUid) return;
  const batch = _db.batch();
  batch.delete(_db.collection('friends').doc(_currentUid).collection('list').doc(friendUid));
  batch.delete(_db.collection('friends').doc(friendUid).collection('list').doc(_currentUid));
  await batch.commit();
}

// ── Listeners de amigos ───────────────────────────────────────────────────
// Todos devuelven la función para des-suscribirse y registran un handler de
// error (antes un índice faltante o un permiso denegado fallaba en silencio).
function _onErr(nombre) {
  return e => console.warn(`[Social] listener ${nombre}:`, e && e.message);
}

function Social_onAmigos(callback) {
  if (!_currentUid) return () => {};
  return _db.collection('friends').doc(_currentUid).collection('list')
    .onSnapshot(snap => {
      const amigos = [];
      snap.forEach(doc => amigos.push({ uid: doc.id, ...doc.data() }));
      callback(amigos);
    }, _onErr('amigos'));
}

function Social_onSolicitudesEntrantes(callback) {
  if (!_currentUid) return () => {};
  return _db.collection('friendRequests').doc(_currentUid).collection('incoming')
    .where('status', '==', 'pending')
    .onSnapshot(snap => {
      const reqs = [];
      snap.forEach(doc => reqs.push({ uid: doc.id, ...doc.data() }));
      callback(reqs);
    }, _onErr('solicitudes'));
}

// ── Presencia de amigos ───────────────────────────────────────────────────
function Social_onPresenciaAmigos(uids, callback) {
  const listeners = [];
  const presenceMap = {};
  uids.forEach(uid => {
    const ref = _rtdb.ref(`presence/${uid}`);
    const fn = ref.on('value', snap => {
      presenceMap[uid] = snap.val() || { online: false };
      callback({ ...presenceMap });
    });
    listeners.push({ ref, fn });
  });
  return () => listeners.forEach(({ ref, fn }) => ref.off('value', fn));
}

// ── Chat 1-a-1 ────────────────────────────────────────────────────────────
function Social_getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

async function Social_enviarMensaje(toUid, texto) {
  if (!_currentUid || !toUid) return;
  texto = String(texto == null ? '' : texto).trim().slice(0, MAX_MENSAJE);
  if (!texto) return;

  const chatId = Social_getChatId(_currentUid, toUid);
  const myDoc  = await _db.collection('users').doc(_currentUid).get();
  const myData = myDoc.data() || {};
  const nombre = myData.nombre || 'Usuario';
  const ts     = firebase.firestore.FieldValue.serverTimestamp();

  const chatRef = _db.collection('chats').doc(chatId);
  const msgRef  = chatRef.collection('messages').doc();

  // Mensaje + metadata del chat en un único batch (antes eran dos escrituras sueltas)
  const batch = _db.batch();
  batch.set(msgRef, { from: _currentUid, fromNombre: nombre, texto, at: ts, leido: false });
  batch.set(chatRef, {
    participants:     [_currentUid, toUid],
    lastMessage:      texto.substring(0, 60),
    lastAt:           ts,
    lastSenderUid:    _currentUid,     // main.js los usa para las notificaciones globales
    lastSenderNombre: nombre,
    [`unread_${toUid}`]: firebase.firestore.FieldValue.increment(1)
  }, { merge: true });
  await batch.commit();
}

function Social_onMensajes(toUid, callback) {
  if (!_currentUid || !toUid) return () => {};
  const chatId = Social_getChatId(_currentUid, toUid);
  return _db.collection('chats').doc(chatId).collection('messages')
    .orderBy('at', 'asc')
    .limitToLast(60)
    .onSnapshot(snap => {
      const msgs = [];
      snap.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
      callback(msgs);
    }, _onErr('mensajes'));
}

async function Social_marcarLeido(toUid) {
  if (!_currentUid || !toUid) return;
  const chatId = Social_getChatId(_currentUid, toUid);
  const chatRef = _db.collection('chats').doc(chatId);
  try {
    const snap = await chatRef.collection('messages')
      .where('from', '==', toUid).where('leido', '==', false).limit(20).get();
    const batch = _db.batch();
    // update() (no set+merge): si el chat todavía no existe no creamos un doc huérfano
    batch.update(chatRef, { [`unread_${_currentUid}`]: 0 });
    snap.forEach(doc => batch.update(doc.ref, { leido: true }));
    await batch.commit();
  } catch (e) {
    // not-found = el chat aún no existe, no hay nada que marcar
    if (e.code !== 'not-found') console.warn('[Social] marcarLeido:', e.message);
  }
}

function Social_onChatsActivos(callback) {
  if (!_currentUid) return () => {};
  // Sin orderBy: array-contains + orderBy exige un índice compuesto que no está
  // creado, y la consulta fallaba en silencio. Ordenamos en el cliente.
  return _db.collection('chats')
    .where('participants', 'array-contains', _currentUid)
    .limit(30)
    .onSnapshot(snap => {
      const chats = [];
      snap.forEach(doc => chats.push({ id: doc.id, ...doc.data() }));
      const ms = c => (c.lastAt && c.lastAt.toMillis) ? c.lastAt.toMillis() : Number.MAX_SAFE_INTEGER; // pendiente = más nuevo
      chats.sort((a, b) => ms(b) - ms(a));
      callback(chats);
    }, _onErr('chats'));
}

// ── Invitaciones a juego ──────────────────────────────────────────────────
async function Social_invitarAJuego(friendUid, juegoId, juegoNombre) {
  if (!_currentUid || !friendUid || !juegoId) return;
  const myDoc  = await _db.collection('users').doc(_currentUid).get();
  const myData = myDoc.data() || {};
  const nombre = myData.nombre || 'Usuario';
  juegoNombre  = juegoNombre || 'Juego';   // Firestore rechaza valores undefined
  // Ya NO se crea una sala en RTDB: los juegos online (8 Ball, Ajedrez) manejan sus propios
  // códigos de sala y esa sala "falsa" nunca tenía anfitrión. La sala real se resuelve al
  // aceptar, leyendo la presencia del anfitrión (roomId).

  // Notificación via Firestore
  await _db.collection('gameInvites').doc(friendUid).collection('pending').add({
    from:       _currentUid,
    fromNombre: nombre,
    juegoId,
    juegoNombre,
    roomId:     null,
    at:         firebase.firestore.FieldValue.serverTimestamp()
  });

  return { ok: true };
}

function Social_onInvitaciones(callback) {
  if (!_currentUid) return () => {};
  return _db.collection('gameInvites').doc(_currentUid).collection('pending')
    .orderBy('at', 'desc')
    .limit(10)
    .onSnapshot(snap => {
      const ahora = Date.now();
      const invites = [];
      snap.forEach(doc => {
        const d = doc.data();
        const t = (d.at && d.at.toMillis) ? d.at.toMillis() : ahora; // pendiente = recién creada
        if (ahora - t > INVITE_TTL_MS) {
          doc.ref.delete().catch(() => {});   // limpiar invitaciones vencidas
          return;
        }
        invites.push({ id: doc.id, ...d });
      });
      callback(invites);
    }, _onErr('invitaciones'));
}

// Las invitaciones nunca se borraban: quedaban "pendientes" para siempre.
async function Social_borrarInvitacion(inviteId) {
  if (!_currentUid || !inviteId) return;
  try {
    await _db.collection('gameInvites').doc(_currentUid).collection('pending').doc(inviteId).delete();
  } catch (e) { console.warn('[Social] borrarInvitacion:', e.message); }
}

// Sala actual de un amigo según su presencia (para "unirse" a su partida)
async function Social_getSalaDeAmigo(friendUid) {
  try {
    const snap = await _rtdb.ref(`presence/${friendUid}`).once('value');
    const p = snap.val();
    if (p && p.online && p.roomId && p.juegoId) return { roomId: p.roomId, juegoId: p.juegoId, juegoNombre: p.jugandoA };
  } catch (e) {}
  return null;
}

// ── Perfil público ────────────────────────────────────────────────────────
async function Social_actualizarPerfilPublico(uid, data) {
  await _db.collection('users').doc(uid).set({
    nombre:       data.nombre || 'Usuario',
    nombre_lower: (data.nombre || 'usuario').toLowerCase(),
    nivel:        data.nivel  || 1,
    xp:           data.xp    || 0,
    avatar:       data.avatar || '😊',
    fotoPerfil:   data.fotoPerfil || null,
    updatedAt:    firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

async function Social_getPerfil(uid) {
  const doc = await _db.collection('users').doc(uid).get();
  return doc.exists ? { uid: doc.id, ...doc.data() } : null;
}

// ── Estado de amistad ─────────────────────────────────────────────────────
async function Social_estadoAmistad(otherUid) {
  if (!_currentUid) return 'none';
  const [friendSnap, outSnap, inSnap] = await Promise.all([
    _db.collection('friends').doc(_currentUid).collection('list').doc(otherUid).get(),
    _db.collection('friendRequests').doc(_currentUid).collection('outgoing').doc(otherUid).get(),
    _db.collection('friendRequests').doc(_currentUid).collection('incoming').doc(otherUid).get(),
  ]);
  if (friendSnap.exists) return 'friends';
  if (inSnap.exists)     return 'pending_in';   // si ambos existen, lo útil es poder aceptar
  if (outSnap.exists)    return 'pending_out';
  return 'none';
}

// ── Grupos de amigos ──────────────────────────────────────────────────────
// /groups/{gid}           { nombre, emoji, owner, members:[uid], nombres:{uid:nombre}, createdAt,
//                           lastMessage, lastAt, lastSenderUid, lastSenderNombre, unread_<uid> }
// /groups/{gid}/messages  { from, fromNombre, texto, at, tipo:'msg'|'sistema'|'invitacion', juegoId? }
const MAX_MIEMBROS_GRUPO = 20;

async function _miNombre() {
  try { const d = await _db.collection('users').doc(_currentUid).get(); return (d.data() || {}).nombre || 'Usuario'; }
  catch (e) { return 'Usuario'; }
}
async function _nombresDe(uids) {
  const out = {};
  await Promise.all(uids.map(async uid => {
    try { const d = await _db.collection('users').doc(uid).get(); out[uid] = String((d.data() || {}).nombre || 'Jugador').slice(0, 24); }
    catch (e) { out[uid] = 'Jugador'; }
  }));
  return out;
}

async function Social_crearGrupo(nombre, emoji, miembros) {
  if (!_currentUid) return { error: 'No autenticado' };
  nombre = String(nombre || '').trim().replace(/\s+/g, ' ').slice(0, 30);
  if (nombre.length < 2) return { error: 'Poné un nombre de al menos 2 letras' };
  const members = [...new Set([_currentUid, ...(miembros || [])])].slice(0, MAX_MIEMBROS_GRUPO);
  if (members.length < 2) return { error: 'Elegí al menos un amigo' };
  try {
    const nombres = await _nombresDe(members);
    const ts = firebase.firestore.FieldValue.serverTimestamp();
    const ref = _db.collection('groups').doc();
    const batch = _db.batch();
    batch.set(ref, {
      nombre, emoji: emoji || '👥', owner: _currentUid, members, nombres, createdAt: ts,
      lastMessage: `${nombres[_currentUid]} creó el grupo`, lastAt: ts, lastSenderUid: null, lastSenderNombre: '',
    });
    batch.set(ref.collection('messages').doc(), { from: _currentUid, fromNombre: nombres[_currentUid], texto: `creó el grupo "${nombre}"`, tipo: 'sistema', at: ts });
    await batch.commit();
    return { ok: true, id: ref.id };
  } catch (e) {
    console.error('[Social] crearGrupo', e);
    return { error: e.message || 'No se pudo crear el grupo' };
  }
}

function Social_onGrupos(callback) {
  if (!_currentUid) return () => {};
  return _db.collection('groups')
    .where('members', 'array-contains', _currentUid)
    .limit(30)
    .onSnapshot(snap => {
      const grupos = [];
      snap.forEach(doc => grupos.push({ id: doc.id, ...doc.data() }));
      const ms = g => (g.lastAt && g.lastAt.toMillis) ? g.lastAt.toMillis() : Number.MAX_SAFE_INTEGER;
      grupos.sort((a, b) => ms(b) - ms(a));
      callback(grupos);
    }, _onErr('grupos'));
}

async function Social_enviarMensajeGrupo(gid, texto, extra) {
  if (!_currentUid || !gid) return;
  texto = String(texto == null ? '' : texto).trim().slice(0, MAX_MENSAJE);
  if (!texto) return;
  const ref = _db.collection('groups').doc(gid);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('El grupo ya no existe');
  const g = snap.data();
  const nombre = (g.nombres && g.nombres[_currentUid]) || await _miNombre();
  const ts = firebase.firestore.FieldValue.serverTimestamp();
  const upd = { lastMessage: texto.substring(0, 60), lastAt: ts, lastSenderUid: _currentUid, lastSenderNombre: nombre };
  (g.members || []).forEach(m => { if (m !== _currentUid) upd[`unread_${m}`] = firebase.firestore.FieldValue.increment(1); });
  const batch = _db.batch();
  batch.set(ref.collection('messages').doc(), Object.assign({ from: _currentUid, fromNombre: nombre, texto, tipo: 'msg', at: ts }, extra || {}));
  batch.update(ref, upd);
  await batch.commit();
}

function Social_onMensajesGrupo(gid, callback) {
  if (!_currentUid || !gid) return () => {};
  return _db.collection('groups').doc(gid).collection('messages')
    .orderBy('at', 'asc')
    .limitToLast(80)
    .onSnapshot(snap => {
      const msgs = [];
      snap.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
      callback(msgs);
    }, _onErr('mensajes de grupo'));
}

async function Social_marcarLeidoGrupo(gid) {
  if (!_currentUid || !gid) return;
  try { await _db.collection('groups').doc(gid).update({ [`unread_${_currentUid}`]: 0 }); }
  catch (e) { if (e.code !== 'not-found') console.warn('[Social] marcarLeidoGrupo:', e.message); }
}

async function Social_agregarAlGrupo(gid, uids) {
  if (!_currentUid || !gid || !uids || !uids.length) return { error: 'Nada para agregar' };
  const ref = _db.collection('groups').doc(gid);
  try {
    const snap = await ref.get();
    const g = snap.data() || {};
    const nuevos = uids.filter(u => !(g.members || []).includes(u));
    if (!nuevos.length) return { error: 'Ya están en el grupo' };
    if ((g.members || []).length + nuevos.length > MAX_MIEMBROS_GRUPO) return { error: `Máximo ${MAX_MIEMBROS_GRUPO} miembros` };
    const nombres = await _nombresDe(nuevos);
    const upd = { members: firebase.firestore.FieldValue.arrayUnion(...nuevos) };
    nuevos.forEach(u => { upd[`nombres.${u}`] = nombres[u]; });
    await ref.update(upd);
    await Social_enviarMensajeGrupo(gid, `agregó a ${nuevos.map(u => nombres[u]).join(', ')}`, { tipo: 'sistema' });
    return { ok: true };
  } catch (e) { return { error: e.message || 'No se pudo agregar' }; }
}

async function Social_salirDelGrupo(gid) {
  if (!_currentUid || !gid) return;
  const ref = _db.collection('groups').doc(gid);
  try { await Social_enviarMensajeGrupo(gid, 'salió del grupo', { tipo: 'sistema' }); } catch (e) {}
  await ref.update({ members: firebase.firestore.FieldValue.arrayRemove(_currentUid) });
}

// Invita a todos los miembros a un juego: invitación individual + aviso en el chat del grupo
async function Social_invitarGrupoAJuego(gid, juegoId, juegoNombre) {
  if (!_currentUid || !gid || !juegoId) return { error: 'Datos incompletos' };
  const snap = await _db.collection('groups').doc(gid).get();
  const g = snap.data() || {};
  const otros = (g.members || []).filter(m => m !== _currentUid);
  await Promise.all(otros.map(uid => Social_invitarAJuego(uid, juegoId, juegoNombre).catch(() => null)));
  await Social_enviarMensajeGrupo(gid, `🎮 ¡Vengan a jugar ${juegoNombre}!`, { tipo: 'invitacion', juegoId });
  return { ok: true, enviadas: otros.length };
}

// Exportar para uso global
window.Social = {
  crearGrupo:             Social_crearGrupo,
  onGrupos:               Social_onGrupos,
  enviarMensajeGrupo:     Social_enviarMensajeGrupo,
  onMensajesGrupo:        Social_onMensajesGrupo,
  marcarLeidoGrupo:       Social_marcarLeidoGrupo,
  agregarAlGrupo:         Social_agregarAlGrupo,
  salirDelGrupo:          Social_salirDelGrupo,
  invitarGrupoAJuego:     Social_invitarGrupoAJuego,
  initPresence:           Social_initPresence,
  goOffline:              Social_goOffline,
  setJugando:             Social_setJugando,
  clearJugando:           Social_clearJugando,
  buscarUsuarios:         Social_buscarUsuarios,
  enviarSolicitud:        Social_enviarSolicitud,
  aceptarSolicitud:       Social_aceptarSolicitud,
  rechazarSolicitud:      Social_rechazarSolicitud,
  eliminarAmigo:          Social_eliminarAmigo,
  onAmigos:               Social_onAmigos,
  onSolicitudesEntrantes: Social_onSolicitudesEntrantes,
  onPresenciaAmigos:      Social_onPresenciaAmigos,
  getChatId:              Social_getChatId,
  enviarMensaje:          Social_enviarMensaje,
  onMensajes:             Social_onMensajes,
  marcarLeido:            Social_marcarLeido,
  onChatsActivos:         Social_onChatsActivos,
  invitarAJuego:          Social_invitarAJuego,
  onInvitaciones:         Social_onInvitaciones,
  borrarInvitacion:       Social_borrarInvitacion,
  getSalaDeAmigo:         Social_getSalaDeAmigo,
  actualizarPerfilPublico: Social_actualizarPerfilPublico,
  getPerfil:              Social_getPerfil,
  estadoAmistad:          Social_estadoAmistad,
  get uid() { return _currentUid; }
};
