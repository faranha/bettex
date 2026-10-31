import type { DemoDashboard, AlphaTradingJourney, AlphaTradingSnapshot, AlphaOpportunityRecord } from "@workspace/api-zod";
import { GetAlphaTradingJourneyResponse, GetAlphaTradingResponse } from "@workspace/api-zod";
import { storyPosition } from "./scheduled-demo-story";
import { DEMO_DAY, demoCycleStart } from "./demo-cycle-clock";

const VERSION = "scheduled-story/1";
const units = (n: number) => String(Math.round(n * 1e6));
const iso = (n: number) => new Date(n).toISOString();
const datum = (value: unknown) => ({ kind: "estimated" as const, value, method: "scheduled_story" });
export type DemoTradingQuery = { view: string; asset?: string; state: string; limit: number; cursor?: { id: string } };

/** Read-only projections of the authored ledger. Never feeds live inference,
 * policy approval, paper execution, blockchain signing, or real-market records. */
export function demoTradingJourneys(d: DemoDashboard): AlphaTradingJourney[] {
  if(d.profile.provider === "native" || d.profile.authenticated || d.staking.chartScenario?.source !== "test_scenario")
    throw new Error("scheduled_demo_required");
  const now = Date.parse(d.serverNow), start = demoCycleStart(now);
  const rows: { id: string; market: string; capital: number; net: number; cost: number; opened: number; at: number; closed: boolean; filled: boolean }[] = [];
  for (let ago = 3; ago >= 1; ago--) {
    for (let i = 660; i < 720; i += 4) {
      const p = storyPosition(start - ago * DEMO_DAY, i);
      rows.push({ id: p.id, market: p.market!, capital: p.capitalUsdc!, net: p.netUsdc!, cost: p.costUsdc!,
        opened: Date.parse(p.at) - 600000, at: Date.parse(p.at), closed: true, filled: true });
    }
  }
  for (const op of d.operations.filter(o => o.agent === "crypto")) {
    const entry = storyPosition(start, Number(op.id.split("-").at(-1)) - 1);
    rows.push({ id: op.id, market: op.market, capital: op.capitalUsdc, net: op.pnlUsdc - entry.costUsdc!,
      cost: entry.costUsdc!, opened: Date.parse(op.proposal?.generatedAt ?? op.updatedAt),
      at: Date.parse(op.updatedAt), closed: op.status === "closed", filled: !["approved", "executing", "proposal", "validated"].includes(op.status) });
  }
  return rows.map((row, index) => {
    const asset = row.market.split("/")[0].toLowerCase(), id = `demo:${row.id}`;
    const decisionId = `${id}:decision`, orderId = `${id}:order`, positionId = `${id}:position`;
    const openedAt = iso(row.opened), updatedAt = iso(row.at), price = asset === "btc" ? 65000 : asset === "eth" ? 2600 : 155;
    const quantity = row.capital / price, expected = row.capital * .012;
    const opportunity: AlphaOpportunityRecord = {
      opportunity: {
        id, marketAgent: "crypto", specialist: asset, market: row.market,
        origin: { provider: "scheduled_story", snapshotId: row.id, nature: "internal_fixture" },
        instrument: { id: row.market, name: row.market, outcome: "spot", settlementAsset: datum("USDC") },
        operation: datum("buy"), sources: [{ url: `/api/demo/treasury/activity?roundId=${iso(row.opened).slice(0, 10)}&view=closed`,
          producedAt: openedAt, collectedAt: updatedAt, evidence: row.id }],
        model: datum(VERSION), executablePrice: datum(String(price)), costs: datum(units(row.cost)),
        liquidity: datum(units(row.capital)), estimatedReturn: datum(units(expected)),
        uncertainty: datum("defined_scenario_not_statistical_forecast"),
        risks: ["price_variation", "liquidity", "correlated_crypto_exposure"],
        potentialLossUnits: datum(units(row.capital)), capitalUnits: datum(units(row.capital)),
        horizonSeconds: datum(600), correlation: datum("crypto"), validUntil: iso(row.opened + 660000),
        invalidationConditions: ["price_limit_exceeded", "liquidity_insufficient"],
        strategyVersion: VERSION, policyVersion: VERSION,
        exitPlan: datum("close_at_scheduled_settlement"), orderQuote: datum({ price: String(price), quantityUnits: units(quantity) }),
      },
      state: "allocation_confirmed", revision: 1, reason: "scheduled_story", correlationId: row.id,
      allocationUnits: units(row.capital), queueState: "forwarded_to_execution",
      decisions: ["specialist", "market", "BETTEX", "risk", "execution"].map((layer, i) =>
        ({ layer: layer as "specialist", reason: "scheduled_story", at: iso(row.opened + i * 1000) })),
    };
    const decision: AlphaTradingJourney["decisions"][number] = { id: decisionId, opportunityId: id, asset, state: "selected",
      reason: "scheduled_story", at: openedAt, policyVersion: VERSION, strategyVersion: VERSION, rank: index + 1, requestedUnits: units(row.capital) };
    const order: AlphaTradingJourney["orders"][number] = { id: orderId, opportunityId: id, decisionId, positionId,
      asset, instrumentId: row.market, outcome: "spot", direction: "buy", state: row.filled ? "filled" : "pending",
      quantityUnits: units(quantity), filledUnits: row.filled ? units(quantity) : "0", reservedUnits: row.filled ? "0" : units(row.capital),
      policyVersion: VERSION, strategyVersion: VERSION, createdAt: openedAt, updatedAt: openedAt, reason: "scheduled_story",
      fills: row.filled ? [{ id: `${id}:fill`, at: openedAt, sharesUnits: units(quantity), cashUnits: units(row.capital),
        feesUnits: units(row.cost), price: String(price), source: "scheduled_story" }] : [],
    };
    const position: AlphaTradingJourney["positions"][number] = {
      id: positionId, opportunityId: id, decisionId, orderId, asset, event: row.market, instrumentId: row.market, outcome: "spot",
      state: row.closed ? "closed" : "open", quantityUnits: units(quantity), entryCostUnits: units(row.capital),
      entryFeesUnits: units(row.cost), committedUnits: row.closed ? "0" : units(row.capital), originalExpectedUnits: units(expected),
      realizedUnits: row.closed ? units(row.net) : "0", strategyVersion: VERSION, policyVersion: VERSION,
      openedAt, updatedAt, ...(row.closed ? { closedAt: updatedAt } : {}),
      exitPlan: "close_at_scheduled_settlement", exitState: row.closed ? "confirmed" : "planned",
      resolutionState: row.closed ? "settled" : "unresolved",
      valuations: [{ at: updatedAt, source: "scheduled_story", priceUnits: units(price), producedAt: updatedAt,
        kind: "indicative", stale: false, quantityUnits: units(quantity), liquidatableUnits: units(quantity),
        exitValueUnits: units(row.capital + row.net), unrealizedUnits: row.closed ? "0" : units(row.net),
        updatedExpectedUnits: units(expected), action: row.closed ? "exit" : "hold", reason: "scheduled_story" }],
    };
    return GetAlphaTradingJourneyResponse.parse({
      mode: "paper_trading_no_real_money", opportunity, decisions: [decision], orders: [order], positions: row.filled ? [position] : [],
      events: [...opportunity.decisions.map((e, i) => ({ ...e, stage: e.layer, sequence: i + 1 })),
        ...(row.filled ? [{ at: openedAt, stage: "fill", reason: "scheduled_story", sequence: 6 },
        { at: updatedAt, stage: row.closed ? "settlement" : "valuation", reason: "scheduled_story", sequence: 7 }] : [])]
        .filter(e => Date.parse(e.at) <= now),
    });
  }).sort((a, b) => b.orders[0].updatedAt.localeCompare(a.orders[0].updatedAt));
}

