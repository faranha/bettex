/** @jsxImportSource react */
import { useMemo, useState } from 'react';
import { Bar, CartesianGrid, Cell, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useX } from './ui';
import type { StakingTimeline } from './staking-model';
import { barColor, fmtClock, hourlyRows, hourlyWindow, type HourRow, type MinuteSample, type MinuteView } from './staking-minute-chart';

const MUTED = '#5B6B85';
const VIEWS: MinuteView[] = ['1h', '6h', '24h'];

export function StakingMinuteChart({ points, t0, timeline, empty, fl, usd }: {
  points: MinuteSample[]; t0: number; timeline: StakingTimeline | null; empty: string; fl: string; usd: (n: number) => string;
}) {
  const { x } = useX();
  const [view, setView] = useState<MinuteView>('24h');
  const [chart, setChart] = useState<'bars' | 'line'>('bars');
  const elapsed = timeline?.elapsedMinutes ?? Math.max(0, ...points.filter(p => p.profit !== null).map(p => (p.at - t0) / 60000));
  const win = useMemo(() => hourlyWindow(view, elapsed), [view, elapsed]);
  const rows = useMemo(() => hourlyRows(points, t0, win), [points, t0, win]);
  const step = Math.max(1, Math.ceil(rows.length / 6));
  const ticks = rows.filter((_, i) => i % step === 0).map(r => r.minute);
  const lastAt = rows.at(-1)?.toAt ?? null;
  const tipLabel = (r: HourRow) => `${fmtClock(r.fromAt, fl)}–${fmtClock(r.toAt, fl)}`;
  const name = { profit: x('Resultado da hora', 'Hourly result', 'Resultado de la hora') };
  const sw = (c: string) => <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: c }} />;
  return <div className="flex min-h-0 flex-1 flex-col">
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
      <div className="inline-flex rounded-lg bg-[#F0E9DA] p-0.5" role="group" aria-label={x('Janela', 'Window', 'Ventana')}>
        {VIEWS.map(v => <button key={v} type="button" aria-pressed={view === v} data-testid={`staking-chart-view-${v}`} onClick={() => setView(v)} className={`min-h-8 rounded-md px-2.5 text-[11px] font-bold ${view === v ? 'bg-white text-[#0A2342] shadow-sm' : 'text-[#5B6B85]'}`}>{v}</button>)}
      </div>
      <div className="inline-flex rounded-lg bg-[#F0E9DA] p-0.5" role="group" aria-label={x('Tipo de gráfico', 'Chart type', 'Tipo de gráfico')}>
        {(['bars', 'line'] as const).map(c => <button key={c} type="button" aria-pressed={chart === c} data-testid={`staking-chart-type-${c}`} onClick={() => setChart(c)} className={`min-h-8 rounded-md px-2.5 text-[11px] font-bold ${chart === c ? 'bg-white text-[#0A2342] shadow-sm' : 'text-[#5B6B85]'}`}>{c === 'bars' ? x('Barras', 'Bars', 'Barras') : x('Linha', 'Line', 'Línea')}</button>)}
      </div>
      {lastAt !== null && <span className="mono rounded-full bg-[#F0E9DA] px-2.5 py-1 text-[11px] font-bold text-[#5B6B85]" data-testid="staking-chart-tick">{x('Por hora · fonte', 'Hourly · source', 'Por hora · fuente')} {fmtClock(lastAt, fl)}</span>}
    </div>
    <div className="mt-2 h-[240px] sm:h-[260px] lg:h-[280px]">
      {rows.length === 0 ? <p className="grid h-full place-content-center px-4 text-center text-sm text-[#5B6B85]">{points.some(p => p.profit !== null) ? x('Aguardando duas leituras para registrar o resultado do intervalo.', 'Waiting for two readings to record the interval result.', 'Esperando dos lecturas para registrar el resultado del intervalo.') : empty}</p> :
        <ResponsiveContainer width="100%" height="100%"><ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="25%">
          <CartesianGrid stroke="#E4DCCB" vertical={false} />
          <XAxis type="number" dataKey="minute" domain={[rows[0].minute - 30, rows[rows.length - 1].minute + 30]} ticks={ticks} tickFormatter={(m: number) => fmtClock(t0 + m * 60000, fl)} tick={{ fontSize: 11, fill: MUTED }} interval={0} tickLine={false} axisLine={false} />
          <YAxis width={52} domain={[(min: number) => Math.min(0, min), (max: number) => Math.max(0, max)]} tickFormatter={(n: number) => n.toLocaleString(fl, { maximumFractionDigits: 0 })} tick={{ fontSize: 11, fill: MUTED }} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: 'rgba(10,35,66,0.06)' }} allowEscapeViewBox={{ x: false, y: false }} wrapperStyle={{ maxWidth: 'min(220px, 80vw)', zIndex: 20 }}
            content={({ active, payload }) => {
              const r = active && payload?.length ? payload[0].payload as HourRow : null;
              if (!r) return null;
              const sg = (n: number) => `${n > 0 ? '+' : ''}${usd(n)}`;
              return <div className="max-w-[220px] rounded-lg border border-[#E4DCCB] bg-[#FBF8F0] p-2 text-[11px] shadow-md" data-testid="staking-chart-tooltip">
                <p className="mono font-bold text-[#0A2342]">{tipLabel(r)}</p>
                <p className="break-words text-[#5B6B85]">{name.profit}: <b style={{ color: barColor(r.profit) }}>{sg(r.profit)}</b></p>
                {r.partial && <p className="mt-1 text-[#5B6B85]">{x('Intervalo parcial · apenas leituras disponíveis', 'Partial interval · available readings only', 'Intervalo parcial · solo lecturas disponibles')}</p>}
              </div>;
            }} />
          <ReferenceLine y={0} stroke="#1B2A41" strokeWidth={1.5} />
          {chart === 'bars' ? <Bar dataKey="profit" maxBarSize={44} radius={[2, 2, 2, 2]} isAnimationActive={false} minPointSize={0}>
            {rows.map(r => <Cell key={r.minute} fill={barColor(r.profit)} />)}
          </Bar> : <Line type="linear" dataKey="profit" stroke={MUTED} strokeWidth={2} isAnimationActive={false} connectNulls={false} dot={({ cx, cy, payload }) => <circle key={payload.minute} cx={cx} cy={cy} r={4} fill={barColor(payload.profit)} stroke="#FBF8F0" strokeWidth={1} />} />}
        </ComposedChart></ResponsiveContainer>}
    </div>
    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-[#5B6B85]"><span>{sw('#0E7C6B')}{x('Hora positiva', 'Positive hour', 'Hora positiva')}</span><span>{sw('#C44B45')}{x('Hora negativa', 'Negative hour', 'Hora negativa')}</span></p>
  </div>;
}
