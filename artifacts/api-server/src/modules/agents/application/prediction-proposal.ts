import {predictionPolicy,predictionEntry,type PredictionPolicy} from "../../risk";
import {qualification,value,type Opportunity} from "../domain/opportunity";
/** Trusted specialist terms only. Allora price predictions are deliberately not mapped here. */
export function predictionProposal(o:Opportunity,now:number,allowFixtures=false,p:PredictionPolicy=predictionPolicy){
  if(qualification(o,now,allowFixtures)!=="qualified")return undefined;
  const probability=o.probability&&value(o.probability),quote=o.orderQuote&&value(o.orderQuote),exit=o.exitPlan&&value(o.exitPlan);
  const model=value(o.model),ret=value(o.estimatedReturn),cost=value(o.costs),horizon=value(o.horizonSeconds);
  if(!probability?.validated||!probability.methodology||!probability.version||!quote?.depthVerified||
    !model||!model.methodology||!model.version||!exit||!ret||!cost||!horizon||
    !["btc","eth","sol"].includes(o.specialist))return undefined;
  const eventId=o.sources.find(s=>s.evidence.startsWith("market:"))?.evidence.match(/^market:([^;]+)/)?.[1];
  if(!eventId||!quote.source||!o.sources.some(s=>s.url===quote.source))return undefined;
  const c={
    id:o.id,asset:o.specialist as "btc"|"eth"|"sol",event:o.instrument.name,eventId,instrumentId:o.instrument.id,
    outcome:o.instrument.outcome,counterparty:"polymarket",correlationGroup:"crypto-correlated",
    sourceNature:o.origin.nature,policyVersion:o.policyVersion??"",strategyVersion:o.strategyVersion??"",
    quantityUnits:quote.quantityUnits,capitalUnits:value(o.capitalUnits)!,feesUnits:quote.feesUnits,
    expectedUnits:String(BigInt(ret.grossUnits)-BigInt(cost.totalUnits)),lossUnits:value(o.potentialLossUnits)!,
    priceUnits:quote.priceUnits,probabilityBps:probability.bps,lowerBps:probability.lowerBps,upperBps:probability.upperBps,
    calibrated:probability.validated,source:quote.source,producedAt:quote.producedAt,validUntil:o.validUntil,
    policyReference:o.policyReference,
    provider:o.origin.provider,market:o.market,
    sourceProducedAt:new Date(Math.min(...o.sources.map(s=>Date.parse(s.producedAt)))).toISOString(),
    horizonSeconds:horizon,exitPlan:exit,
  };
  // A separately supplied return cannot silently contradict the calibrated event model.
  if(BigInt(c.expectedUnits)!==BigInt(c.quantityUnits)*BigInt(c.probabilityBps)/10000n-BigInt(c.capitalUnits))return undefined;
  if(c.policyVersion!==p.version||c.strategyVersion!==p.strategyVersion||
    predictionEntry(c,{now,availableUnits:c.capitalUnits,exposure:[],allowFixtures},p)!=="qualified")return undefined;
  return c;
}
