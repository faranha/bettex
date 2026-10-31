# GitHub and technical-review preparation report

## Current preparation — 2026-10-11

**Prepared for code review and owner-controlled GitHub integration, not financial
activation. Automatic synchronization remains paused. No commit, push or publication
was performed during this preparation.**

- Added a current-state documentation index, product/reference matrix, demo guide,
  data-provenance and arithmetic explanation, testnet matrix, technical-history map
  and final integration checklist. Canonical decisions explain the reasons.
- Reviewed the demo and preserved testnet logic. The real current API does **not**
  mount `src/routes/index.ts`; it blocks operational requests and does not initialize
  the old account/database/RPC routes. The presence of that router file is not
  evidence that its endpoints are available.
- Clarified that generated statement balances and allocated profits reconcile
  within fixtures, not against independently observed transactions.
- Preserved contracts, chain state, custody, credentials, authorizations, economics
  and existing data. Local/public runtime safety throws remain in place.
- Separated server-side wallet encryption/generation into an infrastructure adapter,
  preserving key derivation, AAD, envelope format and implementation. Three focused
  wallet/encryption tests passed, including identity mismatch and missing configuration.
- Identified individual legacy-file owners and one bounded shared-schema exception.
  This registers architectural debt; it does not claim that distributed services
  have already been extracted.
- Corrected stale assertions for the current roadmap, localized navigation,
  visual page, compact footer and visual environment banner. No operational
  boundary was loosened to satisfy a test.
- Added current API isolation and visual-demo/graph consistency to the quality
  runner. SEO image-size checking is portable and does not require ImageMagick
  to audit versioned JPEGs.

### Verification evidence

The first full historical runner completed 33 groups: 27 passed and 6 failed.
Lint, architecture and obsolete UI assertions were corrected. The three
operational HTTP/runtime integrations remain **unverified/incompatible**, not passed.

The current-product profile completed 34 groups: 33 passed initially; its remaining
UI assertions were corrected and the group passed a focused rerun (95 tests).
All 34 current-profile groups therefore have passing evidence, without a repeated
full execution. Final lint also passed.

Passed coverage includes TypeScript, generated OpenAPI clients, backend models,
contracts/local mock-EVM tests, builds, localization, secrets/dependency checks,
visual transport, real current API denial of 20 mutation requests, graph/history
consistency, server tests and SEO/social-image checks.

Local, Git-ignored evidence:

- `generated-artifacts/github-preparation/quality.json`: original reference attempt.
- `generated-artifacts/github-preparation/current.json`: complete current attempt.
- `generated-artifacts/github-preparation/current-retry.json`: focused correction.
- `generated-artifacts/github-preparation/current-final.json`: consolidated evidence.

The managed site and API workflows restarted successfully. An anonymous desktop
capture of `/app/central` loaded the visual experience in Portuguese without a
browser runtime error. This was an initial-viewport check, not a full interaction
or accessibility audit. The dense spatial graph still warrants a focused review
of label overlap under rotation, zoom and narrow viewports; this preparation does
not claim that visual limitation is resolved.

The GitHub Actions workflow now selects `quality:current`. **No remote Actions
execution is claimed.** `pnpm quality` still exposes the full historical checks.
See [testing.md](testing.md) for exact exclusions and prerequisites.

### Remaining gates

1. Owner review of the diff, destination, rights/provenance and distribution license.
   Existing MIT package metadata is not a newly approved repository-wide license.
2. Owner-controlled final GitHub integration and confirmation of remote CI.
3. Separate isolated operational harness and economic compatibility review:
   preserved fee-bearing purchase/withdrawal paths do not establish compliance
   with the current no-service-fee policy.
4. Separate public-testnet validation, legal/security review and authorization
   before any activation; none is implied by this repository preparation.

The records below are historical. Their account availability, first-visit language,
quality results, authentication state and synchronization status must not be used
as observations of the current visual product.

## Disposition

**Automatic synchronization implemented locally; activation pending authenticated Git transport.**

## Readiness recheck — 2026-10-06

- The full development runner completed all 33 verification groups: 32 passed
  initially; its sole architectural-map failure was corrected and the failed
  group passed its focused rerun. No failing check was disabled.
- Lint, workspace typechecking, backend rebuild and demo-tab identity tests
  passed again after the infrastructure-file relocation. Generated OpenAPI
  client/Zod files remained unchanged.
- Source, reachable Git history and generated bundles passed the secret-pattern
  scans with zero findings. This is not an exhaustive privacy or rights audit.
- The synchronization guard now distinguishes official Starknet documentation
  sections named `build` from generated build output. A regression verifies
  retained documentation, continued secret blocking, and exclusion of nested
  dependencies and actual compiled output.
- The authenticated native-account dashboard was browser-verified separately:
  ownership, reload, wallet addresses, own history, consistent local read-only
  balances and clearing personal data on logout. No funds were moved or private
  keys revealed; this is not public-Sepolia balance or real-money evidence.
