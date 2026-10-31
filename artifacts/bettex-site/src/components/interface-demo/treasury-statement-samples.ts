import type { DemoDashboard, TreasuryStatementEntry } from '@workspace/api-client-react';

/** Fixed illustrative history; no API, persistence, random trades or live execution. */
export function historicalStatementSamples(d: DemoDashboard): TreasuryStatementEntry[] {
  const day = new Date(d.serverNow).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  const anchor = Date.parse(`${day}T09:00:00-03:00`);
  const out: TreasuryStatementEntry[] = [];
  for (let daysAgo = 21; daysAgo >= 1; daysAgo--) {
    const reference = `SAMPLE-HISTORY-D${String(daysAgo).padStart(2, '0')}`;
    const at = (hour: number) => new Date(anchor - daysAgo * 86_400_000 + hour * 3_600_000).toISOString();
    const add = (suffix: string, hour: number, account: 'treasury' | 'buyback', amount: number, category: string, counterparty: string, income = false, internal = false) => {
      out.push({ id: `${reference}-${suffix}`, at: at(hour), account, asset: 'USDC', amount: amount.toFixed(2),
        category, counterparty, reference, status: 'recorded', principal: null, source: 'modeled_demo', income, internal });
    };
    add('btc', 1, 'treasury', 430 + daysAgo * 7.25, 'investment_income', 'btc_strategy', true);
    add('eth', 3, 'treasury', -115 - daysAgo * 2.5, 'investment_income', 'eth_strategy', true);
    add('sol', 5, 'treasury', 285 + daysAgo * 4.75, 'investment_income', 'sol_strategy', true);
    add('yield', 6, 'treasury', 28 + daysAgo * 1.25, 'investment_income', 'yield_strategy', true);
    const funding = 45 + (daysAgo % 4) * 10;
    add('funding-out', 7, 'treasury', -funding, 'buyback_funding', 'buyback_wallet', false, true);
    add('funding-in', 7, 'buyback', funding, 'buyback_funding', 'treasury', false, true);
    add('unused-capital-return-in', 8, 'treasury', funding, 'transfer', 'buyback_wallet', false, true);
    add('unused-capital-return-out', 8, 'buyback', -funding, 'transfer', 'treasury', false, true);
  }
  return out;
}

/** Split an existing aggregate without changing its value at the asset's precision. */
export function splitStatementAmount(amount: number, weights: readonly number[], decimals: number): number[] {
  const scale = 10 ** decimals;
  let remaining = Math.round(amount * scale);
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((weight, i) => {
    const units = i === weights.length - 1 ? remaining : Math.round(amount * scale * weight / total);
    remaining -= units;
    return units / scale;
  });
}
