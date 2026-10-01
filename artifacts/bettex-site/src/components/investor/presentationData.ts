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
export type ScreenId = 'visao' | 'dinheiro' | 'participacao' | 'bettex' | 'resultados' | 'historico';

export interface ScreenMeta { id: ScreenId; label: string; title: string; text: string }

export const navGroups = [
  { label: 'BETTEX', items: [
    { id: 'visao', label: 'Visão geral', title: 'Sua participação, de forma simples.', text: 'Acompanhe saldo, token e créditos na conta de exemplo BETTEX.' },
    { id: 'dinheiro', label: 'Conta BRL / Pix', title: 'Sua conta em reais.', text: 'Depósitos, lucros e saques aparecem em reais, com Pix.' },
    { id: 'participacao', label: 'Token BETTEX', title: 'Ative sua participação.', text: 'Ter BETTEX na carteira pessoal não ativa participação: deposite tokens na Carteira BETTEX para ativá-la.' },
    { id: 'bettex', label: 'Como opera', title: 'Uma IA. Múltiplas análises. Quatro mercados.', text: 'Antes de cada operação, a BETTEX compara oportunidades nos mercados e plataformas segundo suas análises.' },
    { id: 'resultados', label: 'Resultados', title: 'Créditos por plataforma.', text: 'Veja como o exemplo de lucro total se distribui entre as plataformas.' },
    { id: 'historico', label: 'Histórico', title: 'Investimentos e operações.', text: 'Acompanhe créditos de operações identificados pela plataforma, além de depósitos e saques por Pix.' },
  ] satisfies ScreenMeta[] },
];

export const allScreens = navGroups.flatMap((group) => group.items);