# Independent continuous BETTEX emulation

## Product requirement

There is no user-facing Simulation area. Test scripts should independently emulate a changing service workload continuously, including unattended 24-hour runs. Randomness must change events and conditions, not fabricate accounting or replace real agent intelligence.

## Findings

- `artifacts/api-server/src/lib/demo-store.ts` starts a six-second emulation timer only in development. It does not require an open browser, but shares the running API's lifecycle.
- `artifacts/api-server/src/lib/demo-state.ts` rotates agents, sizes and arrivals using sequence/modulo rules; prices use sine waves.
- `artifacts/api-server/src/lib/orchestrator.ts` uses a sine-wave result and fixed state transitions. Those are demonstrations, not stochastic workload tests or evidence of economic performance.
- `artifacts/api-server/src/modules/simulation/application/scenario-engine.ts` and `scenario-fixtures.ts` use shared agent/risk/paper-execution/ledger modules with isolated fixture adapters. They cover eleven scenario families, including insufficient funding, expired/duplicate input, exposure, quote changes, partial fills, unavailable liquidity, integration/payment failures and restarts.
- `artifacts/api-server/scripts/simulation-scenarios.test.mjs` verifies these controlled scenarios. The engine is command-driven, not an independent randomized daemon. Its agent/model observations are fixture data, not real AI inference.
- Scenario parameters currently initialize a fixed seed of `1`; there is no seeded workload generator using it to vary arrivals, actors or market conditions.
- Removing the app screen does not require deleting this test engine, its protected API or the existing financial records.

## Recommended runner

Create a separate CLI worker, not another page. It should expose a seed, run ID, duration, wall-clock versus accelerated mode, actor count, workload profile and bounded event rate. Default to a 24-hour wall-clock campaign. Preserve a quick bounded CI mode.

1. **Random generator:** a seeded PRNG with its state persisted. Randomize arrival intervals, actors, valid operation sizes, holding times, provider delays, liquidity/spread conditions and failure selection. Include quiet periods, bursts and stress windows. Replay the same seed and recorded external observations without generating a different campaign.
2. **Persistent world:** a dedicated campaign namespace and explicit simulation-only adapters. Do not share app accounts, wallet balances, PostgreSQL sequences or EVM funding/signers. Abort if isolation is not positively verified. Preserve simulated identities and positions between events rather than recreating a complete canned journey at every tick.
3. **State-dependent actions:** deposits, token purchases/sales, transfers, withdrawals and participation changes must use shared service commands and their actual validation. Generate mostly admissible actions, plus deliberately labelled invalid/retry cases. Market events drive proposals, quoting, fills and settlement. Do not directly write target balances or manufacture successful payouts.
4. **Continuous schedule:** randomized actor actions and market/provider events independent of browser requests. Respect wall-clock round boundaries and actual settlement delays. Accelerated campaigns need an injected clock throughout their adapters, not occasional `Date.now()` calls mixed with virtual time.
5. **Failure model:** partial execution, insufficient funds, stale observations, duplicate delivery, missing liquidity, delayed/failed confirmation, provider outages, losses, reserve pressure, process interruption and recovery. Keep fault frequency configurable. Ensure long-running campaigns can continue after retained/failed rounds.
6. **Restart safety:** checkpoint world state, event cursor, random-generator state and outstanding commands atomically. A new worker resumes the same run without duplicating receipts or opening new unrelated positions. Use a lease with durable instance identity to prevent concurrent execution of one campaign.
7. **Assertions after events and round close:** reconcile assets/reserve/commitments/free funds, transfers and principal, execution costs, operator service fees, eligibility, payout allocations and treasury snapshots. Fees count on the recorded confirmation once; examples and pending/failed requests are not confirmed revenue. A completed run must expose any invariant breach, not hide it by replacing state.
8. **Evidence:** structured event logs, checkpoints, realized versus unsettled results, fees by round, coverage by actor/action/failure, latency, queue size and violated invariants. Emit a summary with completed duration and remaining open positions. Reports are test evidence, not a new product tab or a claim of investment advantage.

## Intelligence and provider boundary

Use fixture mode for fast reproducible accounting/control tests, explicitly labelled as fixtures. A separate bounded integration mode must exercise the actual deployed agent reasoning and provider adapters, record model/source provenance and observations, and cap request rate and AI cost. Never describe randomized fixture proposals as intelligent investment decisions or real trading.

Do not route a test runner to real-money settlement. Public-chain integration, if later required, must use dedicated testnet accounts and explicit authorization, not existing user/native wallets.

## Hosting and limits

A development workspace is not evidence of unattended 24/7 uptime. Replit's official deployment documentation identifies Reserved VM publishing as the always-on option; Autoscale may scale down to zero, and Scheduled jobs finish after each execution. A continuous worker needs an always-on published runtime, supervision and durable state, with its costs reviewed before publishing. No deployment has been created by this assessment.

Sources: https://docs.replit.com/features/publishing/deployment-types and https://docs.replit.com/billing/about-usage-based-billing.

## Acceptance evidence

- A short deterministic-seed campaign and a replay produce the same event decisions and final test state.
- Different seeds exercise meaningfully different workloads and record coverage.
- A full wall-clock 24-hour campaign completes with the browser closed, across at least one daily round boundary.
- Forced process restart preserves prior receipts, positions, random sequence and accounting.
- An isolated control failure is detected with a useful trace and a nonzero exit status.
- The app's normal dashboard, AI Center, Treasury and History can present authorized test activity without a Simulation navigation item.

## What this change does and does not implement

The user-facing area and navigation are removed; old area URLs redirect to the dashboard. The underlying test engine remains available. This is an assessment and implementation specification for the independent randomized worker—not a claim that a 24-hour run or stochastic live-service validation has already been completed.
