# Trading, alpha, and allocation policies

> **Spot design direction:** the creator selected BTC, ETH and SOL spot without leverage for the initial Crypto mandate. See [the proposed spot baseline](trading-spot-base.md). The prediction-contract policies below remain a separate historical simulation design; they do not define or authorize spot trading. The application remains a visual demo.

## Scope and responsibility

Integration pendencies and creator decisions are tracked in [Allora and Polymarket Integrations](integration-pendencies.md). The existence of these policies does not resolve data/model gaps nor authorize bypassing them.

The risk module possesses definitions, composition, and governance. Agents preserve evidence and assessments; execution possesses the paper cycle; the subledger belongs to the ledger; the history uses the existing audit module. There is no parallel service, new custody, nor arbitrary executable configuration.

This delivery is exclusively for development/simulation. It does not publish production administration, does not supply the subledger, does not issue mandates, does not send orders to Polymarket, and does not authorize real allocation. The conservative parameters of the first set are technical, not an economic approval.

## Source and publication

- Principles/methodology: this documentation and architectural decisions.
- Canonical definitions: `artifacts/api-server/src/modules/risk/domain/policies/{global,strategy,btc,eth,sol}.vN.json`.
- Database: immutable published versions, activation control by environment, and append-only change events.
- Evidence: existing records of opportunities, decisions, orders, and positions in JSONB. The observed books include prices/sizes, times, hash, and event metadata; the capture limits each side to 100 levels and explicitly reports truncation. A truncated book does not prove executable depth.

Create a `*.v2.json` file, indicate `previousVersion` with `id/1`, review, and commit. Do not edit a published version to change behavior. Discovery selects the highest numbered version of each key; an uncommitted file remains a draft. Publication reads the content of the indicated Git commit, validates schema, scope, ancestry, and known implementations, and records content/hash/commit/path/author/justification. The database is not another parameter editor.

Without verifiable Git, one does not declare fictitious provenance nor publish from a loose file. The operational resolver reads only published versions from the database.

Flow: draft in Git → validated/published version → human approval independent of the author → authorized human activation. Replacement preserves the previous version; rollback reactivates an approved previous version, without erasing operations. Revocation removes activation and blocks entries.

## Composition and controls

Treasury/global → strategy/predictions → specialist/BTC, ETH, or SOL → environment.

Maximum limits, data age, horizon, losses, and attempts can only decrease in lower layers. Defensive reserve, wait between attempts, advantage threshold, and cooldown can only increase. Assets, markets, and sources can only become non-empty subsets. Requirements for calibrated model, full costs, exit plan, and reconciliation cannot be turned off. A lower layer does not turn off the upper suspension.

The resolver returns the configuration, IDs of the three versions, hashes, implementations, and a SHA-256 identifier of the composition. The governance review identifies the reading instant, but changes in another specialist do not change the economic identity of this composition.

Public capture continues recording observations without active policy, but does not qualify them. With active policy, opportunities become linked to the composition and preserve the terms used. The same risk function verifies qualification, selection, pre-order, and each simulated fill. Unauthorized sources, missing estimates, incomplete costs, stale data, and outdated composition block entry.

Resolution for selection, order creation, and fill occurs in the same transaction/lock of the paper subledger. Activation uses the same advisory lock, preventing policy change between conference and reservation/posting. BTC, ETH, and SOL compete for the same capital and exposure; a change in BTC does not release the ETH reserve.

Decisions preserve candidate and policy snapshot. Orders preserve quotes submitted and used in fills. Positions preserve original policy and exit plan; current emergency controls may tighten quote age, maximum duration, and loss limit. Pending entries are subject to reanalysis/cancellation, without rewriting open positions. Old records without published snapshot require explicit review; they do not receive a presumed policy.

Execution events record original composition, checked composition, and differences by field. Activation, revocation, and rollback record actor, reason, revision, and differences. Paper profit does not become distribution or treasury profit.

## Administration and permissions

Interface: Treasury → Policies, also accessible by My account.

API: `GET /api/treasury/policies` and `POST /api/treasury/policies`.

Uses native session and existing test account permissions. Read requires `treasury_view`; proposal `treasury_propose`; publication `treasury_policy`; approval `treasury_approve`; activation/rollback `treasury_activate`; revocation `treasury_pause`. Agents may propose, never approve/activate. Approval by the author themselves is refused on the server.

Commands require CSRF, permitted origin, justification, and expected revision. Permissions are conferred on the server/in the transaction; visible buttons do not grant authority. Session changes clear dashboard caches. There is no automatic grant of authority to test this delivery.

The screen shows sources/commits/hashes, versions/states/approvals, current composition by specialist, affected open operations, and audit. The query shows the 200 most recent versions/changes and includes older active versions; the database keeps the entire history.

Production refuses these commands: governance today is linked to development test accounts. Enabling production governance requires its own identity/permissions, reliable publication process, and separate operational review.

## Traceable example BTC/ETH/SOL

1. Publish and approve `prediction-simulation-policy/1`, `event-probability-hold/1`, and `prediction-{btc,eth,sol}/1` from the definition commit.
2. Activate global and strategy and, separately, each specialist. The absence of any layer leaves that asset blocked.
3. Open AI Central. For a BTC observation, the composition links `development:treasury:prediction-simulation-policy/1`, `development:strategy:event-probability-hold/1`, and `development:specialist:prediction-btc/1`. ETH/SOL replace only the third layer and have their own identifiers.
4. The opportunity path preserves snapshot, sources, times, model/probability (or its absence), costs/liquidity (or absence), decisions, and versions. Even with active policy, the current collector does not have a calibrated probability model or complete quote: it requests update and holds capital, it does not invent return.
5. If in the future there is a complete proposal and approved **simulated** budget/mandate, the selection reserves capital; the order and each fill check the composition and controls again. Incompatible change requires new analysis. The synthetic example of the tests verifies this conference, without recording a fictitious opportunity in the application.
6. Activating a more restrictive global version records differences and makes old entries incompatible. Positions already open remain linked to the original snapshot, with emergency monitoring. Rollback changes only the current version and remains audited.

## Verification

`check:trading-policies`, `check:agents`, and `check:paper` on the API server verify schema/Git, composition without loosening, idempotency, independent approval, activation/rollback/revocation, current identity, subledger, partial execution, and isolation between specialists.

Previous economic pendencies remain: calibrated event probability, complete costs/spread/slippage and depth, resolution feed, and simulated budget/mandate authorization. This infrastructure does not prove economic advantage nor authorize real trading.
