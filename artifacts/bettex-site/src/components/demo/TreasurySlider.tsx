/** @jsxImportSource react */
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Link } from 'wouter';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { AssetAllocation } from './TreasuryOverview';
import { RoundSummary } from './TreasuryCycle';
import { demoPath } from './demo-navigation';

export function TreasurySlider({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const [i, setI] = useState(0);
  const start = useRef<number | null>(null);
  const r = d.treasury.currentRound;
  const names = [x('Composição dos ativos', 'Asset allocation', 'Composición de activos'), x('Rodada atual', 'Current round', 'Ronda actual')];
  const go = (n: number) => setI(Math.max(0, Math.min(1, n)));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(1); }
  };
  const up = (e: PointerEvent) => {
    if (start.current == null) return;
    const dx = e.clientX - start.current; start.current = null;
    if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
  };
  const arrow = 'grid h-11 w-11 place-items-center rounded-full border border-[#D8CFBB] bg-[#FFFCF6] text-[#0A6657] hover:bg-[#F0E9DA] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]';
  return <section data-testid="treasury-slider" role="region" aria-roledescription="carousel" aria-label={x('Resumo da tesouraria simulada', 'Simulated treasury summary', 'Resumen de la tesorería simulada')} onKeyDown={onKey} className="dcard min-w-0 p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><h2 className="display text-lg font-extrabold">{x('Tesouraria', 'Treasury', 'Tesorería')}</h2>
        <p className="text-xs font-semibold text-[#8A641D]">{x('Dados emulados, sem dinheiro real.', 'Emulated data, no real cash.', 'Datos emulados, sin dinero real.')}</p></div>
      <Link href={demoPath('treasury', loc)} data-testid="link-open-treasury" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#0E7C6B] px-4 text-sm font-bold text-[#0A6657] hover:bg-[#EFF6F2]">{x('Abrir Tesouraria completa', 'Open full Treasury', 'Abrir Tesorería completa')}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
    </div>
    <div className="mt-3 touch-pan-y" onPointerDown={e => { start.current = e.clientX; }} onPointerUp={up} onPointerCancel={() => { start.current = null; }} aria-live="polite">
      {!r ? <p data-testid="treasury-slider-unavailable" className="rounded-xl bg-[#F5F1E8] p-3 text-sm text-[#5B6B85]">{x('Detalhes da rodada atual indisponíveis agora.', 'Current round details are unavailable right now.', 'Detalles de la ronda actual no disponibles ahora.')}</p> :
        i === 0 ? <div role="group" aria-roledescription="slide" aria-label={`1 / 2: ${names[0]}`} data-testid="treasury-slide-allocation"><AssetAllocation r={r} className="rounded-2xl border border-[#E4DCCB] p-3 sm:p-4" /></div>
        : <div role="group" aria-roledescription="slide" aria-label={`2 / 2: ${names[1]}`} data-testid="treasury-slide-round" className="rounded-2xl border border-[#E4DCCB] p-3 sm:p-4"><RoundSummary r={r} serverNow={d.serverNow} /></div>}
    </div>
    <div className="mt-3 flex items-center justify-center gap-3">
      <button type="button" data-testid="treasury-slider-prev" className={arrow} disabled={i === 0} onClick={() => go(i - 1)} aria-label={x('Slide anterior', 'Previous slide', 'Diapositiva anterior')}><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
      <div className="flex gap-1" role="group" aria-label={x('Escolher slide', 'Choose slide', 'Elegir diapositiva')}>{names.map((n, k) => <button key={n} type="button" data-testid={`treasury-slider-dot-${k}`} aria-label={n} aria-current={i === k ? 'true' : undefined} onClick={() => go(k)} className="grid h-11 w-8 place-items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]"><span className={`block h-2.5 rounded-full transition-[width,background-color] motion-reduce:transition-none ${i === k ? 'w-6 bg-[#0E7C6B]' : 'w-2.5 bg-[#C9DCD3]'}`} /></button>)}</div>
      <button type="button" data-testid="treasury-slider-next" className={arrow} disabled={i === 1} onClick={() => go(i + 1)} aria-label={x('Próximo slide', 'Next slide', 'Siguiente diapositiva')}><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
    </div>
  </section>;
}
