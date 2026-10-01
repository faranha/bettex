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
export type ScreenId = 'dinheiro' | 'participacao' | 'bettex' | 'resultados' | 'historico';

export interface ScreenMeta { id: ScreenId; label: string; title: string; text: string }

export const navGroups = [
  { label: 'BETTEX', items: [
    { id: 'dinheiro', label: 'Conta em reais / Pix', title: 'Sua conta em reais.', text: 'Consulte depósitos, compra concluída de BETTEX, créditos e saques em reais.' },
    { id: 'participacao', label: 'Token BETTEX', title: 'Saldo de tokens BETTEX.', text: 'Seu saldo de BETTEX participa automaticamente nos dias com lucro líquido realizado pelo projeto, conforme a quantidade de tokens e o tempo mantido.' },
    { id: 'bettex', label: 'Como opera', title: 'Uma IA. Múltiplas análises. Quatro mercados.', text: 'A BETTEX compara oportunidades em diferentes mercados e plataformas a partir de suas análises.' },
    { id: 'resultados', label: 'Resultados', title: 'Lucros recebidos em reais.', text: 'Veja sua parte do lucro e o exemplo de valores por plataforma.' },
    { id: 'historico', label: 'Histórico', title: 'Movimentações da conta.', text: 'Consulte compras de tokens, o crédito diário consolidado e outras movimentações.' },
  ] satisfies ScreenMeta[] },
];

export const allScreens = navGroups.flatMap((group) => group.items);