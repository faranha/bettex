/** Composition of agent-owned evidence, shared audit and real public source. No custody/execution. */
import {alphaHierarchy,predictionProposal,type OpportunityRecord} from "../modules/agents";
import {alphaStore} from "../modules/agents/infrastructure/alpha-store";
import {polymarketBtc} from "../modules/agents/infrastructure/polymarket-btc";
import {appendHistory,ensureHistorySchema} from "../modules/audit/infrastructure/history-store";
import {logger} from "../lib/logger";
import {ensurePaperRuntime,paperPipeline} from "./paper-runtime";
import {db} from "@workspace/db";
import {effectiveTradingPolicy} from "../modules/risk/infrastructure/effective-policy";
import {runAgentOperationsCycle} from "./agent-operations-runtime";
export const alphaRecords=alphaStore(async(r,client)=>{
  const d=r.decisions.at(-1)!;
  const localAllocation=!!r.governanceProposalId && (d.layer==="risk" || d.layer==="execution");
  await appendHistory({key:`${r.correlationId}:${r.revision}`,subject:"agents:alpha",visibility:"admin",
    correlationId:r.correlationId,category:"automatic",kind:`alpha_${d.layer.toLowerCase()}`,state:r.state,
    actor:d.layer==="execution"?"system":"agent",
    environment:localAllocation?"local_evm":r.opportunity.origin.nature==="internal_fixture"?"simulation":"production",
    ...(localAllocation?{chainId:31337}:{}),
    source:"alpha_hierarchy",transactionHash:r.transactionHash,occurredAt:new Date(d.at),
    data:{opportunityId:r.opportunity.id,marketAgent:r.opportunity.marketAgent,specialist:r.opportunity.specialist,
      layer:d.layer,reason:d.reason,governanceProposalId:r.governanceProposalId??"none",
      ...(r.allocationUnits?{allocationUnits:r.allocationUnits}:{})}},client);
});
export const alphaPipeline=alphaHierarchy({...alphaRecords,now:Date.now,
  resolvePolicy:async asset=>{try{return await effectiveTradingPolicy(db,asset);}catch{return undefined;}}});
export const alphaBtcSource=polymarketBtc();
export const alphaSpecialistSources={btc:alphaBtcSource,eth:polymarketBtc(fetch,Date.now,"eth"),sol:polymarketBtc(fetch,Date.now,"sol")};
export async function collectAlpha(){
  await ensureHistorySchema();
  const batches=await Promise.all(Object.entries(alphaSpecialistSources).map(async([asset,source])=>({asset,...await source.collect()})));
  // One comparison batch avoids privileging whichever specialist completed its HTTP request first.
  const records=await alphaPipeline.ingest(batches.flatMap(b=>b.opportunities));
  for(const batch of batches){
    await alphaRecords.setSource(batch.source,batch.asset);
    await appendHistory({key:`alpha-source:${batch.asset}:${batch.source.attemptedAt}`,subject:"agents:alpha",visibility:"admin",
      correlationId:`alpha-source:${batch.asset}:${batch.source.attemptedAt}`,category:"automatic",kind:"alpha_source",
      state:batch.source.status,actor:"system",environment:"production",source:"polymarket_gamma_clob",
      data:{specialist:batch.asset,status:batch.source.status,error:batch.source.error??"none",opportunityCount:String(batch.source.opportunityCount)}});
  }
  await ensurePaperRuntime();
  await paperPipeline.maintain();
  const candidates=(await Promise.all(records.filter(r=>r.state==="qualified").map(async r=>{
    try{
      const effective=await effectiveTradingPolicy(db,r.opportunity.specialist as "btc"|"eth"|"sol");
      if(r.opportunity.policyEffectiveId!==effective.reference.effectiveId)return undefined;
      return predictionProposal(r.opportunity,Date.now(),false,effective.configuration);
    }catch{return undefined;}
  }))).filter((c):c is NonNullable<typeof c>=>!!c);
  if(candidates.length){
    const result=await paperPipeline.decide(candidates);
    for(const decision of result.decisions)await alphaRecords.atomic(async tx=>{
      const r=await tx.find(decision.opportunityId);
      if(!r||r.state!=="qualified")return;
      r.state=decision.state==="selected"?"selected":"rejected";r.queueState=r.state;r.reason=decision.reason;
      r.revision++;r.decisions.push({layer:"BETTEX",reason:decision.reason,at:decision.at});await tx.save(r);await tx.event(r);
    });
    // No automatic authorization/funding or orders: the validated model and an approved simulation budget are still missing.
  }
  return batches.map(b=>({asset:b.asset,...b.source}));
}
export async function projectAlphaAllocation(id:string,state:string,hash?:string){
  if(!id.startsWith("alpha:"))return;
  await alphaRecords.atomic(async tx=>{
    const r=await tx.find(id.slice(6));
    if(!r || r.governanceProposalId!==id)throw new Error("invalid_agent_decision");
    const mapped:OpportunityRecord["state"]=state==="confirmed"?"allocation_confirmed":state==="approved"?
      "allocation_authorized":state==="uncertain"?"allocation_uncertain":state==="rejected"?"rejected":"awaiting_authorization";
    if(r.state===mapped && r.transactionHash===hash)return;
    r.state=mapped;r.revision++;if(hash)r.transactionHash=hash;
    r.reason=state==="confirmed"?"native_test_allocation_not_market_trade":`governance_${state}`;
    r.decisions.push({layer:state==="confirmed"?"execution":"risk",reason:r.reason,at:new Date().toISOString()});
    await tx.save(r);await tx.event(r);
  });
}
export function startAlphaScripts(){
  let busy=false;
  const tick=async()=>{
    if(busy)return;busy=true;
    try{await collectAlpha();}
    catch{logger.warn({code:"alpha_observation_unavailable"},"Prediction specialist source/store unavailable; no mock fallback");}
    finally{
      try{await runAgentOperationsCycle();}
      catch{logger.warn({code:"agent_operations_unavailable"},"Agent cycle could not be persisted; no synthetic heartbeat");}
      busy=false;
    }
  };
  void tick();
  const timer=setInterval(()=>void tick(),60000);timer.unref();return timer;
}
