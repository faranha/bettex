import {randomUUID} from "node:crypto";
/** Development-only governance surface; no authority to fund or execute real assets. */
import {Router} from "express";
import {db} from "@workspace/db";
import {sql} from "drizzle-orm";
import {timingSafeEqual} from "node:crypto";
import {CommandTradingPoliciesBody,GetTradingPoliciesResponse} from "@workspace/api-zod";
import {testAccountsEnabled,token,permittedOrigin} from "./test-accounts";
import {accountsStore,ensureAccountsSchema,limitAuthAttempts} from "../modules/accounts/infrastructure/store";
import {canReadTreasuryHistory} from "../modules/accounts/infrastructure/history-permission";
import {treasuryIdentity} from "../modules/accounts/infrastructure/treasury-permissions";
import {tradingPolicyRegistry} from "../modules/risk/application/policy-registry";
import {resolvePolicy} from "../modules/risk/domain/policy-composition";
import type {PolicyAsset,PolicyEnvironment,PolicyRegistryState} from "../modules/risk/domain/policy-model";
import {sourceAtCommit,workingSources,policyHash} from "../modules/risk/infrastructure/policy-sources";
import {ensureTradingPolicyStore,registry,lockPolicyControl,readPolicyControl,publishedVersion,
  appendVersion,saveControl,appendChange} from "../modules/risk/infrastructure/policy-store";
import {ensureHistorySchema,appendHistory} from "../modules/audit/infrastructure/history-store";
import {ensureAlphaStore} from "../modules/agents/infrastructure/alpha-store";
import {ensurePaperRuntime} from "./paper-runtime";
const router=Router();
let ready:Promise<unknown>|undefined;
const initialize=()=>ready??=Promise.all([ensureAccountsSchema(),ensureHistorySchema(),ensureTradingPolicyStore(),
  ensureAlphaStore(),ensurePaperRuntime()]).then(()=>canReadTreasuryHistory("no-actor")).catch(e=>{ready=undefined;throw e;});
