import {db} from "@workspace/db";
import {sql} from "drizzle-orm";
import {alphaWorkerDefinitions,workerActivity,type AgentRun} from "../domain/operations";
type Client=Pick<typeof db,"execute">;
let ready:Promise<void>|undefined;
export function ensureOperationsStore():Promise<void>{
  return ready??=db.execute(sql`CREATE TABLE IF NOT EXISTS agent_operation_runs(
    sequence bigserial PRIMARY KEY,id text UNIQUE NOT NULL,agent_id text NOT NULL,
    completed_at timestamptz NOT NULL,record jsonb NOT NULL
  )`).then(()=>db.execute(sql`CREATE INDEX IF NOT EXISTS agent_operation_runs_agent_sequence
    ON agent_operation_runs(agent_id,sequence DESC)`))
    .then(()=>db.execute(sql`CREATE TABLE IF NOT EXISTS agent_operation_workers(
      agent_id text PRIMARY KEY,record jsonb NOT NULL,run_count bigint NOT NULL
    )`)).then(()=>undefined).catch(e=>{ready=undefined;throw e;});
}
export async function saveAgentRun(client:Client,run:AgentRun){
  const inserted=await client.execute(sql`INSERT INTO agent_operation_runs(id,agent_id,completed_at,record)
    VALUES(${run.id},${run.agentId},${run.completedAt},${JSON.stringify(run)}::jsonb)
    ON CONFLICT(id) DO NOTHING RETURNING id`);
  if(!inserted.rows.length)return;
  await client.execute(sql`INSERT INTO agent_operation_workers(agent_id,record,run_count)
    VALUES(${run.agentId},${JSON.stringify(run)}::jsonb,1)
    ON CONFLICT(agent_id) DO UPDATE SET record=excluded.record,run_count=agent_operation_workers.run_count+1`);
}
export async function readAgentCenter(agentId?:string,before?:string){
  await ensureOperationsStore();
  return db.transaction(async client=>{
    await client.execute(sql`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY`);
    const now=Date.now(),latest=(await client.execute(sql`SELECT agent_id,record,run_count FROM agent_operation_workers`)).rows;
    const records=(await client.execute(sql`SELECT sequence::text AS cursor,record FROM agent_operation_runs
      WHERE (${agentId??null}::text IS NULL OR agent_id=${agentId??null})
      AND (${before??null}::bigint IS NULL OR sequence<${before??null}::bigint)
      ORDER BY sequence DESC LIMIT 41`)).rows;
    const page=records.slice(0,40);
    return {mode:"read_only_and_paper_no_real_money",asOf:new Date(now).toISOString(),
      agents:alphaWorkerDefinitions.map(d=>{
        const row=latest.find(r=>r.agent_id===d.id),run=row?.record as AgentRun|undefined;
        return {...d,latest:run??null,activity:workerActivity(run??null,now),runCount:Number(row?.run_count??0)};
      }),history:page.map(r=>r.record),hasMore:records.length>40,nextBefore:records.length>40?String(page.at(-1)!.cursor):null};
  });
}
