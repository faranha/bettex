import type { AgentId, DemoAction, DemoState, Movement, Operation, PublicEvent, Round, Status, Text } from './types';

const tr = (pt: string, en: string, es: string): Text => [pt, en, es];
const roundMoney = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const currentWeight = (s: DemoState) => s.accumulatedWeight + (s.eligibleSince === null ? 0 : s.bettex * Math.max(0, s.clock - Math.max(Math.floor(s.clock / 24) * 24, s.eligibleSince)));
export const reservedUSDC = (s: DemoState) => s.movements.filter(m => ['authorized', 'open', 'uncertain'].includes(m.status)).reduce((sum, m) => sum + (m.kind === 'swap' ? m.amount + m.fee + m.externalCost : m.kind === 'withdraw' ? m.amount : m.kind === 'send' ? m.fee + m.externalCost : 0), 0);
export const reservedBETTEX = (s: DemoState) => s.movements.filter(m => m.kind === 'send' && ['authorized', 'open', 'uncertain'].includes(m.status)).reduce((sum, m) => sum + m.amount, 0);
export const treasuryAvailable = (s: DemoState) => Math.max(0, s.treasury.liquid - s.treasury.obligations - s.treasury.committed);
export const investableBase = (s: DemoState) => Math.max(0, s.treasury.assets - s.treasury.obligations - s.treasury.reserve);
export const demoPrice = 0.02;
export const demoServiceFee = 2.5;
export const MAX_SCENARIO_STEP = 8;

