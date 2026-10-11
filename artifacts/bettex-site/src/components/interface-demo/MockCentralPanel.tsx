/** @jsxImportSource react */
import { useState } from 'react';
import { useX } from '@/components/demo/ui';
import { AgentTradingTabs } from './AgentTradingTabs';
import { CAPITAL, FORECASTS, POSITIONS, type Asset as MarketAsset } from './central-data';

type Tab = 'overview' | 'crypto' | 'sports' | 'predictions' | 'bonus' | 'history';
type Asset = 'BTC' | 'ETH' | 'SOL';

const card = 'min-w-0 rounded-2xl border border-[#E4DCCB] bg-white/50 p-3 sm:p-4';

const ASSETS: Asset[] = ['BTC', 'ETH', 'SOL'];

function Spark({ data, label }: { data: number[]; label: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${40 - ((v - min) / (max - min || 1)) * 36}`).join(' ');
  return <svg role="img" aria-label={label} viewBox="0 0 100 42" preserveAspectRatio="none" className="h-16 w-full"><polyline points={pts} fill="none" stroke="#0E7C6B" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg>;
}

export function MockCentralPanel({ compact = false, embedded = false }: { onAction: () => void; compact?: boolean; embedded?: boolean }) {
  const { x, loc } = useX();
  const locale = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const usd = (n: number) => n.toLocaleString(locale, { style: 'currency', currency: 'USD' });
  const usdc = (n: number) => `${n.toLocaleString(locale, { maximumFractionDigits: 2 })} USDC`;
  const result = (p: typeof POSITIONS[number]) => p.exitValue == null || p.stale
    ? x('Avaliação indisponível', 'Valuation unavailable', 'Valoración no disponible')
    : usdc((Number(p.exitValue) - Number(p.cost) - Number(p.fees)) / 1e6);
  const [tab, setTab] = useState<Tab>('crypto');
  const [asset, setAsset] = useState<Asset>('BTC');
  const [posFilter, setPosFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [detail, setDetail] = useState<number | null>(0);
  const [hist, setHist] = useState<'all' | 'crypto' | 'sports' | 'predictions' | 'bonus'>('all');

  const tabs: [Tab, string][] = [
    ['crypto', x('Mercados', 'Markets', 'Mercados')], ['overview', x('Visão geral', 'Overview', 'Resumen')], ['history', x('Histórico', 'History', 'Historial')],
  ];

  const positions = POSITIONS.filter(p => p.asset.toUpperCase() === asset).map(p => ({
    id: p.id, a: asset, st: p.state === 'settled' ? 'closed' : 'open',
    q: `${(Number(p.qty) / 1e6).toLocaleString(locale, { maximumFractionDigits: 6 })} ${x('cotas', 'shares', 'cuotas')}`, pnl: result(p),
  })).filter(p => posFilter === 'all' || p.st === posFilter);

  const agents = [{ k: 'crypto', n: x('Núcleo interno Cripto', 'Internal Crypto core', 'Núcleo interno Cripto'), r: usdc(Number(CAPITAL.agentAllocated) / 1e6), s: x('Capital ilustrativo alocado, não lucro', 'Illustrative allocated capital, not profit', 'Capital ilustrativo asignado, no beneficio') }];
  const history = POSITIONS.filter(p => p.state === 'settled').map(p => ({
    k: 'crypto', d: new Date(p.at).toLocaleDateString(locale, { timeZone: 'America/Sao_Paulo' }),
    t: `${p.asset.toUpperCase()} · ${x('Posição encerrada de exemplo', 'Completed sample position', 'Posición cerrada de ejemplo')}`, v: result(p),
  })).filter(h => hist === 'all' || h.k === hist);

  const forecast = FORECASTS[asset.toLowerCase() as MarketAsset];
  const realized = POSITIONS.filter(p => p.asset.toUpperCase() === asset && p.state === 'settled')
    .reduce((s, p) => s + Number(p.exitValue) - Number(p.cost) - Number(p.fees), 0) / 1e6;
  const rowList = (items: [string, string, string][]) => <ul className="grid gap-2">{items.map(([a, b, c], i) => <li key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F0E9DA] p-3 text-sm"><span className="min-w-0 flex-1 font-bold">{a}</span><span className="text-xs text-[#5B6B85]">{b}</span><span className="font-bold text-[#0E7C6B]">{c}</span></li>)}</ul>;

  return (
    <section data-testid={compact ? 'home-trading-panel' : embedded ? 'central-markets' : 'mock-central-panel'} className="grid min-w-0 gap-4 rounded-2xl border border-[#E4DCCB] bg-[#FBF6E9] p-3 text-[#12372A] sm:p-6">
      {!embedded && <header className="flex flex-wrap items-start justify-between gap-2">
        <div><h2 className="text-lg font-bold">{compact ? x('Trading dos agentes', 'Agent trading', 'Trading de agentes') : x('Central de agentes', 'Agent hub', 'Central de agentes')}</h2>
          <p className="text-xs text-[#5B6B85]">{x('Dados ilustrativos de demonstração visual. Nada é executado.', 'Illustrative visual-demo data. Nothing is executed.', 'Datos ilustrativos de demostración visual. No se ejecuta nada.')}</p></div>
        <span className="rounded-full border border-[#C9A227] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#8A6D0B]">{x('Exemplo ilustrativo', 'Illustrative example', 'Ejemplo ilustrativo')}</span>
      </header>}

      {!compact && !embedded && <div className={`${card} border-[#C9A227]/60`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A6D0B]">{x('Orquestrador', 'Orchestrator', 'Orquestador')}</p>
        <h3 className="text-base font-bold">BETTEX</h3>
        <p className="text-sm text-[#5B6B85]">{x('Prioriza propostas dos agentes abaixo e registra decisões de exemplo.', 'Prioritizes proposals from the agents below and logs sample decisions.', 'Prioriza propuestas de los agentes abajo y registra decisiones de ejemplo.')}</p>
      </div>}

      <AgentTradingTabs id={compact ? 'home-agent-trading' : 'central-agent-trading'}>
      {!compact && <div role="tablist" aria-label={x('Áreas do agente Cripto', 'Crypto agent sections', 'Áreas del agente Cripto')} className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`min-h-10 shrink-0 rounded-xl px-3 text-sm font-bold ${tab === k ? 'bg-[#12372A] text-[#F2C14E]' : 'bg-[#F0E9DA]'}`}>{l}</button>)}
      </div>}

      <div role="tabpanel" className="grid gap-3">
        {tab === 'overview' && <>
          <div className="grid gap-3 sm:grid-cols-2">{agents.map(a => <button key={a.k} type="button" onClick={() => setTab(a.k as Tab)} className={`${card} text-left hover:border-[#C9A227]`}><p className="text-sm font-bold">{a.n}</p><p className="text-xl font-extrabold text-[#0E7C6B]">{a.r}</p><p className="text-xs text-[#5B6B85]">{a.s}</p></button>)}</div>
          <div className={card}><h3 className="mb-2 text-sm font-bold">{x('Decisões recentes', 'Recent decisions', 'Decisiones recientes')}</h3>
             {rowList([[x('Alocação vigente para Cripto', 'Current Crypto allocation', 'Asignación actual a Cripto'), x('Amostra ilustrativa', 'Illustrative sample', 'Muestra ilustrativa'), usdc(Number(CAPITAL.agentAllocated) / 1e6)]])}
          </div>
        </>}

        {tab === 'crypto' && <>
           <div className="flex gap-2">{ASSETS.map(k => <button key={k} type="button" aria-pressed={asset === k} onClick={() => setAsset(k)} className={`min-h-10 flex-1 rounded-xl text-sm font-bold ${asset === k ? 'bg-[#C9A227] text-[#12372A]' : 'bg-[#F0E9DA]'}`}>{k}</button>)}</div>
          <div className={card}>
             <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="text-lg font-extrabold">{asset} {usd(Number(forecast.spot))}</p><p className="text-xs">{x('Cotação de referência da amostra', 'Sample reference quote', 'Cotización de referencia de la muestra')}</p></div>
             <Spark data={forecast.series} label={`${asset} ${x('gráfico ilustrativo', 'illustrative chart', 'gráfico ilustrativo')}`} />
             <p className="text-sm">{x('Cenário hipotético de 8 horas; não valida vantagem, sinal de compra ou probabilidade de evento.', 'Hypothetical 8-hour scenario; it validates neither an edge, a buy signal nor an event probability.', 'Escenario hipotético de 8 horas; no valida ventaja, señal de compra ni probabilidad de evento.')}</p>
             <p className="text-sm"><b>{x('Resultado encerrado de exemplo', 'Closed sample result', 'Resultado cerrado de ejemplo')}:</b> <span className="font-bold text-[#0E7C6B]">{usdc(realized)}</span></p>
          </div>
          <div className={card}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold">{x('Posições', 'Positions', 'Posiciones')}</h3>
              <div className="flex gap-1">{(['all', 'open', 'closed'] as const).map(f => <button key={f} type="button" aria-pressed={posFilter === f} onClick={() => setPosFilter(f)} className={`min-h-9 rounded-lg px-2.5 text-xs font-bold ${posFilter === f ? 'bg-[#12372A] text-[#F2C14E]' : 'bg-[#F0E9DA]'}`}>{f === 'all' ? x('Todas', 'All', 'Todas') : f === 'open' ? x('Abertas', 'Open', 'Abiertas') : x('Encerradas', 'Closed', 'Cerradas')}</button>)}</div></div>
            <ul className="grid gap-2">{positions.map((p, i) => <li key={p.id} className="rounded-xl bg-[#F0E9DA] p-3 text-sm">
              <button type="button" aria-expanded={detail === i} onClick={() => setDetail(detail === i ? null : i)} className="flex w-full items-center justify-between gap-2 text-left font-bold"><span>{p.a} · {p.q}</span><span className="text-[#0E7C6B]">{p.pnl}</span></button>
               {detail === i && <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5B6B85]"><span>{p.st === 'open' ? x('Exemplo de posição em cotas; avaliação não é lucro realizado.', 'Sample share position; valuation is not realized profit.', 'Ejemplo de posición en cuotas; la valoración no es beneficio realizado.') : x('Encerrada com resultado positivo', 'Closed with positive result', 'Cerrada con resultado positivo')}</span></div>}
             </li>)}</ul>
             {positions.length === 0 && <p className="text-xs text-[#5B6B85]">{x('Nenhuma posição neste mercado e filtro.', 'No position in this market and filter.', 'Ninguna posición en este mercado y filtro.')}</p>}
          </div>
        </>}

        {tab === 'sports' && <div className={card}><h3 className="mb-2 text-sm font-bold">{x('Esportes', 'Sports', 'Deportes')}</h3>
          {rowList([[x('Surebet: Time A x Time B, mercado 1X2', 'Surebet: Team A v Team B, 1X2 market', 'Surebet: Equipo A vs Equipo B, mercado 1X2'), x('Margem 2,3%', 'Margin 2.3%', 'Margen 2,3%'), '+R$ 118,40'], [x('Cobertura: total de gols acima/abaixo', 'Hedge: total goals over/under', 'Cobertura: total de goles más/menos'), x('Margem 1,7%', 'Margin 1.7%', 'Margen 1,7%'), '+R$ 96,20']])}
        </div>}

        {tab === 'predictions' && <div className={card}><h3 className="mb-2 text-sm font-bold">{x('Previsões', 'Predictions', 'Predicciones')}</h3>
          {rowList([[x('Mercado A: resultado sim/não', 'Market A: yes/no outcome', 'Mercado A: resultado sí/no'), x('Prob. 62,5%', 'Prob. 62.5%', 'Prob. 62,5%'), '+R$ 41,30'], [x('Mercado B: faixa de valor', 'Market B: value range', 'Mercado B: rango de valor'), x('Prob. 48,1%', 'Prob. 48.1%', 'Prob. 48,1%'), '+R$ 55,50']])}
        </div>}

        {tab === 'bonus' && <div className={card}><h3 className="mb-2 text-sm font-bold">{x('Bônus', 'Bonus', 'Bonos')}</h3>
          <div role="progressbar" aria-valuenow={68} aria-valuemin={0} aria-valuemax={100} className="h-3 overflow-hidden rounded-full bg-[#F0E9DA]"><div className="h-full w-[68%] bg-[#0E7C6B]" /></div>
          <p className="mt-1 text-xs text-[#5B6B85]">{x('68,4% do requisito cumprido; custo estimado R$ 12,80', '68.4% of requirement met; estimated cost R$ 12.80', '68,4% del requisito cumplido; costo estimado R$ 12,80')}</p>
        </div>}

        {tab === 'history' && <div className={card}>
          <div className="mb-2 flex flex-wrap gap-1">{(['all', 'crypto'] as const).map(f => <button key={f} type="button" aria-pressed={hist === f} onClick={() => setHist(f)} className={`min-h-9 rounded-lg px-2.5 text-xs font-bold ${hist === f ? 'bg-[#12372A] text-[#F2C14E]' : 'bg-[#F0E9DA]'}`}>{f === 'all' ? x('Todos', 'All', 'Todos') : x('Cripto', 'Crypto', 'Cripto')}</button>)}</div>
          {rowList(history.map(h => [h.t, h.d, h.v]))}
        </div>}
      </div>
      </AgentTradingTabs>
    </section>
  );
}
export default MockCentralPanel;
