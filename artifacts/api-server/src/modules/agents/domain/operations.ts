/** Service execution is distinct from financial readiness. No worker here has a signing capability. */
export const agentDefinitions = [
  {id:"bettex",parentId:null,dependencies:["predictions","sports","crypto","bonus","treasury","risk","execution","governance"],inputs:["alpha_records","paper_ledger"],outputs:["selection_assessment"],rules:["bettex_selects","valid_policy_required","budget_required","independent_risk"]},
  {id:"treasury",parentId:"bettex",dependencies:["reconciliation"],inputs:["paper_ledger","paper_positions"],outputs:["control_report"],rules:["unique_effect","budget_required"]},
  {id:"governance",parentId:"bettex",dependencies:[],inputs:["policy_registry"],outputs:["control_report"],rules:["valid_policy_required","no_key_access"]},
  {id:"risk",parentId:"bettex",dependencies:["governance","treasury"],inputs:["policy_registry","paper_ledger"],outputs:["control_report"],rules:["independent_risk","valid_policy_required","budget_required"]},
  {id:"execution",parentId:"bettex",dependencies:["risk","governance"],inputs:["paper_orders","policy_registry"],outputs:["execution_readiness"],rules:["no_automatic_retry","valid_policy_required","budget_required"]},
  {id:"reconciliation",parentId:"treasury",dependencies:[],inputs:["paper_ledger","paper_orders","paper_positions"],outputs:["reconciliation_report"],rules:["unique_effect","no_automatic_retry"]},
  {id:"predictions",parentId:"bettex",dependencies:["btc","eth","sol"],inputs:["alpha_records","polymarket"],outputs:["source_assessment"],rules:["no_fabricated_probability","fresh_source_required"]},
  ...["btc","eth","sol"].map(id=>({id,parentId:"predictions",dependencies:["governance"],inputs:["allora","polymarket","policy_registry"],outputs:["source_assessment"],rules:["no_fabricated_probability","fresh_source_required","valid_policy_required"]})),
  {id:"sports",parentId:"bettex",dependencies:["governance"],inputs:["polymarket"],outputs:["source_assessment"],rules:["no_fabricated_probability","fresh_source_required"]},
  {id:"crypto",parentId:"bettex",dependencies:["governance"],inputs:[],outputs:["source_assessment"],rules:["fresh_source_required","valid_policy_required"]},
  {id:"bonus",parentId:"bettex",dependencies:["governance"],inputs:[],outputs:["source_assessment"],rules:["fresh_source_required"]},
].map(d=>({...d,cadenceSeconds:60,executionAllowed:false,
  permissions:["write_analysis",...(d.inputs.some(i=>["allora","polymarket"].includes(i))?["read_public_sources"]:[]),
    ...(d.inputs.some(i=>i.startsWith("paper_"))?["read_paper_state"]:[]),
    ...(d.inputs.includes("policy_registry")?["read_policies"]:[])],
  rules:[...new Set([...d.rules,"no_real_money","no_key_access"])]}));

export type AgentEvidence = {source:string;url:string;producedAt:string;targetAt:string;blockHeight:string;value:string;unit:string};
/** Historical API names include service workers. ALFA agents are Predictions + BTC/ETH/SOL only. */
const inactiveAlphaIds = new Set(["sports","crypto","bonus"]);
const controlIds = new Set(["treasury","governance","risk","execution","reconciliation"]);
export const alphaWorkerDefinitions = agentDefinitions
  .filter(d => !inactiveAlphaIds.has(d.id))
  .map(d => ({...d, parentId:controlIds.has(d.id)?null:d.parentId,
    dependencies:d.dependencies.filter(id => !inactiveAlphaIds.has(id))}));
export type AgentFact = {code:string;value:string};
export type AgentAssessment = {
  status:"healthy"|"degraded"|"failed";decision:"monitor"|"hold"|"block";
  findings:string[];facts:AgentFact[];evidence:AgentEvidence[];
};
export type AgentRun = AgentAssessment & {id:string;cycleId:string;upstreamRunIds:string[];agentId:string;startedAt:string;completedAt:string;durationMs:number};
export type SpecialistObservation = {
  forecast?: {price:string;source:string;producedAt:string;targetAt:string;blockHeight:string;status:"current"|"stale"};
  market?: {status:string;attemptedAt:string;opportunityCount:number};
  marketEvidence?: AgentEvidence[];
};
export type OperationsContext = {
  now:number;
  specialists:Record<string,SpecialistObservation>;
  policies?: {active:number;blocked:number;paused:number};
  paper?: {status:string;availableUnits?:string;reservedUnits:string;obligationsUnits:string;orders:number;pendingOrders:number;positions:number};
  opportunities?: {total:number;qualified:number;selected:number};
  sports?: AgentEvidence[];
  upstream?: Record<string,AgentAssessment>;
};
export function workerActivity(latest:AgentRun|null,now:number):"running"|"stale"|"not_started" {
  if(!latest)return "not_started";
  const age=now-Date.parse(latest.completedAt);
  return Number.isFinite(age)&&age>=-60_000&&age<=180_000?"running":"stale";
}
