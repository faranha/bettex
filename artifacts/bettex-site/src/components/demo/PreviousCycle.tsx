/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { Money } from './fin';
import { previousCycle } from './previous-cycle';
import { formatBrazilDateTime } from './brazil-time';

export function PreviousCycle({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const previous = previousCycle(d);
  return <section className="dcard flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5" data-testid="previous-cycle">
    <div><h3 className="display text-base font-extrabold">{x('Ciclo anterior', 'Previous cycle', 'Ciclo anterior')}</h3>
      {previous && <p className="mt-1 text-xs text-[#5B6B85]">{x('Encerrado em', 'Ended on', 'Cerrado el')} {formatBrazilDateTime(previous.round.endedAt, loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES', { dateStyle: 'medium' })}</p>}</div>
    {!previous ? <p className="text-sm text-[#5B6B85]">{x('Nenhum ciclo anterior registrado.', 'No previous cycle recorded.', 'Ningún ciclo anterior registrado.')}</p>
      : previous.received === null ? <p className="text-sm text-[#5B6B85]">{x('Sem crédito registrado para sua conta.', 'No credit recorded for your account.', 'Sin crédito registrado para tu cuenta.')}</p>
        : <div><p className="mb-1 text-xs font-semibold text-[#5B6B85]">{previous.received > 0 ? x('Você recebeu', 'You received', 'Recibiste') : x('Sem distribuição neste ciclo', 'No distribution this cycle', 'Sin distribución en este ciclo')}</p>
          <Money v={previous.received} a="USDC" big precision={previous.received > 0 && previous.received < .01 ? 6 : 2} /></div>}
  </section>;
}