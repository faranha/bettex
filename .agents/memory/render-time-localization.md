---
name: Render-time localization pitfalls
description: Browser/SSR differences and React fragment handling when localizing existing JSX.
---

Sínteses de fragmentos de texto devem preservar pontuação, separação e função gramatical junto a elementos inline, como negritos. Um trecho que continua a frase deve manter verbo e conectores, não virar um rótulo independente nem repetir o conteúdo mantido fora do fragmento. Testes dessa composição devem concatenar os nós de texto sem inserir espaços artificiais.

**Why:** Uma revisão da documentação juntou valores e frases (“BETTEXDestinação”, “detalhaliberação”, “distribuívelGestão”). O criador também encontrou “StarknetRede” e o equivalente em Arbitrum: a síntese removeu “é” e o espaço após a marca. A extração normalizada usada na auditoria adicionava espaços entre nós e escondia o problema. Mesmo com espaços, o criador voltou a encontrar frases sem verbo e orações independentes emendadas após negritos (“casas de apostas Expansões futuras” e “abertamente, Trilha pública”). Cobertura de idiomas e testes de espaços não comprovam continuidade gramatical.

**How to apply:** Preservar limites de frases e espaços do texto original em todos os formatos da documentação, incluindo cartões e etapas, não apenas parágrafos comuns. Manter verbos e artigos coerentes ao sintetizar trechos e traduzir marcas com o artigo quando necessário. Revisar o fragmento com seus vizinhos: não incluir novamente o ativo ou o título do link que já permanece no JSX. O criador encontrou “USDC.USDC” depois da correção de espaços; cobertura de traduções e testes de junções não detectam duplicações. Conferir a concatenação real dos nós em PT/EN/ES, além dos hashes e da cobertura de traduções, sem alterar o render da homepage ou do Pitch.

O usuário também exige verificar a capitalização de continuações após links: em “a API de trading e o CLOB permitem”, o verbo não inicia uma nova frase.

**Why:** O criador voltou a apontar “CLOB Permitem” como erro de continuidade, não apenas de espaçamento.

**How to apply:** Validar a frase composta no texto renderizado, preservando a minúscula do verbo após o sujeito mesmo quando há negrito ou hiperlink entre os nós.

Preferir a tradução canônica para continuações dentro de parágrafos com negritos e links; sínteses independentes devem operar sobre frases ou parágrafos completos.

**Why:** Encurtar separadamente as partes de uma mesma oração mudou sua função gramatical, mesmo com espaços corretos. Recuperar a continuação original mantém verbos, conectores e condições sem inventar uma frase nova.

**How to apply:** Preservar as sínteses de parágrafos completos. Se for necessário encurtar um parágrafo misto, editar e revisar a composição inteira nos três idiomas; não voltar a resumir seu complemento isoladamente.

A preservação das bordas também precisa abranger os fragmentos editoriais usados em rodapés de diagramas e componentes com classes próprias.

**Why:** A proteção restrita aos contêineres `whitepaper__*` deixou uma frase colada ao link “Governança” no rodapé de um esquema de arquitetura, mesmo após os parágrafos comuns passarem na auditoria.

**How to apply:** Preservar espaços e pontuação dos fragmentos pertencentes ao catálogo editorial da documentação na própria tradução. Manter o escopo por catálogo, não modificar indiscriminadamente a tradução de outras páginas. Auditar ambos os lados das marcas inline e os limites de frases no texto concatenado.

Novos visitantes abrem o site em português. Escolhas manuais de idioma devem continuar preservadas, sem exibir PT antes de redirecionar para EN/ES.

**Why:** O criador relatou a troca automática PT → EN durante o carregamento e escolheu “Português” como padrão para novos visitantes.

**How to apply:** Resolver a preferência antes da primeira exibição do HTML. URLs explicitamente EN/ES prevalecem sobre a preferência salva; armazenamento indisponível não deve forçar inglês.

A extração de mensagens deve distinguir texto exibido de identificadores de transporte, consultas de mídia e traduções explícitas em três idiomas.

**Why:** A validação de publicação tratou rótulos PT/EN/ES já traduzidos, IDs de portal e chaves da sessão demo como mensagens sem tradução, bloqueando uma interface válida.

**How to apply:** Preservar a auditoria do catálogo para prosa traduzida automaticamente, mas não adicionar identificadores técnicos ao catálogo. Tuplas explicitamente localizadas devem manter sua cobertura dos três idiomas e ser verificadas no componente consumidor.

Explicitly localized strings from `x(...)` must bypass the automatic JSX prose translator, including dynamic accessibility labels.

