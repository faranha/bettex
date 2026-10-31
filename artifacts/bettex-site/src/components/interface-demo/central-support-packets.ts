import { DECISIONS, ORDERS, REQUESTS, type T3 } from './central-data';
import type { GraphPacket } from './central-packets';

const t = (pt: string, en: string, es: string): T3 => [pt, en, es];
const after = (at: string, seconds: number) => new Date(Date.parse(at) + seconds * 1000).toISOString();

/** Authored conversations around existing proposals, not new approvals or financial events. */
export function supportPackets(): GraphPacket[] {
  const packets: GraphPacket[] = [];
  const add = (requestId: string, agent: string, title: T3, question: T3, opinion: T3, at: string, answeredAt: string, ref?: string) => {
    const queryId = `packet-${requestId}-${agent}-query`;
    const payload: GraphPacket['payload'] = [
      { label: t('Proposta', 'Proposal', 'Propuesta'), value: requestId },
      { label: t('Consulta da BETTEX', 'BETTEX consultation', 'Consulta de BETTEX'), value: question },
      { label: t('Responsável pela decisão', 'Decision owner', 'Responsable de la decisión'), value: 'BETTEX' },
    ];
    if (ref) payload.push({ label: t('Registro de referência', 'Reference record', 'Registro de referencia'), value: ref });
    packets.push({
      id: queryId, source: 'bettex', target: agent, edgeId: `bettex-${agent}`,
      kind: 'analysis', exchange: 'query', requestId, at, title, summary: question, payload,
    }, {
      id: `packet-${requestId}-${agent}-opinion`, source: agent, target: 'bettex', edgeId: `bettex-${agent}`,
      kind: 'decision', exchange: 'opinion', requestId, at: answeredAt,
      title: t('Parecer para a BETTEX', 'Opinion for BETTEX', 'Dictamen para BETTEX'), summary: opinion,
      payload: [...payload, { label: t('Parecer do subagente', 'Subagent opinion', 'Dictamen del subagente'), value: opinion }],
      replyToId: queryId,
    });
  };
  const request = REQUESTS.find(r => r.id === 'demo-req-eth-000')!;
  const decision = DECISIONS.find(d => d.requestId === request.id)!;
  const order = ORDERS.find(o => o.requestId === request.id)!;
  const start = request.events[0].at;
  add(request.id, 'governance',
    t('Consultar mandato e regras', 'Check mandate and rules', 'Consultar mandato y reglas'),
    t('A proposta ETH respeita o mandato vigente e o processo de autorização?', 'Does the ETH proposal comply with the current mandate and authorization process?', '¿La propuesta ETH respeta el mandato vigente y el proceso de autorización?'),
    t('O mandato permite avaliar a proposta. A BETTEX ainda deve decidir e obter as autorizações exigidas antes do encaminhamento.', 'The mandate allows the proposal to be reviewed. BETTEX must still decide and obtain required authorizations before forwarding it.', 'El mandato permite evaluar la propuesta. BETTEX aún debe decidir y obtener las autorizaciones exigidas antes de enviarla.'),
    after(start, 10), after(start, 20));
  add(request.id, 'risk',
    t('Consultar risco da proposta ETH', 'Review ETH proposal risk', 'Consultar riesgo de la propuesta ETH'),
    t('Avalie perda potencial, liquidez e limites antes de comparar esta proposta.', 'Assess potential loss, liquidity and limits before comparing this proposal.', 'Evalúa pérdida potencial, liquidez y límites antes de comparar esta propuesta.'),
    t('O cenário ETH segue para comparação com os limites do mandato. O parecer não elimina perdas possíveis nem substitui a decisão da BETTEX.', 'The ETH scenario proceeds to comparison against mandate limits. This opinion neither eliminates possible losses nor replaces the BETTEX decision.', 'El escenario ETH pasa a comparación con los límites del mandato. El dictamen no elimina posibles pérdidas ni sustituye la decisión de BETTEX.'),
    after(start, 25), after(start, 35));
  add(request.id, 'treasury',
    t('Consultar capital e reserva', 'Check capital and reservation', 'Consultar capital y reserva'),
    t('Confira o capital solicitado e as condições para reservar recursos sem dupla alocação.', 'Check requested capital and conditions for reserving funds without double allocation.', 'Comprueba el capital solicitado y las condiciones para reservar fondos sin doble asignación.'),
    t('Capital solicitado: 70 USDC. A reserva depende da seleção e autorização da BETTEX; a consulta não movimenta saldo.', 'Requested capital: 70 USDC. Reservation depends on BETTEX selection and authorization; this consultation moves no balance.', 'Capital solicitado: 70 USDC. La reserva depende de selección y autorización de BETTEX; la consulta no mueve saldo.'),
    after(start, 40), after(start, 50));
  add(request.id, 'execution',
    t('Consultar andamento da ordem', 'Check order progress', 'Consultar progreso de la orden'),
    t('Consulte o andamento da ordem associada à proposta selecionada.', 'Check the progress of the order associated with the selected proposal.', 'Consulta el progreso de la orden asociada a la propuesta seleccionada.'),
    order.reason, after(decision.at, 2), order.fills[0].at, order.id);
  add(request.id, 'reconciliation',
    t('Conferir execução e custos', 'Reconcile fill and costs', 'Conciliar ejecución y costos'),
    t('Compare o preenchimento da ordem com quantidade, custo e taxas registrados.', 'Compare the order fill with recorded quantity, cost and fees.', 'Compara la ejecución de la orden con cantidad, costo y comisiones registrados.'),
    t('Registro conciliado: 116 cotas, custo de 69,83 USDC e taxas de 0,80 USDC. A ordem está preenchida; isso não significa lucro realizado.', 'Reconciled record: 116 shares, cost of 69.83 USDC and fees of 0.80 USDC. The order is filled; this does not mean realized profit.', 'Registro conciliado: 116 cuotas, costo de 69,83 USDC y comisiones de 0,80 USDC. La orden está ejecutada; esto no significa beneficio realizado.'),
    after(order.fills[0].at, 1), order.updatedAt, order.fills[0].id);
  const sol = REQUESTS.find(r => r.id === 'demo-req-sol-001')!;
  add(sol.id, 'risk',
    t('Consultar liquidez de SOL', 'Check SOL liquidity', 'Consultar liquidez de SOL'),
    t('A liquidez suporta o tamanho proposto para SOL?', 'Can liquidity support the proposed SOL size?', '¿La liquidez soporta el tamaño propuesto para SOL?'),
    sol.reason, after(sol.events[0].at, 10), after(sol.events[0].at, 20));
  const btc = REQUESTS.find(r => r.id === 'demo-req-btc-001')!;
  add(btc.id, 'governance',
    t('Consultar requisitos para decidir', 'Check decision requirements', 'Consultar requisitos para decidir'),
    t('Quais condições a BETTEX precisa conferir antes de decidir sobre BTC?', 'Which conditions must BETTEX check before deciding on BTC?', '¿Qué condiciones debe comprobar BETTEX antes de decidir sobre BTC?'),
    t('Conferir validade da cotação, risco e capital. A proposta continua aguardando decisão; este parecer não é aprovação.', 'Check quote validity, risk and capital. The proposal remains awaiting a decision; this opinion is not approval.', 'Comprobar vigencia de cotización, riesgo y capital. La propuesta sigue esperando decisión; este dictamen no es aprobación.'),
    after(btc.events[0].at, 10), after(btc.events[0].at, 20));
  return packets;
}
