# BETTEX Agent Hierarchy

Canonical document complementary to the [architecture](architecture.md) and [Treasury control](treasury-governance.md). Source: [creator instruction](../attached_assets/Pasted-Replit-antes-de-aprofundar-o-desenvolvimento-dos-agente_1791181766428.txt).

## Responsibilities and names

```text
BETTEX — orchestrator
└── Prediction Market (predictions)
    ├── BTC Specialist (btc)
    ├── ETH Specialist (eth)
    └── SOL Specialist (sol)
```

BETTEX is the canonical nomenclature for this instruction; BTEX, found in previous material and internal emulation, is the same role, not another agent. This tree describes financial proposal routing, not the entire monitoring inventory. The [operational manual](agents-operations.md) documents the 13 deterministic services: BETTEX, treasury, governance, risk, execution, reconciliation, predictions, BTC, ETH, SOL, sports, crypto and bonus. Controls remain independent of opportunity selection; there is no second financial selection layer.

Sports now discovers public events but lacks a validated event model. Crypto and bonus diagnose missing configuration without commercial provider inputs. Their observation procedures run; their financial strategies and execution integrations remain unavailable. Contextual help and formatting/navigation helpers are documented in [helpers.md](helpers.md).

- Specialist: observes/notes evidence, estimates, and gaps; forwards to the market.
- Market: validates identity, domain, sources, timeliness, price, liquidity, costs, model, risk, and horizon; qualifies/prioritizes only its domain.
- BETTEX: compares qualified proposals, considering capital, net costs, loss, deadline, liquidity, exposure, and correlation; selects or maintains available capital. May require updates or reject everything.
- Treasury/Governance (`risk`): imposes policy, pauses, reserves, obligations, destination, and permissions. Does not seek opportunities nor select investments.
- Existing executor: requires current authorization; local confirmation proves test allocation, not a Polymarket order or profit.

Allora, Gamma, CLOB, and oracles are sources/tools, not hierarchical levels. No agent receives keys or grants privileges. Do not alter economic rules.

## Common contract and states

`Opportunity` in the public `agents` API is immutable by evidence identifier. It contains origin, market/specialist, instrument/intention, sources/schedules/hash, methodology/version, price/costs/liquidity, return/uncertainty, risks/loss/capital, horizon/validity/invalidation, and correlation. Each piece of data is `observed`, `estimated` (with method), or `missing` (with reason). Do not replace absence with zero.

Records distinguish opportunity, BETTEX decision, and financial proposal. States: `needs_update`, `qualified`, `rejected`, `selected`, `awaiting_authorization`, `allocation_authorized`, `allocation_uncertain`, `allocation_confirmed`, `expired`. Specialist → market → BETTEX have their own events and the same correlation. Allocation uses `alpha:<opportunityId>` as governance ID, a durable link with its events/nonce/receipt.

Selecting does not authorize or reserve. The existing controller reserves upon segregated human approval and revalidates before sending. Expired/incomplete alpha proposals or those without a persisted BETTEX decision cannot be approved/executed. Repetition retrieves the same financial proposal, not another transaction. Confirmation continues to query the journal/receipt; agent status is not used as proof.

The **simulated** branch, documented in [Event strategy and subledger](prediction-paper-trading.md), has its own, entirely separate reserve: selection in the simulated comparison may reserve a previously approved *paper* budget; it never reserves the native wallet nor authorizes the legacy financial operation. BTC, ETH, and SOL share a correlated limit. In the absence of a calibrated model, fee method, and approved budget, collection remains observational and no order is created.

## Mapping and technical decisions

| Existing | Alignment |
|---|---|
| `modules/agents` | Pure contract, specialist/market/BETTEX and ports; storage/source in the domain's own infrastructure |
| `lib/orchestrator.ts`, `demo-state.ts` | Internal emulation preserved, no activity in the production process |
| Treasury agent that allocated the maximum available | Replaced by observation of controls; selection belongs exclusively to BETTEX |
| `/treasury/governance` | `analyze` compares alpha proposals and forwards the selection to the risk API; approve/execute remains segregated |
| `audit` | Durable events by composition, without reverse dependency or new parallel history |
| Public demo | “App coming soon, in development” placeholders, including subpages; no operational flow published in the UI |

