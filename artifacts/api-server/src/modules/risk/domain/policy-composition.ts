import {canonical,versionName,type PolicyDefinition,type PolicyControls,type PolicyVersion,
  type EffectivePolicy,type PolicyEnvironment,type PolicyAsset} from "./policy-model";
const maxima=["maxOrderUnits","maxCorrelatedUnits","maxPortfolioUnits","maxAssetUnits","maxEventUnits",
  "maxStrategyUnits","maxCounterpartyUnits","maxQuoteAgeSeconds","maxSourceAgeSeconds","maxHorizonSeconds",
  "maxAttempts","exitHysteresisBps","maximumHoldSeconds","maximumLossBps"] as const;
const minima=["defensiveUnits","retrySeconds","minimumNetEdgeBps","reentryCooldownSeconds"] as const;
const sets=["allowedAssets","allowedProviders","allowedMarkets"] as const;
const requirements=["requireCalibratedModel","requireCompleteCosts","requireExitPlan","requireReconciliation"] as const;
/** Explicit partial order: reject any attempted weakening; never perform a configuration spread. */
export function composeControls(definitions:PolicyDefinition[]):PolicyControls{
  if(definitions.length!==3||definitions[0].type!=="treasury"||definitions[1].type!=="strategy"||
    definitions[2].type!=="specialist")throw new Error("policy_layers_required");
  const result:Record<string,unknown>={};
  for(const [index,d] of definitions.entries()){
    const c=d.controls;
    if(c.mode!==undefined&&c.mode!=="simulation_only")throw new Error("simulation_only_required");
    if(result.paused===true&&c.paused===false)throw new Error("policy_weakening:paused");
    result.mode="simulation_only";
    result.paused=Boolean(result.paused||c.paused);
    for(const field of [...maxima,...minima]){
      const next=c[field],old=result[field];
      if(next===undefined){if(index===0)throw new Error(`required_global_control:${field}`);continue;}
      const minimum=(minima as readonly string[]).includes(field);
      if(old!==undefined&&(minimum?BigInt(next)<BigInt(old as string|number):BigInt(next)>BigInt(old as string|number)))
        throw new Error(`policy_weakening:${field}`);
      result[field]=next;
    }
    for(const field of sets){
      const next=c[field],old=result[field] as string[]|undefined;
      if(next===undefined){if(index===0)throw new Error(`required_global_control:${field}`);continue;}
      if(!next.length||new Set(next).size!==next.length||old&&next.some(x=>!old.includes(x)))
        throw new Error(`policy_weakening:${field}`);
      result[field]=[...next].sort();
    }
    for(const field of requirements){
      const next=c[field];
      if(next===false||index===0&&next!==true)throw new Error(`required_control:${field}`);
      result[field]=true;
    }
  }
  const effective=result as PolicyControls;
  if(!effective.allowedAssets.includes(definitions[2].scope as PolicyAsset))throw new Error("specialist_asset_not_allowed");
  if(BigInt(effective.maxOrderUnits)>BigInt(effective.maxPortfolioUnits)||
    effective.maximumHoldSeconds>effective.maxHorizonSeconds)throw new Error("inconsistent_policy_limits");
  return effective;
}
export function resolvePolicy(versions:PolicyVersion[],environment:PolicyEnvironment,asset:PolicyAsset,revision:number,
  hash:(value:unknown)=>string):EffectivePolicy{
  const layers=["global","predictions",asset].map(scope=>versions.find(v=>v.definition.scope===scope));
  if(layers.some(v=>!v||v.environment!==environment||v.state!=="active"||
    v.definition.schemaVersion!==1||!v.approver||!v.approvedAt||hash(v.definition)!==v.contentHash))
    throw new Error("valid_active_policy_required");
  const [treasury,strategy,specialist]=layers as PolicyVersion[];
  const configuration=composeControls(layers.map(v=>v!.definition));
  const referenceBase={environment,versions:{treasury:treasury.id,strategy:strategy.id,specialist:specialist.id},
    hashes:{treasury:treasury.contentHash,strategy:strategy.contentHash,specialist:specialist.contentHash},
    implementations:{treasury:treasury.definition.implementation,strategy:strategy.definition.implementation,
      specialist:specialist.definition.implementation},exitTreatment:strategy.definition.openPositions};
  const effectiveId=hash({reference:referenceBase,configuration});
  return {reference:{...referenceBase,revision,effectiveId},
    configuration:{...configuration,version:versionName(treasury.definition),strategyVersion:versionName(strategy.definition),
      name:strategy.definition.name,rules:[treasury.definition.justification,strategy.definition.justification],
      published:true,effectiveId,specialistVersion:versionName(specialist.definition),environment}};
}
export function policyDifferences(before:PolicyDefinition|undefined,after:PolicyDefinition){
  const old=before?.controls??{},next=after.controls;
  return [...new Set([...Object.keys(old),...Object.keys(next)])].sort().flatMap(field=>{
    const a=old[field as keyof PolicyControls]??null,b=next[field as keyof PolicyControls]??null;
    return canonical(a)===canonical(b)?[]:[{field,before:a,after:b}];
  });
}
