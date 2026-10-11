/** @jsxImportSource react */
import { useState } from 'react';
import { useFmt, card, KV, Tag, dec6 } from '../alpha-trading/format';
import { CAPITAL, POLICY, FORECASTS, type Asset } from './central-data';
import { useL } from './CentralAgents';

const num = (v: string) => Number(v) / 1e6;

export function CentralCapital({ onAction }: { onAction: () => void }) {
  const { x, loc } = useFmt(); const L = useL(); const lc = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const u = (v: string) => `${dec6(v, lc)} USDC`;
  const pctOf = (v: string, whole: string) => `${(num(v) / (num(whole) || 1) * 100).toFixed(2)}%`;
  const positions = String(Number(CAPITAL.agentCommitted) - Number(CAPITAL.orderReserved));
  const treasury: [string, string, string, string][] = [
    [x('Reserva protegida', 'Protected reserve', 'Reserva protegida'), CAPITAL.reserve, '#12372A', 'b'],
    [x('Liquidez do pool', 'Pool liquidity', 'Liquidez del pool'), CAPITAL.pool, '#5B6B85', 'p'],
    [x('Comprometido', 'Committed', 'Comprometido'), CAPITAL.reserved, '#C9A227', 'c'],
    [x('Livre', 'Free', 'Libre'), CAPITAL.available, '#0E7C6B', 'f'],
  ];
  const crypto: [string, string, string][] = [
    [x('Em posições', 'In positions', 'En posiciones'), positions, '#12372A'],
    [x('Reservado em ordens abertas', 'Reserved in open orders', 'Reservado en órdenes abiertas'), CAPITAL.orderReserved, '#C9A227'],
    [x('Livre', 'Free', 'Libre'), CAPITAL.agentAvailable, '#0E7C6B'],
  ];
  return <section className={card} data-testid="alpha-capital" aria-label={x('Capital e controles de risco', 'Capital and risk controls', 'Capital y controles de riesgo')}>
    <h2 className="display text-lg font-extrabold">{x('Capital e controles de risco', 'Capital and risk controls', 'Capital y controles de riesgo')}</h2>
    <p className="mt-1 text-xs text-[#5B6B85]">{x('Capital e limites pertencem à política e à tesouraria, não aos agentes. A tesouraria inteira não é o capital do agente Cripto.', 'Capital and limits belong to policy and the Treasury, not to agents. The whole Treasury is not the Crypto agent’s capital.', 'El capital y los límites pertenecen a la política y la tesorería, no a los agentes. La tesorería completa no es el capital del agente Cripto.')}</p>
    <h3 className="mt-3 font-bold">{x('Tesouraria inteira', 'Whole Treasury', 'Tesorería completa')}</h3>
    <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3" data-testid="capital-treasury">
      <KV k={x('Ativos totais', 'Total assets', 'Activos totales')} v={u(CAPITAL.total)} />
      <KV k={x('Capital de trabalho', 'Working capital', 'Capital de trabajo')} v={u(CAPITAL.allocated)} />
      <KV k={x('Comprometido, incluindo posições', 'Committed, including positions', 'Comprometido, incluyendo posiciones')} v={u(CAPITAL.reserved)} />
      <KV k={x('Livre do trabalho', 'Free working capital', 'Libre del trabajo')} v={u(CAPITAL.available)} />
      <KV k={x('Reserva protegida', 'Protected reserve', 'Reserva protegida')} v={u(CAPITAL.reserve)} />
      <KV k={x('Liquidez do pool', 'Pool liquidity', 'Liquidez del pool')} v={u(CAPITAL.pool)} /></dl>
    <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-[#EFE9DA]" role="img" aria-label={x('Divisão dos ativos totais da tesouraria', 'Split of total Treasury assets', 'División de los activos totales de la tesorería')}>
      {treasury.map(([k, v, c]) => <div key={k} style={{ width: pctOf(v, CAPITAL.total), background: c }} />)}</div>
    <ul className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-[#5B6B85]">{treasury.map(([k, v, c]) => <li key={k}><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: c }} />{k} {pctOf(v, CAPITAL.total)}</li>)}</ul>
    <p className="mt-1 text-[11px] text-[#5B6B85]">{x('Soma das quatro faixas = ativos totais. O comprometido já inclui as posições; a recompra é carteira separada e fica fora.', 'The four bands sum to total assets. Committed already includes positions; the buyback is a separate wallet and stays outside.', 'La suma de las cuatro franjas es igual a los activos totales. Lo comprometido ya incluye las posiciones; la recompra es una cartera separada y queda fuera.')}</p>
    <h3 className="mt-4 font-bold">{x('Carteira do agente Cripto', 'Crypto agent wallet', 'Cartera del agente Cripto')}</h3>
    <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3" data-testid="capital-crypto">
      <KV k={x('Alocado ao Cripto', 'Allocated to Crypto', 'Asignado a Cripto')} v={u(CAPITAL.agentAllocated)} />
      <KV k={x('Comprometido do Cripto', 'Crypto committed', 'Comprometido de Cripto')} v={u(CAPITAL.agentCommitted)} />
      <KV k={x('Livre do Cripto', 'Crypto free', 'Libre de Cripto')} v={u(CAPITAL.agentAvailable)} /></dl>
    <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-[#EFE9DA]" role="img" aria-label={x('Divisão do capital alocado ao Cripto', 'Split of capital allocated to Crypto', 'División del capital asignado a Cripto')}>
      {crypto.map(([k, v, c]) => <div key={k} style={{ width: pctOf(v, CAPITAL.agentAllocated), background: c }} />)}</div>
    <ul className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-[#5B6B85]">{crypto.map(([k, v, c]) => <li key={k}><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: c }} />{k} {u(v)}</li>)}</ul>
    <div className="mt-3"><p className="text-sm font-bold">{x('Exposição do Cripto', 'Crypto exposure', 'Exposición de Cripto')}</p>
      <ul className="mt-1 grid gap-1 text-sm" data-testid="capital-exposure">{CAPITAL.exposure.map(e => <li key={e.asset}>{e.asset.toUpperCase()} · {POLICY.strategy} · {u(e.units)}</li>)}
        <li>{x('Reserva de ordens abertas', 'Open-order reserve', 'Reserva de órdenes abiertas')} · {u(CAPITAL.orderReserved)}</li>
        <li className="font-bold">{x('Total comprometido do Cripto', 'Crypto committed total', 'Total comprometido de Cripto')} · {u(CAPITAL.agentCommitted)}</li></ul></div>
    <h3 className="mt-4 font-bold">{x('Controles de risco', 'Risk controls', 'Controles de riesgo')}</h3>
    <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3" data-testid="risk-controls">
      <KV k={x('Versão', 'Version', 'Versión')} v={`${POLICY.version} / ${POLICY.strategy}`} /><KV k={x('Máx. por ordem', 'Max per order', 'Máx. por orden')} v={u(POLICY.maxOrder)} />
      <KV k={x('Máx. correlacionado', 'Max correlated', 'Máx. correlacionado')} v={u(POLICY.maxCorrelated)} /><KV k={x('Máx. portfólio', 'Max portfolio', 'Máx. portafolio')} v={u(POLICY.maxPortfolio)} />
      <KV k={x('Defensivo', 'Defensive', 'Defensivo')} v={u(POLICY.defensive)} /><KV k={x('Idade máx. da cotação', 'Max quote age', 'Edad máx. de cotización')} v={`${POLICY.maxQuoteAge} s`} /></dl>
    <ul className="mt-2 list-disc pl-5 text-sm"><li>{x('Cotações mais antigas que o limite de idade não são usadas.', 'Quotes older than the age limit are not used.', 'Las cotizaciones más antiguas que el límite de edad no se usan.')}</li><li>{x('Limites por ordem, por grupo correlacionado e por carteira.', 'Limits per order, per correlated group and per portfolio.', 'Límites por orden, por grupo correlacionado y por cartera.')}</li></ul>
    <h3 className="mt-4 font-bold">{x('Políticas efetivas por especialista', 'Effective policies by specialist', 'Políticas efectivas por especialista')}</h3>
    <ul className="mt-2 grid gap-2 sm:grid-cols-3">{(['btc', 'eth', 'sol'] as Asset[]).map(a => <li key={a} className="rounded-xl border border-[#E4DCCB] p-3 text-sm"><b>{a.toUpperCase()}</b> · <Tag>{x('Ativa', 'Active', 'Activa')}</Tag><p className="mt-1 break-all font-mono text-[11px]">demo-policy-{a}-effective-001</p></li>)}</ul>
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" data-demo-action data-testid="button-config-save" onClick={onAction} className="min-h-11 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white">{x('Salvar configuração', 'Save configuration', 'Guardar configuración')}</button>
      <button type="button" data-demo-action data-testid="button-capital-allocate" onClick={onAction} className="min-h-11 rounded-xl border border-[#0E7C6B] px-4 text-sm font-bold text-[#0A6657]">{x('Alterar alocação', 'Change allocation', 'Cambiar asignación')}</button></div>
  </section>;
}

export function CentralForecast() {
  const { x, loc } = useFmt(); const L = useL(); const lc = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const [a, setA] = useState<Asset>('btc'); const [hover, setHover] = useState<number | null>(null);
  const d = FORECASTS[a]; const mn = Math.min(...d.series), mx = Math.max(...d.series);
  const pts = d.series.map((v, i) => [10 + i * (280 / (d.series.length - 1)), 100 - ((v - mn) / (mx - mn || 1)) * 80] as const);
  const fmt = (v: number) => v.toLocaleString(lc, { style: 'currency', currency: 'USD' });
  const h = hover ?? d.series.length - 1;
  return <section className={card} data-testid="allora-analysis"><h2 className="display text-lg font-extrabold">{x('Análise Allora: previsão de preço', 'Allora analysis: price forecast', 'Análisis Allora: previsión de precio')}</h2>
    <p className="mt-1 text-xs text-[#5B6B85]">{x('Série de 8 horas; não é probabilidade de evento.', '8-hour series; not an event probability.', 'Serie de 8 horas; no es probabilidad de evento.')}</p>
    <div className="mt-2 flex gap-2">{(['btc', 'eth', 'sol'] as Asset[]).map(k => <button key={k} type="button" aria-pressed={a === k} onClick={() => { setA(k); setHover(null); }} className={`min-h-11 flex-1 rounded-xl text-sm font-bold ${a === k ? 'bg-[#0E7C6B] text-white' : 'border border-[#E4DCCB]'}`}>{k.toUpperCase()}</button>)}</div>
    <svg viewBox="0 0 300 110" className="mt-3 h-40 w-full" role="img" aria-label={x('Previsão', 'Forecast', 'Previsión')}>
      <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke="#0E7C6B" strokeWidth="2" />
      {pts.map((p, i) => <g key={i}><circle cx={p[0]} cy={p[1]} r={i === h ? 5 : 3} fill="#0E7C6B" /><circle cx={p[0]} cy={p[1]} r="14" fill="transparent" tabIndex={0} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onClick={() => setHover(i)} /></g>)}</svg>
    <p className="text-sm"><b>{x('Ponto', 'Point', 'Punto')} +{h}h:</b> {fmt(d.series[h])} · {x('cotação de referência', 'reference quote', 'cotización de referencia')} {fmt(Number(d.spot))} · {x('bloco', 'block', 'bloque')} <span className="mono">{d.block}</span></p></section>;
}
