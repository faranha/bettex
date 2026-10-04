---
name: SVG animation verification
description: Avoid confusing icon SVGs with the animated scene when checking motion controls.
---

Target the animated scene explicitly when checking SVG playback, rather than selecting the first SVG inside its container.

**Why:** Control buttons contain icon SVGs too. A browser check selected a button icon and reported that playback was not paused, although the actual scene and its walking agents were correctly frozen.

**How to apply:** Select the scene by its dedicated selector or reference. When SVG animation and JavaScript movement coexist, check both the scene clock and the agents' unchanged positions during pause.

Before/after content-preservation checks must account for nondeterministic animated geometry.

**Why:** Fresh homepage renders can produce different randomized scene coordinates even when no content or artwork source changed. Exact whole-page HTML comparisons can incorrectly report an unauthorized content edit.

**How to apply:** Compare stable page markup, copy, image references and SVG labels separately from randomized animation geometry, and confirm the artwork source was untouched. Do not weaken checks for the approved text or other stable content.