---
name: Technical document translation
description: Integrity checks needed when translating maintained technical documents with bounded LLM transformations.
---

Treat a translation response as a proposed transformation, not authoritative replacement text. Structured LLM responses may still introduce line citations or numbered-line prefixes, and may normalize URLs incorrectly.

**Why:** Technical English migration exposed inserted citation markers, a numbered-line index and an altered documentation URL despite explicit preservation instructions. Numeric differences also included legitimate date-format and prose-to-number conversions, so raw counts alone were insufficient.

**How to apply:** Split at document boundaries where possible, reject missing chunks, inspect citation/prefix artifacts, compare original and resulting links and numeric tokens, and review semantic differences against the canonical source before saving. Preserve identifiers, economics, external quotations and localization resources.

Synthesis needs a semantic audit of conditions and exclusions against an independent source, not just word counts, preserved headings, or agreement between outputs generated from the same editorial catalog. Check each language for drift.

**Why:** Automated shortening produced phrases that canceled paid credits instead of only unpaid credits, reversed a token transfer, and put Spanish into a Portuguese field despite complete structured output. Later structural and volume checks passed while displayed text changed avoidance of double counting into exclusion of transit assets and made uncertain execution sound unspent.

**How to apply:** Treat drafts as untrusted; explicitly audit rights, payment status, asset direction, eligibility, authorizations, and real-versus-simulated claims. Compare the displayed wording against original invariants, independently of the catalog used to generate it. Unknown execution is not non-execution. Reject unsafe versions rather than meeting a word budget by losing rules.
