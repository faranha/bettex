import {policyKey,versionId,type PolicyVersion,type PolicyKey,
  type PolicyEnvironment,type PolicyRegistryState,type PolicyDefinition,type PolicyAsset,type PolicyChange,type PolicyControl}
  from "../domain/policy-model";
import {resolvePolicy,policyDifferences} from "../domain/policy-composition";
export type PolicyCommand={action:"propose"|"publish"|"approve"|"activate"|"rollback"|"revoke";
  environment:PolicyEnvironment;reason:string;expectedRevision:number;key?:PolicyKey;versionId?:string;sourceCommit?:string};
type Actor={id:string;type:"human"|"agent"};
export type PolicyPorts={
  atomic<T>(environment:PolicyEnvironment,run:(tx:PolicyTransaction)=>Promise<T>):Promise<T>;
  source(key:PolicyKey,commit:string):Promise<{definition:PolicyDefinition;contentHash:string;sourcePath:string}>;
  hash(value:unknown):string;
  id():string;
  now():number;
};
export type PolicyTransaction={
  control:PolicyControl;
  registry():Promise<PolicyRegistryState>;
  version(id:string):Promise<PolicyVersion|undefined>;
  append(v:PolicyVersion):Promise<void>;
  permissions(id:string):Promise<string[]>;
  save():Promise<void>;
  event(change:PolicyChange):Promise<void>;
};
export function tradingPolicyRegistry(ports:PolicyPorts){
  const effective=(s:PolicyRegistryState,e:PolicyEnvironment,asset:PolicyAsset)=>{
    const selected=(["global","strategy",asset] as const).flatMap(k=>{
      const id=s.active[k];return id?s.versions.filter(v=>v.id===id):[];
    });
    return resolvePolicy(selected,e,asset,s.revision,ports.hash);
  };
  return {
    effective,
    async command(c:PolicyCommand,actor:Actor){
      if(!c.reason||c.reason.trim().length<12)throw new Error("justification_required");
      if(actor.type!=="human"&&c.action!=="propose")throw new Error("human_authority_required");
      // Git is read before acquiring the shared paper ledger lock; a commit's object cannot change.
      const source=c.action==="publish"&&c.key&&c.sourceCommit?await ports.source(c.key,c.sourceCommit):undefined;
      return ports.atomic(c.environment,async tx=>{
        const state=tx.control;
        if(state.revision!==c.expectedRevision)throw new Error("policy_revision_changed");
        const permission=c.action==="publish"?"treasury_policy":c.action==="approve"?"treasury_approve":
          c.action==="activate"||c.action==="rollback"?"treasury_activate":
          c.action==="revoke"?"treasury_pause":"treasury_propose";
        if(!(await tx.permissions(actor.id)).includes(permission))throw new Error("permission_required");
        const old=await tx.registry();
        let target:PolicyVersion|undefined,candidate:PolicyDefinition|undefined;
        if(c.action==="publish"){
          if(!source||!c.key)throw new Error("committed_policy_source_required");
          candidate=source.definition;
          if(policyKey(candidate)!==c.key)throw new Error("source_scope_mismatch");
          const id=versionId(candidate,c.environment),previous=await tx.version(id);
          if(previous){
            if(previous.contentHash!==source.contentHash||previous.sourceCommit!==c.sourceCommit)
              throw new Error("published_version_immutable");
            return old; // idempotent publish: no revision, duplicate approval or audit event
          }
          if(candidate.previousVersion){
            const parent=`${c.environment}:${candidate.type}:${candidate.previousVersion}`;
            if(!await tx.version(parent))throw new Error("previous_version_required");
          }
          target={id,environment:c.environment,definition:candidate,contentHash:source.contentHash,
            sourceCommit:c.sourceCommit!,sourcePath:source.sourcePath,author:actor.id,justification:c.reason,
            publishedAt:new Date(ports.now()).toISOString(),state:"validated",approvalRequired:true,
            approver:null,approvedAt:null,activatedAt:null,replacedBy:null};
          await tx.append(target);
          state.statuses[id]={state:"validated",approver:null,approvedAt:null,activatedAt:null,replacedBy:null};
        }else if(c.action!=="propose"){
          if(!c.versionId)throw new Error("version_required");
          const found=old.versions.find(v=>v.id===c.versionId)??await tx.version(c.versionId);
          if(!found||found.environment!==c.environment)throw new Error("version_not_found");
          target={...found,...state.statuses[found.id]};candidate=target.definition;
          const lifecycle=state.statuses[target.id];if(!lifecycle)throw new Error("invalid_version_state");
          if(c.action==="approve"){
            if(lifecycle.state!=="validated")throw new Error("invalid_version_state");
            if(target.author===actor.id)throw new Error("independent_approver_required");
            lifecycle.state="approved";lifecycle.approver=actor.id;lifecycle.approvedAt=new Date(ports.now()).toISOString();
          }else if(c.action==="activate"||c.action==="rollback"){
            if(!["approved","superseded"].includes(lifecycle.state)||!lifecycle.approver||!lifecycle.approvedAt||
              !(await tx.permissions(lifecycle.approver)).includes("treasury_approve"))
              throw new Error("valid_approval_required");
            const key=policyKey(target.definition),previousId=state.active[key];
            if(c.action==="rollback"&&(!previousId||lifecycle.state!=="superseded"||previousId===target.id||
              target.definition.version>=(old.versions.find(v=>v.id===previousId)?.definition.version??0)))
              throw new Error("rollback_target_invalid");
            if(previousId===target.id)throw new Error("already_active");
            if(previousId&&state.statuses[previousId]){
              state.statuses[previousId].state="superseded";
              state.statuses[previousId].replacedBy=target.id;
            }
            state.active[key]=target.id;
            lifecycle.state="active";lifecycle.activatedAt=new Date(ports.now()).toISOString();
            lifecycle.replacedBy=null;
          }else if(c.action==="revoke"){
            if(lifecycle.state==="revoked")throw new Error("already_revoked");
            lifecycle.state="revoked";if(state.active[policyKey(target.definition)]===target.id)
              delete state.active[policyKey(target.definition)];
          }
        }
        state.revision++;
        // Validate every complete active stack with the same resolver used by agents/execution.
        const after=await tx.registry();
        after.revision=state.revision;
        after.active=state.active;
        if(target&&!after.versions.some(v=>v.id===target.id))after.versions.unshift(target);
        after.versions=after.versions.map(v=>({...v,...state.statuses[v.id]}));
        for(const asset of ["btc","eth","sol"] as const)
          if(state.active.global&&state.active.strategy&&state.active[asset])effective(after,c.environment,asset);
        const key=candidate?policyKey(candidate):undefined;
        const before=key&&old.active[key]?old.versions.find(v=>v.id===old.active[key])?.definition:undefined;
        const change:PolicyChange={id:ports.id(),action:c.action,actor:actor.id,actorType:actor.type,reason:c.reason,
          at:new Date(ports.now()).toISOString(),revision:state.revision,versionId:target?.id??null,
          differences:candidate?policyDifferences(before,candidate):[]};
        await tx.save();await tx.event(change);
        return {...after,changes:[change,...after.changes]};
      });
    },
  };
}
