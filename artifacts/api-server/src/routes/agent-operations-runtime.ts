/** Composition root: public observation and deterministic services, no signing/execution port. */
import {randomUUID} from "node:crypto";
import {db} from "@workspace/db";
import {sql} from "drizzle-orm";
import {alphaWorkerDefinitions,type OperationsContext} from "../modules/agents/domain/operations";
import {assessAllAgents} from "../modules/agents/application/operations";
import {ensureOperationsStore,saveAgentRun} from "../modules/agents/infrastructure/operations-store";
import {collectAlloraObservation} from "../modules/agents/infrastructure/allora-observations";
import {effectiveTradingPolicy} from "../modules/risk/infrastructure/effective-policy";
import {predictionPolicy} from "../modules/risk";
import {availablePaperUnits,reservedPaperUnits} from "../modules/ledger";
import {reconcilePaperExecution} from "../modules/reconciliation";
import {ensurePaperRuntime,readPaperState} from "./paper-runtime";
import {ensureAlphaStore} from "../modules/agents/infrastructure/alpha-store";
import type {OpportunityRecord} from "../modules/agents";
type Client=Pick<typeof db,"execute">;
async function context(client:Client):Promise<OperationsContext>{
  const c:OperationsContext={now:Date.now(),specialists:{}};
  const forecasts=Promise.all(["BTC","ETH","SOL"].map(async asset=>{
    try{const data=await collectAlloraObservation(asset as "BTC"|"ETH"|"SOL");return {asset,data};}catch{return {asset};}
  }));
  await ensureAlphaStore();
  const sources=(await client.execute(sql`SELECT id,status FROM agents_alpha_source`)).rows;
  for(const asset of ["btc","eth","sol"]){
    const source=sources.find(s=>s.id===asset);
    c.specialists[asset]={market:source?.status as OperationsContext["specialists"][string]["market"]};
  }
  const recentMarkets=(await client.execute(sql`SELECT record FROM agents_alpha_records
    WHERE record->'opportunity'->'origin'->>'nature'='real_market_data'
    ORDER BY created_at DESC LIMIT 30`)).rows.map(r=>r.record as OpportunityRecord);
  for(const asset of ["btc","eth","sol"]){
    const seen=new Set<string>();
    c.specialists[asset].marketEvidence=recentMarkets.filter(r=>{
      const o=r.opportunity;
      if(o.specialist!==asset||seen.has(o.instrument.id))return false;
      seen.add(o.instrument.id);return true;
    }).slice(0,3).map(({opportunity:o})=>{
      const source=o.sources.find(s=>s.evidence.startsWith("market:"))??o.sources[0];
      return {source:`polymarket:${asset}`,url:source?.url??"",producedAt:source?.producedAt??"",
        targetAt:"",blockHeight:"",value:`${o.instrument.name} · ${o.instrument.outcome}`,unit:"market"};
    });
  }
  const opportunities=(await client.execute(sql`SELECT
    count(*)::int AS total,
    count(*) FILTER(WHERE record->>'state'='qualified' AND record->'opportunity'->>'validUntil'>${new Date(c.now).toISOString()})::int AS qualified,
    count(*) FILTER(WHERE record->>'state' IN ('selected','awaiting_authorization','allocation_authorized','allocation_confirmed'))::int AS selected
    FROM agents_alpha_records WHERE record->'opportunity'->'origin'->>'nature'='real_market_data'`)).rows[0];
  if(opportunities)c.opportunities={total:Number(opportunities.total),qualified:Number(opportunities.qualified),selected:Number(opportunities.selected)};
  // A transaction owns one PostgreSQL client; queries on it must not be concurrent.
  const policies=[];
  for(const asset of ["btc","eth","sol"] as const){
    try{policies.push((await effectiveTradingPolicy(client,asset)).configuration);}catch{policies.push(undefined);}
  }
  c.policies={active:policies.filter(Boolean).length,blocked:policies.filter(p=>!p).length,paused:policies.filter(p=>p?.paused).length};
  try{
    await ensurePaperRuntime();
    const state=await readPaperState(client);
    // In-memory check only; telemetry does not fund or mutate the financial ledger.
    reconcilePaperExecution(state,policies.find(p=>p)?.defensiveUnits??predictionPolicy.defensiveUnits);
    const p=state.ledger;
    c.paper={status:p.status,...(p.status==="reconciled"?{availableUnits:String(availablePaperUnits(p))}:{}),
      reservedUnits:String(reservedPaperUnits(p)),obligationsUnits:p.obligationsUnits,
      orders:state.orders.length,pendingOrders:state.orders.filter(o=>["pending","partial","uncertain"].includes(o.state)).length,
      positions:state.positions.filter(p=>p.state!=="closed"&&p.state!=="settled").length};
  }catch{/* An unavailable financial source must be a failed service result, not zero cash. */}
  for(const f of await forecasts)if(f.data)c.specialists[f.asset.toLowerCase()].forecast=f.data.observation;
  c.now=Date.now();
  return c;
}
export async function runAgentOperationsCycle():Promise<void>{
  await ensureOperationsStore();
  await db.transaction(async client=>{
    // Cross-process single cycle. A failed/terminated transaction releases the lock automatically.
    const lock=(await client.execute(sql`SELECT pg_try_advisory_xact_lock(hashtext('agents:operations:cycle')) AS acquired`)).rows[0];
    if(lock?.acquired!==true)return;
    const started=Date.now();
    const cycleId=randomUUID();
    const runIds=new Map(alphaWorkerDefinitions.map(d=>[d.id,randomUUID()]));
    let snapshot:OperationsContext|undefined;
    await client.execute(sql`SAVEPOINT source_snapshot`);
    try{
      snapshot=await context(client);
      await client.execute(sql`RELEASE SAVEPOINT source_snapshot`);
    }catch{
      await client.execute(sql`ROLLBACK TO SAVEPOINT source_snapshot`);
      await client.execute(sql`RELEASE SAVEPOINT source_snapshot`);
      snapshot=undefined;
      // A failed SQL source must not leave the transaction aborted and unable to record service failures.
    }
    const assessments=snapshot?assessAllAgents(snapshot,alphaWorkerDefinitions):undefined;
    for(const definition of alphaWorkerDefinitions){
      const completed=Date.now();
      const assessment=assessments?assessments[definition.id]:
        {status:"failed" as const,decision:"block" as const,findings:["cycle_failed"],facts:[],evidence:[]};
      await saveAgentRun(client,{...assessment,id:runIds.get(definition.id)!,cycleId,
        upstreamRunIds:definition.dependencies.map(id=>runIds.get(id)!),agentId:definition.id,
        startedAt:new Date(started).toISOString(),completedAt:new Date(completed).toISOString(),durationMs:completed-started});
    }
  });
}
