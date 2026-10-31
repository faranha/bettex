export type Datum<T> =
  | { kind: "observed"; value: T }
  | { kind: "estimated"; value: T; method: string }
  | { kind: "missing"; reason: string };
export const missing = <T>(reason: string): Datum<T> => ({kind:"missing",reason});
export const observed = <T>(value:T):Datum<T> => ({kind:"observed",value});
export const value = <T>(d:Datum<T>):T|undefined => d.kind==="missing"?undefined:d.value;
export const alphaAgents = [
  {id:"predictions",name:"Mercado de Previsões",status:"active",specialists:["btc","eth","sol"]},
  {id:"crypto",name:"Trading de cripto",status:"planned",specialists:[]},
  {id:"sports",name:"Apostas esportivas",status:"planned",specialists:[]},
  {id:"bonus",name:"Bônus",status:"unavailable",specialists:[]},
] as const;
export type Opportunity = {
  id:string; marketAgent:string; specialist:string; market:string;
  origin:{provider:string;snapshotId:string;nature:"real_market_data"|"internal_fixture"};
  instrument:{id:string;name:string;outcome:string;settlementAsset:Datum<string>};
  operation:Datum<"buy"|"sell">;
  sources:{url:string;producedAt:string;collectedAt:string;evidence:string}[];
  model:Datum<{name:string;methodology:string;version:string}>;
  executablePrice:Datum<string>; costs:Datum<{totalUnits:string;currency:"USDC";includesSlippage:boolean}>;
  liquidity:Datum<{capitalCapacityUnits:string;currency:"USDC"}>;
  estimatedReturn:Datum<{grossUnits:string}>;
  uncertainty:Datum<{method:string;lowerNetUnits:string;upperNetUnits:string}>;
  risks:string[]; potentialLossUnits:Datum<string>; capitalUnits:Datum<string>;
  horizonSeconds:Datum<number>; correlation:Datum<{group:string;exposureVerified:boolean;existingExposureUnits:string}>;
  validUntil:string; invalidationConditions:string[];
  strategyVersion?:string; policyVersion?:string; deduplicationKey?:string;
  policyEffectiveId?:string;policyReference?:import("../../risk/domain/policy-model").PolicyReference;
  sourceSnapshots?:{provider:string;market:{id:string;question:string;endDate:string;updatedAt:string};
    book:{assetId:string;hash:string;timestamp:string;asks:{price:string;size:string}[];bids:{price:string;size:string}[];
      totalAskLevels:number;totalBidLevels:number;truncated:boolean};snapshotHash:string}[];
  probability?:Datum<{bps:number;lowerBps:number;upperBps:number;methodology:string;version:string;validated:boolean}>;
  orderQuote?:Datum<{quantityUnits:string;priceUnits:string;feesUnits:string;source:string;producedAt:string;depthVerified:boolean}>;
  exitPlan?:Datum<string>;
};
export type OpportunityState = "needs_update"|"qualified"|"rejected"|"selected"|"awaiting_authorization"|
  "allocation_authorized"|"allocation_uncertain"|"allocation_confirmed"|"expired";
