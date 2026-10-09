/** @jsxImportSource react */
import { useMemo, useState } from 'react';
import { useX } from '@/components/demo/ui';
import { AgentTradingTabs } from './AgentTradingTabs';

type Tab = 'overview' | 'crypto' | 'sports' | 'predictions' | 'bonus' | 'history';
type Asset = 'BTC' | 'ETH' | 'SOL';

const btn = 'inline-flex min-h-10 items-center justify-center rounded-xl bg-[#12372A] px-3 text-xs font-bold text-[#F2C14E] hover:bg-[#0C2A1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]';
const ghost = 'inline-flex min-h-10 items-center justify-center rounded-xl border border-[#12372A]/30 px-3 text-xs font-bold hover:bg-[#12372A]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A227]';
const card = 'min-w-0 rounded-2xl border border-[#E4DCCB] bg-white/50 p-3 sm:p-4';

const ASSETS: Record<Asset, { px: string; chg: number; sig: [string, string, string]; pnl: string; series: number[] }> = {
  BTC: { px: 'US$ 67.420,00', chg: 2.8, sig: ['Momentum de alta, volume acima da média', 'Upward momentum, above-average volume', 'Impulso alcista, volumen sobre el promedio'], pnl: '+US$ 312,40', series: [38, 42, 40, 47, 52, 50, 58, 63, 61, 70] },
  ETH: { px: 'US$ 3.215,50', chg: 1.4, sig: ['Rompimento de resistência local', 'Local resistance breakout', 'Ruptura de resistencia local'], pnl: '+US$ 128,15', series: [30, 33, 35, 34, 40, 44, 43, 49, 52, 55] },
  SOL: { px: 'US$ 148,72', chg: 4.1, sig: ['Fluxo comprador crescente', 'Growing buy flow', 'Flujo comprador creciente'], pnl: '+US$ 87,90', series: [20, 24, 23, 30, 35, 33, 41, 46, 50, 58] },
};

