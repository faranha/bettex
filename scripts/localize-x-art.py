"""Create PT/EN/ES X artwork, retaining the supplied photograph and banner."""

import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "attached_assets/image_1791061168653.png"
OUTPUT = ROOT / "artifacts/bettex-site/public/founder"

# Reuse the lossless text-overlay renderer used for the Instagram artwork.
spec = importlib.util.spec_from_file_location(
    "instagram_art", ROOT / "scripts/localize-instagram-art.py"
)
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)

COPY = {
    "pt": {
        "posts": "651 publicações",
        "edit": "Editar perfil",
        "bio": "Promovo o jogo responsável e falo a verdade sobre cassinos",
        "specialist": "Especialista brasileiro em jogo responsável",
        "sponsors": "Patrocinado pela Gamecheck e Good Game Labs",
        "joined": "Ingressou em junho de 2021",
        "stats": [("277", "Seguindo"), ("8.552", "Seguidores")],
    },
    "en": {
        "posts": "651 posts",
        "edit": "Edit profile",
        "bio": "I promote responsible gambling and tell the truth about casinos",
        "specialist": "Brazilian responsible gambling specialist",
        "sponsors": "Sponsored by Gamecheck and Good Game Labs",
        "joined": "Joined June 2021",
        "stats": [("277", "Following"), ("8,552", "Followers")],
    },
    "es": {
        "posts": "651 publicaciones",
        "edit": "Editar perfil",
        "bio": "Promuevo el juego responsable y digo la verdad sobre los casinos",
        "specialist": "Especialista brasileño en juego responsable",
        "sponsors": "Patrocinado por Gamecheck y Good Game Labs",
        "joined": "Se unió en junio de 2021",
        "stats": [("277", "Siguiendo"), ("8.552", "Seguidores")],
    },
}

SHIFT = 13


def draw(image, text, x, y, size=14, color="#111111", bold=False, center=None):
    _, width, _ = renderer.label(text, size=size, color=color, bold=bold)
    start = center - width / 2 if center is not None else x
    if start < 0 or start + width > 618:
        raise ValueError(f"Text exceeds artwork width: {text}")
    return renderer.place(
        image, text, x, y, size=size, color=color, bold=bold, center=center
    )


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for locale, copy in COPY.items():
        # The upload cuts off the post-count label. Add enough space to show it.
        image = renderer.magick(
            SOURCE, "-resize", "200%", "-crop", "1266x958+0+26", "+repage",
            "-background", "white", "-gravity", "North", "-splice", "0x52",
            "-fill", "white", "-stroke", "none",
            "-draw", "rectangle 1008,494 1210,532",
            "-draw", "rectangle 140,736 1252,868",
            "-draw", "rectangle 630,880 1252,924",
            "-draw", "rectangle 86,944 1252,984",
            "png:-",
        )
        image, _ = draw(image, copy["posts"], 47, 4, size=12, color="#536471")
        image, _ = draw(image, copy["edit"], 0, 234 + SHIFT, bold=True, center=553)
        image, _ = draw(image, copy["bio"], 71, 355 + SHIFT, size=13)
        image, _ = draw(image, copy["specialist"], 71, 375 + SHIFT, size=13)
        image, _ = draw(image, copy["sponsors"], 71, 395 + SHIFT, size=13)
        image, _ = draw(image, copy["joined"], 315, 428 + SHIFT, size=13, color="#536471")
        x = 47
        for number, description in copy["stats"]:
            image, width = draw(image, number, x, 460 + SHIFT, bold=True, size=13)
            image, desc_width = draw(
                image, description, x + width + 4, 460 + SHIFT, size=13, color="#536471"
            )
            x += width + desc_width + 20
        path = OUTPUT / f"x-fred-azevedo-{locale}.png"
        path.write_bytes(image)
        print(f"{locale}: {path.relative_to(ROOT)} ({len(image)} bytes)")


if __name__ == "__main__":
    main()