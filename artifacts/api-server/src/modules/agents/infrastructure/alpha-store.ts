import {db} from "@workspace/db";
import {sql} from "drizzle-orm";
import type {AlphaTransaction} from "../application/alpha-hierarchy";
import type {OpportunityRecord} from "../domain/opportunity";
import type {SourceStatus} from "./polymarket-btc";
type Client=Pick<typeof db,"execute"|"insert">;
let ready:Promise<void>|undefined;
export function ensureAlphaStore(){
  return ready??=db.execute(sql`CREATE TABLE IF NOT EXISTS agents_alpha_records(
    id text PRIMARY KEY, record jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`)
    .then(()=>db.execute(sql`CREATE TABLE IF NOT EXISTS agents_alpha_source(
      id text PRIMARY KEY, status jsonb NOT NULL)`)).then(()=>undefined).catch(e=>{ready=undefined;throw e;});
}
const records=async(client:Client):Promise<OpportunityRecord[]> =>
  (await client.execute(sql`SELECT record FROM agents_alpha_records
    WHERE record->>'state' IN ('qualified','selected','awaiting_authorization','allocation_authorized','allocation_uncertain','allocation_confirmed')
      OR id IN (SELECT id FROM agents_alpha_records ORDER BY created_at DESC LIMIT 100)
    ORDER BY created_at DESC`)).rows.map(r=>r.record as OpportunityRecord);
export function alphaStore(event:(record:OpportunityRecord,client:Client)=>Promise<void>){
  return {
    async atomic<T>(run:(tx:AlphaTransaction)=>Promise<T>):Promise<T>{
      await ensureAlphaStore();
      return db.transaction(async client=>{
        await client.execute(sql`SELECT pg_advisory_xact_lock(hashtext('agents:alpha'))`);
        return run({list:()=>records(client),find:async id=>
          (await client.execute(sql`SELECT record FROM agents_alpha_records WHERE id=${id}`)).rows[0]?.record as OpportunityRecord|undefined,
          save:async r=>{
          await client.execute(sql`INSERT INTO agents_alpha_records(id,record) VALUES(${r.opportunity.id},${JSON.stringify(r)}::jsonb)
            ON CONFLICT(id) DO UPDATE SET record=excluded.record`);
        },event:r=>event(r,client)});
      });
    },
    async list(){await ensureAlphaStore();return (await db.execute(sql`SELECT record FROM agents_alpha_records
      ORDER BY created_at DESC LIMIT 50`)).rows.map(r=>r.record as OpportunityRecord);},
    async record(id:string){await ensureAlphaStore();
      return (await db.execute(sql`SELECT record FROM agents_alpha_records WHERE id=${id}`)).rows[0]?.record as OpportunityRecord|undefined;},
    async source(asset="btc"){await ensureAlphaStore();
      return (await db.execute(sql`SELECT status FROM agents_alpha_source WHERE id=${asset}`)).rows[0]?.status as SourceStatus|undefined;},
    async setSource(s:SourceStatus,asset="btc"){await ensureAlphaStore();
      await db.execute(sql`INSERT INTO agents_alpha_source(id,status) VALUES(${asset},${JSON.stringify(s)}::jsonb)
        ON CONFLICT(id) DO UPDATE SET status=excluded.status`);},
  };
}