function Spark({ data, label }: { data: number[]; label: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${40 - ((v - min) / (max - min || 1)) * 36}`).join(' ');
  return <svg role="img" aria-label={label} viewBox="0 0 100 42" preserveAspectRatio="none" className="h-16 w-full"><polyline points={pts} fill="none" stroke="#0E7C6B" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg>;
}

export function MockCentralPanel({ onAction, compact = false }: { onAction: () => void; compact?: boolean }) {
  const { x, loc } = useX();
  const [tab, setTab] = useState<Tab>('crypto');
  const [asset, setAsset] = useState<Asset>('BTC');
  const [posFilter, setPosFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [detail, setDetail] = useState<number | null>(0);
  const [hist, setHist] = useState<'all' | 'crypto' | 'sports' | 'predictions' | 'bonus'>('all');

  const tabs: [Tab, string][] = [
    ['crypto', x('Mercados', 'Markets', 'Mercados')], ['overview', x('Visão geral', 'Overview', 'Resumen')], ['history', x('Histórico', 'History', 'Historial')],
  ];
  const act = (label: string, cls = btn) => <button type="button" data-demo-action onClick={onAction} className={cls}>{label}</button>;

  const positions = useMemo(() => [
    { id: 'p1', a: asset, st: 'open', q: '0,0120', pnl: '+US$ 42,10' },
    { id: 'p2', a: asset, st: 'open', q: '0,0450', pnl: '+US$ 18,75' },
    { id: 'p3', a: asset, st: 'closed', q: '0,0300', pnl: '+US$ 64,20' },
    { id: 'p4', a: asset, st: 'closed', q: '0,0080', pnl: '+US$ 9,30' },
  ].filter(p => posFilter === 'all' || p.st === posFilter), [asset, posFilter]);

  const agents = [
    { k: 'crypto', n: x('Cripto', 'Crypto', 'Cripto'), r: '+US$ 528,45', s: x('3 sinais ativos', '3 active signals', '3 señales activas') },
    { k: 'sports', n: x('Esportes', 'Sports', 'Deportes'), r: '+R$ 214,60', s: x('2 oportunidades de cobertura', '2 hedge opportunities', '2 oportunidades de cobertura') },
    { k: 'predictions', n: x('Previsões', 'Predictions', 'Predicciones'), r: '+R$ 96,80', s: x('4 mercados acompanhados', '4 tracked markets', '4 mercados seguidos') },
    { k: 'bonus', n: x('Bônus', 'Bonus', 'Bonos'), r: '+R$ 52,00', s: x('Progresso de requisito 68,4%', 'Requirement progress 68.4%', 'Progreso de requisito 68,4%') },
  ].filter(a => a.k === 'crypto');
  const history = [
    { k: 'crypto', d: '12/03', t: x('Compra spot SOL encerrada com lucro', 'SOL spot buy closed in profit', 'Compra spot SOL cerrada con ganancia'), v: '+US$ 87,90' },
    { k: 'sports', d: '11/03', t: x('Cobertura entre duas casas concluída', 'Two-book hedge completed', 'Cobertura entre dos casas completada'), v: '+R$ 48,20' },
    { k: 'predictions', d: '10/03', t: x('Mercado resolvido a favor da posição', 'Market resolved in favor of position', 'Mercado resuelto a favor de la posición'), v: '+R$ 31,40' },
    { k: 'bonus', d: '09/03', t: x('Etapa de requisito do bônus cumprida', 'Bonus requirement stage met', 'Etapa de requisito del bono cumplida'), v: '+R$ 20,00' },
    { k: 'crypto', d: '08/03', t: x('Compra spot BTC encerrada com lucro', 'BTC spot buy closed in profit', 'Compra spot BTC cerrada con ganancia'), v: '+US$ 64,20' },
    { k: 'sports', d: '06/03', t: x('Surebet de futebol liquidada', 'Football surebet settled', 'Surebet de fútbol liquidada'), v: '+R$ 73,10' },
  ].filter(h => h.k === 'crypto' && (hist === 'all' || h.k === hist));

  const A = ASSETS[asset];
  const rowList = (items: [string, string, string][]) => <ul className="grid gap-2">{items.map(([a, b, c], i) => <li key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F0E9DA] p-3 text-sm"><span className="min-w-0 flex-1 font-bold">{a}</span><span className="text-xs text-[#5B6B85]">{b}</span><span className="font-bold text-[#0E7C6B]">{c}</span></li>)}</ul>;

  return (
    <section data-testid={compact ? 'home-trading-panel' : 'mock-central-panel'} className="grid min-w-0 gap-4 rounded-2xl border border-[#E4DCCB] bg-[#FBF6E9] p-3 text-[#12372A] sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div><h2 className="text-lg font-bold">{compact ? x('Trading dos agentes', 'Agent trading', 'Trading de agentes') : x('Central de agentes', 'Agent hub', 'Central de agentes')}</h2>
          <p className="text-xs text-[#5B6B85]">{x('Dados ilustrativos de demonstração visual. Nada é executado.', 'Illustrative visual-demo data. Nothing is executed.', 'Datos ilustrativos de demostración visual. No se ejecuta nada.')}</p></div>
        <span className="rounded-full border border-[#C9A227] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#8A6D0B]">{x('Exemplo ilustrativo', 'Illustrative example', 'Ejemplo ilustrativo')}</span>
      </header>

      {!compact && <div className={`${card} border-[#C9A227]/60`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A6D0B]">{x('Orquestrador', 'Orchestrator', 'Orquestador')}</p>
        <h3 className="text-base font-bold">BETTEX</h3>
        <p className="text-sm text-[#5B6B85]">{x('Prioriza propostas dos agentes abaixo e registra decisões de exemplo.', 'Prioritizes proposals from the agents below and logs sample decisions.', 'Prioriza propuestas de los agentes abajo y registra decisiones de ejemplo.')}</p>
        <div className="mt-2 flex flex-wrap gap-2">{act(x('Enviar proposta', 'Submit proposal', 'Enviar propuesta'))}{act(x('Executar análise', 'Run inference', 'Ejecutar análisis'), ghost)}</div>
      </div>}

      <AgentTradingTabs id={compact ? 'home-agent-trading' : 'central-agent-trading'}>
      {!compact && <div role="tablist" aria-label={x('Áreas do agente Cripto', 'Crypto agent sections', 'Áreas del agente Cripto')} className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`min-h-10 shrink-0 rounded-xl px-3 text-sm font-bold ${tab === k ? 'bg-[#12372A] text-[#F2C14E]' : 'bg-[#F0E9DA]'}`}>{l}</button>)}
      </div>}

      <div role="tabpanel" className="grid gap-3">
        {tab === 'overview' && <>
          <div className="grid gap-3 sm:grid-cols-2">{agents.map(a => <button key={a.k} type="button" onClick={() => setTab(a.k as Tab)} className={`${card} text-left hover:border-[#C9A227]`}><p className="text-sm font-bold">{a.n}</p><p className="text-xl font-extrabold text-[#0E7C6B]">{a.r}</p><p className="text-xs text-[#5B6B85]">{a.s}</p></button>)}</div>
          <div className={card}><h3 className="mb-2 text-sm font-bold">{x('Decisões recentes', 'Recent decisions', 'Decisiones recientes')}</h3>
            {rowList([[x('Alocação sugerida para Cripto', 'Suggested allocation to Crypto', 'Asignación sugerida a Cripto'), x('Proposta', 'Proposed', 'Propuesta'), '+US$ 528']])}
            <div className="mt-2 flex flex-wrap gap-2">{act(x('Aprovar', 'Approve', 'Aprobar'))}{act(x('Rejeitar', 'Reject', 'Rechazar'), ghost)}{act(x('Alocar', 'Allocate', 'Asignar'), ghost)}</div></div>
        </>}

        {tab === 'crypto' && <>
          <div className="flex gap-2">{(Object.keys(ASSETS) as Asset[]).map(k => <button key={k} type="button" aria-pressed={asset === k} onClick={() => setAsset(k)} className={`min-h-10 flex-1 rounded-xl text-sm font-bold ${asset === k ? 'bg-[#C9A227] text-[#12372A]' : 'bg-[#F0E9DA]'}`}>{k}</button>)}</div>
          <div className={card}>
            <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="text-lg font-extrabold">{asset} {A.px}</p><p className="font-bold text-[#0E7C6B]">+{A.chg.toLocaleString('pt-BR')}%</p></div>
            <Spark data={A.series} label={`${asset} ${x('gráfico ilustrativo', 'illustrative chart', 'gráfico ilustrativo')}`} />
            <p className="text-sm"><b>{x('Sinal', 'Signal', 'Señal')}:</b> {A.sig[loc === 'pt' ? 0 : loc === 'en' ? 1 : 2]}</p>
            <p className="text-sm"><b>{x('Resultado de exemplo', 'Sample result', 'Resultado de ejemplo')}:</b> <span className="font-bold text-[#0E7C6B]">{A.pnl}</span></p>
            <div className="mt-2 flex flex-wrap gap-2">{act(x('Enviar ordem', 'Place order', 'Enviar orden'))}{act(x('Cancelar ordem', 'Cancel order', 'Cancelar orden'), ghost)}</div>
          </div>
          <div className={card}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold">{x('Posições', 'Positions', 'Posiciones')}</h3>
              <div className="flex gap-1">{(['all', 'open', 'closed'] as const).map(f => <button key={f} type="button" aria-pressed={posFilter === f} onClick={() => setPosFilter(f)} className={`min-h-9 rounded-lg px-2.5 text-xs font-bold ${posFilter === f ? 'bg-[#12372A] text-[#F2C14E]' : 'bg-[#F0E9DA]'}`}>{f === 'all' ? x('Todas', 'All', 'Todas') : f === 'open' ? x('Abertas', 'Open', 'Abiertas') : x('Encerradas', 'Closed', 'Cerradas')}</button>)}</div></div>
            <ul className="grid gap-2">{positions.map((p, i) => <li key={p.id} className="rounded-xl bg-[#F0E9DA] p-3 text-sm">
              <button type="button" aria-expanded={detail === i} onClick={() => setDetail(detail === i ? null : i)} className="flex w-full items-center justify-between gap-2 text-left font-bold"><span>{p.a} · {p.q}</span><span className="text-[#0E7C6B]">{p.pnl}</span></button>
              {detail === i && <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5B6B85]"><span>{p.st === 'open' ? x('Em andamento, spot sem alavancagem', 'In progress, spot without leverage', 'En curso, spot sin apalancamiento') : x('Encerrada com resultado positivo', 'Closed with positive result', 'Cerrada con resultado positivo')}</span>{p.st === 'open' && act(x('Fechar posição', 'Close position', 'Cerrar posición'), ghost)}</div>}
            </li>)}</ul>
          </div>
        </>}

        {tab === 'sports' && <div className={card}><h3 className="mb-2 text-sm font-bold">{x('Esportes', 'Sports', 'Deportes')}</h3>
          {rowList([[x('Surebet: Time A x Time B, mercado 1X2', 'Surebet: Team A v Team B, 1X2 market', 'Surebet: Equipo A vs Equipo B, mercado 1X2'), x('Margem 2,3%', 'Margin 2.3%', 'Margen 2,3%'), '+R$ 118,40'], [x('Cobertura: total de gols acima/abaixo', 'Hedge: total goals over/under', 'Cobertura: total de goles más/menos'), x('Margem 1,7%', 'Margin 1.7%', 'Margen 1,7%'), '+R$ 96,20']])}
          <div className="mt-2 flex flex-wrap gap-2">{act(x('Enviar solicitação', 'Submit request', 'Enviar solicitud'))}{act(x('Aprovar', 'Approve', 'Aprobar'), ghost)}{act(x('Rejeitar', 'Reject', 'Rechazar'), ghost)}</div></div>}

        {tab === 'predictions' && <div className={card}><h3 className="mb-2 text-sm font-bold">{x('Previsões', 'Predictions', 'Predicciones')}</h3>
          {rowList([[x('Mercado A: resultado sim/não', 'Market A: yes/no outcome', 'Mercado A: resultado sí/no'), x('Prob. 62,5%', 'Prob. 62.5%', 'Prob. 62,5%'), '+R$ 41,30'], [x('Mercado B: faixa de valor', 'Market B: value range', 'Mercado B: rango de valor'), x('Prob. 48,1%', 'Prob. 48.1%', 'Prob. 48,1%'), '+R$ 55,50']])}
          <div className="mt-2 flex flex-wrap gap-2">{act(x('Enviar posição', 'Submit position', 'Enviar posición'))}{act(x('Cancelar ordem', 'Cancel order', 'Cancelar orden'), ghost)}</div></div>}

        {tab === 'bonus' && <div className={card}><h3 className="mb-2 text-sm font-bold">{x('Bônus', 'Bonus', 'Bonos')}</h3>
          <div role="progressbar" aria-valuenow={68} aria-valuemin={0} aria-valuemax={100} className="h-3 overflow-hidden rounded-full bg-[#F0E9DA]"><div className="h-full w-[68%] bg-[#0E7C6B]" /></div>
          <p className="mt-1 text-xs text-[#5B6B85]">{x('68,4% do requisito cumprido; custo estimado R$ 12,80', '68.4% of requirement met; estimated cost R$ 12.80', '68,4% del requisito cumplido; costo estimado R$ 12,80')}</p>
          <div className="mt-2 flex flex-wrap gap-2">{act(x('Enviar solicitação', 'Submit request', 'Enviar solicitud'))}{act(x('Alterar política', 'Change policy', 'Cambiar política'), ghost)}</div></div>}

        {tab === 'history' && <div className={card}>
          <div className="mb-2 flex flex-wrap gap-1">{(['all', 'crypto'] as const).map(f => <button key={f} type="button" aria-pressed={hist === f} onClick={() => setHist(f)} className={`min-h-9 rounded-lg px-2.5 text-xs font-bold ${hist === f ? 'bg-[#12372A] text-[#F2C14E]' : 'bg-[#F0E9DA]'}`}>{f === 'all' ? x('Todos', 'All', 'Todos') : x('Cripto', 'Crypto', 'Cripto')}</button>)}</div>
          {rowList(history.map(h => [h.t, h.d, h.v]))}
          <div className="mt-2">{act(x('Gerar relatório', 'Generate report', 'Generar informe'))} {act(x('Exportar', 'Export', 'Exportar'), ghost)}</div></div>}
      </div>
      </AgentTradingTabs>
    </section>
  );
}
export default MockCentralPanel;
