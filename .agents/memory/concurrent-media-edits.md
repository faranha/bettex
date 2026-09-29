---
name: Concurrent media edits
description: Workspace file changes can disappear when an asynchronous image-edit job finishes.
---

Await asynchronous image-editing jobs before creating or patching other workspace assets, and verify newly written files after the job completes.

**Why:** A newly added SVG disappeared after a concurrent image-edit job finished, even though the patch had reported success. Repeating the same patch after awaiting the job persisted.

**How to apply:** During image-generation or editing work, dispatch the job, do only read-only inspections while it runs, await its completion, and then make code and asset edits.