/** Composition only: agents choose, risk constrains, execution records fills, ledger owns cash, audit records stages. */
import {db} from "@workspace/db";
import {sql} from "drizzle-orm";
import {paperTrading,type PaperState,type PaperEvent} from "../modules/execution";
import {paperStore,ensurePaperExecution} from "../modules/execution/infrastructure/paper-store";
import {ensurePaperLedger,readPaperLedger,savePaperLedger} from "../modules/ledger/infrastructure/paper-ledger-store";
import {predictionPolicy} from "../modules/risk";
import {effectiveTradingPolicy} from "../modules/risk/infrastructure/effective-policy";
import type {PolicyAsset,PredictionPolicy} from "../modules/risk";
import type {PaperCandidate} from "../modules/execution/domain/paper-model";
import {reconcilePaperExecution} from "../modules/reconciliation";
import {appendHistory,ensureHistorySchema} from "../modules/audit/infrastructure/history-store";
let ready:Promise<void>|undefined;
export function ensurePaperRuntime(){return ready??=Promise.all([ensurePaperExecution(),ensurePaperLedger(),ensureHistorySchema()])
  .then(()=>undefined).catch(e=>{ready=undefined;throw e;});}
const audit=async(client:Pick<typeof db,"execute"|"insert">,e:PaperEvent)=>{
  await appendHistory({key:e.id,subject:"agents:alpha",visibility:"admin",correlationId:`alpha:${e.opportunityId}`,
    category:"automatic",kind:`paper_${e.stage}`,state:e.stage,actor:"system",environment:"simulation",
    source:"prediction_paper_execution",occurredAt:new Date(e.at),
    data:{opportunityId:e.opportunityId,stage:e.stage,reason:e.reason,sequence:String(e.sequence),
      policyReference:e.policyReference??null,currentPolicyId:e.currentPolicyId??"unavailable",
      differences:e.differences??[]}},client);
};
export const paperRecords=paperStore({readLedger:c=>readPaperLedger(c,predictionPolicy.defensiveUnits),saveLedger:savePaperLedger,event:audit});
type Engine=ReturnType<typeof paperTrading>;
const within=async<T>(asset:PolicyAsset,run:(engine:Engine,state:PaperState)=>Promise<T>):Promise<T>=>
  paperRecords.atomic(async(state,client)=>{
    const effective=await effectiveTradingPolicy(client,asset);
    const policy=effective.configuration;
    if(policy.paused)throw new Error("policy_emergency_pause");
    const engine=paperTrading({atomic:async<T>(f:(s:PaperState)=>Promise<T>)=>f(state),now:Date.now,policy,
      reconcile:s=>reconcilePaperExecution(s,policy.defensiveUnits)});
    return run(engine,state);
  });
const historical=async<T>(positionId:string,run:(engine:Engine,state:PaperState)=>Promise<T>):Promise<T>=>
  paperRecords.atomic(async(state,client)=>{
    const position=state.positions.find(p=>p.id===positionId);
    if(!position?.policySnapshot?.published||!position.policyReference)throw new Error("historical_policy_required");
    let current:PredictionPolicy|undefined;
    try{current=(await effectiveTradingPolicy(client,position.asset as PolicyAsset)).configuration;}catch{/* preserve historical exit and monitoring */ }
    const base=position.policySnapshot;
    const policy={...base,paused:!current||current.paused,
      maxQuoteAgeSeconds:Math.min(base.maxQuoteAgeSeconds,current?.maxQuoteAgeSeconds??base.maxQuoteAgeSeconds),
      maximumLossBps:Math.min(base.maximumLossBps,current?.maximumLossBps??base.maximumLossBps),
      maximumHoldSeconds:Math.min(base.maximumHoldSeconds,current?.maximumHoldSeconds??base.maximumHoldSeconds)};
    const engine=paperTrading({atomic:async<T>(f:(s:PaperState)=>Promise<T>)=>f(state),now:Date.now,policy,historical:true,
      reconcile:s=>reconcilePaperExecution(s,base.defensiveUnits)});
    return run(engine,state);
  });
