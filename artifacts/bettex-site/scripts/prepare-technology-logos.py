"""Extract the supplied raster marks without their opaque poster backgrounds."""
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[3]
OUTPUT = ROOT / "artifacts/bettex-site/public/technologies"


def extract(source, crop, size, background, foreground, ink, name):
    width, height = size
    pixels = subprocess.check_output([
        "magick", str(ROOT / "attached_assets" / source),
        "-crop", crop, "+repage", "-depth", "8", "rgb:-",
    ])
    result = bytearray()
    for offset in range(0, len(pixels), 3):
        # Green is well separated in the Robinhood source; Allora is grayscale.
        value = pixels[offset + 1]
        alpha = max(0, min(1, (value - background) / (foreground - background)))
        # Discard low-level compression noise, not any solid logo detail.
        if alpha < 0.035:
            alpha = 0
        result.extend((*ink, round(alpha * 255)))
    subprocess.run([
        "magick", "-size", f"{width}x{height}", "-depth", "8", "rgba:-",
        "-resize", "524x167" if name == "allora.webp" else "572x112", "-define", "webp:lossless=true",
        str(OUTPUT / name),
    ], input=result, check=True)


extract("image_1791064328137.png", "716x140+214+310", (716, 140),
        254, 27, (244, 241, 232), "robinhood.webp")
extract("image_1791064364365.png", "655x209+449+315", (655, 209),
        23, 241, (241, 241, 241), "allora.webp")

# Lighten only Arbitrum's dark wordmark for the dark band; keep its symbol colors.
pixels = bytearray(subprocess.check_output([
    "magick", str(ROOT / "attached_assets/image_1791064315086.png"),
    "-trim", "+repage", "-resize", "612x156", "-depth", "8", "rgba:-",
]))
for offset in range(0, len(pixels), 4):
    if (offset // 4) % 612 > 165:
        pixels[offset:offset + 3] = bytes((244, 241, 232))
subprocess.run([
    "magick", "-size", "612x156", "-depth", "8", "rgba:-",
    "-define", "webp:lossless=true", str(OUTPUT / "arbitrum.webp"),
], input=pixels, check=True)

# Reuse both parts of the supplied Ethereum lockup in a compact horizontal form.
ethereum = str(ROOT / "attached_assets/image_1791065610734.png")
subprocess.run([
    "magick",
    "(", ethereum, "-crop", "210x342+295+0", "+repage", "-resize", "37x60", ")",
    "(", "-size", "15x60", "xc:none", ")",
    "(", ethereum, "-crop", "800x140+0+409", "+repage", "-resize", "170x30", ")",
    "-background", "none", "-gravity", "center", "+append",
    "-define", "webp:lossless=true", str(OUTPUT / "ethereum.webp"),
], check=True)