---
name: Raster asset inspection
description: Environment quirk when comparing generated transparent character images.
---

For temporary contact sheets, avoid depending on Python Pillow or ImageMagick montage's default font; use font-free ImageMagick composition instead.

**Why:** Pillow was unavailable here, and montage failed to resolve a font even without requesting visible labels. A font-free composition worked.

**How to apply:** When comparing multiple generated raster assets, compose them in `/tmp` against a contrasting background rather than installing a package only for visual inspection.