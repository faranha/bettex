/** @jsxImportSource react */
import { useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BettexMark } from '@/components/BettexMark';
import { PhoneScreen } from '@/components/investor/PhoneScreens';
import type { ScreenId } from '@/components/investor/presentationData';
import { TELEGRAM_COMMUNITY_URL } from '@/lib/community';
import '@/components/investor/InvestorAppPreview.css';
import { useX } from './ui';
import './PublicDemoPage.css';

const screens: { id: ScreenId; label: [string, string, string]; title: [string, string, string]; text: [string, string, string] }[] = [
  { id: 'participacao', label: ['Participação', 'Participation', 'Participación'],
    title: ['Sua carteira BETTEX.', 'Your BETTEX wallet.', 'Tu cartera BETTEX.'],
    text: ['Seus tokens, sua participação automática e seus resultados em USDC, com valor estimado em moeda local.', 'Your tokens, your automatic participation and your results in USDC, with an estimated local-currency value.', 'Tus tokens, tu participación automática y tus resultados en USDC, con valor estimado en moneda local.'] },
  { id: 'bettex', label: ['Operações', 'Operations', 'Operaciones'],
    title: ['A IA em operação.', 'AI at work.', 'La IA en operación.'],
    text: ['Acompanhe como os agentes da BETTEX operam surebet, bônus, cripto à vista e previsões.', 'See how BETTEX agents handle surebets, bonuses, spot crypto and predictions.', 'Mira cómo los agentes de BETTEX operan surebet, bonos, cripto spot y predicciones.'] },
  { id: 'resultados', label: ['Resultados', 'Results', 'Resultados'],
    title: ['Resultados por mercado.', 'Results by market.', 'Resultados por mercado.'],
    text: ['Compare ganhos, perdas e resultado líquido nos quatro mercados.', 'Compare gains, losses and net result across the four markets.', 'Compara ganancias, pérdidas y resultado neto en los cuatro mercados.'] },
  { id: 'historico', label: ['Histórico', 'History', 'Historial'],
    title: ['Histórico por mercado.', 'History by market.', 'Historial por mercado.'],
    text: ['Escolha um mercado e veja o gráfico e os dias de ganho e de perda.', 'Pick a market to see its chart and the days of gain and loss.', 'Elige un mercado y mira su gráfico y los días de ganancia y pérdida.'] },
];

