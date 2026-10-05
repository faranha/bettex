import { accountsStore, ensureAccountsSchema } from "./store";
import { canUsePersonalTestAccounts } from "../domain/account";
let ready: Promise<void> | undefined;

/** Resolves the existing personal-account session without exposing its token. */
export async function personalAccountIdentity(sessionToken: string) {
  if (!canUsePersonalTestAccounts(process.env.NODE_ENV) || !sessionToken) return undefined;
  await (ready ??= ensureAccountsSchema().catch(error => { ready = undefined; throw error; }));
  const session = await accountsStore().session(sessionToken);
  return session ? accountsStore().byId(session.accountId) : undefined;
}
