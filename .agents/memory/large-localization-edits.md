---
name: Large localization edits
description: Avoid partial source/catalogue updates when large callback payloads fail.
---

Prepare large catalogue changes in a successful execution before saving them. After a failed execution, inspect the actual files rather than assuming that in-memory changes survived.

**Why:** A catalogue save exceeded the escaped-payload limit after source edits had already landed. In-memory catalogue changes from the failed execution were not retained, leaving source and translations out of sync.

**How to apply:** Keep only the required catalogue or small deltas in memory, separate preparation from saving, and avoid sending oversized pretty-printed strings through callbacks. Preserve file formatting with local serialization when necessary. Run localization coverage after the whole batch, including accessibility text and fragments around inline elements.