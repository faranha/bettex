---
name: Render-time localization pitfalls
description: Browser/SSR differences and React fragment handling when localizing existing JSX.
---

Application-owned JSX runtimes must stay outside Vite dependency prebundling, including explicit optimizer includes added by React plugins.

**Why:** Prebundling cached an early runtime/catalogue and created a separate locale store. SSR passed while the browser attempted to translate stylesheet code and showed stale or mixed-language copy. Excluding aliases alone did not remove React's explicit include.

**How to apply:** Check the actual transformed component import: it must resolve to live application source, not an optimized dependency copy. Keep the locale store and runtime in the same module graph and verify browser switching as well as prerendered output.

DOM selector names must stay unchanged across locales, even when the coverage check requests catalogue entries for them.

**Why:** The source-message collector also picks up literal tag names used by DOM queries. Those are technical identifiers, not visible text; translating them would break navigation.

**How to apply:** When coverage flags a selector, register identical technical values in each language rather than translating the identifier or removing the interaction.

Localize React fragments themselves, not only HTML elements. React child grouping can clone elements and discard external WeakMap metadata.

**Why:** Fragment-based headings remained Portuguese even though source catalogues and missing-key checks passed.

**How to apply:** Include fragment children in localization and audit rendered visible text for untranslated source messages. Keep stylesheet/script text and raw diagnostics outside linguistic translation.

Source-message coverage alone does not cover every rendered diagram caption.

**Why:** A changed caption stored in a diagram data object's short field was omitted from extraction. Static coverage passed, but strict English prerender failed on that visible caption.

**How to apply:** Run strict prerender and rendered-localization checks for all languages after changing diagram data or indirect text props. Register missing visible captions even when the extraction-based check reports full coverage.