- A push dry run targeting only `development/bettex` failed with a GitHub
  authentication error. **No GitHub upload or Actions run is claimed.**
- The watcher was intentionally paused for this preparation. Connect native Git
  credentials before resuming it. Preserve the public destination and `main`.

## Previous preparation record

- Development branch: `development/bettex`.
- GitHub destination: public `faranha/bettex`, now explicitly authorized by the
  creator. Public visibility and `main` must remain unchanged.
- GitHub verified remote commit: **none**. No upload is claimed.
- GitHub API connection: healthy. Native Git push authentication is missing.
  Repository-scoped temporary deploy-key creation was denied by the connector
  with HTTP 403; temporary local key material was removed.
- Existing Git history preserved; no production merge, force push, deployment,
  real funding or real-provider trade.

## Delivered changes

- English README, mandatory AI workflow, contributor/security/architecture and
  maintained technical documentation.
- Supporting guides: architecture, agents, integrations, simulation, development,
  Git synchronization, engineering roadmap and grant readiness.
- English first-visit default; saved Portuguese/Spanish choices preserved.
  English-origin messages retain all three product languages.
- Corrected the technology-logo label so it does not assert partnerships.
- Portable Linux launcher, environment template, pinned toolchain, fresh-database
  preparation, development-only optional Clerk and local-only API proxy.
- Existing lockfiles/configuration retained. Installation no longer deletes
  unrelated lockfiles. Generated review screenshots excluded from Git tracking
  but retained locally. Historic uploads/reference assets preserved.
- Coordinated task/background sync with stable writes, checks, nonempty
  checkpoints, development-only targeting, safe updates, retries, pauses,
  startup recovery, sanitized status/logs and remote-commit verification.
- Index and reachable history secret guards, including commit messages.
  Concurrent user staging is preserved.
- GitHub Actions updated for development branches, frozen installation, Python
  tooling, synchronization tests and existing full quality/contract/build checks.
  Action references are pinned and their public tag refs were checked.

## Verification results

| Check | Result |
| --- | --- |
| `pnpm quality` | Passed locally: lint, secret/dependency/architecture checks, references, generated clients, TypeScript, backend/domain/account security, local contracts, frontend/localization, static server and withdrawal policy |
| `pnpm sync:test` | 16 tests passed, including isolated real-Git remotes, the running watcher automatically pushing an outside-task change, fail-closed privacy checks and exact-repository public authorization |
| Local remote evidence | Tests assert the remote advertises the resulting commit; no-op repeats do not add commits; failure/conflict cases preserve work |
| Frozen clean-copy installation | Passed with a newly installed dependency tree, no copied installed dependencies |
| Clean-copy `pnpm typecheck` and full `pnpm build` | Passed with documented runtime/port context |
| Fresh development database and startup | Passed using an isolated temporary PostgreSQL cluster; API health and Vite-proxied API health confirmed without Clerk or production credentials |
| Localization | All English/Spanish rendered routes passed; three-language documentation and downloads preserved |
| Secret review | No supported pattern findings in working files, bundles and history; staged-index guard also required before the local checkpoint |
| Limited email/provenance review | Candidates were test fixture identities or retained third-party reference contacts, not customer account exports |
| Workflow configuration | YAML parsed, action refs verified, watcher running; **GitHub Actions itself has not run** without the repository connection |
| Public preview | English first-visit page visibly loaded without a manifest runtime failure |

The secret review is not an entropy scan, exhaustive privacy/asset-rights audit,
independent security audit or financial-operational certification.

An existing, separate `pitch-research` workflow was already failing before this
recheck. Its latest reported failure flags research-card text outside the
viewport at 320px. It is not part of `pnpm quality` or the GitHub CI gate, was
not disabled, and remains an explicitly reported visual-test limitation.
Review its visibility assertions against the current horizontal presentation
before claiming that this separate visual check passes.

## Remaining external steps

1. Link GitHub for native Git transport through Replit account settings
   (Connected Services / Git provider) and the project Git pane. The existing
   API-only connector has already been authorized.
2. Use the creator-authorized `faranha/bettex` destination and development branch.
   No license choice or visibility change is made automatically.
3. Enable supported Git transport credentials with repository contents and
   required workflow permissions. Do not put credentials in remote URLs/code.
4. Set the credential-free `origin`, use `development/bettex`, run `sync:once`,
   and verify the advertised remote hash with `sync:status`.
5. Confirm actual GitHub Actions and grant-reviewer access.

See `github-sync.md` for exact commands, pause/recovery and
troubleshooting. The watcher cannot execute while the workspace is inactive.
Its local startup recovery does not provide always-on hosting.

## Grant-review readiness

Ready for private **engineering review with explicit limitations**, not a
production-finance claim. Public-testnet end-to-end evidence, validated
Allora/event models, real-provider execution, independent audit, production
authority and any public redistribution/license decision remain distinct gates.
The existing blockchain, tokenomics and alpha agent/subagent architecture
are preserved.
