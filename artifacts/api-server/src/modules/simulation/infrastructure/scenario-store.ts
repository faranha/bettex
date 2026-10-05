import {db} from "@workspace/db";
import {sql} from "drizzle-orm";
import {createScenario,commandScenario,scenarioView} from "../application/scenario-engine";
import type {ScenarioRun,ScenarioCommand,Scenario} from "../application/scenario-model";
let ready:Promise<void>|undefined;
export function ensureSimulationStore(){
  return ready??=db.execute(sql`CREATE TABLE IF NOT EXISTS simulation_runs(
    id text PRIMARY KEY,owner_id text NOT NULL,environment text NOT NULL CHECK(environment='simulation'),
    record jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
    CREATE INDEX IF NOT EXISTS simulation_runs_owner ON simulation_runs(owner_id,created_at);
    CREATE TABLE IF NOT EXISTS simulation_commands(
      owner_id text NOT NULL,request_id text NOT NULL,content_hash text NOT NULL,result_run_id text NOT NULL,
      PRIMARY KEY(owner_id,request_id));`).then(()=>undefined).catch(e=>{ready=undefined;throw e;});
}
export async function simulationSnapshot(owner:string,id?:string,kind?:string,offset=0){
  await ensureSimulationStore();
  const records=(await db.execute(sql`SELECT record FROM simulation_runs WHERE owner_id=${owner} ORDER BY created_at DESC,id LIMIT 30`)).rows;
  const runs=records.map(x=>x.record as ScenarioRun);
  let run=id?runs.find(x=>x.id===id):runs[0];
  if(id&&!run){
    run=(await db.execute(sql`SELECT record FROM simulation_runs WHERE id=${id} AND owner_id=${owner}`)).rows[0]?.record as ScenarioRun|undefined;
    if(!run)throw new Error("simulation_not_found");
  }
  const events=[...(run?.events??[])].reverse().filter(e=>!kind||e.kind===kind);
  return {mode:"simulation" as const,runs:runs.map(({id,environment,scenario,stage,revision,paused,clock})=>
    ({id,environment,scenario,stage,revision,paused,clock})),run:run?scenarioView(run):null,
    events:events.slice(offset,offset+25),total:events.length,offset,hasMore:events.length>offset+25};
}
export async function mutateSimulation(owner:string,input:ScenarioCommand&{
  runId?:string;expectedRevision?:number;scenario?:Scenario;requestId:string},contentHash:string,id:string){
  await ensureSimulationStore();
  return db.transaction(async tx=>{
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`simulation-owner:${owner}`}))`);
    const receipt=(await tx.execute(sql`SELECT content_hash,result_run_id FROM simulation_commands
      WHERE owner_id=${owner} AND request_id=${input.requestId}`)).rows[0];
    if(receipt){
      if(receipt.content_hash!==contentHash)throw new Error("simulation_idempotency_conflict");
      return String(receipt.result_run_id);
    }
    let run:ScenarioRun;
    if(input.action==="start"){run=createScenario(id,input.scenario??"complete");}
    else {
      if(!input.runId)throw new Error("simulation_run_required");
      const stored=(await tx.execute(sql`SELECT record FROM simulation_runs WHERE id=${input.runId} AND owner_id=${owner} FOR UPDATE`)).rows[0];
      if(!stored)throw new Error("simulation_not_found");
      run=stored.record as ScenarioRun;
      if(input.expectedRevision!==run.revision)throw new Error("simulation_revision_changed");
      if(input.action==="reset"){
        await tx.execute(sql`DELETE FROM simulation_runs WHERE id=${run.id} AND owner_id=${owner}`);
        run=createScenario(id,run.scenario);
      }else await commandScenario(run,input);
    }
    await tx.execute(sql`INSERT INTO simulation_runs(id,owner_id,environment,record)
      VALUES(${run.id},${owner},'simulation',${JSON.stringify(run)}::jsonb)
      ON CONFLICT(id) DO UPDATE SET record=EXCLUDED.record`);
    await tx.execute(sql`INSERT INTO simulation_commands(owner_id,request_id,content_hash,result_run_id)
      VALUES(${owner},${input.requestId},${contentHash},${run.id})`);
    return run.id;
  });
}
