/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { ArrowDownToLine, ArrowLeftRight, Banknote, Send, QrCode, Radio, Layers, Clock3 } from 'lucide-react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { AGENTS, useX } from './ui';
import { Money, Term, useMoney, type Kind } from './fin';
import { formatBrazilDateTime, formatBrazilTime } from './brazil-time';

const card = 'dcard p-4 sm:p-5';
export const H = ({ children, sub }: { children: ReactNode; sub?: ReactNode }) => <div className="mb-3"><h2 className="display text-lg font-extrabold tracking-tight">{children}</h2>{sub && <p className="text-sm text-[#5B6B85]">{sub}</p>}</div>;
const agentName = (id: string, tx: (t: readonly [string, string, string]) => string) => { const a = (AGENTS as Record<string, { name: readonly [string, string, string] }>)[id]; return a ? tx(a.name) : id; };

function useLabels() {
  const { x } = useX();
  const kind = (k: string) => ({ receive: x('Recebimento', 'Received', 'Recibido'), onramp: x('Saldo adicionado', 'Balance added', 'Saldo agregado'), swap: x('Troca', 'Swap', 'Cambio'), withdraw: x('Saque USDC', 'USDC withdrawal', 'Retiro USDC'), send: x('Envio', 'Sent', 'Envío'), distribution: x('Distribuição', 'Distribution', 'Distribución') } as Record<string, string>)[k] ?? k;
  const mstat = (s: string) => ({ pending: x('Processando', 'Processing', 'Procesando'), confirmed: x('Confirmado', 'Confirmed', 'Confirmado'), failed: x('Falhou', 'Failed', 'Falló') } as Record<string, string>)[s] ?? s;
  const ev = (k: string) => ({ signal: x('sinal', 'signal', 'señal'), risk_check: x('checagem de risco', 'risk check', 'chequeo de riesgo'), approved: x('aprovou', 'approved', 'aprobó'), order: x('ordem', 'order', 'orden'), result: x('resultado', 'result', 'resultado'), rejected: x('rejeitou', 'rejected', 'rechazó'), reconciliation: x('conciliação', 'reconciliation', 'conciliación'), cycle_closed: x('ciclo encerrado', 'cycle closed', 'ciclo cerrado') } as Record<string, string>)[k] ?? k;
  const ost = (s: string) => ({ analyzing: x('Em análise', 'Analyzing', 'En análisis'), validated: x('Validada', 'Validated', 'Validada'), open: x('Aberta', 'Open', 'Abierta'), reconciling: x('Conciliando', 'Reconciling', 'Conciliando'), closed: x('Encerrada', 'Closed', 'Cerrada'), rejected: x('Rejeitada', 'Rejected', 'Rechazada') } as Record<string, string>)[s] ?? s;
  return { kind, mstat, ev, ost };
}
function useTime() { const { loc } = useX(); const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES'; return (s: string, long = false) => long ? formatBrazilDateTime(s, fl, { dateStyle: 'medium', timeStyle: 'short' }) : formatBrazilTime(s, fl); }

export function Feed({ d, limit }: { d: DemoDashboard; limit: number }) {
  const { x, tx } = useX(); const L = useLabels(); const tm = useTime();
  return <ol className="grid gap-1.5" aria-live="polite" data-testid="list-feed">{d.events.slice(0, limit).map(e => <li key={e.id} className="demo-in flex flex-wrap items-baseline gap-x-2 rounded-xl bg-[#F5F1E8] px-3 py-2 text-sm"><span className="mono text-[11px] text-[#5B6B85]">{tm(e.at)} · {x('Horário do Brasil', 'Brazil time', 'Horario de Brasil')}</span><span className="font-bold">{agentName(e.fromAgent, tx)}</span><span aria-hidden="true">→</span><span className="font-bold">{agentName(e.toAgent, tx)}</span><span className="rounded-full bg-[#DDEBE4] px-2 text-xs font-semibold text-[#0A6657]">{L.ev(e.kind)}</span><span className="mono text-[11px] text-[#5B6B85]">{x('ref.', 'ref.', 'ref.')} {e.reference}</span></li>)}</ol>;
}
export function History({ d, limit }: { d: DemoDashboard; limit?: number }) {
  const { x } = useX(); const L = useLabels(); const tm = useTime();
  const rows = limit ? d.history.slice(0, limit) : d.history;
  if (!rows.length) return <p className="rounded-xl bg-[#F5F1E8] p-4 text-sm text-[#5B6B85]">{x('Nenhuma movimentação ainda.', 'No movements yet.', 'Aún no hay movimientos.')}</p>;
  return <ul className="divide-y divide-[#EBE3D1]" data-testid="list-history">{rows.map(h => <li key={h.id} data-testid={`movement-${h.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3">
    <div className="min-w-0">
      <p className="text-sm font-bold">{L.kind(h.kind)}{h.kind === 'swap' ? (h.asset === 'USDC' ? ' · BETTEX → USDC' : ' · USDC → BETTEX') : ''}</p>
      <p className="break-all text-xs text-[#5B6B85]">{tm(h.at, true)} · <span className={h.status === 'pending' ? 'font-bold text-[#B4701A]' : h.status === 'failed' ? 'font-bold text-[#B4421A]' : ''}>{L.mstat(h.status)}</span>{h.destination ? ` · ${h.destination}` : ''}</p>
      {h.kind === 'swap' && h.sourceAmount !== undefined && h.sourceAsset && <p className="flex flex-wrap items-center gap-1 text-xs text-[#5B6B85]">{x('De', 'From', 'De')} <Money v={h.sourceAmount} a={h.sourceAsset} /> {x('para', 'to', 'a')} <Money v={h.amount} a={h.asset} /></p>}
      {h.feeUsdc > 0 && <p className="text-xs text-[#5B6B85]">{x('Tarifa', 'Fee', 'Tarifa')}: <Money v={h.feeUsdc} a="USDC" precision={h.feeUsdc < .01 ? 6 : 2} /></p>}
    </div><Money v={h.amount} a={h.asset} />
  </li>)}</ul>;
}
export function OpsSummary({ d }: { d: DemoDashboard }) {
  const { x } = useX(); const { num, brl } = useMoney();
  const active = d.operations.filter(o => o.status !== 'closed' && o.status !== 'rejected');
  const cap = active.reduce((s, o) => s + o.capitalUsdc, 0); const pnl = d.operations.reduce((s, o) => s + o.pnlUsdc, 0);
  const cells: [string, ReactNode][] = [[x('Operações ativas', 'Active operations', 'Operaciones activas'), <span key="a" className="display text-2xl font-extrabold">{active.length}<span className="text-sm font-semibold text-[#5B6B85]"> / {d.operations.length}</span></span>], [x('Capital em uso', 'Capital in use', 'Capital en uso'), <Money key="c" v={cap} a="USDC" big />], [x('Resultado das operações', 'Operations result', 'Resultado de operaciones'), <Money key="p" v={pnl} a="USDC" big signed />], [x('Resultado do ciclo', 'Cycle result', 'Resultado del ciclo'), <Money key="r" v={d.treasury.cycleResultUsdc} a="USDC" big signed />]];
  void num; void brl;
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cells.map(([l, v]) => <div key={l} className={card}><p className="mb-1 text-xs font-semibold text-[#5B6B85]">{l}</p>{v}</div>)}</div>;
}
export function Operations({ d }: { d: DemoDashboard }) {
  const { tx, x } = useX(); const L = useLabels(); const tm = useTime();
  return <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="text-xs text-[#5B6B85]"><tr><th className="py-2">{x('Agente', 'Agent', 'Agente')}</th><th>{x('Mercado', 'Market', 'Mercado')}</th><th>{x('Estado', 'Status', 'Estado')}</th><th>{x('Capital', 'Capital', 'Capital')}</th><th>{x('Resultado', 'Result', 'Resultado')}</th><th>{x('Atualizada', 'Updated', 'Actualizada')}</th></tr></thead><tbody className="divide-y divide-[#EBE3D1]">{d.operations.map(o => <tr key={o.id} data-testid={`row-operation-${o.id}`}><td className="py-3 font-bold">{agentName(o.agent, tx)}</td><td>{o.market}</td><td>{L.ost(o.status)}</td><td><Money v={o.capitalUsdc} a="USDC" /></td><td><Money v={o.pnlUsdc} a="USDC" signed /></td><td className="mono text-xs">{tm(o.updatedAt)}</td></tr>)}</tbody></table></div>;
}
export function TreasuryBlock({ d }: { d: DemoDashboard }) {
  const { x } = useX(); const t = d.treasury;
  const c: [ReactNode, number][] = [[<Term key="1" tip={x('Tudo que a tesouraria detém, somando reserva e capital em operações.', 'Everything the treasury holds: reserve plus capital in operations.', 'Todo lo que tiene la tesorería: reserva más capital en operaciones.')}>{x('Ativos', 'Assets', 'Activos')}</Term>, t.assetsUsdc], [<Term key="2" tip={x('Parte mantida de lado para dar segurança, sem operar.', 'Part kept aside for safety, not traded.', 'Parte guardada por seguridad, sin operar.')}>{x('Reserva', 'Reserve', 'Reserva')}</Term>, t.reserveUsdc], [x('Comprometido', 'Committed', 'Comprometido'), t.committedUsdc], [x('Realizado', 'Realized', 'Realizado'), t.realizedUsdc]];
  c.push([x('Resultado do ciclo', 'Cycle result', 'Resultado del ciclo'), t.cycleResultUsdc]);
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{c.map(([l, v], i) => <div key={i} className={card}><p className="mb-1 text-xs font-semibold text-[#5B6B85]">{l}</p><Money v={v} a="USDC" big /></div>)}</div>;
}
export function Rounds({ d }: { d: DemoDashboard }) {
  const { x } = useX(); const tm = useTime();
  return <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="text-xs text-[#5B6B85]"><tr><th className="py-2">{x('Rodada', 'Round', 'Ronda')}</th><th>{x('Estado', 'Status', 'Estado')}</th><th>{x('Elegível', 'Eligible', 'Elegible')}</th><th>{x('Participação', 'Staking', 'Participación')}</th><th>{x('Tesouraria', 'Treasury', 'Tesorería')}</th><th><Term tip={x('BETTEX comprado no mercado e queimado de forma permanente.', 'BETTEX bought on the market and permanently burned.', 'BETTEX comprado en el mercado y quemado permanentemente.')}>{x('Recompra', 'Buyback', 'Recompra')}</Term></th></tr></thead><tbody className="divide-y divide-[#EBE3D1]">{d.rounds.map(r => <tr key={r.id} data-testid={`row-round-${r.id}`}><td className="py-3"><b>{r.id}</b><br /><span className="text-xs text-[#5B6B85]">{tm(r.endedAt, true)}</span></td><td>{r.status === 'paid' ? x('Distribuída', 'Paid', 'Distribuida') : x('Retida', 'Retained', 'Retenida')}</td><td><Money v={r.eligibleUsdc} a="USDC" /></td><td><Money v={r.stakingUsdc} a="USDC" /></td><td><Money v={r.treasuryUsdc} a="USDC" /></td><td><Money v={r.buybackUsdc} a="USDC" /></td></tr>)}</tbody></table></div>;
}
export function Staking({ d, now }: { d: DemoDashboard; now: () => number }) {
  const { x, loc } = useX(); const { num } = useMoney(); const s = d.staking;
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const ms = Math.max(0, Date.parse(s.nextCycleAt) - now()); const p = (v: number) => String(Math.floor(v)).padStart(2, '0');
  const cd = `${p(ms / 3600000)}:${p((ms % 3600000) / 60000)}:${p((ms % 60000) / 1000)}`;
  const since = s.since ? formatBrazilDateTime(s.since, fl, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  const elig = s.since ? Math.max(0, now() - Date.parse(s.since)) : 0; const eh = Math.floor(elig / 3600000);
  return <div className="grid gap-3 lg:grid-cols-3">
    <div className={`${card} lg:col-span-2`}><div className="flex items-center justify-between"><p className="text-xs font-semibold text-[#5B6B85]">{x('Em participação', 'Staked', 'En participación')}</p><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${s.status === 'active' ? 'bg-[#DDEBE4] text-[#0A6657]' : 'bg-[#F0E9DA] text-[#5B6B85]'}`}>{s.status === 'active' ? x('Ativa', 'Active', 'Activa') : x('Inativa', 'Inactive', 'Inactiva')}</span></div>
      <div className="mt-1"><Money v={s.eligibleTokens} a="BETTEX" big /></div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-xs text-[#5B6B85]"><Term tip={x('Tempo desde que seus tokens passaram a contar para a participação.', 'Time since your tokens started counting toward staking.', 'Tiempo desde que tus tokens empezaron a contar.')}>{x('Tempo elegível', 'Eligible time', 'Tiempo elegible')}</Term></dt><dd className="font-bold">{eh} h <span className="font-normal text-[#5B6B85]">· {x('desde', 'since', 'desde')} {since}</span></dd></div>
        <div><dt className="text-xs text-[#5B6B85]"><Term tip={x('Tokens multiplicados pelo tempo parado. Quanto maior, maior sua fatia do ciclo.', 'Tokens times time held. The higher, the larger your share of the cycle.', 'Tokens por tiempo mantenido. Mayor peso, mayor tu parte del ciclo.')}>{x('Peso acumulado', 'Accumulated weight', 'Peso acumulado')}</Term></dt><dd className="font-bold">{num(s.weightTokenSeconds, 0)} <span className="mono text-xs font-normal text-[#5B6B85]">{x('token·s', 'token·s', 'token·s')}</span></dd></div></dl></div>
    <div className={card}><p className="flex items-center gap-1.5 text-xs font-semibold text-[#5B6B85]"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{x('Próximo ciclo diário', 'Next daily cycle', 'Próximo ciclo diario')}</p><p className="display mt-1 text-3xl font-extrabold tabular-nums" data-testid="text-countdown">{cd}</p><p className="mono text-xs text-[#5B6B85]">{formatBrazilDateTime(s.nextCycleAt, fl)} · {x('Horário do Brasil', 'Brazil time', 'Horario de Brasil')}</p></div>
    <div className={`${card} lg:col-span-3`}><p className="text-xs font-semibold text-[#5B6B85]"><Term tip={x('Cálculo com base no peso atual e no resultado do ciclo. Pode mudar e não é garantia de pagamento.', 'Calculated from your current weight and the cycle result. It can change and is not a payment guarantee.', 'Cálculo según tu peso actual y el resultado del ciclo. Puede cambiar y no garantiza pago.')}>{x('Estimativa condicional', 'Conditional estimate', 'Estimación condicional')}</Term></p><div className="mt-1"><Money v={s.estimatedUsdc} a="USDC" big /></div><p className="mt-2 text-sm text-[#5B6B85]">{x('Só será paga se o ciclo tiver resultado positivo e você continuar elegível. Nunca é garantida.', 'Paid only if the cycle has a positive result and you stay eligible. Never guaranteed.', 'Solo se paga si el ciclo tiene resultado positivo y sigues elegible. Nunca garantizada.')}</p></div>
  </div>;
}
export const ACTIONS: [Kind, string, string, string, typeof Send][] = [
  ['onramp', 'Adicionar saldo', 'Add balance', 'Agregar saldo', Banknote], ['receive', 'Receber', 'Receive', 'Recibir', QrCode], ['swap', 'Trocar', 'Swap', 'Cambiar', ArrowLeftRight], ['withdraw', 'Resgatar rendimento', 'Withdraw yield', 'Retirar rendimiento', ArrowDownToLine], ['send', 'Enviar', 'Send', 'Enviar', Send]];
export { Radio, Layers };
