/** @jsxImportSource react */
import { useState, type ReactNode } from 'react';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import type { DemoDashboard, DemoTreasuryRound } from '@workspace/api-client-react';
import { AGENTS, useX } from './ui';
import { Money, Term, useMoney } from './fin';
import { formatBrazilDateTime } from './brazil-time';

const ACTIVE = ['approved', 'validated', 'executing', 'open', 'result', 'reconciling'];
const box = 'rounded-2xl border border-[#E4DCCB] bg-[#FFFCF6] p-3 sm:p-4';

function Metric({ id, label, tip, help, children, tone }: { id?: string; label: string; tip: string; help: string; children: ReactNode; tone?: string }) {
  return <div data-testid={id} className={`${box} ${tone ?? ''}`}>
    <p className="text-xs font-bold text-[#1B2A41]"><Term tip={tip}>{label}</Term></p>
    <div className="mt-1">{children}</div>
    <p className="mt-1.5 text-xs leading-snug text-[#5B6B85]">{help}</p>
  </div>;
}

export function TreasuryOverview({ d }: { d: DemoDashboard }) {
  const { x, tx, loc } = useX(); const { num } = useMoney();
  const [open, setOpen] = useState<string | null>(null);
  const r = d.treasury.currentRound;
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const dt = (s: string) => formatBrazilDateTime(s, fl, { dateStyle: 'medium', timeStyle: 'short' });
  const NR = x('Não registrado', 'Not recorded', 'No registrado');
  const precision = (v: number) => v !== 0 && Math.abs(v) < .01 ? 6 : 2;
  const U = (v: number | null | undefined, signed = false) => v == null ? <span className="text-sm font-bold text-[#5B6B85]">{NR}</span> : <Money v={v} a="USDC" signed={signed} precision={precision(v)} />;
  const plain = (v: number | null | undefined, signed = false) => v == null ? NR : `${signed && v > 0 ? '+' : ''}${num(v, precision(v))} USDC`;
  const sim = x('Tesouraria simulada, sem EVM nativo nem dinheiro real.', 'Simulated treasury, no native EVM and no real cash.', 'Tesorería simulada, sin EVM nativo ni dinero real.');
  const agent = (id: string) => { const a = (AGENTS as Record<string, { name: readonly [string, string, string] }>)[id]; return a ? tx(a.name) : id; };
  const ost = (s: string) => ({ approved: x('Aprovada', 'Approved', 'Aprobada'), validated: x('Validada', 'Validated', 'Validada'), executing: x('Executando', 'Executing', 'Ejecutando'), open: x('Aberta', 'Open', 'Abierta'), result: x('Resultado', 'Result', 'Resultado'), reconciling: x('Conciliando', 'Reconciling', 'Conciliando'), closed: x('Encerrada', 'Closed', 'Cerrada'), rejected: x('Rejeitada', 'Rejected', 'Rechazada') } as Record<string, string>)[s] ?? s;
  const fee = (b: DemoTreasuryRound['feeBreakdown'], f: (v: number) => ReactNode) => <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">{([['onramp', x('Saldo adicionado', 'Balance added', 'Saldo agregado')], ['swap', x('Troca', 'Swap', 'Cambio')], ['withdraw', x('Saque USDC', 'USDC withdrawal', 'Retiro USDC')], ['send', x('Envio', 'Send', 'Envío')]] as const).map(([k, l]) => <div key={k}><dt className="text-[#5B6B85]">{l}</dt><dd className="font-bold">{f(b[k])}</dd></div>)}</dl>;

  if (!r) return <section data-testid="treasury-overview" className="dcard p-5"><p className="text-sm text-[#5B6B85]">{x('Detalhes da rodada atual indisponíveis agora.', 'Current round details are unavailable right now.', 'Detalles de la ronda actual no disponibles ahora.')}</p></section>;

  const active = d.operations.filter(o => ACTIVE.includes(o.status));
  const short = r.availableUsdc < 0;
  const roundStart = Date.parse(r.startedAt);
  const left = Math.max(0, Date.parse(r.endsAt) - Date.parse(d.serverNow));
  const hrs = Math.floor(left / 3600000); const mins = Math.floor((left % 3600000) / 60000);

  return <section data-testid="treasury-overview" className="grid gap-4">
    <p className="rounded-xl bg-[#EFF6F2] px-3 py-2 text-xs font-semibold text-[#0A6657]">{sim}</p>

    <div className="dcard p-4 sm:p-5">
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

    <div className="dcard p-4 sm:p-5">
      <h2 className="display text-lg font-extrabold">{x('Rodada atual', 'Current round', 'Ronda actual')} <span className="mono text-xs font-semibold text-[#5B6B85]">{r.id}</span></h2>
      <p className="text-xs text-[#5B6B85]">{dt(r.startedAt)} → {dt(r.endsAt)} · {x('Horário do Brasil', 'Brazil time', 'Horario de Brasil')} · {x(`faltam ${hrs} h ${mins} min`, `${hrs} h ${mins} min left`, `faltan ${hrs} h ${mins} min`)}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Metric id="treasury-round-realized" label={x('Realizado líquido', 'Realized net', 'Realizado neto')} tip={x('Resultado já liquidado desta rodada, depois dos custos de execução.', 'Settled result of this round after execution costs.', 'Resultado liquidado de esta ronda tras costos de ejecución.')} help={x('Só posições liquidadas nesta rodada, não o acumulado de sempre. É a base do lucro elegível.', 'Only positions settled in this round, not the lifetime total. It is the basis of eligible profit.', 'Solo posiciones liquidadas en esta ronda, no el acumulado histórico. Es la base de la ganancia elegible.')}><Money v={r.realizedNetUsdc} a="USDC" big signed /></Metric>
        <Metric label={x('Não realizado', 'Unrealized', 'No realizado')} tip={x('Indicação de posições ainda abertas.', 'Indication from still-open positions.', 'Indicación de posiciones aún abiertas.')} help={x('Apenas indicação: não pode ser distribuído.', 'Indication only: it cannot be distributed.', 'Solo indicación: no se puede distribuir.')}><Money v={r.unrealizedUsdc} a="USDC" signed /></Metric>
        <Metric label={x('Meta da rodada', 'Round target', 'Meta de la ronda')} tip={x('Meta líquida aprovada para a rodada, se existir.', 'Approved net target for the round, if any.', 'Meta neta aprobada para la ronda, si existe.')} help={r.targetNetUsdc == null ? x('Nenhuma meta aprovada configurada.', 'No approved target configured.', 'Ninguna meta aprobada configurada.') : x('Meta aprovada fixa.', 'Fixed approved target.', 'Meta aprobada fija.')}>{r.targetNetUsdc == null ? <span className="text-sm font-bold">{x('Sem meta aprovada', 'No approved target', 'Sin meta aprobada')}</span> : <Money v={r.targetNetUsdc} a="USDC" />}</Metric>
        <Metric label={x('Esperado nas posições comprometidas', 'Expected on committed positions', 'Esperado en posiciones comprometidas')} tip={x('Soma das estimativas líquidas das propostas dos agentes.', 'Sum of the agents’ proposal net estimates.', 'Suma de las estimaciones netas de las propuestas de los agentes.')} help={x('Estimativa dos agentes. Não é meta, não é aprovado nem garantido.', 'Agents’ estimate. Not a target, not approved, not guaranteed.', 'Estimación de agentes. No es meta, ni aprobada ni garantizada.')}><Money v={r.expectedCommittedNetUsdc} a="USDC" signed /></Metric>
        <Metric label={x('Custos de execução', 'Execution costs', 'Costos de ejecución')} tip={x('Custos pagos para executar as posições.', 'Costs paid to execute positions.', 'Costos pagados para ejecutar las posiciones.')} help={r.coverage === 'partial' ? x('Rodada migrada: registro parcial, custos indisponíveis.', 'Migrated round: partial tracking, costs unavailable.', 'Ronda migrada: registro parcial, costos no disponibles.') : x('Já descontados do realizado líquido.', 'Already deducted from realized net.', 'Ya descontados del realizado neto.')}>{U(r.executionCostsUsdc)}</Metric>
        <Metric label={x('Posições encerradas', 'Closed positions', 'Posiciones cerradas')} tip={x('Quantas posições liquidaram nesta rodada.', 'How many positions settled this round.', 'Cuántas posiciones liquidaron en esta ronda.')} help={x('Contagem registrada na rodada.', 'Count recorded in the round.', 'Conteo registrado en la ronda.')}><span className="display text-xl font-extrabold">{r.closedOperations ?? NR}</span></Metric>
      </div>
      <p className="mt-3 rounded-xl bg-[#F5F1E8] p-3 text-xs leading-relaxed text-[#5B6B85]" data-testid="treasury-distribution-note">{x('O realizado líquido de investimentos é a fonte do lucro elegível. Só se o resultado for positivo e a reserva estiver protegida, ele se divide em 50% tesouraria, 25% participação e 25% recompra. Tarifas do operador ficam fora.', 'Investment realized net is the source of eligible profit. Only if the result is positive and the reserve is protected, it splits 50% treasury, 25% staking and 25% buyback. Operator fees are excluded.', 'El neto realizado de inversiones es la fuente de la ganancia elegible. Solo si el resultado es positivo y la reserva está protegida, se divide 50% tesorería, 25% participación y 25% recompra. Las tarifas del operador quedan fuera.')}</p>
      {r.coverage === 'partial' && <p className="mt-2 text-xs font-semibold text-[#B4701A]">{x('Cobertura parcial: esta rodada foi migrada; custos, encerradas e ativos iniciais não foram registrados.', 'Partial coverage: this round was migrated; costs, closed positions and opening assets were not recorded.', 'Cobertura parcial: esta ronda fue migrada; costos, cerradas y activos iniciales no se registraron.')}</p>}
    </div>

    <div className="dcard p-4 sm:p-5" data-testid="treasury-positions">
      <h3 className="display text-base font-extrabold">{x('Posições comprometidas agora', 'Positions committed now', 'Posiciones comprometidas ahora')}</h3>
      <p className="text-xs text-[#5B6B85]">{x('Algumas podem ter sido herdadas de antes da meia-noite: nem tudo começou nesta rodada.', 'Some may be inherited from before midnight: not everything started this round.', 'Algunas pueden venir de antes de medianoche: no todo empezó en esta ronda.')}</p>
      {!active.length ? <p className="mt-3 rounded-xl bg-[#F5F1E8] p-3 text-sm text-[#5B6B85]">{x('Nenhuma posição ativa agora.', 'No active positions now.', 'Ninguna posición activa ahora.')}</p> :
        <ul className="mt-3 divide-y divide-[#EBE3D1]">{active.map(o => { const inh = Date.parse(o.updatedAt) < roundStart && (!o.proposal || Date.parse(o.proposal.generatedAt) < roundStart); return <li key={o.id} data-testid={`treasury-position-${o.id}`} className="grid gap-1 py-3 sm:grid-cols-[1.4fr_1fr_1fr] sm:items-center">
          <div className="min-w-0"><p className="text-sm font-bold">{agent(o.agent)} <span className="rounded-full bg-[#DDEBE4] px-2 text-xs font-semibold text-[#0A6657]">{ost(o.status)}</span>{inh && <span className="ml-1 rounded-full bg-[#F0E9DA] px-2 text-xs font-semibold text-[#5B6B85]">{x('herdada', 'inherited', 'heredada')}</span>}</p><p className="mono break-all text-[11px] text-[#5B6B85]">{o.id} · {o.market}</p></div>
          <div className="text-xs text-[#5B6B85]">{x('Capital', 'Capital', 'Capital')}<br /><Money v={o.capitalUsdc} a="USDC" /></div>
          <div className="text-xs text-[#5B6B85]">{x('Esperado (estimativa)', 'Expected (estimate)', 'Esperado (estimación)')}<br />{o.proposal ? <Money v={o.proposal.expectedNetUsdc} a="USDC" signed /> : <b>{NR}</b>}</div>
        </li>; })}</ul>}
    </div>

    <div className="dcard p-4 sm:p-5" data-testid="treasury-fees">
      <h3 className="display text-base font-extrabold">{x('Tarifas do operador (simulador)', 'Operator fees (simulator)', 'Tarifas del operador (simulador)')}</h3>
      <p className="mt-1 text-xs leading-relaxed text-[#5B6B85]">{x('Receita do serviço da empresa operadora. Não são ativos da tesouraria nem lucro de investimento distribuível à participação. São cobranças registradas pelo simulador, não a tabela de tarifas fixa publicada.', 'Service revenue of the operating company. Not treasury assets and not investment profit distributable to staking. They are simulator-recorded charges, not the published fixed fee tariff.', 'Ingreso de servicio de la empresa operadora. No son activos de la tesorería ni ganancia de inversión distribuible a participación. Son cargos registrados por el simulador, no la tarifa fija publicada.')}</p>
      <Metric label={x('Tarifas coletadas', 'Fees collected', 'Tarifas recaudadas')} tip={x('Tarifas de operações simuladas confirmadas nesta rodada.', 'Fees from confirmed simulated operations this round.', 'Tarifas de operaciones simuladas confirmadas en esta ronda.')} help={x('Titular: empresa operadora.', 'Owner: operating company.', 'Titular: empresa operadora.')}>{U(r.feesCollectedUsdc)}</Metric>
      {r.feesCollectedUsdc != null && fee(r.feeBreakdown, v => <>{num(v, v !== 0 ? 6 : 2)} USDC</>)}
      <p className="mt-2 text-xs text-[#5B6B85]">{x('Registro desde', 'Tracked since', 'Registro desde')}: {r.feeTrackingSince ? dt(r.feeTrackingSince) : NR}</p>
    </div>

    <div className="dcard p-4 sm:p-5" data-testid="treasury-history">
      <h3 className="display text-base font-extrabold">{x('Histórico de rodadas', 'Round history', 'Historial de rondas')}</h3>
      <p className="text-xs text-[#5B6B85]">{x('Fotos imutáveis gravadas no encerramento. Rodadas antigas sem foto mostram Não registrado.', 'Immutable snapshots saved at closing. Older rounds without one show Not recorded.', 'Fotos inmutables guardadas al cierre. Rondas antiguas sin foto muestran No registrado.')}</p>
      {!d.rounds.length ? <p className="mt-3 rounded-xl bg-[#F5F1E8] p-3 text-sm text-[#5B6B85]">{x('Nenhuma rodada encerrada ainda.', 'No closed rounds yet.', 'Aún no hay rondas cerradas.')}</p> :
        <ul className="mt-3 grid gap-2">{d.rounds.map(p => { const s = p.treasurySnapshot; const o = open === p.id; return <li key={p.id} data-testid={`treasury-past-${p.id}`} className={box}>
          <button type="button" aria-expanded={o} onClick={() => setOpen(o ? null : p.id)} className="flex min-h-11 w-full items-center justify-between gap-2 text-left">
            <span><b className="text-sm">{p.id}</b><span className="block text-xs text-[#5B6B85]">{dt(p.endedAt)} · {p.status === 'paid' ? x('Distribuída', 'Paid', 'Distribuida') : x('Retida', 'Retained', 'Retenida')}</span></span>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${o ? 'rotate-180' : ''}`} aria-hidden="true" /></button>
          {o && <div className="mt-2 grid gap-3 border-t border-[#EBE3D1] pt-3 text-sm">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">{([[x('Ativos', 'Assets', 'Activos'), s?.assetsUsdc], [x('Reserva', 'Reserve', 'Reserva'), s?.reserveUsdc], [x('Comprometido', 'Committed', 'Comprometido'), s?.committedUsdc], [x('Livre', 'Free', 'Libre'), s?.availableUsdc], [x('Resultado líquido', 'Net result', 'Resultado neto'), s?.realizedNetUsdc], [x('Custos', 'Costs', 'Costos'), s?.executionCostsUsdc], [x('Tarifas do operador', 'Operator fees', 'Tarifas del operador'), s?.feesCollectedUsdc]] as [string, number | null | undefined][]).map(([l, v]) => <div key={l}><dt className="text-xs text-[#5B6B85]">{l}</dt><dd className="font-bold">{plain(v)}</dd></div>)}
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
