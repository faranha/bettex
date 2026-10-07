---
name: Localization catalog scope
description: Distinguish global translated copy from isolated multilingual tuples, protocol metadata and compiler-only types.
---

The site catalog audit must only collect copy handled by the site's translation runtime. Isolated three-language UI tuples and their export/data helpers need their own language audit; grammar-normalization dictionaries and TypeScript literal types are not page copy.

**Why:** Scanning those strings as Portuguese source text produced hundreds of false missing-translation errors and blocked the production build despite complete three-language UI labels.

Neutral symbols, proper place names and numeric hour units are not untranslated prose. Word-boundary matching of a bare unit letter does not cover a unit attached to digits.

**Why:** The language audit misclassified currency tickers and a São Paulo time annotation; matching the standalone hour letter still rejected `24h`.

**How to apply:** Recognize complete neutral tokens without exempting surrounding human-readable copy. Keep new isolated history interfaces in the multilingual audit.

**How to apply:** Keep isolated UI files covered by the explicit multilingual audit when excluding them from the global catalog collector. Do not bypass either audit, translate financial field names, or treat erased compiler types as rendered text. Dynamic three-language tuples should use the typed tuple translator.
