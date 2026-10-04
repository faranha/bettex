---
name: Responsive text verification
description: Distinguishing text-range geometry from visible glyph collisions in compact headings.
---

Treat browser text-range intersections as a possible collision, not conclusive evidence that painted letters overlap. Compact display headings can have overlapping font-leading bounds across adjacent lines.

**Why:** A narrow-phone check flagged the Pitch heading even though its letters remained visibly separate. Range rectangles include more than the painted glyphs.

**How to apply:** Confirm ambiguous heading intersections visually and allow only a bounded overlap between adjacent lines of the same heading. Continue rejecting intersections between separate blocks and text clipped by ancestors.