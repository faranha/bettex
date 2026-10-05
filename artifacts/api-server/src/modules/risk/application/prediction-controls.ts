import {predictionPolicy,type PredictionPolicy} from "../domain/prediction-strategy";
export type PredictionRiskInput = {
  asset:string;policyVersion:string;strategyVersion:string;sourceNature:string;calibrated:boolean;
  quantityUnits:string;capitalUnits:string;lossUnits:string;feesUnits:string;priceUnits:string;expectedUnits:string;
  probabilityBps:number;lowerBps:number;upperBps:number;horizonSeconds:number;producedAt:string;validUntil:string;
  exitPlan:string;correlationGroup:string;eventId:string;counterparty:string;
  policyReference?:import("../domain/policy-model").PolicyReference;
  provider?:string;market?:string;
  sourceProducedAt?:string;
};
export type PredictionExposure={asset:string;eventId:string;strategyVersion:string;counterparty:string;correlationGroup:string;units:string};
export function predictionEntry(input:PredictionRiskInput,context:{now:number;availableUnits:string;exposure:PredictionExposure[];allowFixtures?:boolean},
  p:PredictionPolicy=predictionPolicy):string {
  const unsigned=(s:unknown):s is string=>typeof s==="string" && /^(0|[1-9]\d{0,39})$/.test(s);
  if(input.sourceNature!=="real_market_data" && !context.allowFixtures)return "fixture_not_allowed";
  if(!context.allowFixtures&&(!p.published||p.paused||!p.effectiveId||input.policyReference?.effectiveId!==p.effectiveId||
    input.policyReference.versions.treasury!==`${p.environment}:treasury:${p.version}`||
    input.policyReference.versions.strategy!==`${p.environment}:strategy:${p.strategyVersion}`||
    input.policyReference.environment!==p.environment))return "valid_active_policy_required";
  if(input.policyVersion!==p.version || input.strategyVersion!==p.strategyVersion)return "policy_or_strategy_changed";
  if(!context.allowFixtures&&(!p.allowedAssets.includes(input.asset as "btc"|"eth"|"sol")||
    !input.provider||!p.allowedProviders.includes(input.provider)||
    !input.market||!p.allowedMarkets.includes(input.market)))return "instrument_or_provider_not_allowed";
  if(!context.allowFixtures&&(!input.sourceProducedAt||!Number.isFinite(Date.parse(input.sourceProducedAt))||
    context.now-Date.parse(input.sourceProducedAt)>p.maxSourceAgeSeconds*1000||
    Date.parse(input.sourceProducedAt)>context.now+5000))return "source_invalid_or_stale";
  if(!input.calibrated)return "strategy_or_model_not_validated";
  if(!input.exitPlan || input.correlationGroup!=="crypto-correlated")return "exit_plan_or_correlation_missing";
  if(![input.quantityUnits,input.capitalUnits,input.lossUnits,input.feesUnits,input.priceUnits].every(unsigned))return "invalid_amount";
  const n=BigInt(input.capitalUnits),qty=BigInt(input.quantityUnits),price=BigInt(input.priceUnits);
  if(n<=0n || qty<=0n || price<=0n || price>1000000n || BigInt(input.lossUnits)!==n)return "invalid_position_size";
  if(![input.lowerBps,input.probabilityBps,input.upperBps].every(x=>Number.isInteger(x)&&x>=0&&x<=10000) ||
    input.lowerBps>input.probabilityBps || input.probabilityBps>input.upperBps)return "invalid_probability";
  if(!Number.isFinite(Date.parse(input.validUntil)) || Date.parse(input.validUntil)<=context.now)return "expired";
  const age=context.now-Date.parse(input.producedAt);
  if(!Number.isFinite(age) || age< -5000 || age>p.maxQuoteAgeSeconds*1000)return "source_invalid_or_stale";
  if(!Number.isInteger(input.horizonSeconds) || input.horizonSeconds<=0 || input.horizonSeconds>p.maxHorizonSeconds)return "incompatible_forecast_horizon";
  const gross=(qty*price+999999n)/1000000n;
  if(n!==gross+BigInt(input.feesUnits))return "quote_size_cost_mismatch";
  if(!/^-?(0|[1-9]\d{0,39})$/.test(input.expectedUnits) ||
    BigInt(input.expectedUnits)!==qty*BigInt(input.probabilityBps)/10000n-n ||
    BigInt(input.expectedUnits)<=0n)return "expected_return_inconsistent_with_probability";
  const conservativeEdge=BigInt(input.lowerBps)-((n*10000n+qty-1n)/qty);
  if(conservativeEdge<BigInt(p.minimumNetEdgeBps))return "non_positive_net_edge_after_uncertainty_and_costs";
  if(n>BigInt(context.availableUnits))return "insufficient_available_resources";
  if(n>BigInt(p.maxOrderUnits))return "allocation_limit";
  const sum=(filter:(e:PredictionExposure)=>boolean)=>context.exposure.filter(filter).reduce((a,e)=>a+BigInt(e.units),0n)+n;
  if(sum(()=>true)>BigInt(p.maxPortfolioUnits))return "portfolio_limit";
  if(sum(e=>e.correlationGroup===input.correlationGroup)>BigInt(p.maxCorrelatedUnits))return "correlated_exposure";
  if(sum(e=>e.asset===input.asset)>BigInt(p.maxAssetUnits))return "asset_limit";
  if(sum(e=>e.eventId===input.eventId)>BigInt(p.maxEventUnits))return "event_limit";
  if(sum(e=>e.strategyVersion===input.strategyVersion)>BigInt(p.maxStrategyUnits))return "strategy_limit";
  if(sum(e=>e.counterparty===input.counterparty)>BigInt(p.maxCounterpartyUnits))return "counterparty_limit";
  return "qualified";
}
