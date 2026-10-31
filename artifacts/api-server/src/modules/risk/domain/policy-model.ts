export type PolicyEnvironment="development"|"production";
export type PolicyAsset="btc"|"eth"|"sol";
export type PolicyKey="global"|"strategy"|PolicyAsset;
export type PolicyState="validated"|"approved"|"active"|"superseded"|"revoked";
export type PolicyControls={
  mode:"simulation_only";paused:boolean;
  maxOrderUnits:string;maxCorrelatedUnits:string;maxPortfolioUnits:string;defensiveUnits:string;
  maxAssetUnits:string;maxEventUnits:string;maxStrategyUnits:string;maxCounterpartyUnits:string;
  maxQuoteAgeSeconds:number;maxSourceAgeSeconds:number;maxHorizonSeconds:number;maxAttempts:number;
  retrySeconds:number;minimumNetEdgeBps:number;exitHysteresisBps:number;reentryCooldownSeconds:number;
  maximumHoldSeconds:number;maximumLossBps:number;
  allowedAssets:PolicyAsset[];allowedProviders:string[];allowedMarkets:string[];
  requireCalibratedModel:boolean;requireCompleteCosts:boolean;requireExitPlan:boolean;requireReconciliation:boolean;
};
export type PolicyDefinition={
  id:string;version:number;type:"treasury"|"strategy"|"specialist";scope:"global"|"predictions"|PolicyAsset;
  schemaVersion:1;name:string;implementation:string;justification:string;previousVersion?:string|null;
  openPositions:"preserve_original_exit_and_apply_emergency_controls";controls:Partial<PolicyControls>;
  search?:string;horizon?:"event_resolution";
};
export type PolicyVersion={
  id:string;environment:PolicyEnvironment;definition:PolicyDefinition;contentHash:string;
  sourceCommit:string;sourcePath:string;author:string;justification:string;publishedAt:string;
  approvalRequired:boolean;state:PolicyState;approver?:string|null;approvedAt?:string|null;
  activatedAt?:string|null;replacedBy?:string|null;
};
export type PolicyReference={
  effectiveId:string;environment:PolicyEnvironment;revision:number;
  versions:{treasury:string;strategy:string;specialist:string};
  hashes:{treasury:string;strategy:string;specialist:string};
  implementations:{treasury:string;strategy:string;specialist:string};exitTreatment:string;
};
export type EffectivePolicy={reference:PolicyReference;configuration:PredictionPolicy};
export type PredictionPolicy=PolicyControls&{
  version:string;strategyVersion:string;name:string;rules:string[];published?:boolean;
  effectiveId?:string;specialistVersion?:string;environment?:PolicyEnvironment;
};
export type PolicyChange={id:string;action:string;actor:string;actorType:"human"|"agent";reason:string;at:string;
  revision:number;versionId?:string|null;differences?:{field:string;before:unknown;after:unknown}[]};
export type PolicyRegistryState={
  revision:number;versions:PolicyVersion[];active:Partial<Record<PolicyKey,string>>;changes:PolicyChange[];
};
export type PolicyControl={revision:number;active:Partial<Record<PolicyKey,string>>;
  statuses:Record<string,Pick<PolicyVersion,"state"|"approver"|"approvedAt"|"activatedAt"|"replacedBy">>};
export const policyKey=(d:PolicyDefinition):PolicyKey=>d.type==="treasury"?"global":d.type==="strategy"?"strategy":d.scope as PolicyAsset;
export const versionName=(d:PolicyDefinition)=>`${d.id}/${d.version}`;
export const versionId=(d:PolicyDefinition,e:PolicyEnvironment)=>`${e}:${d.type}:${versionName(d)}`;
export function canonical(v:unknown):string{
  const normalize=(x:unknown):unknown=>Array.isArray(x)?x.map(normalize):x&&typeof x==="object"?
    Object.fromEntries(Object.entries(x).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,t])=>[k,normalize(t)])):x;
  return JSON.stringify(normalize(v));
}
