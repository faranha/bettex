import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
type Client=Pick<typeof db,"execute">;
export function treasuryIdentity(client:Client) {
  return {
    async permissions(id:string) {
      return (await client.execute(sql`SELECT permission FROM test_account_permissions WHERE account_id=${id} FOR SHARE`)).rows.map(r=>String(r.permission));
    },
    async change(change:{target:string;permission:string;grant:boolean}){
      if(!(await client.execute(sql`SELECT id FROM test_accounts WHERE id=${change.target}`)).rows.length)throw new Error("account_not_found");
      if(change.grant)await client.execute(sql`INSERT INTO test_account_permissions(account_id,permission)
        VALUES(${change.target},${change.permission}) ON CONFLICT DO NOTHING`);
      else await client.execute(sql`DELETE FROM test_account_permissions WHERE account_id=${change.target} AND permission=${change.permission}`);
    },
  };
}
