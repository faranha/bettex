import { formatUnits } from 'ethers';
import type { DemoProfile, NativeTestJourney, TestAccountSnapshot } from '@workspace/api-client-react';

/** Exact integer-string formatting; returns null when the value is not a valid integer (never 0). */
export function units(v: string | null | undefined, decimals: number): string | null {
  if (typeof v !== 'string' || !/^\d+$/.test(v)) return null;
  const s = formatUnits(BigInt(v), decimals);
  return s.endsWith('.0') ? s.slice(0, -2) : s;
}
export const usdcUnits = (v: string | null | undefined) => units(v, 6);
export const tokenUnits = (v: string | null | undefined) => units(v, 18);

/** Cached native metadata must never override a different dashboard identity. */
export function snapshotMatchesProfile(snap: TestAccountSnapshot | undefined, profile: DemoProfile): boolean {
  return profile.authenticated === true && profile.provider === 'native'
    && snap?.enabled === true && snap.account?.id === profile.accountId;
}

/** True only when the journey wallets are exactly the current snapshot owner's public wallets. */
export function journeyMatchesSnapshot(j: NativeTestJourney | undefined, snap: TestAccountSnapshot | undefined): boolean {
  if (!j || j.chainId !== 31337 || j.environment !== 'local_evm' || !snap?.account) return false;
  const dep = snap.wallets.find(w => w.purpose === 'deposits')?.address.toLowerCase();
  const bet = snap.wallets.find(w => w.purpose === 'bettex')?.address.toLowerCase();
  return !!dep && !!bet && j.depositWallet.toLowerCase() === dep && j.bettexWallet.toLowerCase() === bet;
}
