import type { MarketKind } from '@/components/hero/MarketMark';

export const markets = [
  { id: 'predictions', kind: 'predictions', label: 'Previsões', platformId: 'polymarket', platform: 'Polymarket', logo: 'platforms/polymarket.svg' },
  { id: 'trading', kind: 'trading', label: 'Ações e cripto', platformId: 'robinhood', platform: 'Robinhood', logo: 'platforms/robinhood.svg' },
  { id: 'sports', kind: 'sports', label: 'Esportes', platformId: 'kalshi', platform: 'Kalshi', logo: 'platforms/kalshi.webp' },
  { id: 'casino', kind: 'casino', label: 'Cassinos', platformId: 'duel', platform: 'Duel', logo: 'platforms/duel.webp' },
] as const satisfies readonly {
  id: MarketKind;
  kind: MarketKind;
  label: string;
  platformId: string;
  platform: string;
  logo: string;
}[];

export type MarketId = typeof markets[number]['id'];
export type PlatformId = typeof markets[number]['platformId'];
export type ScreenId = 'participacao' | 'bettex' | 'resultados' | 'historico';

export interface ScreenMeta { id: ScreenId; label: string; title: string; text: string }

export const navGroups = [
  { label: 'BETTEX', items: [
    { id: 'participacao', label: 'Token BETTEX', title: 'Sua carteira BETTEX.', text: 'Seus tokens, sua participação automática e seus lucros em reais.' },
    { id: 'bettex', label: 'Como opera', title: 'BETTEX em operação.', text: 'Exemplos de surebet, mineração de bônus, cripto alavancada e previsões, operados pelos quatro agentes da BETTEX em plataformas fictícias.' },
    { id: 'resultados', label: 'Resultados', title: 'O desempenho dos quatro agentes.', text: 'Compare o lucro obtido, as perdas e o resultado líquido do projeto nos quatro mercados.' },
    { id: 'historico', label: 'Histórico', title: 'Performance por agente.', text: 'Escolha um dos quatro agentes para ver seu gráfico e os dias de lucro e de perda na semana de exemplo.' },
  ] satisfies ScreenMeta[] },
];

export const allScreens = navGroups.flatMap((group) => group.items);