import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
let ready: Promise<unknown> | undefined;
export async function canReadTreasuryHistory(accountId: string) {
  if (process.env.NODE_ENV !== "production") await (ready ??= db.execute(sql`
    CREATE TABLE IF NOT EXISTS test_account_permissions(
      account_id text NOT NULL REFERENCES test_accounts(id),permission text NOT NULL,PRIMARY KEY(account_id,permission)
    )`));
  const rows = await db.execute(sql`SELECT 1 FROM test_account_permissions WHERE account_id=${accountId} AND permission='treasury_history'`);
  return rows.rows.length > 0;
}
