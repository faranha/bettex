---
name: Verification of visual and historical operational scopes
description: Why current-product CI cannot certify preserved operational integrations or revive them to pass tests.
---

Keep current-product verification distinct from historical operational integration
evidence. Retain the full reference checks and report exclusions as unverified,
not passed. Never revive financial runtime or expose old routes just to make CI green.

**Why:** The product direction changed to a visual-only demo, while old integration
tests still assumed operational APIs and retired financial premises. Treating
everything in the repository as the current product would require unauthorized
activation or misstate readiness.

**How to apply:** Choose coverage by the delivered lifecycle, explicitly record
reference limitations, and require a separately authorized compatibility review
before reactivation. Local contract success and illustrative reconciliation do
not prove public-chain deployment or compliance with current economics.
