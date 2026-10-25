---
name: Responsive text verification
description: Reliable responsive text and carousel geometry checks.
---

Treat browser text-range intersections as a possible collision, not conclusive evidence that painted letters overlap. Compact display headings can have overlapping font-leading bounds across adjacent lines.

**Why:** A narrow-phone check flagged the Pitch heading even though its letters remained visibly separate. Range rectangles include more than the painted glyphs.

**How to apply:** Confirm ambiguous heading intersections visually and allow only a bounded overlap between adjacent lines of the same heading. Continue rejecting intersections between separate blocks and text clipped by ancestors.

Closed reference panels can expose descendant table dimensions even though those tables are not currently painted.

**Why:** A documentation audit reported large table heights from closed reference panels, while the actual carousel wrapper was not visible. An interaction check then timed out waiting for that closed content.

**How to apply:** Check closed `details` ancestors when classifying visibility; deliberately expand references and technical panels when auditing their contents. Inspect real SVG series and text, not only container dimensions. Decorative arrows outside a diagram card are not text clipping.

For compact financial comparisons on mobile, constrain the descriptive column and wrap its text rather than keeping every column on one line.

**Why:** Long step descriptions made the first column occupy the entire phone viewport, hiding every numeric column until a swipe.

**How to apply:** Keep at least the step and its adjacent result readable together where the viewport permits; preserve horizontal access to all columns and the full desktop/print table.

Verify carousel stability against current local references, not an absolute navigation position captured before the page settles.

**Why:** Initial absolute baselines produced misleading displacement assertions while the current first-slide height and the gap between content and controls were correct. Font or upstream layout timing was suspected, not established.

**How to apply:** Wait for the destination slide to be visible. Measure its stage, the intrinsic first slide and the navigation gap in the same browser evaluation. Compare positions relative to the section when checking movement between slides.