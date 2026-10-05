import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import type { TreasuryPolicy,TreasuryProposal } from "../domain/governance";
type Client=Pick<typeof db,"execute">;
export async function ensureGovernanceStore() {
  await db.execute(sql`CREATE TABLE IF NOT EXISTS treasury_governance_control(
    epoch text PRIMARY KEY,asset text NOT NULL,treasury text NOT NULL,policy jsonb NOT NULL)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS treasury_governance_versions(
    epoch text NOT NULL,version integer NOT NULL,policy jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(epoch,version))`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS treasury_governance_proposals(
    id text PRIMARY KEY,epoch text NOT NULL,proposal jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now())`);
}
export function governanceStore(client:Client,epoch:string,asset:string,treasury:string,defaultDestination:string) {
  return {
    async policy():Promise<TreasuryPolicy>{
      const initial:TreasuryPolicy={version:1,paused:true,defensiveUnits:"500000",maxAllocationUnits:"250000",
        dailyLimitUnits:"500000",destinations:[defaultDestination.toLowerCase()]};
      await client.execute(sql`INSERT INTO treasury_governance_control(epoch,asset,treasury,policy)
        VALUES(${epoch},${asset},${treasury},${JSON.stringify(initial)}::jsonb) ON CONFLICT DO NOTHING`);
      const row=(await client.execute(sql`SELECT * FROM treasury_governance_control WHERE epoch=${epoch} FOR UPDATE`)).rows[0]!;
      if(row.asset!==asset||row.treasury!==treasury)throw new Error("governance_source_changed");
      const p=row.policy as TreasuryPolicy;
      await client.execute(sql`INSERT INTO treasury_governance_versions(epoch,version,policy)
        VALUES(${epoch},${p.version},${JSON.stringify(p)}::jsonb) ON CONFLICT DO NOTHING`);
      return p;
    },
    async setPolicy(p:TreasuryPolicy) {
      await client.execute(sql`UPDATE treasury_governance_control SET policy=${JSON.stringify(p)}::jsonb WHERE epoch=${epoch}`);
      await client.execute(sql`INSERT INTO treasury_governance_versions(epoch,version,policy)
        VALUES(${epoch},${p.version},${JSON.stringify(p)}::jsonb) ON CONFLICT DO NOTHING`);
    },
    async proposal(id:string){return (await client.execute(sql`SELECT proposal FROM treasury_governance_proposals WHERE id=${id} AND epoch=${epoch}`)).rows[0]?.proposal as TreasuryProposal|undefined;},
    async proposals(){return (await client.execute(sql`SELECT proposal FROM treasury_governance_proposals WHERE epoch=${epoch}
      ORDER BY created_at DESC,id LIMIT 100`)).rows.map(r=>r.proposal as TreasuryProposal);},
    async save(p:TreasuryProposal){
      await client.execute(sql`INSERT INTO treasury_governance_proposals(id,epoch,proposal)
        VALUES(${p.id},${epoch},${JSON.stringify(p)}::jsonb)
        ON CONFLICT(id) DO UPDATE SET proposal=excluded.proposal,updated_at=now()
        WHERE treasury_governance_proposals.epoch=excluded.epoch`);
      if(!(await client.execute(sql`SELECT 1 FROM treasury_governance_proposals WHERE id=${p.id} AND epoch=${epoch}`)).rows.length)
        throw new Error("proposal_conflict");
    },
  };
}
