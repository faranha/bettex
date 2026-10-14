---
name: Production validation side effects
description: Distinguish generated archive metadata changes from actual documentation changes during publishing validation.
---

Full production validation can rewrite tracked DOCX/XLSX archives even when their document contents are unchanged. Treat archive serialization metadata separately from editorial or financial changes.

**Why:** A successful local publishing build changed archive headers while all archive members retained identical contents. Treating every binary diff as a substantive edit would add unrelated changes to a targeted publishing fix.

**How to apply:** Inspect member identities and uncompressed bytes before cleaning generated archive differences. Restore original bytes only when content identity is established and no concurrent changes occurred; preserve any substantive differences for review.

Generated-output cleanup does not require modifying the Git index. Workspace safeguards can block commands that request an index lock, including ostensibly read-only validation commands.

**Why:** Optional Git checks encountered the workspace index-lock safeguard despite successful build and content verification.

**How to apply:** Do not bypass Git safeguards just to finish optional checks. Use the successful substantive validation and content comparisons; distinguish a blocked housekeeping check from a failing application build.
