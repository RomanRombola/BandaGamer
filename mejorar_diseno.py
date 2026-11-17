import os

base = os.path.dirname(os.path.abspath(__file__))
if os.path.exists(os.path.join(base, "gor2games")):
    base = os.path.join(base, "gor2games")

mejora_portal = """
/* === V7 PRO VISUAL UPGRADE === */
body {
  background-color: #07070c;
  background-image: 
    radial-gradient(circle at 15% 10%, rgba(255, 102, 0, 0.10) 0%, transparent 40%),
    radial-gradient(circle at 85% 85%, rgba(0, 170, 255, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(255, 230, 0, 0.03) 0%, transparent 60%);
  background-attachment: fixed;
}

header {
  background: rgba(10, 10, 18, 0.82) !important;
  backdrop-filter: blur(18px) saturate(160%) !important;
  border-bottom: 1px solid rgba(255, 102, 0, 0.28) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.65);
}

#sidebar {
  background: rgba(14, 14, 24, 0.78) !important;
  backdrop-filter: blur(14px);
  border-right: 1px solid rgba(255, 255, 255, 0.07) !important;
}

.sidebar-cat.activo, .sidebar-cat:hover {
  background: linear-gradient(90deg, rgba(255, 102, 0, 0.18), transparent) !important;
  border-left: 3px solid var(--color-primary) !important;
  text-shadow: 0 0 10px rgba(255, 102, 0, 0.4);
}

.game-card {
  background: linear-gradient(165deg, rgba(30, 30, 46, 0.9), rgba(16, 16, 26, 0.95)) !important;
  border: 1px solid rgba(255, 255, 255, 0.09) !important;
  border-radius: 14px !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
  transition: transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.2), box-shadow 0.28s ease, border-color 0.28s ease !important;
}

.game-card::after {
  content: '';
  position: absolute;
  top: 0; left: -120%;
  width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
  transform: skewX(-25deg);
  transition: left 0.55s ease;
  pointer-events: none;
  z-index: 3;
}

.game-card:hover::after {
  left: 140%;
}

.game-card:hover {
  transform: translateY(-6px) scale(1.025) !important;
  border-color: rgba(255, 102, 0, 0.65) !important;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.75), 0 0 22px rgba(255, 102, 0, 0.35) !important;
}

.card-info {
  padding: 12px 14px !important;
  background: linear-gradient(to top, rgba(8, 8, 14, 0.95), rgba(18, 18, 30, 0.6));
}

.card-categoria {
  background: rgba(0, 170, 255, 0.12);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(0, 170, 255, 0.25);
}

#buscador {
  background: rgba(22, 22, 36, 0.85) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 12px !important;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
}

.perfil-header {
  background: linear-gradient(135deg, rgba(255, 102, 0, 0.1), rgba(0, 170, 255, 0.06)) !important;
  border: 1px solid rgba(255, 102, 0, 0.28) !important;
  box-shadow: 0 0 16px rgba(255, 102, 0, 0.12);
}

.jp-panel, .pstat-card, .tienda-card, .ranking-fila {
  background: linear-gradient(160deg, rgba(26, 26, 42, 0.88), rgba(15, 15, 26, 0.92)) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.09) !important;
}
"""

mejora_kit = """
/* === V7 PRO GAME KIT UPGRADE === */
#bg-top {
  background: rgba(10, 10, 24, 0.88) !important;
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.bg-pill {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)) !important;
  border: 1px solid rgba(255, 255, 255, 0.14) !important;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.35);
}

#bg-stage canvas.bg-canvas {
  border-radius: 14px !important;
  box-shadow: 
    0 0 0 1.5px color-mix(in srgb, var(--bg-accent) 45%, transparent),
    0 0 35px color-mix(in srgb, var(--bg-accent) 18%, transparent),
    0 20px 60px rgba(0, 0, 0, 0.85) !important;
}

.bg-card {
  background: linear-gradient(165deg, rgba(22, 22, 42, 0.92), rgba(10, 10, 22, 0.96)) !important;
  backdrop-filter: blur(16px);
  border: 1px solid color-mix(in srgb, var(--bg-accent) 35%, rgba(255,255,255,0.1)) !important;
  box-shadow: 0 0 40px color-mix(in srgb, var(--bg-accent) 20%, transparent), 0 25px 70px rgba(0, 0, 0, 0.8) !important;
}

.bg-btn.primary {
  box-shadow: 0 8px 26px color-mix(in srgb, var(--bg-accent) 55%, transparent), inset 0 1px 1px rgba(255, 255, 255, 0.35) !important;
}
"""

def aplicar(ruta_rel, bloque):
    ruta = os.path.join(base, ruta_rel)
    if not os.path.exists(ruta):
        return
    with open(ruta, "r", encoding="utf-8") as f:
        contenido = f.read()
    marca = bloque.strip().splitlines()[0]
    if marca in contenido:
        contenido = contenido.split(marca)[0]
    with open(ruta, "w", encoding="utf-8") as f:
        f.write(contenido.rstrip() + "\n\n" + bloque.strip() + "\n")
    print(f"Actualizado con éxito: {ruta_rel}")

aplicar("css/styles.css", mejora_portal)
aplicar("pages/games/kit/bg-kit.css", mejora_kit)
print("¡Rediseño visual aplicado! Abre index.html en tu navegador para probarlo.")