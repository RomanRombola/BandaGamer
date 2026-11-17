/* ═══════════════════════════════════════════════════════════════════════════
   BG Bridge — conexión mínima con el portal para juegos que NO usan BG Kit.
   No agrega interfaz ni toca el teclado: solo avisa los puntajes para que el
   portal guarde el récord, dé XP y actualice el ranking del juego.

     <script src="kit/bg-bridge.js"></script>
     BGBridge.init('snake');
     BGBridge.score(1234);                                   // más alto es mejor
     BGBridge.score(45, { mode: 'hard', order: 'asc' });     // tiempos: menos es mejor
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const enPortal = (() => { try { return window.parent !== window; } catch (e) { return true; } })();
  const enviar = msg => { if (!enPortal) return; try { window.parent.postMessage(msg, '*'); } catch (e) { } };
  window.BGBridge = {
    slug: 'juego',
    init(slug) { this.slug = slug; enviar({ type: 'bg-hello', slug }); },
    score(score, opts) {
      opts = opts || {};
      score = Math.round(Number(score) || 0);
      if (score <= 0) return;
      enviar({ type: 'bg-score', slug: this.slug, score, mode: opts.mode || 'default', order: opts.order || 'desc', won: !!opts.won });
    },
  };
})();
