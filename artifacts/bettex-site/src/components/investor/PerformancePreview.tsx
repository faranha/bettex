import { useRef, useState, type KeyboardEvent } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { agentPerformance, dailyFor, netCents, totalsFor, type PerformanceDay } from './performanceExample';
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
            <CartesianGrid vertical={false} stroke="#dce8dc" strokeDasharray="3 4" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} tick={{ fill: '#5a7470', fontSize: 8 }} />
            <YAxis tickLine={false} axisLine={false} width={40} tick={{ fill: '#5a7470', fontSize: 8 }} tickFormatter={(v: number) => compact.format(v)} domain={[(m: number) => Math.min(0, m), (m: number) => Math.max(0, m)]} />
            <ReferenceLine y={0} stroke="#769489" />
            <Tooltip
              cursor={{ fill: '#d7eee1', fillOpacity: 0.45 }}
              formatter={(value: number) => [Number.isFinite(value) ? brl.format(value) : '', 'Resultado líquido']}
              contentStyle={{ border: '1px solid #c7dbcf', borderRadius: 8, background: '#fffdf5', fontSize: 10 }}
            />
            <Bar dataKey="value" isAnimationActive={false} radius={2}>
              {data.map((p) => <Cell key={p.label} fill={p.value < 0 ? LOSS : GAIN} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption>Líquido diário, R$ · acima de zero ganho, abaixo perda</figcaption>
    </figure>
  );
}

function Metrics({ profit, loss }: { profit: number; loss: number }) {
  const net = profit - loss;
  return (
    <div className="pp-metrics">
      <div><span>Lucro obtido</span><b className="pp-pos">{money(profit)}</b></div>
      <div><span>Perdas</span><b className="pp-neg">{money(loss)}</b></div>
      <div className="pp-net"><span>Resultado líquido</span><b className={net < 0 ? 'pp-neg' : 'pp-pos'}>{signed(net)}</b></div>
    </div>
  );
}

const Note = () => <p className="pp-note">Dados ilustrativos da operação BETTEX, separados da carteira e do crédito do titular.</p>;

export function PerformancePreview({ mode }: { mode: 'overview' | 'history' }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  if (mode === 'overview') {
    const t = totalsFor(agentPerformance);
    const max = Math.max(...agentPerformance.map((a) => Math.abs(totalsFor([a]).profitCents - totalsFor([a]).lossCents)), 1);
    return (
      <div className="pp" data-testid="performance-overview">
        <small>Resultados de exemplo · 24–30/09/2026</small>
        <h5>Lucros e perdas</h5>
        <Metrics profit={t.profitCents} loss={t.lossCents} />
        <Chart days={dailyFor(agentPerformance)} label="Consolidado dos quatro agentes" />
        <ul className="pp-agents">
          {agentPerformance.map((a) => {
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
        <Note />
      </div>
    );
  }

  const agent = agentPerformance[active];
  const t = totalsFor([agent]);
  const onKey = (e: KeyboardEvent) => {
    const n = agentPerformance.length;
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
      <small>Histórico de exemplo · 24–30/09/2026</small>
      <h5>Performance por agente</h5>
      <div className="pp-tabs" role="tablist" aria-label="Agentes especializados" onKeyDown={onKey}>
        {agentPerformance.map((a, i) => (
          <button key={a.id} ref={(el) => { refs.current[i] = el; }} role="tab" id={`pp-tab-${a.id}`} aria-selected={i === active} aria-controls="pp-panel" tabIndex={i === active ? 0 : -1} onClick={() => setActive(i)} data-testid={`tab-agent-${a.id}`}>{a.name}</button>
        ))}
      </div>
      <div id="pp-panel" role="tabpanel" aria-labelledby={`pp-tab-${agent.id}`} className="pp">
        <p className="pp-cat">{agent.category}</p>
        <Metrics profit={t.profitCents} loss={t.lossCents} />
        <Chart days={agent.days} label={agent.name} />
        <ul className="pp-days">
          {agent.days.map((d) => {
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
      <Note />
    </div>
  );
}

export default PerformancePreview;
