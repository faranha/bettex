import {observed,type Opportunity} from "../../agents";
import {predictionPolicy} from "../../risk";
import type {PaperQuote,PaperCandidate,PaperAuthorization} from "../../execution";
import type {ScenarioRun} from "./scenario-model";
export const scenarioPolicy={...predictionPolicy,version:"simulation-controls/1",strategyVersion:"simulation-event-model/1",
  allowedAssets:["btc","eth","sol"] as ("btc"|"eth"|"sol")[]};
/** Pure in-memory fixture adapters; never fetch, sign or call an external provider. */
export function opportunities(r:ScenarioRun):Opportunity[]{
  return (["btc","eth","sol"] as const).map((asset,index)=>{
    const id=`${r.id}:${r.generation}:${asset}`,at=new Date(r.clock).toISOString();
    const price="400000",quantity="300000000",capital="120000000";
    const bps=r.failure==="no_opportunity"?4000:8500-index*500;
    const gross=String(BigInt(quantity)*BigInt(bps)/10000n-BigInt(capital));
    const source=`https://simulation.invalid/${id}`,datum=observed;
    return {id,marketAgent:"predictions",specialist:asset,market:"prediction",
      origin:{provider:"simulation",snapshotId:id,nature:"internal_fixture"},
      instrument:{id:`${id}:instrument`,name:`SIM ${asset.toUpperCase()} event`,outcome:"Yes",settlementAsset:datum("USDC")},
      operation:datum("buy"),sources:[{url:source,producedAt:at,collectedAt:at,evidence:`market:${id};simulation_only`}],
      model:datum({name:"Explicit validation fixture",methodology:"scenario-not-calibrated-real-model",version:"fixture/1"}),
      executablePrice:datum("0.4"),costs:datum({totalUnits:"0",currency:"USDC",includesSlippage:true}),
      liquidity:datum({capitalCapacityUnits:"1000000000",currency:"USDC"}),estimatedReturn:datum({grossUnits:gross}),
      uncertainty:datum({method:"fixture",lowerNetUnits:gross,upperNetUnits:gross}),risks:["simulation_only"],
      potentialLossUnits:datum(capital),capitalUnits:datum(capital),horizonSeconds:datum(600),
      correlation:datum({group:"crypto-correlated",exposureVerified:true,existingExposureUnits:"0"}),
      validUntil:new Date(r.clock+(r.failure==="expired_duplicate"?-1:60000)).toISOString(),invalidationConditions:["fixture_expiry"],
      policyVersion:scenarioPolicy.version,strategyVersion:scenarioPolicy.strategyVersion,
      probability:datum({bps,lowerBps:bps-500,upperBps:bps+500,methodology:"fixture-not-economic-evidence",version:"fixture/1",validated:true}),
      orderQuote:datum({quantityUnits:quantity,priceUnits:price,feesUnits:"0",source,producedAt:at,depthVerified:true}),
      exitPlan:datum("simulation_exit_on_observed_fixture_liquidity")};
  });
}
export function quote(r:ScenarioRun,c:Pick<PaperCandidate,"instrumentId">,side:"buy"|"sell",partial=false):PaperQuote{
  return {id:`${r.id}:quote:${r.clock}:${side}:${partial}`,instrumentId:c.instrumentId,side,
    source:`https://simulation.invalid/${r.id}`,producedAt:new Date(r.clock).toISOString(),
    validUntil:new Date(r.clock+60000).toISOString(),feesBps:0,verified:r.failure!=="integration_failure",
    priceUnits:side==="buy"?(r.failure==="price_change"?"900000":"400000"):r.marketPriceUnits,
    availableSharesUnits:r.failure==="no_liquidity"&&side==="sell"?"0":partial?"150000000":"300000000"};
}
export function authorization(r:ScenarioRun):PaperAuthorization{
  return {id:`${r.id}:mandate:${r.clock}`,mode:"simulation_only",policyVersion:scenarioPolicy.version,
    strategyVersion:scenarioPolicy.strategyVersion,approved:true,expiresAt:new Date(r.clock+120000).toISOString()};
}
