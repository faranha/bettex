import { test } from 'node:test';
import assert from 'node:assert/strict';
import { usdcUnits, tokenUnits, journeyMatchesSnapshot, snapshotMatchesProfile } from './personal-native.ts';

test('exact unit formatting without Number()', () => {
  assert.equal(usdcUnits('1234567'), '1.234567');
  assert.equal(tokenUnits('123456789012345678901234567890'), '123456789012.34567890123456789');
  assert.equal(usdcUnits('5000000'), '5');
  assert.equal(usdcUnits(undefined), null);
  assert.equal(usdcUnits('abc'), null);
});
test('journey owner must match snapshot wallets', () => {
  const a = '0x' + 'a'.repeat(40), b = '0x' + 'b'.repeat(40);
  const snap = { account: { id: '1' }, wallets: [{ purpose: 'deposits', address: a }, { purpose: 'bettex', address: b }] } as never;
  const chain = { chainId: 31337, environment: 'local_evm' };
  assert.equal(journeyMatchesSnapshot({ ...chain, depositWallet: a.toUpperCase().replace('0X', '0x'), bettexWallet: b } as never, snap), true);
  assert.equal(journeyMatchesSnapshot({ ...chain, depositWallet: b, bettexWallet: a } as never, snap), false);
  assert.equal(journeyMatchesSnapshot({ ...chain, chainId: 421614, depositWallet: a, bettexWallet: b } as never, snap), false);
  assert.equal(journeyMatchesSnapshot(undefined, snap), false);
});
test('cached native identity cannot replace a guest, Clerk or another native owner', () => {
  const snap = { enabled: true, account: { id: 'owner-a' } } as never;
  const profile = { authenticated: true, provider: 'native', accountId: 'owner-a' } as const;
  assert.equal(snapshotMatchesProfile(snap, profile as never), true);
  assert.equal(snapshotMatchesProfile(snap, { ...profile, accountId: 'owner-b' } as never), false);
  assert.equal(snapshotMatchesProfile(snap, { ...profile, authenticated: false } as never), false);
  assert.equal(snapshotMatchesProfile(snap, { ...profile, provider: 'clerk' } as never), false);
  assert.equal(snapshotMatchesProfile(undefined, profile as never), false);
});
