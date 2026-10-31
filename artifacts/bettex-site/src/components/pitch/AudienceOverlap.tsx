import { getFormatLocale, t, useLocale } from '../../lib/i18n';
import { audienceScenario } from './audienceScenario';
import './AudienceOverlap.css';

export function AudienceOverlap() {
  useLocale();
  const fmt = (n: number, d = 1) => new Intl.NumberFormat(getFormatLocale(), { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const s = audienceScenario;
  const bet = fmt(s.bettingMillions, 0);
  const cry = fmt(s.cryptoMillions, 0);
  const share = fmt(s.cryptoShare * 100, 1);
  const overlap = fmt(s.overlapMillions);
  const title = t('Públicos potenciais e público central');
  return <section className="pb-overlap" id="audience-overlap" data-testid="audience-overlap" aria-labelledby="audience-overlap-title">
    <p className="mono pb-overlap__kicker">{t('Cenário hipotético · não é medição')}</p>
    <h3 className="display" id="audience-overlap-title">{title}</h3>
    <div className="pb-overlap__main">
      <ul className="pb-overlap__metrics">
        <li className="pb-overlap__metric" data-testid="audience-betting-labels">
          <span className="pb-overlap__metric-media"><img src={`${import.meta.env.BASE_URL}pitch-media/casino-roulette.jpg`} alt={t('Mesa de roleta de cassino com fichas, imagem ilustrativa do público apostador')} loading="lazy" decoding="async" style={{ objectPosition: '50% 30%' }} /><span className="pb-overlap__metric-badge mono">{t('Foto ilustrativa')}</span></span>
          <span className="pb-overlap__metric-role mono">{t('Público potencial')}</span>
          <span className="pb-overlap__metric-label">{t('Apostadores')}</span>
          <span className="pb-overlap__metric-value">≈ {bet} <small>{t('milhões')}</small></span>
        </li>
        <li className="pb-overlap__metric" data-testid="audience-crypto-labels">
          <span className="pb-overlap__metric-media"><img src={`${import.meta.env.BASE_URL}pitch-media/investment-markets.jpg`} alt={t('Tela de análise de mercados, imagem ilustrativa do mercado cripto')} loading="lazy" decoding="async" style={{ objectPosition: '50% 50%' }} /><span className="pb-overlap__metric-badge mono">{t('Foto ilustrativa')}</span></span>
          <span className="pb-overlap__metric-role mono">{t('Público potencial')}</span>
          <span className="pb-overlap__metric-label">{t('Já tiveram')} {t('cripto')}</span>
          <span className="pb-overlap__metric-value">≈ {cry} <small>{t('milhões')}</small></span>
        </li>
      </ul>
      <div className="pb-overlap__core">
        <p className="mono pb-overlap__core-label">{t('Público central estimado')}</p>
        <p className="display pb-overlap__core-value">{overlap} <small>{t('milhões')}</small></p>
        <p className="pb-overlap__core-calc">{t('Premissa de independência')}: {bet} {t('milhões')} × {share}% = {overlap} {t('milhões')}.</p>
        <p className="pb-overlap__core-text">{t('O núcleo reúne, neste cenário, apostadores com experiência em cripto.')}</p>
      </div>
    </div>
    <p className="pb-overlap__sources">
      <span>{t('Fontes')}:</span>{' '}
      <a href={s.bettingSourceUrl} target="_blank" rel="noopener noreferrer">{t('Apostas: Fazenda / SIGAP, via Folha · set. 2026')}</a>
      <span aria-hidden="true"> · </span>
      <a href={s.cryptoSourceUrl} target="_blank" rel="noopener noreferrer">{t('Datafolha / Paradigma · publicado em ago. 2026')}</a>
      <span aria-hidden="true"> · </span>
      <span>{t('BETTEX · cenário de mercado')}</span>
    </p>
  </section>;
}
