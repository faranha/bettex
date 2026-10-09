import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { DemoDashboard, NativeTestJourney } from '@workspace/api-client-react';
import { demoStakingView, nativeStakingView, scenarioStakingView } from './staking-model.ts';

test('token ownership share, time-weighted payout share and generated profit stay distinct', () => {
  const d = {
    serverNow: '2026-10-06T18:00:00Z',
    staking: { eligibleTokens: 12500, totalEligibleTokens: 8012500, tokenSharePercent: 12500 / 8012500 * 100,
      sharePercent: 0.09, poolAllocationUsdc: 250, estimatedUsdc: 0.225, status: 'active',
      cycleStartedAt: '2026-10-06T00:00:00Z', nextCycleAt: '2026-10-07T00:00:00Z' },
    treasury: { cycleResultUsdc: 1000 },
  } as DemoDashboard;
  const view = demoStakingView(d);
  assert.equal(view.myTokens, 12500);
  assert.equal(view.totalTokens, 8012500);
  assert.equal(view.sharePercent, 12500 / 8012500 * 100);
  assert.equal(view.payoutWeightPercent, 0.09);
  assert.equal(view.cycleProfitUsdc, 1000);
  assert.equal(view.roundAllocationUsdc, 250);
  assert.notEqual(view.estimatedOwnUsdc, view.roundAllocationUsdc);
});

test('missing native pool figures never become simulated figures or zeros', () => {
  const missing = nativeStakingView();
  assert.equal(missing.myTokens, null);
  assert.equal(missing.totalTokens, null);
  assert.equal(missing.sharePercent, null);
  assert.equal(missing.cycleProfitUsdc, null);
  assert.equal(missing.roundAllocationUsdc, null);
  const native = nativeStakingView({
    updatedAt: '2026-10-06T18:00:00Z',
    participation: { eligible: '12500000000000000000000', roundStart: 1791244800, roundEnd: 1791331200 },
  } as NativeTestJourney, true);
  assert.equal(native.myTokens, 12500);
  assert.equal(native.source, 'native');
  assert.equal(native.active, true);
  assert.equal(native.stale, true);
  assert.equal(native.totalTokens, null);
  assert.equal(native.roundAllocationUsdc, null);
});