function operation(id: string, agent: AgentId, title: Text, capital: number, source: Text, data: Operation['data']): Operation {
  return { id, agent, title, capital, source, data, result: 0, costs: 0, status: 'proposed', reason: tr('Análise solicitada pela IA BETTEX.', 'Analysis requested by BETTEX AI.', 'Análisis solicitado por la IA BETTEX.'), events: [], version: 1, quoteUntil: id === 'EX-S02' ? 1 : 3 };
}
export function createInitialState(): DemoState {
  return {
    clock: 0, step: 0, running: false, session: 'ready', profile: 'ready',
    usdc: 1200, bettex: 10000, receivedYield: 0, eligibleSince: 0, accumulatedWeight: 0, participationRevision: 0,
    movements: [], rounds: [], roundWeights: {}, error: null,
    operations: [
      operation('EX-P01', 'predictions', tr('Evento binário · posição SIM', 'Binary event · YES position', 'Evento binario · posición SÍ'), 500,
        tr('Gamma: regras; CLOB: preço e profundidade. Dados preparados.', 'Gamma: rules; CLOB: price and depth. Prepared data.', 'Gamma: reglas; CLOB: precio y profundidad. Datos preparados.'),
        [
          { label: tr('Probabilidade estimada', 'Estimated probability', 'Probabilidad estimada'), value: ['60%', '60%', '60%'] },
          { label: tr('Preço / custo por unidade', 'Price / cost per unit', 'Precio / coste por unidad'), value: ['0,55 / 0,01 USDC', '0.55 / 0.01 USDC', '0,55 / 0,01 USDC'] },
          { label: tr('Margem esperada', 'Expected edge', 'Margen esperado'), value: ['0,04 USDC', '0.04 USDC', '0,04 USDC'] },
          { label: tr('Resolução', 'Resolution', 'Resolución'), value: tr('Fonte do evento conferida antes da liquidação.', 'Event source checked before settlement.', 'Fuente del evento verificada antes de liquidar.') },
          { label: tr('Posição de cenário', 'Scenario position', 'Posición de escenario'), value: tr('400 unidades SIM × 0,55 = 220 USDC; 500 é a reserva máxima, não o custo realizado.', '400 YES units × 0.55 = 220 USDC; 500 is the maximum reservation, not realized cost.', '400 unidades SÍ × 0,55 = 220 USDC; 500 es la reserva máxima, no el costo realizado.') },
        ]),
      operation('EX-C01', 'crypto', tr('ETH · compra à vista', 'ETH · spot purchase', 'ETH · compra al contado'), 700,
        tr('Preços e profundidade preparados; Allora: inferência opcional; conector Robinhood: cripto.', 'Prepared prices and depth; Allora: optional inference; Robinhood connector: crypto.', 'Precios y profundidad preparados; Allora: inferencia opcional; conector Robinhood: cripto.'),
        [
          { label: tr('Posição', 'Position', 'Posición'), value: tr('À vista, sem alavancagem.', 'Spot, no leverage.', 'Al contado, sin apalancamiento.') },
          { label: tr('Sinal', 'Signal', 'Señal'), value: tr('Análise de liquidez e exposição correlacionada.', 'Liquidity and correlated exposure analysis.', 'Análisis de liquidez y exposición correlacionada.') },
          { label: tr('Custo autorizado de cenário', 'Scenario authorized cost', 'Coste autorizado del escenario'), value: ['2 USDC', '2 USDC', '2 USDC'] },
          { label: tr('Entrada à vista de cenário', 'Scenario spot entry', 'Entrada spot de escenario'), value: ['0,175 ETH × 4.000 = 700 USDC', '0.175 ETH × 4,000 = 700 USDC', '0,175 ETH × 4.000 = 700 USDC'] },
        ]),
      operation('EX-S01', 'sports', tr('Surebet · duas coberturas', 'Surebet · two legs', 'Surebet · dos coberturas'), 600,
        tr('Odds de duas casas ilustrativas, limites e regras de liquidação.', 'Odds from two illustrative bookmakers, limits and settlement rules.', 'Cuotas de dos casas ilustrativas, límites y reglas de liquidación.'),
        [
          { label: tr('Odds A / B', 'Odds A / B', 'Cuotas A / B'), value: ['2,10 / 2,10', '2.10 / 2.10', '2,10 / 2,10'] },
          { label: tr('Soma inversa', 'Inverse sum', 'Suma inversa'), value: ['0,9524', '0.9524', '0,9524'] },
          { label: tr('Capital conjunto', 'Combined capital', 'Capital conjunto'), value: ['300 + 300 = 600 USDC', '300 + 300 = 600 USDC', '300 + 300 = 600 USDC'] },
          { label: tr('Execução incompleta', 'Incomplete execution', 'Ejecución incompleta'), value: tr('Casa B recusa; cobertura não presumida. Novas partes suspensas.', 'Bookmaker B refuses; coverage not assumed. New legs suspended.', 'Casa B rechaza; no se presume cobertura. Nuevas partes suspendidas.') },
        ]),
      operation('EX-B01', 'bonus', tr('Bônus · requisitos de aposta', 'Bonus · wagering requirements', 'Bono · requisitos de apuesta'), 500,
        tr('Condições de oferta preparadas: prazo, elegibilidade, permissão e teto de saque.', 'Prepared offer terms: deadline, eligibility, permission and withdrawal cap.', 'Condiciones preparadas: plazo, elegibilidad, permiso y límite de retiro.'),
        [
          { label: tr('Bônus nominal', 'Nominal bonus', 'Bono nominal'), value: ['100 USDC', '100 USDC', '100 USDC'] },
          { label: tr('Requisito / volume', 'Requirement / volume', 'Requisito / volumen'), value: ['30× / 3.000 USDC', '30× / 3,000 USDC', '30× / 3.000 USDC'] },
          { label: tr('Progresso inicial', 'Initial progress', 'Progreso inicial'), value: ['0 / 3.000 USDC', '0 / 3,000 USDC', '0 / 3.000 USDC'] },
          { label: tr('Custo do cenário', 'Scenario cost', 'Coste del escenario'), value: ['4 USDC', '4 USDC', '4 USDC'] },
        ]),
      operation('EX-P02', 'predictions', tr('Alternativa sem margem', 'Alternative without edge', 'Alternativa sin margen'), 600,
        tr('Preço e custos superam a probabilidade estimada.', 'Price and costs exceed estimated probability.', 'Precio y costes superan la probabilidad estimada.'),
        [{ label: tr('Preço + custos / probabilidade', 'Price + costs / probability', 'Precio + costes / probabilidad'), value: ['0,61 / 60%', '0.61 / 60%', '0,61 / 60%'] }]),
      operation('EX-C02', 'crypto', tr('Exposição correlacionada', 'Correlated exposure', 'Exposición correlacionada'), 700,
        tr('Combinação alternativa proposta: 14.300 + 700 > 14.600 USDC. Não é posição executada.', 'Proposed alternative combination: 14,300 + 700 > 14,600 USDC. Not an executed position.', 'Combinación alternativa propuesta: 14.300 + 700 > 14.600 USDC. No es posición ejecutada.'),
        [{ label: tr('Motivo de bloqueio', 'Blocking reason', 'Motivo del bloqueo'), value: tr('Limite documentado de 20% na base investível de cenário: 100.000 − 3.000 obrigações − 24.000 reserva = 73.000.', 'Documented 20% limit on scenario investable base: 100,000 − 3,000 obligations − 24,000 reserve = 73,000.', 'Límite documentado del 20% en la base invertible de escenario: 100.000 − 3.000 obligaciones − 24.000 reserva = 73.000.') }]),
      operation('EX-B02', 'bonus', tr('Oferta incompatível', 'Incompatible offer', 'Oferta incompatible'), 500,
        tr('Condições da oferta proíbem automação.', 'Offer terms prohibit automation.', 'Las condiciones prohíben la automatización.'),
        [{ label: tr('Elegibilidade', 'Eligibility', 'Elegibilidad'), value: tr('Permissão de execução ausente.', 'Execution permission absent.', 'Permiso de ejecución ausente.') }]),
      operation('EX-S02', 'sports', tr('Cotação vencida', 'Expired quote', 'Cotización vencida'), 800,
        tr('Resposta atrasada não renova validade.', 'Late response does not renew validity.', 'Una respuesta tardía no renueva la validez.'),
        [{ label: tr('Validade', 'Validity', 'Validez'), value: tr('Sem envio sob dados vencidos.', 'No submission with expired data.', 'Sin envío con datos vencidos.') }]),
    ],
    messages: [
      { id: 'MSG-1', author: 'example', text: tr('Como a IA compara as oportunidades?', 'How does the AI compare opportunities?', '¿Cómo compara la IA las oportunidades?'), time: 0, reactions: 3, reacted: false },
      { id: 'MSG-2', author: 'system', text: tr('Probabilidade, custos, liquidez e exposição entram na análise. Acompanhe EX-P01.', 'Probability, costs, liquidity and exposure inform analysis. Follow EX-P01.', 'Probabilidad, costes, liquidez y exposición forman el análisis. Sigue EX-P01.'), reference: 'EX-P01', time: 0, reactions: 1, reacted: false },
    ],
    poll: { votes: [18, 12, 7], selected: null, closed: false },
    publicEvents: [{ id: 'PUB-1', time: 0, agent: 'orchestrator', status: 'proposed', text: tr('IA BETTEX solicita comparação das oportunidades e respostas dos agentes.', 'BETTEX AI requests opportunity comparison and agent responses.', 'La IA BETTEX solicita comparar oportunidades y respuestas de agentes.') }],
    policy: { version: 1, stage: 'suggested', scheduledAt: null, signatures: 0, paused: false, incident: 'none' },
    treasury: { assets: 100000, reserve: 24000, requiredReserve: 22000, liquid: 72000, obligations: 3000, committed: 0, transit: 4000, reserveTransit: 0, liquidityTransit: 4000, operating: 0 },
    buyback: { wallet: 1000, committed: 0, acquired: 0, burned: 0, stage: 'accumulating' },
  };
}
function log(s: DemoState, agent: AgentId, status: Status, text: Text, reference?: string, asset?: PublicEvent['asset']) {
  s.publicEvents.push({ id: `PUB-${s.publicEvents.length + 1}`, time: s.clock, agent, status, text, ...(reference ? { reference } : {}), ...(asset ? { asset } : {}) });
}
function fail(s: DemoState, text: Text): DemoState { s.error = text; return s; }
function opState(s: DemoState, op: Operation, status: Status, reason: Text) {
  op.status = status; op.reason = reason; op.events.push({ time: s.clock, status, text: reason });
  log(s, op.agent, status, reason, op.id);
}
function settleOperation(s: DemoState, op: Operation, result: number, costs: number) {
  op.result = result; op.costs = costs;
  // The fixture's capital was reserved, not counted as an expense.
  const reserved = op.agent === 'sports' ? op.capital / 2 : op.capital;
  s.treasury.committed -= reserved;
  s.treasury.assets = roundMoney(s.treasury.assets + result - costs);
  s.treasury.liquid = roundMoney(s.treasury.liquid + result - costs);
  opState(s, op, 'confirmed', result < 0
    ? tr('Perda realizada e conciliada; nenhum déficit passa para outra rodada.', 'Realized reconciled loss; no deficit carries to another round.', 'Pérdida realizada y conciliada; no se traslada déficit a otra ronda.')
    : tr('Desfecho conferido, custos e resultado conciliados uma única vez.', 'Outcome verified, costs and result reconciled exactly once.', 'Desenlace verificado, costes y resultado conciliados una sola vez.'));
}
function tick(s: DemoState) {
  if ((s.clock + 1) % 24 === 0) s.roundWeights = { [Math.floor(s.clock / 24)]: currentWeight(s) + (s.eligibleSince === null ? 0 : s.bettex) };
  s.clock += 1;
  if (s.clock % 24 === 0) { s.accumulatedWeight = 0; if (s.eligibleSince !== null) s.eligibleSince = s.clock; }
  if (s.step >= MAX_SCENARIO_STEP) { s.running = false; return; }
  s.step++;
  if (s.policy.paused && s.step <= 3) {
    log(s, 'governance', 'cancelled', tr('Novas execuções afetadas pausadas. Conciliação continua.', 'Affected new executions paused. Reconciliation continues.', 'Nuevas ejecuciones afectadas pausadas. La conciliación continúa.'));
    s.step--; s.running = false; return;
  }
  const main = s.operations.slice(0, 4);
  if (s.step === 1) main.forEach(o => opState(s, o, 'analyzing', tr('Agente responde à IA com análise e custos; risco independente confere.', 'Agent replies to AI with analysis and costs; independent risk checks.', 'El agente responde con análisis y costes; riesgo independiente verifica.')));
  if (s.step === 2) {
    for (const o of main) if (s.clock > o.quoteUntil) {
      opState(s, o, 'rejected', tr('Dados vencidos bloqueiam a proposta anterior. Agente prepara nova versão e revalida antes de reservar.', 'Expired data block prior proposal. Agent prepares a new version and revalidates before reservation.', 'Datos vencidos bloquean la propuesta anterior. El agente prepara una nueva versión y revalida antes de reservar.'));
      o.version++; o.quoteUntil = s.clock + 1;
    }
    main.forEach(o => opState(s, o, 'authorized', tr('Mandato v1, teto individual 1%, mercado 10% e caixa conferidos; reserva única.', 'Mandate v1, individual cap 1%, market 10% and cash checked; single reservation.', 'Mandato v1, límite individual 1%, mercado 10% y caja verificados; reserva única.')));
    s.treasury.committed += main.reduce((v,o)=>v+o.capital,0);
    s.operations.slice(4, 7).forEach(o => opState(s, o, 'rejected', o.source));
    opState(s, s.operations[7], 'rejected', tr('Cotação vencida; nenhuma ordem enviada.', 'Quote expired; no order submitted.', 'Cotización vencida; no se envió orden.'));
    log(s, 'treasury', 'rejected', tr('Reserva concorrente: 2.300 USDC já comprometidos não podem ser usados por outra proposta.', 'Concurrent reservation: 2,300 USDC already committed cannot fund another proposal.', 'Reserva concurrente: 2.300 USDC comprometidos no pueden financiar otra propuesta.'));
  }
  if (s.step === 3) {
    for (const o of main) if (s.clock > o.quoteUntil) {
      opState(s, o, 'cancelled', tr('Envio da versão antiga impedido após pausa. Reserva única mantida; nova análise vinculada substitui a anterior.', 'Old version submission blocked after pause. Single reservation held; newly bound analysis replaces the prior one.', 'Envío de versión anterior bloqueado tras pausa. Reserva única mantenida; un nuevo análisis vinculado reemplaza el anterior.'));
      o.version++; o.quoteUntil = s.clock + 1;
      opState(s, o, 'authorized', tr('Dados renovados e risco revalidado pela IA no mandato vigente, sem reservar duas vezes.', 'Data renewed and risk revalidated by AI under current mandate, without reserving twice.', 'Datos renovados y riesgo revalidado por IA bajo mandato vigente, sin reservar dos veces.'));
    }
    main.forEach(o => opState(s, o, 'open', tr('Execução de cenário iniciada pelo executor registrado.', 'Scenario execution started by the registered executor.', 'Ejecución del escenario iniciada por el ejecutor registrado.')));
    opState(s, main[2], 'partial', tr('Casa A aceita 300; casa B recusa 300. Impedido envio tardio da parte B antes de liberar sua reserva.', 'Bookmaker A accepts 300; B refuses 300. Late B submission blocked before releasing its reservation.', 'Casa A acepta 300; B rechaza 300. Envío tardío B bloqueado antes de liberar su reserva.'));
    s.treasury.committed -= main[2].capital / 2;
    main[3].data[2].value = ['1.500 / 3.000 USDC', '1,500 / 3,000 USDC', '1.500 / 3.000 USDC'];
  }
  if (s.step === 4) {
    opState(s, main[1], 'uncertain', tr('Resposta do conector perdida. Capital continua comprometido; conciliar, não reenviar.', 'Connector response lost. Capital stays committed; reconcile, do not resubmit.', 'Respuesta del conector perdida. Capital comprometido; conciliar, no reenviar.'));
    log(s, 'governance', 'uncertain', tr('Incidente de resposta registrado, limitado a EX-C01; demais operações preservadas.', 'Response incident recorded, limited to EX-C01; other operations preserved.', 'Incidente de respuesta registrado, limitado a EX-C01; otras operaciones preservadas.'), 'EX-C01');
  }
  if (s.step === 5) {
    settleOperation(s, main[0], 180, 8); settleOperation(s, main[2], -90, 6);
    main[0].data[3].value = tr('Resolução SIM preparada: 400 USDC − entrada 220 = resultado 180. Custos 8 incluem 4 por unidade/volume e 4 externos.', 'Prepared YES resolution: 400 USDC − 220 entry = result 180. Costs 8 include 4 for unit/volume and 4 external.', 'Resolución SÍ preparada: 400 USDC − entrada 220 = resultado 180. Costos 8 incluyen 4 por unidad/volumen y 4 externos.');
    main[2].data.push({ label: tr('Encerramento da exposição', 'Exposure closure', 'Cierre de exposición'), value: tr('Cash-out ilustrativo: 210 devolvidos − 300 executados = perda 90, mais custos 6. Não presume disponibilidade real de cash-out.', 'Illustrative cash-out: 210 returned − 300 executed = loss 90, plus costs 6. Does not presume actual cash-out availability.', 'Cash-out ilustrativo: 210 devueltos − 300 ejecutados = pérdida 90, más costos 6. No presume disponibilidad real de cash-out.') });
  }
  if (s.step === 6) {
    settleOperation(s, main[1], -30, 2); settleOperation(s, main[3], 40, 4);
    main[3].data[2].value = ['3.000 / 3.000 USDC', '3,000 / 3,000 USDC', '3.000 / 3.000 USDC'];
    main[3].data.push({ label: tr('Valor realizado do bônus', 'Realized bonus value', 'Valor realizado del bono'), value: tr('100 nominal não é lucro garantido: resultado conciliado 40 após o percurso; custos adicionais 4.', '100 nominal is not guaranteed profit: reconciled result 40 after the journey; additional costs 4.', '100 nominal no es ganancia garantizada: resultado conciliado 40 tras el recorrido; costos adicionales 4.') });
    s.messages.push({ id: 'MSG-SCENARIO', author: 'system', text: tr('As quatro operações foram conciliadas, incluindo perdas. Restam recursos em trânsito e correções antes da apuração.', 'The four operations are reconciled, including losses. Funds in transit and corrections remain before assessment.', 'Las cuatro operaciones están conciliadas, incluidas las pérdidas. Faltan recursos en tránsito y correcciones antes del cálculo.'), reference: 'EX-C01', time: s.clock, reactions: 0, reacted: false });
  }
  if (s.step === 7) {
    log(s, 'treasury', 'confirmed', tr('4.000 USDC em trânsito conciliados. Disponibilidade reconhecida uma vez.', '4,000 USDC in transit reconciled. Availability recognized once.', '4.000 USDC en tránsito conciliados. Disponibilidad reconocida una vez.'));
    s.treasury.liquid += s.treasury.liquidityTransit; s.treasury.liquidityTransit = 0; s.treasury.transit = s.treasury.reserveTransit;
  }
  if (s.step === 8) {
    // A second reconciliation changes only the variation, not the original loss twice.
    main[1].result -= 5; s.treasury.assets -= 5; s.treasury.liquid -= 5;
    main[1].data.push({ label: tr('Saída e correção conciliadas', 'Reconciled exit and correction', 'Salida y corrección conciliadas'), value: tr('0,175 ETH × 3.800 = 665 USDC; 665 − 700 = perda 35. Primeiro reconhecidos 670; ajuste único −5. Custos 2 separados.', '0.175 ETH × 3,800 = 665 USDC; 665 − 700 = loss 35. Initially recognized 670; single −5 adjustment. Costs 2 separate.', '0,175 ETH × 3.800 = 665 USDC; 665 − 700 = pérdida 35. Primero reconocidos 670; ajuste único −5. Costos 2 separados.') });
    opState(s, main[1], 'confirmed', tr('Correção conciliada de −5 USDC no mesmo fato. Perda total −35; não repetir a perda original nem debitar carteira pessoal.', 'Reconciled correction of −5 USDC on the same fact. Total loss −35; do not repeat original loss or debit personal wallet.', 'Corrección conciliada de −5 USDC en el mismo hecho. Pérdida total −35; sin repetir pérdida original ni debitar cartera personal.'));
    s.running = false; log(s, 'orchestrator', 'closed', tr('Ciclo de operações concluído. Rodadas e movimentos pessoais continuam independentes.', 'Operation cycle completed. Rounds and personal movements remain independent.', 'Ciclo de operaciones completado. Rondas y movimientos personales continúan independientes.'));
  }
}

