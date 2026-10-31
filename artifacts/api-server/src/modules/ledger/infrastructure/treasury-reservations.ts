import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
type Client = Pick<typeof db,"execute">;
export async function withTreasuryLock<T>(epoch:string, run:(client:Client & Pick<typeof db,"insert">)=>Promise<T>) {
  return db.transaction(async tx=>{
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`treasury-control:${epoch}`}))`);
    return run(tx);
  });
}
export async function ensureTreasuryReservations() {
  await db.execute(sql`CREATE TABLE IF NOT EXISTS treasury_allocation_reservations(
    id text PRIMARY KEY,epoch text NOT NULL,units text NOT NULL CHECK(units ~ '^[1-9][0-9]*$'),
    state text NOT NULL CHECK(state IN('held','spent','released')),day bigint NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now())`);
}
export function treasuryReservations(client:Client,epoch:string) {
  return {
    async totals(day:number,except="") {
      const rows=(await client.execute(sql`SELECT units,state,day FROM treasury_allocation_reservations
        WHERE epoch=${epoch} AND id<>${except} AND state<>'released'`)).rows;
      const sum=(predicate:(r:typeof rows[number])=>boolean)=>String(rows.filter(predicate).reduce((v,r)=>v+BigInt(String(r.units)),0n));
      return {reservedUnits:sum(r=>r.state==="held"),allocatedUnits:sum(r=>r.state==="spent"),
        dailyCommittedUnits:sum(r=>r.state==="held"||Number(r.day)===day)};
    },
    async reserve(id:string,units:string,day:number) {
      await client.execute(sql`INSERT INTO treasury_allocation_reservations(id,epoch,units,state,day)
        VALUES(${id},${epoch},${units},'held',${day}) ON CONFLICT(id) DO NOTHING`);
      const r=(await client.execute(sql`SELECT * FROM treasury_allocation_reservations WHERE id=${id}`)).rows[0];
      if(!r||r.epoch!==epoch||r.units!==units||r.state!=="held")throw new Error("reservation_conflict");
    },
    async release(id:string){await client.execute(sql`UPDATE treasury_allocation_reservations SET state='released' WHERE id=${id} AND epoch=${epoch} AND state='held'`);},
    async spent(id:string,day:number){await client.execute(sql`UPDATE treasury_allocation_reservations SET state='spent',day=${day} WHERE id=${id} AND epoch=${epoch} AND state IN('held','spent')`);},
  };
}
/** Read protection without activating a controller or granting any permission. */
export async function treasuryProtection(epoch:string) {
  if(!(await db.execute(sql`SELECT to_regclass('treasury_governance_control') AS t`)).rows[0]?.t)
    return {paused:false,protectedUnits:"0"};
  const row=(await db.execute(sql`SELECT policy FROM treasury_governance_control WHERE epoch=${epoch}`)).rows[0];
  if(!row)return {paused:false,protectedUnits:"0"};
  const policy=row.policy as {paused:boolean;defensiveUnits:string};
  const holds=(await db.execute(sql`SELECT units FROM treasury_allocation_reservations WHERE epoch=${epoch} AND state='held'`)).rows;
  return {paused:policy.paused,protectedUnits:String(holds.reduce((v,r)=>v+BigInt(String(r.units)),BigInt(policy.defensiveUnits)))};
}
