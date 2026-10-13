/* ═══════════════════════════════════════════════════════════════════════════
   BG Kit v1 — motor compartido para los juegos de BandaGamer
   ───────────────────────────────────────────────────────────────────────────
   Uso mínimo:
     <link rel="stylesheet" href="kit/bg-kit.css">
     <script src="kit/bg-kit.js"></script>
     BG.init({ id:'tetris', title:'TETRIS', icon:'🧱', accent:'#00aaff',
               hud:[{id:'score',label:'Puntos'}], touch:{dpad:'full', buttons:[...]},
               help:'<kbd>←</kbd><kbd>→</kbd> mover', onRestart, onMenu });
     const view = BG.canvas(480, 640);          // canvas escalado y nítido
     BG.loop(dt => update(dt), () => render());  // paso fijo de 60 Hz, se pausa solo
     BG.sfx.play('coin');  BG.fx.burst(x, y);  BG.ui.gameOver({...});
     const r = BG.submitScore(1234);             // guarda récord + avisa al portal (XP + ranking)

   Módulos: BG.util · BG.save/load · BG.sfx · BG.music · BG.input · BG.touch
            BG.canvas · BG.draw · BG.fx · BG.ui · BG.hud · BG.loop · BG.portal
   ═══════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  const BG = global.BG = {};
  const params = new URLSearchParams(location.search);
  BG.params = params;
  BG.thumb = params.has('thumb');                       // modo captura de miniatura
  BG.isTouch = (global.matchMedia && matchMedia('(pointer: coarse)').matches) || ('ontouchstart' in global);
  BG.inPortal = (() => { try { return global.parent !== global; } catch (e) { return true; } })();
  BG.game = { id: 'juego', title: 'JUEGO', icon: '🎮', order: 'desc' };
  BG.paused = false;
  BG.playing = false;

  // ── Eventos internos ──────────────────────────────────────────────────────
  const listeners = {};
  BG.on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); return BG; };
  BG.emit = (ev, ...a) => { (listeners[ev] || []).forEach(fn => { try { fn(...a); } catch (e) { console.error(e); } }); };

  // ── Utilidades ────────────────────────────────────────────────────────────
  const U = BG.util = {
    rand: (a, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a),
    randInt: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
    pick: arr => arr[Math.floor(Math.random() * arr.length)],
    chance: p => Math.random() < p,
    clamp: (v, a, b) => v < a ? a : v > b ? b : v,
    lerp: (a, b, t) => a + (b - a) * t,
    dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
    angle: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1),
    shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; },
    rng(seed) { // mulberry32: aleatorio reproducible (útil para "desafío diario")
      let a = seed >>> 0;
      return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    },
    hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; },
    today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; },
    fmt: n => Math.round(n).toLocaleString('es-AR'),
    fmtTime(sec) { sec = Math.max(0, Math.floor(sec)); const m = Math.floor(sec / 60), s = sec % 60; return m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`; },
    rectHit: (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y,
    circleHit: (a, b) => Math.hypot(a.x - b.x, a.y - b.y) < (a.r + b.r),
    ease: {
      outCubic: t => 1 - Math.pow(1 - t, 3),
      inOutQuad: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
      outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
      outElastic: t => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI) / 3) + 1,
    },
    el(tag, attrs, html) { const e = document.createElement(tag); if (attrs) for (const k in attrs) { if (k === 'class') e.className = attrs[k]; else if (k === 'style') e.style.cssText = attrs[k]; else e.setAttribute(k, attrs[k]); } if (html != null) e.innerHTML = html; return e; },
    esc: s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  };

  // ── Persistencia local (por juego) ────────────────────────────────────────
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  BG.save = (k, v) => lsSet('bg_' + BG.game.id + '_' + k, JSON.stringify(v));
  BG.load = (k, def) => { const r = lsGet('bg_' + BG.game.id + '_' + k); if (r == null) return def; try { return JSON.parse(r); } catch (e) { return def; } };

  // ── Sonido (sintetizado con WebAudio: sin archivos) ───────────────────────
  const Sfx = BG.sfx = (() => {
    let ac = null, master = null, sfxBus = null, musBus = null, noiseBuf = null;
    let muted = lsGet('bg_mute') === '1';
    let musicOff = lsGet('bg_music_off') === '1';
    function ctx() {
      if (!ac) {
        const AC = global.AudioContext || global.webkitAudioContext;
        if (!AC) return null;
        ac = new AC();
        master = ac.createGain(); master.gain.value = muted ? 0 : 0.7; master.connect(ac.destination);
        sfxBus = ac.createGain(); sfxBus.gain.value = 0.6; sfxBus.connect(master);
        musBus = ac.createGain(); musBus.gain.value = musicOff ? 0 : 0.2; musBus.connect(master);
      }
      if (ac.state === 'suspended') ac.resume().catch(() => { });
      return ac;
    }
    function tone(o) {
      const a = ctx(); if (!a || muted) return;
      const t = a.currentTime + (o.delay || 0), dur = o.dur || 0.1;
      const osc = a.createOscillator(), g = a.createGain();
      osc.type = o.type || 'square';
      osc.frequency.setValueAtTime(o.f || 440, t);
      if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t + dur);
      if (o.detune) osc.detune.value = o.detune;
      const v = o.vol == null ? 0.2 : o.vol;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(v, 0.0002), t + (o.a || 0.006));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(o.bus || sfxBus);
      osc.start(t); osc.stop(t + dur + 0.03);
    }
    function noise(o) {
      const a = ctx(); if (!a || muted) return;
      if (!noiseBuf) { noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      const t = a.currentTime + (o.delay || 0), dur = o.dur || 0.2;
      const src = a.createBufferSource(); src.buffer = noiseBuf;
      const f = a.createBiquadFilter(); f.type = o.ftype || 'lowpass';
      f.frequency.setValueAtTime(o.f || 1200, t);
      if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
      const g = a.createGain(); g.gain.setValueAtTime(o.vol || 0.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g); g.connect(o.bus || sfxBus);
      src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.03);
    }
    const seq = (notes, step, o) => notes.forEach((f, i) => f && tone(Object.assign({ f, delay: i * step }, o)));
    const P = {
      click: () => tone({ f: 660, dur: .045, vol: .1 }),
      blip: () => tone({ f: 880, f2: 1320, dur: .07, vol: .1 }),
      select: () => { tone({ f: 520, dur: .06, vol: .12 }); tone({ f: 780, dur: .09, vol: .12, delay: .05 }); },
      back: () => { tone({ f: 600, dur: .06, vol: .1 }); tone({ f: 420, dur: .08, vol: .1, delay: .05 }); },
      coin: () => { tone({ f: 988, dur: .07, vol: .14 }); tone({ f: 1319, dur: .18, vol: .14, delay: .06 }); },
      jump: () => tone({ f: 280, f2: 760, dur: .15, vol: .12 }),
      flap: () => tone({ f: 420, f2: 680, dur: .09, type: 'triangle', vol: .24 }),
      shoot: () => tone({ f: 900, f2: 200, dur: .11, type: 'sawtooth', vol: .07 }),
      laser: () => tone({ f: 1500, f2: 280, dur: .17, vol: .07 }),
      hit: () => { noise({ dur: .12, f: 2600, vol: .22 }); tone({ f: 220, f2: 90, dur: .12, vol: .1 }); },
      hurt: () => { tone({ f: 330, f2: 110, dur: .3, type: 'sawtooth', vol: .14 }); noise({ dur: .2, f: 900, vol: .15 }); },
      explode: () => { noise({ dur: .55, f: 2000, f2: 100, vol: .38 }); tone({ f: 130, f2: 35, dur: .45, type: 'sawtooth', vol: .14 }); },
      power: () => seq([523, 659, 784, 1047], .06, { dur: .1, vol: .12 }),
      lose: () => seq([392, 330, 262, 196], .16, { dur: .24, vol: .15, type: 'triangle' }),
      win: () => seq([523, 659, 784, 1047, 1319, 1568], .085, { dur: .2, vol: .12 }),
      levelup: () => seq([440, 554, 659, 880, 1109], .07, { dur: .15, vol: .12, type: 'triangle' }),
      tick: () => tone({ f: 1250, dur: .022, vol: .05 }),
      drop: () => { tone({ f: 170, f2: 60, dur: .1, type: 'triangle', vol: .32 }); noise({ dur: .05, f: 900, vol: .1 }); },
      place: () => tone({ f: 330, f2: 210, dur: .07, type: 'triangle', vol: .24 }),
      error: () => { tone({ f: 196, dur: .11, vol: .11 }); tone({ f: 147, dur: .17, vol: .11, delay: .1 }); },
      whoosh: () => noise({ dur: .25, f: 400, f2: 3200, ftype: 'bandpass', vol: .2 }),
      bounce: () => tone({ f: 460, f2: 300, dur: .06, type: 'sine', vol: .3 }),
      pop: () => tone({ f: 620, f2: 1500, dur: .06, type: 'sine', vol: .24 }),
      swap: () => tone({ f: 500, f2: 720, dur: .05, type: 'triangle', vol: .14 }),
      flip: () => noise({ dur: .07, f: 3500, ftype: 'highpass', vol: .12 }),
      combo: (n = 1) => tone({ f: 440 * Math.pow(2, Math.min(n, 18) / 12), dur: .1, vol: .12 }),
      line: (n = 1) => { for (let i = 0; i <= n; i++) tone({ f: 600 + i * 180, dur: .1, vol: .11, delay: i * .05 }); noise({ dur: .3, f: 5000, f2: 400, vol: .1 }); },
      countdown: () => tone({ f: 660, dur: .12, type: 'square', vol: .12 }),
      go: () => tone({ f: 1320, dur: .3, type: 'square', vol: .12 }),
    };
    function play(name, ...a) { try { if (P[name]) P[name](...a); } catch (e) { } }
    function setMuted(m) {
      muted = !!m; lsSet('bg_mute', muted ? '1' : '0');
      if (master) master.gain.value = muted ? 0 : 0.7;
      BG.emit('mute', muted);
    }
    function setMusicOff(m) {
      musicOff = !!m; lsSet('bg_music_off', musicOff ? '1' : '0');
      if (musBus) musBus.gain.value = musicOff ? 0 : 0.2;
      BG.emit('music', !musicOff);
    }
    // Desbloqueo del audio con el primer gesto (política de autoplay)
    const unlock = () => { ctx(); global.removeEventListener('pointerdown', unlock); global.removeEventListener('keydown', unlock); };
    global.addEventListener('pointerdown', unlock); global.addEventListener('keydown', unlock);
    return {
      play, tone, noise, seq, ctx, presets: P,
      get muted() { return muted; }, setMuted, toggle() { setMuted(!muted); return muted; },
      get musicOff() { return musicOff; }, setMusicOff,
      get musicBus() { ctx(); return musBus; },
    };
  })();

  // ── Música: secuenciador chiptune mínimo ──────────────────────────────────
  // BG.music.play({ bpm:140, tracks:[{ type:'square', vol:.5, notes:'C5 . E5 . G5 - - .' }] })
  // Cada token es una semicorchea: nota (C4, D#4, Eb3), '.' silencio, '-' sostener.
  BG.music = (() => {
    const N = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const freq = tok => { const m = /^([A-G])([#b]?)(-?\d)$/.exec(tok); if (!m) return 0; const n = N[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3]) + 1) * 12; return 440 * Math.pow(2, (n - 69) / 12); };
    let timer = null, song = null, step = 0, nextT = 0, parsed = [];
    function parse(s) {
      return s.tracks.map(t => {
        const toks = t.notes.trim().split(/\s+/);
        const evs = [];
        toks.forEach((tk, i) => {
          if (tk === '.' || tk === '-') return;
          let len = 1; while (toks[i + len] === '-') len++;
          evs[i] = { f: freq(tk), len, drum: t.drum ? tk : null };
        });
        return { t, evs, n: toks.length };
      });
    }
    function tick() {
      const a = Sfx.ctx(); if (!a || !song) return;
      const spb = 60 / (song.bpm || 120) / 4;
      while (nextT < a.currentTime + 0.12) {
        if (!BG.paused && !Sfx.muted && !Sfx.musicOff) {
          for (const tr of parsed) {
            const ev = tr.evs[step % tr.n]; if (!ev) continue;
            const d = nextT - a.currentTime;
            if (tr.t.drum) {
              if (ev.drum === 'K') Sfx.tone({ f: 150, f2: 40, dur: .12, type: 'sine', vol: (tr.t.vol || .8), delay: d, bus: Sfx.musicBus });
              else if (ev.drum === 'S') Sfx.noise({ f: 2500, dur: .08, vol: (tr.t.vol || .6) * .6, delay: d, bus: Sfx.musicBus, ftype: 'highpass' });
              else Sfx.noise({ f: 7000, dur: .03, vol: (tr.t.vol || .5) * .35, delay: d, bus: Sfx.musicBus, ftype: 'highpass' });
            } else if (ev.f) {
              Sfx.tone({ f: ev.f, dur: spb * ev.len * 0.95, type: tr.t.type || 'square', vol: tr.t.vol || .5, delay: d, bus: Sfx.musicBus, a: .01 });
            }
          }
        }
        nextT += spb; step++;
      }
    }
    return {
      play(s) {
        this.stop(); song = s; parsed = parse(s); step = 0;
        const a = Sfx.ctx(); nextT = a ? a.currentTime + 0.05 : 0;
        timer = setInterval(tick, 30);
      },
      stop() { if (timer) clearInterval(timer); timer = null; song = null; },
      get playing() { return !!song; },
    };
  })();

  // ── Entrada: teclado + táctil unificados en "acciones" ────────────────────
  const KEYMAP = {
    left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'], up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'],
    action: ['Space', 'KeyZ', 'KeyJ'], action2: ['KeyX', 'KeyK', 'ShiftLeft', 'ShiftRight'], action3: ['KeyC', 'KeyL'],
    pause: ['KeyP', 'Escape'], confirm: ['Enter', 'NumpadEnter', 'Space'],
  };
  const Input = BG.input = {
    held: new Set(), virt: {}, map: KEYMAP, _pressed: new Set(), _handlers: {}, _raw: [],
    isDown(a) { if (this.virt[a]) return true; const c = this.map[a]; return c ? c.some(k => this.held.has(k)) : this.held.has(a); },
    pressed(a) { if (this._pressed.has(a)) { this._pressed.delete(a); return true; } return false; },
    on(a, fn) { (this._handlers[a] = this._handlers[a] || []).push(fn); return this; },
    onKey(fn) { this._raw.push(fn); return this; },
    clear() { this.held.clear(); this._pressed.clear(); for (const k in this.virt) this.virt[k] = false; },
    axisX() { return (this.isDown('right') ? 1 : 0) - (this.isDown('left') ? 1 : 0); },
    axisY() { return (this.isDown('down') ? 1 : 0) - (this.isDown('up') ? 1 : 0); },
    swipe(el, cb, min = 24) {
      let s = null;
      el.addEventListener('pointerdown', e => { s = { x: e.clientX, y: e.clientY, t: performance.now() }; });
      el.addEventListener('pointerup', e => {
        if (!s) return; const dx = e.clientX - s.x, dy = e.clientY - s.y; s = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < min) return;
        cb(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
      });
      el.addEventListener('pointercancel', () => { s = null; });
    },
  };
  function actionsOf(code) { const r = []; for (const a in Input.map) if (Input.map[a].includes(code)) r.push(a); return r; }
  function fire(a, e) { (Input._handlers[a] || []).forEach(fn => fn(e)); }
  const KEY2CODE = { ' ': 'Space', 'Enter': 'Enter', 'Escape': 'Escape', 'Shift': 'ShiftLeft' };
  function codeOf(e) {
    if (e.code) return e.code;
    if (KEY2CODE[e.key]) return KEY2CODE[e.key];
    if (/^Arrow/.test(e.key)) return e.key;
    if (e.key && e.key.length === 1 && /[a-z]/i.test(e.key)) return 'Key' + e.key.toUpperCase();
    if (e.key && /^\d$/.test(e.key)) return 'Digit' + e.key;
    return e.key || '';
  }
  function keyDown(e) {
    const code = codeOf(e);
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code) && e.preventDefault && !isTyping(e)) e.preventDefault();
    if (isTyping(e)) return;
    Input._raw.forEach(fn => fn(e, code, true));
    if (e.repeat || Input.held.has(code)) { Input.held.add(code); return; }   // ignorar auto-repetición
    Input.held.add(code);
    if (UI.open) { UI._key(code, e); return; }
    const acts = actionsOf(code);
    if (acts.includes('pause') && BG.playing) { BG.togglePause(); return; }
    for (const a of acts) { Input._pressed.add(a); fire(a, e); }
  }
  function keyUp(e) { Input.held.delete(codeOf(e)); }
  function isTyping(e) { const t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable); }
  global.addEventListener('keydown', keyDown, { passive: false });
  global.addEventListener('keyup', keyUp);
  global.addEventListener('blur', () => Input.clear());

  // ── Controles táctiles en pantalla ────────────────────────────────────────
  BG.touch = {
    // cfg: { dpad:'full'|'h'|false, buttons:[{ action:'action', label:'⤒', wide:false }] }
    setup(cfg) {
      const box = document.getElementById('bg-touch'); if (!box) return;
      box.innerHTML = '';
      if (cfg.dpad) {
        const d = U.el('div', { class: 'bg-dpad' + (cfg.dpad === 'h' ? ' h2' : '') });
        const keys = cfg.dpad === 'h' ? [['left', '◀'], ['right', '▶']] : [['up', '▲'], ['left', '◀'], ['right', '▶'], ['down', '▼']];
        keys.forEach(([a, l]) => d.appendChild(U.el('div', { class: 'k ' + a, 'data-act': a }, l)));
        box.appendChild(d);
      }
      const bw = U.el('div', { class: 'bg-tbtns' });
      (cfg.buttons || []).forEach(b => bw.appendChild(U.el('div', { class: 'bg-tbtn' + (b.wide ? ' wide' : ''), 'data-act': b.action }, b.label)));
      box.appendChild(bw);
      const active = new Map(); // pointerId -> acción
      const set = (a, on, e) => {
        if (!a) return;
        const was = Input.virt[a]; Input.virt[a] = on;
        box.querySelectorAll(`[data-act="${a}"]`).forEach(n => n.classList.toggle('on', on));
        if (on && !was) { Input._pressed.add(a); fire(a, e); if (navigator.vibrate) try { navigator.vibrate(8); } catch (x) { } }
      };
      const actAt = (x, y) => { const n = document.elementFromPoint(x, y); return n && n.closest && n.closest('[data-act]') ? n.closest('[data-act]').dataset.act : null; };
      box.addEventListener('pointerdown', e => { e.preventDefault(); const a = actAt(e.clientX, e.clientY); active.set(e.pointerId, a); set(a, true, e); try { box.setPointerCapture(e.pointerId); } catch (x) { } });
      box.addEventListener('pointermove', e => {
        if (!active.has(e.pointerId)) return;
        const prev = active.get(e.pointerId), a = actAt(e.clientX, e.clientY);
        if (a !== prev) { if (prev && ![...active.entries()].some(([id, v]) => id !== e.pointerId && v === prev)) set(prev, false, e); active.set(e.pointerId, a); set(a, true, e); }
      });
      const end = e => { const a = active.get(e.pointerId); active.delete(e.pointerId); if (a && ![...active.values()].includes(a)) set(a, false, e); };
      box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
      document.body.classList.add('bg-touch-on');
    },
    hide() { document.body.classList.remove('bg-touch-on'); },
    show() { if (document.getElementById('bg-touch').children.length) document.body.classList.add('bg-touch-on'); },
  };

  // ── Canvas escalado (nítido en cualquier tamaño / pantalla retina) ────────
  // Se dibuja siempre en coordenadas lógicas W×H. Opción flex:{min,max} para que el
  // alto lógico se adapte al espacio disponible (aspecto entre min y max = H/W).
  BG.canvas = function (W, H, opts = {}) {
    const stage = BG.stage;
    const c = document.createElement('canvas');
    c.className = 'bg-canvas' + (opts.pixel ? ' pixel' : '');
    // opts.parent: meterlo dentro de otro contenedor · opts.reserveH / reserveW: lugar para otros controles
    const host = opts.parent || stage;
    if (opts.prepend) host.insertBefore(c, host.firstChild); else host.appendChild(c);
    const ctx = c.getContext('2d');
    const view = { canvas: c, ctx, W, H, scale: 1, onResize: null };
    function fit() {
      const r = stage.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const pad = BG.thumb ? 0 : (opts.pad == null ? 8 : opts.pad);
      const aw = r.width - pad * 2 - (opts.reserveW || 0), ah = r.height - pad * 2 - (opts.reserveH || 0);
      if (opts.flex) {   // ajustar el alto lógico al aspecto disponible
        const asp = U.clamp(ah / aw, opts.flex.min, opts.flex.max);
        view.H = Math.round(view.W * asp);
      }
      const s = Math.min(aw / view.W, ah / view.H);
      const cssW = Math.max(1, Math.floor(view.W * s)), cssH = Math.max(1, Math.floor(view.H * s));
      const dpr = Math.min(global.devicePixelRatio || 1, 2.5);
      c.style.width = cssW + 'px'; c.style.height = cssH + 'px';
      c.width = Math.round(cssW * dpr); c.height = Math.round(cssH * dpr);
      view.scale = c.width / view.W;
      view.begin();
      if (view.onResize) view.onResize(view.W, view.H);
    }
    view.begin = () => { ctx.setTransform(view.scale, 0, 0, view.scale, 0, 0); if (opts.pixel) ctx.imageSmoothingEnabled = false; };
    view.toLocal = (cx, cy) => { const b = c.getBoundingClientRect(); return { x: (cx - b.left) / b.width * view.W, y: (cy - b.top) / b.height * view.H }; };
    view.fit = fit;
    if (global.ResizeObserver) new ResizeObserver(fit).observe(stage); else global.addEventListener('resize', fit);
    fit();
    BG.view = view;
    // Juegos apaisados en un celular vertical: sugerir girar la pantalla (una vez por sesión)
    if (BG.isTouch && !BG.thumb && W / H > 1.25) setTimeout(() => {
      let seen = false; try { seen = !!sessionStorage.getItem('bg_rot_tip'); sessionStorage.setItem('bg_rot_tip', '1'); } catch (e) { }
      if (!seen && global.innerHeight > global.innerWidth * 1.1 && BG.ui) BG.ui.toast('📱↻ Girá el celular para jugar más grande', '#8b8ba3');
    }, 1800);
    return view;
  };

  // ── Ayudas de dibujo ──────────────────────────────────────────────────────
  BG.draw = {
    font: (size, weight = 700, fam = 'display') => `${weight} ${size}px ${fam === 'display' ? 'Orbitron, Rajdhani, sans-serif' : 'Rajdhani, system-ui, sans-serif'}`,
    text(ctx, str, x, y, o = {}) {
      ctx.save();
      ctx.font = o.font || BG.draw.font(o.size || 16, o.weight || 700, o.family || 'display');
      ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.baseline || 'middle';
      if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur || 12; }
      if (o.stroke) { ctx.lineWidth = o.strokeW || 4; ctx.strokeStyle = o.stroke; ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); }
      ctx.fillStyle = o.color || '#fff'; ctx.globalAlpha *= (o.alpha == null ? 1 : o.alpha);
      ctx.fillText(str, x, y);
      ctx.restore();
    },
    rr(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); },
    glowCircle(ctx, x, y, r, color, blur = 14) { ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.restore(); },
    stars(n, W, H, seed = 7) { const r = U.rng(seed); return Array.from({ length: n }, () => ({ x: r() * W, y: r() * H, z: 0.2 + r() * 0.8, tw: r() * 6.28 })); },
  };

  // ── Efectos: partículas, textos flotantes, temblor, flash ─────────────────
  const FX = BG.fx = {
    parts: [], texts: [], rings: [], shakeT: 0, shakeMag: 0, flashA: 0, flashC: '#fff', ox: 0, oy: 0,
    burst(x, y, o = {}) {
      const n = o.n || 14, cols = [].concat(o.color || ['#ffb300', '#ff6600', '#fff']);
      for (let i = 0; i < n && this.parts.length < 900; i++) {
        const a = o.angle != null ? o.angle + U.rand(-(o.spread || 0.6), (o.spread || 0.6)) : Math.random() * Math.PI * 2;
        const sp = U.rand(o.speedMin || (o.speed || 160) * 0.3, o.speed || 160);
        const life = U.rand((o.life || 0.6) * 0.5, o.life || 0.6);
        this.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life, max: life, size: U.rand((o.size || 3) * 0.5, o.size || 3), color: U.pick(cols), g: o.gravity || 0, drag: o.drag == null ? 0.96 : o.drag, shape: o.shape || 'circle', glow: o.glow !== false });
      }
    },
    ring(x, y, o = {}) { this.rings.push({ x, y, r: o.r || 4, max: o.max || 60, life: o.life || 0.45, t: 0, color: o.color || '#fff', w: o.width || 3 }); },
    text(x, y, str, o = {}) { this.texts.push({ x, y, str, color: o.color || '#fff', life: o.life || 0.9, max: o.life || 0.9, size: o.size || 16, vy: o.vy == null ? -45 : o.vy }); },
    shake(mag = 6, t = 0.3) { this.shakeMag = Math.max(this.shakeMag, mag); this.shakeT = Math.max(this.shakeT, t); },
    flash(color = '#fff', a = 0.5) { this.flashC = color; this.flashA = Math.max(this.flashA, a); },
    clear() { this.parts.length = 0; this.texts.length = 0; this.rings.length = 0; this.shakeT = 0; this.flashA = 0; },
    update(dt) {
      for (let i = this.parts.length - 1; i >= 0; i--) {
        const p = this.parts[i]; p.life -= dt;
        if (p.life <= 0) { this.parts.splice(i, 1); continue; }
        p.vy += p.g * dt; const d = Math.pow(p.drag, dt * 60); p.vx *= d; p.vy *= d;
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
      for (let i = this.texts.length - 1; i >= 0; i--) { const t = this.texts[i]; t.life -= dt; t.y += t.vy * dt; if (t.life <= 0) this.texts.splice(i, 1); }
      for (let i = this.rings.length - 1; i >= 0; i--) { const r = this.rings[i]; r.t += dt; if (r.t >= r.life) this.rings.splice(i, 1); }
      if (this.shakeT > 0) { this.shakeT -= dt; const m = this.shakeMag * Math.min(1, this.shakeT * 4); this.ox = U.rand(-m, m); this.oy = U.rand(-m, m); if (this.shakeT <= 0) { this.ox = this.oy = 0; this.shakeMag = 0; } }
      if (this.flashA > 0) this.flashA = Math.max(0, this.flashA - dt * 2.2);
    },
    applyShake(ctx) { if (this.ox || this.oy) ctx.translate(this.ox, this.oy); },
    draw(ctx) {
      ctx.save();
      for (const r of this.rings) { const k = r.t / r.life; ctx.globalAlpha = 1 - k; ctx.strokeStyle = r.color; ctx.lineWidth = r.w * (1 - k) + 0.5; ctx.beginPath(); ctx.arc(r.x, r.y, r.r + (r.max - r.r) * U.ease.outCubic(k), 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalCompositeOperation = 'lighter';
      for (const p of this.parts) {
        const k = p.life / p.max; ctx.globalAlpha = Math.min(1, k * 1.5); ctx.fillStyle = p.color;
        if (p.shape === 'square') ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        else if (p.shape === 'line') { ctx.strokeStyle = p.color; ctx.lineWidth = p.size * 0.6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04); ctx.stroke(); }
        else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.4 + 0.6 * k), 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.globalCompositeOperation = 'source-over';
      for (const t of this.texts) {
        const k = t.life / t.max;
        BG.draw.text(ctx, t.str, t.x, t.y, { size: t.size * (k > 0.8 ? 1 + (k - 0.8) * 2 : 1), color: t.color, alpha: Math.min(1, k * 2), stroke: 'rgba(0,0,0,.6)', strokeW: 3 });
      }
      ctx.restore();
    },
    drawFlash(ctx, W, H) { if (this.flashA <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = this.flashA; ctx.fillStyle = this.flashC; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); },
  };


  // ── Post-proceso: resplandor (bloom), viñeta y scanlines ──────────────────
  // BG.init({ post: { bloom: .55, vignette: .35, scan: .06 } }). La calidad baja sola
  // si el dispositivo no llega a ~45 fps, y se puede cambiar desde la pausa.
  const Post = BG.post = (() => {
    const cfg = { bloom: 0, vignette: 0, scan: 0, bright: .72, contrast: 2.3 };
    let quality = lsGet('bg_fx_q') || 'alto';
    let small = null, sctx = null, vig = null, vigKey = '', scan = null, scanKey = '';
    let slowT = 0, frames = 0, acc = 0;
    function set(o) { Object.assign(cfg, o || {}); }
    function setQuality(q) { quality = q; lsSet('bg_fx_q', q); BG.emit('quality', q); }
    function monitor(dt) {   // degrada si va lento durante 2,5 s seguidos
      if (quality !== 'alto' || !cfg.bloom) return;
      acc += dt; frames++;
      if (acc >= .5) { const avg = acc / frames; slowT = avg > 1 / 42 ? slowT + acc : 0; acc = 0; frames = 0;
        if (slowT > 2.5) { setQuality('bajo'); slowT = 0; if (BG.ui) BG.ui.toast('Efectos reducidos para que vaya fluido', '#8b8ba3'); } }
    }
    function apply(view) {
      if (!view || BG.thumb && !cfg.thumbFx) return;
      const c = view.canvas, ctx = view.ctx;
      if (!c.width || !c.height) return;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (cfg.bloom > 0 && quality === 'alto') {
        const w = Math.max(2, c.width >> 2), h = Math.max(2, c.height >> 2);
        if (!small) { small = document.createElement('canvas'); sctx = small.getContext('2d'); }
        if (small.width !== w || small.height !== h) { small.width = w; small.height = h; }
        sctx.globalCompositeOperation = 'copy';
        sctx.filter = `brightness(${cfg.bright}) contrast(${cfg.contrast}) blur(${Math.max(2, Math.round(w / 80))}px)`;
        sctx.drawImage(c, 0, 0, w, h);
        sctx.filter = 'none';
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = cfg.bloom; ctx.imageSmoothingEnabled = true;
        ctx.drawImage(small, 0, 0, c.width, c.height);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      }
      if (cfg.scan > 0 && quality === 'alto') {
        const k = c.width + 'x' + c.height;
        if (scanKey !== k) {
          scan = document.createElement('canvas'); scan.width = 4; scan.height = Math.max(2, Math.round(c.height / view.H * 3));
          const g = scan.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 4, Math.ceil(scan.height / 2));
          scan = ctx.createPattern(scan, 'repeat'); scanKey = k;
        }
        ctx.globalAlpha = cfg.scan; ctx.fillStyle = scan; ctx.fillRect(0, 0, c.width, c.height); ctx.globalAlpha = 1;
      }
      if (cfg.vignette > 0) {
        const k = c.width + 'x' + c.height + cfg.vignette;
        if (vigKey !== k) {
          vig = document.createElement('canvas'); vig.width = c.width; vig.height = c.height;
          const g = vig.getContext('2d'), r = Math.hypot(c.width, c.height) / 2;
          const gr = g.createRadialGradient(c.width / 2, c.height / 2, r * .45, c.width / 2, c.height / 2, r);
          gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${cfg.vignette})`);
          g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height); vigKey = k;
        }
        ctx.drawImage(vig, 0, 0);
      }
      ctx.restore();
    }
    return { set, apply, monitor, setQuality, get quality() { return quality; }, get cfg() { return cfg; } };
  })();

  // ── Bucle de juego (paso fijo 60 Hz) ──────────────────────────────────────
  let rafId = null;
  BG.loop = function (update, render) {
    if (rafId) cancelAnimationFrame(rafId);
    const STEP = 1 / 60; let last = performance.now(), acc = 0;
    const seen = new Set();
    const report = e => { const m = String(e && e.message || e); if (!seen.has(m)) { seen.add(m); console.error('[BG] error en el bucle: ' + ((e && e.stack) || e)); } };
    function frame(now) {
      rafId = requestAnimationFrame(frame);    // primero se agenda: un error no congela el juego
      let dt = (now - last) / 1000; last = now; if (dt > 0.25) dt = 0.25;
      if (!BG.paused) {
        acc += dt; let n = 0;
        try { while (acc >= STEP && n < 6) { update(STEP); FX.update(STEP); acc -= STEP; n++; } } catch (e) { report(e); acc = 0; }
        if (n === 6) acc = 0;
      }
      try { if (BG.view) BG.view.begin(); render(dt); Post.apply(BG.view); Post.monitor(dt); } catch (e) { report(e); }
    }
    rafId = requestAnimationFrame(frame);
  };
  BG.stopLoop = () => { if (rafId) cancelAnimationFrame(rafId); rafId = null; };

  // ── Interfaz: overlays, toasts, HUD ───────────────────────────────────────
  const UI = BG.ui = {
    open: false, _shownAt: 0, _onBack: null,
    show(o = {}) {
      const ov = document.getElementById('bg-overlay');
      const card = U.el('div', { class: 'bg-card' });
      if (o.icon) card.appendChild(U.el('div', { class: 'ico-big' }, o.icon));
      if (o.title) card.appendChild(U.el('h2', { class: o.tone || '' }, o.title));
      if (o.sub) card.appendChild(U.el('div', { class: 'sub' }, o.sub));
      if (o.score != null) {
        card.appendChild(U.el('div', { class: 'big-score' }, U.esc(o.scoreText != null ? o.scoreText : U.fmt(o.score))));
        card.appendChild(U.el('div', { class: 'big-lbl' }, U.esc(o.scoreLabel || 'PUNTOS')));
      }
      if (o.record) card.appendChild(U.el('div', { class: 'bg-record' }, o.record === true ? '★ ¡NUEVO RÉCORD! ★' : o.record));
      if (o.stats && o.stats.length) {
        const g = U.el('div', { class: 'bg-stats' });
        o.stats.forEach(s => g.appendChild(U.el('div', { class: 'bg-stat' }, `<b>${U.esc(s.value)}</b><span>${U.esc(s.label)}</span>`)));
        card.appendChild(g);
      }
      if (o.html) { const h = typeof o.html === 'string' ? U.el('div', null, o.html) : o.html; card.appendChild(h); }
      if (o.buttons && o.buttons.length) {
        const row = U.el('div', { class: 'bg-btnrow' + (o.row ? ' row' : '') });
        o.buttons.forEach(b => {
          const btn = U.el('button', { class: 'bg-btn' + (b.primary ? ' primary' : '') + (b.sel ? ' sel' : '') }, b.label + (b.small ? `<small>${b.small}</small>` : ''));
          btn.addEventListener('click', e => { e.stopPropagation(); if (performance.now() - UI._shownAt < 250) return; Sfx.play(b.sound || 'select'); b.onClick && b.onClick(btn); });
          row.appendChild(btn);
        });
        card.appendChild(row);
      }
      if (o.help) card.appendChild(U.el('div', { class: 'bg-help' }, o.help));
      ov.innerHTML = ''; ov.appendChild(card); ov.classList.add('on');
      UI.open = true; UI._shownAt = performance.now(); UI._onBack = o.onBack || null;
      Input.clear();
      const prim = card.querySelector('.bg-btn.primary') || card.querySelector('.bg-btn');
      if (prim && !BG.isTouch) setTimeout(() => prim.focus({ preventScroll: true }), 30);
      if (o.onShow) o.onShow(card);
      return card;
    },
    hide() { const ov = document.getElementById('bg-overlay'); ov.classList.remove('on'); UI.open = false; Input.clear(); setTimeout(() => { if (!UI.open) ov.innerHTML = ''; }, 250); },
    _key(code, e) {
      const ov = document.getElementById('bg-overlay');
      const btns = [...ov.querySelectorAll('.bg-btn')];
      if (code === 'Escape' && UI._onBack) { UI._onBack(); return; }
      if ((code === 'Escape' || code === 'KeyP') && BG.paused) { BG.resume(); return; }
      if (code === 'Enter' || code === 'NumpadEnter' || code === 'Space') {
        if (performance.now() - UI._shownAt < 450) return;     // evita "reintentar" accidental
        const f = document.activeElement && document.activeElement.classList.contains('bg-btn') ? document.activeElement : (ov.querySelector('.bg-btn.primary') || btns[0]);
        if (f) { e.preventDefault && e.preventDefault(); f.click(); }
        return;
      }
      const dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1, KeyS: 1, KeyW: -1 }[code];
      if (dir && btns.length) {
        let i = btns.indexOf(document.activeElement); i = (i + dir + btns.length) % btns.length;
        btns[i].focus(); Sfx.play('tick');
      }
    },
    // Menú principal estándar
    menu(o = {}) {
      const best = BG.getBest(o.mode);
      return UI.show(Object.assign({
        icon: BG.game.icon, title: BG.game.title,
        sub: o.sub || BG.game.subtitle || '',
        stats: best != null ? [{ label: 'Tu récord', value: o.bestText ? o.bestText(best) : U.fmt(best) }] : null,
        help: BG.game.help ? (BG.isTouch && BG.game.helpTouch ? BG.game.helpTouch : BG.game.help) : '',
      }, o));
    },
    // Pantalla de fin de partida estándar
    gameOver(o = {}) {
      const btns = [{ label: o.retryLabel || '↻ JUGAR DE NUEVO', primary: true, onClick: o.onRetry }];
      if (o.onMenu) btns.push({ label: '☰ MENÚ', onClick: o.onMenu });
      if (o.buttons) btns.push(...o.buttons);
      return UI.show({
        icon: o.icon || (o.win ? '🏆' : '💥'),
        title: o.title || (o.win ? '¡GANASTE!' : 'GAME OVER'),
        tone: o.tone || (o.win ? 'good' : 'bad'),
        sub: o.sub, score: o.score, scoreText: o.scoreText, scoreLabel: o.scoreLabel,
        record: o.isRecord ? (o.recordText || true) : null,
        stats: o.stats || (o.best != null ? [{ label: 'Récord', value: o.bestText || U.fmt(o.best) }] : null),
        html: o.html, buttons: btns,
      });
    },
    toast(text, color) {
      const host = document.getElementById('bg-toasts'); if (!host) return;
      const t = U.el('div', { class: 'bg-toast' }, U.esc(text));
      if (color) t.style.setProperty('--t', color);
      host.appendChild(t); setTimeout(() => t.remove(), 2300);
    },
  };

  BG.hud = {
    set(id, v, bump) {
      const n = document.querySelector(`#bg-hud [data-hud="${id}"] b`); if (!n) return;
      const s = typeof v === 'number' ? U.fmt(v) : String(v);
      if (n.textContent !== s) { n.textContent = s; if (bump) { n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); setTimeout(() => n.classList.remove('bump'), 160); } }
    },
    setAll(obj) { for (const k in obj) BG.hud.set(k, obj[k]); },
    show(id, on) { const n = document.querySelector(`#bg-hud [data-hud="${id}"]`); if (n) n.style.display = on ? '' : 'none'; },
  };

  // ── Pausa ─────────────────────────────────────────────────────────────────
  BG.pause = function () {
    if (!BG.playing || BG.paused || BG.game.pausable === false) return;
    BG.paused = true; BG.emit('pause');
    const btns = [{ label: '▶ CONTINUAR', primary: true, onClick: () => BG.resume() }];
    if (BG.game.onRestart) btns.push({ label: '↻ REINICIAR', onClick: () => { BG.paused = false; UI.hide(); BG.game.onRestart(); } });
    btns.push({ label: Sfx.muted ? '🔇 SONIDO: NO' : '🔊 SONIDO: SÍ', onClick: b => { Sfx.toggle(); b.textContent = Sfx.muted ? '🔇 SONIDO: NO' : '🔊 SONIDO: SÍ'; syncMuteBtn(); } });
    if (Post.cfg.bloom || Post.cfg.scan) btns.push({ label: Post.quality === 'alto' ? '✨ EFECTOS: ALTOS' : '✨ EFECTOS: BAJOS', onClick: b => { Post.setQuality(Post.quality === 'alto' ? 'bajo' : 'alto'); b.textContent = Post.quality === 'alto' ? '✨ EFECTOS: ALTOS' : '✨ EFECTOS: BAJOS'; } });
    if (BG.game.music) btns.push({ label: Sfx.musicOff ? '🎵 MÚSICA: NO' : '🎵 MÚSICA: SÍ', onClick: b => { Sfx.setMusicOff(!Sfx.musicOff); b.textContent = Sfx.musicOff ? '🎵 MÚSICA: NO' : '🎵 MÚSICA: SÍ'; } });
    if (BG.game.onMenu) btns.push({ label: '☰ SALIR AL MENÚ', onClick: () => { BG.paused = false; BG.playing = false; UI.hide(); BG.game.onMenu(); } });
    UI.show({ icon: '⏸', title: 'PAUSA', sub: 'El juego te espera.', buttons: btns, help: BG.game.help || '' });
  };
  BG.resume = function () { if (!BG.paused) return; BG.paused = false; UI.hide(); BG.emit('resume'); };
  BG.togglePause = () => BG.paused ? BG.resume() : BG.pause();
  // Arranca/termina una partida (habilita la pausa automática)
  BG.start = () => { BG.playing = true; BG.paused = false; if (UI.open) UI.hide(); };
  BG.stop = () => { BG.playing = false; };
  document.addEventListener('visibilitychange', () => { if (document.hidden) BG.pause(); });

  // ── Récords + puente con el portal ────────────────────────────────────────
  BG.getBest = (mode = 'default') => { const b = BG.load('best', {}); return b[mode] == null ? null : b[mode]; };
  // Guarda el puntaje si es récord y lo informa al portal (XP + ranking por juego).
  // o.order: 'desc' (más alto es mejor, por defecto) | 'asc' (menos es mejor: tiempos, movimientos)
  BG.submitScore = function (score, o = {}) {
    const mode = o.mode || 'default', order = o.order || BG.game.order || 'desc';
    score = Math.round(Number(score) || 0);
    const bests = BG.load('best', {}); const prev = bests[mode];
    const valid = score > 0;
    const better = valid && (prev == null || (order === 'desc' ? score > prev : score < prev));
    if (better) { bests[mode] = score; BG.save('best', bests); }
    BG.portal.send('bg-score', { score, mode, order, won: !!o.won, isRecord: better });
    return { isRecord: better && prev != null, first: better && prev == null, prev: prev == null ? null : prev, best: better ? score : prev };
  };
  BG.portal = {
    user: null,
    send(type, data) { if (!BG.inPortal) return; try { global.parent.postMessage(Object.assign({ type, slug: BG.game.id }, data || {}), '*'); } catch (e) { } },
  };
  // Identidad para juegos online: usuario del portal si está logueado; si no, un id local estable.
  BG.identity = function () {
    const u = BG.portal.user;
    let anon = lsGet('bg_anon_id'); if (!anon) { anon = 'anon_' + Math.random().toString(36).slice(2, 10); lsSet('bg_anon_id', anon); }
    let nombre = (u && u.nombre) || '';
    if (!nombre) { try { const g = JSON.parse(lsGet('bandagamer_usuario_v2') || 'null'); if (g && g.nombre) nombre = g.nombre; } catch (e) { } }
    return { uid: (u && u.uid) || anon, nombre: nombre || 'Jugador', avatar: (u && u.avatar) || '😊', logueado: !!(u && u.uid) };
  };
  global.addEventListener('message', e => {
    if (e.source !== global.parent) return;
    const d = e.data; if (!d || typeof d !== 'object') return;
    if (d.type === 'keydown' || d.type === 'keyup') {         // teclas reenviadas por el portal
      const fake = { key: d.key, code: d.code, repeat: !!d.repeat, target: document.body, preventDefault() { } };
      if (d.type === 'keydown') keyDown(fake); else keyUp(fake);
      return;
    }
    if (d.type === 'bg-hello-ack') {
      BG.portal.user = d.user || null;
      // Fusionar el récord de la nube con el local (por si jugó en otro dispositivo)
      if (d.records && typeof d.records === 'object') {
        const bests = BG.load('best', {}); let changed = false;
        for (const mode in d.records) {
          const v = Number(d.records[mode]); if (!Number.isFinite(v) || v <= 0) continue;
          const order = BG.game.order || 'desc';
          if (bests[mode] == null || (order === 'desc' ? v > bests[mode] : v < bests[mode])) { bests[mode] = v; changed = true; }
        }
        if (changed) BG.save('best', bests);
      }
      BG.emit('portal', BG.portal.user);
    }
  });

  // ── Inicialización de la página ───────────────────────────────────────────
  function syncMuteBtn() { const b = document.getElementById('bg-mute'); if (b) b.textContent = Sfx.muted ? '🔇' : '🔊'; }
  BG.init = function (cfg) {
    Object.assign(BG.game, cfg);
    const b = document.body;
    b.classList.add('bg-kit');
    if (cfg.scroll) b.classList.add('bg-scroll');
    if (BG.thumb) b.classList.add('bg-thumb');
    const root = document.documentElement.style;
    if (cfg.accent) root.setProperty('--bg-accent', cfg.accent);
    if (cfg.accent2) root.setProperty('--bg-accent2', cfg.accent2);
    if (cfg.post) Post.set(cfg.post);
    if (!document.title || document.title === 'Juego') document.title = cfg.title;

    const top = U.el('div', { id: 'bg-top' });
    top.appendChild(U.el('div', { id: 'bg-title' }, `<span class="ico">${cfg.icon || '🎮'}</span><span class="txt">${U.esc(cfg.title)}</span>`));
    const hud = U.el('div', { id: 'bg-hud' });
    (cfg.hud || []).forEach(h => {
      const p = U.el('div', { class: 'bg-pill', 'data-hud': h.id }, `<b>${U.esc(h.value != null ? h.value : '0')}</b><span>${U.esc(h.label)}</span>`);
      if (h.color) p.style.setProperty('--pill', h.color);
      hud.appendChild(p);
    });
    top.appendChild(hud);
    const btns = U.el('div', { id: 'bg-btns' });
    if (cfg.pausable !== false) {
      const pb = U.el('button', { class: 'bg-ibtn', id: 'bg-pause', title: 'Pausa (P)' }, '⏸');
      pb.addEventListener('click', () => { if (BG.playing) BG.togglePause(); });
      btns.appendChild(pb);
    }
    const mb = U.el('button', { class: 'bg-ibtn', id: 'bg-mute', title: 'Sonido (M)' }, Sfx.muted ? '🔇' : '🔊');
    mb.addEventListener('click', () => { Sfx.toggle(); syncMuteBtn(); mb.blur(); });
    btns.appendChild(mb);
    if (!BG.inPortal && document.fullscreenEnabled) {
      const fb = U.el('button', { class: 'bg-ibtn', title: 'Pantalla completa' }, '⛶');
      fb.addEventListener('click', () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => { }); });
      btns.appendChild(fb);
    }
    top.appendChild(btns);

    let stage = document.getElementById('bg-stage');
    if (!stage) { stage = U.el('div', { id: 'bg-stage' }); b.appendChild(stage); }
    b.insertBefore(top, b.firstChild);
    stage.appendChild(U.el('div', { id: 'bg-overlay' }));
    stage.appendChild(U.el('div', { id: 'bg-toasts' }));
    b.appendChild(U.el('div', { id: 'bg-touch' }));
    BG.stage = stage;

    Input.onKey((e, code, down) => { if (down && code === 'KeyM' && !e.repeat && BG.game.muteKey !== false) { Sfx.toggle(); syncMuteBtn(); } });
    if (BG.isTouch && cfg.touch) BG.touch.setup(cfg.touch);
    BG.portal.send('bg-hello', { title: cfg.title });
    // Esperar fuentes para dibujar texto en canvas con la tipografía correcta
    BG.ready = (document.fonts && document.fonts.load)
      ? Promise.race([Promise.all([document.fonts.load('700 16px Orbitron'), document.fonts.load('600 16px Rajdhani')]), new Promise(r => setTimeout(r, 1200))]).catch(() => { })
      : Promise.resolve();
    return BG;
  };
})(window);
