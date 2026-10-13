/** @jsxImportSource react */
import { t } from '@/lib/i18n';

// Specific phrases come first; broad opening terms are not repeated in body copy.
const destinations: { pattern: RegExp; id: string; openingOnly?: boolean }[] = [
  { pattern: /^(?:carteira BETTEX|BETTEX wallet|cartera BETTEX)$/i, id: 'title-documentacao-carteira-bettex' },
  { pattern: /^(?:carteira USDC|USDC wallet|cartera USDC)$/i, id: 'documentacao-carteira-usdc' },
  { pattern: /^(?:agente BETTEX|BETTEX agent)$/i, id: 'documentacao-agentes' },
  { pattern: /^(?:inteligência artificial|artificial intelligence|inteligencia artificial|agentes de IA|AI agents)$/i, id: 'documentacao-agentes' },
  { pattern: /^(?:subagente de risco|risk subagent|subagente de riesgo)$/i, id: 'documentacao-subagente-risco' },
  { pattern: /^(?:Risco|Risk|Riesgo)$/, id: 'documentacao-subagente-risco' },
  { pattern: /^(?:subagente de tesouraria|treasury subagent|subagente de tesorería|tesouraria|treasury|tesorería)$/i, id: 'documentacao-subagente-tesouraria' },
  { pattern: /^(?:governança|governance|gobernanza)$/i, id: 'documentacao-subagente-governanca' },
  { pattern: /^(?:mandatos?|mandates?)$/i, id: 'documentacao-subagente-governanca' },
  { pattern: /^(?:histórico e conciliação|history and reconciliation|historial y conciliación|conciliação|reconciliation|conciliación)$/i, id: 'documentacao-historico' },
  { pattern: /^(?:distribuição de resultados|distribuição de lucros|profit distribution|distribución de resultados|distribución de beneficios|staking)$/i, id: 'documentacao-staking' },
  { pattern: /^vesting$/i, id: 'documentacao-vesting' },
  { pattern: /^(?:recompra e queima|buyback and burn|recompra y quema|recompra|buyback)$/i, id: 'documentacao-feature-recompra' },
  { pattern: /^Burn Lottery$/i, id: 'documentacao-jogos' },
  { pattern: /^Double 2X$/i, id: 'documentacao-double-2x' },
  { pattern: /^(?:contratos inteligentes|smart contracts|blockchain)$/i, id: 'documentacao-conceito-defi' },
  { pattern: /^(?:segurança|security|seguridad)$/i, id: 'documentacao-riscos' },
  { pattern: /^(?:DeFAI|DeFi AI)$/i, id: 'documentacao-conceito-defai' },
  { pattern: /^DeFi$/i, id: 'documentacao-conceito-defi' },
  { pattern: /^DEX$/i, id: 'documentacao-conceito-dex' },
  { pattern: /^(?:USDC|tokens?)$/i, id: 'documentacao-conceito-tokens' },
  { pattern: /^BETTEX$/i, id: 'documentacao-conceito-bettex', openingOnly: true },
  { pattern: /^(?:agente|agent)$/i, id: 'documentacao-agentes', openingOnly: true },
  { pattern: /^demo$/i, id: 'documentacao-percurso-demo', openingOnly: true },
  { pattern: /^(?:ALFA|prova de conceito|proof of concept|prueba de concepto)$/i, id: 'documentation-poc-scope', openingOnly: true },
  { pattern: /^(?:esportes|sports|deportes|surebet(?:ting)?)$/i, id: 'documentacao-subagente-esportes' },
  { pattern: /^iGaming$/i, id: 'documentacao-subagente-igaming' },
  { pattern: /^(?:cripto|crypto)$/i, id: 'documentacao-subagente-cripto' },
  { pattern: /^(?:predictions|previsões|predicciones)$/i, id: 'documentacao-subagente-previsoes' },
];
const terms = new RegExp(`(?<![\\p{L}\\p{N}_])(${destinations.map(({ pattern }) => pattern.source.replace(/^\^|\$$/g, '')).join('|')})(?![\\p{L}\\p{N}_])`, 'giu');

export function DocumentationLinkedTerms({ text, contextId }: { text: string; contextId?: string }) {
  const linked = new Set<string>();
  return <>{text.split(terms).map((part, index) => {
    const destination = destinations.find(({ pattern }) => pattern.test(part));
    const label = /^predictions$/i.test(part) ? t(part) : part;
    if (!destination || (contextId && (destination.openingOnly || destination.id.replace(/^title-/, '') === contextId || linked.has(destination.id) || linked.size >= 3))) return part;
    linked.add(destination.id);
    return <a key={index} href={`#${destination.id}`} data-documentation-intralink=""><strong>{label}</strong></a>;
  })}</>;
}
