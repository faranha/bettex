/** @jsxImportSource react */
import { useState, type Dispatch } from 'react';
import type { DemoAction, DemoState, Round, RoundScenario } from './types';
import { currentWeight } from './model';
import { Btn, Panel, Stat, field, useX, Example } from './ui';

const SC: { v: RoundScenario; l: [string, string, string] }[] = [
  { v: 'profit', l: ['Lucro distribuível', 'Distributable profit', 'Ganancia distribuible'] }, { v: 'loss', l: ['Perda', 'Loss', 'Pérdida'] },
  { v: 'reserve', l: ['Reserva insuficiente', 'Insufficient reserve', 'Reserva insuficiente'] }, { v: 'liquidity', l: ['Liquidez insuficiente', 'Insufficient liquidity', 'Liquidez insuficiente'] }, { v: 'zero', l: ['Sem peso elegível', 'No eligible weight', 'Sin peso elegible'] },
  { v: 'fraction', l: ['Fração inexequível', 'Unexecutable fraction', 'Fracción inejecutable'] }, { v: 'uncertain', l: ['Envio incerto', 'Uncertain payout', 'Envío incierto'] },
];
const ST: Record<Round['status'], [string, string, string]> = {
  accruing: ['Acumulando', 'Accruing', 'Acumulando'], assessed: ['Apurada', 'Assessed', 'Apurada'], authorized: ['Autorizada, não recebida', 'Authorized, not received', 'Autorizada, no recibida'],
  uncertain: ['Envio incerto', 'Uncertain payout', 'Envío incierto'], paid: ['Crédito confirmado', 'Credit confirmed', 'Crédito confirmado'], cancelled: ['Cancelada', 'Cancelled', 'Cancelada'], closed: ['Encerrada', 'Closed', 'Cerrada'],
};

