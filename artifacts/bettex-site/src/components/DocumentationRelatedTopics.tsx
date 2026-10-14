/** @jsxImportSource react */
import { t, useLocale } from '@/lib/i18n';
import { documentationChapters } from '@/lib/documentation-structure';
import './DocumentationRelatedTopics.css';

type ReadingLabel = (pt: string, en: string, es: string) => string;
type ReadingSuggestion = string | { id: string; title: (x: ReadingLabel) => string };
const related: Record<string, ReadingSuggestion[]> = {
  'documentacao-como-funciona': [
    { id: 'documentacao-emissao', title: x => x('Entender a tokenomics', 'Understand the tokenomics', 'Entender la tokenomics') },
    'documentacao-agentes', 'documentacao-features', 'documentacao-riscos',
  ],
  'documentacao-agentes': [
    'documentacao-subagente-risco', 'documentacao-subagente-tesouraria', 'documentacao-subagente-governanca',
    { id: 'documentacao-controles', title: () => t('Controles de risco') },
  ],
  'documentation-reading-group-2': [
    'documentacao-agentes', 'documentacao-riscos', 'documentacao-roadmap',
    { id: 'documentacao-financiamento-fundacao', title: () => t('Financiamento: origem e destino dos recursos') },
    'documentacao-especialista-btc', 'documentacao-especialista-eth', 'documentacao-especialista-sol',
    { id: 'documentacao-subagente-cripto', title: () => t('Capacidades e fontes de Cripto') },
    { id: 'documentacao-subagente-risco', title: () => t('Baseline de Risco') },
    { id: 'documentacao-subagente-tesouraria', title: () => t('Baseline de Tesouraria') },
    { id: 'documentacao-conexoes-esportes', title: () => t('Conectores de Esportes e iGaming') },
    { id: 'documentacao-jogos', title: () => t('Consultar as regras dos jogos internos') },
  ],
  'documentacao-features': [
    'documentacao-subagente-tesouraria', 'documentacao-riscos', 'documentacao-como-funciona',
    { id: 'documentacao-financiamento-fundacao', title: () => t('Financiamento: origem e destino dos recursos') },
    { id: 'documentacao-loteria', title: x => x('Ver regras de loteria e Double 2X', 'View lottery and Double 2X rules', 'Ver reglas de la lotería y Double 2X') },
    { id: 'documentacao-taxas', title: () => t('Consultar alternativas de sustentabilidade') },
  ],
  'documentacao-riscos': [
    'documentacao-acesso', 'documentacao-subagente-risco', 'documentacao-subagente-governanca',
    { id: 'documentacao-staking', title: () => t('Apuração e liquidação dos resultados') },
    { id: 'documentacao-recompras', title: () => t('Recompra e queima') },
    { id: 'documentacao-rede', title: () => t('Ver as alternativas Starknet e Arbitrum, ativos e carteiras') },
    { id: 'documentacao-referencia-agentes', title: () => t('Requisitos operacionais e de segurança') },
  ],
  'documentacao-roadmap': ['documentacao-como-funciona', 'documentacao-subagente-governanca', 'documentacao-emissao'],
};

export function DocumentationRelatedTopics({ sectionId }: { sectionId: string }) {
  const locale = useLocale();
  const x = (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
  const targets = (related[sectionId] ?? []).map(suggestion => {
    if (typeof suggestion !== 'string') return {
      id: suggestion.id,
      title: suggestion.title(x),
    };
    const id = suggestion;
    const chapter = documentationChapters.find(item => item.id === id);
    if (!chapter) throw new Error(`Unknown documentation reference: ${id}`);
    return { id: chapter.id, title: t(chapter.title) };
  });
  if (!targets.length) return null;
  return <aside id={`documentation-related-${sectionId}`} className="whitepaper__related" data-documentation-related-section={sectionId} aria-label={x('Leia também', 'Related topics', 'Temas relacionados')} data-testid={`documentation-related-${sectionId}`}>
    <p className="whitepaper__related-title"><strong>{x('Leia também', 'Related topics', 'Temas relacionados')}</strong></p>
    <ul className="whitepaper__related-list">{targets.map(chapter => <li key={chapter.id}>
      <a className="whitepaper__related-link" href={`#${chapter.id === 'documentacao-carteira-bettex' ? `title-${chapter.id}` : chapter.id}`} data-documentation-intralink="">
        <span>{chapter.title}</span>
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><path d="M4 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </a>
    </li>)}</ul>
  </aside>;
}
