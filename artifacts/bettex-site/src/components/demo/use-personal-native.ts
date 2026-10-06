import { useGetTestAccountSession, useGetNativeTestJourney, getGetNativeTestJourneyQueryKey, type DemoProfile, type NativeTestJourney, type TestAccountSnapshot } from '@workspace/api-client-react';
import { canReadNativeJourney, journeyMatchesSnapshot, snapshotMatchesProfile } from './personal-native';

export type NativeState = 'loading' | 'session-error' | 'unavailable' | 'guest' | 'ready';
/** Single source for the personal wallet/native data, sharing cache keys with AccountPanel/NativeJourney. */
export function usePersonalNative(profile: DemoProfile) {
  const native = profile.authenticated === true && profile.provider === 'native';
  const session = useGetTestAccountSession({ query: { enabled: native, retry: false, queryKey: ['test-account-session', profile.accountId], refetchInterval: 30000, refetchIntervalInBackground: false } });
  const rawSnapshot = session.data as TestAccountSnapshot | undefined;
  const snap = snapshotMatchesProfile(rawSnapshot, profile) ? rawSnapshot : undefined;
  const ownerId = snap?.account?.id;
  const localAssociated = !!snap && snap.wallets.length === 2 && snap.wallets.every(w => w.chainIds.includes(31337));
  const enabled = canReadNativeJourney(snap);
  const journey = useGetNativeTestJourney({ query: { queryKey: [...getGetNativeTestJourneyQueryKey(), ownerId], enabled, refetchInterval: 30000, refetchIntervalInBackground: false, retry: false }, request: { credentials: 'same-origin' } });
  const raw = enabled ? (journey.data as NativeTestJourney | undefined) : undefined;
  const j = journeyMatchesSnapshot(raw, snap) ? raw : undefined;
  const state: NativeState = !native ? 'guest' : session.isLoading ? 'loading' : session.isError || !rawSnapshot ? 'session-error' : !rawSnapshot.enabled ? 'unavailable' : !snap ? 'session-error' : 'ready';
  const readingAt = j ? Date.parse(j.updatedAt) : NaN;
  const stale = !!j && (journey.isError || !Number.isFinite(readingAt) || Date.now() - readingAt > 45000);
  return { state, snap, j, localAssociated, mismatch: !!raw && !j, journeyLoading: enabled && journey.isLoading, journeyError: enabled && journey.isError && !j, stale, retry: () => { void session.refetch(); if (enabled) void journey.refetch(); } };
}
