---
name: Production build validation
description: Source checks alone do not cover rendered Pitch copy and regenerated documentation exports.
---

For Pitch copy, shared components used by the Pitch, and documentation exports, run the complete production build before declaring the changes ready to publish.

**Why:** Type checks and translation coverage passed, but rendered English/Spanish narrative and a stale spreadsheet expectation still blocked publishing later in the build.

**How to apply:** Use the artifact-scoped build environment. Preserve editorial and export checks; correct copy or align outdated expectations with the approved product scope rather than bypassing validation. Check regenerated outputs, not only committed downloads.