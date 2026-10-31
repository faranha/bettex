import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {createHash} from "node:crypto";
import {readFile,readdir} from "node:fs/promises";
import {join} from "node:path";
import {GetTradingPoliciesResponse} from "@workspace/api-zod";
import global from "../domain/policies/global.v1.json";
import strategy from "../domain/policies/strategy.v1.json";
import btc from "../domain/policies/btc.v1.json";
import eth from "../domain/policies/eth.v1.json";
import sol from "../domain/policies/sol.v1.json";
import {canonical,policyKey,type PolicyDefinition,type PolicyKey} from "../domain/policy-model";
const git=promisify(execFile);
const base="artifacts/api-server/src/modules/risk/domain/policies";
const definitions={global,strategy,btc,eth,sol};
const pathFor=(key:PolicyKey,version:number)=>`${base}/${key}.v${version}.json`;
const versionFrom=(name:string,key:PolicyKey)=>new RegExp(`^${key}\\.v([1-9][0-9]*)\\.json$`).exec(name);
const schema=GetTradingPoliciesResponse.shape.sources.element.shape.definition;
const sha=(s:string)=>createHash("sha256").update(s).digest("hex");
export const policyHash=(d:unknown)=>sha(canonical(d));
/** Reject extra keys at both levels, unknown implementations, wrong scope and incompatible schema. */
export function validateDefinition(value:unknown):PolicyDefinition{
  const parsed=schema.strict().extend({controls:schema.shape.controls.strict()}).parse(value) as PolicyDefinition;
  if(parsed.schemaVersion!==1||parsed.openPositions!=="preserve_original_exit_and_apply_emergency_controls"||
    parsed.type==="treasury"&&(parsed.scope!=="global"||parsed.implementation!=="treasury-paper-controls/1")||
    parsed.type==="strategy"&&(parsed.scope!=="predictions"||parsed.implementation!=="calibrated-event-lower-bound/1")||
    parsed.type==="specialist"&&(!["btc","eth","sol"].includes(parsed.scope)||
      parsed.implementation!=="polymarket-event-observer/1"||!parsed.search||
      !({btc:"bitcoin",eth:"ethereum",sol:"solana"} as Record<string,string>)[parsed.scope]||
      parsed.search!==({btc:"bitcoin",eth:"ethereum",sol:"solana"} as Record<string,string>)[parsed.scope]))
    throw new Error("invalid_policy_definition");
  if(parsed.type==="treasury"&&!Object.keys(global.controls).every(k=>k in parsed.controls))
    throw new Error("required_global_controls_missing");
  if(parsed.version===1&&parsed.previousVersion!==null||
    parsed.version>1&&parsed.previousVersion!==`${parsed.id}/${parsed.version-1}`)
    throw new Error("invalid_policy_ancestry");
  return parsed;
}
export async function sourceAtCommit(key:PolicyKey,revision:string){
  if(!/^[a-f0-9]{40}$/.test(revision))throw new Error("invalid_source_commit");
  try{
    const tree=(await git("git",["ls-tree","-r","--full-tree","--name-only",revision,"--",base],
      {maxBuffer:100000,timeout:5000})).stdout;
    const latest=tree.trim().split("\n").map(path=>({
      path,version:Number(versionFrom(path.slice(base.length+1),key)?.[1]??0),
    })).filter(x=>x.version>0&&Number.isSafeInteger(x.version)).sort((a,b)=>b.version-a.version)[0];
    if(!latest)throw new Error("committed_policy_source_required");
    const {stdout}=await git("git",["show",`${revision}:${latest.path}`],{maxBuffer:100000,timeout:5000});
    const d=validateDefinition(JSON.parse(stdout));
    if(policyKey(d)!==key||d.version!==latest.version||latest.path!==pathFor(key,d.version))
      throw new Error("source_scope_mismatch");
    return {definition:d,sourcePath:latest.path,contentHash:policyHash(d)};
  }catch(e){
    if(e instanceof SyntaxError)throw new Error("invalid_source_json");
    if(e instanceof Error&&["invalid_policy_definition","source_scope_mismatch",
      "committed_policy_source_required"].includes(e.message))throw e;
    throw new Error("committed_policy_source_required");
  }
}
export async function workingSources(){
  let revision:string|null=null,root:string|null=null;
  try{
    revision=(await git("git",["rev-parse","HEAD"],{timeout:5000})).stdout.trim();
    root=(await git("git",["rev-parse","--show-toplevel"],{timeout:5000})).stdout.trim();
  }catch{/* production may not have Git */ }
  return Promise.all((Object.keys(definitions) as PolicyKey[]).map(async key=>{
    let candidate:unknown=definitions[key];
    if(root){
      const files=(await readdir(join(root,base))).map(filename=>({
        filename,version:Number(versionFrom(filename,key)?.[1]??0),
      })).filter(x=>x.version>0&&Number.isSafeInteger(x.version)).sort((a,b)=>b.version-a.version);
      if(files[0])candidate=JSON.parse(await readFile(join(root,base,files[0].filename),"utf8"));
    }
    const definition=validateDefinition(candidate);
    let commit:string|null=null;
    if(revision)try{
      const at=await sourceAtCommit(key,revision);
      if(at.contentHash===policyHash(definition)&&at.definition.version===definition.version)commit=revision;
    }catch{/* remains a draft, never falsely claims Git provenance */ }
    return {key,definition,contentHash:policyHash(definition),sourceCommit:commit,state:commit?"committed" as const:"draft" as const};
  }));
}
