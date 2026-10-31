# Technical base validation

Registration of implementation and actual collection on October 5, 2026. Does not certify financial integrations or full coverage.

## Verified batch coverage

Unique texts by normalized representation hash; controls, repository trees, and aggregated exports are not included in this count. Alternative URLs may point to the same text.

| Platform | Unique technical texts | Preserved technical URLs |
| --- | ---: | ---: |
| Arbitrum | 974 | 988 |
| Ethereum | 514 | 627 |
| Allora | 237 | 240 |
| Robinhood | 2 | 4 |
| Polymarket | 582 | 586 |

The count is a snapshot, not a ceiling. Ethereum collection continuation was in progress after this batch, with 1,356 pending resources. Consult `pnpm docs:status` for the subsequent state.

Resource/discovery failures in the snapshot: Arbitrum 61, Ethereum 268, Allora 2, Robinhood 1, and Polymarket 9. This includes auxiliary endpoints without technical content, missing references, HTTP blocks, and unverified SDK/repository indices. It does not mean unavailability of all platform documents.

Registered exclusions: duplicate languages, out-of-scope assets/content, unvalidated domains/owners, malformed references, and non-existent optional endpoints. **The base is partial.**

## Executed evidence

- Actual HTTPS collection from the five sources. Robinhood: OpenAPI JSON published in official page modules, read without executing JavaScript.
- Queries executed by the agent: Allora (`signed inference authentication`), Polymarket (`Gamma API authentication`), Robinhood (`authentication signature`), and Ethereum (`transaction gas`). Returned snippet, URL/origin, dates, available version, and hash.
- After repeating synchronization: the **2,120 baseline references** maintained the same hash with the same revision identifier; **zero duplicate revision groups** per document/hash and no loss of baseline.
- **23 tool tests** passed: controlled change and historical query, last valid copy preservation, failure recovery, concurrent locking, persistence, 304, deduplication, provenance, robots, SSRF, and unauthorized external data.
- Integrity verified: SQLite `ok`; no hash failures in the batch's originals and normalized texts.
- `pnpm quality` passed, including architecture, tests, TypeScript, backend, build/localization, and frontend documents. The tool step was also re-executed after its last adjustment.
- Homepage remained loading; no interface was added for the base.

## Versions and impact

Inventory found no corresponding adopted SDK nor Solidity source/configuration in the current scope. Therefore, version compatibility was not presumed nor was a compiler adopted.

Git blob/tree are proprietary identifiers, not commits. Where the publisher does not provide a version, the result declares current documentation without an explicit version. Official diff and derived classification/potential impact are separate; collection does not alter operational code, dependencies, or production.

## Actual scheduling

**Inactive daily.** There is a synchronization command and integration contract in `tools/technical-docs/schedule.json`. The background continuation is limited initial collection, not a scheduler.

Published job requires durable shared storage, separate from financial data, and publication authorization. The current workspace and the disk of a Scheduled Deployment should not be presumed shared or persistent between published executions.

Procedures and responsibilities: [technical base](technical-documentation.md), `AGENTS.md` and architectural decision 0005.