export type OpportunityRecord = {
  opportunity:Opportunity; state:OpportunityState; revision:number; reason:string;
  correlationId:string; decisions:{layer:"specialist"|"market"|"BETTEX"|"risk"|"execution";reason:string;at:string}[];
  allocationUnits?:string; governanceProposalId?:string; transactionHash?:string;
  queueState?:"received"|"validated"|"awaiting_decision"|"selected"|"rejected"|"expired"|"forwarded_to_execution";
  strategyVersion?:string;priority?:string;attempts?:number;nextAttemptAt?:string;
};
const units = (v:unknown):v is string => typeof v==="string" && /^(0|[1-9]\d{0,39})$/.test(v);
const signedUnits = (v:unknown):v is string => typeof v==="string" && /^-?(0|[1-9]\d{0,39})$/.test(v);
/** Market validation; no capital allocation, custody, arbitrary confidence or fabricated defaults. */
export function qualification(o:Opportunity,now:number,allowFixtures=false):string {
  if(o.marketAgent!=="predictions" || !["btc","eth","sol"].includes(o.specialist) || o.market!=="prediction")return "agent_disabled";
  if(o.origin.nature!=="real_market_data" && !allowFixtures)return "fixture_not_allowed";
  if(!/^[a-zA-Z0-9:_-]{1,90}$/.test(o.id) || !o.instrument.id || !o.origin.snapshotId)return "invalid_identity";
  if(!Number.isFinite(Date.parse(o.validUntil)))return "invalid_validity";
  if(Date.parse(o.validUntil)<=now)return "expired";
  if(!o.sources.length || o.sources.some(s=>!/^https:\/\//.test(s.url) || !s.evidence ||
    !Number.isFinite(Date.parse(s.producedAt)) || !Number.isFinite(Date.parse(s.collectedAt)) ||
    Date.parse(s.producedAt)>Date.parse(s.collectedAt)+5000 || Date.parse(s.collectedAt)>now+5000 ||
    now-Date.parse(s.producedAt)>120000))return "source_invalid_or_stale";
  const required = ["operation","model","executablePrice","costs","liquidity","estimatedReturn","uncertainty",
    "potentialLossUnits","capitalUnits","horizonSeconds","correlation"] as const;
  if(required.some(k=>o[k].kind==="missing") || o.instrument.settlementAsset.kind==="missing")return "missing_decision_data";
  if(required.some(k=>o[k].kind==="estimated" && !("method" in o[k] && String(o[k].method).trim())))return "estimate_without_method";
  const capital=value(o.capitalUnits),loss=value(o.potentialLossUnits),cost=value(o.costs),ret=value(o.estimatedReturn);
  const liq=value(o.liquidity),h=value(o.horizonSeconds),c=value(o.correlation),model=value(o.model),u=value(o.uncertainty);
  if(value(o.operation)!=="buy" && value(o.operation)!=="sell")return "invalid_operation";
  if(!units(capital) || !units(loss) || BigInt(capital)===0n || BigInt(loss)===0n || BigInt(loss)>BigInt(capital) ||
    !cost || !units(cost.totalUnits) || cost.currency!=="USDC" || !cost.includesSlippage ||
    !ret || !units(ret.grossUnits) || !liq || !units(liq.capitalCapacityUnits) || liq.currency!=="USDC" ||
    !h || !Number.isSafeInteger(h) || h<=0 || !c || !c.group || !c.exposureVerified || !units(c.existingExposureUnits) ||
    !model?.name || !model.methodology || !model.version || !u?.method || !signedUnits(u.lowerNetUnits) ||
    !signedUnits(u.upperNetUnits) || BigInt(u.lowerNetUnits)>BigInt(u.upperNetUnits) ||
    !o.risks.length || !o.invalidationConditions.length || value(o.instrument.settlementAsset)!=="USDC")return "invalid_or_unreconciled_decision_data";
  const price=value(o.executablePrice);
  if(!price || !/^(?:0\.\d+|1(?:\.0+)?)$/.test(price) || Number(price)<=0 || Number(price)>1)return "invalid_executable_price";
  if(BigInt(liq.capitalCapacityUnits)<BigInt(capital))return "insufficient_liquidity";
  if(BigInt(ret.grossUnits)<=BigInt(cost.totalUnits))return "non_positive_net_estimate";
  return "qualified";
}
export function score(o:Opportunity):bigint {
  const ret=value(o.estimatedReturn)!,cost=value(o.costs)!,loss=value(o.potentialLossUnits)!,h=value(o.horizonSeconds)!;
  const uncertainty=value(o.uncertainty)!;
  const width=BigInt(uncertainty.upperNetUnits)-BigInt(uncertainty.lowerNetUnits);
  return (BigInt(ret.grossUnits)-BigInt(cost.totalUnits))*10n**18n/(BigInt(loss)+width)/BigInt(h);
}
