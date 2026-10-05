import {db} from "@workspace/db";
import {sql} from "drizzle-orm";
import {emptyPaperLedger,type PaperLedger} from "../domain/paper-treasury";
type Client=Pick<typeof db,"execute">;
export async function ensurePaperLedger(){
  await db.execute(sql`CREATE TABLE IF NOT EXISTS ledger_paper_treasury(
    id text PRIMARY KEY,record jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now())`);
}
export async function readPaperLedger(client:Client,defensiveUnits:string):Promise<PaperLedger>{
  const existing=(await client.execute(sql`SELECT record FROM ledger_paper_treasury WHERE id='prediction-simulation'`)).rows[0]?.record as PaperLedger|undefined;
  if(!existing)return emptyPaperLedger(defensiveUnits);
  // Safe policy upgrade only while nothing has ever been funded or reserved.
  if(existing.status==="unfunded"&&existing.fundingUnits===null&&existing.cashUnits===null&&
    existing.entries.length===0&&Object.keys(existing.reservations).length===0)
    return {...existing,defensiveUnits};
  return existing;
}
export async function savePaperLedger(client:Client,record:PaperLedger){
  await client.execute(sql`INSERT INTO ledger_paper_treasury(id,record) VALUES('prediction-simulation',${JSON.stringify(record)}::jsonb)
    ON CONFLICT(id) DO UPDATE SET record=excluded.record,updated_at=now()`);
}
