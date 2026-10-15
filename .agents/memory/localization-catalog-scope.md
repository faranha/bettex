---
name: Localization catalog scope
description: Distinguish global translated copy from isolated multilingual tuples, protocol metadata and compiler-only types.
---

The site catalog audit must only collect copy handled by the site's translation runtime. Isolated three-language UI tuples and their export/data helpers need their own language audit; grammar-normalization dictionaries and TypeScript literal types are not page copy.

For public hero and diagram copy handled by the site runtime, prefer the canonical translation catalog over local objects keyed by PT/EN/ES.

**Why:** Local multilingual objects were scanned as Portuguese source messages, so their English and Spanish values incorrectly became new translation requirements.

**How to apply:** Keep one canonical source message and translate it through the site runtime; reserve isolated multilingual tuples for explicitly isolated, separately audited components.

For editorial photographs, separate neutral asset/rights metadata from visible translated copy. Keep alt text as literal canonical translation calls in the UI.

**Why:** Photo selection keys, filenames, author names and license identifiers were collected as Portuguese prose and caused false missing-translation failures.

**How to apply:** Audit alts and explanatory badges normally, while keeping filenames and original authorship/license metadata in an explicitly isolated metadata module. Do not add fake translations for technical identifiers.

**Why:** Scanning those strings as Portuguese source text produced hundreds of false missing-translation errors and blocked the production build despite complete three-language UI labels.

Neutral symbols, proper place names and numeric hour units are not untranslated prose. Word-boundary matching of a bare unit letter does not cover a unit attached to digits.

**Why:** The language audit misclassified currency tickers and a São Paulo time annotation; matching the standalone hour letter still rejected `24h`.

**How to apply:** Recognize complete neutral tokens without exempting surrounding human-readable copy. Keep new isolated history interfaces in the multilingual audit.

**How to apply:** Keep isolated UI files covered by the explicit multilingual audit when excluding them from the global catalog collector. Do not bypass either audit, translate financial field names, or treat erased compiler types as rendered text. Dynamic three-language tuples should use the typed tuple translator.

Keep technical CSS class literals in JSX `className` attributes rather than standalone string constants in catalog-scanned components.

**Why:** A statement component's standalone CSS class constant was collected as untranslated EN/ES prose and blocked publishing, even though its visible text used complete multilingual tuples.

**How to apply:** Preserve the exact styling selectors; move technical literals into their styling attributes instead of adding fake translations or weakening coverage checks.

Quoted property names in copy dictionaries, routing IDs and locale filename suffixes are identifiers, not visible messages. Audit dictionary values and runtime-observed labels instead.

**Why:** A new short-copy dictionary produced hundreds of false localization failures by collecting its quoted keys; real missing paragraphs and download format labels were mixed into the same report.

**How to apply:** Exclude only verified structural identifiers, preserve runtime collection and multilingual coverage, and check for existing translations before adding entries.

Revisar também os padrões em inglês dos componentes compartilhados, inclusive rótulos de acessibilidade. Cobertura completa de chaves não prova que os valores sejam traduções reais.

**Why:** A auditoria principal passava mesmo com textos de paginação, fechamento e navegação em inglês copiados para o espanhol e sem tradução portuguesa.

**How to apply:** Para controles comuns, verificar os valores efetivos depois da combinação dos catálogos. Não tratar nomes próprios, códigos ou símbolos de moeda como falhas por permanecerem iguais.

JSX isolado no componente pai não isola automaticamente os componentes
compartilhados que ele chama. Rótulos dinâmicos já localizados podem passar
novamente pelo tradutor global, inclusive em atributos de acessibilidade.

**Why:** Um submenu em inglês caiu no limite de erro porque um controle
compartilhado tentou traduzir novamente o rótulo inglês já escolhido pela
interface multilíngue.

**How to apply:** Nas interfaces isoladas com rótulos completos em três idiomas,
usar primitivas nativas quando o wrapper compartilhado impõe uma segunda
tradução. Verificar também o conteúdo aberto de menus e os rótulos de
acessibilidade em EN/ES; a auditoria estática de tuplas sozinha não detecta isso.

Identificadores que selecionam partes de um componente são metadados, não textos da interface.

**Why:** Um novo seletor de documentação foi interpretado como texto traduzível; trocar aspas por uma expressão JSX não mudou a classificação.

**How to apply:** Quando a auditoria exigir tradução de uma chave interna, conferir a classificação de atributos estruturais antes de acrescentar traduções artificiais. Reutilizar a interface estrutural já reconhecida ou delimitar corretamente a nova propriedade, sem desabilitar a auditoria de textos visíveis.

Tuplas documentais novas precisam integrar tanto o catálogo usado em runtime quanto o extrator e a auditoria de fontes. O pragma de JSX nativo não impede que o coletor de títulos encaminhe rótulos já traduzidos ao tradutor global.

**Why:** A coleta do índice retraduziu um título inglês vindo de tuplas completas; depois a extração estática classificou traduções e caminhos técnicos como fontes em português.

**How to apply:** Auditar as três traduções das tuplas, extrair somente a origem em português e permitir aliases localizados onde os wrappers os reprocessam. Manter caminhos técnicos no módulo de dados tipado, fora da varredura de prosa; não criar traduções fictícias para identificadores.
