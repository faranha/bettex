import {db} from "@workspace/db";
import {readPolicyControl,publishedVersion,ensureTradingPolicyStore} from "./policy-store";
import {validateDefinition,policyHash} from "./policy-sources";
import {resolvePolicy} from "../domain/policy-composition";
import type {PolicyAsset,PolicyEnvironment,EffectivePolicy,PolicyVersion,PolicyKey} from "../domain/policy-model";
type Client=Pick<typeof db,"execute">;
/** DB-published versions only. Do not silently use bundled drafts as operational policy. */
export async function effectiveTradingPolicy(client:Client,asset:PolicyAsset,
  environment:PolicyEnvironment="development"):Promise<EffectivePolicy>{
  await ensureTradingPolicyStore();
  const control=await readPolicyControl(client,environment),versions:PolicyVersion[]=[];
  for(const key of ["global","strategy",asset] as PolicyKey[]){
    const id=control.active[key];
    if(!id)throw new Error("valid_active_policy_required");
    const original=await publishedVersion(client,id),status=control.statuses[id];
    if(!original||!status||status.state!=="active"||original.environment!==environment)
      throw new Error("valid_active_policy_required");
    const definition=validateDefinition(original.definition);
    versions.push({...original,...status,definition});
  }
  return resolvePolicy(versions,environment,asset,control.revision,policyHash);
}
