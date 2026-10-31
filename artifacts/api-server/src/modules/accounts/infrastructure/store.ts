import { db } from "@workspace/db";
import { and, eq, gt, sql } from "drizzle-orm";
import { testAccounts, testSessions, testAuthLimits } from "../../../../../../lib/db/src/schema/accounts";
import { AccountFailure } from "../domain/account";
import { digest, randomToken } from "./security";

export type AccountConnection = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];
export async function ensureAccountsSchema() {
  // Additive, owned migration; no ALTER/DROP of existing Clerk/demo data.
  await db.execute(sql`CREATE TABLE IF NOT EXISTS test_accounts (
    id text PRIMARY KEY, registration_id text NOT NULL UNIQUE, email text NOT NULL UNIQUE,
    display_name text NOT NULL, password_hash text NOT NULL, notice_version text NOT NULL,
    accepted_at timestamptz NOT NULL, revision integer NOT NULL DEFAULT 1
  )`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS test_account_sessions (
    token_hash text PRIMARY KEY, account_id text NOT NULL REFERENCES test_accounts(id),
    csrf text NOT NULL, expires_at timestamptz NOT NULL
  )`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS test_auth_limits (
    key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL
  )`);
}
export function accountsStore(connection: AccountConnection = db) {
  return {
    async byId(id: string) { return (await connection.select().from(testAccounts).where(eq(testAccounts.id, id)))[0]; },
    async byEmail(email: string) { return (await connection.select().from(testAccounts).where(eq(testAccounts.email, email)))[0]; },
    async byRegistration(id: string) {
      return (await connection.select().from(testAccounts).where(eq(testAccounts.registrationId, id)))[0];
    },
    async insert(input: typeof testAccounts.$inferInsert) { await connection.insert(testAccounts).values(input); },
    async update(id: string, values: Partial<Pick<typeof testAccounts.$inferInsert, "email" | "displayName" | "passwordHash" | "revision">>, revision?: number) {
      const condition = revision === undefined ? eq(testAccounts.id, id) : and(eq(testAccounts.id, id), eq(testAccounts.revision, revision));
      const rows = await connection.update(testAccounts).set(values).where(condition).returning({ id: testAccounts.id });
      if (!rows.length) throw new AccountFailure("stale_revision", 409);
    },
    async newSession(accountId: string) {
      const token = randomToken(), csrf = randomToken();
      await connection.insert(testSessions).values({ tokenHash: digest(token), accountId, csrf,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) });
      return { token, csrf };
    },
    async session(token: string) {
      if (!/^[a-f0-9]{64}$/.test(token)) return undefined;
      return (await connection.select().from(testSessions)
        .where(and(eq(testSessions.tokenHash, digest(token)), gt(testSessions.expiresAt, new Date()))))[0];
    },
    async revoke(token: string) { await connection.delete(testSessions).where(eq(testSessions.tokenHash, digest(token))); },
    async revokeAll(accountId: string) { await connection.delete(testSessions).where(eq(testSessions.accountId, accountId)); },
  };
}
export async function limitAuthAttempts(bucket: string, max: number) {
  const key = digest(bucket);
  const expiry = new Date(Date.now() + 15 * 60 * 1000);
  const rows = await db.insert(testAuthLimits).values({ key, count: 1, expiresAt: expiry })
    .onConflictDoUpdate({ target: testAuthLimits.key, set: {
      count: sql`CASE WHEN ${testAuthLimits.expiresAt} < now() THEN 1 ELSE ${testAuthLimits.count} + 1 END`,
      expiresAt: sql`CASE WHEN ${testAuthLimits.expiresAt} < now() THEN ${expiry} ELSE ${testAuthLimits.expiresAt} END`,
    } }).returning({ count: testAuthLimits.count });
  if ((rows[0]?.count ?? max + 1) > max) throw new AccountFailure("attempt_limit", 429);
}
