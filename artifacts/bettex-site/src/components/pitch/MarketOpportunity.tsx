import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ArrowLeftRight, Bitcoin, Blend, ExternalLink, UsersRound } from 'lucide-react';
import './MarketOpportunity.css';
import { AudienceFlowChart, BETS_URL } from './AudienceFlowChart';
import { audienceGeometry as G, audienceScenario } from './audienceScenario';
import { formatCryptoDailyBillions, marketFlow } from './marketFlow';
import { useX } from './pitchCopy';
import { getFormatLocale } from '../../lib/i18n';

const BETTING_AGE_SOURCE = 'https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas/apresentacoes/defeso-2deg-panorama-semestral-de-apostas-de-quota-fixa-jan-2026.pdf';
const CRYPTO_AGE_SOURCE = 'https://valorinveste.globo.com/mercados/cripto/noticia/2026/08/18/cripto-ja-e-conhecida-por-2-em-cada-3-brasileiros-mas-so-8percent-investem.ghtml';
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function MarketOpportunity() {
  const x = useX();
  const [i, setI] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const x0 = useRef<number | null>(null);
  const cryptoDailyBillions = formatCryptoDailyBillions();
  const share = (audienceScenario.cryptoShare * 100).toLocaleString(getFormatLocale(), { maximumFractionDigits: 1 });
  const fmt1 = (n: number) => n.toLocaleString(getFormatLocale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const overlap = fmt1(audienceScenario.overlapMillions);
  const mil = x('milhões', 'million', 'millones');
  const src = (href: string, label: string) => <a className="mk-src" href={href} target="_blank" rel="noopener noreferrer">{label}<ExternalLink aria-hidden="true" /></a>;

  const slides: { title: string; node: ReactNode }[] = [
    { title: x('Apostas', 'Betting', 'Apuestas'), node: <div className="mk-grid">
      <div className="mk-audience-intro">
      <div className="mk-offer">
        <p className="mk-eyebrow">{x('Público potencial · apostas', 'Potential audience · betting', 'Público potencial · apuestas')}</p>
        <p className="mk-big" data-testid="audience-betting-value"><span aria-hidden="true">≈ </span><strong>{audienceScenario.bettingMillions}</strong><span className="mk-unit">{x('milhões', 'million', 'millones')}</span></p>
        <h3 className="mk-h">{x('de apostadores brasileiros', 'Brazilian bettors', 'de apostadores brasileños')}</h3>
        <p className="mk-rhythm">{x('Estimativa de mercado, não uma contagem oficial.', 'A market estimate, not an official count.', 'Estimación de mercado, no un recuento oficial.')}</p>
        <p className="mk-p">{x('Cenário da BETTEX para a escala do público de apostas no Brasil, considerando diferentes tipos de plataformas.', 'BETTEX scenario for the scale of the betting audience in Brazil, across different types of platforms.', 'Escenario de BETTEX para la escala del público de apuestas en Brasil, considerando distintos tipos de plataformas.')}</p>
        {src(audienceScenario.bettingSourceUrl, x('Apostas: Fazenda / SIGAP, via Folha · set. 2026', 'Betting: Ministry of Finance / SIGAP, via Folha · Sep. 2026', 'Apuestas: Hacienda / SIGAP, vía Folha · sep. 2026'))}
      </div>
      </div>
      <figure className="mk-stage"><img src={`${BASE}/pitch-illustrations/pitch-brazil-community.webp`} alt={x('Ilustração de uma comunidade brasileira conectada', 'Illustration of a connected Brazilian community', 'Ilustración de una comunidad brasileña conectada')} width={1024} height={1024} loading="lazy" decoding="async" /></figure>
    </div> },
    { title: x('Cripto', 'Crypto', 'Cripto'), node: <div className="mk-grid">
      <div className="mk-offer">
        <p className="mk-eyebrow">{x('Público potencial · cripto', 'Potential audience · crypto', 'Público potencial · cripto')}</p>
        <p className="mk-big" data-testid="audience-crypto-value"><span aria-hidden="true">≈ </span><strong>{audienceScenario.cryptoMillions}</strong><span className="mk-unit">{x('milhões', 'million', 'millones')}</span></p>
        <h3 className="mk-h">{x('têm ou já tiveram cripto', 'have or once had crypto', 'tienen o han tenido cripto')}</h3>
        <p className="mk-rhythm">{x('Inclui experiências passadas, não só quem possui hoje.', 'Includes past experience, not only current holders.', 'Incluye experiencias pasadas, no solo a quien posee hoy.')}</p>
        <p className="mk-p">{x(`${share}% dos brasileiros no público pesquisado dizem ter ou já ter tido dinheiro em criptomoedas.`, `${share}% of Brazilians in the surveyed audience say they have or once had money in cryptocurrencies.`, `${share}% de los brasileños en el público encuestado dicen tener o haber tenido dinero en criptomonedas.`)}</p>
        {src(audienceScenario.cryptoSourceUrl, x('Datafolha / Paradigma · publicado em ago. 2026', 'Datafolha / Paradigma · published Aug. 2026', 'Datafolha / Paradigma · publicado en ago. 2026'))}
      </div>
      <div className="mk-stage mk-stage--ink mk-stage--crypto">
        <span className="mk-share__icon" aria-hidden="true"><Bitcoin size={32} strokeWidth={1.7} /></span>
        <p className="mk-share display">{share}%</p>
        <div className="mk-share__bar" role="img" aria-label={x(`${share}% do público pesquisado`, `${share}% of the surveyed audience`, `${share}% del público encuestado`)}><span style={{ width: `${audienceScenario.cryptoShare * 100}%` }} /></div>
        <p className="mk-share__cap">{x('do público pesquisado tem ou já teve dinheiro em cripto', 'of the surveyed audience has or once had money in crypto', 'del público encuestado tiene o ha tenido dinero en cripto')}</p>
      </div>
    </div> },
    { title: x('Volume diário', 'Daily volume', 'Volumen diario'), node: <div className="mk-grid" id="audience-daily-volume">
      <div className="mk-offer">
        <p className="mk-eyebrow">{x('Movimentação diária · cripto', 'Daily flow · crypto', 'Movimiento diario · cripto')}</p>
        <p className="mk-big" data-testid="audience-money-value"><strong>R$ {cryptoDailyBillions}</strong></p>
        <h3 className="mk-h">{x('bilhão por dia, em média', 'billion per day, on average', 'mil millones por día, en promedio')}</h3>
        <p className="mk-rhythm">{x('Volume bruto de operações, não receita da BETTEX.', 'Gross operations volume, not BETTEX revenue.', 'Volumen bruto de operaciones, no ingreso de BETTEX.')}</p>
        <p className="mk-p">{x('Cripto: média do 1º semestre de 2026. Bets: depósitos históricos. São volumes distintos, não somáveis.', 'Crypto: H1 2026 average. Betting: historical deposits. Distinct volumes, not to be added together.', 'Cripto: promedio del 1.er semestre de 2026. Apuestas: depósitos históricos. Volúmenes distintos, no sumables.')}</p>
        <details className="mk-method">
          <summary>{x('Base e metodologia', 'Data and methodology', 'Datos y metodología')}</summary>
          <div className="mk-method__content">
            <p>{x('R$ 283 bilhões em 181 dias do 1º semestre de 2026, com negociações, stablecoins e operações empresariais. Bets: cerca de R$ 600 milhões por dia em depósitos, referência histórica anterior à proibição de setembro de 2026. Medidas distintas, que não se somam.', 'R$283 billion over 181 days of H1 2026, including trading, stablecoins and corporate operations. Bets: about R$600 million per day in deposits, a historical reference before the September 2026 ban. Distinct measures that do not add up.', 'R$283 mil millones en 181 días del 1.er semestre de 2026, con negociaciones, stablecoins y operaciones empresariales. Bets: cerca de R$600 millones por día en depósitos, referencia histórica anterior a la prohibición de septiembre de 2026. Medidas distintas que no se suman.')}</p>
          </div>
        </details>
        <div className="mk-srcs">
          {src(marketFlow.cryptoSourceUrl, x('Receita Federal / Valor Investe · set. 2026', 'Federal Revenue / Valor Investe · Sep. 2026', 'Receita Federal / Valor Investe · sep. 2026'))}
          {src(BETS_URL, x('Fazenda / MJSP, 2 out. 2026', 'Ministry of Finance / MJSP, Oct. 2, 2026', 'Hacienda / MJSP, 2 oct. 2026'))}
        </div>
      </div>
      <div className="mk-stage mk-stage--ink mk-stage--chart mk-stage--icon">
        <span className="mk-share__icon" aria-hidden="true"><ArrowLeftRight size={28} strokeWidth={1.7} /></span>
        <p className="mk-stage__cap mono">{x('R$ bilhões por dia, em média', 'R$ billions per day, on average', 'miles de millones de R$ por día, en promedio')}</p>
        <AudienceFlowChart />
      </div>
    </div> },
    { title: x('Interseção', 'Overlap', 'Intersección'), node: <div className="mk-grid" id="audience-overlap" data-testid="audience-overlap" role="group" aria-labelledby="audience-overlap-title">
      <div className="mk-offer">
        <p className="mk-eyebrow">{x('Cenário hipotético · não é medição', 'Hypothetical scenario · not a measurement', 'Escenario hipotético · no es medición')}</p>
        <p className="mk-big" data-testid="audience-core-value"><span aria-hidden="true">≈ </span><strong>{overlap}</strong><span className="mk-unit">{mil}</span></p>
        <h3 className="mk-h" id="audience-overlap-title">{x('público central estimado', 'estimated core audience', 'público central estimado')}</h3>
        <p className="mk-rhythm">{x(`Premissa de independência: ${audienceScenario.bettingMillions} milhões × ${share}% = ${overlap} milhões.`, `Independence assumption: ${audienceScenario.bettingMillions} million × ${share}% = ${overlap} million.`, `Premisa de independencia: ${audienceScenario.bettingMillions} millones × ${share}% = ${overlap} millones.`)}</p>
        <p className="mk-p">{x('O núcleo reúne, neste cenário, apostadores com experiência em cripto. É um núcleo de afinidade, não o limite de atuação do produto.', 'In this scenario the core brings together bettors with crypto experience. It is an affinity nucleus, not the limit of the product’s reach.', 'En este escenario, el núcleo reúne a apostadores con experiencia en cripto. Es un núcleo de afinidad, no el límite de actuación del producto.')}</p>
        <div className="mk-srcs">
          {src(audienceScenario.bettingSourceUrl, x('Apostas: Fazenda / SIGAP, via Folha · set. 2026', 'Betting: Ministry of Finance / SIGAP, via Folha · Sep. 2026', 'Apuestas: Hacienda / SIGAP, vía Folha · sep. 2026'))}
          {src(audienceScenario.cryptoSourceUrl, x('Datafolha / Paradigma · publicado em ago. 2026', 'Datafolha / Paradigma · published Aug. 2026', 'Datafolha / Paradigma · publicado en ago. 2026'))}
        </div>
      </div>
      <div className="mk-stage mk-stage--ink mk-stage--icon">
        <span className="mk-share__icon" aria-hidden="true"><Blend size={28} strokeWidth={1.7} /></span>
        <svg className="mk-venn" viewBox={`0 0 ${Math.round(G.cryptoX + G.cryptoRadius + 20)} 350`} role="img" aria-label={x(`Círculos proporcionais: ${audienceScenario.bettingMillions} milhões de apostadores, ${audienceScenario.cryptoMillions} milhões com cripto e ${overlap} milhões na interseção hipotética`, `Proportional circles: ${audienceScenario.bettingMillions} million bettors, ${audienceScenario.cryptoMillions} million with crypto and ${overlap} million in the hypothetical overlap`, `Círculos proporcionales: ${audienceScenario.bettingMillions} millones de apostadores, ${audienceScenario.cryptoMillions} millones con cripto y ${overlap} millones en la intersección hipotética`)}>
          <defs><clipPath id="mk-clip-bet"><circle cx={G.bettingX} cy={175} r={G.bettingRadius} /></clipPath></defs>
          <circle cx={G.bettingX} cy={175} r={G.bettingRadius} fill="#2B59FF" fillOpacity=".75" />
          <circle cx={G.cryptoX} cy={175} r={G.cryptoRadius} fill="#F4F1E8" fillOpacity=".8" />
          <circle cx={G.cryptoX} cy={175} r={G.cryptoRadius} fill="#F2B632" clipPath="url(#mk-clip-bet)" />
          <text x={G.bettingX - 55} y={170} textAnchor="middle" fill="#F4F1E8" fontSize="30" fontWeight="800">{audienceScenario.bettingMillions}</text>
          <text x={G.bettingX - 55} y={196} textAnchor="middle" fill="#F4F1E8" fontSize="15">{x('apostas', 'betting', 'apuestas')}</text>
          <text x={G.cryptoX + 50} y={170} textAnchor="middle" fill="#070B1F" fontSize="30" fontWeight="800">{audienceScenario.cryptoMillions}</text>
          <text x={G.cryptoX + 50} y={196} textAnchor="middle" fill="#070B1F" fontSize="15">{x('cripto', 'crypto', 'cripto')}</text>
        </svg>
        <p className="mk-stage__cap mono">{x(`Interseção ${overlap} milhões (dourado)`, `Overlap ${overlap} million (gold)`, `Intersección ${overlap} millones (dorado)`)}</p>
      </div>
    </div> },
    { title: x('Faixa etária', 'Age profile', 'Franja de edad'), node: <div className="mk-grid" id="publico-faixa-etaria" role="group" aria-labelledby="publico-faixa-etaria-t">
      <div className="mk-offer">
        <p className="mk-eyebrow">{x('Apostas · maioria do público', 'Betting · most of the audience', 'Apuestas · mayoría del público')}</p>
        <p className="mk-big" data-testid="audience-age-value"><strong>25–40</strong><span className="mk-unit">{x('anos', 'years', 'años')}</span></p>
        <h3 className="mk-h" id="publico-faixa-etaria-t">{x('Faixas etárias: apostas e cripto', 'Age bands: betting and crypto', 'Franjas de edad: apuestas y cripto')}</h3>
        <p className="mk-rhythm">{x('Denominadores diferentes: não são o mesmo perfil.', 'Different denominators: not the same profile.', 'Denominadores distintos: no son el mismo perfil.')}</p>
        <p className="mk-p">{x('Apostas: 51,3% dos apostadores do mercado regulado em 2025 (22,7% entre 25 e 30 anos; 28,6% entre 31 e 40). Cripto: 32% das pessoas de 16 a 24 anos têm ou já tiveram criptomoedas, em 2026.', 'Betting: 51.3% of regulated-market bettors in 2025 (22.7% aged 25–30; 28.6% aged 31–40). Crypto: 32% of people aged 16–24 have or once had cryptocurrencies, in 2026.', 'Apuestas: 51,3% de los apostadores del mercado regulado en 2025 (22,7% entre 25 y 30 años; 28,6% entre 31 y 40). Cripto: 32% de las personas de 16 a 24 años tienen o han tenido criptomonedas, en 2026.')}</p>
        <div className="mk-srcs">
          {src(BETTING_AGE_SOURCE, x('Fazenda / SIGAP · dados de 2025, publicado em jan. 2026', 'Ministry of Finance / SIGAP · 2025 data, published Jan. 2026', 'Hacienda / SIGAP · datos de 2025, publicado en ene. 2026'))}
          {src(CRYPTO_AGE_SOURCE, x('Datafolha / Paradigma · Valor Investe, ago. 2026', 'Datafolha / Paradigma · Valor Investe, Aug. 2026', 'Datafolha / Paradigma · Valor Investe, ago. 2026'))}
        </div>
      </div>
      <div className="mk-stage mk-stage--ink mk-stage--bars mk-stage--icon">
        <span className="mk-share__icon" aria-hidden="true"><UsersRound size={28} strokeWidth={1.7} /></span>
        <div className="mk-bar"><p><b>{x('51,3%', '51.3%', '51,3%')}</b> {x('dos apostadores regulados, 25–40 anos', 'of regulated bettors, aged 25–40', 'de los apostadores regulados, 25–40 años')}</p>
          <div className="mk-share__bar" role="img" aria-label={x('51,3% dos apostadores regulados em 2025 têm 25 a 40 anos', '51.3% of regulated bettors in 2025 are aged 25 to 40', 'El 51,3% de los apostadores regulados en 2025 tiene de 25 a 40 años')}><span style={{ width: '22.7%' }} /><span className="mk-seg2" style={{ width: '28.6%' }} /></div>
          <small>{x('22,7% (25–30) + 28,6% (31–40)', '22.7% (25–30) + 28.6% (31–40)', '22,7% (25–30) + 28,6% (31–40)')}</small></div>
        <div className="mk-bar"><p><b>32%</b> {x('das pessoas de 16–24 anos já tiveram cripto', 'of people aged 16–24 ever held crypto', 'de las personas de 16–24 años han tenido cripto')}</p>
          <div className="mk-share__bar" role="img" aria-label={x('32% das pessoas de 16 a 24 anos têm ou já tiveram cripto, em 2026', '32% of people aged 16 to 24 have or once had crypto, in 2026', 'El 32% de las personas de 16 a 24 años tiene o ha tenido cripto, en 2026')}><span className="mk-seg3" style={{ width: '32%' }} /></div>
          <small>{x('Dentro da faixa etária, 2026', 'Within the age band, 2026', 'Dentro de la franja de edad, 2026')}</small></div>
      </div>
    </div> },
  ];

  const n = slides.length;
  const go = (k: number) => setI((k + n) % n);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
  };
  const down = (e: PointerEvent) => { x0.current = e.clientX; };
  const up = (e: PointerEvent) => {
    if (x0.current === null) return;
    const d = e.clientX - x0.current; x0.current = null;
    if (Math.abs(d) > 64) go(i + (d < 0 ? 1 : -1));
  };

  // Reveal a hidden slide when its inner anchor is targeted.
  useEffect(() => {
    const reveal = () => {
      const target = document.getElementById(window.location.hash.slice(1));
      const panel = target && root.current?.contains(target) ? target.closest<HTMLElement>('[data-slide-index]') : null;
      if (panel) { setI(Number(panel.dataset.slideIndex)); requestAnimationFrame(() => target?.scrollIntoView({ block: 'start', behavior: 'instant' })); }
    };
    const onClick = (e: MouseEvent) => { if (e.target instanceof Element && e.target.closest('a[href^="#"]')) setTimeout(reveal, 0); };
    reveal();
    window.addEventListener('hashchange', reveal);
    document.addEventListener('click', onClick);
    return () => { window.removeEventListener('hashchange', reveal); document.removeEventListener('click', onClick); };
  }, []);

  return <div className="pb-market mk" ref={root}>
    <div id="publico-mercado-slider" role="region" aria-roledescription={x('Carrossel', 'Carousel', 'Carrusel')} aria-label={x('Público e mercado em blocos', 'Audience and market blocks', 'Público y mercado por bloques')} onKeyDown={onKey} data-testid="carousel-audience" data-active-slide={i + 1}>
      <div className="mk-track" onPointerDown={down} onPointerUp={up} onPointerCancel={() => { x0.current = null; }}>
        {slides.map((s, k) => <div key={k} className="mk-slide" data-slide-index={k} data-active={k === i} aria-hidden={k !== i} inert={k !== i} role="group" aria-roledescription={x('Slide', 'Slide', 'Diapositiva')} aria-label={`${k + 1} / ${n}`}>{s.node}</div>)}
      </div>
      <div className="mk-ctrl">
        <button type="button" className="mk-nav mk-nav--prev" onClick={() => go(i - 1)} data-testid="button-audience-prev">
          <ArrowLeft size={20} aria-hidden="true" />
          <span className="mk-nav-copy"><span className="mk-nav-dir">{x('Anterior', 'Previous', 'Anterior')}</span><span>{slides[(i + n - 1) % n].title}</span></span>
        </button>
        <div className="mk-dots">
          {slides.map((s, k) => <button key={k} type="button" className="mk-dot" data-i18n="translated" aria-label={`${k + 1} / ${n}: ${s.title}`} aria-current={i === k} data-active={i === k} onClick={() => go(k)} data-testid={`button-audience-slide-${k + 1}`} />)}
        </div>
        <button type="button" className="mk-nav mk-nav--next" onClick={() => go(i + 1)} data-testid="button-audience-next">
          <span className="mk-nav-copy"><span className="mk-nav-dir">{x('Próximo', 'Next', 'Siguiente')}</span><span>{slides[(i + 1) % n].title}</span></span>
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>;
}
