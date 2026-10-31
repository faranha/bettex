import { t } from '@/lib/i18n';
import './DocumentationAgentConcept.css';

const concepts: Record<string, { src: string; caption: string }> = {
  'documentacao-subagente-risco': {
    src: 'technology/subagent-concept-risk-integrated.webp',
    caption: 'Ilustração conceitual: análise de exposição, limites e autorização independente.',
  },
  'documentacao-subagente-tesouraria': {
    src: 'technology/subagent-concept-treasury-integrated.webp',
    caption: 'Ilustração conceitual: reservas segregadas, liquidez e análise de alocação.',
  },
  'documentacao-subagente-governanca': {
    src: 'technology/subagent-concept-governance-integrated.webp',
    caption: 'Ilustração conceitual: políticas versionadas, quórum e mudanças controladas.',
  },
  'documentacao-subagente-cripto': {
    src: 'technology/subagent-concept-crypto-integrated.webp',
    caption: 'Ilustração conceitual: o subagente Cripto integra análises de BTC, ETH e SOL.',
  },
  'documentacao-subagente-esportes': {
    src: 'technology/subagent-concept-sports-integrated.webp',
    caption: 'Ilustração conceitual: comparação de probabilidades e fontes esportivas na visão futura.',
  },
  'documentacao-subagente-previsoes': {
    src: 'technology/subagent-concept-predictions-integrated.webp',
    caption: 'Ilustração conceitual: hipóteses e resultados incertos em mercados de eventos na visão futura.',
  },
  'documentacao-subagente-igaming': {
    src: 'technology/subagent-concept-igaming-integrated.webp',
    caption: 'Ilustração conceitual: avaliação de condições, promoções e riscos de iGaming na visão futura.',
  },
  'documentacao-especialista-btc': {
    src: 'technology/subagent-concept-btc-integrated.webp',
    caption: 'Ilustração conceitual: o especialista BTC analisa o mercado de Bitcoin.',
  },
  'documentacao-especialista-eth': {
    src: 'technology/subagent-concept-eth-integrated.webp',
    caption: 'Ilustração conceitual: o especialista ETH analisa o mercado de Ethereum.',
  },
  'documentacao-especialista-sol': {
    src: 'technology/subagent-concept-sol-integrated.webp',
    caption: 'Ilustração conceitual: o especialista SOL analisa o mercado de Solana.',
  },
};

/** Each agent has its own conceptual scene inside its expandable content. */
export function DocumentationAgentConcept({ chapterId }: { chapterId: string }) {
  const concept = concepts[chapterId];
  if (!concept) return null;
  const caption = t(concept.caption);
  return <figure id={`${chapterId}-concept-art`} className="documentation-agent-concept"
    data-testid="documentation-agent-concept" data-agent-concept={chapterId}>
    <img src={`${import.meta.env.BASE_URL}${concept.src}`} width={960} height={960}
      alt={caption} data-i18n="translated" loading="lazy" decoding="async" />
    <figcaption data-i18n="translated">{caption}</figcaption>
  </figure>;
}
