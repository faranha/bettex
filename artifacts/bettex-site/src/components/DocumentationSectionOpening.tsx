/** @jsxImportSource react */
import { t, useLocale } from '@/lib/i18n';
import { DocumentationFeaturesIntroduction } from './DocumentationFeaturesIntroduction';

/** Main-section titles and introductions are reading content, never accordion controls. */
export function DocumentationSectionOpening({ group }: { group: 2 | 3 }) {
  const locale = useLocale();
  const x = (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
  return <>
    <header className="whitepaper__chapter-head">
      <h2 id={group === 3 ? 'title-documentacao-features' : 'title-documentacao-subagentes'} data-documentation-heading-depth="1">
        <span className="whitepaper__heading-number">{group + 1}</span>{' '}
        <span data-documentation-title>{t(group === 3 ? 'Features' : 'Subagentes')}</span><span className="whitepaper__title-period">.</span>
      </h2>
      <p>{group === 3
        ? t('Funcionalidades do aplicativo que executam regras, não inteligências.')
        : x('Áreas de análise que apoiam a inteligência central.',
          'Areas of analysis that support the central intelligence.',
          'Áreas de análisis que apoyan la inteligencia central.')}</p>
    </header>
    {group === 3 ? <DocumentationFeaturesIntroduction /> : <div className="whitepaper__prose">
      <p>{x(
        'Os subagentes apoiam o agente BETTEX em áreas específicas. Risco, Tesouraria e Governança tratam de exposição, recursos e políticas. Cripto, Esportes, Previsões e iGaming organizam as análises de seus mercados. Cripto inclui as especializações BTC, ETH e SOL.',
        'Subagents support the BETTEX agent in specific areas. Risk, Treasury and Governance address exposure, resources and policies. Crypto, Sports, Predictions and iGaming organize analysis of their markets. Crypto includes BTC, ETH and SOL specializations.',
        'Los subagentes apoyan al agente BETTEX en áreas específicas. Riesgo, Tesorería y Gobernanza abordan exposición, recursos y políticas. Cripto, Deportes, Predicciones e iGaming organizan los análisis de sus mercados. Cripto incluye las especializaciones BTC, ETH y SOL.',
      )}</p>
    </div>}
  </>;
}
