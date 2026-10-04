import type { MarketId } from './presentationData';

// Illustration of the project's closed operations, not the holder's wallet,
// live trading data, or a source for the account's distribution credit.
export const performanceDates = ['24/09', '25/09', '26/09', '27/09', '28/09', '29/09', '30/09'] as const;

export type PerformanceDay = {
  date: typeof performanceDates[number];
  profitCents: number;
  lossCents: number;
};

export type MarketPerformance = {
  id: MarketId;
  name: string;
  category: string;
  days: PerformanceDay[];
};

function days(values: readonly (readonly [number, number])[]): PerformanceDay[] {
  if (values.length !== performanceDates.length) {
    throw new Error('O exemplo de desempenho precisa ter sete dias para cada mercado.');
  }
  return performanceDates.map((date, index) => {
    const [profitCents, lossCents] = values[index];
    if (!Number.isInteger(profitCents) || !Number.isInteger(lossCents) || profitCents < 0 || lossCents < 0) {
      throw new Error(`Valor inválido para o desempenho de ${date}.`);
    }
    return { date, profitCents, lossCents };
  });
}

export const marketPerformance: MarketPerformance[] = [
  {
    id: 'sports',
    name: 'Esportes',
    category: 'Surebet',
    days: days([[72000, 0], [0, 12000], [51000, 0], [0, 6000], [68000, 0], [90000, 0], [82000, 0]]),
  },
  {
    id: 'predictions',
    name: 'Previsões',
    category: 'Mercados de previsão',
    days: days([[0, 18000], [40000, 0], [0, 23000], [56000, 0], [0, 15000], [37000, 0], [44000, 0]]),
  },
  {
    id: 'casino',
    name: 'iGaming',
    category: 'Mineração de bônus',
    days: days([[18000, 0], [12000, 0], [0, 7000], [16000, 0], [22000, 0], [0, 11000], [10000, 0]]),
  },
  {
    id: 'trading',
    name: 'Ações e cripto',
    category: 'Cripto e memes',
    days: days([[0, 30000], [45000, 0], [0, 49000], [61000, 0], [0, 17000], [0, 40000], [38000, 0]]),
  },
];

export const netCents = (day: PerformanceDay) => day.profitCents - day.lossCents;

export function totalsFor(markets: readonly MarketPerformance[]) {
  return markets.reduce((totals, market) => {
    for (const day of market.days) {
      totals.profitCents += day.profitCents;
      totals.lossCents += day.lossCents;
    }
    return totals;
  }, { profitCents: 0, lossCents: 0 });
}

export function dailyFor(markets: readonly MarketPerformance[]): PerformanceDay[] {
  return performanceDates.map((date, index) => ({
    date,
    profitCents: markets.reduce((total, market) => total + market.days[index].profitCents, 0),
    lossCents: markets.reduce((total, market) => total + market.days[index].lossCents, 0),
  }));
}