function cancelEntitlement(s: DemoState) {
  s.accumulatedWeight = 0; s.eligibleSince = null; s.participationRevision++;
  for (const day of Object.keys(s.roundWeights)) s.roundWeights[Number(day)] = 0;
  for (const r of s.rounds) {
    // A started uncertain transfer remains a fact to reconcile, never a new send.
    if (!r.receipt && ['assessed', 'authorized', 'uncertain'].includes(r.status)) {
      if (r.status !== 'uncertain') {
        s.treasury.obligations = roundMoney(Math.max(3000, s.treasury.obligations - r.grossPersonal));
        r.remainingObligation = roundMoney(Math.max(0, r.remainingObligation - r.grossPersonal));
      }
      r.status = 'cancelled';
      log(s, 'treasury', 'cancelled', tr('Saída BETTEX cancela todo direito anterior não recebido; peso zerado, histórico preservado.', 'BETTEX exit cancels all prior unreceived entitlement; weight reset, history preserved.', 'Salida BETTEX cancela todo derecho anterior no recibido; peso reiniciado, historial preservado.'), r.id);
    }
  }
}
function resolveMovement(s: DemoState, m: Movement, received?: boolean) {
  if (!['open', 'uncertain'].includes(m.status)) return;
  if (m.status === 'uncertain' && received === undefined) return;
  const success = m.status === 'uncertain' ? received : m.outcome !== 'failure';
  if (!success) {
    m.status = 'failed';
    log(s, 'treasury', 'failed', tr('Não envio comprovado e tentativa antiga impedida. Sem débito, crédito ou tarifa duplicada.', 'Non-submission proven and old attempt blocked. No duplicate debit, credit or fee.', 'No envío probado e intento antiguo bloqueado. Sin débito, crédito ni tarifa duplicados.'), m.id, m.asset);
    return;
  }
  if (m.kind === 'receive' || m.kind === 'onramp') s.usdc = roundMoney(s.usdc + m.amount - m.externalCost);
  if (m.kind === 'swap') {
    s.usdc = roundMoney(s.usdc - m.amount - m.fee);
    s.accumulatedWeight = currentWeight(s); s.eligibleSince = s.clock;
    s.bettex += m.amount / demoPrice;
    s.treasury.assets += m.amount; s.treasury.liquid += m.amount; s.treasury.operating += m.fee;
  }
  if (m.kind === 'send') {
    cancelEntitlement(s);
    s.bettex -= m.amount; s.usdc = roundMoney(s.usdc - m.fee - m.externalCost); s.treasury.operating += m.fee;
    // Retained tokens restart only from this later, confirmed outgoing balance.
    s.eligibleSince = s.clock;
  }
  if (m.kind === 'withdraw') {
    s.usdc = roundMoney(s.usdc - m.amount);
    s.receivedYield = roundMoney(s.receivedYield - m.amount);
    s.treasury.operating += m.fee;
  }
  m.status = 'confirmed';
  log(s, 'treasury', 'confirmed', tr('Movimento conciliado: ativo, rede, origem, destino, valor e critério de recebimento conferidos. Efeito único.', 'Movement reconciled: asset, network, source, destination, value and receipt criterion checked. Single effect.', 'Movimiento conciliado: activo, red, origen, destino, valor y criterio de recepción verificados. Efecto único.'), m.id, m.asset);
}
function assess(s: DemoState, scenario: Round['scenario']) {
  if (s.step < MAX_SCENARIO_STEP) return fail(s, tr('Conclua o ciclo e suas correções antes da apuração.', 'Complete the cycle and its corrections before assessment.', 'Completa el ciclo y sus correcciones antes del cálculo.'));
  const day = s.clock > 0 && s.clock % 24 === 0 ? s.clock / 24 - 1 : Math.floor(s.clock / 24);
  if (s.rounds.some(r => r.utcDay === day)) return fail(s, tr('Este dia UTC já tem uma rodada. Avance o relógio até o próximo dia; nenhuma reabertura.', 'This UTC day already has a round. Advance the clock to the next day; no reopening.', 'Este día UTC ya tiene una ronda. Avanza el reloj al próximo día; sin reapertura.'));
  if (s.rounds.length && s.clock <= Math.max(...s.rounds.map(r => (r.utcDay + 1) * 24))) return fail(s, tr('Avance o relógio na nova rodada antes de apurar. A anterior não é reaberta.', 'Advance the clock in the new round before assessment. The prior round does not reopen.', 'Avanza el reloj en la nueva ronda antes del cálculo. La anterior no se reabre.'));
  const cutoff = (day + 1) * 24;
  const weight = scenario === 'zero' ? 0 : s.clock === cutoff ? s.roundWeights[day] ?? 0 : s.accumulatedWeight + (s.eligibleSince === null ? 0 : s.bettex * Math.max(0, cutoff - Math.max(day * 24, s.eligibleSince)));
  const totalWeight = scenario === 'zero' ? 0 : weight + 990000;
  // Each alternate day is a distinct prepared fixture, not previous-round profit.
  const gross = scenario === 'loss' ? -100 : s.rounds.length === 0 ? s.operations.slice(0, 4).reduce((v,o) => v + o.result, 0) : 100;
  const costs = 20, entityTax = scenario === 'loss' ? 0 : 8;
  const eligible = gross - costs - entityTax;
  if (scenario === 'reserve' && s.treasury.reserve >= s.treasury.requiredReserve) {
    const sent = s.treasury.reserve - s.treasury.requiredReserve + 1000;
    s.treasury.reserve -= sent; s.treasury.transit += sent; s.treasury.reserveTransit += sent;
    log(s, 'treasury', 'uncertain', tr('Cenário de reserva: parcela sai da reserva confirmada e permanece em trânsito no corte. Sem tratar trânsito como reserva disponível.', 'Reserve scenario: a portion leaves confirmed reserves and stays in transit at cutoff. In-transit funds are not available reserves.', 'Escenario de reserva: una parte sale de la reserva confirmada y sigue en tránsito al corte. Lo que está en tránsito no es reserva disponible.'));
  }
  if (scenario === 'liquidity') {
    const sent = Math.max(0, s.treasury.liquid - s.treasury.obligations - s.treasury.committed);
    s.treasury.liquid -= sent; s.treasury.transit += sent; s.treasury.liquidityTransit += sent;
    log(s, 'treasury', 'uncertain', tr('Cenário de liquidez: recursos em trânsito não são caixa disponível. Resultado é apurado, mas distribuição fica bloqueada no corte.', 'Liquidity scenario: funds in transit are not available cash. Result is assessed but distribution is blocked at cutoff.', 'Escenario de liquidez: los fondos en tránsito no son caja disponible. Se calcula el resultado, pero se bloquea la distribución al corte.'));
  }
  const reservesPass = scenario !== 'reserve' && s.treasury.reserve >= s.treasury.requiredReserve;
  const liquidityPass = treasuryAvailable(s) >= Math.max(0, eligible) + entityTax;
  const distribute = eligible > 0 && totalWeight > 0 && reservesPass && liquidityPass;
  const staking = distribute ? eligible / 4 : 0;
  const raw = scenario === 'fraction' && distribute && weight > 0 ? 0.004 : staking * weight / (totalWeight || 1);
  const grossPersonal = Math.floor(raw * 100) / 100;
  const fraction = raw - grossPersonal;
  // Scenario amount, not an official tax percentage or universal deduction.
  const withholding = Math.min(grossPersonal, scenario === 'fraction' ? 0 : 0.1);
  const r: Round = {
    id: `EX-ROUND-${day + 1}`, utcDay: day, scenario, status: 'assessed', gross, costs, entityTax, eligible,
    treasury: distribute ? eligible / 2 + fraction : Math.max(0, eligible),
    staking: distribute ? staking - fraction : 0, buyback: distribute ? eligible / 4 : 0,
    weight, totalWeight: scenario === 'fraction' && weight > 0 ? staking * weight / 0.004 : totalWeight,
    grossPersonal, withholding, netPersonal: roundMoney(grossPersonal - withholding), fraction,
    receipt: null, closed: false, reservesPass, liquidityPass, remainingObligation: distribute ? staking - fraction : 0,
  };
  s.rounds.unshift(r);
  if (s.rounds.length > 1) {
    // Independent future-day result fixture, applied once, not carried forward.
    s.treasury.assets += gross - costs; s.treasury.liquid += gross - costs;
  } else {
    const originalGross = s.operations.slice(0, 4).reduce((v, o) => v + o.result, 0);
    const originalCosts = s.operations.slice(0, 4).reduce((v, o) => v + o.costs, 0);
    const variation = gross - costs - (originalGross - originalCosts);
    s.treasury.assets += variation; s.treasury.liquid += variation;
  }
  if (s.rounds.length > 1 || scenario === 'loss') {
    const adjustment = s.rounds.length > 1 ? gross : gross - s.operations.slice(0,4).reduce((v,o)=>v+o.result,0);
    const prepared = operation(`EX-DAY-${day + 1}`, 'orchestrator', tr(`Dia UTC ${day} · resultado de cenário`, `UTC day ${day} · scenario result`, `Día UTC ${day} · resultado de escenario`), 0,
      tr('Fato preparado próprio desta rodada; não reutiliza lucro anterior nem preços de mercado reais.', 'Prepared fact belonging to this round; does not reuse prior profit or actual market prices.', 'Hecho preparado propio de esta ronda; no reutiliza ganancias anteriores ni precios reales.'), []);
    prepared.result = adjustment; prepared.costs = s.rounds.length > 1 ? costs : 0;
    s.operations.push(prepared);
    opState(s, prepared, 'confirmed', tr('Resultado conciliado desta rodada; ajuste vinculado ao período, sem duplicação.', 'Reconciled result for this round; period-linked adjustment without duplication.', 'Resultado conciliado de esta ronda; ajuste vinculado al período, sin duplicación.'));
  }
  s.treasury.assets -= entityTax; s.treasury.liquid -= entityTax;
  s.treasury.obligations += r.staking;
  s.treasury.assets -= r.buyback; s.treasury.liquid -= r.buyback; s.buyback.wallet += r.buyback;
  s.clock = cutoff; s.running = false;
  s.roundWeights = { [day]: weight };
  s.accumulatedWeight = 0; if (s.eligibleSince !== null) s.eligibleSince = s.clock;
  log(s, 'treasury', 'confirmed', distribute
    ? tr('Resultado conciliado → tributos da entidade → reservas e liquidez → split 50/25/25. Retenção antes do crédito líquido.', 'Reconciled result → entity taxes → reserves and liquidity → 50/25/25 split. Withholding before net credit.', 'Resultado conciliado → tributos de entidad → reservas y liquidez → reparto 50/25/25. Retención antes del crédito neto.')
    : tr('Rodada não paga: perda ou condições não atendidas. Lucro positivo integral na tesouraria, sem split nem acúmulo.', 'Round does not pay: loss or conditions unmet. All positive profit stays in treasury, no split or carry.', 'La ronda no paga: pérdida o condiciones incumplidas. Todo beneficio positivo en tesorería, sin reparto ni acumulación.'), r.id);
  return s;
}
function receiveRound(s: DemoState, r: Round) {
  if (r.receipt || r.grossPersonal <= 0) return;
  r.receipt = `EX-RECEIPT-${r.id}`; r.status = 'paid';
  s.usdc = roundMoney(s.usdc + r.netPersonal); s.receivedYield = roundMoney(s.receivedYield + r.netPersonal);
  s.treasury.obligations = roundMoney(Math.max(3000, s.treasury.obligations - r.grossPersonal));
  r.remainingObligation = roundMoney(Math.max(0, r.remainingObligation - r.grossPersonal));
  s.treasury.liquid = roundMoney(s.treasury.liquid - r.grossPersonal); s.treasury.assets = roundMoney(s.treasury.assets - r.grossPersonal);
  s.movements.unshift({ id: r.receipt, kind: 'distribution', asset: 'USDC', amount: r.netPersonal, fee: 0, externalCost: 0, status: 'confirmed', time: s.clock, destination: 'SAMPLE-WALLET-PERSONAL', outcome: 'success', revision: s.participationRevision });
  log(s, 'treasury', 'confirmed', tr('USDC líquido confirmado na carteira pessoal. Retenção de cenário segregada; sem duplicar imposto.', 'Net USDC confirmed in personal wallet. Scenario withholding segregated; tax not duplicated.', 'USDC neto confirmado en cartera personal. Retención del escenario segregada; sin duplicar impuesto.'), r.id, 'USDC');
}