**Why:** New English carousel labels were translated a second time and caused a missing-translation exception that crashed the Pitch, despite passing TypeScript checks.

**How to apply:** Mark the native elements carrying explicitly localized labels with `data-i18n="translated"`. Keep catalogue localization enabled for existing content; verify a rendered non-Portuguese route rather than relying on types or catalogue checks alone.

Photo-author and license metadata are not translatable prose, even when embedded in localized accessibility labels.

**Why:** Source catalogue coverage passed, but multilingual prerendering crashed when a dynamic photographer name was treated as a missing translation.

**How to apply:** Keep attribution metadata intact and localize its surrounding labels explicitly. Include a rendered non-Portuguese page with dynamic credits in publication validation.

Already localized monetary amounts must bypass prose translation whether the currency is before or after the number, including negative amounts.

**Why:** Spanish currency formatting places US$ after the amount; treating it as missing prose translation crashed the entire Pitch even with complete source-catalogue coverage.

**How to apply:** Verify rendered positive and negative money values in each language, not only catalogue coverage. Preserve the locale's formatted amount; do not add individual monetary values as catalogue entries.

Use explicit JSX heading branches when switching heading levels; don't add HTML tag names to the translation catalogue to satisfy extraction.

**Why:** The source-message extractor treats conditional intrinsic-tag strings such as `h2` as translatable copy, even though they are not visible text.

**How to apply:** Prefer conditional `<h2>` / `<h3>` elements rather than a variable containing those tag strings, and verify source-message coverage after changing semantic heading levels.

Keep routing IDs and asset aliases out of scanned copy positions.

**Why:** The source-message extractor scans most string literals, not only translation-call arguments. Route IDs, custom image alias props and quoted asset lookup keys can become false missing-translation failures.

**How to apply:** Reuse existing route definitions instead of repeating technical IDs in expressions. For images, prefer standard `src` props and relative file paths over unrecognized alias strings. Do not add technical identifiers to the translation catalogue to silence these failures.

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

The source extractor can classify Intl option strings such as “percent” as UI messages, even outside JSX.

**Why:** Moving a percentage formatter out of JSX did not remove the false localization requirement; the extractor also scans ordinary source literals.

**How to apply:** Check extracted messages when adding formatting options. For percentage cards, locale-format the numeric percentage and append the symbol, rather than creating fake prose translations for technical enum values.

Technical iframe permissions and request policies must not be treated as translatable copy.

**Why:** Embedding a video caused the locale audit to demand translations for browser permission and referrer-policy values. Translating those values would be incorrect.

**How to apply:** When the audit reports non-visible HTML configuration, exempt the technical attribute from extraction rather than add fake translations. Keep accessible titles and visible captions localized.

Isolated application screens with explicit PT/EN/ES tuples must use the tuple audit, not the site's source-message catalogue.

**Why:** Scanning all three literal alternatives as catalogue source strings creates false translation gaps, including demands to translate English into English. Excluding a screen without adding it to the tuple audit would instead leave it unchecked.

**How to apply:** When extending the isolated app UI, include the new surface in its three-language/JSX audit and exclude it from the prose catalogue extractor together. Verify the full build, not only TypeScript.

An already-localized parent does not disable eager translation of JSX created for its descendants.

**Why:** Explicit PT/EN/ES copy passed source coverage and TypeScript but failed English prerendering: descendant JSX had already tried to translate its English text before the parent exemption was evaluated.

**How to apply:** Fully self-localized components should use the React JSX runtime and translate all visible copy themselves, including shared strings. Mixed components can exempt individual localized text elements. When passing already-translated children or labels into a shared component using the localized runtime, exempt that receiving boundary too. A root-only exemption is insufficient; verify rendered locales.

React diagnostics remain validation findings even when prerendering and semantic documentation checks exit successfully.

**Why:** Structural formatting through the shared JSX runtime produced static-child and key diagnostics while all text, links, localization and economic-rule checks passed.

**How to apply:** When changing rendered child structure, inspect SSR and browser diagnostics as well as the content checks. Respect React's static-child contract and stable-key requirements; a successful build alone does not certify the transformed tree.

Terminology normalization can alter Portuguese source copy too; replacing nouns does not automatically fix grammatical agreement.

**Why:** The round terminology pass changed a masculine reference to a cycle into a feminine round while leaving its determiner unchanged.

**How to apply:** Write new copy using the intended final terminology and audit complete rendered sentences in the source language as well as translations. Do not assume a source string is the final displayed paragraph.
