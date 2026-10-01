import { useRef, useState, type KeyboardEvent } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MarketMark } from '@/components/hero/MarketMark';
import { marketPerformance, dailyFor, netCents, totalsFor, type PerformanceDay } from './performanceExample';
import './PerformancePreview.css';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const money = (cents: number) => brl.format(cents / 100);
const signed = (cents: number) => `${cents > 0 ? '+' : ''}${money(cents)}`;
const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
const GAIN = '#44986D';
const LOSS = '#D8524F';

function Chart({ days, label }: { days: PerformanceDay[]; label: string }) {
  const data = days.map((d) => ({ label: d.date, value: netCents(d) / 100 }));
  const summary = `${label}, resultado líquido por dia em reais: ${days.map((d) => `${d.date} ${signed(netCents(d))}`).join('; ')}.`;
  return (
    <figure className="pp-chart">
      <div className="pp-chart__plot" role="img" aria-label={summary}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 2, bottom: 0, left: 0 }} barCategoryGap="18%">
            <CartesianGrid vertical={false} stroke="#cbd6ef" strokeDasharray="3 4" />
            <XAxis dataKey="label" height={18} tickLine={false} axisLine={false} interval={0} tick={{ fill: '#2B59FF', fontSize: 8 }} />
            <YAxis tickCount={3} tickLine={false} axisLine={false} width={40} tick={{ fill: '#2B59FF', fontSize: 8 }} tickFormatter={(v: number) => compact.format(v)} domain={[(m: number) => Math.min(0, m), (m: number) => Math.max(0, m)]} />
            <ReferenceLine y={0} stroke="#39569b" />
            <Tooltip
              cursor={{ fill: '#c5d4f5', fillOpacity: 0.45 }}
              formatter={(value: number) => [Number.isFinite(value) ? brl.format(value) : '', 'Resultado líquido']}
              contentStyle={{ border: '1px solid #b0c1e8', borderRadius: 8, background: '#F4F1E8', fontSize: 10 }}
            />
            <Bar dataKey="value" isAnimationActive={false} radius={2}>
              {data.map((p) => <Cell key={p.label} fill={p.value < 0 ? LOSS : GAIN} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption>Líquido diário · R$</figcaption>
    </figure>
  );
}

function Metrics({ profit, loss }: { profit: number; loss: number }) {
  const net = profit - loss;
  return (
    <div className="pp-metrics">
      <div><span>Lucro</span><b className="pp-pos">{money(profit)}</b></div>
      <div><span>Perdas</span><b className="pp-neg">{money(loss)}</b></div>
      <div className="pp-net"><span>Líquido</span><b className={net < 0 ? 'pp-neg' : 'pp-pos'}>{signed(net)}</b></div>
    </div>
  );
}

export function PerformancePreview({ mode }: { mode: 'overview' | 'history' }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  if (mode === 'overview') {
    const t = totalsFor(marketPerformance);
    const max = Math.max(...marketPerformance.map((a) => Math.abs(totalsFor([a]).profitCents - totalsFor([a]).lossCents)), 1);
    return (
      <div className="pp" data-testid="performance-overview">
        <small>Resultados · 24–30/09/2026</small>
        <h5>Lucros e perdas</h5>
        <Metrics profit={t.profitCents} loss={t.lossCents} />
        <Chart days={dailyFor(marketPerformance)} label="Consolidado dos quatro mercados" />
        <ul className="pp-agents">
          {marketPerformance.map((a) => {
            const x = totalsFor([a]);
            const n = x.profitCents - x.lossCents;
            return (
              <li key={a.id}>
                <div className="pp-agents__head"><b>{a.name}</b><span className={n < 0 ? 'pp-neg' : 'pp-pos'}>{signed(n)}</span></div>
                <i className="pp-agents__bar"><u style={{ width: `${(Math.abs(n) / max) * 100}%`, background: n < 0 ? LOSS : GAIN }} /></i>
                <em>Lucro {money(x.profitCents)} · Perdas {money(x.lossCents)}</em>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const market = marketPerformance[active];
  const t = totalsFor([market]);
  const onKey = (e: KeyboardEvent) => {
    const n = marketPerformance.length;
    let i = active;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') i = (active + 1) % n;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') i = (active + n - 1) % n;
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = n - 1;
    else return;
    e.preventDefault();
    setActive(i);
    refs.current[i]?.focus();
  };

  return (
    <div className="pp" data-testid="performance-history">
      <small>Histórico · 24–30/09/2026</small>
      <h5>Performance por mercado</h5>
      <div className="pp-tabs" role="tablist" aria-label="Mercados" onKeyDown={onKey}>
        {marketPerformance.map((a, i) => (
          <button key={a.id} ref={(el) => { refs.current[i] = el; }} role="tab" id={`pp-tab-${a.id}`} aria-selected={i === active} aria-controls="pp-panel" tabIndex={i === active ? 0 : -1} onClick={() => setActive(i)} data-market={a.id} data-testid={`tab-market-${a.id}`}>
            <span className="pp-tab-icon"><MarketMark kind={a.id} /></span>
            <span className="pp-tab-name">{a.name}</span>
          </button>
        ))}
      </div>
      <div id="pp-panel" role="tabpanel" aria-labelledby={`pp-tab-${market.id}`} className="pp">
        <p className="pp-cat">{market.category}</p>
        <Metrics profit={t.profitCents} loss={t.lossCents} />
        <Chart days={market.days} label={market.name} />
        <ul className="pp-days">
          {market.days.map((d) => {
            const n = netCents(d);
            return (
              <li key={d.date}>
                <b>{d.date}/2026</b>
                <span>{d.profitCents ? `Lucro ${money(d.profitCents)}` : `Perda ${money(d.lossCents)}`}</span>
                <em className={n < 0 ? 'pp-neg' : 'pp-pos'}>{signed(n)}</em>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default PerformancePreview;