/** Every command resolves inside the same serial transaction as the paper ledger. */
export const paperPipeline={
  async decide(candidates:PaperCandidate[]){
    const ordered=[...candidates].sort((a,b)=>{
      const rank=(c:PaperCandidate)=>BigInt(c.expectedUnits)*10n**12n/
        (BigInt(c.lossUnits)+BigInt(c.upperBps-c.lowerBps)*BigInt(c.quantityUnits)/10000n+1n)/
        BigInt(Math.max(1,c.horizonSeconds));
      const diff=rank(b)-rank(a);return diff>0n?1:diff<0n?-1:a.id.localeCompare(b.id);
    });
    const decisions=[] as Awaited<ReturnType<Engine["decide"]>>["decisions"];
    let heldCapitalUnits="0";
    for(const c of ordered){
      const r=await within(c.asset,async engine=>engine.decide([c]));
      decisions.push(...r.decisions);heldCapitalUnits=r.heldCapitalUnits;
    }
    return {decisions,heldCapitalUnits,reason:decisions.some(d=>d.state==="selected")?"selected":"hold_capital"};
  },
  submit:(decisionId:string,q:Parameters<Engine["submit"]>[1],a:Parameters<Engine["submit"]>[2])=>
    paperRecords.atomic(async(state,client)=>{
      const d=state.decisions.find(x=>x.id===decisionId);
      if(!d)throw new Error("unknown_decision");
      const effective=await effectiveTradingPolicy(client,d.asset as PolicyAsset);
      if(d.policyReference?.effectiveId!==effective.reference.effectiveId)throw new Error("policy_or_strategy_changed");
      const policy=effective.configuration;
      return paperTrading({atomic:async<T>(f:(s:PaperState)=>Promise<T>)=>f(state),now:Date.now,policy,
        reconcile:s=>reconcilePaperExecution(s,policy.defensiveUnits)}).submit(decisionId,q,a);
    }),
  fill:(orderId:string,q:Parameters<Engine["fill"]>[1])=>paperRecords.atomic(async(state,client)=>{
    const o=state.orders.find(x=>x.id===orderId);if(!o)throw new Error("unknown_order");
    if(o.direction==="sell"){
      const p=state.positions.find(x=>x.id===o.positionId);
      if(!p?.policySnapshot)throw new Error("historical_policy_required");
      let current:PredictionPolicy|undefined;
      try{current=(await effectiveTradingPolicy(client,p.asset as PolicyAsset)).configuration;}catch{/* exits remain available */ }
      const historicalPolicy={...p.policySnapshot,
        maxQuoteAgeSeconds:Math.min(p.policySnapshot.maxQuoteAgeSeconds,current?.maxQuoteAgeSeconds??p.policySnapshot.maxQuoteAgeSeconds)};
      return paperTrading({atomic:async<T>(f:(s:PaperState)=>Promise<T>)=>f(state),now:Date.now,
        policy:historicalPolicy,historical:true,reconcile:s=>reconcilePaperExecution(s,p.policySnapshot!.defensiveUnits)}).fill(orderId,q);
    }
    const effective=await effectiveTradingPolicy(client,o.asset as PolicyAsset);
    if(o.policyReference?.effectiveId!==effective.reference.effectiveId)throw new Error("policy_or_strategy_changed");
    return paperTrading({atomic:async<T>(f:(s:PaperState)=>Promise<T>)=>f(state),now:Date.now,
      policy:effective.configuration,reconcile:s=>reconcilePaperExecution(s,effective.configuration.defensiveUnits)}).fill(orderId,q);
  }),
  evaluate:(id:string,input:Parameters<Engine["evaluate"]>[1])=>historical(id,e=>e.evaluate(id,input)),
  requestExit:(id:string,units:string,q:Parameters<Engine["requestExit"]>[2],a:Parameters<Engine["requestExit"]>[3])=>
    historical(id,e=>e.requestExit(id,units,q,a)),
  settle:(id:string,resolution:Parameters<Engine["settle"]>[1])=>historical(id,e=>e.settle(id,resolution)),
  cancel:(id:string)=>paperRecords.atomic(async s=>paperTrading({
    atomic:async<T>(f:(state:PaperState)=>Promise<T>)=>f(s),now:Date.now,policy:predictionPolicy,
    reconcile:x=>reconcilePaperExecution(x,predictionPolicy.defensiveUnits)}).cancel(id)),
  maintain:()=>paperRecords.atomic(async(s,client)=>{
    for(const asset of ["btc","eth","sol"] as const){
      let policy:PredictionPolicy={...predictionPolicy,allowedAssets:[asset],effectiveId:"unavailable-policy"};
      try{policy=(await effectiveTradingPolicy(client,asset)).configuration;}catch{/* cancels stale entries only */ }
      await paperTrading({atomic:async<T>(f:(state:PaperState)=>Promise<T>)=>f(s),now:Date.now,policy,
        reconcile:x=>reconcilePaperExecution(x,policy.defensiveUnits)}).maintain();
    }
    return s;
  }),
};
export async function readPaperState(client:Pick<typeof db,"execute">):Promise<PaperState>{
  const rows=async(table:string)=>(await client.execute(sql`SELECT record FROM ${sql.raw(table)} ORDER BY created_at,id`)).rows.map(r=>r.record);
  return {ledger:await readPaperLedger(client,predictionPolicy.defensiveUnits),
    decisions:await rows("execution_paper_decisions") as PaperState["decisions"],
    orders:await rows("execution_paper_orders") as PaperState["orders"],
    positions:await rows("execution_paper_positions") as PaperState["positions"],
    events:await rows("execution_paper_events") as PaperState["events"]};
}
