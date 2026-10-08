import {Router} from "express";
import {db} from "@workspace/db";
import {sql} from "drizzle-orm";
import {GetAlphaTradingResponse,GetAlphaTradingJourneyResponse} from "@workspace/api-zod";
import {predictionPolicy,predictionSpecialists} from "../modules/risk";
import {effectiveTradingPolicy} from "../modules/risk/infrastructure/effective-policy";
import {ensureTradingPolicyStore} from "../modules/risk/infrastructure/policy-store";
import {availablePaperUnits,reservedPaperUnits} from "../modules/ledger";
import type {OpportunityRecord} from "../modules/agents";
import {ensureAlphaStore} from "../modules/agents/infrastructure/alpha-store";
import {ensurePaperRuntime,readPaperState} from "./paper-runtime";
import {reconcilePaperExecution} from "../modules/reconciliation";
import {verifiedAccount} from "../lib/account-identity";
import {demoTabIdentity} from "../modules/simulation/infrastructure/demo-tab-session";
import {loadDashboard} from "../lib/demo-store";
import {demoTradingJourneys,demoTradingSnapshot} from "../lib/demo-trading-presentation";
const router=Router();
const views=["opportunities","decisions","orders","positions","closed"] as const;
type View=typeof views[number];
const tableFor={opportunities:"agents_alpha_records",decisions:"execution_paper_decisions",orders:"execution_paper_orders",
  positions:"execution_paper_positions",closed:"execution_paper_positions"} as const;
