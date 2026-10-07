/** @jsxImportSource react */
import type { DemoTreasuryRound } from '@workspace/api-client-react';
import { useX } from './ui';
import { Money } from './fin';

/** Reads ONLY the supplied round snapshot; legacy snapshots stay "not recorded". */
export function AgentRoundAllocation({ r }: { r: DemoTreasuryRound }) {
  const { x } = useX();
  const a = r.agentAllocations?.find(v => v.agent === 'crypto');
  const NR = x('Não registrado', 'Not recorded', 'No registrado');
  return <section data-testid="round-crypto-allocation" className="mt-3 grid gap-2 rounded-2xl border border-[#CFD8EC] bg-[#F4F6FC] p-3 sm:p-4">
    <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="display text-base font-extrabold">{x('Agente Cripto nesta rodada', 'Crypto agent this round', 'Agente Cripto en esta ronda')}</h3>
      <span data-testid="round-crypto-round-id" className="mono text-xs text-[#5B6B85]">{x('Rodada', 'Round', 'Ronda')} {r.id}</span></div>
    {!a ? <p data-testid="round-crypto-unrecorded" className="rounded-xl bg-[#F5F1E8] p-3 text-sm font-semibold text-[#5B6B85]">{NR}: {x('a alocação do agente não consta na foto desta rodada; nada é reconstruído com dados atuais.', 'the agent allocation is absent from this round snapshot; nothing is rebuilt from current data.', 'la asignación del agente no consta en la foto de esta ronda; no se reconstruye nada con datos actuales.')}</p>
    : <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
      <div className="rounded-xl bg-white/70 p-2"><p className="font-bold">{x('Alocado (modelado)', 'Allocated (modeled)', 'Asignado (modelado)')}</p><Money v={a.allocatedUsdc} a="USDC" /></div>
      <div className="rounded-xl bg-white/70 p-2"><p className="font-bold">{x('Comprometido', 'Committed', 'Comprometido')}</p><Money v={a.committedUsdc} a="USDC" /></div>
      <div data-testid="round-crypto-available" className="rounded-xl bg-white/70 p-2"><p className="font-bold">{x('Disponível', 'Available', 'Disponible')}</p><Money v={a.availableUsdc} a="USDC" /></div>
      <div data-testid="round-crypto-positions" className="rounded-xl bg-white/70 p-2"><p className="font-bold">{x('Posições ativas', 'Active positions', 'Posiciones activas')}</p><p className="display text-base font-extrabold tabular-nums">{a.activePositions}</p></div>
    </div>}
    <p className="text-xs text-[#5B6B85]">{x('Regra: só capital reservado em posições já aprovadas. A alocação não é um orçamento fixo nem o limite de exposição de 40%; não há saldo disponível separado. É capital modelado comprometido, não dinheiro líquido on-chain.', 'Rule: only capital reserved in already-approved positions. Allocation is not a fixed budget or the 40% exposure limit; there is no separate available balance. Modeled committed capital, not liquid on-chain money.', 'Regla: solo capital reservado en posiciones ya aprobadas. La asignación no es un presupuesto fijo ni el límite de exposición del 40%; no hay saldo disponible separado. Es capital modelado comprometido, no dinero líquido on-chain.')}</p>
    <p data-testid="round-operation-residual" className="text-xs text-[#5B6B85]">{x('Carteira operacional residual', 'Residual operational wallet', 'Cartera operativa residual')}: {r.operationalWalletUsdc == null ? NR : <><Money v={r.operationalWalletUsdc} a="USDC" /> · {x('comprometido fora do Crypto', 'committed outside Crypto', 'comprometido fuera de Crypto')}: {r.operationalWalletCommittedUsdc == null ? NR : <Money v={r.operationalWalletCommittedUsdc} a="USDC" />}</>}</p>
  </section>;
}
