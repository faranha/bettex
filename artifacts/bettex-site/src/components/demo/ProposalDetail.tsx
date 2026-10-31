/** @jsxImportSource react */
import type { DemoOperation } from '@workspace/api-client-react';
import { useX } from './ui';
import { useMoney } from './fin';
import { formatBrazilDateTime } from './brazil-time';

export function ProposalDetail({ operation }: { operation: DemoOperation }) {
  const { x } = useX();
  const { num, fl } = useMoney();
  const p = operation.proposal;
  const a = operation.assessment;
  const u = (v: number) => `${num(v, 2)} USDC`;
  const dt = (s: string) => `${formatBrazilDateTime(s, fl)} · ${x('Horário do Brasil', 'Brazil time', 'Horario de Brasil')}`;
  const qty = (v: number) => v.toLocaleString(fl, { maximumFractionDigits: 8 });
  const row = (k: string, v: string, id: string) => <div className="min-w-0"><dt className="text-xs text-[#5B6B85]">{k}</dt><dd className="mono break-words text-xs font-bold" data-testid={id}>{v}</dd></div>;
  if (!p) return <div className="grid gap-2" data-testid="proposal-detail"><p className="rounded-xl bg-[#F5F1E8] p-3 text-xs text-[#5B6B85]" data-testid="text-proposal-unavailable">{x('Detalhes da proposta indisponíveis: esta operação legada não guardou uma proposta.', 'Proposal details unavailable: this legacy operation stored no proposal.', 'Detalles de la propuesta no disponibles: esta operación heredada no guardó una propuesta.')}</p></div>;
  const type = ({
    spot_buy: x('Compra à vista', 'Spot buy', 'Compra spot'),
    sports_coverage: x('Cobertura esportiva', 'Sports coverage', 'Cobertura deportiva'),
    prediction_buy: x('Compra em previsão', 'Prediction buy', 'Compra en predicción'),
    bonus_qualifying: x('Qualificação de bônus', 'Bonus qualifying', 'Calificación de bono'),
  } as Record<string, string>)[p.type] ?? p.type;
  const act = (k: string) => ({
    buy_spot: x('Comprar à vista', 'Buy spot', 'Comprar spot'),
    buy_yes: x('Comprar Sim', 'Buy Yes', 'Comprar Sí'),
    qualify_bonus: x('Qualificar bônus', 'Qualify bonus', 'Calificar bono'),
  } as Record<string, string>)[k] ?? k;
  const ven = (k: string) => ({
    crypto_demo: x('Cripto', 'Crypto', 'Cripto'),
    polymarket_demo: 'Polymarket',
    bonus_demo: x('Bônus', 'Bonus', 'Bono'),
  } as Record<string, string>)[k] ?? k;
  const sel = (k: string) => k === 'home' ? (p.homeTeam ?? x('Mandante', 'Home', 'Local'))
    : k === 'away' ? (p.awayTeam ?? x('Visitante', 'Away', 'Visitante'))
    : k === 'draw' ? x('Empate', 'Draw', 'Empate')
    : k === 'yes' ? x('Sim', 'Yes', 'Sí')
    : k === 'asset' ? x('Ativo', 'Asset', 'Activo')
    : k === 'bonus' ? x('Bônus', 'Bonus', 'Bono') : k;
  const reason = a ? ({
    comparison: x('Comparada com outras sugestões elegíveis.', 'Compared with other eligible suggestions.', 'Comparada con otras sugerencias elegibles.'),
    selected_score: x('Escolhida pela maior pontuação.', 'Chosen for the highest score.', 'Elegida por la mayor puntuación.'),
    missing_data: x('Dados ausentes.', 'Missing data.', 'Datos ausentes.'),
    invalid_proposal: x('Proposta inválida ou incompleta.', 'Invalid or incomplete proposal.', 'Propuesta inválida o incompleta.'),
    non_positive_estimate: x('Estimativa líquida não positiva.', 'Non-positive net estimate.', 'Estimación neta no positiva.'),
    allocation_limit: x('Acima do limite por operação.', 'Above the per-operation limit.', 'Por encima del límite por operación.'),
    exposure_limit: x('Acima do limite de exposição por agente.', 'Above the per-agent exposure limit.', 'Por encima del límite de exposición por agente.'),
    awaiting_budget: x('Aguardando capital disponível.', 'Waiting for available capital.', 'Esperando capital disponible.'),
    expired_quote: x('Cotação de exemplo expirada.', 'Example quote expired.', 'Cotización de ejemplo expirada.'),
  } as Record<string, string>)[a.reason] ?? a.reason : '';
  const hasMatch = !!(p.homeTeam && p.awayTeam);
  return <div className="grid gap-3" data-testid="proposal-detail">
    <div>
      <h4 className="display text-sm font-extrabold" data-testid="text-proposal-type">{type}</h4>
      {hasMatch && <p className="text-xs" data-testid="text-proposal-match">{p.homeTeam} × {p.awayTeam}{p.eventAt ? ` · ${dt(p.eventAt)}` : ''}</p>}
    </div>
    <ul className="grid gap-2" aria-label={x('Movimentos da proposta', 'Proposal moves', 'Movimientos de la propuesta')}>
      {p.legs.map((l, i) => <li key={`${l.instrument}-${l.selection}-${i}`} className="rounded-xl border border-[#EBE3D1] bg-[#FBF8F0] p-2.5" data-testid={`proposal-leg-${i}`}>
        <p className="text-sm font-bold">{act(l.action)} · {sel(l.selection)}</p>
        <p className="mono break-words text-[11px] text-[#5B6B85]">{l.instrument} · {ven(l.venue)}</p>
        <dl className="mt-1 grid grid-cols-3 gap-2">
          {row(x('Valor', 'Amount', 'Monto'), u(l.amountUsdc), `text-leg-amount-${i}`)}
          {row(x('Quantidade', 'Quantity', 'Cantidad'), qty(l.quantity), `text-leg-qty-${i}`)}
          {row(x('Preço cotado', 'Quote price', 'Precio cotizado'), u(l.priceUsdc), `text-leg-price-${i}`)}
        </dl></li>)}
    </ul>
    {p.targetPriceUsdc !== undefined && <p className="text-xs">{x('Preço-alvo condicional (exemplo)', 'Conditional target price (example)', 'Precio objetivo condicional (ejemplo)')}: <span className="mono font-bold">{u(p.targetPriceUsdc)}</span></p>}
    <section>
      <h4 className="mb-1 text-xs font-bold">{x('Retorno estimado (condicional, não é resultado)', 'Estimated return (conditional, not an outcome)', 'Retorno estimado (condicional, no es resultado)')}</h4>
      <dl className="grid grid-cols-2 gap-2">
        {row(x('Ganho líquido estimado', 'Expected net', 'Ganancia neta estimada'), u(p.expectedNetUsdc), 'text-expected-net')}
        {row(x('Pior caso (perda máx.)', 'Worst case (max loss)', 'Peor caso (pérdida máx.)'), u(p.maxLossUsdc), 'text-max-loss')}
        {row(x('Taxas', 'Fees', 'Tarifas'), u(p.feesUsdc), 'text-fees')}
        {row(x('Duração', 'Duration', 'Duración'), `${num(p.durationHours, 1)} h`, 'text-duration')}
        {row(x('Gerada em', 'Generated at', 'Generada en'), dt(p.generatedAt), 'text-generated')}
        {row(x('Válida até', 'Valid until', 'Válida hasta'), dt(p.validUntil), 'text-valid-until')}
      </dl>
    </section>
    <section>
      <h4 className="mb-1 text-xs font-bold">{x('Resultado e conciliação (separados)', 'Outcome and reconciliation (separate)', 'Resultado y conciliación (separados)')}</h4>
      <p className="text-xs text-[#5B6B85]">{operation.status === 'closed'
        ? x('Conciliação concluída. O resultado líquido desconta as taxas.', 'Reconciliation completed. Net result deducts fees.', 'Conciliación completada. El resultado neto descuenta las tarifas.')
        : ['result', 'reconciling'].includes(operation.status)
          ? x('Resultado apurado, ainda sem conciliação concluída.', 'Result calculated; reconciliation is not complete yet.', 'Resultado calculado; la conciliación aún no ha concluido.')
          : x('Resultado ainda não apurado. A estimativa não é lucro confirmado.', 'Result not calculated yet. The estimate is not confirmed profit.', 'Resultado aún no calculado. La estimación no es ganancia confirmada.')}</p>
      {['result', 'reconciling', 'closed'].includes(operation.status) && <p className="mt-1 text-xs">{x('Resultado bruto', 'Gross result', 'Resultado bruto')}: {u(operation.pnlUsdc)}{operation.status === 'closed' && <> · {x('Líquido conciliado', 'Reconciled net', 'Neto conciliado')}: {u(operation.pnlUsdc - p.feesUsdc)}</>}</p>}
    </section>
    <section data-testid="proposal-assessment">
      <h4 className="mb-1 text-xs font-bold">{x('Avaliação da BTEX', 'BTEX assessment', 'Evaluación de BTEX')}</h4>
      {!a ? <p className="text-xs text-[#5B6B85]">{x('Avaliação indisponível.', 'Assessment unavailable.', 'Evaluación no disponible.')}</p> : <>
        <p className="text-xs font-semibold">{reason}</p>
        <dl className="mt-1 grid grid-cols-2 gap-2">
          {row(x('Pontuação (métrica ilustrativa)', 'Score (illustrative metric)', 'Puntuación (métrica ilustrativa)'), num(a.score, 4), 'text-score')}
          {row(x('Disponível no momento', 'Available at the time', 'Disponible en el momento'), u(a.availableUsdc), 'text-assess-available')}
          {row(x('Avaliada em', 'Evaluated at', 'Evaluada en'), dt(a.evaluatedAt), 'text-evaluated')}
          {row(x('Comparada com', 'Compared with', 'Comparada con'), a.comparedWith.length ? a.comparedWith.join(', ') : x('nenhuma', 'none', 'ninguna'), 'text-compared')}
        </dl></>}
    </section>
  </div>;
}
