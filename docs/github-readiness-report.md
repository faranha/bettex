# GitHub and technical-review preparation report

## Disposition

**Automatic synchronization implemented locally; activation pending authenticated Git transport.**

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
preparation: its smoke test expects an obsolete Portuguese heading. It is not
part of `pnpm quality`, was not disabled, and remains an explicitly reported
test-maintenance limitation. Its expected copy and locale setup need review
against the approved Pitch and the English first-visit default.

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

See [github-sync.md](github-sync.md) for exact commands, pause/recovery and
troubleshooting. The watcher cannot execute while the workspace is inactive.
Its local startup recovery does not provide always-on hosting.

## Grant-review readiness

Ready for private **engineering review with explicit limitations**, not a
production-finance claim. Public-testnet end-to-end evidence, validated
Allora/event models, real-provider execution, independent audit, production
authority and any public redistribution/license decision remain distinct gates.
The existing blockchain, tokenomics and alpha agent/subagent architecture
are preserved.
