---
name: Production build validation
description: Source checks alone do not cover rendered Pitch copy and regenerated documentation exports.
---

For Pitch copy, shared components used by the Pitch, and documentation exports, run the complete production build before declaring the changes ready to publish.

**Why:** Type checks and translation coverage passed, but rendered English/Spanish narrative and a stale spreadsheet expectation still blocked publishing later in the build. Editorial guards have also retained obsolete cover placement and singular wording after approved copy was reorganized.

**How to apply:** Use the artifact-scoped build environment. Preserve editorial and export checks; correct copy or align outdated expectations with the approved product scope rather than bypassing validation. When audience copy moves out of a hero, enforce its presence in the dedicated audience section; accept grammatical singular/plural equivalents without dropping the substantive rule. Check regenerated outputs, not only committed downloads.

Changes to the isolated demo's translated UI also need both demo and site localization audits, not only TypeScript and browser checks.

**Why:** Central navigation and Polymarket UI worked in the preview but stopped publishing at the translation audit. The next audit also collected technical SVG mask settings as visible copy.

**How to apply:** Check the distinct localization scopes whenever editing rendered labels or translation declarations. Keep SVG rendering attributes out of prose catalogs instead of inventing translations for them. Run the complete production build before saying a publishing failure is resolved.

## Published image availability

Do not treat a working preview as proof that the published app serves the same image assets.

**Why:** A wallet image returned an image successfully in development but returned an HTML 404 from the published app. The source artwork was intact.

**How to apply:** First confirm the environment and page URL actually shown in the user's screenshot; deployment metadata alone does not establish that they are viewing production. Obtain the published URL through deployment metadata when appropriate and check the exact image request's HTTP status and content type. Distinguish a missing published asset from a damaged drawing; preserve the original artwork when correcting delivery.