export function demoTradingSnapshot(d: DemoDashboard, q: DemoTradingQuery): AlphaTradingSnapshot {
  const journeys = demoTradingJourneys(d);
  type Record = AlphaTradingSnapshot["opportunities"][number] | AlphaTradingSnapshot["decisions"][number] |
    AlphaTradingSnapshot["orders"][number] | AlphaTradingSnapshot["positions"][number];
  const all = journeys.flatMap<Record>(j => q.view === "opportunities" ? [j.opportunity] : q.view === "decisions" ? j.decisions :
    q.view === "orders" ? j.orders : j.positions.filter(p => q.view === "closed" ? p.state === "closed" : p.state === "open"));
  const filtered = all.filter(r => {
    const asset = "opportunity" in r ? r.opportunity.specialist : r.asset;
    const state = "queueState" in r ? r.queueState : r.state;
    return (!q.asset || asset === q.asset) && (!q.state || state === q.state);
  });
  const key = (r: typeof all[number]) => "opportunity" in r ? r.opportunity.id : r.id;
  const offset = q.cursor ? filtered.findIndex(r => key(r) === q.cursor!.id) + 1 : 0;
  if(q.cursor && offset === 0) throw new Error("invalid_demo_cursor");
  const page = filtered.slice(offset, offset + q.limit), hasMore = offset + q.limit < filtered.length;
  const last = page.at(-1);
  const t = d.treasury.currentRound!;
  const reserved = journeys.flatMap(j => j.orders).filter(o => o.state === "pending")
    .reduce((n, o) => n + Number(o.reservedUnits) / 1e6, 0);
  const exposure = ["btc", "eth", "sol"].map(asset => ({ asset, strategyVersion: VERSION,
    units: units(journeys.flatMap(j => j.positions).filter(p => p.asset === asset && p.state === "open")
      .reduce((n, p) => n + Number(p.committedUnits) / 1e6, 0)) }));
  const other = Math.round((t.committedUsdc - reserved) * 1e6) - exposure.reduce((n, e) => n + Number(e.units), 0);
  if(other > 0) exposure.push({asset:"USDC",strategyVersion:VERSION,units:String(other)});
  return GetAlphaTradingResponse.parse({
    mode: "paper_trading_no_real_money", asOf: d.serverNow,
    policy: { version: VERSION, strategyVersion: VERSION, name: "scheduled_story", mode: "simulation_only",
      maxOrderUnits: units(1000), maxCorrelatedUnits: units(5000), maxPortfolioUnits: units(t.workingUsdc),
      defensiveUnits: units(t.reserveUsdc), maxQuoteAgeSeconds: 120, rules: ["capital_limit", "separate_reserve", "scheduled_settlement"] },
    specialists: ["btc", "eth", "sol"].map(asset => ({ asset, sourceStatus: "observed", proposalStatus: "enabled",
      reason: "scheduled_story", attemptedAt: d.serverNow, observationCount: journeys.filter(j => j.opportunity.opportunity.specialist === asset).length,
      sources: ["/api/demo/treasury/activity"] })),
    capital: { status: "reconciled", cashUnits: units(t.workingUsdc + t.reserveUsdc), availableUnits: units(t.availableUsdc),
      reservedUnits: units(reserved), committedUnits: units(t.committedUsdc - reserved), obligationsUnits: "0", realizedUnits: units(t.realizedNetUsdc),
      distributableUnits: "0", reconciliation: "reconciled",
      exposure },
    opportunities: q.view === "opportunities" ? page : [], decisions: q.view === "decisions" ? page : [],
    orders: q.view === "orders" ? page : [], positions: ["positions", "closed"].includes(q.view) ? page : [],
    page: { view: q.view, total: filtered.length, hasMore, nextCursor: hasMore && last ? Buffer.from(JSON.stringify({
      id: key(last), at: d.serverNow.replace("Z", "000Z"), view: q.view, asset: q.asset, state: q.state,
    })).toString("base64url") : null },
  });
}
