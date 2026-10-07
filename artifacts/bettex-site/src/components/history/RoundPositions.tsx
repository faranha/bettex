/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import { AGENTS } from '../demo/ui';
import { Money } from '../demo/fin';
import { useX } from '../demo/ui';
import { useRoundFmt } from './RoundFacts';

const ACTIVE = ['approved', 'validated', 'executing', 'open', 'result', 'reconciling'];

export function RoundPositions({ d }: { d: DemoDashboard }) {
  const { x, tx } = useX(); const { NR, dt } = useRoundFmt();
  const rows = d.operations.filter(o => ACTIVE.includes(o.status));
  const agent = (id: string) => { const a = (AGENTS as Record<string, { name: readonly [string, string, string] }>)[id]; return a ? tx(a.name) : id; };
  const status = (s: string) => ({
    approved: x('Aprovada', 'Approved', 'Aprobada'), validated: x('Validada', 'Validated', 'Validada'),
    executing: x('Executando', 'Executing', 'Ejecutando'), open: x('Aberta', 'Open', 'Abierta'),
    result: x('Resultado', 'Result', 'Resultado'), reconciling: x('Reconciliando', 'Reconciling', 'Conciliando'),
  } as Record<string, string>)[s] ?? NR;
  return <div data-testid="round-positions">
    <p className="text-xs text-[#5B6B85]">{x('Posições comprometidas agora na rodada atual.', 'Positions committed now in the current round.', 'Posiciones comprometidas ahora en la ronda actual.')}</p>
    {!rows.length ? <p className="mt-2 rounded-xl bg-[#F5F1E8] p-3 text-sm text-[#5B6B85]">{x('Nenhuma posição ativa agora.', 'No active positions now.', 'Ninguna posición activa ahora.')}</p> :
      <ul className="mt-2 divide-y divide-[#EBE3D1]">{rows.map(o => <li key={o.id} data-testid={`round-position-${o.id}`} className="grid gap-1 py-3 sm:grid-cols-[1.4fr_1fr_1fr] sm:items-center">
        <div className="min-w-0"><p className="text-sm font-bold">{agent(o.agent)} <span className="rounded-full bg-[#DDEBE4] px-2 text-xs font-semibold text-[#0A6657]">{status(o.status)}</span></p>
          <p className="mono break-all text-[11px] text-[#5B6B85]">{o.id} · {o.market}</p><p className="text-xs text-[#5B6B85]">{x('Atualizada', 'Updated', 'Actualizada')} {dt(o.updatedAt)}</p></div>
        <div className="text-xs text-[#5B6B85]">{x('Capital', 'Capital', 'Capital')}<br /><Money v={o.capitalUsdc} a="USDC" /></div>
        <div className="text-xs text-[#5B6B85]">{x('Esperado (estimativa)', 'Expected (estimate)', 'Esperado (estimación)')}<br />{o.proposal ? <Money v={o.proposal.expectedNetUsdc} a="USDC" signed /> : <b>{NR}</b>}</div></li>)}</ul>}
  </div>;
}
