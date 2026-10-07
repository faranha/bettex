/** @jsxImportSource react */
import { useState, type ReactNode } from 'react';
import { AlertTriangle, History, ChevronDown } from 'lucide-react';
import { Link } from 'wouter';
import type { DemoDashboard, DemoTreasuryRound } from '@workspace/api-client-react';
import { useX } from './ui';
import { TreasuryCycle } from './TreasuryCycle';
import { Money, Term, useMoney } from './fin';
import { formatBrazilDateTime } from './brazil-time';
import { BurnWalletPanel } from './BurnWalletPanel';
import { RoundIdentity } from './RoundIdentity';
import { demoPath } from './demo-navigation';
import { roundHistoryQuery } from '../history/round-history-selection';

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

export function TreasuryOverview({ d }: { d: DemoDashboard }) {
  const { x, tx, loc } = useX(); const { num } = useMoney();
  const [open, setOpen] = useState<string | null>(null);
  const r = d.treasury.currentRound;
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const dt = (s: string) => formatBrazilDateTime(s, fl, { dateStyle: 'medium', timeStyle: 'short' });
  const NR = x('Não registrado', 'Not recorded', 'No registrado');
  const precision = (v: number) => v !== 0 && Math.abs(v) < .01 ? 6 : 2;
  const plain = (v: number | null | undefined, signed = false) => v == null ? NR : `${signed && v > 0 ? '+' : ''}${num(v, precision(v))} USDC`;
  const sim = x('Tesouraria simulada, sem EVM nativo nem dinheiro real.', 'Simulated treasury, no native EVM and no real cash.', 'Tesorería simulada, sin EVM nativo ni dinero real.');
  const fee = (b: DemoTreasuryRound['feeBreakdown'], f: (v: number) => ReactNode) => <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">{([['onramp', x('Saldo adicionado', 'Balance added', 'Saldo agregado')], ['swap', x('Troca', 'Swap', 'Cambio')], ['withdraw', x('Saque USDC', 'USDC withdrawal', 'Retiro USDC')], ['send', x('Envio', 'Send', 'Envío')]] as const).map(([k, l]) => <div key={k}><dt className="text-[#5B6B85]">{l}</dt><dd className="font-bold">{f(b[k])}</dd></div>)}</dl>;

  if (!r) return <TreasuryCycle d={d} />;

  return <section data-testid="treasury-overview" className="grid gap-4">
    <p className="rounded-xl bg-[#EFF6F2] px-3 py-2 text-xs font-semibold text-[#0A6657]">{sim}</p>

    <AssetAllocation r={r} />

    <BurnWalletPanel d={d} />

    <TreasuryCycle d={d} />

    <div className="dcard p-4 sm:p-5" data-testid="treasury-history">
      <h3 className="display text-base font-extrabold">{x('Histórico de rodadas', 'Round history', 'Historial de rondas')}</h3>
      <p className="text-xs text-[#5B6B85]">{x('Fotos imutáveis gravadas no encerramento. Rodadas antigas sem foto mostram Não registrado.', 'Immutable snapshots saved at closing. Older rounds without one show Not recorded.', 'Fotos inmutables guardadas al cierre. Rondas antiguas sin foto muestran No registrado.')}</p>
      {!d.rounds.length ? <p className="mt-3 rounded-xl bg-[#F5F1E8] p-3 text-sm text-[#5B6B85]">{x('Nenhuma rodada encerrada ainda.', 'No closed rounds yet.', 'Aún no hay rondas cerradas.')}</p> :
        <ul className="mt-3 grid gap-2">{d.rounds.map(p => { const s = p.treasurySnapshot; const o = open === p.id; return <li key={p.id} data-testid={`treasury-past-${p.id}`} className={box}>
          <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" aria-expanded={o} onClick={() => setOpen(o ? null : p.id)} className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-2 text-left">
            <span className="min-w-0"><RoundIdentity id={p.id} testId="treasury-history-round-id" /><span className="mt-1 block text-xs text-[#5B6B85]">{dt(p.endedAt)} · {p.status === 'paid' ? x('Distribuída', 'Paid', 'Distribuida') : x('Retida', 'Retained', 'Retenida')}</span></span>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${o ? 'rotate-180' : ''}`} aria-hidden="true" /></button>
          <Link href={`${demoPath('wallet', loc)}${roundHistoryQuery(p.id)}#round-history`} data-testid={`round-history-link-${p.id}`} aria-label={x(`Histórico completo da rodada ${p.id}`, `Full history for round ${p.id}`, `Historial completo de la ronda ${p.id}`)} title={x(`Histórico completo da rodada ${p.id}`, `Full history for round ${p.id}`, `Historial completo de la ronda ${p.id}`)} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D8CFBB] text-[#1B2A41] transition-colors hover:border-[#C9A24A] hover:bg-[#F0E9DA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B59FF]"><History className="h-5 w-5" aria-hidden="true" /></Link>
          </div>
          {o && <div className="mt-2 grid gap-3 border-t border-[#EBE3D1] pt-3 text-sm">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">{([[x('Ativos', 'Assets', 'Activos'), s?.assetsUsdc], [x('Reserva', 'Reserve', 'Reserva'), s?.reserveUsdc], [x('Comprometido', 'Committed', 'Comprometido'), s?.committedUsdc], [x('Livre', 'Free', 'Libre'), s?.availableUsdc], [x('Resultado líquido', 'Net result', 'Resultado neto'), s?.realizedNetUsdc], [x('Custos', 'Costs', 'Costos'), s?.executionCostsUsdc], [x('Tarifas do operador', 'Operator fees', 'Tarifas del operador'), s?.feesCollectedUsdc]] as [string, number | null | undefined][]).map(([l, v]) => <div key={l}><dt className="text-xs text-[#5B6B85]">{l}</dt><dd className="font-bold">{plain(v)}</dd></div>)}
              <div><dt className="text-xs text-[#5B6B85]">{x('Posições encerradas', 'Closed positions', 'Posiciones cerradas')}</dt><dd className="font-bold" data-testid={`past-round-closed-${p.id}`}>{s?.closedOperations == null ? NR : s.closedOperations.toLocaleString(fl)}</dd></div>
              <div><dt className="text-xs text-[#5B6B85]">{x('Cobertura salva', 'Saved coverage', 'Cobertura guardada')}</dt><dd className="font-bold">{s ? (s.coverage === 'complete' ? x('Completa', 'Complete', 'Completa') : x('Parcial', 'Partial', 'Parcial')) : NR}</dd></div></dl>
            {s ? <><p className="text-xs text-[#5B6B85]">{dt(s.startedAt)} → {dt(s.endsAt)}</p>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div><dt className="text-xs text-[#5B6B85]">{x('Ativos na abertura', 'Opening assets', 'Activos de apertura')}</dt><dd className="font-bold">{plain(s.openingAssetsUsdc)}</dd></div>
                <div><dt className="text-xs text-[#5B6B85]">{x('Capital operacional', 'Working capital', 'Capital operativo')}</dt><dd className="font-bold">{plain(s.workingUsdc)}</dd></div>
                <div><dt className="text-xs text-[#5B6B85]">{x('Meta aprovada', 'Approved target', 'Meta aprobada')}</dt><dd className="font-bold">{s.targetNetUsdc == null ? x('Não definida', 'Not configured', 'No definida') : plain(s.targetNetUsdc)}</dd></div>
                <div><dt className="text-xs text-[#5B6B85]">{x('Esperado nos compromissos', 'Expected on commitments', 'Esperado en compromisos')}</dt><dd className="font-bold">{plain(s.expectedCommittedNetUsdc)}</dd></div>
              </dl>
              {s.feesCollectedUsdc != null && fee(s.feeBreakdown, v => <>{num(v, v !== 0 ? 6 : 2)} USDC</>)}
              <p className="text-xs text-[#5B6B85]">{x('Tarifas registradas desde', 'Fees tracked since', 'Tarifas registradas desde')}: {s.feeTrackingSince ? dt(s.feeTrackingSince) : NR}</p>
              {s.coverage === 'partial' && <p className="text-xs text-[#B4701A]">{x('Cobertura parcial: tarifas apenas desde o início do registro; custos e saldo de abertura anteriores não foram reconstruídos.', 'Partial coverage: fees only since tracking began; earlier costs and opening balances were not reconstructed.', 'Cobertura parcial: tarifas solo desde el inicio del registro; costos y saldos de apertura anteriores no se reconstruyeron.')}</p>}
            </> : <p className="text-xs font-semibold text-[#B4701A]">{x('Sem foto de tesouraria: Não registrado. Valores atuais não substituem o passado.', 'No treasury snapshot: Not recorded. Current figures never fill in the past.', 'Sin foto de tesorería: No registrado. Las cifras actuales no reemplazan el pasado.')}</p>}
            {p.source === 'seeded_demo' && <p className="text-xs font-semibold text-[#B4701A]">{x('Distribuição pré-carregada como exemplo ilustrativo.', 'Preloaded distribution for illustration.', 'Distribución precargada como ejemplo ilustrativo.')}</p>}
            <dl className="grid grid-cols-2 gap-3 border-t border-[#EBE3D1] pt-3 sm:grid-cols-4">{([[x('Lucro elegível', 'Eligible profit', 'Ganancia elegible'), p.eligibleUsdc], [x('Participação', 'Staking', 'Participación'), p.stakingUsdc], [x('Tesouraria', 'Treasury', 'Tesorería'), p.treasuryUsdc], [x('Recompra', 'Buyback', 'Recompra'), p.buybackUsdc]] as [string, number][]).map(([l, v]) => <div key={l}><dt className="text-xs text-[#5B6B85]">{l}</dt><dd className="font-bold">{plain(v)}</dd></div>)}</dl>
          </div>}
        </li>; })}</ul>}
    </div>
  </section>;
}
