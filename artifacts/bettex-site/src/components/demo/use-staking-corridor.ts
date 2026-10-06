import { useEffect, useMemo, useState } from 'react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { usePersonalNative } from './use-personal-native';
import { demoStakingView, nativeStakingView } from './staking-model';

export type StakingSample = { at: number; profit: number; allocated: number };
export function useStakingCorridor(d: DemoDashboard) {
  const native = usePersonalNative(d.profile);
  const nativeMode = d.profile.authenticated && d.profile.provider === 'native';
  const data = useMemo(() => nativeMode ? nativeStakingView(native.j, native.stale) : demoStakingView(d),
    [d, nativeMode, native.j, native.stale]);
  const cycleKey = `${d.profile.accountId}|${data.source}|${nativeMode ? native.j?.epoch ?? '' : ''}|${data.cycleStartedAt}`;
  const [history, setHistory] = useState<{ key: string; points: StakingSample[] }>({ key: '', points: [] });
  useEffect(() => {
    const at = Date.parse(data.readingAt ?? '');
    if (!Number.isFinite(at) || data.cycleProfitUsdc === null || data.roundAllocationUsdc === null) {
      setHistory({ key: cycleKey, points: [] });
      return;
    }
    const point = { at, profit: data.cycleProfitUsdc, allocated: data.roundAllocationUsdc };
    setHistory(previous => {
      const points = previous.key === cycleKey ? previous.points : [];
      if (points.at(-1)?.at === at) return previous.key === cycleKey ? previous : { key: cycleKey, points };
      return { key: cycleKey, points: [...points, point].slice(-90) };
    });
  }, [cycleKey, data.readingAt, data.cycleProfitUsdc, data.roundAllocationUsdc]);
  return {
    data,
    points: history.key === cycleKey ? history.points : [],
    loading: nativeMode && (native.state === 'loading' || native.journeyLoading),
  };
}
