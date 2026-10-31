# Isolated simulation executions

Current decision: creator authorization allows fixtures only in explicit simulation mode. A modular `simulation` context coordinates scenarios and possesses its own executions, clock, and persistence, reusing public APIs for agents, risk, execution, ledger, and reconciliation. It does not create a parallel application nor replicate financial engines.

Each execution has an owner, ID, version, clock, scenario, and test parameters. Persistence is independent of financial account/wallet tables, real data alpha, operational paper subledger, and testnet. Scenario accounts and wallets are inert identifiers, without keys.

All mutations require a native development session, allowed origin, CSRF, owner, idempotency, and optimistic revision. They do not grant authority over app policies or resources. Reset eliminates only the owner's selected execution; it preserves the idempotency receipt and generates a new ID.

Probabilities, prices, and scenario limits are provisional validation parameters, not a calibrated model or published economic policy. Reuse participation by balance/time and the 50/25/25 plan already defined. Settlement/distribution locks include open positions and reserves, positive result, defensive reserve, eligibility, and same round; do not create retained profit returns or accumulated fractions.
