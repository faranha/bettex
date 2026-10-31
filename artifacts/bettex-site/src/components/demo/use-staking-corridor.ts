import { useEffect, useMemo, useState } from 'react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { usePersonalNative } from './use-personal-native';
import { demoStakingView, nativeStakingView, scenarioStakingView, type StakingChartSample } from './staking-model';

export type StakingSample = StakingChartSample;
export function useStakingCorridor(d: DemoDashboard) {
  const native = usePersonalNative(d.profile);
  const nativeMode = d.profile.authenticated && d.profile.provider === 'native';
  const scenario = useMemo(() => nativeMode ? null : scenarioStakingView(d), [d, nativeMode]);
  const data = useMemo(() => nativeMode ? nativeStakingView(native.j, native.stale) : scenario?.view ?? demoStakingView(d),
    [d, nativeMode, native.j, native.stale, scenario]);
  const cycleKey = `${d.profile.accountId}|${data.source}|${nativeMode ? native.j?.epoch ?? '' : ''}|${data.cycleStartedAt}`;
  const [history, setHistory] = useState<{ key: string; points: StakingSample[] }>({ key: '', points: [] });
  useEffect(() => {
    if (scenario) return;
    const at = Date.parse(data.readingAt ?? '');
    if (!Number.isFinite(at) || data.cycleProfitUsdc === null || data.roundAllocationUsdc === null) {
      setHistory({ key: cycleKey, points: [] });
      return;
    }
    const start = Date.parse(data.cycleStartedAt ?? '');
    const base = Number.isFinite(start) ? start : 0;
    const point = { at: base + Math.floor((at - base) / 60000) * 60000, profit: data.cycleProfitUsdc, allocated: data.roundAllocationUsdc };
    setHistory(previous => {
      const points = previous.key === cycleKey ? previous.points : [];
      const last = points.at(-1);
      if (last && last.at > point.at) return previous;
      if (last?.at === point.at) return { key: cycleKey, points: [...points.slice(0, -1), point] };
      return { key: cycleKey, points: [...points, point].slice(-1441) };
    });
  }, [cycleKey, data.readingAt, data.cycleProfitUsdc, data.roundAllocationUsdc, scenario]);
  return {
    data,
    points: scenario?.points ?? (history.key === cycleKey ? history.points : []),
    timeline: scenario?.timeline ?? null,
    loading: nativeMode && (native.state === 'loading' || native.journeyLoading),
  };
}
