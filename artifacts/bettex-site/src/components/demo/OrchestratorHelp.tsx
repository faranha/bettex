/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { useMoney } from './fin';

export function useOperationStatusLabels(): Record<string, string> {
  const { x } = useX();
  return {
    queued: x('Na fila', 'Queued', 'En cola'),
    analyzing: x('Em análise', 'Analyzing', 'En análisis'),
    awaiting_data: x('Aguardando dados', 'Awaiting data', 'Esperando datos'),
    comparing: x('Em comparação', 'Comparing', 'En comparación'),
    awaiting_budget: x('Aguardando orçamento', 'Awaiting budget', 'Esperando presupuesto'),
    approved: x('Aprovada', 'Approved', 'Aprobada'),
    validated: x('Aprovada', 'Approved', 'Aprobada'),
    executing: x('Em execução', 'Executing', 'En ejecución'),
    open: x('Em acompanhamento', 'Monitoring', 'En seguimiento'),
    result: x('Resultado apurado', 'Result recorded', 'Resultado registrado'),
    reconciling: x('Conciliando', 'Reconciling', 'Conciliando'),
    closed: x('Encerrada', 'Closed', 'Cerrada'),
    rejected: x('Rejeitada', 'Rejected', 'Rechazada'),
    expired: x('Expirada', 'Expired', 'Expirada'),
    cancelled: x('Cancelada', 'Cancelled', 'Cancelada'),
    failed: x('Falhou', 'Failed', 'Falló'),
  };
}

const RESERVING = ['approved', 'validated', 'executing', 'open', 'result', 'reconciling'];

