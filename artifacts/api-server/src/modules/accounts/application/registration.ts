import { AccountFailure, checkedName, checkedPassword, normalizedEmail, NO_RECOVERY_NOTICE_VERSION } from "../domain/account";

type ExistingAccount = { id: string; email: string; passwordHash: string };
interface RegistrationInput {
  registrationId: string;
  email: string;
  displayName: string;
  password: string;
  accepted: boolean;
  noticeVersion: string;
  passwordHash: string;
}
interface RegistrationPorts {
  byRegistration(id: string): Promise<ExistingAccount | undefined>;
  byEmail(email: string): Promise<ExistingAccount | undefined>;
  verifyPassword(password: string, hash: string): Promise<void>;
  insert(input: {
    id: string; registrationId: string; email: string; displayName: string;
    passwordHash: string; noticeVersion: string; acceptedAt: Date; revision: number;
  }): Promise<void>;
  provisionPersonalWallets(accountId: string): Promise<void>;
  assertOriginalWallets(accountId: string): Promise<void>;
  newSession(accountId: string): Promise<{ token: string }>;
  nextId(): string;
  now(): Date;
}
/** Caller supplies one transaction-scoped set of ports; no wallet/provider dependency. */
export async function registerPersonalTestAccount(input: RegistrationInput, ports: RegistrationPorts) {
  const email = normalizedEmail(input.email);
  const displayName = checkedName(input.displayName);
  const password = checkedPassword(input.password, true);
  if (!input.accepted || input.noticeVersion !== NO_RECOVERY_NOTICE_VERSION) throw new AccountFailure("consent_required");
  const existing = await ports.byRegistration(input.registrationId);
  if (existing) {
    if (existing.email !== email) throw new AccountFailure("registration_conflict", 409);
    await ports.verifyPassword(password, existing.passwordHash);
    await ports.assertOriginalWallets(existing.id);
    return (await ports.newSession(existing.id)).token;
  }
  if (await ports.byEmail(email)) throw new AccountFailure("email_in_use", 409);
  const id = ports.nextId();
  await ports.insert({ id, registrationId: input.registrationId, email, displayName,
    passwordHash: input.passwordHash, noticeVersion: NO_RECOVERY_NOTICE_VERSION, acceptedAt: ports.now(), revision: 1 });
  await ports.provisionPersonalWallets(id);
  return (await ports.newSession(id)).token;
}
