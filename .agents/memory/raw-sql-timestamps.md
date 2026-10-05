---
name: Raw SQL timestamps
description: Drizzle raw-query timestamps and cursor precision differ from mapped schema reads.
---
Drizzle/node-postgres raw SQL can return timestamptz as strings, while mapped schema queries return Date objects. Type assertions do not convert runtime values.

**Why:** Assuming Date in a raw history query produced HTTP 503 despite passing TypeScript. The same assumption silently broke comparisons used to identify reconstructed records.

**How to apply:** Normalize timestamps explicitly at display/comparison boundaries. Preserve the original database timestamp string in keyset cursors so conversion through JavaScript milliseconds does not lose database precision. Verify timestamp behavior with a real database integration check, not only type checking.

Generated API schemas may also expect Date objects for HTTP query dates. Decode ISO query strings at the transport boundary before applying the generated schema; do not edit generated validators by hand. Cover valid date ranges through HTTP as well as database queries.
