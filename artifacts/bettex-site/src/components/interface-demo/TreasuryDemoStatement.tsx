/** @jsxImportSource react */
import { useMemo, useState } from 'react';
import { Link, useSearch } from 'wouter';
import { FileText } from 'lucide-react';
import type { DemoDashboard, TreasuryStatementEntry, TreasuryStatementPage } from '@workspace/api-client-react';
import { useX } from '../demo/ui';
import { demoPath } from '../demo/demo-navigation';
import { WalletHelp } from '../demo/WalletHelp';
import { formatBrazilDateTime } from '../demo/brazil-time';
import { brazilDate } from '../history/TreasuryStatement';
import { historyQuery, treasuryFiltersFromSearch, treasuryWalletFromSearch } from '../history/history-selection';
import { TreasuryStatementSummary, useStmtFmt } from '../history/TreasuryStatementSummary';
import { archivedRounds, firstStatementDay, statementBalances, statementEntries } from './treasury-demo-data';
import { openDemoNotice } from './runtime';

type T3 = readonly [string, string, string];
const CATS: Record<string, T3> = {
  opening_snapshot: ['Saldo inicial', 'Opening balance', 'Saldo inicial'],
  buyback_funding: ['Financiamento da recompra', 'Buyback funding', 'Fondeo de recompra'],
  buyback_purchase: ['Compra da recompra', 'Buyback purchase', 'Compra de recompra'],
  token_purchase: ['Compra de tokens', 'Token purchase', 'Compra de tokens'],
  token_burn: ['Queima de tokens', 'Token burn', 'Quema de tokens'],
  investment_income: ['Renda de investimento', 'Investment income', 'Ingreso de inversión'],
  transfer: ['Transferência', 'Transfer', 'Transferencia'],
};
const PARTY: Record<string, T3> = {
  opening_snapshot: ['Posição inicial', 'Opening position', 'Posición inicial'],
  operations: ['Operações da tesouraria', 'Treasury operations', 'Operaciones de la tesorería'],
  btc_strategy: ['Estratégia BTC', 'BTC strategy', 'Estrategia BTC'],
  eth_strategy: ['Estratégia ETH', 'ETH strategy', 'Estrategia ETH'],
  sol_strategy: ['Estratégia SOL', 'SOL strategy', 'Estrategia SOL'],
  yield_strategy: ['Outros investimentos', 'Other investments', 'Otras inversiones'],
  staking_pool: ['Pool de participação', 'Participation pool', 'Pool de participación'],
  buyback_wallet: ['Carteira de recompra', 'Buyback wallet', 'Cartera de recompra'],
  treasury: ['Tesouraria', 'Treasury', 'Tesorería'],
  swap_pool: ['Pool BETTEX/USDC', 'BETTEX/USDC pool', 'Pool BETTEX/USDC'],
  burn: ['Queima de tokens', 'Token burn', 'Quema de tokens'],
};
const SRC: Record<string, T3> = {
  modeled_settlement: ['Liquidação', 'Settlement', 'Liquidación'],
  modeled_demo: ['Movimento', 'Movement', 'Movimiento'],
};
const btn = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[#0E7C6B] bg-white px-3 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5] disabled:opacity-50';
const sel = 'min-h-11 min-w-0 w-full max-w-full rounded-xl border border-[#E4DCCB] bg-white px-2 text-sm';
const lbl = 'grid min-w-0 gap-1 text-xs font-semibold text-[#5B6B85]';

function pageOf(d: DemoDashboard, f: { account: 'all' | 'treasury' | 'buyback'; asset: 'all' | 'USDC' | 'BETTEX'; from: string; to: string; category?: string; q?: string }, page: number, size: number, txt: (c: string, p: string) => string): TreasuryStatementPage {
  const all = statementEntries(d);
  const q = (f.q ?? '').trim().toLowerCase();
  const rows = all.filter(e => (f.account === 'all' || e.account === f.account) && (f.asset === 'all' || e.asset === f.asset) && brazilDate(e.at) >= f.from && brazilDate(e.at) <= f.to && (!f.category || f.category === 'all' || e.category === f.category) && (!q || `${e.reference} ${e.id} ${txt(e.category, e.counterparty)}`.toLowerCase().includes(q)));
  const totalPages = Math.max(1, Math.ceil(rows.length / size));
  const cur = Math.min(page, totalPages);
  return { items: rows.slice((cur - 1) * size, cur * size), balances: statementBalances(d, all, f), total: rows.length, page: cur, totalPages, pageSize: size, from: f.from, to: f.to, asOf: d.serverNow, snapshot: d.serverNow, coverage: 'partial', missingSources: [], source: 'simulation' };
}

/** Compact period movement on the Treasury page (local sample data). */
export function DemoStatementOverview({ d, from }: { d: DemoDashboard; from: string }) {
  const { x, loc } = useX();
  const [period, setPeriod] = useState<'current' | 'week' | 'month'>('week');
  const to = brazilDate(d.serverNow);
  const days = period === 'month' ? 29 : 6;
  const since = period === 'current' ? (from < to ? from : to) : brazilDate(Date.parse(`${to}T12:00:00-03:00`) - days * 86_400_000);
  const data = useMemo(() => pageOf(d, { account: 'all', asset: 'all', from: since, to }, 1, 1, () => ''), [d, since, to]);
  const label = x('Abrir extrato da tesouraria no Histórico', 'Open treasury statement in History', 'Abrir extracto de la tesorería en Historial');
  return <section data-testid="treasury-statement-overview" className="dcard p-4 sm:p-5">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0"><h2 className="display text-lg font-extrabold"><WalletHelp id="treasury-movement" label={x('Movimento do período', 'Period movement', 'Movimiento del período')}><p>{x('Resumo completo dos registros locais de exemplo, por conta e ativo. Entradas e saídas não são sinônimos de lucro ou prejuízo. Os saldos se conciliam no modelo, mas não comprovam caixa real. O botão de extrato abre os detalhes no Histórico.', 'Complete summary of local sample records, by account and asset. Inflows and outflows are not the same as profit or loss. Balances reconcile within the model but do not prove real cash. The statement button opens details in History.', 'Resumen completo de registros locales de ejemplo, por cuenta y activo. Entradas y salidas no equivalen a ganancias o pérdidas. Los saldos se concilian en el modelo, pero no prueban caja real. El botón de extracto abre los detalles en Historial.')}</p></WalletHelp></h2></div>
      <Link href={`${demoPath('wallet', loc)}${historyQuery('treasury', { treasuryAccount: 'treasury', treasuryAsset: 'USDC' })}#treasury-statement`} data-testid="link-treasury-statement" aria-label={label} title={label} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D8CFBB] bg-[#FFFCF6] text-[#1B2A41] hover:bg-[#F0E9DA]"><FileText className="h-5 w-5" aria-hidden="true" /></Link>
    </div>
    <div role="group" aria-label={x('Período do extrato', 'Statement period', 'Período del extracto')} className="mb-4 flex flex-wrap gap-2">
      {([['current', x('Rodada atual', 'Current round', 'Ronda actual')], ['week', x('7 dias', '7 days', '7 días')], ['month', x('30 dias', '30 days', '30 días')]] as const).map(([id, name]) =>
        <button key={id} type="button" data-demo-local data-testid={`treasury-period-${id}`} aria-pressed={period === id} onClick={() => setPeriod(id)}
          className={`min-h-11 rounded-xl border px-3 text-xs font-bold ${period === id ? 'border-[#0E7C6B] bg-[#E6F4EE] text-[#0A6657]' : 'border-[#D8CFBB] text-[#1B2A41]'}`}>{name}</button>)}
    </div>
    <TreasuryStatementSummary data={data} compact />
  </section>;
}

/** Full local statement for the History area. */
export function DemoTreasuryStatement({ d }: { d: DemoDashboard }) {
  const { x, tx, loc } = useX(); const { qty } = useStmtFmt();
  const search = useSearch();
  const init = treasuryFiltersFromSearch(search);
  const wallet = treasuryWalletFromSearch(search);
  const all = useMemo(() => statementEntries(d), [d]);
  const today = brazilDate(d.serverNow);
  const [account, setAccount] = useState<'all' | 'treasury' | 'buyback'>(new URLSearchParams(search).get('roundTab') === 'burn' && init.account === 'all' ? 'buyback' : init.account);
  const [asset, setAsset] = useState<'all' | 'USDC' | 'BETTEX'>(init.asset);
  const [category, setCategory] = useState('all');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState(firstStatementDay(all, d));
  const [to, setTo] = useState(today);
  const [page, setPage] = useState(1);
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const l3 = (m: Record<string, T3>, k: string) => tx(m[k] ?? [k, k, k]);
  const valid = from <= to;
  const data = useMemo(() => valid ? pageOf(d, { account, asset, from, to, category, q }, page, 12, (c, p) => `${l3(CATS, c)} ${l3(PARTY, p)}`) : null, [d, account, asset, from, to, category, q, page, valid, loc]); // eslint-disable-line react-hooks/exhaustive-deps
  const reset = () => { setAccount('all'); setAsset('all'); setCategory('all'); setQ(''); setFrom(firstStatementDay(all, d)); setTo(today); setPage(1); };
  const wname = { operational: x('Carteira operacional', 'Operational wallet', 'Cartera operativa'), reserve: x('Carteira de reserva', 'Reserve wallet', 'Cartera de reserva'), buyback: x('Carteira de recompra', 'Buyback wallet', 'Cartera de recompra'), crypto_agent: x('Carteira do agente Cripto', 'Crypto agent wallet', 'Cartera del agente Cripto') };
  const snaps = archivedRounds(d);
  const row = (e: TreasuryStatementEntry) => <li key={e.id} data-testid="treasury-statement-row" className="grid min-w-0 gap-1 rounded-2xl border border-[#E4DCCB] bg-white p-3">
    <div className="flex flex-wrap items-start justify-between gap-2"><p className="min-w-0 text-sm font-bold">{l3(CATS, e.category)}</p><p className={`mono text-sm font-extrabold ${Number(e.amount) < 0 ? 'text-[#B4421A]' : 'text-[#0A6657]'}`}>{qty(e.amount, e.asset, true)} {e.asset}</p></div>
    <p className="text-xs text-[#5B6B85]">{formatBrazilDateTime(e.at, fl, { dateStyle: 'medium', timeStyle: 'short' })} · {x('Contraparte', 'Counterparty', 'Contraparte')}: {l3(PARTY, e.counterparty)}</p>
    <p className="mono break-all text-[11px] text-[#5B6B85]">{e.id} · {x('Rodada', 'Round', 'Ronda')} {e.reference}</p>
    <p className="flex flex-wrap gap-1 text-[11px] font-bold"><span className="rounded-full bg-[#F0E9DA] px-2 py-0.5">{e.account === 'treasury' ? x('Tesouraria', 'Treasury', 'Tesorería') : x('Recompra', 'Buyback', 'Recompra')}</span><span className="rounded-full bg-[#FFF5D9] px-2 py-0.5 text-[#73531B]">{l3(SRC, e.source)}</span>{e.internal && <span className="rounded-full bg-[#E6F4EE] px-2 py-0.5 text-[#0A6657]">{x('Interno', 'Internal', 'Interno')}</span>}{e.income && <span className="rounded-full bg-[#DDF0E4] px-2 py-0.5 text-[#0A6657]">{x('Renda', 'Income', 'Ingreso')}</span>}</p>
  </li>;
  return <section id="treasury-statement" data-testid="treasury-statement" className="grid min-w-0 gap-3">
    <h2 className="display text-lg font-extrabold">{x('Extrato da Tesouraria', 'Treasury statement', 'Extracto de la Tesorería')}</h2>
    {wallet && <div data-testid="treasury-wallet-context" className="grid gap-2 rounded-2xl border border-[#C9DCD3] bg-[#F1F7F3] p-3 text-xs text-[#1B2A41]">
      <p className="font-bold">{wname[wallet]}</p>
      {wallet === 'buyback' ? <p>{x('Esta carteira tem lançamentos de caixa próprios, listados abaixo.', 'This wallet has its own cash entries, listed below.', 'Esta cartera tiene asientos de caja propios, listados abajo.')}</p> : <>
        <p>{x('As alocações abaixo são fotos salvas por rodada, não movimentos de caixa. Rodadas sem foto permanecem desconhecidas; os valores atuais não preenchem lacunas.', 'The allocations below are saved snapshots per round, not cash movements. Rounds without a snapshot remain unknown; current values do not fill gaps.', 'Las asignaciones de abajo son fotos guardadas por ronda, no movimientos de caja. Las rondas sin foto siguen desconocidas; los valores actuales no llenan huecos.')}</p>
        <ul className="grid gap-1" data-testid="treasury-wallet-allocations">{snaps.map(r => <li key={r.id} className="mono break-words">{r.id}: {wallet === 'reserve' ? r.treasurySnapshot.reserveUsdc : wallet === 'operational' ? (r.treasurySnapshot.operationalWalletUsdc ?? r.treasurySnapshot.workingUsdc) : (r.treasurySnapshot.agentAllocations?.find(a => a.agent === 'crypto')?.allocatedUsdc ?? 0)} USDC</li>)}</ul></>}
    </div>}
    <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <label className={lbl}>{x('Conta', 'Account', 'Cuenta')}<select className={sel} data-testid="select-statement-account" value={account} onChange={e => { setAccount(e.target.value as typeof account); setPage(1); }}><option value="all">{x('Todas', 'All', 'Todas')}</option><option value="treasury">{x('Tesouraria', 'Treasury', 'Tesorería')}</option><option value="buyback">{x('Recompra', 'Buyback', 'Recompra')}</option></select></label>
      <label className={lbl}>{x('Ativo', 'Asset', 'Activo')}<select className={sel} data-testid="select-statement-asset" value={asset} onChange={e => { setAsset(e.target.value as typeof asset); setPage(1); }}><option value="all">{x('Todos', 'All', 'Todos')}</option><option value="USDC">USDC</option><option value="BETTEX">BETTEX</option></select></label>
      <label className={lbl}>{x('Categoria', 'Category', 'Categoría')}<select className={sel} data-testid="select-statement-category" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}><option value="all">{x('Todas', 'All', 'Todas')}</option>{Object.keys(CATS).map(k => <option key={k} value={k}>{l3(CATS, k)}</option>)}</select></label>
      <label className={lbl}>{x('De', 'From', 'Desde')}<input type="date" className={sel} value={from} max={today} onChange={e => { setFrom(e.target.value); setPage(1); }} /></label>
      <label className={lbl}>{x('Até', 'To', 'Hasta')}<input type="date" className={sel} value={to} max={today} onChange={e => { setTo(e.target.value); setPage(1); }} /></label>
      <label className={lbl}>{x('Buscar', 'Search', 'Buscar')}<input type="search" className={sel} data-testid="input-statement-search" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder={x('ID da rodada ou categoria', 'Round ID or category', 'ID de ronda o categoría')} /></label>
    </div>
    <div className="flex flex-wrap gap-2"><button type="button" className={btn} onClick={reset}>{x('Limpar filtros', 'Reset filters', 'Limpiar filtros')}</button>
      <button type="button" data-demo-action data-testid="button-statement-csv" className={btn} onClick={openDemoNotice}>{x('Baixar CSV', 'Download CSV', 'Descargar CSV')}</button></div>
    {!valid && <p role="alert" className="rounded-xl bg-[#F6DADA] p-3 text-sm text-[#8C2B2B]">{x('A data inicial deve ser anterior à final.', 'The start date must not be after the end date.', 'La fecha inicial no puede ser posterior a la final.')}</p>}
    {data && <>
      <p className="text-xs text-[#5B6B85]">{x('Posição em', 'As of', 'Posición a')} {formatBrazilDateTime(data.asOf, fl)}</p>
      {data.balances.length > 0 && <TreasuryStatementSummary data={data} />}
      <p className="text-xs text-[#5B6B85]" aria-live="polite" data-testid="treasury-statement-count">{x(`${data.total} lançamentos · página ${data.page} de ${data.totalPages}`, `${data.total} entries · page ${data.page} of ${data.totalPages}`, `${data.total} asientos · página ${data.page} de ${data.totalPages}`)}</p>
      <p className="text-xs text-[#5B6B85]">{x('O resumo cobre o período inteiro, independentemente da categoria ou da busca.', 'The summary covers the full period regardless of category or search.', 'El resumen cubre todo el período, sin importar la categoría o la búsqueda.')}</p>
      {data.items.length === 0 ? <div className="grid justify-items-center gap-2 rounded-2xl border border-dashed border-[#D9CFB8] p-8 text-center" data-testid="treasury-statement-empty"><p className="text-sm font-bold">{x('Nenhum lançamento neste filtro e período.', 'No entries for this filter and period.', 'Ningún asiento para este filtro y período.')}</p><button type="button" className={btn} onClick={reset}>{x('Limpar filtros', 'Reset filters', 'Limpiar filtros')}</button></div> : <ul className="grid min-w-0 gap-3">{data.items.map(row)}</ul>}
      {data.totalPages > 1 && <nav aria-label={x('Paginação do extrato', 'Statement pagination', 'Paginación del extracto')} className="flex flex-wrap items-center gap-2">
        <button type="button" className={btn} data-testid="treasury-statement-prev" disabled={data.page <= 1} onClick={() => setPage(data.page - 1)}>{x('Anterior', 'Previous', 'Anterior')}</button>
        <button type="button" className={btn} data-testid="treasury-statement-next" disabled={data.page >= data.totalPages} onClick={() => setPage(data.page + 1)}>{x('Próxima', 'Next', 'Siguiente')}</button></nav>}
    </>}
  </section>;
}
