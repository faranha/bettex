export type PaperCandidate = {
  id:string;asset:"btc"|"eth"|"sol";event:string;eventId:string;instrumentId:string;outcome:string;
  counterparty:string;correlationGroup:string;sourceNature:"real_market_data"|"internal_fixture";
  policyVersion:string;strategyVersion:string;quantityUnits:string;capitalUnits:string;feesUnits:string;
  expectedUnits:string;lossUnits:string;priceUnits:string;probabilityBps:number;lowerBps:number;upperBps:number;
  calibrated:boolean;source:string;producedAt:string;validUntil:string;horizonSeconds:number;exitPlan:string;
  policyReference?:import("../../risk/domain/policy-model").PolicyReference;
  provider?:string;market?:string;
  sourceProducedAt?:string;
};
export type PaperQuote = {
  id:string;source:string;producedAt:string;validUntil:string;priceUnits:string;
  availableSharesUnits:string;feesBps:number;verified:boolean;instrumentId:string;side:"buy"|"sell";
};
export type PaperDecision = {
  id:string;opportunityId:string;asset:string;state:"selected"|"rejected"|"hold";reason:string;at:string;
  policyVersion:string;strategyVersion:string;rank:number;requestedUnits:string;candidate:PaperCandidate;
  policyReference?:import("../../risk/domain/policy-model").PolicyReference;
  policySnapshot?:import("../../risk/domain/policy-model").PredictionPolicy;
};
export type PaperFill={id:string;at:string;sharesUnits:string;cashUnits:string;feesUnits:string;price:string;source:string};
export type PaperOrder={
  id:string;opportunityId:string;decisionId:string;positionId?:string;asset:string;instrumentId:string;outcome:string;
  direction:"buy"|"sell";state:"pending"|"partial"|"filled"|"cancelled"|"expired"|"failed";
  quantityUnits:string;filledUnits:string;reservedUnits:string;policyVersion:string;strategyVersion:string;
  createdAt:string;updatedAt:string;validUntil:string;fills:PaperFill[];reason:string;authorizationId:string;
  attempts:number;nextAttemptAt:string;
  policyReference?:import("../../risk/domain/policy-model").PolicyReference;
  submittedQuote?:PaperQuote;fillQuotes?:PaperQuote[];
};
export type PaperValuation={
  at:string;source:string;kind:"executable"|"conservative"|"indicative"|"unavailable";stale:boolean;
  priceUnits:string|null;producedAt:string|null;
  quantityUnits:string;liquidatableUnits:string;exitValueUnits:string|null;unrealizedUnits:string|null;
  updatedExpectedUnits:string|null;action:"hold"|"pause"|"reduce"|"exit";reason:string;
};
export type PaperPosition={
  id:string;opportunityId:string;decisionId:string;orderId:string;asset:string;event:string;instrumentId:string;outcome:string;
  state:"open"|"reducing"|"closed"|"settled";quantityUnits:string;entryCostUnits:string;entryFeesUnits:string;committedUnits:string;
  originalExpectedUnits:string;realizedUnits:string;strategyVersion:string;policyVersion:string;openedAt:string;updatedAt:string;
  closedAt?:string;exitPlan:string;exitState:"planned"|"triggered"|"requested"|"partial"|"confirmed"|"blocked_liquidity";
  resolutionState:"unresolved"|"resolved"|"settlement_pending"|"settled";valuations:PaperValuation[];
  policyReference?:import("../../risk/domain/policy-model").PolicyReference;
  policySnapshot?:import("../../risk/domain/policy-model").PredictionPolicy;
};
export type PaperEvent={id:string;opportunityId:string;at:string;stage:string;reason:string;sequence:number;
  policyReference?:import("../../risk/domain/policy-model").PolicyReference;currentPolicyId?:string;
  differences?:{field:string;before:unknown;after:unknown}[]};
export const MICRO=1000000n;
export const ceilDiv=(n:bigint,d:bigint)=>(n+d-1n)/d;
