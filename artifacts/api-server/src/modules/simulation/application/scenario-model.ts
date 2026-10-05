import type {PaperState} from "../../execution";
import type {OpportunityRecord} from "../../agents";
import type {ParticipationTransfer} from "../../ledger";
export const scenarios=["complete","insufficient_balance","expired_duplicate","no_opportunity","exposure","price_change",
  "partial_fill","no_liquidity","integration_failure","payment_failure","restart"] as const;
export type Scenario=typeof scenarios[number];
export type SimulationEvent={id:string;environment:"simulation";runId:string;scenario:Scenario;at:string;
  kind:string;state:string;reason:string;correlationId:string;data:Record<string,unknown>};
export type ScenarioRun={
  id:string;environment:"simulation";scenario:Scenario;stage:number;revision:number;clock:number;paused:boolean;
  account:{id:string;usdcUnits:string;bettexUnits:string;receivedUnits:string;wallets:{asset:string;id:string;network:"simulation"}[]};
  parameters:{provisional:true;tokenPriceUnits:string;feesUnits:string;model:string;policyVersion:string;seed:number};
  transfers:ParticipationTransfer[];paper:PaperState;opportunities:OpportunityRecord[];events:SimulationEvent[];
  rounds:{id:string;resultUnits:string;retainedUnits:string;buybackUnits:string;paymentUnits:string;
    status:"paid"|"retained"|"pending"|"failed"|"cancelled";at:string}[];
  generation:number;failure?:Scenario;marketPriceUnits:string;paymentsCancelled:boolean;
};
export type ScenarioCommand={action:string;amountUnits?:string;seconds?:number;failure?:Scenario};
export function event(r:ScenarioRun,kind:string,state:string,reason:string,data:Record<string,unknown>={},correlationId=r.id){
  r.events.push({id:`${r.id}:event:${r.events.length+1}`,environment:"simulation",runId:r.id,scenario:r.scenario,
    at:new Date(r.clock).toISOString(),kind,state,reason,correlationId,data});
}
