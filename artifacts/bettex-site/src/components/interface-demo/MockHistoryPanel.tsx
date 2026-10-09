/** @jsxImportSource react */
import { useState } from 'react';
import { useSearch } from 'wouter';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from '../demo/ui';
import { Money } from '../demo/fin';
import { openDemoNotice } from './runtime';

export function MockHistoryPanel({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const search = useSearch();
  const [wallet, setWallet] = useState(new URLSearchParams(search).get('wallet') ?? 'all');
  const [kind, setKind] = useState('all');
  const [view, setView] = useState(new URLSearchParams(search).get('roundTab') ?? 'movements');
  const names: Record<string, string> = {
    onramp: x('Entrada', 'Deposit', 'Entrada'), receive: x('Recebimento', 'Receipt', 'Recepción'),
    swap: x('Conversão', 'Conversion', 'Conversión'), withdraw: x('Retirada', 'Withdrawal', 'Retiro'),
    distribution: x('Rendimentos', 'Earnings', 'Ganancias'), send: x('Envio', 'Send', 'Envío'),
  };
  const rows = d.history.filter(r => (wallet === 'all' || wallet === 'earnings' ? wallet === 'all' || r.kind === 'distribution' : r.asset === wallet.toUpperCase())
    && (kind === 'all' || r.kind === kind));
  return <section className="dcard grid gap-4 p-4 sm:p-5" data-testid="page-history-mock">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="display text-xl font-extrabold">{x('Histórico', 'History', 'Historial')}</h1>
      <button data-demo-action onClick={openDemoNotice} className="min-h-11 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white">{x('Gerar relatório', 'Generate report', 'Generar informe')}</button>
    </div>
    <p className="text-xs text-[#5B6B85]">{x('Registros ilustrativos da interface. Nenhuma transação foi realizada.', 'Illustrative interface records. No transaction has taken place.', 'Registros ilustrativos de la interfaz. No se ha realizado ninguna transacción.')}</p>
    <div className="flex flex-wrap gap-2">{[['movements', x('Movimentações', 'Movements', 'Movimientos')], ['staking', 'Staking'], ['lottery', x('Loteria', 'Lottery', 'Lotería')], ['burn', x('Queima', 'Burn', 'Quema')]].map(([id, label]) =>
      <button key={id} onClick={() => setView(id)} aria-pressed={view === id} className={`min-h-11 rounded-xl border px-3 text-sm font-bold ${view === id ? 'border-[#0E7C6B] bg-[#E6F4EE] text-[#0A6657]' : 'border-[#E4DCCB]'}`}>{label}</button>)}</div>
    <div className="flex flex-wrap gap-2">
      <label className="grid gap-1 text-xs font-bold">{x('Carteira', 'Wallet', 'Cartera')}<select value={wallet} onChange={e => setWallet(e.target.value)} className="min-h-11 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] px-3"><option value="all">{x('Todas', 'All', 'Todas')}</option><option value="usdc">USDC</option><option value="bettex">BETTEX</option><option value="earnings">{x('Rendimentos', 'Earnings', 'Ganancias')}</option></select></label>
      <label className="grid gap-1 text-xs font-bold">{x('Tipo', 'Type', 'Tipo')}<select value={kind} onChange={e => setKind(e.target.value)} className="min-h-11 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] px-3"><option value="all">{x('Todos', 'All', 'Todos')}</option>{Object.entries(names).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
    </div>
    {view === 'movements' ? <div className="grid gap-2">{rows.map((r, i) => <details key={r.id} className="rounded-xl border border-[#E4DCCB] p-3">
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 text-sm font-bold"><span>{names[r.kind] ?? r.kind}</span><Money v={r.amount} a={r.asset} /></summary>
      <div className="mt-3 grid gap-2 text-xs text-[#5B6B85]"><span>{x('Registro visual', 'Visual record', 'Registro visual')} #{i + 1}</span><span>{new Date(r.at).toLocaleString(loc === 'pt' ? 'pt-BR' : loc === 'es' ? 'es-ES' : 'en-US', { timeZone: 'America/Sao_Paulo' })}</span><span>{x('Taxa ilustrativa', 'Illustrative fee', 'Comisión ilustrativa')}: {r.feeUsdc} USDC</span><button data-demo-action onClick={openDemoNotice} className="min-h-11 justify-self-start rounded-lg border border-[#E4DCCB] px-3 font-bold">{x('Exportar registro', 'Export record', 'Exportar registro')}</button></div>
    </details>)}{!rows.length && <p className="text-sm text-[#5B6B85]">{x('Nenhum exemplo neste filtro.', 'No example matches this filter.', 'No hay ejemplos para este filtro.')}</p>}</div>
      : <div className="grid gap-2">{d.rounds.slice(0, 7).map(r => <details key={r.id} className="rounded-xl border border-[#E4DCCB] p-3"><summary className="flex cursor-pointer flex-wrap justify-between gap-2 text-sm font-bold"><span>{x('Rodada ilustrativa', 'Illustrative round', 'Ronda ilustrativa')} · {r.id}</span><Money v={view === 'staking' ? r.stakingUsdc : r.buybackUsdc} a="USDC" /></summary><p className="mt-3 text-xs text-[#5B6B85]">{x('Exemplo visual de apuração e distribuição, sem contrato ou registro real.', 'Visual example of calculation and distribution, without a contract or real record.', 'Ejemplo visual de cálculo y distribución, sin contrato ni registro real.')}</p></details>)}</div>}
    <button data-demo-action onClick={openDemoNotice} className="min-h-11 justify-self-start rounded-xl border border-[#E4DCCB] px-4 text-sm font-bold">{x('Baixar extrato completo', 'Download complete statement', 'Descargar extracto completo')}</button>
  </section>;
}
