/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { AlertTriangle, FileText } from 'lucide-react';
import { Link } from 'wouter';
import { useGetDemoTreasuryStatement } from '@workspace/api-client-react';
import { demoPath } from './demo-navigation';
import { brazilDate } from '../history/TreasuryStatement';
import { TreasuryStatementSummary } from '../history/TreasuryStatementSummary';
import type { DemoDashboard, DemoTreasuryRound } from '@workspace/api-client-react';
import { useX } from './ui';
import { TreasuryCycle } from './TreasuryCycle';
import { Money, Term, useMoney } from './fin';
import { BurnWalletPanel } from './BurnWalletPanel';

const box = 'rounded-2xl border border-[#E4DCCB] bg-[#FFFCF6] p-3 sm:p-4';

function Metric({ id, label, tip, help, children, tone }: { id?: string; label: string; tip: string; help: string; children: ReactNode; tone?: string }) {
  return <div data-testid={id} className={`${box} ${tone ?? ''}`}>
    <p className="text-xs font-bold text-[#1B2A41]"><Term tip={tip}>{label}</Term></p>
    <div className="mt-1">{children}</div>
    <p className="mt-1.5 text-xs leading-snug text-[#5B6B85]">{help}</p>
  </div>;
}

export function AssetAllocation({ r, className = 'dcard p-4 sm:p-5' }: { r: DemoTreasuryRound; className?: string }) {
  const { x } = useX(); const { num } = useMoney();
  const short = r.availableUsdc < 0;
  return <div className={className} data-testid="treasury-allocation">
      <h2 className="display text-lg font-extrabold">{x('Composição dos ativos', 'Asset allocation', 'Composición de activos')}</h2>
      <p className="mt-1 text-sm text-[#5B6B85]">{x('Ativos = Reserva protegida + Comprometido + Disponível. Nada é contado duas vezes.', 'Assets = Protected reserve + Committed + Available. Nothing is counted twice.', 'Activos = Reserva protegida + Comprometido + Disponible. Nada se cuenta dos veces.')}</p>
      <Metric id="treasury-assets-total" label={x('Ativos totais', 'Total assets', 'Activos totales')} tip={x('Tudo que a tesouraria simulada detém agora.', 'Everything the simulated treasury holds now.', 'Todo lo que tiene la tesorería simulada ahora.')} help={x('Inclui a reserva protegida e o capital operacional.', 'Includes protected reserve and working capital.', 'Incluye reserva protegida y capital operativo.')}><Money v={r.assetsUsdc} a="USDC" big /></Metric>
      <div className="ml-3 mt-2 grid gap-2 border-l-2 border-[#C9DCD3] pl-3 sm:ml-6 sm:pl-5 md:grid-cols-2">
        <Metric id="treasury-reserve" label={x('Reserva protegida', 'Protected reserve', 'Reserva protegida')} tip={x('Parte guardada por segurança. Não opera.', 'Part kept aside for safety. It is not traded.', 'Parte guardada por seguridad. No opera.')} help={x('Fica fora das operações para cobrir perdas.', 'Stays out of operations to cover losses.', 'Queda fuera de operaciones para cubrir pérdidas.')}><Money v={r.reserveUsdc} a="USDC" big /></Metric>
        <div className={`${box} bg-[#F5F1E8]`}>
          <p className="text-xs font-bold"><Term tip={x('Ativos menos reserva: o que pode ser alocado a operações.', 'Assets minus reserve: what can be allocated to operations.', 'Activos menos reserva: lo que se puede asignar a operaciones.')}>{x('Capital de trabalho', 'Working capital', 'Capital de trabajo')}</Term></p>
          <Money v={r.workingUsdc} a="USDC" big />
          <p className="mt-1.5 text-xs text-[#5B6B85]">{x('Se divide em comprometido e disponível.', 'Splits into committed and available.', 'Se divide en comprometido y disponible.')}</p>
          <div className="mt-2 grid gap-2 border-l-2 border-[#C9DCD3] pl-3">
            <Metric id="treasury-committed" label={x('Comprometido', 'Committed', 'Comprometido')} tip={x('Capital agora preso em posições ativas.', 'Capital now locked in active positions.', 'Capital ahora atado a posiciones activas.')} help={x('Volta ao disponível quando a posição encerra.', 'Returns to available when the position closes.', 'Vuelve a disponible al cerrar la posición.')}><Money v={r.committedUsdc} a="USDC" /></Metric>
            <Metric id="treasury-available" label={x('Disponível', 'Available', 'Disponible')} tip={x('Capital de trabalho ainda livre para novas posições.', 'Working capital still free for new positions.', 'Capital de trabajo libre para nuevas posiciones.')} help={x('Ativos menos reserva menos comprometido.', 'Assets minus reserve minus committed.', 'Activos menos reserva menos comprometido.')} tone={short ? 'border-[#B4421A]' : ''}><Money v={r.availableUsdc} a="USDC" /></Metric>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs mono text-[#5B6B85]">{num(r.assetsUsdc)} = {num(r.reserveUsdc)} + {num(r.committedUsdc)} + {num(r.availableUsdc)}</p>
      {short && <p role="alert" data-testid="treasury-shortfall" className="mt-2 flex items-start gap-2 rounded-xl border border-[#E7B98A] bg-[#FFF3E3] p-3 text-sm font-semibold text-[#6B3A10]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{x(`Reserva violada: faltam ${num(-r.availableUsdc)} USDC para cobrir reserva e compromissos. Novas posições ficam bloqueadas e não há distribuição enquanto isso durar.`, `Reserve breach: ${num(-r.availableUsdc)} USDC short of covering reserve and commitments. New positions stay blocked and no distribution happens meanwhile.`, `Reserva vulnerada: faltan ${num(-r.availableUsdc)} USDC para cubrir reserva y compromisos. Las nuevas posiciones quedan bloqueadas y no hay distribución mientras tanto.`)}</p>}
    </div>
  ;
}

function StatementOverview({ d, from }: { d: DemoDashboard; from: string }) {
  const { x, loc } = useX();
  const params = { from, to: brazilDate(d.serverNow), account: 'treasury' as const, asset: 'USDC' as const };
  const q = useGetDemoTreasuryStatement(params, { query: { queryKey: ['/api/demo/treasury/statement', params], staleTime: 10_000, refetchInterval: 20_000 } });
  const label = x('Abrir extrato da tesouraria no Histórico', 'Open treasury statement in History', 'Abrir extracto de la tesorería en Historial');
  return <section data-testid="treasury-statement-overview" className="dcard p-4 sm:p-5">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0"><h2 className="display text-lg font-extrabold">{x('Movimento do período', 'Period movement', 'Movimiento del período')}</h2>
        <p className="mt-1 text-xs text-[#5B6B85]">{x('Cobertura parcial, com liquidações modeladas. Não é fluxo de caixa verificado.', 'Partial coverage, with modeled settlements. Not verified cash flow.', 'Cobertura parcial, con liquidaciones modeladas. No es flujo de caja verificado.')}</p></div>
      <Link href={`${demoPath('wallet', loc)}#treasury-statement`} data-testid="link-treasury-statement" aria-label={label} title={label} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D8CFBB] bg-[#FFFCF6] text-[#1B2A41] hover:bg-[#F0E9DA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]"><FileText className="h-5 w-5" aria-hidden="true" /></Link>
    </div>
    {q.isLoading ? <div className="h-24 animate-pulse rounded-2xl bg-[#EEE9DD]" aria-busy="true" />
      : q.isError || !q.data ? <div role="alert" className="flex flex-wrap items-center gap-2 rounded-xl bg-[#F6DADA] p-3 text-sm text-[#8C2B2B]"><span>{x('Não foi possível carregar o movimento.', 'Could not load the movement.', 'No se pudo cargar el movimiento.')}</span><button type="button" className="min-h-11 rounded-xl border border-[#8C2B2B] px-3 font-bold" onClick={() => void q.refetch()}>{x('Tentar novamente', 'Try again', 'Reintentar')}</button></div>
      : <TreasuryStatementSummary data={q.data} compact />}
  </section>;
}

export function TreasuryOverview({ d }: { d: DemoDashboard }) {
  const { x } = useX();
  const r = d.treasury.currentRound;
  const sim = x('Tesouraria simulada, sem EVM nativo nem dinheiro real.', 'Simulated treasury, no native EVM and no real cash.', 'Tesorería simulada, sin EVM nativo ni dinero real.');

  if (!r) return <TreasuryCycle d={d} />;

  return <section data-testid="treasury-overview" className="grid gap-4">
    <p className="rounded-xl bg-[#EFF6F2] px-3 py-2 text-xs font-semibold text-[#0A6657]">{sim}</p>

    <AssetAllocation r={r} />

    <StatementOverview d={d} from={brazilDate(r.startedAt)} />

    <BurnWalletPanel d={d} />

    <TreasuryCycle d={d} />

  </section>;
}
