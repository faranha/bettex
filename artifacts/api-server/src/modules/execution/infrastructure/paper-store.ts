import {db} from "@workspace/db";
import {sql} from "drizzle-orm";
import type {PaperState} from "../application/paper-trading";
import type {PaperEvent} from "../domain/paper-model";
type Client=Pick<typeof db,"execute"|"insert">;
const tables={decisions:"execution_paper_decisions",orders:"execution_paper_orders",positions:"execution_paper_positions",events:"execution_paper_events"} as const;
let ready:Promise<void>|undefined;
export function ensurePaperExecution(){
  return ready??=(async()=>{
    for(const table of Object.values(tables)){
      await db.execute(sql.raw(`CREATE TABLE IF NOT EXISTS ${table}(id text PRIMARY KEY,record jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now())`));
      await db.execute(sql.raw(`CREATE INDEX IF NOT EXISTS ${table}_opportunity ON ${table} ((record->>'opportunityId'))`));
    }
  })().catch(e=>{ready=undefined;throw e;});
}
export function paperStore(ports:{
  readLedger(client:Client):Promise<PaperState["ledger"]>;
  saveLedger(client:Client,ledger:PaperState["ledger"]):Promise<void>;
  event(client:Client,e:PaperEvent):Promise<void>;
}){
  return {
    async atomic<T>(run:(s:PaperState,client:Client)=>Promise<T>):Promise<T>{
      await ensurePaperExecution();
      return db.transaction(async tx=>{
        await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('treasury-control:prediction-simulation'))`);
        const state:PaperState={ledger:await ports.readLedger(tx),decisions:[],orders:[],positions:[],events:[]};
        const previous=new Map<string,string>();
        for(const [key,table] of Object.entries(tables) as [keyof typeof tables,string][]){
          const rows=(await tx.execute(sql.raw(`SELECT record FROM ${table} ORDER BY created_at,id`))).rows;
          const list=rows.map(r=>r.record as {id:string});
          Object.assign(state,{[key]:list});
          for(const row of list)previous.set(`${key}:${row.id}`,JSON.stringify(row));
        }
        state.events.sort((a,b)=>a.sequence-b.sequence);
        const result=await run(state,tx);
        await ports.saveLedger(tx,state.ledger);
        for(const [key,table] of Object.entries(tables) as [keyof typeof tables,string][]){
          for(const record of state[key] as unknown as {id:string}[]){
            if(previous.get(`${key}:${record.id}`)===JSON.stringify(record))continue;
            await tx.execute(sql`INSERT INTO ${sql.raw(table)}(id,record) VALUES(${record.id},${JSON.stringify(record)}::jsonb)
              ON CONFLICT(id) DO UPDATE SET record=excluded.record`);
            if(key==="events"&&!previous.has(`${key}:${record.id}`))await ports.event(tx,record as PaperEvent);
          }
        }
        return structuredClone(result);
      });
    },
  };
}
