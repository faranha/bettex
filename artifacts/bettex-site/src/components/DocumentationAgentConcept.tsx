import { t } from '@/lib/i18n';
import './DocumentationAgentConcept.css';

const concepts: Record<string, { src: string; caption: string }> = {
  'documentacao-subagente-risco': {
    src: 'technology/subagent-concept-risk.webp',
    caption: 'Ilustração conceitual: análise de exposição, limites e autorização independente.',
  },
  'documentacao-subagente-tesouraria': {
    src: 'technology/subagent-concept-treasury.webp',
    caption: 'Ilustração conceitual: reservas segregadas, liquidez e análise de alocação.',
  },
  'documentacao-subagente-governanca': {
    src: 'technology/subagent-concept-governance.webp',
    caption: 'Ilustração conceitual: políticas versionadas, quórum e mudanças controladas.',
  },
  'documentacao-subagente-cripto': {
    src: 'technology/subagent-concept-crypto.webp',
    caption: 'Ilustração conceitual: o subagente Cripto integra análises de BTC, ETH e SOL.',
  },
  'documentacao-subagente-esportes': {
    src: 'technology/subagent-concept-sports.webp',
    caption: 'Ilustração conceitual: comparação de probabilidades e fontes esportivas na visão futura.',
  },
  'documentacao-subagente-previsoes': {
    src: 'technology/subagent-concept-predictions.webp',
    caption: 'Ilustração conceitual: hipóteses e resultados incertos em mercados de eventos na visão futura.',
  },
  'documentacao-subagente-igaming': {
    src: 'technology/subagent-concept-igaming.webp',
    caption: 'Ilustração conceitual: avaliação de condições, promoções e riscos de iGaming na visão futura.',
  },
};

/** Full conceptual scenes complement, rather than replace, the identifying portraits. */
export function DocumentationAgentConcept({ chapterId }: { chapterId: string }) {
  const specialist = chapterId.startsWith('documentacao-especialista-');
  const concept = concepts[specialist ? 'documentacao-subagente-cripto' : chapterId];
  if (!concept) return null;
  const caption = `${t(concept.caption)}${specialist ? ` · ${chapterId.slice(-3).toUpperCase()}` : ''}`;
  return <figure id={`${chapterId}-concept-art`} className="documentation-agent-concept"
    data-testid="documentation-agent-concept" data-agent-concept={chapterId}>
    <img src={`${import.meta.env.BASE_URL}${concept.src}`} width={960} height={960}
      alt={caption} data-i18n="translated" loading="lazy" decoding="async" />
    <figcaption data-i18n="translated">{caption}</figcaption>
  </figure>;
}
