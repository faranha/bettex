import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { balancedLegs, type LedgerLeg } from "../domain/journal";
type Transfer = { id: string; from: string; to: string; value: string; hash: string;
  blockHash: string; blockNumber: number; logIndex: number; timestamp: number };
export const chainJournal = {
  async initialize() {
    await db.execute(sql`CREATE TABLE IF NOT EXISTS local_chain_journal (
      id text PRIMARY KEY,epoch text NOT NULL,asset text NOT NULL,decimals integer NOT NULL,
      transaction_hash text NOT NULL,block_number integer NOT NULL,block_hash text NOT NULL,
      log_index integer NOT NULL,event_time bigint NOT NULL,legs jsonb NOT NULL,
      reverses text REFERENCES local_chain_journal(id),created_at timestamptz NOT NULL DEFAULT now())`);
  },
  async record(epoch: string, asset: string, decimals: number, events: Transfer[]) {
    for (const event of events) {
      const legs = balancedLegs([{ account: event.from.toLowerCase(), units: String(-BigInt(event.value)) },
        { account: event.to.toLowerCase(), units: event.value }]);
      const id = `${epoch}:${asset.toLowerCase()}:${event.id}`;
      await db.execute(sql`INSERT INTO local_chain_journal
        (id,epoch,asset,decimals,transaction_hash,block_number,block_hash,log_index,event_time,legs)
        VALUES(${id},${epoch},${asset.toLowerCase()},${decimals},${event.hash},${event.blockNumber},${event.blockHash},
          ${event.logIndex},${event.timestamp},${JSON.stringify(legs)}::jsonb) ON CONFLICT DO NOTHING`);
    }
  },
  async reconcile(epoch: string, blockHash: (height: number) => Promise<string | null>) {
    const rows = (await db.execute(sql`SELECT j.* FROM local_chain_journal j WHERE j.epoch=${epoch} AND j.reverses IS NULL
      AND NOT EXISTS(SELECT 1 FROM local_chain_journal r WHERE r.reverses=j.id)`)).rows;
    const hashes = new Map<number, string | null>();
    for (const row of rows) {
      const height = Number(row.block_number);
      if (!hashes.has(height)) hashes.set(height, await blockHash(height));
      const actual = hashes.get(height);
      if (actual === null || actual === undefined) throw new Error("block_unavailable");
      if (actual === row.block_hash) continue;
      const reversed = balancedLegs((row.legs as LedgerLeg[]).map(l => ({ ...l, units: String(-BigInt(l.units)) })));
      await db.execute(sql`INSERT INTO local_chain_journal
        (id,epoch,asset,decimals,transaction_hash,block_number,block_hash,log_index,event_time,legs,reverses)
        VALUES(${`reversal:${String(row.id)}`},${epoch},${String(row.asset)},${Number(row.decimals)},${String(row.transaction_hash)},
          ${height},${actual},${Number(row.log_index)},${String(row.event_time)},${JSON.stringify(reversed)}::jsonb,${String(row.id)})
        ON CONFLICT DO NOTHING`);
    }
  },
  async balance(epoch: string, asset: string, account: string) {
    const [row] = (await db.execute(sql`SELECT COALESCE(SUM((l->>'units')::numeric),0)::text balance
      FROM local_chain_journal j CROSS JOIN LATERAL jsonb_array_elements(j.legs) l
      WHERE j.epoch=${epoch} AND j.asset=${asset.toLowerCase()} AND l->>'account'=${account.toLowerCase()}`)).rows;
    return String(row!.balance);
  },
};
