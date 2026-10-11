/** @jsxImportSource react */
import { useMemo, useState, type ReactNode } from 'react';
import type { DemoTreasuryActivityItem, DemoTreasuryRound } from '@workspace/api-client-react';
import { AGENTS, useX } from '../demo/ui';
import { Money, useMoney } from '../demo/fin';
import { formatBrazilDateTime } from '../demo/brazil-time';
import { RoundIdentity } from '../demo/RoundIdentity';
import { roundActivity } from './treasury-demo-data';

type View = 'closed' | 'fees' | 'history';
const PAGE_SIZE = 20;
const prec = (v: number) => Number(v.toFixed(2)) !== v ? 6 : 2;

export function TreasuryDemoActivity({ snapshot, endAt, header }: { snapshot: DemoTreasuryRound; endAt: string; header?: ReactNode }) {
  const { x, tx, loc } = useX(); const { num } = useMoney();
  const [view, setView] = useState<View>('closed');
  const [page, setPage] = useState(1);
  const all = useMemo(() => roundActivity(snapshot, endAt), [snapshot, endAt]);
  const filtered = useMemo(() => view === 'history' ? all : all.filter(i => view === 'closed' ? i.kind === 'position_closed' : i.kind === 'operator_fee'), [all, view]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, totalPages);
  const items = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const agent = (id: string | null) => { if (!id) return null; const a = (AGENTS as Record<string, { name: readonly [string, string, string] }>)[id]; return a ? tx(a.name) : id; };
  const dt = (s: string) => formatBrazilDateTime(s, fl, { dateStyle: 'medium', timeStyle: 'short' });
  const fk = (k: string | null) => ({ onramp: x('Saldo adicionado', 'Balance added', 'Saldo agregado'), swap: x('Troca', 'Swap', 'Cambio'), withdraw: x('Saque USDC', 'USDC withdrawal', 'Retiro USDC'), send: x('Envio', 'Send', 'Envío'), transfer: x('Transferência de rendimentos', 'Earnings transfer', 'Transferencia de ganancias') } as Record<string, string>)[k ?? ''] ?? '-';
  const cell = (label: string, v: number | null, signed = false) => <div className="text-xs text-[#5B6B85]">{label}<br />{v == null ? <b>-</b> : <Money v={v} a="USDC" signed={signed} precision={prec(v)} />}</div>;
  const pick = (v: View) => { setView(v); setPage(1); };
  const tabs: [View, string][] = [['closed', x('Posições encerradas', 'Closed positions', 'Posiciones cerradas')], ['fees', x('Tarifas do operador', 'Operator fees', 'Tarifas del operador')], ['history', x('Tudo', 'Everything', 'Todo')]];

  const row = (it: DemoTreasuryActivityItem) => {
    const head = it.kind === 'position_closed' ? x('Posição encerrada', 'Position closed', 'Posición cerrada') : it.kind === 'operator_fee' ? `${x('Tarifa do operador', 'Operator fee', 'Tarifa del operador')} · ${fk(it.feeKind)}` : x('Saldo de abertura', 'Opening balance', 'Saldo de apertura');
    return <li key={it.id} data-testid="treasury-activity-row" className="grid gap-2 py-3 sm:grid-cols-[1.3fr_repeat(4,1fr)] sm:items-start">
      <div className="min-w-0"><p className="text-sm font-bold">{agent(it.agent) ?? head}{it.agent && <span className="ml-1 rounded-full bg-[#DDEBE4] px-2 text-xs font-semibold text-[#0A6657]">{head}</span>}</p>
        <p className="mono break-all text-[11px] text-[#5B6B85]">{it.id}{it.market ? ` · ${it.market}` : ''}</p><p className="text-xs text-[#5B6B85]">{dt(it.at)}</p>
        {it.source === 'modeled_baseline' && <p className="text-[11px] font-semibold text-[#8A641D]">{x('Roteiro modelado', 'Modeled storyline', 'Guion modelado')}</p>}</div>
      {it.kind === 'operator_fee' ? cell(x('Tarifa', 'Fee', 'Tarifa'), it.feeUsdc) : it.kind === 'checkpoint' ? <>{cell(x('Ativos na abertura', 'Opening assets', 'Activos de apertura'), it.capitalUsdc)}
        <p className="text-xs leading-snug text-[#5B6B85] sm:col-span-3">{x('Base de abertura do cenário emulado. Não é lucro nem tarifa.', 'Opening baseline for the emulated scenario. This is neither profit nor a fee.', 'Base de apertura del escenario emulado. No es ganancia ni tarifa.')}</p></> :
        <>{cell(x('Capital', 'Capital', 'Capital'), it.capitalUsdc)}{cell(x('Bruto', 'Gross', 'Bruto'), it.grossUsdc, true)}{cell(x('Custo', 'Cost', 'Costo'), it.costUsdc)}{cell(x('Líquido', 'Net', 'Neto'), it.netUsdc, true)}</>}
    </li>;
  };

  return <div data-testid="treasury-activity">
    <RoundIdentity id={snapshot.id} testId="treasury-activity-round-id" />
    {header}
    <p className="mt-2 rounded-xl bg-[#FFF5D9] p-2 text-xs font-semibold text-[#73531B]" data-testid="treasury-activity-sample-note">{x('Registros de exemplo ilustrativos, gerados localmente a partir da foto salva da rodada. Não são execuções reais.', 'Illustrative sample records generated locally from the round’s saved snapshot. They are not real executions.', 'Registros de ejemplo ilustrativos, generados localmente a partir de la foto guardada de la ronda. No son ejecuciones reales.')}</p>
    <div role="group" className="mt-3 flex flex-wrap gap-2">{tabs.map(([id, label]) => <button key={id} type="button" data-testid={`treasury-activity-view-${id}`} aria-pressed={view === id} onClick={() => pick(id)} className={`min-h-11 rounded-xl border px-3 text-sm font-bold ${view === id ? 'border-[#0E7C6B] bg-[#E6F4EE] text-[#0A6657]' : 'border-[#D8CFBB]'}`}>{label}</button>)}</div>
    <p data-testid="treasury-activity-count" aria-live="polite" className="mt-3 text-xs font-semibold text-[#5B6B85]">{x(`${num(filtered.length, 0)} registros · página ${cur} de ${totalPages}`, `${num(filtered.length, 0)} records · page ${cur} of ${totalPages}`, `${num(filtered.length, 0)} registros · página ${cur} de ${totalPages}`)}</p>
    {!items.length ? <p className="mt-2 rounded-xl bg-[#F5F1E8] p-3 text-sm text-[#5B6B85]">{x('Nada registrado nesta visão.', 'Nothing in this view.', 'Nada en esta vista.')}</p> : <ul className="mt-2 divide-y divide-[#EBE3D1]">{items.map(row)}</ul>}
    <div className="mt-3 flex items-center justify-between gap-2">
      <button type="button" data-testid="treasury-page-previous" disabled={cur <= 1} onClick={() => setPage(cur - 1)} className="min-h-11 rounded-xl border border-[#D8CFBB] px-4 text-sm font-bold disabled:opacity-40">{x('Anterior', 'Previous', 'Anterior')}</button>
      {cur > 1 && <button type="button" onClick={() => setPage(1)} className="min-h-11 px-2 text-xs font-bold text-[#0E7C6B] underline">{x('Voltar ao mais recente', 'Back to latest', 'Volver a lo más reciente')}</button>}
      <button type="button" data-testid="treasury-page-next" disabled={cur >= totalPages} onClick={() => setPage(cur + 1)} className="min-h-11 rounded-xl border border-[#D8CFBB] px-4 text-sm font-bold disabled:opacity-40">{x('Próxima', 'Next', 'Próxima')}</button>
    </div>
  </div>;
}