function params(q:Record<string,unknown>){
  const view=q.view??"opportunities",asset=q.asset,state=q.state??"",raw=q.limit??"15";
  if(!views.includes(view as View)||asset!==undefined&&!["btc","eth","sol"].includes(String(asset))||
    typeof state!=="string"||!/^[-a-z_]{0,40}$/.test(state)||!/^\d{1,2}$/.test(String(raw))||
    Number(raw)<1||Number(raw)>50)throw new Error("invalid_filter");
  const limit=Number(raw),v=view as View,a=asset===undefined?undefined:String(asset);
  let cursor:{at:string;id:string;view:string;asset?:string;state:string}|undefined;
  if(q.cursor!==undefined){
    if(typeof q.cursor!=="string"||q.cursor.length>400||!/^[a-zA-Z0-9_-]+$/.test(q.cursor))throw new Error("invalid_cursor");
    try{cursor=JSON.parse(Buffer.from(q.cursor,"base64url").toString("utf8"));}catch{throw new Error("invalid_cursor");}
    if(!cursor||cursor.view!==v||cursor.asset!==a||cursor.state!==state||
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{6}Z$/.test(cursor.at)||
      !Number.isFinite(Date.parse(cursor.at))||!/^[a-zA-Z0-9:_-]{1,110}$/.test(cursor.id))throw new Error("invalid_cursor");
  }
  return {view:v,asset:a,state,limit,cursor};
}
router.get("/agents/trading",async(req,res)=>{
  res.set("Cache-Control","no-store");
  let p:ReturnType<typeof params>;
  try{p=params(req.query);}catch{res.status(400).json({code:"invalid_filter_or_cursor"});return;}
  try{
    const tab=req.headers["x-bettex-demo-session"];
    if(tab!==undefined&&!await verifiedAccount(req)){
      const browserId=demoTabIdentity(tab)!;
      const dashboard=await loadDashboard({browserId,tabScoped:true});
      if(!dashboard)throw new Error("demo_dashboard_unavailable");
      res.json(demoTradingSnapshot(dashboard,p));
      return;
    }
    await Promise.all([ensureAlphaStore(),ensurePaperRuntime(),ensureTradingPolicyStore()]);
    const output=await db.transaction(async client=>{
      await client.execute(sql`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY`);
      const state=await readPaperState(client),integrity=reconcilePaperExecution(state,predictionPolicy.defensiveUnits),s=state.ledger;
      const policies=await Promise.all(predictionSpecialists.map(async sp=>{
        try{
          const effective=await effectiveTradingPolicy(client,sp.asset);
          return {asset:sp.asset,status:"active" as const,
            reason:effective.configuration.paused?"treasury_paused":"simulation_only",...effective};
        }catch(e){return {asset:sp.asset,status:"blocked" as const,
          reason:e instanceof Error?e.message:"valid_active_policy_required"};}
      }));
      const sources=(await client.execute(sql`SELECT id,status FROM agents_alpha_source`)).rows;
      const readyRows=(await client.execute(sql`SELECT record->'opportunity'->>'specialist' AS asset,
        record->'opportunity'->>'policyEffectiveId' AS effective_id,count(*)::int AS n FROM agents_alpha_records
        WHERE record->'opportunity'->'origin'->>'nature'='real_market_data'
        AND record->'opportunity'->>'policyVersion'=${predictionPolicy.version}
        AND record->'opportunity'->>'strategyVersion'=${predictionPolicy.strategyVersion}
        AND coalesce(record->>'queueState',record->>'state') IN ('awaiting_decision','validated','selected','forwarded_to_execution')
        AND record->'opportunity'->>'validUntil'>${new Date().toISOString()}
        GROUP BY 1,2`)).rows;
      const table=sql.raw(tableFor[p.view]);
      const assetField=sql.raw(p.view==="opportunities"?"record->'opportunity'->>'specialist'":"record->>'asset'");
      const stateField=sql.raw(p.view==="opportunities"?"coalesce(record->>'queueState',record->>'state')":"record->>'state'");
      const assetWhere=p.asset?sql`${assetField}=${p.asset}`:sql`true`;
      const stateWhere=p.state?sql`${stateField}=${p.state}`:sql`true`;
      const modeWhere=p.view==="positions"?sql`record->>'state' IN ('open','reducing')`:
        p.view==="closed"?sql`record->>'state' IN ('closed','settled')`:
        p.view==="opportunities"?sql`record->'opportunity'->'origin'->>'nature'='real_market_data'`:sql`true`;
      const cursorWhere=p.cursor?sql`(created_at,id)<(${p.cursor.at}::timestamptz,${p.cursor.id})`:sql`true`;
      const total=Number((await client.execute(sql`SELECT count(*)::int AS n FROM ${table}
        WHERE ${assetWhere} AND ${stateWhere} AND ${modeWhere}`)).rows[0]?.n??0);
      const rows=(await client.execute(sql`SELECT record,id,
        to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_at
        FROM ${table} WHERE ${assetWhere} AND ${stateWhere} AND ${modeWhere} AND ${cursorWhere}
        ORDER BY created_at DESC,id DESC LIMIT ${p.limit+1}`)).rows;
      const hasMore=rows.length>p.limit,items=rows.slice(0,p.limit),last=items.at(-1);
      const active=state.positions.filter(p=>p.state==="open"||p.state==="reducing");
      const exposure=new Map<string,{asset:string;strategyVersion:string;units:string}>();
      const add=(asset:string,strategyVersion:string,units:string)=>{
        const key=`${asset}:${strategyVersion}`,old=exposure.get(key);
        exposure.set(key,{asset,strategyVersion,units:String(BigInt(old?.units??"0")+BigInt(units))});
      };
      for(const pos of active)add(pos.asset,pos.strategyVersion,pos.committedUnits);
      for(const [id,n] of Object.entries(s.reservations)){
        const d=state.decisions.find(d=>d.id===id);if(d)add(d.asset,d.strategyVersion,n);
      }
      const specialists=predictionSpecialists.map(sp=>{
        const source=sources.find(x=>x.id===sp.asset)?.status as {status:string;attemptedAt:string;opportunityCount:number;error?:string}|undefined;
        const fresh=!!source?.attemptedAt&&Number.isFinite(Date.parse(source.attemptedAt))&&
          Date.now()-Date.parse(source.attemptedAt)<120000;
        const policy=policies.find(p=>p.asset===sp.asset)!;
        const qualified=policy.status==="active"&&Number(readyRows.find(r=>r.asset===sp.asset&&
          r.effective_id===policy.reference.effectiveId)?.n??0)>0;
        const sourceStatus=source&&!fresh?"stale":source?.status??"not_collected";
        const enabled=fresh&&["observed","partial"].includes(source!.status)&&qualified&&
          policy.status==="active"&&!policy.configuration.paused&&s.status==="reconciled";
        return {asset:sp.asset,sourceStatus,proposalStatus:enabled?"enabled":"blocked",
          reason:enabled?"eligible_simulation_proposal":!fresh?"source_invalid_or_stale":
            sourceStatus==="unavailable"?(source?.error??"source_unavailable"):
            sourceStatus==="no_btc_markets"||sourceStatus==="no_eligible_markets"?"no_eligible_markets":
             policy.status==="blocked"?policy.reason:
             policy.configuration.paused?"treasury_paused":
             !qualified?"strategy_or_model_not_validated":
            s.status==="unfunded"?"paper_budget_not_authorized":"paper_ledger_divergence",
          attemptedAt:source?.attemptedAt??"",observationCount:source?.opportunityCount??0,
          sources:[`https://gamma-api.polymarket.com/public-search?q=${sp.search}&events_status=active&limit_per_type=3`,
            "https://docs.polymarket.com/market-data/prices-order-books.md"]};
      });
      const btcPolicy=policies[0].status==="active"?policies[0].configuration:predictionPolicy;
      return {mode:"paper_trading_no_real_money",asOf:new Date().toISOString(),policy:btcPolicy,
        effectivePolicies:policies.map(p=>p.status==="active"?
          {asset:p.asset,status:p.status,reason:p.reason,reference:p.reference,configuration:p.configuration}:
          {asset:p.asset,status:p.status,reason:p.reason}),specialists,
        capital:{status:s.status,cashUnits:s.cashUnits,availableUnits:s.status!=="reconciled"?null:String(availablePaperUnits(s)),
          reservedUnits:String(reservedPaperUnits(s)),committedUnits:String(active.reduce((n,p)=>n+BigInt(p.committedUnits),0n)),
          obligationsUnits:s.obligationsUnits,realizedUnits:s.realizedUnits,distributableUnits:"0",
          reconciliation:integrity,
          exposure:[...exposure.values()]},
        opportunities:p.view==="opportunities"?items.map(r=>r.record):[],
        decisions:p.view==="decisions"?items.map(r=>r.record):[],orders:p.view==="orders"?items.map(r=>r.record):[],
        positions:["positions","closed"].includes(p.view)?items.map(r=>r.record):[],
        page:{view:p.view,total,hasMore,nextCursor:hasMore&&last?Buffer.from(JSON.stringify({
          at:last.cursor_at,id:last.id,view:p.view,asset:p.asset,state:p.state})).toString("base64url"):null}};
    });
    res.json(GetAlphaTradingResponse.parse(output));
  }catch(error){
    if(error instanceof Error&&["invalid_demo_cursor","invalid_demo_tab_session"].includes(error.message)){
      res.status(400).json({code:"invalid_filter_or_cursor"});return;
    }
    req.log.warn({code:"alpha_trading_unavailable"},"Trading evidence unavailable; no mock fallback");
    res.status(503).json({code:"alpha_trading_unavailable"});
  }
});
router.get("/agents/trading/journey/:id",async(req,res)=>{
  res.set("Cache-Control","no-store");
  const id=String(req.params.id);
  if(!/^[a-zA-Z0-9:_-]{1,110}$/.test(id)){res.status(404).json({code:"journey_not_found"});return;}
  try{
    const tab=req.headers["x-bettex-demo-session"];
    if(id.startsWith("demo:")&&tab!==undefined&&!await verifiedAccount(req)){
      const browserId=demoTabIdentity(tab)!;
      const dashboard=await loadDashboard({browserId,tabScoped:true});
      if(!dashboard)throw new Error("demo_dashboard_unavailable");
      const journey=demoTradingJourneys(dashboard)
        .find(j=>j.opportunity.opportunity.id===id||j.orders.some(o=>o.id===id)||j.positions.some(p=>p.id===id)||j.decisions.some(d=>d.id===id));
      if(!journey){res.status(404).json({code:"journey_not_found"});return;}
      res.json(journey);return;
    }
    await Promise.all([ensureAlphaStore(),ensurePaperRuntime(),ensureTradingPolicyStore()]);
    const output=await db.transaction(async client=>{
      await client.execute(sql`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY`);
      let opportunityId=id;
      for(const table of ["execution_paper_decisions","execution_paper_orders","execution_paper_positions"]){
        const r=(await client.execute(sql`SELECT record->>'opportunityId' AS id FROM ${sql.raw(table)} WHERE id=${id}`)).rows[0];
        if(r){opportunityId=String(r.id);break;}
      }
      const opportunity=(await client.execute(sql`SELECT record FROM agents_alpha_records WHERE id=${opportunityId}
        AND record->'opportunity'->'origin'->>'nature'='real_market_data'`)).rows[0]?.record as OpportunityRecord|undefined;
      if(!opportunity)return undefined;
      const rows=async(table:string)=>(await client.execute(sql`SELECT record FROM ${sql.raw(table)}
        WHERE record->>'opportunityId'=${opportunityId} ORDER BY created_at,id`)).rows.map(r=>r.record);
      const events=await rows("execution_paper_events") as {at:string;stage:string;reason:string;sequence:number}[];
      const allEvents=[...opportunity.decisions.map((d,i)=>({at:d.at,stage:d.layer,reason:d.reason,sequence:i+1})),
        ...events.sort((a,b)=>a.sequence-b.sequence).map((e,i)=>({...e,sequence:opportunity.decisions.length+i+1}))];
      return {mode:"paper_trading_no_real_money",opportunity,decisions:await rows("execution_paper_decisions"),
        orders:await rows("execution_paper_orders"),positions:await rows("execution_paper_positions"),events:allEvents};
    });
    if(!output){res.status(404).json({code:"journey_not_found"});return;}
    res.json(GetAlphaTradingJourneyResponse.parse(output));
  }catch{
    req.log.warn({code:"alpha_journey_unavailable"},"Trading journey unavailable");
    res.status(503).json({code:"alpha_journey_unavailable"});
  }
});
export default router;
