# Institutional structure and AI-management inventory

This is a read-only review of the current repository, not an approved migration
plan or a security audit. The localized findings are user-facing report data.

## Current scope and interpretation

The creator clarified that removing a formal company/foundation does **not**
mean removing administration, abandoning control of the contracts, renouncing
ownership, or requiring a DAO. Founders administer the project initially; the
intention is to evolve toward a service managed by AI. Several decisions will
involve the community, but their scope and mechanisms are not yet defined.
Operating resources should come from the treasury, without silently changing
the existing distribution rules.

Absence of a formal entity is not evidence of tax exemption or regulatory
permission. Existing legal-release conditions and security controls remain
unchanged.

## Inputs

- `presentation.pt.json`: public positioning, economic rules, institutional
  vocabulary, diagrams, translations, and exports.
- `control.pt.json`: entry points, administrative permissions, contract powers,
  wallets, accounting, and safety boundaries.
- `dependencies.pt.json`: identity, AI functions, data providers, infrastructure,
  delivery, and development dependencies.

Each finding records its observation, current state, relationship to the
review, a question for subsequent planning, and source anchors. Questions are
not authorizations to remove controls or migrate anything.

## Reproduce

Run `python scripts/audit-decentralization.py`. The script:

1. Enumerates tracked and nonignored first-party files and local artifact builds.
2. Skips credentials, workspace environment configuration, dependency locks,
   private runtime state, dependencies, and caches.
3. Scans text and extracts available Office/PDF text for heuristic occurrences.
4. Separates sources, translations, generated downloads/builds, tests, sandbox,
   research, reference corpus, uploads, and agent memory.
5. Resolves every reviewed finding's path and matching source lines.
6. Generates a self-contained Portuguese HTML report, reviewed-findings CSV,
   candidate-occurrences CSV, coverage CSV, and structured JSON under the ignored
   `generated-artifacts/decentralization-audit/` directory.

It does not contact networks, inspect production/database records, read secret
values, mutate contracts/accounts/permissions, run operational modules, regenerate
product downloads, or publish.

## Reading the evidence

Heuristic keyword occurrences are candidates, **not** individually verified
centralization defects. Tests, historical research, external references, and
stored unused translation keys can produce false positives.

Source line numbers are snapshot-specific. Office/PDF extracted-text locations
are not original page or cell coordinates. Raster images, audio, and video are
listed by filename but are not exhaustively visually inspected. External service
settings, live chain state, published deployment state, private data, and full
Git history are outside this inventory.

The currently inspected API entry point blocks operations and does not import
operational routes or authentication middleware. Preserved modules and test
contracts must not be described as active financial operations.

## Subsequent planning

Use finding IDs and validated evidence as the unit of discussion. Record for
each element whether to retain it, revise institutional copy, automate a function
under bounded authority, preserve historical evidence, or investigate a dependency.
Define economic and administrative decisions before changing derived materials,
tests, contracts, or permissions.