The opportunities contract is public in `agents`; the HTTP contract is in the existing OpenAPI. The composition injects storage, auditing, and risk control. Opportunity tables are not a financial ledger.

The Market prioritizes qualified opportunities in the batch; BETTEX re-evaluates the set and the budget. The technical comparator uses net return of costs divided by potential loss plus margin of uncertainty and by the horizon, using integers and tie-breaking by ID. Liquidity and exposure are mandatory filters, not confidence scores. This criterion organizes complete proposals; it does not create estimates nor replace future model validation.

`GET /api/agents/alpha` makes available a register of agents, source availability, and up to 50 opportunities with states/evidence, without personal balances. The worker collects only BTC via Gamma/CLOB in the existing process. Selection is persisted before independent forwarding to risk; resumption uses the same terms and ID. Approval and resubmission verify validity and current book/market; reconciliation of a submission already initiated remains in the original executor.

**Justification:** the basis allows qualifying/deciding without inventing a probabilistic strategy or treating a book as a forecast. The first source uses Gamma for discovery and CLOB for asks; Gamma indicative prices are not executable price. Source: [discovery](https://docs.polymarket.com/market-data/discover-markets.md), [books](https://docs.polymarket.com/market-data/prices-order-books.md), [fees](https://docs.polymarket.com/trading/fees.md).

## First alpha and failures

BTC, ETH and SOL collect real Allora forecasts and original Polymarket evidence; sports performs public event discovery. Collection is not financial qualification. Without asks, a valid source, and defined costs/model/estimates/capital/correlation, the opportunity requests an update and BETTEX does not allocate. Observation does not invent this data; there is no implemented calibrated probability model. Book price/volume do not suffice to estimate return.

Limited periodic query with timeout; source failure is persisted, without fictitious fallback. Evidence has an origin timestamp separate from collection; repeating the same evidence does not renew it. Failure preserves old records identified by age/validity, never presenting them as new. Unreconciled external exposure is missing information, not zero exposure.

Mocks remain in fixtures and the internal development demo. Production does not start the demo timer and blocks its API before generating identity, balances, or operations. Existing historical data is not erased.

## Concrete pendencies

- Calibrated BTC strategy/model, complete costs, settlement currency/network, order intention and size, reconciled external correlation/exposure.
- Allora is connected to the chart and BTC/ETH/SOL analysis services; mapping a USD price forecast to a calibrated market-resolution probability remains unimplemented.
- Polymarket orders, signature/custody, funding, and confirmation of fills not implemented. Local USDC allocation does not prove them.
- Public Testnet and institutional control maintain dependencies documented in Treasury.

These gaps block operations; they are not filled with mocks. Consolidate the branch before expanding markets/strategies.

## Verifications performed

- General workspace validation: architecture, generated contracts, types, security, economic rules, and backend/frontend builds approved.
- 11 specific tests: forwarding, priority, comparison/rejection, pause/limits/capital/exposure, authorization, validity, duplication, resumption, and absence of sources/price.
- HTTP/PostgreSQL/EVM in disposable schema and chain: financial controls, segregated authorization, pause, local allocation confirmed, resumption without another transaction, and quarantine after reorg. Alpha records/events survived restart without repeating events; production blocked demo API/timer.
- The EVM fixture is chain ID 31337 and uses declared test sources. It does not prove BTC model, Polymarket order/fill, profit, or purchase on public testnet. Application permissions, balances, and main EVM were not used for this test.
- Real collection confirmed on 10/05/2026 by `GET /api/agents/alpha`: HTTP 200, source `observed`, four Gamma/CLOB observations, all `needs_update` with model/capital explicitly missing. Only Predictions/BTC active; no financial forwarding or profit produced.
