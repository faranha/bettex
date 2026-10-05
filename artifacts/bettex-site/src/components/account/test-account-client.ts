import { testAccountCommand, type TestAccountCommand, type TestAccountSnapshot } from '@workspace/api-client-react';
import { generatePersonalWallets, reencryptVault, exportPersonalWallet, type PrivateWalletAction } from './wallet-vault';

export const NOTICE_VERSION = 'personal-wallets-no-recovery-2026-10-05';
const command = (input: TestAccountCommand, signal?: AbortSignal) => testAccountCommand(input, { credentials: 'same-origin', signal });
// Draft is memory-only. Failed attempts keep the same encrypted wallets/id.
// Never put the password or unencrypted keys in browser storage.
let draft: Awaited<ReturnType<typeof generatePersonalWallets>> | undefined;
let draftIdentity: string | undefined;
export async function createTestAccount(displayName: string, email: string, password: string, accepted: boolean) {
  if (!accepted || password.length < 12 || password.length > 128) throw new Error('signup_invalid');
  const identity = email.trim().toLowerCase();
  if (draft && draftIdentity !== identity) { draft = undefined; draftIdentity = undefined; }
  if (!draft) { draft = await generatePersonalWallets(password); draftIdentity = identity; }
  // Also checks that retrying with a changed password cannot strand the vault.
  await reencryptVault(draft.vault, draft.wallets, password, password);
  const result = await command({ action: 'signup', displayName, email: identity, password,
    accepted, noticeVersion: NOTICE_VERSION, ...draft });
  draft = undefined; draftIdentity = undefined;
  return result;
}
export const signInTestAccount = (email: string, password: string) => command({ action: 'signin', email, password });
export const signOutTestAccount = (s: TestAccountSnapshot) => command({ action: 'signout', csrf: s.csrf });
export const saveTestName = (s: TestAccountSnapshot, displayName: string) => command({ action: 'name', displayName, csrf: s.csrf });
export const changeTestEmail = (s: TestAccountSnapshot, email: string, password: string) => command({ action: 'email', email, password, csrf: s.csrf });
export async function changeTestPassword(s: TestAccountSnapshot, password: string, next: string) {
  if (!s.vault || !s.account) throw new Error('session_required');
  const vault = await reencryptVault(s.vault, s.wallets, password, next);
  return command({ action: 'password', password, newPassword: next, revision: s.account.revision, vault, csrf: s.csrf });
}
export async function privateWalletAction(s: TestAccountSnapshot, password: string, walletId: string, action: PrivateWalletAction, signal?: AbortSignal) {
  const requestId = crypto.randomUUID();
  const current = await command({ action: 'private-request', password, csrf: s.csrf, requestId, walletId, privateAction: action }, signal);
  if (!current.vault) throw new Error('session_required');
  try {
    const result = await exportPersonalWallet(current.vault, current.wallets, password, walletId, action, signal);
    await command({ action: 'private-result', csrf: current.csrf, requestId, resultState: 'initiated' });
    return result;
  } catch (error) {
    await command({ action: 'private-result', csrf: current.csrf, requestId, resultState: 'failed' }).catch(() => {});
    throw error;
  }
}