/** Pure, in-memory transitions. Repeating a terminal action has no financial effect. */
export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === 'RESET') return createInitialState();
  // JSON clone is intentionally limited to the simple, serializable fixtures.
  const s: DemoState = JSON.parse(JSON.stringify(state)); s.error = null;
  switch (action.type) {
    case 'TICK': tick(s); break;
    case 'RUN': s.running = action.value && s.step < MAX_SCENARIO_STEP; break;
    case 'CLEAR_ERROR': break;
    case 'RECONCILE_RESERVE': {
      if (s.treasury.reserve >= s.treasury.requiredReserve || s.treasury.reserveTransit <= 0) break;
      s.treasury.reserve += s.treasury.reserveTransit; s.treasury.transit -= s.treasury.reserveTransit; s.treasury.reserveTransit = 0;
      log(s, 'treasury', 'confirmed', tr('Transferência de reserva conciliada e recomposição confirmada. Rodada encerrada não reabre; só o próximo resultado é avaliado com a nova disponibilidade.', 'Reserve transfer reconciled and replenishment confirmed. Closed round does not reopen; only the next result uses the new availability.', 'Transferencia de reserva conciliada y reposición confirmada. La ronda cerrada no se reabre; solo el próximo resultado usa la nueva disponibilidad.'));
      break;
    }
    case 'RECONCILE_LIQUIDITY': {
      if (s.step < MAX_SCENARIO_STEP || s.treasury.liquidityTransit <= 0) break;
      s.treasury.liquid += s.treasury.liquidityTransit; s.treasury.transit -= s.treasury.liquidityTransit; s.treasury.liquidityTransit = 0;
      log(s, 'treasury', 'confirmed', tr('Recursos recebidos e conciliados uma vez. Liquidez recomposta; lucro da rodada bloqueada continua na tesouraria, sem liberação posterior.', 'Funds received and reconciled once. Liquidity replenished; blocked-round profit stays in treasury, no later release.', 'Fondos recibidos y conciliados una vez. Liquidez repuesta; la ganancia de la ronda bloqueada permanece en tesorería, sin liberación posterior.'));
      break;
    }
    case 'REVIEW_MOVEMENT': {
      if (s.session !== 'ready') return fail(s, tr('Retome a sessão de exemplo antes de revisar um movimento.', 'Resume the example session before reviewing a movement.', 'Retoma la sesión de ejemplo antes de revisar un movimiento.'));
      if (!Number.isFinite(action.amount) || action.amount <= 0) return fail(s, tr('Informe uma quantidade positiva.', 'Enter a positive amount.', 'Introduce una cantidad positiva.'));
      if (action.kind === 'distribution') return s;
      if (['send', 'withdraw'].includes(action.kind) && !/^SAMPLE-WALLET-[A-Z0-9-]+$/.test(action.destination)) return fail(s, tr('Use somente um destino ilustrativo SAMPLE-WALLET-DESTINO.', 'Use only an illustrative destination SAMPLE-WALLET-DESTINO.', 'Usa solo un destino ilustrativo SAMPLE-WALLET-DESTINO.'));
      if (action.kind === 'swap' && s.clock - action.quoteAt > 2) return fail(s, tr('Cotação de exemplo vencida. Atualize a cotação antes de revisar.', 'Example quote expired. Refresh quote before reviewing.', 'Cotización de ejemplo vencida. Actualiza antes de revisar.'));
      const fee = ['swap', 'send', 'withdraw'].includes(action.kind) ? demoServiceFee : 0;
      const externalCost = ['onramp', 'send', 'withdraw'].includes(action.kind) ? 0.5 : 0;
      const need = action.kind === 'swap' ? action.amount + fee : action.kind === 'send' ? fee + externalCost : action.kind === 'withdraw' ? action.amount : 0;
      if (need > s.usdc - reservedUSDC(s) || (action.kind === 'send' && action.amount > s.bettex - reservedBETTEX(s))) return fail(s, tr('Saldo disponível insuficiente, considerando valores comprometidos.', 'Insufficient available balance, including committed amounts.', 'Saldo disponible insuficiente, considerando importes comprometidos.'));
      const pendingYield = s.movements.filter(m => m.kind === 'withdraw' && ['open','uncertain'].includes(m.status)).reduce((v,m) => v + m.amount, 0);
      if (action.kind === 'withdraw' && (action.amount > s.receivedYield - pendingYield || action.amount <= fee + externalCost)) return fail(s, tr('Retire somente rendimentos recebidos; o valor precisa superar tarifa e encargos.', 'Withdraw received yield only; amount must exceed fee and costs.', 'Retira solo rendimientos recibidos; el importe debe superar tarifa y costes.'));
      if (['onramp', 'receive'].includes(action.kind) && action.amount <= externalCost) return fail(s, tr('Valor líquido deve ser positivo.', 'Net amount must be positive.', 'El importe neto debe ser positivo.'));
      s.movements.unshift({ id: `EX-MOVE-${s.movements.length + 1}-${s.clock}`, kind: action.kind, amount: action.amount, fee, externalCost, status: 'proposed', asset: action.kind === 'send' ? 'BETTEX' : 'USDC', time: s.clock, ...(action.kind === 'swap' ? { quoteAt: action.quoteAt } : {}), destination: action.destination || 'SAMPLE-WALLET-PERSONAL', outcome: action.outcome, revision: s.participationRevision });
      break;
    }
    case 'AUTHORIZE_MOVEMENT': {
      const m = s.movements.find(m => m.id === action.id);
      if (!m || m.status !== 'proposed') break;
      if (s.session !== 'ready') return fail(s, tr('Sessão encerrada ou expirada. Retome o acesso ilustrativo.', 'Session ended or expired. Resume illustrative access.', 'Sesión cerrada o vencida. Retoma el acceso ilustrativo.'));
      if (m.kind === 'swap' && s.clock - (m.quoteAt ?? m.time) > 2) { m.status = 'rejected'; return fail(s, tr('Cotação vencida; revise uma nova cotação.', 'Quote expired; review a new quote.', 'Cotización vencida; revisa una nueva cotización.')); }
      const need = m.kind === 'swap' ? m.amount + m.fee : m.kind === 'send' ? m.fee + m.externalCost : m.kind === 'withdraw' ? m.amount : 0;
      if (need > s.usdc - reservedUSDC(s) || (m.kind === 'send' && m.amount > s.bettex - reservedBETTEX(s)) || (m.kind === 'withdraw' && m.amount > s.receivedYield - s.movements.filter(x => x.kind === 'withdraw' && ['open','uncertain'].includes(x.status)).reduce((v,x) => v + x.amount, 0))) {
        m.status = 'rejected'; return fail(s, tr('Saldo mudou desde a revisão. Solicitação bloqueada, sem débito.', 'Balance changed since review. Request blocked without debit.', 'El saldo cambió desde la revisión. Solicitud bloqueada sin débito.'));
      }
      m.status = m.outcome === 'uncertain' ? 'uncertain' : 'open';
      log(s, 'treasury', m.status, tr('Autorização visual vinculada ao conteúdo exato; valores reservados, sem efeito de saldo antes da confirmação.', 'Visual authorization bound to exact content; amounts reserved, no balance effect before confirmation.', 'Autorización visual vinculada al contenido exacto; importes reservados, sin efecto en saldo antes de confirmar.'), m.id, m.asset);
      break;
    }
    case 'RESOLVE_MOVEMENT': { const m = s.movements.find(m => m.id === action.id); if (m) resolveMovement(s, m, action.received); break; }
    case 'CANCEL_MOVEMENT': { const m = s.movements.find(m => m.id === action.id); if (m?.status === 'proposed') { m.status = 'cancelled'; log(s,'treasury','cancelled',tr('Solicitação cancelada antes do envio.', 'Request cancelled before submission.', 'Solicitud cancelada antes del envío.'),m.id,m.asset); } break; }
    case 'ASSESS_ROUND': return assess(s, action.scenario);
    case 'AUTHORIZE_ROUND': {
      const r = s.rounds.find(r => r.id === action.id);
      if (r?.status === 'assessed' && r.grossPersonal > 0 && r.staking > 0 && !r.closed) {
        r.status = 'authorized';
        log(s,'treasury','authorized',tr('Executor único e parcelas reservados sob mandato. Direito autorizado ainda não é USDC recebido.', 'Single executor and portions reserved under mandate. Authorized entitlement is not received USDC.', 'Ejecutor único y partes reservados bajo mandato. Derecho autorizado no es USDC recibido.'),r.id);
      }
      break;
    }
    case 'PAY_ROUND': {
      const r = s.rounds.find(r => r.id === action.id);
      if (r?.status !== 'authorized' || r.closed) break;
      if (r.scenario === 'uncertain') { r.status = 'uncertain'; log(s,'treasury','uncertain',tr('Envio iniciado, resposta perdida. Obrigação e recursos preservados; sem reenvio.', 'Submission started, response lost. Obligation and resources preserved; no resubmission.', 'Envío iniciado, respuesta perdida. Obligación y recursos preservados; sin reenvío.'),r.id); }
      else receiveRound(s,r);
      break;
    }
    case 'RECONCILE_ROUND': {
      const r = s.rounds.find(r => r.id === action.id);
      if (!r || r.receipt || r.scenario !== 'uncertain' || !['uncertain','cancelled','closed'].includes(r.status)) break;
      if (r.closed || r.status === 'cancelled') {
        r.receipt = 'EX-AUDIT-NO-NEW-CREDIT';
        s.treasury.obligations = roundMoney(Math.max(3000,s.treasury.obligations - r.grossPersonal));
        r.remainingObligation = roundMoney(Math.max(0,r.remainingObligation - r.grossPersonal));
        log(s,'treasury','confirmed',tr('Conciliação do fato original: não envio comprovado. Nenhum novo crédito, reenvio ou reabertura.', 'Original fact reconciled: non-submission proven. No new credit, resubmission or reopening.', 'Hecho original conciliado: no envío probado. Sin nuevo crédito, reenvío ni reapertura.'),r.id);
      } else receiveRound(s,r);
      break;
    }
    case 'CLOSE_ROUND': {
      const r = s.rounds.find(r => r.id === action.id); if (!r || r.closed) break;
      const preservedUncertain = !r.receipt && r.scenario === 'uncertain' && ['uncertain','cancelled'].includes(r.status) ? r.grossPersonal : 0;
      const release = Math.max(0, r.remainingObligation - preservedUncertain);
      s.treasury.obligations = roundMoney(Math.max(3000, s.treasury.obligations - release));
      r.remainingObligation = preservedUncertain;
      r.closed = true; r.status = 'closed';
      log(s,'treasury','closed',tr('Rodada encerrada definitivamente. Sem acúmulo, complemento, restauração de direitos ou reabertura.', 'Round permanently closed. No carry, supplement, restoration of entitlement or reopening.', 'Ronda cerrada definitivamente. Sin acumulación, complemento, restauración de derechos ni reapertura.'),r.id);
      break;
    }
    case 'BUYBACK_NEXT': {
      const b = s.buyback;
      if (b.stage === 'accumulating') { b.stage = 'analysis'; log(s,'buyback','analyzing',tr('Proposta: compra de 800 USDC, custos 20; carteira exclusiva, sem usar taxas ou captação pública.', 'Proposal: 800 USDC purchase, costs 20; exclusive wallet, no fees or public proceeds.', 'Propuesta: compra de 800 USDC, costes 20; cartera exclusiva, sin tasas ni captación pública.')); }
      else if (b.stage === 'analysis') {
        if (b.wallet < 820) return fail(s,tr('Carteira exclusiva insuficiente para compra e custos.', 'Exclusive wallet insufficient for purchase and costs.', 'Cartera exclusiva insuficiente para compra y costes.'));
        b.stage = 'authorized'; b.committed = 820; log(s,'buyback','authorized',tr('Evento preparado: administração e custódia 2/3 autorizam conteúdo exato. Participante apenas acompanha.', 'Prepared event: administration and 2/3 custody authorize exact content. Participant only observes.', 'Evento preparado: administración y custodia 2/3 autorizan contenido exacto. Participante solo observa.'));
      } else if (b.stage === 'authorized') { b.stage = 'purchased'; b.wallet -= 820; b.committed = 0; b.acquired = 40000; log(s,'buyback','confirmed',tr('Compra conciliada de 40.000 BETTEX a preço de cenário. Tokens aguardam queima.', 'Reconciled purchase of 40,000 BETTEX at scenario price. Tokens awaiting burn.', 'Compra conciliada de 40.000 BETTEX a precio del escenario. Tokens pendientes de quema.')); }
      else if (b.stage === 'purchased') { b.stage = 'burned'; b.burned += b.acquired; b.acquired = 0; log(s,'buyback','confirmed',tr('Todo BETTEX adquirido foi queimado permanentemente; não é armazenamento nem queima por tarifa.', 'All acquired BETTEX permanently burned; not storage or fee burning.', 'Todo BETTEX adquirido se quemó permanentemente; no es almacenamiento ni quema por tarifa.'), 'EX-BURN-1','BETTEX'); }
      break;
    }
    case 'POLICY_NEXT': {
      const p = s.policy;
      if (p.stage === 'suggested') { p.stage = 'approved'; p.signatures = 2; log(s,'governance','authorized',tr('Evento preparado: liderança aprova sugestão da IA; multisig 2/3. IA e holder não aprovam a política.', 'Prepared event: leadership approves AI suggestion; multisig 2/3. AI and holder do not approve policy.', 'Evento preparado: liderazgo aprueba sugerencia de IA; multisig 2/3. IA y titular no aprueban la política.')); }
      else if (p.stage === 'approved') { p.stage = 'waiting'; p.scheduledAt = s.clock; log(s,'governance','open',tr('Mudança sensível agendada. Espera mínima de 24h; v1 continua vigente.', 'Sensitive change scheduled. Minimum 24h wait; v1 remains effective.', 'Cambio sensible programado. Espera mínima 24h; v1 sigue vigente.')); }
      else if (p.stage === 'waiting') {
        if (s.clock - (p.scheduledAt ?? s.clock) < 24) return fail(s,tr('Espera mínima de 24 horas ainda não cumprida. A regra anterior permanece vigente.', 'Minimum 24-hour wait not met. Previous rule remains effective.', 'Espera mínima de 24 horas aún no cumplida. La regla anterior sigue vigente.'));
        p.stage = 'active'; p.version = 2;
        log(s,'governance','confirmed',tr('v2 executada e conferida após testes. Registro e mandato preservados; sem ampliação de poderes.', 'v2 executed and checked after tests. Record and mandate preserved; no expansion of powers.', 'v2 ejecutada y verificada tras pruebas. Registro y mandato preservados; sin ampliar poderes.'));
      }
      break;
    }
    case 'INCIDENT_NEXT': {
      const p=s.policy;
      if(p.incident==='none'){p.incident='detected';p.paused=true;log(s,'governance','uncertain',tr('Incidente de conector: pausa restrita de novas execuções por responsável habilitado.', 'Connector incident: restricted pause of new executions by authorized supervisor.', 'Incidente del conector: pausa restringida de nuevas ejecuciones por responsable autorizado.'));}
      else if(p.incident==='detected'){p.incident='contained';log(s,'governance','cancelled',tr('Permissão afetada revogada com 2/3; testes de recuperação e plano de reversão registrados.', 'Affected permission revoked with 2/3; recovery tests and rollback plan recorded.', 'Permiso afectado revocado con 2/3; pruebas de recuperación y plan de reversión registrados.'));}
      else if(p.incident==='contained'){p.incident='resolved';p.paused=false;log(s,'governance','confirmed',tr('Retomada aprovada com 2/3, evidências e controles conferidos. Obrigações preservadas.', 'Resumption approved with 2/3, evidence and controls verified. Obligations preserved.', 'Reanudación aprobada con 2/3, evidencias y controles verificados. Obligaciones preservadas.'));}
      break;
    }
    case 'MESSAGE': {
      if (!action.text.trim()) break;
      const text=action.text.trim().slice(0,500);
      s.messages.push({id:`MSG-LOCAL-${s.messages.length}`,author:'participant',text:[text,text,text],reference:action.reference,time:s.clock,reactions:0,reacted:false});break;
    }
    case 'REACTION': { const m=s.messages.find(m=>m.id===action.id);if(m){m.reacted=!m.reacted;m.reactions+=m.reacted?1:-1;}break; }
    case 'VOTE': if(!s.poll.closed && s.poll.selected===null && Number.isInteger(action.option) && action.option>=0 && action.option<3){s.poll.selected=action.option;s.poll.votes[action.option]++;}break;
    case 'CLOSE_POLL': s.poll.closed=true;break;
    case 'SESSION': s.session=action.state;break;
    case 'PROFILE': s.profile=action.state;if(action.state==='ready')s.session='ready';break;
  }
  return s;
}