export function OrchestratorHelp({ d }: { d: DemoDashboard }) {
  const { x } = useX();
  const { num } = useMoney();
  const L = useOperationStatusLabels();
  const b = d.orchestratorBudget;
  const working = b?.workingUsdc ?? Math.max(0, d.treasury.assetsUsdc - d.treasury.reserveUsdc);
  const reserved = b?.reservedUsdc ?? d.operations.filter(o => RESERVING.includes(o.status)).reduce((s, o) => s + o.capitalUsdc, 0);
  const available = b?.availableUsdc ?? Math.max(0, working - reserved);
  const u = (v: number) => `${num(v, 2)} USDC`;
  const na = x('indisponível', 'unavailable', 'no disponible');
  const steps: [string, string][] = [
    ['queued', x('Sugestão recebida, aguardando vez. Ainda não foi analisada.', 'Suggestion received and waiting its turn. Not analyzed yet.', 'Sugerencia recibida y esperando turno. Aún no analizada.')],
    ['analyzing', x('BTEX confere se a proposta está completa e válida.', 'BTEX checks that the proposal is complete and valid.', 'BTEX verifica que la propuesta esté completa y válida.')],
    ['awaiting_data', x('Faltam dados para avaliar.', 'Data is missing for evaluation.', 'Faltan datos para evaluar.')],
    ['comparing', x('Elegível, mas outra sugestão tem pontuação melhor neste momento.', 'Eligible, but another suggestion currently scores better.', 'Elegible, pero otra sugerencia tiene mejor puntuación ahora.')],
    ['awaiting_budget', x('Elegível, mas o capital disponível ou um limite não comporta a operação agora.', 'Eligible, but available capital or a limit cannot fit the operation now.', 'Elegible, pero el capital disponible o un límite no admite la operación ahora.')],
    ['approved', x('Escolhida pela regra. O capital fica reservado. Não é uma ordem real.', 'Chosen by the rule. Capital is reserved. Not a real order.', 'Elegida por la regla. El capital queda reservado. No es una orden real.')],
    ['validated', x('Estado legado equivalente a Aprovada.', 'Legacy status equivalent to Approved.', 'Estado heredado equivalente a Aprobada.')],
    ['executing', x('Execução em andamento.', 'Execution in progress.', 'Ejecución en curso.')],
    ['open', x('Em acompanhamento: a posição aguarda desfecho.', 'Monitoring: the position awaits an outcome.', 'En seguimiento: la posición espera un desenlace.')],
    ['result', x('O desfecho fictício foi registrado. Ainda não conciliado.', 'The fictional outcome was recorded. Not yet reconciled.', 'El desenlace ficticio fue registrado. Aún no conciliado.')],
    ['reconciling', x('Resultado sendo conferido contra o capital reservado.', 'Result is being checked against the reserved capital.', 'El resultado se contrasta con el capital reservado.')],
    ['closed', x('Conciliada; o capital reservado é liberado e o resultado entra no ciclo.', 'Reconciled; reserved capital is released and the result enters the cycle.', 'Conciliada; el capital reservado se libera y el resultado entra en el ciclo.')],
    ['rejected', x('Não passou na elegibilidade da regra.', 'Did not pass the rule eligibility.', 'No pasó la elegibilidad de la regla.')],
    ['expired', x('A cotação de exemplo venceu antes da aprovação.', 'The example quote expired before approval.', 'La cotización de ejemplo venció antes de la aprobación.')],
    ['cancelled', x('Cancelada antes do preenchimento.', 'Cancelled before fill.', 'Cancelada antes del llenado.')],
    ['failed', x('Falha antes do preenchimento.', 'Failed before fill.', 'Falló antes del llenado.')],
  ];
  const metric = (label: string, v: string, id: string) => <div className="rounded-xl bg-[#F5F1E8] p-2.5"><dt className="text-xs text-[#5B6B85]">{label}</dt><dd className="mono text-sm font-bold" data-testid={id}>{v}</dd></div>;
  return <details className="dcard group p-4" data-testid="help-orchestrator">
    <summary className="display cursor-pointer text-base font-extrabold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]">{x('Como a BTEX decide', 'How BTEX decides', 'Cómo decide BTEX')}</summary>
    <div className="mt-3 grid gap-4 text-sm">
      <div>
        <h3 className="mb-1 font-bold">{x('Orçamento da tesouraria', 'Treasury budget', 'Presupuesto de tesorería')}</h3>
        <dl className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
          {metric(x('Operacional (ativos − reserva)', 'Working (assets − reserve)', 'Operativo (activos − reserva)'), u(working), 'text-budget-working')}
          {metric(x('Reservado', 'Reserved', 'Reservado'), u(reserved), 'text-budget-reserved')}
          {metric(x('Disponível', 'Available', 'Disponible'), u(available), 'text-budget-available')}
        </dl>
        <p className="mt-2 text-xs text-[#5B6B85]" data-testid="text-budget-limits">
          {b ? <>{x('Limite por operação', 'Per-operation limit', 'Límite por operación')}: {num(b.perOperationPercent, 1)}% · {u(b.perOperationLimitUsdc)}. {x('Limite por agente', 'Per-agent limit', 'Límite por agente')}: {num(b.perAgentPercent, 1)}% · {u(b.perAgentLimitUsdc)}.</> : <>{x('Limites publicados', 'Published limits', 'Límites publicados')}: {na}.</>}
        </p>
        <p className="mt-1 text-xs text-[#5B6B85]">{x('Reservado soma o capital de operações aprovadas, em execução, em acompanhamento, com resultado ou em conciliação. A reserva da tesouraria é preservada e o capital segue reservado até a conciliação.', 'Reserved sums capital of approved, executing, monitored, resulted or reconciling operations. The treasury reserve is preserved and capital stays reserved until reconciliation.', 'Reservado suma el capital de operaciones aprobadas, en ejecución, en seguimiento, con resultado o en conciliación. La reserva de tesorería se preserva y el capital sigue reservado hasta la conciliación.')}</p>
      </div>
      <div>
        <h3 className="mb-1 font-bold">{x('Procedimento', 'Procedure', 'Procedimiento')}</h3>
        <ol className="grid list-decimal gap-1 pl-5 text-xs">
          <li>{x('Elegibilidade: proposta válida, completa e dentro do prazo; estimativa condicional líquida de taxas positiva; sem alavancagem; perda máxima não maior que o capital.', 'Eligibility: valid, complete, unexpired proposal; positive conditional estimate net of fees; no leverage; max loss not above capital.', 'Elegibilidad: propuesta válida, completa y vigente; estimación condicional neta de tarifas positiva; sin apalancamiento; pérdida máxima no mayor al capital.')}</li>
          <li>{x('Limites da demonstração: operação até 10% do capital operacional, exposição por agente até 40%, e capital disponível suficiente.', 'Demonstration limits: operation up to 10% of working capital, exposure per agent up to 40%, and sufficient available capital.', 'Límites de la demostración: operación hasta 10% del capital operativo, exposición por agente hasta 40% y capital disponible suficiente.')}</li>
          <li>{x('Pontuação = ganho líquido estimado ÷ perda máxima ÷ duração em horas, da maior para a menor.', 'Score = expected net ÷ max loss ÷ duration in hours, highest first.', 'Puntuación = ganancia neta estimada ÷ pérdida máxima ÷ duración en horas, de mayor a menor.')}</li>
          <li>{x('Empate: validade mais cedo, depois geração mais cedo, depois ID.', 'Tie: earliest validity, then earliest generation, then ID.', 'Empate: vigencia más temprana, luego generación más temprana, luego ID.')}</li>
          <li>{x('As demais elegíveis ficam em comparação; as bloqueadas por orçamento aguardam orçamento.', 'Other eligible suggestions stay comparing; budget-blocked ones await budget.', 'Las demás elegibles quedan en comparación; las bloqueadas por presupuesto esperan presupuesto.')}</li>
        </ol>
        <p className="mt-2 text-xs text-[#5B6B85]">{x('Ranquear estimativas condicionais não é garantia de resultado. Mudanças nas regras exigem aprovação da liderança da Fundação; não há aprovação humana para cada ordem permitida.', 'Ranking conditional estimates is not a guarantee. Rule changes need Foundation leadership approval; there is no human approval for each permitted order.', 'Ordenar estimaciones condicionales no es garantía. Los cambios de reglas requieren aprobación de la dirección de la Fundación; no hay aprobación humana para cada orden permitida.')}</p>
      </div>
      <div>
        <h3 className="mb-1 font-bold">{x('Estados, em ordem', 'Statuses, in order', 'Estados, en orden')}</h3>
        <ol className="grid gap-1.5">{steps.map(([k, t]) => <li key={k} className="grid gap-0.5 rounded-lg border border-[#EBE3D1] bg-[#FBF8F0] px-3 py-1.5 text-xs" data-testid={`help-status-${k}`}><span className="font-bold">{L[k]}</span><span className="text-[#5B6B85]">{t}</span></li>)}</ol>
      </div>
    </div>
  </details>;
}
