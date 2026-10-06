/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from '@/components/demo/ui';
import { Money, useMoney } from '@/components/demo/fin';
import { liveCapital } from './live-capital';
import { formatBrazilDateTime, formatBrazilTime } from './brazil-time';

export type Sample = { t: number; capital: number; proj: number };
export type CycleMode = 'capital' | 'proj';
const MAX = 120;

export function useCycleHistory(d: DemoDashboard | undefined) {
  const [s, setS] = useState<{ key: string; pts: Sample[] }>({ key: '', pts: [] });
  const key = d ? `${d.profile.accountId}|${d.staking.cycleStartedAt}` : '';
  const stamp = d?.serverNow;
  useEffect(() => {
    if (!d) { setS({ key: '', pts: [] }); return; }
    const t = Date.parse(d.serverNow);
    const p = { t, capital: liveCapital(d.operations), proj: d.staking.estimatedUsdc };
    setS(o => {
      const base = o.key === key ? o.pts : [];
      if (base.length && base[base.length - 1].t === t) return o.key === key ? o : { key, pts: [p] };
      return { key, pts: [...base, p].slice(-MAX) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, stamp, !d]);
  return s.key === key ? s.pts : [];
}

function Ring({ pct }: { pct: number }) {
  const r = 46, c = 2 * Math.PI * r;
  return <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90" aria-hidden="true"><circle cx="55" cy="55" r={r} fill="none" stroke="#E4DCCB" strokeWidth="8" /><circle cx="55" cy="55" r={r} fill="none" stroke="#0E7C6B" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} /></svg>;
}

export function CycleColumn({ d, now }: { d: DemoDashboard; now: () => number }) {
  const { x, loc } = useX(); const { num } = useMoney(); const s = d.staking;
  const share = s.sharePercent;
  const start = Date.parse(s.cycleStartedAt), end = Date.parse(s.nextCycleAt);
  const ms = Math.max(0, end - now());
  const pct = end > start ? Math.min(1, Math.max(0, (now() - start) / (end - start))) : 0;
  const p = (v: number) => String(Math.floor(v)).padStart(2, '0');
  const cd = `${p(ms / 3600000)}:${p((ms % 3600000) / 60000)}:${p((ms % 60000) / 1000)}`;
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const eh = s.since ? Math.floor(Math.max(0, now() - Math.max(start, Date.parse(s.since))) / 3600000) : 0;
  const active = s.status === 'active';
  return <aside className="dcard flex flex-col gap-4 p-4 sm:p-5" data-testid="column-next-cycle" aria-label={x('Próximo ciclo', 'Next cycle', 'Próximo ciclo')}>
    <div className="flex items-center justify-between gap-2"><h3 className="display text-base font-extrabold">{x('Próximo ciclo', 'Next cycle', 'Próximo ciclo')}</h3><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${active ? 'bg-[#DDEBE4] text-[#0A6657]' : 'bg-[#F0E9DA] text-[#5B6B85]'}`}>{active ? x('Ativa', 'Active', 'Activa') : x('Inativa', 'Inactive', 'Inactiva')}</span></div>
    <div data-testid="text-staked-tokens"><p className="text-xs font-semibold text-[#5B6B85]">{x('BETTEX em participação', 'BETTEX staked', 'BETTEX en participación')}</p><Money v={s.eligibleTokens} a="BETTEX" big /></div>
    <div><p className="text-xs font-semibold text-[#5B6B85]">{x('Valor da participação', 'Staking value', 'Valor de la participación')}</p><Money v={s.eligibleTokens * d.balances.bettexUsdc} a="USDC" big /></div>
    <div><p className="text-xs font-semibold text-[#5B6B85]">{x('Participação atual', 'Current participation', 'Participación actual')}</p><p className="display text-xl font-extrabold" data-testid="text-share">{share.toLocaleString(fl, { maximumSignificantDigits: 3 })}%</p></div>
    <div className="mt-auto grid justify-items-center gap-1 pt-2">
      <div className="relative h-36 w-36"><Ring pct={pct} /><div className="absolute inset-0 grid place-content-center text-center"><p className="display text-xl font-extrabold tabular-nums" data-testid="text-countdown">{cd}</p><p className="text-[10px] text-[#5B6B85]">{Math.round(pct * 100)}%</p></div></div>
      <p className="mono text-center text-xs text-[#5B6B85]">{x('Fecha em', 'Closes at', 'Cierra en')} {formatBrazilDateTime(s.nextCycleAt, fl)} · {x('Horário do Brasil', 'Brazil time', 'Horario de Brasil')}</p>
      <p className="text-center text-xs text-[#5B6B85]">{x('Peso no ciclo', 'Cycle weight', 'Peso en el ciclo')} {num(s.weightTokenSeconds, 0)} · {eh} h</p>
    </div>
  </aside>;
}

export function CycleChart({ pts, mode, setMode, onOpen, height = 300 }: { pts: Sample[]; mode: CycleMode; setMode: (m: CycleMode) => void; onOpen?: () => void; height?: number }) {
  const { x, loc } = useX(); const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const tm = (t: number) => formatBrazilTime(t, fl);
  const usd = (v: number) => `${v.toLocaleString(fl, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
  const label = mode === 'capital' ? x('Capital em stake ao vivo', 'Live capital at stake', 'Capital en juego en vivo') : x('Meu USDC projetado', 'My projected USDC', 'Mi USDC proyectado');
  const tabBtn = (on: boolean) => `min-h-11 rounded-full border px-3 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B] ${on ? 'border-[#0E7C6B] bg-[#DDEBE4] text-[#0A6657]' : 'border-[#E4DCCB] text-[#5B6B85]'}`;
  const plot = <div className="relative" style={{ height }}>
    {pts.length === 0 ? <p className="grid h-full place-content-center text-sm text-[#5B6B85]">{x('Coletando amostras…', 'Collecting samples…', 'Recopilando muestras…')}</p> :
      <ResponsiveContainer width="100%" height="100%"><AreaChart data={pts} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <defs><linearGradient id="cyc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0E7C6B" stopOpacity={0.35} /><stop offset="100%" stopColor="#0E7C6B" stopOpacity={0.02} /></linearGradient></defs>
        <CartesianGrid stroke="#E4DCCB" strokeDasharray="3 3" />
        <XAxis dataKey="t" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={tm} tick={{ fontSize: 11, fill: '#5B6B85' }} minTickGap={40} />
        <YAxis width={56} domain={['auto', 'auto']} tickFormatter={(v: number) => v.toLocaleString(fl, { maximumFractionDigits: 2 })} tick={{ fontSize: 11, fill: '#5B6B85' }} />
        <Tooltip labelFormatter={(t: number) => `${tm(t)} · ${x('Horário do Brasil', 'Brazil time', 'Horario de Brasil')}`} formatter={(v: number) => [usd(v), label]} />
        <Area type={mode === 'capital' ? 'stepAfter' : 'linear'} dataKey={mode} stroke="#0E7C6B" strokeWidth={2} fill="url(#cyc)" isAnimationActive={false} dot={pts.length < 3} />
      </AreaChart></ResponsiveContainer>}
    {mode === 'proj' && <p className="pointer-events-none absolute left-14 top-1 max-w-[80%] rounded bg-[#FBF8F0]/90 px-2 py-1 text-[11px] text-[#5B6B85]">{x('Estimativa condicional: muda com o resultado do ciclo e não garante pagamento.', 'Conditional estimate: changes with the cycle result and does not guarantee payment.', 'Estimación condicional: cambia con el resultado del ciclo y no garantiza pago.')}</p>}
  </div>;
  return <div className="dcard p-4 sm:p-5" data-testid="chart-cycle">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="display text-base font-extrabold">{x('Capital em stake ao vivo', 'Live capital at stake', 'Capital en juego en vivo')}</h3></div>
      <div className="flex gap-2" role="group" aria-label={x('Série do gráfico', 'Chart series', 'Serie del gráfico')}>
        <button type="button" aria-pressed={mode === 'capital'} data-testid="chart-mode-capital" onClick={() => setMode('capital')} className={tabBtn(mode === 'capital')}>{x('Em stake', 'At stake', 'En juego')}</button>
        <button type="button" aria-pressed={mode === 'proj'} data-testid="chart-mode-proj" onClick={() => setMode('proj')} className={tabBtn(mode === 'proj')}>{x('Meu USDC projetado', 'My projected USDC', 'Mi USDC proyectado')}</button></div></div>
    {pts.length > 0 && <div className="mt-3" data-testid="text-live-capital"><Money v={pts[pts.length - 1].capital} a="USDC" big /></div>}
    {onOpen ? <div role="button" tabIndex={0} data-testid="chart-plot" aria-label={x('Abrir a Central da IA com este gráfico', 'Open the AI Center with this chart', 'Abrir la Central de IA con este gráfico')} onClick={onOpen} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }} className="mt-3 cursor-pointer rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]">{plot}</div> : <div className="mt-3">{plot}</div>}
    {onOpen && <p className="mt-1 text-xs font-bold text-[#0A6657]">{x('Clique no gráfico para abrir a Central', 'Click the chart to open the Center', 'Haz clic en el gráfico para abrir la Central')}</p>}
  </div>;
}

export function CycleLive({ d, now, pts, mode, setMode, onOpen }: { d: DemoDashboard; now: () => number; pts: Sample[]; mode: CycleMode; setMode: (m: CycleMode) => void; onOpen?: () => void }) {
  return <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]"><CycleChart pts={pts} mode={mode} setMode={setMode} onOpen={onOpen} /><CycleColumn d={d} now={now} /></div>;
}