function RoundCard({ r, dispatch }: { r: Round; dispatch: Dispatch<DemoAction> }) {
  const { x, tx, n } = useX();
  const noSplit = r.eligible <= 0 || r.staking === 0 && r.buyback === 0;
  const dead = r.status === 'cancelled' || (r.closed && !r.receipt);
  const entitled = r.grossPersonal > 0 && r.staking > 0;
  const base = r.staking + r.fraction;
  const rows: [string, string, number | string, boolean?][] = [
    [x('Resultado consolidado', 'Consolidated result', 'Resultado consolidado'), '', r.gross],
    [x('Custos', 'Costs', 'Costos'), '−', r.costs], [x('Tributos da entidade (antes do lucro elegível)', 'Entity taxes (before eligible profit)', 'Impuestos de la entidad (antes de la ganancia elegible)'), '−', r.entityTax],
    [x('Lucro elegível', 'Eligible profit', 'Ganancia elegible'), '=', r.eligible, true],
    [x('Reservas', 'Reserves', 'Reservas'), r.reservesPass ? '✓' : '✗', r.reservesPass ? x('cumpridas', 'met', 'cumplidas') : x('insuficientes', 'insufficient', 'insuficientes')],
    [x('Liquidez', 'Liquidity', 'Liquidez'), r.liquidityPass ? '✓' : '✗', r.liquidityPass ? x('cumprida', 'met', 'cumplida') : x('insuficiente', 'insufficient', 'insuficiente')],
    [x('Staking automático (25%, após fração)', 'Automatic staking (25%, after fraction)', 'Staking automático (25%, tras fracción)'), '', r.staking], [x('Recompra e queima (25%)', 'Buyback and burn (25%)', 'Recompra y quema (25%)'), '', r.buyback], [x('Tesouraria (50% + fração)', 'Treasury (50% + fraction)', 'Tesorería (50% + fracción)'), '', r.treasury],
  ];
  const share = r.totalWeight > 0 ? (r.weight / r.totalWeight) * 100 : 0;
  return <article className="rounded-xl border border-white/10 bg-[#070B1F]/60 p-4" data-testid={`round-${r.id}`}>
    <header className="flex flex-wrap items-center justify-between gap-2"><h4 className="display font-bold">{r.id} <span className="mono text-xs text-[#9AA9D6]">UTC D{r.utcDay}</span></h4><span className="mono rounded-full border border-[#F2B632]/50 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-[#F2B632]">{tx(ST[r.status])}</span></header>
    <table className="mt-3 w-full text-xs"><caption className="sr-only">{x('Cálculo da rodada', 'Round calculation', 'Cálculo de la ronda')}</caption><tbody>{rows.map((row, i) => <tr key={i} className={`border-t border-white/10 ${row[3] ? 'font-bold' : ''}`}><th scope="row" className="py-1.5 pr-2 text-left font-normal">{row[0]}</th><td className="w-6 text-center text-[#8FA8F0]">{row[1]}</td><td className="text-right mono">{typeof row[2] === 'number' ? n(row[2]) : row[2]}</td></tr>)}</tbody></table>
    <p className="mt-2 text-xs text-[#C5D2F1]">{noSplit ? (r.eligible <= 0 ? x('Perda ou lucro nulo: perdas são permanentes e nunca alocam lucro negativo; apenas lucro positivo vai 100% à tesouraria quando não há split.', 'Loss or zero profit: losses are permanent and never allocate negative profit; only positive profit goes 100% to treasury when there is no split.', 'Pérdida o ganancia nula: las pérdidas son permanentes y nunca asignan ganancia negativa; solo la ganancia positiva va 100% a tesorería cuando no hay split.') : x('Sem split: reserva/liquidez insuficiente ou peso elegível zero direcionam o lucro positivo 100% à tesouraria, sem divisão 50/25/25.', 'No split: insufficient reserve/liquidity or zero eligible weight sends positive profit 100% to treasury, without the 50/25/25 split.', 'Sin split: reserva/liquidez insuficiente o peso elegible cero envían la ganancia positiva 100% a tesorería, sin división 50/25/25.')) : x('Split 50% tesouraria, 25% staking e 25% recompra aplicado após reservas e liquidez.', 'Split 50% treasury, 25% staking and 25% buyback applied after reserves and liquidity.', 'Split 50% tesorería, 25% staking y 25% recompra aplicado tras reservas y liquidez.')}</p>
    <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
      <Stat label={x('Seu peso (quantidade × tempo)', 'Your weight (quantity × time)', 'Su peso (cantidad × tiempo)')} value={n(r.weight, 0)} sub={`${n(share)}% / ${n(r.totalWeight, 0)}`} />
      <Stat label={x('Direito bruto', 'Gross right', 'Derecho bruto')} value={n(r.grossPersonal)} /><Stat label={x('Retenção aplicável', 'Applicable withholding', 'Retención aplicable')} value={n(r.withholding)} />
      <Stat label={x('Crédito líquido', 'Net credit', 'Crédito neto')} value={n(r.netPersonal)} sub={r.receipt?.startsWith('EX-RECEIPT') ? x('recebido', 'received', 'recibido') : dead ? x('direito cancelado ou encerrado: 0 a receber', 'entitlement cancelled or closed: 0 to receive', 'derecho cancelado o cerrado: 0 por recibir') : !entitled ? x('sem direito pessoal nesta rodada', 'no personal entitlement this round', 'sin derecho personal en esta ronda') : x('pendente, ainda não recebido', 'pending, not yet received', 'pendiente, aún no recibido')} accent={r.receipt?.startsWith('EX-RECEIPT') ? '#6FE3A1' : dead || !entitled ? '#9AA9D6' : '#F2B632'} />
    </div>
    <p className="mono mt-2 break-words rounded-lg bg-[#0C1536] p-2 text-[11px] text-[#C5D2F1]">{x('Fórmula', 'Formula', 'Fórmula')}: {n(base, 4)} × {n(r.weight, 0)} / {n(r.totalWeight, 0)} = {n(r.totalWeight > 0 ? base * r.weight / r.totalWeight : 0, 4)} → {n(r.grossPersonal)} − {n(r.withholding)} = {n(r.netPersonal)} USDC</p>
    {r.fraction > 0 && <p className="mt-2 text-xs">{x('Fração inexequível', 'Unexecutable fraction', 'Fracción inejecutable')}: {n(r.fraction, 6)} USDC → {x('tesouraria, sem carry', 'treasury, no carry', 'tesorería, sin carry')}</p>}
    {r.receipt && <p className="mono mt-1 text-[11px] text-[#9AA9D6]">{r.receipt}</p>}
    <div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-[11px] text-[#9AA9D6]">{x('Evento preparado do cenário:', 'Prepared scenario event:', 'Evento preparado del escenario:')}</span>
      {r.status === 'assessed' && entitled && <Btn onClick={() => dispatch({ type: 'AUTHORIZE_ROUND', id: r.id })}>{x('Avançar: autorização', 'Advance: authorization', 'Avanzar: autorización')}</Btn>}
      {r.status === 'assessed' && !entitled && <span className="text-xs text-[#9AA9D6]">{x('Sem crédito pessoal a autorizar; apenas encerramento.', 'No personal credit to authorize; closing only.', 'Sin crédito personal que autorizar; solo cierre.')}</span>}
      {r.status === 'authorized' && <Btn onClick={() => dispatch({ type: 'PAY_ROUND', id: r.id })}>{x('Avançar: pagamento', 'Advance: payment', 'Avanzar: pago')}</Btn>}
      {(r.status === 'uncertain' || ((r.status === 'cancelled' || r.closed) && r.scenario === 'uncertain' && !r.receipt)) && <Btn onClick={() => dispatch({ type: 'RECONCILE_ROUND', id: r.id })}>{x('Avançar: conciliação', 'Advance: reconciliation', 'Avanzar: conciliación')}</Btn>}
      {!r.closed && ['assessed', 'authorized', 'uncertain', 'paid', 'cancelled'].includes(r.status) && <Btn tone="ghost" onClick={() => dispatch({ type: 'CLOSE_ROUND', id: r.id })}>{x('Avançar: encerramento', 'Advance: closing', 'Avanzar: cierre')}</Btn>}
      {r.closed && <span className="text-xs text-[#9AA9D6]">{x('Encerrada, sem acúmulo nem reabertura.', 'Closed, no carry or reopening.', 'Cerrada, sin acumulación ni reapertura.')}</span>}</div>
  </article>;
}

export function Rounds({ state, dispatch }: { state: DemoState; dispatch: Dispatch<DemoAction> }) {
  const { x, n, tx } = useX();
  const [tab, setTab] = useState<'mine' | 'project'>('mine');
  const [sc, setSc] = useState<RoundScenario>('profit');
  const w = currentWeight(state);
  const mine = [...state.rounds].reverse();
  const credited = state.rounds.filter(r => r.receipt?.startsWith('EX-RECEIPT')).reduce((a, r) => a + r.netPersonal, 0);
  const pending = state.rounds.filter(r => (r.status === 'authorized' || r.status === 'uncertain' || r.status === 'assessed') && r.grossPersonal > 0 && r.staking > 0).reduce((a, r) => a + r.netPersonal, 0);
  return <div className="grid gap-4">
    <div role="tablist" aria-label={x('Participação e resultados', 'Participation and results', 'Participación y resultados')} className="flex gap-2">
      {(['mine', 'project'] as const).map(k => <button key={k} role="tab" id={`tab-${k}`} aria-selected={tab === k} aria-controls="rounds-panel" tabIndex={tab === k ? 0 : -1} onClick={() => setTab(k)} onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const nx = k === 'mine' ? 'project' : 'mine'; setTab(nx); document.getElementById(`tab-${nx}`)?.focus(); } }} className={`min-h-11 rounded-full px-5 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#36E0D0] ${tab === k ? 'bg-[#F2B632] text-[#070B1F]' : 'border border-white/25'}`}>{k === 'mine' ? x('Minha participação', 'My participation', 'Mi participación') : x('Resultados do projeto', 'Project results', 'Resultados del proyecto')}</button>)}
    </div>
    <div id="rounds-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="grid gap-4">
      {tab === 'mine' ? <>
        <Panel title={x('Peso e elegibilidade', 'Weight and eligibility', 'Peso y elegibilidad')} tag={x('Rodada diária UTC', 'UTC daily round', 'Ronda diaria UTC')}>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4"><Stat label={x('Saldo BETTEX confirmado', 'Confirmed BETTEX', 'BETTEX confirmado')} value={n(state.bettex, 0)} /><Stat label={x('Elegível desde', 'Eligible since', 'Elegible desde')} value={state.eligibleSince === null ? x('Sem participação', 'Not participating', 'Sin participación') : `T+${state.eligibleSince}h`} /><Stat label={x('Peso acumulado', 'Accumulated weight', 'Peso acumulado')} value={n(state.accumulatedWeight, 0)} /><Stat label={x('Peso corrente', 'Current weight', 'Peso actual')} value={n(w, 0)} accent="#36E0D0" /></div>
          <p className="mt-3 text-xs text-[#C5D2F1]">{x('Peso = quantidade confirmada × tempo elegível na rodada. Qualquer saída BETTEX zera o peso anterior e cancela todo crédito anterior não pago, inclusive autorizado. A retomada exige confirmação posterior. Revisão de participação', 'Weight = confirmed quantity × eligible time in the round. Any BETTEX exit zeroes prior weight and cancels every unpaid earlier credit, including authorized. Resuming requires later confirmation. Participation revision', 'Peso = cantidad confirmada × tiempo elegible en la ronda. Cualquier salida de BETTEX pone a cero el peso previo y cancela todo crédito anterior no pagado, incluso autorizado. Reanudar exige confirmación posterior. Revisión de participación')} #{state.participationRevision}.</p>
          <div className="mt-3 grid grid-cols-2 gap-2"><Stat label={x('Crédito USDC confirmado', 'Confirmed USDC credit', 'Crédito USDC confirmado')} value={n(credited)} accent="#6FE3A1" /><Stat label={x('Direitos ainda não recebidos', 'Rights not yet received', 'Derechos aún no recibidos')} value={n(pending)} accent="#F2B632" /></div>
        </Panel>
        <Panel title={x('Rodadas e meu crédito', 'Rounds and my credit', 'Rondas y mi crédito')}>{mine.length === 0 ? <p className="p-5 text-center text-sm text-[#9AA9D6]">{x('Nenhuma rodada apurada ainda. Escolha um cenário em Resultados do projeto.', 'No assessed rounds yet. Pick a scenario under Project results.', 'Aún no hay rondas apuradas. Elija un escenario en Resultados del proyecto.')}</p>
          : <div className="grid gap-3">{mine.map(r => <RoundCard key={r.id} r={r} dispatch={dispatch} />)}</div>}</Panel>
      </> : <>
        <Panel title={x('Apurar uma rodada', 'Assess a round', 'Apurar una ronda')} tag={x('Cenário preparado', 'Prepared scenario', 'Escenario preparado')}>
          <div className="flex flex-wrap items-end gap-3"><label className="grid gap-1 text-xs">{x('Perfil do resultado', 'Result profile', 'Perfil del resultado')}<select className={field} value={sc} onChange={e => setSc(e.target.value as RoundScenario)} data-testid="select-scenario">{SC.map(s => <option key={s.v} value={s.v}>{tx(s.l)}</option>)}</select></label>
            <Btn testid="button-assess" onClick={() => dispatch({ type: 'ASSESS_ROUND', scenario: sc })}>{x('Apurar rodada', 'Assess round', 'Apurar ronda')}</Btn><Example /></div>
          <p className="mt-2 text-xs text-[#9AA9D6]">{x('Os botões de autorização, pagamento, conciliação e encerramento avançam eventos preparados; o participante não tem poder financeiro ou administrativo.', 'Authorization, payment, reconciliation and closing buttons advance prepared events; the participant holds no financial or administrative power.', 'Los botones de autorización, pago, conciliación y cierre avanzan eventos preparados; el participante no tiene poder financiero ni administrativo.')}</p>
          <p className="mt-2 text-xs text-[#9AA9D6]">{x('Apurar avança ao corte diário UTC. Custos, tributos e retenção são valores de cenário, não alíquotas oficiais. Avance o relógio para explorar outra rodada independente.', 'Assessment advances to the daily UTC cutoff. Costs, taxes and withholding are scenario amounts, not official tax rates. Advance the clock to explore another independent round.', 'El cálculo avanza al corte diario UTC. Costos, impuestos y retención son valores de escenario, no tasas oficiales. Avanza el reloj para explorar otra ronda independiente.')}</p>
        </Panel>
        {mine.length === 0 ? <Panel><p className="p-5 text-center text-sm text-[#9AA9D6]">{x('Sem rodadas globais ainda.', 'No project rounds yet.', 'Aún no hay rondas del proyecto.')}</p></Panel> : mine.map(r => <RoundCard key={r.id} r={r} dispatch={dispatch} />)}
      </>}
    </div>
  </div>;
}
