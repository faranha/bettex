import type { Asset, Request, Decision, Order, Position, Reasoning, T3 } from './central-data';

const factors: Record<Asset, number> = { btc: 100_000, eth: 6_000, sol: 300 };
const label = (asset: Asset): T3 => [
  `${asset.toUpperCase()}/USDC · mercado à vista (exemplo)`,
  `${asset.toUpperCase()}/USDC · spot market (example)`,
  `${asset.toUpperCase()}/USDC · mercado al contado (ejemplo)`,
];
const observation: T3 = [
  'Volume atípico e concentração de fluxo sugerem uma hipótese de manipulação, não uma prova. BETTEX pede análise de profundidade, risco e liquidez antes de decidir.',
  'Unusual volume and concentrated flows suggest a manipulation hypothesis, not proof. BETTEX requests depth, risk and liquidity analysis before deciding.',
  'El volumen atípico y la concentración de flujos sugieren una hipótesis de manipulación, no una prueba. BETTEX solicita análisis de profundidad, riesgo y liquidez antes de decidir.',
];
const uncertainty: T3 = [
  'Cenário escrito à mão. Não demonstra inferência real nem antecipa movimentos; evidências insuficientes podem levar a esperar ou não operar.',
  'Hand-written scenario. It does not demonstrate real inference or predict moves; insufficient evidence can lead to waiting or not trading.',
  'Escenario escrito a mano. No demuestra inferencia real ni anticipa movimientos; las evidencias insuficientes pueden llevar a esperar o no operar.',
];
const support: T3 = [
  'Consultar Risco sobre exposição e profundidade; consultar Tesouraria sobre liquidez. Comparar respostas e investigar divergências, sem fixar um único indicador ou modelo.',
  'Ask Risk about exposure and depth; ask Treasury about liquidity. Compare replies and investigate disagreements, without prescribing one indicator or model.',
  'Consultar a Riesgo sobre exposición y profundidad y a Tesorería sobre liquidez. Comparar respuestas e investigar discrepancias, sin fijar un único indicador o modelo.',
];

/**
 * Migrate illustrative records, not a trading engine. Keep IDs and USDC amounts
 * for the existing two-way graph/history links. Inverse quantity/price scaling
 * expresses assets rather than binary-event shares without changing cash flows.
 */
export function applyCryptoDemoScope(data: {
  requests: Request[]; decisions: Decision[]; orders: Order[]; positions: Position[];
  reasoning: Record<string, Reasoning>;
}) {
  for (const [owner, reasoning] of Object.entries(data.reasoning)) {
    reasoning.summary = owner === 'sol'
      ? ['Liquidez insuficiente no exemplo de SOL: a análise prefere não operar e investigar mais.', 'Insufficient liquidity in the SOL example: analysis prefers not to trade and to investigate further.', 'Liquidez insuficiente en el ejemplo de SOL: el análisis prefiere no operar e investigar más.']
      : [...observation];
    reasoning.obs = [[...observation]];
    reasoning.unc = [[...uncertainty]];
    reasoning.next = [[...support]];
  }
  for (const request of data.requests) {
    request.market = label(request.asset);
    request.outcome = [`Compra de ${request.asset.toUpperCase()}`, `Buy ${request.asset.toUpperCase()}`, `Compra de ${request.asset.toUpperCase()}`];
    request.operation = ['Compra à vista no cenário visual; nenhuma ordem real.', 'Spot purchase in the visual scenario; no real order.', 'Compra al contado en el escenario visual; ninguna orden real.'];
    const oldPrice = Number(request.price.replace(',', '.'));
    if (Number.isFinite(oldPrice)) request.price = (oldPrice * factors[request.asset]).toFixed(2);
    request.uncertainty = [...uncertainty];
    request.reason = request.state === 'rejected'
      ? ['Risco identifica liquidez insuficiente: rejeitar a entrada, mesmo diante de possível oportunidade.', 'Risk identifies insufficient liquidity: reject entry despite a possible opportunity.', 'Riesgo identifica liquidez insuficiente: rechazar la entrada pese a una posible oportunidad.']
      : request.state === 'expired'
      ? ['Informações defasadas: investigar novamente antes de considerar uma entrada.', 'Stale information: investigate again before considering entry.', 'Información desactualizada: investigar de nuevo antes de considerar una entrada.']
      : ['forwarded_to_execution', 'allocation_confirmed'].includes(request.state)
      ? ['BETTEX compara a hipótese com Risco e Tesouraria. A profundidade e a liquidez do cenário permitem a entrada ilustrativa, com exposição limitada e reavaliação se as evidências mudarem.', 'BETTEX compares the hypothesis with Risk and Treasury. Scenario depth and liquidity allow the illustrative entry, with limited exposure and reassessment if evidence changes.', 'BETTEX contrasta la hipótesis con Riesgo y Tesorería. La profundidad y liquidez del escenario permiten la entrada ilustrativa, con exposición limitada y reevaluación si cambian las evidencias.']
      : [...observation];
    request.sources = [{
      name: 'DEMO', kind: 'demo', ref: `sample-crypto-flow-${request.asset}`, at: request.sources[0]?.at ?? request.validUntil,
      evidence: ['Fluxo, volume e profundidade ilustrativos; não são dados ao vivo.', 'Illustrative flow, volume and depth; not live data.', 'Flujo, volumen y profundidad ilustrativos; no son datos en vivo.'],
    }];
    for (const event of request.events) event.reason = [...request.reason];
  }
  for (const decision of data.decisions) {
    const request = data.requests.find(item => item.id === decision.requestId);
    if (request) decision.reason = [...request.reason];
  }
  const quantity = (value: string, asset: Asset) => (BigInt(value) / BigInt(factors[asset])).toString();
  for (const order of data.orders) {
    order.outcome = [`Compra de ${order.asset.toUpperCase()}`, `Buy ${order.asset.toUpperCase()}`, `Compra de ${order.asset.toUpperCase()}`];
    order.qty = quantity(order.qty, order.asset);
    order.filled = quantity(order.filled, order.asset);
    for (const fill of order.fills) {
      fill.shares = quantity(fill.shares, order.asset);
      const oldPrice = Number(fill.price.replace(',', '.'));
      if (Number.isFinite(oldPrice)) fill.price = (oldPrice * factors[order.asset]).toFixed(2);
    }
  }
  for (const position of data.positions) {
    position.event = label(position.asset);
    position.outcome = [position.asset.toUpperCase(), position.asset.toUpperCase(), position.asset.toUpperCase()];
    position.qty = quantity(position.qty, position.asset);
  }
}
