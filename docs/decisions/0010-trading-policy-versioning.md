# Published definitions and policy composition

Structured definitions belong to the risk domain; the editable configuration resides in Git. The database stores immutable published copies, approvals, environment-specific activations, and an append-only history. Applications exclusively consume published compositions to authorize new entries.

**Why:** duplicated parameters in agents and execution can diverge; simple overrides allow removing upper limits. The composition has an explicit partial order by field and produces a verifiable identity, preserved with evidence and decisions.

The type contract `risk/domain/policy-model.ts` is shareable only via TypeScript type imports, for agents and execution already authorized to depend on risk. The architectural verifier allows only this explicitly registered file and only type-erased imports. Value imports continue to follow public indices and existing layers. No shared package/service or executable dependency between domains is created to transport metadata.

Clock and ID generation enter the service via ports; Git, hashing, SQL, and authentication remain in adapters/composition. JSON definitions do not contain executable functions.

Activation and paper execution share the subledger lock. Positions maintain the historical plan; emergency controls only restrict maintenance/exit. Rollback does not rewrite the past. The first dashboard uses existing development governance and does not enable production administration.
