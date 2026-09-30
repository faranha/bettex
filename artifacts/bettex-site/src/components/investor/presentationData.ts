import type { AgentKind } from '@/components/hero/AgentMark';

export type ScreenId = 'visao' | 'dinheiro' | 'participacao' | 'agentes' | 'predix' | 'tradex' | 'sportix' | 'bettix' | 'resultados' | 'historico';

export interface ScreenMeta { id: ScreenId; label: string; title: string; text: string }
export interface NavGroup { label: string; items: ScreenMeta[] }

export const navGroups: NavGroup[] = [
  { label: 'Minha conta', items: [
    { id: 'visao', label: 'Visão geral', title: 'Tudo da sua participação, numa tela só.', text: 'Um painel de entrada que reúne sua participação, os quatro agentes e o último aviso do período.' },
    { id: 'dinheiro', label: 'Conta em reais', title: 'Reais entram e saem por Pix.', text: 'Depósitos, lucros e saques são mostrados em reais, com Pix. O token fica nos bastidores.' },
    { id: 'participacao', label: 'Participação BETTEX', title: 'Um token, quatro mercados.', text: 'Acompanhe sua participação no projeto BETTEX. A compra, a ativação e a movimentação dos tokens são processadas pelo sistema.' },
  ] },
  { label: 'Agentes', items: [
    { id: 'agentes', label: 'Todos os agentes', title: 'Quatro agentes, cada um no seu mercado.', text: 'Descubra o que cada agente faz e em qual plataforma ele atua, sem jargão.' },
    { id: 'predix', label: 'PREDIX', title: 'PREDIX, o agente de previsões.', text: 'Atua em mercados de previsão na Polymarket, com apoio de inteligência da Allora.' },
    { id: 'tradex', label: 'TRADEX', title: 'TRADEX, o agente de ações e cripto.', text: 'Atua em ações e criptoativos pela Robinhood, com apoio de inteligência da Allora.' },
    { id: 'sportix', label: 'SPORTIX', title: 'SPORTIX, o agente de esportes.', text: 'Atua em mercados esportivos na Kalshi.' },
    { id: 'bettix', label: 'BETTIX', title: 'BETTIX, o agente de cassino.', text: 'Atua em jogos de cassino na Duel.' },
  ] },
  { label: 'Acompanhamento', items: [
    { id: 'resultados', label: 'Resultados', title: 'Seu resumo de resultados em reais.', text: 'Acompanhe sua parte nos resultados de cada agente e o total de lucro creditado na sua conta.' },
    { id: 'historico', label: 'Histórico', title: 'Cada movimento, registrado em reais.', text: 'Uma linha do tempo organizada de depósitos, créditos de lucro e saques por Pix.' },
  ] },
];

export const allScreens = navGroups.flatMap((g) => g.items);

export interface AgentInfo {
  name: string; kind: AgentKind; area: string; img: string; platform: string; logo: string; allora: boolean;
  does: string; how: string[];
}
export const agentInfo: Record<AgentKind, AgentInfo> = {
  predix: { name: 'PREDIX', kind: 'predix', area: 'Previsões', img: 'agents/predix.webp', platform: 'Polymarket', logo: 'platforms/polymarket.svg', allora: true,
    does: 'Avalia perguntas sobre o futuro e participa de mercados de previsão.', how: ['Lê eventos abertos', 'Compara probabilidades', 'Registra o resultado apurado'] },
  tradex: { name: 'TRADEX', kind: 'tradex', area: 'Ações e cripto', img: 'agents/tradix.webp', platform: 'Robinhood', logo: 'platforms/robinhood.svg', allora: true,
    does: 'Acompanha ações e criptoativos e opera dentro de limites definidos.', how: ['Observa o mercado', 'Opera com limites', 'Registra o resultado apurado'] },
  sportix: { name: 'SPORTIX', kind: 'sportix', area: 'Esportes', img: 'agents/sportix.webp', platform: 'Kalshi', logo: 'platforms/kalshi.webp', allora: false,
    does: 'Analisa eventos esportivos e participa de mercados sobre seus desfechos.', how: ['Acompanha a agenda', 'Avalia cenários', 'Registra o resultado apurado'] },
  bettix: { name: 'BETTIX', kind: 'bettix', area: 'Cassino', img: 'agents/bettix.webp', platform: 'Duel', logo: 'platforms/duel.webp', allora: false,
    does: 'Participa de jogos de cassino seguindo regras de gestão de risco.', how: ['Segue regras de risco', 'Limita exposição', 'Registra o resultado apurado'] },
};
export const agentOrder: AgentKind[] = ['predix', 'tradex', 'sportix', 'bettix'];
