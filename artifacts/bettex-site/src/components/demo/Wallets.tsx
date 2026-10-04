/** @jsxImportSource react */
import { useState, type Dispatch } from 'react';
import type { DemoAction, DemoState, MovementKind, Movement } from './types';
import { currentWeight, reservedUSDC, reservedBETTEX, demoPrice as PRICE } from './model';
import { Btn, Chip, Panel, Stat, field, useX, Example } from './ui';

const KINDS: { k: MovementKind; a: 'USDC' | 'BETTEX'; l: [string, string, string]; fee: number }[] = [
  { k: 'receive', a: 'USDC', l: ['Receber USDC', 'Receive USDC', 'Recibir USDC'], fee: 0 },
  { k: 'onramp', a: 'USDC', l: ['Entrada via on-ramp externo', 'External on-ramp entry', 'Entrada por on-ramp externo'], fee: 0 },
  { k: 'swap', a: 'BETTEX', l: ['Comprar no swap oficial', 'Buy on official swap', 'Comprar en el swap oficial'], fee: 2.5 },
  { k: 'send', a: 'BETTEX', l: ['Enviar BETTEX', 'Send BETTEX', 'Enviar BETTEX'], fee: 2.5 },
  { k: 'withdraw', a: 'USDC', l: ['Retirar rendimentos', 'Withdraw yield', 'Retirar rendimientos'], fee: 2.5 },
];


