/** @jsxImportSource react */
import { t } from '@/lib/i18n';
// Only named definitions and explicit section names; never infer a related topic.
const destinations: { pattern: RegExp; id: string }[] = [
  { pattern: /^(?:carteira BETTEX|BETTEX wallet|cartera BETTEX)$/i, id: 'title-documentacao-carteira-bettex' },
  { pattern: /^(?:carteira USDC|USDC wallet|cartera USDC)$/i, id: 'documentacao-carteira-usdc' },
  { pattern: /^(?:agente BETTEX|BETTEX agent)$/i, id: 'documentacao-agentes' },
  { pattern: /^(?:subagente de risco|risk subagent|subagente de riesgo)$/i, id: 'documentacao-subagente-risco' },
  { pattern: /^(?:subagente de tesouraria|treasury subagent|subagente de tesorería)$/i, id: 'documentacao-subagente-tesouraria' },
  { pattern: /^(?:subagente de governança|governance subagent|subagente de gobernanza)$/i, id: 'documentacao-subagente-governanca' },
  { pattern: /^(?:histórico e conciliação|history and reconciliation|historial y conciliación)$/i, id: 'documentacao-historico' },
  { pattern: /^staking$/i, id: 'documentacao-staking' },
  { pattern: /^vesting$/i, id: 'documentacao-vesting' },
  { pattern: /^(?:recompra e queima|buyback and burn|recompra y quema)$/i, id: 'documentacao-feature-recompra' },
  { pattern: /^Double 2X$/i, id: 'documentacao-double-2x' },
  { pattern: /^DeFAI$/i, id: 'documentacao-conceito-defai' },
  { pattern: /^DeFi$/i, id: 'documentacao-conceito-defi' },
  { pattern: /^DEX$/i, id: 'documentacao-conceito-dex' },
  { pattern: /^USDC$/i, id: 'documentacao-conceito-tokens' },
  { pattern: /^(?:subagente de esportes|sports subagent|subagente de deportes)$/i, id: 'documentacao-subagente-esportes' },
  { pattern: /^(?:subagente de iGaming|iGaming subagent)$/i, id: 'documentacao-subagente-igaming' },
  { pattern: /^(?:subagente de cripto|crypto subagent|subagente de criptoactivos)$/i, id: 'documentacao-subagente-cripto' },
  { pattern: /^(?:subagente de previsões|predictions subagent|subagente de predicciones)$/i, id: 'documentacao-subagente-previsoes' },
];
const terms = new RegExp(`(?<![\\p{L}\\p{N}_])(${destinations.map(({ pattern }) => pattern.source.replace(/^\^|\$$/g, '')).join('|')})(?![\\p{L}\\p{N}_])`, 'giu');

export function DocumentationLinkedTerms({ text, contextId }: { text: string; contextId?: string }) {
  const linked = new Set<string>();
  // Localize this established market label independently of hyperlink creation.
  const localizedText = text.replace(/\bpredictions\b/gi, label => t(label));
  return <>{localizedText.split(terms).map((part, index) => {
    const destination = destinations.find(({ pattern }) => pattern.test(part));
    if (!destination || (contextId && destination.id.replace(/^title-/, '') === contextId) || linked.has(destination.id) || linked.size >= 3) return part;
    linked.add(destination.id);
    return <a key={index} href={`#${destination.id}`} data-documentation-intralink=""><strong>{part}</strong></a>;
  })}</>;
}