const service=tradingPolicyRegistry({
  hash:policyHash,source:sourceAtCommit,id:randomUUID,now:Date.now,
  atomic:async(environment,run)=>db.transaction(async client=>{
    const control=await lockPolicyControl(client,environment);
    const tx={
      control,registry:()=>registry(client,environment,control),
      version:(id:string)=>publishedVersion(client,id),
      append:(v:Parameters<typeof appendVersion>[1])=>appendVersion(client,v),
      permissions:(id:string)=>treasuryIdentity(client).permissions(id),
      save:()=>saveControl(client,environment,control),
      event:async(c:Parameters<typeof appendChange>[2])=>{
        await appendChange(client,environment,c);
        await appendHistory({key:`trading-policy:${environment}:${c.revision}`,subject:"treasury:trading",
          visibility:"admin",correlationId:`trading-policy:${environment}:${c.versionId??"proposal"}`,
          category:"automatic",kind:`trading_policy_${c.action}`,state:c.action==="approve"||c.action==="activate"||
          c.action==="rollback"?"authorized":"calculated",actor:"admin",environment:"simulation",
          source:"policy_registry",occurredAt:new Date(c.at),data:{actorId:c.actor,actorType:c.actorType,
            versionId:c.versionId??"none",revision:String(c.revision),reason:c.reason,
            differences:c.differences??[]}},client);
      },
    };
    return run(tx);
  }),
});
async function affected(state:PolicyRegistryState,environment:PolicyEnvironment){
  const current=(asset:PolicyAsset)=>{
    try{return service.effective(state,environment,asset).reference.effectiveId;}catch{return null;}
  };
  const results:{id:string;kind:"opportunity"|"order"|"position";state:string;
    originalEffectiveId:string|null;currentEffectiveId:string|null;action:string}[]=[];
  const sources=[
    {table:"agents_alpha_records",kind:"opportunity"},
    {table:"execution_paper_orders",kind:"order"},
    {table:"execution_paper_positions",kind:"position"},
  ] as const;
  for(const {table,kind} of sources){
    const rows=(await db.execute(sql`SELECT id,record FROM ${sql.raw(table)}
      ORDER BY created_at DESC,id DESC`)).rows;
    for(const row of rows){
      const r=row.record as Record<string,unknown>,o=r.opportunity as Record<string,unknown>|undefined;
      const asset=String(o?.specialist??r.asset),status=String(r.queueState??r.state??"unknown");
      if(!["btc","eth","sol"].includes(asset)||kind==="position"&&!["open","reducing"].includes(status)||
        kind==="order"&&!["pending","partial"].includes(status)||
        kind==="opportunity"&&!["qualified","selected","awaiting_decision","forwarded_to_execution"].includes(status))continue;
      const active=current(asset as PolicyAsset);
      const reference=r.policyReference as Record<string,unknown>|undefined;
      const original=(o?.policyEffectiveId??reference?.effectiveId??r.policyEffectiveId) as string|undefined;
      results.push({id:String(row.id),kind,state:status,originalEffectiveId:original??null,currentEffectiveId:active,
        action:kind==="position"?"keep_original_exit_plan_and_evaluate_emergency_controls":
          !active||!original||original!==active?"reanalysis_required":"revalidate_before_allocation"});
    }
  }
  return results;
}
async function snapshot(environment:PolicyEnvironment,permissions:string[]){
  const state=await registry(db,environment);
  const effective=(["btc","eth","sol"] as const).map(asset=>{
    try{
      const result=service.effective(state,environment,asset);
      return {asset,status:"active" as const,reason:result.configuration.paused?"treasury_paused":"simulation_only",
        reference:result.reference,configuration:result.configuration};
    }catch(e){
      return {asset,status:"blocked" as const,reason:e instanceof Error?e.message:"policy_invalid"};
    }
  });
  return GetTradingPoliciesResponse.parse({environment,revision:state.revision,permissions,
    sources:await workingSources(),versions:state.versions,effective,changes:state.changes,
    affected:await affected(state,environment),asOf:new Date().toISOString()});
}
router.all("/treasury/policies",async(req,res)=>{
  res.set("Cache-Control","private, no-store");
  try{
    if(!["GET","POST"].includes(req.method)){res.status(405).json({code:"method_not_allowed"});return;}
    if(!testAccountsEnabled()){res.status(403).json({code:"test_environment_required"});return;}
    await initialize();
    const session=await accountsStore().session(token(req));
    if(!session){res.status(401).json({code:"session_required"});return;}
    const permissions=await treasuryIdentity(db).permissions(session.accountId);
    if(!permissions.some(p=>["treasury_view","treasury_policy","treasury_propose","treasury_approve",
      "treasury_activate","treasury_pause"].includes(p))){
      res.status(403).json({code:"permission_required"});return;
    }
    if(req.method==="GET"){
      if(req.query.environment!==undefined&&req.query.environment!=="development"){
        res.status(403).json({code:"environment_not_available"});return;
      }
      res.json(await snapshot("development",permissions));return;
    }
    if(!permittedOrigin(req)||!req.is("application/json")){res.status(403).json({code:"origin_not_allowed"});return;}
    const parsed=CommandTradingPoliciesBody.strict().safeParse(req.body);
    if(!parsed.success){res.status(400).json({code:"invalid_command"});return;}
    const c=parsed.data;
    if(c.environment!=="development"){res.status(403).json({code:"environment_not_available"});return;}
    const actual=Buffer.from(c.csrf),expected=Buffer.from(session.csrf);
    if(actual.length!==expected.length||!timingSafeEqual(actual,expected)){
      res.status(403).json({code:"session_required"});return;
    }
    await limitAuthAttempts(`trading-policy:${session.accountId}`,60);
    await service.command(c,{id:session.accountId,type:"human"});
    res.json(await snapshot(c.environment,permissions));
  }catch(e){
    const code=e instanceof Error?e.message:"policy_unavailable";
    if(["permission_required","human_authority_required","independent_approver_required"].includes(code)){
      res.status(403).json({code});return;
    }
    if(["policy_revision_changed","published_version_immutable","already_active","already_revoked",
      "valid_approval_required","invalid_version_state","rollback_target_invalid","previous_version_required",
      "source_scope_mismatch","policy_weakening:maxOrderUnits"].includes(code)){
      res.status(409).json({code});return;
    }
    if(["justification_required","committed_policy_source_required","invalid_source_json",
      "invalid_policy_definition","invalid_policy_ancestry","required_global_controls_missing",
      "version_required","version_not_found","invalid_source_commit"].includes(code)||code.startsWith("policy_weakening:")||
      code.startsWith("required_control:")||code.startsWith("required_global_control:")){
      res.status(400).json({code});return;
    }
    req.log.error({code:"trading_policy_unavailable",error:code},"Policy registry command failed");
    res.status(503).json({code:"trading_policy_unavailable"});
  }
});
export default router;
