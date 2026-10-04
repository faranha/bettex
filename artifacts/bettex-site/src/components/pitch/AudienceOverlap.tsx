import { getFormatLocale, t, useLocale } from '../../lib/i18n';
import { audienceGeometry as geometry, audienceScenario } from './audienceScenario';
import './AudienceOverlap.css';

export function AudienceOverlap() {
  useLocale();
  const fmt = (n: number, d = 1) => new Intl.NumberFormat(getFormatLocale(), { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const s = audienceScenario;
  const bet = fmt(s.bettingMillions, 0);
  const cry = fmt(s.cryptoMillions, 0);
  const share = fmt(s.cryptoShare * 100, 1);
  const overlap = fmt(s.overlapMillions);
  const combined = fmt(s.combinedMillions);
  const title = t('Cenário de sobreposição de público');
  const desc = `${t('Apostadores')}: ${bet} ${t('milhões')}. ${t('Brasileiros com histórico em cripto')}: ${cry} ${t('milhões')}. ${t('Sobreposição estimada')}: ${overlap} ${t('milhões')}. ${t('Alcance combinado sem contar duplicados')}: ${combined} ${t('milhões')}.`;
  return <section className="pb-overlap" id="audience-overlap" data-testid="audience-overlap" aria-labelledby="audience-overlap-title">
    <p className="mono pb-overlap__kicker">{t('Cenário hipotético · não é medição')}</p>
    <h3 className="display" id="audience-overlap-title">{title}</h3>
    <div className="pb-overlap__body">
      <figure className="pb-overlap__figure">
        <div className="pb-overlap__legend">
          <span className="pb-overlap__legend-bet">{t('Apostadores')}</span>
          <span className="pb-overlap__legend-crypto">{t('Já tiveram cripto')}</span>
          <span className="pb-overlap__legend-intersection">{t('Sobreposição estimada')}</span>
        </div>
        <svg viewBox="0 0 560 340" role="img" aria-labelledby="audience-overlap-svg-title audience-overlap-svg-desc">
          <title id="audience-overlap-svg-title">{title}</title>
          <desc id="audience-overlap-svg-desc" data-i18n="translated">{desc}</desc>
          <defs><clipPath id="audience-overlap-crypto-clip"><circle cx={geometry.cryptoX} cy="170" r={geometry.cryptoRadius} /></clipPath></defs>
          <circle cx={geometry.bettingX} cy="170" r={geometry.bettingRadius} fill="#2b59ff" fillOpacity=".85" stroke="#f4f1e8" strokeWidth="2" />
          <circle cx={geometry.cryptoX} cy="170" r={geometry.cryptoRadius} fill="#8495bb" fillOpacity=".75" stroke="#f4f1e8" strokeWidth="2" />
          <circle cx={geometry.bettingX} cy="170" r={geometry.bettingRadius} clipPath="url(#audience-overlap-crypto-clip)" fill="#f2b632" />
          <g textAnchor="middle" fill="#f4f1e8">
            <text x="150" y="130" className="pb-overlap__svg-label" fontSize="15" fontWeight="700">{t('Apostadores')}</text>
            <text x="150" y="180" fontSize="50" fontWeight="800">{bet}</text>
            <text x="150" y="204" className="pb-overlap__svg-label" fontSize="14">{t('milhões')}</text>
            <text x="430" y="130" className="pb-overlap__svg-label" fontSize="15" fontWeight="700">{t('Já tiveram cripto')}</text>
            <text x="430" y="180" fontSize="50" fontWeight="800">{cry}</text>
            <text x="430" y="204" className="pb-overlap__svg-label" fontSize="14">{t('milhões')}</text>
          </g>
          <g textAnchor="middle" fill="#070b1f">
            <text x={geometry.overlapX} y="182" fontSize="32" fontWeight="800">{overlap}</text>
            <text x={geometry.overlapX} y="204" className="pb-overlap__svg-label" fontSize="13" fontWeight="700">{t('milhões')}</text>
          </g>
        </svg>
        <figcaption>{t('Valores em milhões de pessoas. Áreas proporcionais ao cenário estimado, não a uma medição real.')}</figcaption>
      </figure>
      <div className="pb-overlap__facts">
        <div className="pb-overlap__total">
          <p className="mono">{t('Alcance combinado, sem duplicados')}</p>
          <p className="display pb-overlap__big">{combined} {t('milhões')}</p>
          <p className="pb-overlap__math">{bet} + {cry} − {overlap} = {combined}</p>
        </div>
        <p><strong>{t('Sobreposição estimada')}: {overlap} {t('milhões')}.</strong> {t('Premissa de independência')}: {bet} {t('milhões')} × {share}% = {overlap} {t('milhões')}.</p>
        <p>{t('É um cenário hipotético, não uma interseção medida nem clientes da BETTEX.')}</p>
        <p>{t('Cripto inclui experiências passadas e público de 16 anos ou mais. O alcance combinado é uma hipótese de escala, não público elegível ou demanda comprovada.')}</p>
        <p>{t('A participação na BETTEX exige 18 anos ou mais. O público inicial são apostadores; quem já conhece cripto é um segmento de familiaridade, não um requisito.')}</p>
      </div>
    </div>
  </section>;
}
