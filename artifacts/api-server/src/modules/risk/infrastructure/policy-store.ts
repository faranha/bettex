import {db} from "@workspace/db";
import {sql} from "drizzle-orm";
import type {PolicyEnvironment,PolicyVersion,PolicyRegistryState,PolicyChange,PolicyControl} from "../domain/policy-model";
type Client=Pick<typeof db,"execute">;
const empty=():PolicyControl=>({revision:0,active:{},statuses:{}});
let ready:Promise<void>|undefined;
export function ensureTradingPolicyStore(){
  return ready??=(async()=>{
    await db.execute(sql`CREATE TABLE IF NOT EXISTS trading_policy_versions(
      id text PRIMARY KEY,environment text NOT NULL CHECK(environment IN ('development','production')),
      record jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now())`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS trading_policy_versions_environment
      ON trading_policy_versions(environment,created_at DESC)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS trading_policy_control(
      environment text PRIMARY KEY CHECK(environment IN ('development','production')),state jsonb NOT NULL)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS trading_policy_changes(
      id text PRIMARY KEY,environment text NOT NULL CHECK(environment IN ('development','production')),
      record jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now())`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS trading_policy_changes_environment
      ON trading_policy_changes(environment,created_at DESC)`);
    await db.execute(sql`CREATE OR REPLACE FUNCTION trading_policy_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'policy_published_record_immutable'; END $$`);
    await db.execute(sql`DO $$ BEGIN
      IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='trading_policy_version_immutable') THEN
        CREATE TRIGGER trading_policy_version_immutable BEFORE UPDATE OR DELETE ON trading_policy_versions
        FOR EACH ROW EXECUTE FUNCTION trading_policy_immutable(); END IF;
      IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='trading_policy_change_immutable') THEN
        CREATE TRIGGER trading_policy_change_immutable BEFORE UPDATE OR DELETE ON trading_policy_changes
        FOR EACH ROW EXECUTE FUNCTION trading_policy_immutable(); END IF;
    END $$`);
  })().catch(e=>{ready=undefined;throw e;});
}
export async function lockPolicyControl(client:Client,environment:PolicyEnvironment){
  await client.execute(sql`SELECT pg_advisory_xact_lock(hashtext('treasury-control:prediction-simulation'))`);
  await client.execute(sql`INSERT INTO trading_policy_control(environment,state)
    VALUES(${environment},${JSON.stringify(empty())}::jsonb) ON CONFLICT DO NOTHING`);
  const row=(await client.execute(sql`SELECT state FROM trading_policy_control WHERE environment=${environment} FOR UPDATE`)).rows[0];
  return row.state as PolicyControl;
}
export async function readPolicyControl(client:Client,environment:PolicyEnvironment):Promise<PolicyControl>{
  return (await client.execute(sql`SELECT state FROM trading_policy_control WHERE environment=${environment}`)).rows[0]?.state as PolicyControl??empty();
}
export async function registry(client:Client,environment:PolicyEnvironment,control?:PolicyControl):Promise<PolicyRegistryState>{
  const state=control??await readPolicyControl(client,environment);
  const versions=(await client.execute(sql`SELECT record FROM trading_policy_versions
    WHERE environment=${environment} ORDER BY created_at DESC,id DESC LIMIT 200`)).rows.map(r=>{
    const original=r.record as PolicyVersion;return {...original,...state.statuses[original.id]};
  });
  for(const id of Object.values(state.active)){
    if(id&&!versions.some(v=>v.id===id)){
      const original=await publishedVersion(client,id);
      if(original)versions.push({...original,...state.statuses[id]});
    }
  }
  const changes=(await client.execute(sql`SELECT record FROM trading_policy_changes
    WHERE environment=${environment} ORDER BY created_at DESC,id DESC LIMIT 200`)).rows.map(r=>r.record as PolicyChange);
  return {revision:state.revision,active:{...state.active},versions,changes};
}
export async function publishedVersion(client:Client,id:string):Promise<PolicyVersion|undefined>{
  return (await client.execute(sql`SELECT record FROM trading_policy_versions WHERE id=${id}`)).rows[0]?.record as PolicyVersion|undefined;
}
export async function appendVersion(client:Client,v:PolicyVersion){
  await client.execute(sql`INSERT INTO trading_policy_versions(id,environment,record)
    VALUES(${v.id},${v.environment},${JSON.stringify(v)}::jsonb)`);
}
export async function saveControl(client:Client,environment:PolicyEnvironment,state:PolicyControl){
  await client.execute(sql`UPDATE trading_policy_control SET state=${JSON.stringify(state)}::jsonb
    WHERE environment=${environment}`);
}
export async function appendChange(client:Client,e:PolicyEnvironment,change:PolicyChange){
  await client.execute(sql`INSERT INTO trading_policy_changes(id,environment,record)
    VALUES(${change.id},${e},${JSON.stringify(change)}::jsonb)`);
}
