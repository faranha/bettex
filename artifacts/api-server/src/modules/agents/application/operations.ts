import {agentDefinitions,type AgentAssessment,type AgentFact,type OperationsContext} from "../domain/operations";
const facts=(items:Record<string,string|number|undefined>):AgentFact[]=>Object.entries(items)
  .filter(([,v])=>v!==undefined).map(([code,value])=>({code,value:String(value)}));
const result=(status:AgentAssessment["status"],decision:AgentAssessment["decision"],findings:string[],f:AgentFact[]=[],
  evidence:AgentAssessment["evidence"]=[]):AgentAssessment=>({status,decision,findings,facts:f,evidence});
/** Evidence-bearing deterministic analysis; never turns a price estimate into a calibrated probability. */
export function assessAgent(id:string,c:OperationsContext):AgentAssessment {
  if(["btc","eth","sol"].includes(id)){
    const s=c.specialists[id]??{},p=s.forecast;
    const marketFresh=!!s.market&&Number.isFinite(Date.parse(s.market.attemptedAt))&&
      c.now-Date.parse(s.market.attemptedAt)>=-60_000&&c.now-Date.parse(s.market.attemptedAt)<=120_000&&
      ["observed","partial","no_btc_markets","no_eligible_markets"].includes(s.market.status);
    const validForecast=!!p&&p.status==="current"&&Date.parse(p.targetAt)>c.now;
    const findings=[p?"allora_connected":"allora_source_unavailable",
      ...(!validForecast&&p?["allora_horizon_elapsed"]:[]),
      marketFresh?(s.market!.opportunityCount?"polymarket_observed":"no_eligible_markets"):"polymarket_source_unavailable",
      "allora_event_model_required"];
    return result(validForecast&&marketFresh?"healthy":"degraded","hold",findings,
      facts({forecast_usd:p?.price,markets_observed:marketFresh?s.market!.opportunityCount:undefined}),
      [...(p?[{source:`allora:${id.toUpperCase()}`,url:p.source,producedAt:p.producedAt,targetAt:p.targetAt,
        blockHeight:p.blockHeight,value:p.price,unit:"USD"}]:[]),...(marketFresh?s.marketEvidence??[]:[])]);
  }
  if(id==="sports")return c.sports?
    result("healthy","hold",["polymarket_observed","sports_model_required"],facts({markets_observed:c.sports.length}),c.sports):
    result("degraded","block",["polymarket_source_unavailable","sports_model_required"]);
  if(id==="crypto")return result("degraded","block",["provider_not_configured"]);
  if(id==="bonus")return result("degraded","block",["bonus_source_not_configured"]);
  if(id==="governance"){
    if(!c.policies)return result("failed","block",["source_unavailable"]);
    return result(c.policies.blocked||c.policies.paused?"degraded":"healthy",
      c.policies.blocked||c.policies.paused?"block":"monitor",
      [c.policies.blocked?"valid_policy_required":"policy_verified",...(c.policies.paused?["policy_paused"]:[])],
      facts({active_policies:c.policies.active,blocked_policies:c.policies.blocked,paused_policies:c.policies.paused}));
  }
  if(["treasury","reconciliation","risk","execution"].includes(id)){
    const p=c.paper;
    if(!p)return result("failed","block",["source_unavailable"]);
    const reconciled=p.status==="reconciled";
    const findings=[reconciled?"paper_ledger_verified":p.status==="unfunded"?"paper_budget_required":"paper_ledger_divergence"];
    if(id==="risk"||id==="execution"){
      if(!c.policies||c.policies.blocked)findings.push("valid_policy_required");
      if(c.policies?.paused)findings.push("policy_paused");
    }
    if(id==="execution")findings.push("execution_requires_authorized_model","no_real_orders","no_automatic_retry");
    const ready=reconciled&&!findings.includes("valid_policy_required")&&!findings.includes("policy_paused");
    return result(ready?"healthy":"degraded",
      ready?(id==="execution"?"hold":"monitor"):"block",findings,
      facts({available_usdc_units:p.availableUnits,reserved_usdc_units:p.reservedUnits,
        obligations_usdc_units:p.obligationsUnits,orders:p.orders,pending_orders:p.pendingOrders,positions:p.positions,
        reconciled:reconciled?"1":"0",...(id==="execution"?{external_orders:"0"}:{})}));
  }
  if(id==="bettex"||id==="predictions"){
    const o=c.opportunities;
    if(!o)return result("failed","block",["source_unavailable"]);
    const known=o.qualified>0;
    const upstream=c.upstream??{};
    const findings=["opportunities_reviewed",known?"eligible_candidates_only":"no_validated_candidates","public_analysis_only"];
    if(id==="bettex"){
      if(c.paper?.status!=="reconciled")findings.push(c.paper?.status==="unfunded"?"paper_budget_required":"paper_ledger_divergence");
      if(!c.policies||c.policies.blocked)findings.push("valid_policy_required");
      if(c.policies?.paused)findings.push("policy_paused");
    }else{
      const children=["btc","eth","sol"].map(a=>upstream[a]??assessAgent(a,c));
      findings.push(children.every(r=>r.findings.includes("allora_connected"))?"allora_connected":"allora_source_unavailable");
      if(children.some(r=>r.findings.includes("allora_horizon_elapsed")))findings.push("allora_horizon_elapsed");
      if(children.some(r=>r.findings.includes("polymarket_source_unavailable")))findings.push("polymarket_source_unavailable");
      findings.push("allora_event_model_required");
    }
    const dependencies=agentDefinitions.find(d=>d.id===id)!.dependencies.map(a=>upstream[a]).filter(Boolean);
    const blockedDependencies=dependencies.filter(r=>r.decision==="block").length;
    const degraded=dependencies.some(r=>r.status!=="healthy");
    const blocked=findings.some(f=>["paper_budget_required","paper_ledger_divergence","valid_policy_required","policy_paused",
      "allora_source_unavailable","allora_horizon_elapsed","polymarket_source_unavailable"].includes(f));
    return result(blocked||degraded?"degraded":"healthy","hold",findings,
      facts({opportunities:o.total,qualified:o.qualified,selected:o.selected,
        ...(dependencies.length?{upstream_assessments:dependencies.length,blocked_dependencies:blockedDependencies}:{}),
        ...(degraded?{degraded_dependencies:dependencies.filter(r=>r.status!=="healthy").length}:{})}));
  }
  throw new Error("unknown_agent");
}
/** Execute the dependency graph, passing actual assessment outputs to its parent services. */
export function assessAllAgents(context:OperationsContext, definitions = agentDefinitions):Record<string,AgentAssessment>{
  const upstream:Record<string,AgentAssessment>={};
  const pending=[...definitions];
  while(pending.length){
    const index=pending.findIndex(d=>d.dependencies.every(id=>upstream[id]));
    if(index===-1)throw new Error("agent_dependency_cycle");
    const [definition]=pending.splice(index,1);
    upstream[definition.id]=assessAgent(definition.id,{...context,upstream});
  }
  return upstream;
}
