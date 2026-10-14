/** @jsxImportSource react */
import { t, useLocale } from '@/lib/i18n';
import { documentationChapters } from '@/lib/documentation-structure';
import './DocumentationRelatedTopics.css';

const related: Record<string, string[]> = {
  'documentacao-como-funciona': ['documentacao-agentes', 'documentacao-features', 'documentacao-riscos'],
  'documentacao-agentes': ['documentacao-subagente-risco', 'documentacao-subagente-tesouraria', 'documentacao-subagente-governanca'],
  'documentacao-subagente-risco': ['documentacao-subagente-tesouraria', 'documentacao-subagente-governanca', 'documentacao-riscos'],
  'documentacao-subagente-tesouraria': ['documentacao-historico', 'documentacao-staking', 'documentacao-feature-recompra'],
  'documentacao-subagente-governanca': ['documentacao-agentes', 'documentacao-subagente-risco', 'documentacao-roadmap'],
  'documentacao-subagente-cripto': ['documentacao-agentes', 'documentacao-subagente-risco', 'documentacao-subagente-tesouraria'],
  'documentacao-especialista-btc': ['documentacao-subagente-cripto', 'documentacao-especialista-eth', 'documentacao-especialista-sol'],
  'documentacao-especialista-eth': ['documentacao-subagente-cripto', 'documentacao-especialista-btc', 'documentacao-especialista-sol'],
  'documentacao-especialista-sol': ['documentacao-subagente-cripto', 'documentacao-especialista-btc', 'documentacao-especialista-eth'],
  'documentacao-subagente-esportes': ['documentacao-agentes', 'documentacao-subagente-risco', 'documentacao-riscos'],
  'documentacao-subagente-previsoes': ['documentacao-agentes', 'documentacao-subagente-risco', 'documentacao-riscos'],
  'documentacao-subagente-igaming': ['documentacao-agentes', 'documentacao-jogos', 'documentacao-riscos'],
  'documentacao-carteira-bettex': ['documentacao-emissao', 'documentacao-staking', 'documentacao-acesso'],
  'documentacao-carteira-usdc': ['documentacao-historico', 'documentacao-staking', 'documentacao-subagente-tesouraria'],
  'documentacao-acesso': ['documentacao-carteira-bettex', 'documentacao-carteira-usdc', 'documentacao-riscos'],
  'documentacao-historico': ['documentacao-carteira-usdc', 'documentacao-subagente-tesouraria', 'documentacao-staking'],
  'documentacao-staking': ['documentacao-carteira-bettex', 'documentacao-emissao', 'documentacao-historico'],
  'documentacao-emissao': ['documentacao-carteira-bettex', 'documentacao-staking', 'documentacao-feature-recompra'],
  'documentacao-feature-recompra': ['documentacao-subagente-tesouraria', 'documentacao-emissao', 'documentacao-historico'],
  'documentacao-jogos': ['documentacao-carteira-bettex', 'documentacao-emissao', 'documentacao-subagente-igaming'],
  'documentacao-riscos': ['documentacao-acesso', 'documentacao-subagente-risco', 'documentacao-subagente-governanca'],
  'documentacao-roadmap': ['documentacao-como-funciona', 'documentacao-subagente-governanca', 'documentacao-emissao'],
};

export function DocumentationRelatedTopics({ chapterId }: { chapterId: string }) {
  const locale = useLocale();
  const x = (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
  const targets = (related[chapterId] ?? []).map(id => {
    const chapter = documentationChapters.find(item => item.id === id);
    if (!chapter) throw new Error(`Unknown documentation reference: ${id}`);
    return chapter;
  });
  if (!targets.length) return null;
  return <aside id={`documentation-related-${chapterId}`} className="whitepaper__related" aria-label={x('Leia também', 'Related topics', 'Temas relacionados')} data-testid={`documentation-related-${chapterId}`}>
    <p className="whitepaper__related-title"><strong>{x('Leia também', 'Related topics', 'Temas relacionados')}</strong></p>
    <ul className="whitepaper__related-list">{targets.map(chapter => <li key={chapter.id}>
      <a className="whitepaper__related-link" href={`#${chapter.id === 'documentacao-carteira-bettex' ? `title-${chapter.id}` : chapter.id}`} data-documentation-intralink="">
        <span>{t(chapter.title)}</span>
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><path d="M4 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </a>
    </li>)}</ul>
  </aside>;
}