export function PublicDemoPage() {
  const { x, loc } = useX();
  const [i, setI] = useState(0);
  const touch = useRef<number | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = screens.length;
  const idx = loc === 'pt' ? 0 : loc === 'en' ? 1 : 2;
  const s = screens[i];
  const go = (k: number) => setI((k + n) % n);
  const onKey = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('input, textarea, select')) return;
    const next = e.key === 'ArrowRight' ? (i + 1) % n
      : e.key === 'ArrowLeft' ? (i + n - 1) % n
      : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null;
    if (next === null) return;
    e.preventDefault();
    go(next);
    if (target.closest('[role="tablist"]')) tabs.current[next]?.focus();
  };
  const onEnd = (e: TouchEvent) => {
    if (touch.current === null) return;
    const d = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (Math.abs(d) > 50) go(i + (d < 0 ? 1 : -1));
  };
  const docs = x('/documentacao', '/documentation', '/documentacion');
  const illustrative = x('Prévia ilustrativa. Valores de exemplo, sem retorno real ou garantido.', 'Illustrative preview. Example values, no real or guaranteed returns.', 'Vista ilustrativa. Valores de ejemplo, sin retorno real ni garantizado.');
  const arrow = 'inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#13204F] text-[#F4F1E8] hover:bg-[#0a1c4d] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#F2B632]';

  return <main className="demo-root investor-preview public-app-landing min-h-[calc(100dvh-var(--site-header-h))]" data-testid="public-demo">
    <div className="investor-preview__wrap">
      <header className="investor-preview__intro">
        <p className="investor-preview__eyebrow">{x('Em desenvolvimento', 'Under development', 'En desarrollo')} · {x('Em breve', 'Coming soon', 'Próximamente')}</p>
        <h1 className="investor-preview__title">
          {x('O app BETTEX', 'The BETTEX app', 'La app BETTEX')} <em>{x('está a caminho.', 'is on its way.', 'está en camino.')}</em>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#13204F]">
          {x('Tecnologia para apostadores brasileiros usarem operações assistidas por IA e participarem pelo token BETTEX. O app ainda está em desenvolvimento; estas telas mostram o que estamos construindo.',
            'Technology for Brazilian bettors to use AI-assisted operations and take part through the BETTEX token. The app is still under development; these screens show what we are building.',
            'Tecnología para apostadores brasileños que usan operaciones asistidas por IA y participan mediante el token BETTEX. La app sigue en desarrollo; estas pantallas muestran lo que estamos construyendo.')}
        </p>
      </header>

      <section className="ip-stage" aria-roledescription="carousel" aria-label={x('Telas do app em desenvolvimento', 'Screens of the app in development', 'Pantallas de la app en desarrollo')} onKeyDown={onKey} data-testid="public-app-slider">
        <div className="ip-side">
          <div className="ip-nav">
            <div role="tablist" aria-label={x('Escolher tela', 'Choose screen', 'Elegir pantalla')} className="ip-group__items">
              {screens.map((t, k) => <button key={t.id} ref={el => { tabs.current[k] = el; }} type="button" role="tab" id={`pa-tab-${t.id}`} aria-selected={i === k} aria-controls="pa-panel" tabIndex={i === k ? 0 : -1}
                className="ip-tab" onClick={() => setI(k)} data-testid={`tab-screen-${t.id}`}>{t.label[idx]}</button>)}
            </div>
          </div>
          <div className="ip-copy" aria-live="polite">
            <p className="ip-group__label" style={{ color: '#F2B632' }}>{i + 1} / {n} · {x('Em breve', 'Coming soon', 'Próximamente')}</p>
            <h3>{s.title[idx]}</h3>
            <p>{s.text[idx]}</p>
            <div className="mt-5 flex items-center gap-3">
              <button type="button" className={arrow} onClick={() => go(i - 1)} aria-label={x('Tela anterior', 'Previous screen', 'Pantalla anterior')} data-testid="button-prev-screen"><ChevronLeft size={20} aria-hidden="true" /></button>
              <button type="button" className={arrow} onClick={() => go(i + 1)} aria-label={x('Próxima tela', 'Next screen', 'Pantalla siguiente')} data-testid="button-next-screen"><ChevronRight size={20} aria-hidden="true" /></button>
              <div className="ml-2 flex gap-2" aria-hidden="true">
                {screens.map((t, k) => <span key={t.id} className="h-2 rounded-full transition-all" style={{ width: i === k ? 22 : 8, background: i === k ? '#2B59FF' : '#13204F' }} />)}
              </div>
            </div>
            <p className="ip-legal">{illustrative}</p>
          </div>
        </div>
        <div className="ip-device" id="pa-panel" role="tabpanel" aria-labelledby={`pa-tab-${s.id}`} tabIndex={0}
          onTouchStart={e => { touch.current = e.touches[0].clientX; }} onTouchEnd={onEnd}>
          <div className={`ip-phone${s.id === 'resultados' || s.id === 'historico' ? ' ip-phone--performance' : ''}`}>
            <div className="ip-phone__notch" />
            <div className="ip-phone__bar"><span className="ip-phone__logo" aria-hidden="true"><BettexMark /></span>BETTEX<i>{x('Em breve', 'Coming soon', 'Próximamente')}</i></div>
            <div className="ip-screen" key={s.id}><PhoneScreen id={s.id} /></div>
          </div>
          <p className="ip-device__caption">{x('Prévia ilustrativa · Em desenvolvimento', 'Illustrative preview · Under development', 'Vista ilustrativa · En desarrollo')}</p>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={docs} className="ip-banner__cta" data-testid="link-public-docs">{x('Ler a documentação', 'Read the documentation', 'Leer la documentación')}</Link>
        <a href={TELEGRAM_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="ip-banner__cta" style={{ background: '#070B1F' }} data-testid="link-public-telegram">{x('Comunidade no Telegram', 'Telegram community', 'Comunidad en Telegram')}</a>
      </div>
      <p className="mt-4 max-w-2xl text-xs leading-relaxed text-[#13204F]">
        {x('A BETTEX não é um fundo. Você é usuário da tecnologia, não investidor. Nada nesta página é oferta, retorno garantido ou saldo real.',
          'BETTEX is not a fund. You are a user of the technology, not an investor. Nothing on this page is an offer, guaranteed return or real balance.',
          'BETTEX no es un fondo. Eres usuario de la tecnología, no inversor. Nada en esta página es una oferta, retorno garantizado o saldo real.')}
      </p>
    </div>
  </main>;
}
