import { getNativeTestJourney, nativeTestJourneyCommand, testAccountCommand,
  type TestAccountSnapshot } from '@workspace/api-client-react';
import { signPersonalTestPurchase } from './wallet-vault';

const options = { credentials: 'same-origin' as const };
export const requestNativeFunding = (snap: TestAccountSnapshot) =>
  nativeTestJourneyCommand({ action: 'fund', csrf: snap.csrf, acknowledgeLocal: true }, options);
export const requestNativeQuote = (snap: TestAccountSnapshot, operationId: string, quantity: string) =>
  nativeTestJourneyCommand({ action: 'quote', csrf: snap.csrf, operationId, quantity }, options);
export const requestNativeDistribution = (snap: TestAccountSnapshot) =>
  nativeTestJourneyCommand({ action: 'distribution-test', csrf: snap.csrf }, options);
export async function signNativeJourney(snap: TestAccountSnapshot, password: string, operationId: string,
  name: string, expectedState: string) {
  const current = await getNativeTestJourney(options);
  const operation = current.operations.find(o => o.id === operationId);
  const stage = operation?.stages.find(s => s.name === name);
  if (!operation || !stage || (name !== 'approve' && name !== 'buy')) throw new Error('operation_not_found');
  // Delayed UI or another device must never trigger another signature/broadcast.
  if (stage.state !== 'requested' || expectedState !== 'requested') return current;
  if (!stage.draft || current.chainId !== 31337) throw new Error('transaction_mismatch');
  let authenticated;
  try { authenticated = await testAccountCommand({ action: 'reauth', csrf: snap.csrf, password }, options); }
  catch { throw new Error('wallet_unlock_failed'); }
  if (!authenticated.vault) throw new Error('session_required');
  let signedTransaction: string;
  try {
    signedTransaction = await signPersonalTestPurchase(authenticated.vault, authenticated.wallets, password, stage.draft, {
      stage: name, sale: current.sale.address, usdc: current.sale.usdc, quantity: operation.quantity,
      total: String(BigInt(operation.principal) + BigInt(operation.fee)), operationId,
    });
  } catch (error) {
    throw new Error(error instanceof Error && error.message === 'transaction_mismatch' ? 'transaction_mismatch' : 'wallet_unlock_failed');
  }
  return nativeTestJourneyCommand({ action: 'sign', csrf: authenticated.csrf, operationId,
    stage: name, signedTransaction }, options);
}
