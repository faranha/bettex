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

## SSR image preloads

React's server renderer can hoist preload links for eager images into the rendered root, beyond the image elements themselves.

**Why:** Adding country flags changed protected structure through extra asset-preload links even though all text remained unchanged.

**How to apply:** Account for emitted resource links when deriving authorized structure changes. Use lazy loading for noncritical, below-the-fold images rather than expanding protected baselines to include unnecessary eager preloads.

## Published image availability

Do not treat a working preview as proof that the published app serves the same image assets.

**Why:** A wallet image returned an image successfully in development but returned an HTML 404 from the published app. The source artwork was intact.

**How to apply:** First confirm the environment and page URL actually shown in the user's screenshot; deployment metadata alone does not establish that they are viewing production. Obtain the published URL through deployment metadata when appropriate and check the exact image request's HTTP status and content type. Distinguish a missing published asset from a damaged drawing; preserve the original artwork when correcting delivery.

## Published documentation versus current build

When repeated documentation reports contradict passing rendered-text checks, compare the exact paragraphs served by the published site with the current build before making further copy changes.

**Why:** The published site still served joined sentences from an earlier build after spacing had been corrected throughout the workspace. More isolated source edits did not explain the continued screenshots.

**How to apply:** Check actual published HTML through the verified deployment URL, preserving inline concatenation. Do not assume the user's screenshot came from production; distinguish observed published defects from workspace defects and explain when publishing remains necessary. Audit complete documentation without asking the creator to provide each remaining example.

Text-flow checks must distinguish inline prose from spatially separated labels in cards and diagrams.

**Why:** Naive concatenation incorrectly reported fact cards and diagram captions as joined words even though CSS lays out their labels separately.

**How to apply:** Check real prose boundaries and sentence punctuation without inserting artificial spaces; preserve explicit structural layout separation for badges, card labels and captions. Do not rewrite correct diagram text just to silence a text-only scan.

## Approved navigation removals

An approved removal of duplicate navigation must also update the rendered-structure baseline, even when TypeScript, navigation tests and the preview pass.

**Why:** Removing the documentation breadcrumb deleted its root anchor from server-rendered HTML, so the old structure fingerprint blocked publishing.

**How to apply:** Compare the prior protected structure with the precise approved removal before updating documentation-only fingerprints. Preserve Homepage/Pitch fingerprints and checks for all unrelated links, images and economic rules. Run the complete production build afterward.

For a narrowly authorized Pitch addition, verify that addition separately while retaining exact protection of the preexisting Pitch.

**Why:** The creator authorized a DeFi/DeFAI diagram in Tokenomics and treasury, not a general rewrite of the approved Pitch or its economic rules.

**How to apply:** Isolate only the explicit addition, require its localized content and visual nodes, and keep original text, links and structure unchanged outside it. Do not refresh the whole Pitch baseline just to accommodate a new block.