test('staking is a full-width section integrated in dashboard and all wallet views', () => {
  const read = (file: string) => readFileSync(new URL(file, import.meta.url), 'utf8');
  assert.match(read('../../pages/demo.tsx'), /<WalletsDashboard d=\{d\}/);
  const dashboard = read('./WalletsDashboard.tsx');
  assert.match(dashboard, /walletContent=\{<StakingCorridor d=\{d\} showAgents/);
  assert.equal((dashboard.match(/<StakingCorridor d=\{d\} showAgents/g) ?? []).length, 2);
  assert.match(read('./StakingCorridor.tsx'), /staking-corridor/);
  assert.doesNotMatch(read('./StakingCorridor.tsx'), /position:\s*fixed|w-\[3[0-9][0-9]px\]/);
});
test('live trades is below the chart and dashboard agents follow the chart-clock row without a duplicate top block', () => {
  const read = (file: string) => readFileSync(new URL(file, import.meta.url), 'utf8');
  const corridor = read('./StakingCorridor.tsx');
  const clock = read('./StakingRoundClock.tsx');
  const dashboard = read('./WalletsDashboard.tsx');
  assert.doesNotMatch(clock, /staking-live-trading|demoPath|<Link/);
  assert.doesNotMatch(dashboard, /AgentShowcase/);
  assert.match(corridor, /showAgents = false/);
  const chart = corridor.indexOf('data-testid="staking-chart-history"');
  const liveTrades = corridor.indexOf('data-testid="staking-live-trading"');
  const sideClock = corridor.indexOf('<StakingRoundClock');
  const agents = corridor.indexOf('{showAgents && <AgentShowcase');
  assert.ok(chart >= 0 && liveTrades > chart && sideClock > liveTrades && agents > sideClock);
});

test('scenario keeps realized path separate from forecast, uses payout weight, and never debits losses', () => {
  const d = {
    serverNow: '2026-10-07T11:00:00Z', profile: { authenticated: false, provider: 'anonymous' },
    treasury: { cycleResultUsdc: -800 },
    staking: { eligibleTokens: 12500, totalEligibleTokens: 8000000, sharePercent: 0.1, tokenSharePercent: 0.2,
      poolAllocationUsdc: 0, estimatedUsdc: 0, status: 'active', cycleStartedAt: '2026-10-06T19:00:00Z',
      nextCycleAt: '2026-10-07T19:00:00Z', chartScenario: {
        source: 'test_scenario', roundStartedAt: '2026-10-06T19:00:00Z', nextTickAt: '2026-10-07T11:01:00Z',
        elapsedMinutes: 960, tick: 960, tickIntervalMs: 60000, minutesPerTick: 1,
        points: [{ elapsedMinutes: 0, profitUsdc: 0 }, { elapsedMinutes: 240, profitUsdc: -6500 },
          { elapsedMinutes: 960, profitUsdc: -800 }, { elapsedMinutes: 1440, profitUsdc: 1600 }],
      },
    },
  } as DemoDashboard;
  const s = scenarioStakingView(d)!;
  assert.equal(s.view.cycleProfitUsdc, -800);
  assert.equal(s.view.estimatedOwnUsdc, 0);
  assert.equal(s.view.roundAllocationUsdc, 0);
  assert.equal(s.timeline.projectedOwnUsdc, 0.4);
  assert.equal(s.points.at(-1)!.profit, null);
  assert.equal(s.points.at(-1)!.forecast, 1600);
  assert.equal(s.points[1]!.forecast, null);
  assert.equal(d.treasury.cycleResultUsdc, -800);
  d.treasury.cycleResultUsdc = 3000;
  assert.equal(scenarioStakingView(d), null, 'an independent chart must not override authoritative treasury values');
  d.treasury.cycleResultUsdc = -800;
  d.profile.authenticated = true; d.profile.provider = 'native';
  assert.equal(scenarioStakingView(d), null);
});

test('staking presentation uses helpers and earnings cards, not a share donut or inline payout weight', () => {
  const source = readFileSync(new URL('./StakingCorridor.tsx', import.meta.url), 'utf8');
  const chart = readFileSync(new URL('./StakingMinuteChart.tsx', import.meta.url), 'utf8');
  const presentation = source + chart + readFileSync(new URL('./StakingRoundClock.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(presentation, /PieChart|<Pie |staking-chart-share|<p[^>]*>.*Payout weight/);
  assert.match(source, /Math\.floor\(v\.myTokens\), 0/);
  assert.match(presentation, /staking-current-earnings/);
  assert.match(presentation, /staking-projected-earnings/);
  assert.doesNotMatch(presentation, /staking-ticker|animate-ping|timeline\?\.tick/);
  assert.match(presentation, /staking-round-clock/);
  assert.match(presentation, /staking-live-trading/);
  assert.match(presentation, /demoPath\('central', loc\)/);
  assert.match(source, /<Term tip=/);
  assert.match(chart, /hourlyRows/);
  assert.doesNotMatch(chart, /dataKey="forecast"/);
  assert.match(chart, /staking-chart-type-/);
  assert.match(chart, /<Bar dataKey="profit"/);
  assert.match(chart, /staking-chart-tick/);
});

test('agent tabs belong inside existing staking, without a separate home trading area', () => {
  const corridor = readFileSync(new URL('./StakingCorridor.tsx', import.meta.url), 'utf8');
  const home = readFileSync(new URL('../interface-demo/InterfaceDemoPage.tsx', import.meta.url), 'utf8');
  const tabs = readFileSync(new URL('../interface-demo/AgentTradingTabs.tsx', import.meta.url), 'utf8');
  const start = corridor.indexOf('<AgentTradingTabs id="staking-agent-tabs">');
  const end = corridor.indexOf('</AgentTradingTabs>');
  assert.ok(start > corridor.indexOf('</header>'));
  assert.ok(start < corridor.indexOf("metric('staking-mine'"));
  assert.ok(end > corridor.indexOf('<StakingRoundClock'));
  assert.ok(end < corridor.lastIndexOf('</section>'));
  assert.match(home, /<StakingCorridor d=\{d\} showAgents \/>/);
  assert.doesNotMatch(home, /<MockCentralPanel compact/);
  for (const key of ['crypto', 'sports', 'predictions', 'casino']) {
    assert.ok(tabs.includes(`key: '${key}'`));
  }
  assert.match(tabs, /disabled=\{key !== 'crypto'\}/);
});
