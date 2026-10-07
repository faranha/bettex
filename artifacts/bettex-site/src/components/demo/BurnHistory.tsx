/** @jsxImportSource react */
import { useEffect, useMemo, useState } from 'react';
import { Download, Flame } from 'lucide-react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { burnOf, burnFl, nf } from './burn-format';
import { formatBrazilDateTime } from './brazil-time';

const PAGE = 8;
type K = 'all' | 'wallet_funded' | 'tokens_purchased' | 'tokens_burned';

export function BurnHistory({ d, roundId, embedded = false }: { d: DemoDashboard; roundId?: string; embedded?: boolean }) {
  const { x, loc } = useX();
  const fl = burnFl(loc);
  const b = burnOf(d);
  const [kind, setKind] = useState<K>('all');
  const [page, setPage] = useState(0);
  useEffect(() => { setPage(0); }, [roundId]);
  const rows = useMemo(() => (b?.entries ?? []).filter(e => (!roundId || e.roundId === roundId) && (kind === 'all' || e.kind === kind)).slice().sort((a, c) => Date.parse(c.at) - Date.parse(a.at)), [b, kind, roundId]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const label = (k: string) => k === 'wallet_funded' ? x('Carteira financiada', 'Wallet funded', 'Cartera financiada') : k === 'tokens_purchased' ? x('Tokens comprados', 'Tokens purchased', 'Tokens comprados') : x('Queima permanente simulada', 'Permanent simulated burn', 'Quema permanente simulada');
  const exportCsv = () => {
    const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const csv = ['id,round,at_sao_paulo,event,usdc,bettex,source', ...rows.map(e => [q(e.id), q(e.roundId), q(formatBrazilDateTime(e.at, 'en-US')), q(e.kind), e.amountUsdc, e.tokensBettex, q(e.source)].join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'bettex-burn-journal-modeled.csv'; a.click(); URL.revokeObjectURL(a.href);
  };
  if (!b) return <section className="dcard grid gap-2 p-4 sm:p-5" data-testid="burn-history"><h3 className="display flex items-center gap-2 text-base font-extrabold"><Flame className="h-5 w-5 text-[#D9591B]" aria-hidden="true" />{x('Diário de recompra e queima', 'Buyback-and-burn journal', 'Diario de recompra y quema')}</h3>
    <p className="rounded-xl bg-[#F5F1E8] p-3 text-sm font-semibold text-[#5B6B85]">{d.profile.provider === 'native' ? x('Indisponível no protocolo nativo.', 'Unavailable in the native protocol.', 'No disponible en el protocolo nativo.') : x('Não registrado.', 'Not recorded.', 'No registrado.')}</p></section>;
  return <section id={embedded ? undefined : 'burn-history'} className="dcard grid gap-3 p-4 sm:p-5" data-testid={embedded ? 'round-burn-history' : 'burn-history'}>
    <div className="flex flex-wrap items-start justify-between gap-2">
      <h3 className="display flex items-center gap-2 text-base font-extrabold"><Flame className="h-5 w-5 text-[#D9591B]" aria-hidden="true" />{x('Diário de recompra e queima', 'Buyback-and-burn journal', 'Diario de recompra y quema')}</h3>
      <button type="button" onClick={exportCsv} data-testid="button-export-burn" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#E8A56B] px-3 text-sm font-bold text-[#8F3A0E]"><Download className="h-4 w-4" aria-hidden="true" />{x('Exportar CSV', 'Export CSV', 'Exportar CSV')}</button>
    </div>
    <p className="text-xs text-[#5B6B85]">{x('Diário do projeto, não é saque nem rendimento pessoal. Dados modelados, sem transações reais. Horários de São Paulo.', 'Project journal, not a personal withdrawal or yield. Modeled data, no real transactions. São Paulo time.', 'Diario del proyecto, no es retiro ni rendimiento personal. Datos modelados, sin transacciones reales. Hora de São Paulo.')}</p>
    <label className="grid gap-1 text-xs font-bold text-[#5B6B85] sm:max-w-xs">{x('Filtrar evento', 'Filter event', 'Filtrar evento')}
      <select value={kind} onChange={e => { setKind(e.target.value as K); setPage(0); }} data-testid="select-burn-kind" className="min-h-11 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] px-3 text-sm font-semibold text-[#1B2A41]">
        <option value="all">{x('Todos', 'All', 'Todos')}</option>
        <option value="wallet_funded">{label('wallet_funded')}</option>
        <option value="tokens_purchased">{label('tokens_purchased')}</option>
        <option value="tokens_burned">{label('tokens_burned')}</option>
      </select></label>
    {rows.length === 0 ? <p className="rounded-xl bg-[#F5F1E8] p-3 text-sm text-[#5B6B85]">{x('Nenhum evento registrado.', 'No events recorded.', 'Ningún evento registrado.')}</p> :
      <ul className="grid gap-2">{rows.slice(cur * PAGE, cur * PAGE + PAGE).map(e => <li key={e.id} data-testid={`burn-entry-${e.id}`} className="min-w-0 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-3"><b>{label(e.kind)}</b><span className="text-xs text-[#5B6B85]">{formatBrazilDateTime(e.at, fl)}</span></div>
        <p className="mt-1 break-words text-xs text-[#5B6B85]">{x('Rodada', 'Round', 'Ronda')} {e.roundId} · {e.kind === 'wallet_funded' ? `${nf(fl, e.amountUsdc)} USDC` : e.kind === 'tokens_purchased' ? `${nf(fl, e.amountUsdc)} USDC → ${nf(fl, e.tokensBettex, 0)} BETTEX` : `${nf(fl, e.tokensBettex, 0)} BETTEX`} · {x('Fonte: modelo de demonstração', 'Source: demo model', 'Fuente: modelo de demostración')}</p>
      </li>)}</ul>}
    {pages > 1 && <div className="flex items-center justify-between gap-2 text-xs font-bold">
      <button type="button" disabled={cur === 0} onClick={() => setPage(cur - 1)} className="min-h-11 rounded-xl border border-[#E4DCCB] px-3 disabled:opacity-40">{x('Anterior', 'Previous', 'Anterior')}</button>
      <span>{cur + 1} / {pages}</span>
      <button type="button" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} className="min-h-11 rounded-xl border border-[#E4DCCB] px-3 disabled:opacity-40">{x('Próxima', 'Next', 'Siguiente')}</button>
    </div>}
  </section>;
}
