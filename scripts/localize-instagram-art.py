"""Localize the supplied profile artwork without altering its photograph or metrics."""

from pathlib import Path
import struct
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "attached_assets/image_1791061130787.png"
OUTPUT = ROOT / "artifacts/bettex-site/public/founder"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SCALE = 2

COPY = {
    "pt": {
        "stats": [("467", "publicações"), ("101 mil", "seguidores"), ("1.159", "seguindo")],
        "category": "Blog pessoal",
        "role": "Ex-diretor de cassino",
        "bio": "A verdade por trás das apostas",
        "community": "COMUNIDADE",
        "buttons": ["Editar perfil", "Ver arquivo"],
    },
    "en": {
        "stats": [("467", "posts"), ("101K", "followers"), ("1,159", "following")],
        "category": "Personal blog",
        "role": "Former Casino Director",
        "bio": "The truth behind betting",
        "community": "COMMUNITY",
        "buttons": ["Edit profile", "View archive"],
    },
    "es": {
        "stats": [("467", "publicaciones"), ("101 mil", "seguidores"), ("1.159", "seguidos")],
        "category": "Blog personal",
        "role": "Exdirector de casino",
        "bio": "La verdad detrás de las apuestas",
        "community": "COMUNIDAD",
        "buttons": ["Editar perfil", "Ver archivo"],
    },
}


def magick(*args, data=None):
    return subprocess.run(
        ["magick", *map(str, args)], input=data, capture_output=True, check=True
    ).stdout


def label(text, size=17, color="#111111", bold=False):
    raw = magick(
        "-background", "none", "-fill", color, "-font", BOLD if bold else FONT,
        "-pointsize", size * SCALE, f"label:{text}", "png:-",
    )
    width, height = struct.unpack(">II", raw[16:24])
    return raw, width / SCALE, height / SCALE


def place(image, text, x, y, size=17, color="#111111", bold=False, center=None):
    raw, width, _ = label(text, size, color, bold)
    if center is not None:
        x = center - width / 2
    if x < 0 or x + width > 984:
        raise ValueError(f"Text exceeds image width: {text}")
    # Feed the label through a separate temporary file: stdin is the base image.
    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".png") as overlay:
        overlay.write(raw)
        overlay.flush()
        result = magick(
            "png:-", overlay.name, "-geometry", f"+{round(x * SCALE)}+{round(y * SCALE)}",
            "-composite", "png:-", data=image,
        )
    return result, width


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for locale, copy in COPY.items():
        image = magick(
            SOURCE, "-resize", "200%", "-fill", "white", "-stroke", "none",
            "-draw", "rectangle 578,258 1950,318",
            "-draw", "rectangle 578,356 1950,407",
            "-draw", "rectangle 642,410 1950,504",
            "-draw", "rectangle 642,550 1950,601",
            "-fill", "#f0f2f5",
            "-draw", "rectangle 210,733 930,797",
            "-draw", "rectangle 1050,733 1790,797",
            "png:-",
        )
        x = 295
        for number, description in copy["stats"]:
            image, number_width = place(image, number, x, 132, bold=True)
            image, description_width = place(image, description, x + number_width + 5, 132)
            x += number_width + description_width + 24
        image, _ = place(image, copy["category"], 295, 181, color="#777777")
        image, _ = place(image, copy["role"], 324, 207)
        image, _ = place(image, copy["bio"], 324, 230)
        # Existing coloured bio icons are retained; only the language changes.
        image, _ = place(image, copy["community"] + " ↓", 324, 277)
        for center, text in zip((280, 710), copy["buttons"]):
            image, _ = place(image, text, 0, 370, size=16, center=center)
        path = OUTPUT / f"instagram-fred-azevedo-{locale}.png"
        path.write_bytes(image)
        print(f"{locale}: {path.relative_to(ROOT)} ({len(image)} bytes)")


if __name__ == "__main__":
    main()