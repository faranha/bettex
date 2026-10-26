/** @jsxImportSource react */
import { t, useLocale } from '@/lib/i18n';
import { DocumentationFeaturesIntroduction } from './DocumentationFeaturesIntroduction';

/** Main-section titles and introductions are reading content, never accordion controls. */
export function DocumentationSectionOpening({ group }: { group: 2 | 3 | 4 }) {
  const locale = useLocale();
  const x = (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
  if (group === 4) return <>
    <header className="whitepaper__chapter-head">
      <h2 id="title-documentacao-tokenomics" data-documentation-heading-depth="1">
        <span className="whitepaper__heading-number">{group + 1}</span>{' '}
        <span data-documentation-title>{t('Tokenomics')}</span><span className="whitepaper__title-period">.</span>
      </h2>
      <p>{t('Emissão, venda, vesting, direitos e destinação dos resultados.')}</p>
    </header>
    <DocumentationFeaturesIntroduction economics />
  </>;
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
        'Os subagentes apoiam o agente BETTEX no trading cripto. Risco, Tesouraria e Governança tratam de exposição, recursos e políticas. Cripto analisa padrões de manipulação, seleciona ativos e avalia entradas e saídas. BTC, ETH e SOL ilustram especializações internas; não limitam o universo de moedas.',
        'Subagents support the BETTEX agent in crypto trading. Risk, Treasury and Governance address exposure, resources and policies. Crypto analyzes manipulation patterns, selects assets and evaluates entries and exits. BTC, ETH and SOL illustrate internal specializations; they do not limit the coin universe.',
        'Los subagentes apoyan al agente BETTEX en el trading cripto. Riesgo, Tesorería y Gobernanza abordan exposición, recursos y políticas. Cripto analiza patrones de manipulación, selecciona activos y evalúa entradas y salidas. BTC, ETH y SOL ilustran especializaciones internas; no limitan el universo de monedas.',
      )}</p>
    </div>}
  </>;
}
