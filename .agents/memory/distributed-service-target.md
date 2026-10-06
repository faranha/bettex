---
name: Distributed-service target
description: Creator's architectural target and its relationship to current canonical service-extraction guidance.
---

The creator requires: “Tem que ser tudo distribuído, tudo microsserviços, tudo considerando aquela documentação e a orientação canônica inicial.”

**Why:** The creator explicitly stated this target when requesting a systems analyst review of organization, practices, optimization and large centralized TypeScript files.

**How to apply:** Keep independently deployed services as the stated target, rather than describing internal modules as microservices. Reconcile it explicitly with the adopted gradual-extraction decision before structural implementation. The review request did not authorize broad refactoring, database migration or loss of financial atomicity.
