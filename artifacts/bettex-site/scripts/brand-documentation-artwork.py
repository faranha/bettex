"""Place the official BETTEX glyph on the existing documentation artwork.

Original compositions remain untouched in generated-artifacts before editing.
Coordinates use each image's original dimensions, not browser layout.
"""
from pathlib import Path
import shutil
import subprocess
import xml.etree.ElementTree as ET

APP = Path(__file__).resolve().parents[1]
OUTPUT = APP.parents[1] / 'generated-artifacts/documentation-branding'
OUTPUT.mkdir(parents=True, exist_ok=True)
SVG = '{http://www.w3.org/2000/svg}'
logo = ET.parse(APP / 'public/bettex-mark-gamblefi.svg').getroot()
# Reuse the exact official B contours, without the surrounding app-icon tile.
glyph = ''.join(ET.tostring(path, encoding='unicode') for path in list(logo)[-2:])

# name: normalized center x/y, width, rotation, presentation
placements = {
    'documentation-agentic-core': (.49, .315, .205, 0, 'core'),
    'bettex-orchestration': (.548, .713, .115, -9, 'hero'),
    'subagent-concept-risk': (.485, .405, .105, 5, 'glyph'),
    'subagent-concept-treasury': (.46, .415, .09, 8, 'glyph'),
    'subagent-concept-governance': (.495, .46, .085, 0, 'glyph'),
    'subagent-concept-crypto': (.48, .43, .12, 2, 'glyph'),
    'subagent-concept-sports': (.49, .415, .105, 0, 'glyph'),
    'subagent-concept-predictions': (.49, .405, .11, -5, 'glyph'),
    'subagent-concept-igaming': (.495, .46, .105, 0, 'glyph'),
}

def run(*args):
    subprocess.run(['magick', *map(str, args)], check=True)

for name, (cx, cy, size, angle, kind) in placements.items():
    destination = APP / f'public/technology/{name}.webp'
    original = OUTPUT / f'{name}-original.webp'
    if not original.exists():
        shutil.copy2(destination, original)
    width, height = map(int, subprocess.check_output(
        ['magick', 'identify', '-format', '%w %h', str(original)], text=True).split())
    badge = OUTPUT / f'{name}-mark.svg'
    if kind == 'hero':
        backdrop = ('<path d="M8 8h48v27L32 59 8 35Z" fill="#101a2e" stroke="#c7d8e9" stroke-width="2"/>'
                    '<path d="M11 11h42v23L32 54 11 34Z" fill="none" stroke="#9b7842" stroke-width="1"/>')
        body = f'<g transform="translate(5 3) scale(.82)">{glyph}</g>'
        view_box = '0 0 64 64'
    else:
        backdrop = ''
        body = glyph
        view_box = '12 10 42 44'
    badge.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view_box}">{backdrop}{body}</svg>')
    icon = OUTPUT / f'{name}-mark.png'
    run('-background', 'none', badge, '-resize', f'{round(width * size)}x{round(height * size)}',
        '-background', 'none', '-rotate', angle, icon)
    icon_width, icon_height = map(int, subprocess.check_output(
        ['magick', 'identify', '-format', '%w %h', str(icon)], text=True).split())
    x, y = round(cx * width - icon_width / 2), round(cy * height - icon_height / 2)
    # A small soft shadow and colored bloom integrate the mark into the device,
    # while keeping its exact vector geometry legible.
    shadow = OUTPUT / f'{name}-shadow.png'
    glow = OUTPUT / f'{name}-glow.png'
    run(icon, '-channel', 'A', '-evaluate', 'multiply', '.8', '+channel',
        '-fill', '#030916', '-colorize', '100', '-blur', '0x3', shadow)
    run(icon, '-fill', '#62baff', '-colorize', '100', '-channel', 'A',
        '-evaluate', 'multiply', '.52', '+channel', '-blur', '0x5', glow)
    rendered = OUTPUT / f'{name}-branded.png'
    run(original, shadow, '-geometry', f'+{x + 2}+{y + 3}', '-composite',
        glow, '-geometry', f'+{x}+{y}', '-composite',
        icon, '-geometry', f'+{x}+{y}', '-composite', rendered)
    run(rendered, '-quality', '88', destination)
    print(f'Branded {name}: {width} × {height}')
