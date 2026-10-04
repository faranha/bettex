import { UsersRound } from 'lucide-react';
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
  const title = t('Públicos potenciais e público central');
  const desc = `${t('Público potencial de apostadores')}: ${bet} ${t('milhões')}. ${t('Público potencial com experiência em cripto')}: ${cry} ${t('milhões')}. ${t('Público central estimado')}: ${overlap} ${t('milhões')}. ${t('Alcance potencial combinado, sem duplicados')}: ${combined} ${t('milhões')}.`;
  return <section className="pb-overlap" id="audience-overlap" data-testid="audience-overlap" aria-labelledby="audience-overlap-title">
    <p className="mono pb-overlap__kicker">{t('Cenário hipotético · não é medição')}</p>
    <h3 className="display" id="audience-overlap-title">{title}</h3>
    <div className="pb-overlap__body">
      <figure className="pb-overlap__figure">
        <div className="pb-overlap__legend">
          <span className="pb-overlap__legend-bet">{t('Apostadores · público potencial')}</span>
          <span className="pb-overlap__legend-crypto">{t('Cripto · público potencial')}</span>
          <span className="pb-overlap__legend-intersection">{t('Público central estimado')}</span>
        </div>
        <svg className="pb-overlap__diagram" viewBox="0 0 560 390" role="img" aria-labelledby="audience-overlap-svg-title audience-overlap-svg-desc">
          <title id="audience-overlap-svg-title">{title}</title>
          <desc id="audience-overlap-svg-desc" data-i18n="translated">{desc}</desc>
          <defs><clipPath id="audience-overlap-crypto-clip"><circle cx={geometry.cryptoX} cy="210" r={geometry.cryptoRadius} /></clipPath></defs>
          <circle cx={geometry.bettingX} cy="210" r={geometry.bettingRadius} fill="#2b59ff" fillOpacity=".85" stroke="#f4f1e8" strokeWidth="2" />
          <circle cx={geometry.cryptoX} cy="210" r={geometry.cryptoRadius} fill="#8495bb" fillOpacity=".75" stroke="#f4f1e8" strokeWidth="2" />
          <circle cx={geometry.bettingX} cy="210" r={geometry.bettingRadius} clipPath="url(#audience-overlap-crypto-clip)" fill="#f2b632" />
          <g textAnchor="middle" fill="#f2b632">
            <text x={geometry.overlapX} y="28" className="pb-overlap__svg-core" fontSize="15" fontWeight="700">{t('Público central estimado')}</text>
            <path d={`M${geometry.overlapX} 40V155`} fill="none" stroke="#f2b632" strokeWidth="1.5" />
          </g>
          <g textAnchor="middle" fill="#f4f1e8" data-testid="audience-betting-labels">
            <UsersRound x={geometry.bettingX - 17} y="96" width="34" height="34" stroke="#f4f1e8" aria-hidden="true" />
            <text x={geometry.bettingX} y="154" className="pb-overlap__svg-role" fontSize="13" fontWeight="600">{t('Público potencial')}</text>
            <text x={geometry.bettingX} y="154" className="pb-overlap__svg-role-compact" fontSize="19" fontWeight="600">{t('Potencial')}</text>
            <text x={geometry.bettingX} y="181" className="pb-overlap__svg-label" fontSize="15" fontWeight="700">{t('Apostadores')}</text>
            <text x={geometry.bettingX} y="250" fontSize="50" fontWeight="800">{bet}</text>
            <text x={geometry.bettingX} y="275" className="pb-overlap__svg-unit" fontSize="14">{t('milhões')}</text>
          </g>
          <g textAnchor="middle" fill="#f4f1e8" data-testid="audience-crypto-labels">
            <UsersRound x={geometry.cryptoX - 17} y="96" width="34" height="34" stroke="#f4f1e8" aria-hidden="true" />
            <text x={geometry.cryptoX} y="154" className="pb-overlap__svg-role" fontSize="13" fontWeight="600">{t('Público potencial')}</text>
            <text x={geometry.cryptoX} y="154" className="pb-overlap__svg-role-compact" fontSize="19" fontWeight="600">{t('Potencial')}</text>
            <text x={geometry.cryptoX} y="181" className="pb-overlap__svg-label" fontSize="15" fontWeight="700">{t('Já tiveram')}</text>
            <text x={geometry.cryptoX} y="200" className="pb-overlap__svg-label" fontSize="15" fontWeight="700">{t('cripto')}</text>
            <text x={geometry.cryptoX} y="250" fontSize="50" fontWeight="800">{cry}</text>
            <text x={geometry.cryptoX} y="275" className="pb-overlap__svg-unit" fontSize="14">{t('milhões')}</text>
          </g>
          <g textAnchor="middle" fill="#070b1f">
            <text x={geometry.overlapX} y="245" fontSize="32" fontWeight="800">{overlap}</text>
            <text x={geometry.overlapX} y="268" className="pb-overlap__svg-unit pb-overlap__svg-overlap-unit" fontSize="13" fontWeight="700">{t('milhões')}</text>
          </g>
        </svg>
        <figcaption>{t('Valores em milhões de pessoas. Áreas proporcionais ao cenário estimado, não a uma medição real.')}</figcaption>
      </figure>
      <div className="pb-overlap__facts">
        <div className="pb-overlap__total">
          <p className="mono">{t('Alcance potencial combinado, sem duplicados')}</p>
          <p className="display pb-overlap__big">{combined} {t('milhões')}</p>
          <p className="pb-overlap__math">{bet} + {cry} − {overlap} = {combined}</p>
        </div>
        <p><strong>{t('Público central estimado')}: {overlap} {t('milhões')}.</strong> {t('O núcleo reúne, neste cenário, apostadores com experiência em cripto.')}</p>
        <p className="pb-overlap__scope">{t('A BETTEX pretende alcançar os dois públicos potenciais, não apenas sua interseção. O público central não limita o alcance do produto.')}</p>
        <p>{t('Premissa de independência')}: {bet} {t('milhões')} × {share}% = {overlap} {t('milhões')}.</p>
        <p>{t('É um cenário hipotético, não uma interseção medida nem clientes da BETTEX.')}</p>
        <p>{t('Cripto inclui experiências passadas e público de 16 anos ou mais. O alcance combinado é uma hipótese de escala, não público elegível ou demanda comprovada.')}</p>
        <p>{t('A participação na BETTEX exige 18 anos ou mais. Experiência em apostas ou cripto não é requisito para usar o produto.')}</p>
      </div>
    </div>
  </section>;
}
