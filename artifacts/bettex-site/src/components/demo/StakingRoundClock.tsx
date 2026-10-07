/** @jsxImportSource react */
import { useEffect, useRef, useState } from 'react';
import { Flame, Activity } from 'lucide-react';
import { Link } from 'wouter';
import { demoPath } from './demo-navigation';
import { useX } from './ui';
import { Term } from './fin';
import type { StakingTimeline } from './staking-model';
import { stakingClockReading, roundServerTime, syncRoundClock, type RoundClockAnchor } from './staking-clock';

const p2 = (n: number) => String(Math.floor(n)).padStart(2, '0');

export function StakingRoundClock({ serverNow, nextCycleAt, native, timeline, current, projected, loading, na, fl }: {
  serverNow: string | undefined; nextCycleAt: string | null; native: boolean; timeline: StakingTimeline | null;
  current: number | null; projected: number | null; loading: boolean; na: string; fl: string;
}) {
  const { x, loc } = useX();
  const [, setN] = useState(0);
  const anchor = useRef<{ cycle: string | null; reading: RoundClockAnchor | null }>({ cycle: null, reading: null });
  const sn = serverNow ? Date.parse(serverNow) : NaN;
  useEffect(() => {
    if (!Number.isFinite(sn)) return;
    const previous = anchor.current.cycle === nextCycleAt ? anchor.current.reading : null;
    anchor.current = { cycle: nextCycleAt, reading: syncRoundClock(previous, sn, performance.now()) };
  }, [sn, nextCycleAt]);
  useEffect(() => { const i = window.setInterval(() => setN(k => k + 1), 100); return () => window.clearInterval(i); }, []);
  const srv = anchor.current.reading ? roundServerTime(anchor.current.reading, performance.now()) : Number.isFinite(sn) ? sn : Date.now();
  const sim = !native && timeline !== null;
  const { remainingMs: remaining, elapsedMs: elapsed, progress: frac } = stakingClockReading(nextCycleAt, sim ? timeline : null, srv);
  const hh = remaining === null ? '--' : p2(remaining / 3600000);
  const mm = remaining === null ? '--' : p2((remaining % 3600000) / 60000);
  const ss = remaining === null ? '--' : p2((remaining % 60000) / 1000);
  const R = 96; const C = 2 * Math.PI * R;
  const lit = Math.floor(frac * 24);
  const hand = frac * 360;
  const money = (n: number | null) => n === null ? na : `${n.toLocaleString(fl, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
  const sec = (id: string, label: string, tip: string, val: number | null, big: boolean) => <div className={`min-w-0 rounded-xl px-4 py-3 ${big ? 'bg-[#0A2342] text-white' : 'bg-white/70 text-[#0A2342]'}`} data-testid={id}>
    <p className={`text-xs font-bold ${big ? 'text-[#F2D98C]' : 'text-[#5B6B85]'}`}><Term tip={tip}>{label}</Term></p>
    {loading && val === null ? <span className="mt-2 block h-9 w-40 animate-pulse rounded bg-[#E4DCCB]" /> : <p className={`display mt-1 break-words font-extrabold tabular-nums leading-tight ${big ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}>{money(val)}</p>}
  </div>;
  const simTip = x('Roteiro predefinido do demo: abre às 16h de São Paulo e fecha às 16h do dia seguinte. O relógio acompanha 24 horas reais; não há dinheiro real nem retorno garantido.', 'Predefined demo storyline: opens at 16:00 São Paulo time and closes at 16:00 the next day. The clock follows 24 real hours; no real money or guaranteed return.', 'Guion predefinido del demo: abre a las 16:00 de São Paulo y cierra a las 16:00 del día siguiente. El reloj sigue 24 horas reales; sin dinero real ni retorno garantizado.');
  const clockTip = sim ? simTip : x('Tempo restante até o encerramento da rodada. Encerrar não garante pagamento: o resultado e a elegibilidade são apurados separadamente.', 'Time remaining until the round closes. Closing does not guarantee payment: results and eligibility are evaluated separately.', 'Tiempo restante hasta el cierre de la ronda. El cierre no garantiza pagos: el resultado y la elegibilidad se evalúan por separado.');
  const unit = (v: string, l: string) => <div className="text-center"><p className="display text-2xl font-extrabold tabular-nums leading-none text-[#0A2342]">{v}</p><p className="mt-0.5 text-[8px] font-bold tracking-widest text-[#5B6B85]">{l}</p></div>;
  return <div className="relative min-w-0 overflow-hidden rounded-xl border border-[#E4DCCB] bg-gradient-to-b from-[#FBF3DC] to-[#F4EBD3] p-4" data-testid="staking-round-clock">
    <h3 className="flex items-center gap-2 text-sm font-extrabold"><Flame className="h-4 w-4 text-[#C98A12]" fill="#F2B632" aria-hidden="true" /><Term tip={clockTip}>{x('Rodada de 24 horas', '24-hour round', 'Ronda de 24 horas')}</Term></h3>
    <div className="mt-3 grid gap-3" data-testid="staking-earnings">
      {sec('staking-current-earnings', x('Ganhos atuais', 'Current earnings', 'Ganancias actuales'), x('Valor provisório de hoje, ainda não pago. Se a rodada fechar negativa, paga 0 e nenhum token é descontado.', 'Provisional amount today, not yet paid. If the round closes negative, it pays 0 and no tokens are deducted.', 'Monto provisional de hoy, aún no pagado. Si la ronda cierra negativa, paga 0 y no se descuentan tokens.'), current, true)}
      {sec('staking-projected-earnings', x('Projetados', 'Projected', 'Proyectadas'), x('Previsão para o fim das 24h, não é garantia. Rodada negativa paga 0 e tokens não são descontados.', 'Forecast for the end of the 24h, not a guarantee. A negative round pays 0 and tokens are not deducted.', 'Previsión para el final de las 24h, no es garantía. Una ronda negativa paga 0 y no se descuentan tokens.'), projected, false)}
    </div>
    <div className="mt-4 flex items-center gap-4">
      <div className="relative aspect-square w-[120px] shrink-0 sm:w-[160px]">
        <svg viewBox="0 0 220 220" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * 2 * Math.PI - Math.PI / 2; const major = i % 6 === 0; const r1 = major ? 100 : 104; return <line key={i} x1={110 + Math.cos(a) * r1} y1={110 + Math.sin(a) * r1} x2={110 + Math.cos(a) * 108} y2={110 + Math.sin(a) * 108} stroke={i < lit ? '#C98A12' : '#D9D0BC'} strokeWidth={major ? 3 : 2} strokeLinecap="round" />; })}
          <g transform="rotate(-90 110 110)"><circle cx="110" cy="110" r={R - 8} fill="none" stroke="#0E7C6B" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${C * (R - 8) / R * frac} ${C}`} /></g>
          <g transform={`rotate(${hand} 110 110)`}><circle cx="110" cy={110 - (R - 8)} r="7" fill="#F2B632" stroke="#C98A12" strokeWidth="2" /></g>
        </svg>
        <div className="absolute inset-0 grid place-content-center" data-testid="staking-countdown" role="timer" aria-live="off" aria-label={`${hh}:${mm}:${ss}`}>
          <div className="flex items-start gap-0.5">{unit(hh, x('H', 'H', 'H'))}<span className="display text-lg font-extrabold text-[#C98A12]" aria-hidden="true">:</span>{unit(mm, x('MIN', 'MIN', 'MIN'))}<span className="display text-lg font-extrabold text-[#C98A12]" aria-hidden="true">:</span>{unit(ss, x('SEG', 'SEC', 'SEG'))}</div>
        </div>
      </div>
      <Link href={demoPath('central', loc)} data-testid="staking-live-trading" className="group flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl bg-[#0E7C6B] px-4 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#0A6657]">
        <span className="flex items-center gap-2"><Activity className="h-5 w-5 shrink-0" aria-hidden="true" />{x('Trades ao vivo', 'Live trades', 'Trades en vivo')}</span>
      </Link>
    </div>
    {elapsed !== null && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E4DCCB]" data-testid="staking-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(frac * 100)}><div className="h-full rounded-full bg-[#0E7C6B]" style={{ width: `${frac * 100}%` }} /></div>}
  </div>;
}
