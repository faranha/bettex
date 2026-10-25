import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import './MarketOpportunity.css';
import { AudienceOverlap } from './AudienceOverlap';
import { AudienceAgeProfile } from './AudienceAgeProfile';
import { AudienceFlowChart } from './AudienceFlowChart';
import { audienceScenario } from './audienceScenario';
import { formatCryptoDailyBillions } from './marketFlow';
import { useX } from './pitchCopy';
import { getFormatLocale } from '../../lib/i18n';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function MarketOpportunity() {
  const x = useX();
  const [i, setI] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const x0 = useRef<number | null>(null);
  const cryptoDailyBillions = formatCryptoDailyBillions();
  const share = (audienceScenario.cryptoShare * 100).toLocaleString(getFormatLocale(), { maximumFractionDigits: 1 });
  const src = (href: string, label: string) => <a className="mk-src" href={href} target="_blank" rel="noopener noreferrer">{label}<ExternalLink aria-hidden="true" /></a>;

  const slides: { title: string; node: ReactNode }[] = [
    { title: x('Apostas', 'Betting', 'Apuestas'), node: <div className="mk-grid">
      <div className="mk-offer">
        <p className="mk-eyebrow">{x('Público potencial · apostas', 'Potential audience · betting', 'Público potencial · apuestas')}</p>
        <p className="mk-big" data-testid="audience-betting-value"><span aria-hidden="true">≈ </span><strong>{audienceScenario.bettingMillions}</strong><span className="mk-unit">{x('milhões', 'million', 'millones')}</span></p>
        <h3 className="mk-h">{x('de apostadores brasileiros', 'Brazilian bettors', 'de apostadores brasileños')}</h3>
        <p className="mk-rhythm">{x('Estimativa de mercado, não uma contagem oficial.', 'A market estimate, not an official count.', 'Estimación de mercado, no un recuento oficial.')}</p>
        <p className="mk-p">{x('Cenário da BETTEX para a escala do público de apostas no Brasil, considerando diferentes tipos de plataformas.', 'BETTEX scenario for the scale of the betting audience in Brazil, across different types of platforms.', 'Escenario de BETTEX para la escala del público de apuestas en Brasil, considerando distintos tipos de plataformas.')}</p>
        {src(audienceScenario.bettingSourceUrl, x('Apostas: Fazenda / SIGAP, via Folha · set. 2026', 'Betting: Ministry of Finance / SIGAP, via Folha · Sep. 2026', 'Apuestas: Hacienda / SIGAP, vía Folha · sep. 2026'))}
      </div>
      <figure className="mk-stage"><img src={`${BASE}/pitch-illustrations/pitch-brazil-community.webp`} alt={x('Ilustração de uma comunidade brasileira conectada', 'Illustration of a connected Brazilian community', 'Ilustración de una comunidad brasileña conectada')} loading="lazy" decoding="async" /></figure>
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
      <div className="mk-stage mk-stage--ink">
        <p className="mk-share display">{share}%</p>
        <div className="mk-share__bar" role="img" aria-label={x(`${share}% do público pesquisado`, `${share}% of the surveyed audience`, `${share}% del público encuestado`)}><span style={{ width: `${audienceScenario.cryptoShare * 100}%` }} /></div>
        <p className="mk-share__cap">{x('do público pesquisado tem ou já teve dinheiro em cripto', 'of the surveyed audience has or once had money in crypto', 'del público encuestado tiene o ha tenido dinero en cripto')}</p>
      </div>
    </div> },
    { title: x('Volume diário', 'Daily volume', 'Volumen diario'), node: <div className="mk-grid mk-grid--chart">
      <div className="mk-offer">
        <p className="mk-eyebrow">{x('Movimentação diária · cripto', 'Daily flow · crypto', 'Movimiento diario · cripto')}</p>
        <p className="mk-big" data-testid="audience-money-value"><strong>R$ {cryptoDailyBillions}</strong></p>
        <h3 className="mk-h">{x('bilhão por dia, aproximadamente', 'billion per day, approximately', 'mil millones por día, aproximadamente')}</h3>
        <p className="mk-rhythm">{x('Volume bruto de operações, não receita da BETTEX.', 'Gross operations volume, not BETTEX revenue.', 'Volumen bruto de operaciones, no ingreso de BETTEX.')}</p>
        <p className="mk-p">{x('R$ 283 bilhões em operações no primeiro semestre de 2026. Inclui negociações, stablecoins e operações empresariais.', 'R$283 billion in operations in the first half of 2026. Includes trading, stablecoins and corporate operations.', 'R$283 mil millones en operaciones en el primer semestre de 2026. Incluye negociaciones, stablecoins y operaciones empresariales.')}</p>
      </div>
      <AudienceFlowChart />
    </div> },
    { title: x('Interseção', 'Overlap', 'Intersección'), node: <AudienceOverlap /> },
    { title: x('Faixa etária', 'Age profile', 'Franja de edad'), node: <AudienceAgeProfile /> },
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
        {slides.map((s, k) => <div key={k} className="mk-slide" data-slide-index={k} hidden={k !== i} role="group" aria-roledescription={x('Slide', 'Slide', 'Diapositiva')} aria-label={`${k + 1} / ${n}`}>{s.node}</div>)}
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
    <div className="mk-note">
      <p><strong>{x('Já existe público. Já existe volume financeiro.', 'The audience exists. The financial volume exists.', 'Ya existe público. Ya existe volumen financiero.')}</strong> {x('Público potencial não é uma base de compradores validada, e a movimentação do mercado não é receita da BETTEX.', 'Potential audience is not a validated buyer base, and market flow is not BETTEX revenue.', 'El público potencial no es una base de compradores validada, y el movimiento del mercado no es ingreso de BETTEX.')}</p>
      <details>
        <summary>{x('Ler a ressalva completa', 'Read the full caveat', 'Leer la salvedad completa')}</summary>
        <p>{x('É esse público que a BETTEX busca alcançar com uma proposta de investimento, não de aposta: experiência familiar, custos claros e risco de perda explícito. Os dados a seguir mostram sua escala e o volume financeiro envolvido.', 'This is the audience BETTEX aims to reach with an investment proposal, not a betting product: a familiar experience, clear costs and explicit risk of loss. The data below shows its scale and the financial volume involved.', 'Es el público al que BETTEX busca llegar con una propuesta de inversión, no de apuestas: una experiencia familiar, costes claros y riesgo de pérdida explícito. Los datos siguientes muestran su escala y el volumen financiero involucrado.')}</p>
        <p>{x('A BETTEX pretende alcançar apostadores brasileiros e pessoas com experiência em cripto. O público central estimado é um núcleo de afinidade, não o limite de atuação do produto. Público potencial não é uma base de compradores validada. Movimentação do mercado não é receita da BETTEX. Converter parte desse público em participantes e usuários recorrentes é uma hipótese comercial a validar.', 'BETTEX aims to reach Brazilian bettors and people with crypto experience. The estimated core audience is an affinity nucleus, not the limit of the product’s reach. Potential audience is not a validated buyer base. Market flow is not BETTEX revenue. Converting part of this audience into participants and recurring users is a commercial hypothesis to be validated.', 'BETTEX pretende alcanzar a apostadores brasileños y a personas con experiencia en cripto. El público central estimado es un núcleo de afinidad, no el límite de actuación del producto. El público potencial no es una base de compradores validada. El movimiento del mercado no es ingreso de BETTEX. Convertir parte de ese público en participantes y usuarios recurrentes es una hipótesis comercial por validar.')}</p>
      </details>
    </div>
  </div>;
}
