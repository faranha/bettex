/** @jsxImportSource react */
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Link } from 'wouter';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { StatementOverview } from './TreasuryOverview';
import { TreasurySwapPool } from './TreasurySwapPool';
import { TreasuryWallets } from './TreasuryWallets';
import { BurnWalletPanel } from './BurnWalletPanel';
import { brazilDate } from '../history/TreasuryStatement';
import { demoPath } from './demo-navigation';
import { WalletHelp } from './WalletHelp';

export function TreasurySlider({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const [i, setI] = useState(0);
  const start = useRef<number | null>(null);
  const r = d.treasury.currentRound;
  const slides = [
    { id: 'wallets', name: x('Operacional', 'Operational', 'Operativa'), content: r ? <TreasuryWallets d={d} r={r} layout="compact" wallet="operational" /> : null },
    { id: 'reserve', name: x('Reserva protegida', 'Protected reserve', 'Reserva protegida'), content: r ? <TreasuryWallets d={d} r={r} layout="compact" wallet="reserve" /> : null },
    { id: 'crypto-wallet', name: x('Agente Cripto', 'Crypto agent', 'Agente Cripto'), content: r ? <TreasuryWallets d={d} r={r} layout="compact" wallet="crypto_agent" /> : null },
    { id: 'buyback-wallet', name: x('Recompra', 'Buyback', 'Recompra'), content: r ? <TreasuryWallets d={d} r={r} layout="compact" wallet="buyback" /> : null },
    { id: 'statement', name: x('Movimento financeiro', 'Financial movement', 'Movimiento financiero'), content: r ? <StatementOverview d={d} from={brazilDate(r.startedAt)} /> : null },
    { id: 'burn', name: x('Recompra e queima', 'Buyback and burn', 'Recompra y quema'), content: r ? <BurnWalletPanel d={d} /> : null },
    { id: 'pool', name: x('Pool de conversão', 'Swap pool', 'Pool de conversión'), content: r ? <TreasurySwapPool d={d} /> : null },
  ];
  const last = slides.length - 1;
  const go = (n: number) => setI(Math.max(0, Math.min(last, n)));
  const onKey = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(last); }
  };
  const up = (e: PointerEvent) => {
    if (start.current == null) return;
    const dx = e.clientX - start.current; start.current = null;
    if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
  };
  const arrow = 'grid h-11 w-11 place-items-center rounded-full border border-[#D8CFBB] bg-[#FFFCF6] text-[#0A6657] hover:bg-[#F0E9DA] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]';
  return <section data-testid="treasury-slider" role="region" aria-roledescription="carousel" aria-label={x('Resumo da tesouraria', 'Treasury summary', 'Resumen de la tesorería')} onKeyDown={onKey} className="dcard min-w-0 p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="display text-lg font-extrabold"><WalletHelp id="treasury-home" label={x('Tesouraria', 'Treasury', 'Tesorería')}><p>{x('Resumo dos recursos da tesouraria, separados das suas carteiras pessoais e da receita da operadora. Use as setas, os indicadores ou deslize para consultar cada carteira, os movimentos, a recompra e a pool. Abrir Tesouraria completa mostra todos os blocos e o resultado da rodada. Valores do ALFA são de teste, não fundos reais.', 'Summary of treasury resources, separate from your personal wallets and operator revenue. Use arrows, indicators or swipe to view each wallet, movements, buyback and pool. Open full Treasury shows all sections and the round result. ALPHA figures are for testing, not real funds.', 'Resumen de los recursos de tesorería, separados de tus carteras personales y los ingresos de la operadora. Usa las flechas, los indicadores o desliza para consultar cada cartera, movimientos, recompra y pool. Abrir Tesorería completa muestra todos los bloques y el resultado de la ronda. Las cifras de ALFA son de prueba, no fondos reales.')}</p></WalletHelp></h2>
      <Link href={demoPath('treasury', loc)} data-testid="link-open-treasury" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#0E7C6B] px-4 text-sm font-bold text-[#0A6657] hover:bg-[#EFF6F2]">{x('Abrir Tesouraria completa', 'Open full Treasury', 'Abrir Tesorería completa')}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
    </div>
    <div className="mt-3 min-w-0 touch-pan-y" onPointerDown={e => { start.current = (e.target as HTMLElement).closest('button, a, input, select, textarea') ? null : e.clientX; }} onPointerUp={up} onPointerCancel={() => { start.current = null; }} aria-live="polite">
      {!r ? <p data-testid="treasury-slider-unavailable" className="rounded-xl bg-[#F5F1E8] p-3 text-sm text-[#5B6B85]">{x('Detalhes da rodada atual indisponíveis agora.', 'Current round details are unavailable right now.', 'Detalles de la ronda actual no disponibles ahora.')}</p> :
        <div className="min-w-0" role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${slides.length}: ${slides[i].name}`} data-testid={`treasury-slide-${slides[i].id}`}>{slides[i].content}</div>}
    </div>
    <div className="mt-3 grid min-w-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
      <button type="button" data-testid="treasury-slider-prev" className={arrow} disabled={i === 0} onClick={() => go(i - 1)} aria-label={x('Slide anterior', 'Previous slide', 'Diapositiva anterior')}><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
      <div className="flex min-w-0 flex-wrap justify-center gap-1" role="group" aria-label={x('Escolher slide', 'Choose slide', 'Elegir diapositiva')}>{slides.map((slide, k) => <button key={slide.id} type="button" data-testid={`treasury-slider-dot-${k}`} aria-label={slide.name} aria-current={i === k ? 'true' : undefined} onClick={() => go(k)} className="grid h-11 w-8 place-items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]"><span className={`block h-2.5 rounded-full transition-[width,background-color] motion-reduce:transition-none ${i === k ? 'w-6 bg-[#0E7C6B]' : 'w-2.5 bg-[#C9DCD3]'}`} /></button>)}</div>
      <button type="button" data-testid="treasury-slider-next" className={arrow} disabled={i === last} onClick={() => go(i + 1)} aria-label={x('Próximo slide', 'Next slide', 'Siguiente diapositiva')}><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
    </div>
  </section>;
}
