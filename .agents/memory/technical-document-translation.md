---
name: Technical document translation
description: Integrity checks needed when translating maintained technical documents with bounded LLM transformations.
---

Treat a translation response as a proposed transformation, not authoritative replacement text. Structured LLM responses may still introduce line citations or numbered-line prefixes, and may normalize URLs incorrectly.

**Why:** Technical English migration exposed inserted citation markers, a numbered-line index and an altered documentation URL despite explicit preservation instructions. Numeric differences also included legitimate date-format and prose-to-number conversions, so raw counts alone were insufficient.

**How to apply:** Split at document boundaries where possible, reject missing chunks, inspect citation/prefix artifacts, compare original and resulting links and numeric tokens, and review semantic differences against the canonical source before saving. Preserve identifiers, economics, external quotations and localization resources.