export function MovementRow({ m, dispatch, state }: { m: Movement; dispatch: Dispatch<DemoAction>; state: DemoState }) {
  const { x, n, tx } = useX();
  const def = KINDS.find(k => k.k === m.kind);
  const expired = m.kind === 'swap' && state.clock - (m.quoteAt ?? m.time) > 2 && m.status === 'proposed';
  return <li className="rounded-xl border border-white/10 bg-[#070B1F]/60 p-3" data-testid={`row-movement-${m.id}`}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-bold">{def ? tx(def.l) : m.kind === 'distribution' ? x('Crédito de rodada', 'Round credit', 'Crédito de ronda') : m.kind} <span className="mono text-xs text-[#9AA9D6]">{n(m.amount)} {m.asset}</span></p>
      <Chip status={m.status} />
    </div>
    <p className="mono mt-1 break-all text-[11px] text-[#9AA9D6]">{m.id} · T+{m.time}h · {m.destination} · {x('tarifa', 'fee', 'tarifa')} {n(m.fee)} USDC{m.externalCost > 0 ? ` · ${x('custo externo de cenário', 'scenario external cost', 'costo externo de escenario')} ${n(m.externalCost)} USDC` : ''}</p>
    {m.status === 'proposed' && <div className="mt-2 flex flex-wrap items-center gap-2">
      {expired ? <p className="text-xs text-[#FF8A45]">{x('Cotação de exemplo vencida (mais de 2 h). Cancele e revise de novo.', 'Example quote expired (over 2 h). Cancel and review again.', 'Cotización de ejemplo vencida (más de 2 h). Cancele y revise de nuevo.')}</p>
        : <Btn testid={`button-authorize-${m.id}`} onClick={() => dispatch({ type: 'AUTHORIZE_MOVEMENT', id: m.id })}>{x('Autorizar (visual)', 'Authorize (visual)', 'Autorizar (visual)')}</Btn>}
      <Btn tone="ghost" onClick={() => dispatch({ type: 'CANCEL_MOVEMENT', id: m.id })}>{x('Cancelar', 'Cancel', 'Cancelar')}</Btn>
    </div>}
    {m.status === 'open' && <div className="mt-2 flex flex-wrap gap-2"><Btn testid={`button-resolve-${m.id}`} onClick={() => dispatch({ type: 'RESOLVE_MOVEMENT', id: m.id })}>{x('Resolver conforme o cenário', 'Resolve per scenario', 'Resolver según el escenario')}</Btn></div>}
    {m.status === 'uncertain' && <div className="mt-2"><p className="text-xs text-[#FF8A45]">{x('Resposta incerta. Concilie se o destino recebeu; não há reenvio.', 'Uncertain response. Reconcile whether the destination received it; there is no resend.', 'Respuesta incierta. Concilie si el destino recibió; no hay reenvío.')}</p>
      <div className="mt-2 flex flex-wrap gap-2"><Btn onClick={() => dispatch({ type: 'RESOLVE_MOVEMENT', id: m.id, received: true })}>{x('Recebido: sim', 'Received: yes', 'Recibido: sí')}</Btn><Btn tone="ghost" onClick={() => dispatch({ type: 'RESOLVE_MOVEMENT', id: m.id, received: false })}>{x('Recebido: não', 'Received: no', 'Recibido: no')}</Btn></div></div>}
  </li>;
}

export function Wallets({ state, dispatch }: { state: DemoState; dispatch: Dispatch<DemoAction> }) {
  const { x, n, tx } = useX();
  const [kind, setKind] = useState<MovementKind>('receive');
  const [amount, setAmount] = useState('10');
  const [dest, setDest] = useState('SAMPLE-WALLET-DESTINO');
  const [quoteAt, setQuoteAt] = useState(state.clock);
  const [outcome, setOutcome] = useState<Movement['outcome']>('success');
  const def = KINDS.find(k => k.k === kind)!;
  const amt = Number(amount.replace(',', '.'));
  const needsDest = kind === 'send' || kind === 'withdraw';
  const destOk = !needsDest || /^SAMPLE-WALLET-[A-Z0-9-]+$/.test(dest);
  const cost = kind === 'swap' ? amt : 0;
  const avail = state.usdc - reservedUSDC(state);
  const extra = kind === 'onramp' || kind === 'send' || kind === 'withdraw' ? 0.5 : 0;
  const enough = kind === 'send' ? state.bettex - reservedBETTEX(state) >= amt && avail >= def.fee + extra
    : kind === 'withdraw' ? state.receivedYield >= amt && amt > def.fee + extra
    : kind === 'swap' ? avail >= amt + def.fee : kind === 'onramp' ? amt > extra : true;
  const quoteOld = kind === 'swap' && state.clock - quoteAt > 2;
  const err = quoteOld ? x('Cotação de exemplo vencida (mais de 2 h). Atualize a cotação.', 'Example quote expired (over 2 h). Refresh the quote.', 'Cotización de ejemplo vencida (más de 2 h). Actualice la cotización.') : !(amt > 0) ? x('Informe um valor maior que zero.', 'Enter an amount above zero.', 'Ingrese un monto mayor que cero.')
    : !destOk ? x('Destino inválido: o exemplo só aceita o prefixo SAMPLE-WALLET-.', 'Invalid destination: the example accepts only the SAMPLE-WALLET- prefix.', 'Destino inválido: el ejemplo solo acepta el prefijo SAMPLE-WALLET-.')
    : !enough ? x('Saldo insuficiente para o valor e a tarifa de exemplo.', 'Insufficient balance for the amount and example fee.', 'Saldo insuficiente para el monto y la tarifa de ejemplo.') : null;
  const participating = state.eligibleSince !== null;
  const mv = [...state.movements].reverse();
  return <div className="grid gap-4">
    <div className="grid gap-4 md:grid-cols-2" data-testid="wallets">
      <Panel title="USDC" tag={x('Carteira pessoal', 'Personal wallet', 'Cartera personal')}>
        <p className="display text-4xl font-extrabold text-[#36E0D0]" data-testid="text-usdc">{n(state.usdc)}</p>
        <div className="mt-3 grid grid-cols-2 gap-2"><Stat label={x('Comprometido', 'Committed', 'Comprometido')} value={n(reservedUSDC(state))} /><Stat label={x('Rendimentos recebidos', 'Yield received', 'Rendimientos recibidos')} value={n(state.receivedYield)} /></div>
        <p className="mt-3 text-xs text-[#9AA9D6]">{x('Saque de USDC não cancela a participação.', 'Withdrawing USDC does not cancel participation.', 'Retirar USDC no cancela la participación.')}</p>
        <div className="mt-3 flex flex-wrap gap-2"><Btn tone="ghost" onClick={() => setKind('receive')}>{x('Receber', 'Receive', 'Recibir')}</Btn><Btn tone="ghost" onClick={() => setKind('onramp')}>{x('On-ramp externo', 'External on-ramp', 'On-ramp externo')}</Btn><Btn tone="ghost" onClick={() => setKind('withdraw')}>{x('Retirar rendimentos', 'Withdraw yield', 'Retirar rendimientos')}</Btn></div>
      </Panel>
      <Panel title="BETTEX" tag={x('Carteira pessoal', 'Personal wallet', 'Cartera personal')}>
        <p className="display text-4xl font-extrabold text-[#F2B632]" data-testid="text-bettex">{n(state.bettex, 0)}</p>
        <div className="mt-3 grid grid-cols-2 gap-2"><Stat label={x('Peso corrente', 'Current weight', 'Peso actual')} value={n(currentWeight(state), 0)} /><Stat label={x('Participação', 'Participation', 'Participación')} value={participating ? x('Ativa', 'Active', 'Activa') : x('Aguardando', 'Waiting', 'En espera')} accent={participating ? '#6FE3A1' : '#FF8A45'} /></div>
        <p className="mt-3 text-xs text-[#9AA9D6]">{x('Participação automática pelo saldo confirmado. Qualquer saída zera o peso anterior e cancela créditos ainda não pagos.', 'Automatic participation by confirmed balance. Any exit zeroes prior weight and cancels unpaid credits.', 'Participación automática por saldo confirmado. Cualquier salida pone a cero el peso previo y cancela créditos no pagados.')}</p>
        <div className="mt-3 flex flex-wrap gap-2"><Btn tone="ghost" onClick={() => setKind('swap')}>{x('Comprar', 'Buy', 'Comprar')}</Btn><Btn tone="ghost" onClick={() => setKind('send')}>{x('Enviar', 'Send', 'Enviar')}</Btn></div>
      </Panel>
    </div>
    <Panel title={x('Nova movimentação', 'New movement', 'Nuevo movimiento')} tag={x('Revisão → autorização → resolução', 'Review → authorization → resolve', 'Revisión → autorización → resolución')}>
      <div className="grid gap-3 md:grid-cols-4">
        <label className="grid gap-1 text-xs">{x('Tipo', 'Type', 'Tipo')}<select className={field} value={kind} onChange={e => setKind(e.target.value as MovementKind)} data-testid="select-kind">{KINDS.map(k => <option key={k.k} value={k.k}>{tx(k.l)}</option>)}</select></label>
        <label className="grid gap-1 text-xs">{kind === 'swap' ? x('USDC a gastar', 'USDC to spend', 'USDC a gastar') : kind === 'send' ? 'BETTEX' : x('Valor bruto em USDC', 'Gross amount in USDC', 'Monto bruto en USDC')}<input className={field} inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} data-testid="input-amount" aria-invalid={!(amt > 0)} aria-describedby="form-error" /></label>
        <label className="grid gap-1 text-xs md:col-span-2">{x('Destino (exemplo)', 'Destination (example)', 'Destino (ejemplo)')}<input className={field} value={needsDest ? dest : 'SAMPLE-WALLET-OWN'} disabled={!needsDest} onChange={e => setDest(e.target.value)} data-testid="input-destination" aria-invalid={!destOk} aria-describedby="form-error" /></label>
      </div>
      <label className="mt-3 grid max-w-md gap-1 text-xs">{x('Desfecho de cenário', 'Scenario outcome', 'Resultado de escenario')}<select className={field} value={outcome} onChange={e => setOutcome(e.target.value as Movement['outcome'])}><option value="success">{x('Conclui', 'Completes', 'Concluye')}</option><option value="failure">{x('Falha', 'Fails', 'Falla')}</option><option value="uncertain">{x('Resposta incerta', 'Uncertain response', 'Respuesta incierta')}</option></select></label>
      {kind === 'receive' && <div className="mt-3 flex items-center gap-4 rounded-xl border border-dashed border-white/25 p-3"><svg viewBox="0 0 7 7" className="h-20 w-20 shrink-0 bg-[#F4F1E8]" role="img" aria-label={x('Marca de exemplo, não é QR nem endereço válido', 'Sample mark, not a valid QR or address', 'Marca de ejemplo, no es QR ni dirección válida')}>{Array.from({ length: 49 }, (_, i) => ((i * 7 + (i >> 3)) % 3 === 0 || i % 8 === 0) ? <rect key={i} x={i % 7} y={Math.floor(i / 7)} width="1" height="1" fill="#070B1F" /> : null)}</svg><div><p className="mono text-sm font-bold text-[#F2B632]">SAMPLE-WALLET-RECEIVE-USDC</p><p className="text-xs text-[#C5D2F1]">{x('Endereço ilustrativo, sem rede real e sem chave. Sem tarifa de serviço.', 'Illustrative address, no real network or key. No service fee.', 'Dirección ilustrativa, sin red real ni clave. Sin tarifa de servicio.')}</p></div></div>}
      {kind === 'onramp' && <ol className="mt-3 grid gap-2 sm:grid-cols-4" aria-label={x('Etapas do on-ramp externo', 'External on-ramp steps', 'Etapas del on-ramp externo')}>{(() => { const last = state.movements.find(m => m.kind === 'onramp'); const cur = last?.status === 'confirmed' ? 3 : !last || ['failed', 'cancelled', 'rejected'].includes(last.status) ? 0 : last.status === 'proposed' ? 1 : 2; return [x('Cotação', 'Quote', 'Cotización'), x('Visita ao provedor (ilustrativa, sem site externo)', 'Provider visit (illustrative, no external site)', 'Visita al proveedor (ilustrativa, sin sitio externo)'), x('Aguardando USDC', 'Awaiting USDC', 'Esperando USDC'), x('Confirmação e crédito único', 'Confirmation and single credit', 'Confirmación y crédito único')].map((l, i) => <li key={i} aria-current={cur === i} className={`rounded-lg border p-2 text-[11px] ${cur === i ? 'border-[#36E0D0] bg-[#36E0D0]/10' : 'border-white/15 text-[#9AA9D6]'}`}><b>{i + 1}.</b> {l}</li>); })()}</ol>}
      {kind === 'onramp' && <p className="mt-2 text-xs text-[#9AA9D6]">{x('Entrada somente por provedor externo ilustrativo; não existe saída (off-ramp) própria.', 'Entry only through an illustrative external provider; there is no off-ramp of our own.', 'Entrada solo por proveedor externo ilustrativo; no existe salida (off-ramp) propia.')}</p>}
      <dl className="mono mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#C5D2F1] md:grid-cols-4">
        <div><dt className="text-[#8FA8F0]">{x('Tarifa oficial', 'Official fee', 'Tarifa oficial')}</dt><dd>{n(def.fee)} USDC</dd></div>
        <div><dt className="text-[#8FA8F0]">{x('Custo externo', 'External cost', 'Costo externo')}</dt><dd>{n(extra)} USDC</dd></div>
        {kind === 'swap' && <div><dt className="text-[#8FA8F0]">{x('Preço ilustrativo', 'Illustrative price', 'Precio ilustrativo')}</dt><dd>{n(PRICE)} USDC/BETTEX</dd></div>}
        {kind === 'swap' && <div><dt className="text-[#8FA8F0]">{x('BETTEX recebido', 'BETTEX received', 'BETTEX recibido')}</dt><dd>{n(cost / PRICE || 0, 0)}</dd></div>}
        <div><dt className="text-[#8FA8F0]">{x('Cotação revisada em', 'Quote reviewed at', 'Cotización revisada en')}</dt><dd>T+{quoteAt}h</dd></div>
      </dl>
      <div className="mt-3 rounded-xl border border-white/10 bg-[#070B1F]/70 p-3 text-xs" data-testid="review-summary"><p className="mb-1 font-bold">{x('Revisão exata', 'Exact review', 'Revisión exacta')}</p>
        {kind === 'receive' && <p>{x('Entrega', 'Delivered', 'Entrega')}: {n(amt || 0)} USDC · {x('tarifa de serviço', 'service fee', 'tarifa de servicio')} {n(0)}</p>}
        {kind === 'onramp' && <p>{x('Bruto', 'Gross', 'Bruto')} {n(amt || 0)} − {x('custo externo', 'external cost', 'costo externo')} {n(0.5)} = {x('crédito líquido', 'net credit', 'crédito neto')} {n(Math.max(0, (amt || 0) - 0.5))} USDC</p>}
        {kind === 'swap' && <p>{x('Débito', 'Debit', 'Débito')}: {n(amt || 0)} + {n(2.5)} = {n((amt || 0) + 2.5)} USDC · {x('BETTEX recebido', 'BETTEX received', 'BETTEX recibido')}: {n((amt || 0) / PRICE, 0)}</p>}
        {kind === 'send' && <p>{x('Envia', 'Sends', 'Envía')} {n(amt || 0, 0)} BETTEX · {x('débito de custos em USDC', 'USDC cost debit', 'débito de costos en USDC')}: {n(2.5)} + {n(0.5)} = {n(3)}</p>}
        {kind === 'withdraw' && <p>{x('Bruto', 'Gross', 'Bruto')} {n(amt || 0)} − {n(2.5)} − {n(0.5)} = {x('entrega ao destino', 'delivered to destination', 'entrega al destino')} {n(Math.max(0, (amt || 0) - 3))} USDC</p>}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">{kind === 'swap' && <Btn tone="ghost" onClick={() => setQuoteAt(state.clock)}>{x('Atualizar cotação', 'Refresh quote', 'Actualizar cotización')}</Btn>}<Btn testid="button-review" disabled={!!err} onClick={() => dispatch({ type: 'REVIEW_MOVEMENT', kind, amount: amt, destination: needsDest ? dest : 'SAMPLE-WALLET-OWN', outcome, quoteAt })}>{x('Revisar', 'Review', 'Revisar')}</Btn>{err && <p id="form-error" role="alert" className="text-xs text-[#FF8A45]">{err}</p>}<Example /></div>
    </Panel>
    <Panel title={x('Movimentos pessoais', 'Personal movements', 'Movimientos personales')}>
      {mv.length === 0 ? <p className="rounded-xl border border-dashed border-white/20 p-6 text-center text-sm text-[#9AA9D6]">{x('Nenhuma movimentação ainda. Revise uma acima para ver o percurso completo.', 'No movements yet. Review one above to see the full path.', 'Aún no hay movimientos. Revise uno arriba para ver el recorrido completo.')}</p>
        : <ul className="grid gap-2">{mv.slice(0, 8).map(m => <MovementRow key={m.id} m={m} state={state} dispatch={dispatch} />)}</ul>}
    </Panel>
  </div>;
}
