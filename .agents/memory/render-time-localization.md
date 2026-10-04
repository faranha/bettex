---
name: Render-time localization pitfalls
description: Browser/SSR differences and React fragment handling when localizing existing JSX.
---

Em JSX com o runtime de localização do site, colocar `key` antes de props espalhadas (`{...props}`).

**Why:** Babel converte elementos com `key` depois de um spread para `createElement` importado da raiz do `jsxImportSource`. O runtime local não expõe essa raiz, causando erro de módulo mesmo quando o TypeScript passa.

**How to apply:** Ao adicionar atributos compartilhados em listas, preservar `key` antes do spread e conferir a renderização real por Vite/SSR, não apenas o typecheck.

Application-owned JSX runtimes must stay outside Vite dependency prebundling, including explicit optimizer includes added by React plugins.

**Why:** Prebundling cached an early runtime/catalogue and created a separate locale store. SSR passed while the browser attempted to translate stylesheet code and showed stale or mixed-language copy. Excluding aliases alone did not remove React's explicit include.

**How to apply:** Check the actual transformed component import: it must resolve to live application source, not an optimized dependency copy. Keep the locale store and runtime in the same module graph and verify browser switching as well as prerendered output.

DOM selector names must stay unchanged across locales, even when the coverage check requests catalogue entries for them.

**Why:** The source-message collector also picks up literal tag names used by DOM queries. Those are technical identifiers, not visible text; translating them would break navigation.

**How to apply:** When coverage flags a selector, register identical technical values in each language rather than translating the identifier or removing the interaction.

SVG geometry is not language content. Exclude geometry attributes from source extraction rather than requiring translations for drawing commands.

**Why:** Decorative SVG transformations were mistaken for copy and blocked an otherwise valid build. Splitting the transformations into separate groups did not resolve the false positives.

**How to apply:** When adding illustrations triggers missing translations, inspect whether the reported values are visible text or geometry. Keep captions and accessible text in the language audit; keep transformation commands outside it.

Localize React fragments themselves, not only HTML elements. React child grouping can clone elements and discard external WeakMap metadata.

**Why:** Fragment-based headings remained Portuguese even though source catalogues and missing-key checks passed.

**How to apply:** Include fragment children in localization and audit rendered visible text for untranslated source messages. Keep stylesheet/script text and raw diagnostics outside linguistic translation.

Source-message coverage alone does not cover every rendered diagram caption.

**Why:** Diagram captions and node data were omitted from extraction despite appearing on screen. A prop named `to` carried diagram branches, not navigation links. Static coverage passed while strict English prerender failed.

**How to apply:** Run strict prerender and rendered-localization checks for all languages after changing diagram data or indirect text props. Do not infer a prop's meaning solely from its name when excluding subtrees from extraction; distinguish URL values from data arrays. Coverage alone is not evidence that every visible caption is translated.

Catalogue cleanup must preserve resolved runtime messages, not only literals and templates found in source.

**Why:** Pruning to AST-extracted keys removed working translations of concatenated market labels and diagram captions, breaking previously working pages during strict prerender.

**How to apply:** Include observed source-language render messages before removing unused translations. Keep already-localized DOM titles and numbered breadcrumbs outside a second translation pass.

Responsive charts need explicit locale checks for formatter callbacks, even when strict prerender passes.

**Why:** Responsive containers emit no chart ticks during SSR. A new monthly-axis label crashed English only in the browser; translating a prefix before joining a tooltip label also caused double translation.

**How to apply:** Return source-language templates from callbacks wrapped by the localization runtime, not partially translated strings. Exercise ticks and hover labels in every locale independently of SSR.

Use parameterized translations for statements containing changing numeric thresholds, instead of adding a separate catalogue entry for each formatted number.

**Why:** A threshold assembled from data passed source coverage but failed English prerender because the final text contained a newly formatted number with no matching translation.

**How to apply:** Translate the wording independently of the numeric value and audit the rendered result in all languages. Preserve locale-specific number formatting rather than assuming a Portuguese-formatted value is the runtime translation key.

The visual pilot deliberately uses explicit PT/EN/ES tuples outside the site's automatic JSX translator. Keep an independent localization audit for that surface.

**Why:** Automatically extracting prepared state, English/Spanish alternatives and fixture identifiers into the site's Portuguese source catalog would double-translate already localized text and treat non-visible state as public copy.

**How to apply:** Audit all three rendered pilot languages, including locale URL changes while preserving in-memory simulation state. Do not assume passing the site's source-catalog check covers the pilot's alternative runtime.

When labels from data are joined before reaching JSX, audit the complete joined text in every language, not just its individual labels.

**Why:** Static source coverage can pass for each label while rendering still fails because the automatic translator receives the joined result as one message.

**How to apply:** Include the final combined wording in the rendered-language audit whenever changing a data-driven list or sequence. Do not treat a passing source-catalog check as sufficient.

Refresh the observed-message inventory when retiring or replacing rendered copy, before removing its translation entries.

**Why:** A stale inventory can keep demanding a sentence that no longer exists in the components, making a valid copy change look like missing localization.

**How to apply:** Recollect rendered messages, then reconcile static and observed coverage and audit the localized HTML. Resolve newly exposed coverage gaps without restoring obsolete public wording.

Locale-formatted dates and currencies must not be sent back through automatic prose translation.

**Why:** Intl can put the currency symbol after the number in Spanish, yielding text the translator treats as a missing sentence even when static catalogue coverage passes.

**How to apply:** Format with the selected locale and mark only the generated value as already translated. Translate surrounding prose normally and validate actual PT/EN/ES rendering, not just source coverage.
