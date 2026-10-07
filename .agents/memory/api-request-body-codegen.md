---
name: Request body codegen names
description: Avoid duplicate type and validator exports when generating new API mutations.
---

Use named component schemas for new mutation request bodies instead of inline objects.

**Why:** Inline objects caused the generator to export the same operation-body identifier separately as a validator and a type through wildcard barrels; the subsequent TypeScript library build failed. Referencing a named component schema avoids that ambiguous export.

**How to apply:** Define the request body's component schema in the OpenAPI source and reference it from the endpoint, then run codegen and its library type check. Do not hand-edit generated output to hide the collision.
