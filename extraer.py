import os

archivos_clave = [
    "index.html", "css/styles.css", "js/main.js", "js/games-data.js",
    "pages/juego.html", "pages/social.html", "pages/impostor/index.html",
    "pages/games/kit/bg-kit.css", "pages/games/kit/bg-kit.js",
    "pages/games/plantilla-juego.html", "pages/games/juego-local-1.html"
]

base = "gor2games" if os.path.exists("gor2games") else "."

with open("codigo_para_ia.txt", "w", encoding="utf-8") as salida:
    for ruta in archivos_clave:
        ruta_completa = os.path.join(base, ruta)
        if os.path.exists(ruta_completa):
            salida.write(f"\n=== ARCHIVO: {ruta} ===\n")
            with open(ruta_completa, "r", encoding="utf-8", errors="ignore") as f:
                salida.write(f.read())

print("¡Listo! Sube el archivo codigo_para_ia.txt al chat.")