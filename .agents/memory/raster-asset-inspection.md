---
name: Raster asset inspection
description: Visual authenticity and transparency checks, plus font-free raster comparisons.
---

For temporary contact sheets, avoid depending on Python Pillow or ImageMagick montage's default font; use font-free ImageMagick composition instead.

**Why:** Pillow was unavailable here, and montage failed to resolve a font even without requesting visible labels. A font-free composition worked.

**How to apply:** When comparing multiple generated raster assets, compose them in `/tmp` against a contrasting background rather than installing a package only for visual inspection.

Confirm actual alpha before repeating background removal because a thumbnail looks opaque.

**Why:** A removed-background preview appeared to retain the source backdrop, but channel inspection and background-pixel sampling confirmed transparent pixels. The cutout rendered correctly over the application's background.

**How to apply:** Inspect opacity and representative background pixels with ImageMagick, then view the image over a contrasting background or in the app. Do not infer transparency from a thumbnail alone.

Visually verify the identity of logos returned by image search; do not trust a result's title or filename as proof of authenticity.

**Why:** A result labeled as a football club crest actually contained a generic dragon shield with a baked-in checkerboard background. Another source provided the recognizable club mark with genuine transparency.

**How to apply:** Inspect the actual downloaded image before integrating it, compare it with the expected brand identity, and verify alpha. Prefer identifiable source assets over decorative or generated-looking search matches.