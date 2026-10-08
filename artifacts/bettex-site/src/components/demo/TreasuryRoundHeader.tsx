/** @jsxImportSource react */
import { Clock3 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DemoTreasuryRound } from '@workspace/api-client-react';
import { useX } from './ui';
import { formatBrazilDateTime } from './brazil-time';
import { RoundIdentity } from './RoundIdentity';
import { roundIntervalReading } from './staking-clock';
import { useRoundServerTime } from './use-round-server-time';
import { TreasuryTerm as Help } from './TreasuryHelp';

export function TreasuryRoundHeader({ round, serverNow, action, testIdPrefix = 'treasury', roundIdentityTestId = `${testIdPrefix}-current-round-id` }: { round: DemoTreasuryRound; serverNow: string; action?: ReactNode; testIdPrefix?: string; roundIdentityTestId?: string }) {
  const { x, loc } = useX();
  const now = useRoundServerTime(serverNow, `${round.id}:${round.endsAt}`);
  const { remainingMs, progress } = roundIntervalReading(round.startedAt, round.endsAt, now);
  const total = remainingMs === null ? null : Math.ceil(remainingMs / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const countdown = total === null ? '--:--:--'
    : `${pad(Math.floor(total / 3600))}:${pad(Math.floor(total % 3600 / 60))}:${pad(total % 60)}`;
  const closed = total === 0;
  const percent = progress === null ? null : Math.round(progress * 100);
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const date = (s: string) => Number.isFinite(Date.parse(s))
    ? formatBrazilDateTime(s, fl, { dateStyle: 'medium', timeStyle: 'short' })
    : x('Não registrado', 'Not recorded', 'No registrado');
  const countdownLabel = closed ? x('Rodada encerrada', 'Round ended', 'Ronda cerrada')
    : x('Tempo restante', 'Time remaining', 'Tiempo restante');
  return <header data-testid={`${testIdPrefix}-round-header`} className="mb-3 rounded-xl border border-[#E4DCCB] bg-[#FBF3DC] p-3 sm:p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="display text-lg font-extrabold"><Help tip={x('Período de apuração identificado pelo ID abaixo, o mesmo usado no Histórico. Os horários de abertura e encerramento são os registrados na rodada, no horário de São Paulo. Rodadas são independentes; o contador não garante distribuição.', 'Assessment period identified by the ID below, also used in History. Opening and closing times are those recorded for the round, in São Paulo time. Rounds are independent; the countdown does not guarantee distribution.', 'Período de cálculo identificado por el ID de abajo, el mismo usado en Historial. Los horarios de inicio y cierre son los registrados en la ronda, en horario de São Paulo. Las rondas son independientes; el contador no garantiza distribución.')}>{x('Rodada atual', 'Current round', 'Ronda actual')}</Help></h2>
          {action}
        </div>
        <div className="mt-1"><RoundIdentity id={round.id} testId={roundIdentityTestId} /></div>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5B6B85]"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" /><Help tip={x('Tempo até o encerramento registrado, sincronizado com o relógio do servidor. Ao chegar a zero, a rodada encerra; apuração e pagamento dependem das regras, não apenas do contador.', 'Time until the recorded closing deadline, synchronized with the server clock. At zero the round ends; assessment and payment depend on the rules, not just the countdown.', 'Tiempo hasta el cierre registrado, sincronizado con el reloj del servidor. Al llegar a cero la ronda termina; el cálculo y el pago dependen de las reglas, no solo del contador.')}>{countdownLabel}</Help></div>
        <p data-testid={`${testIdPrefix}-round-countdown`} role="timer" aria-live="off" aria-label={`${countdownLabel}: ${countdown}`} className="display mt-0.5 text-2xl font-extrabold tabular-nums leading-tight text-[#0E7C6B]">{countdown}</p>
      </div>
    </div>
    <p className="mt-2 text-xs leading-relaxed text-[#5B6B85]">{date(round.startedAt)} → {date(round.endsAt)} · {x('Horário do Brasil', 'Brazil time', 'Horario de Brasil')}</p>
    {progress === null ? <p className="mt-2 text-xs text-[#5B6B85]">{x('Horário da rodada indisponível', 'Round timing unavailable', 'Horario de la ronda no disponible')}</p>
      : <div className="mt-2">
        <div className="mb-1 flex justify-between gap-2 text-[11px] font-semibold text-[#5B6B85]"><Help tip={x('Percentual do tempo da rodada que já passou. Não mede lucro, execução de operações nem chance de pagamento.', 'Percentage of round time already elapsed. Does not measure profit, operation completion or payment probability.', 'Porcentaje del tiempo de la ronda ya transcurrido. No mide ganancias, ejecución de operaciones ni probabilidad de pago.')}>{x('Progresso da rodada', 'Round progress', 'Progreso de la ronda')}</Help><span data-testid={`${testIdPrefix}-round-percent`}>{percent}%</span></div>
        <div data-testid={`${testIdPrefix}-round-progress`} role="progressbar" aria-label={x('Tempo decorrido da rodada', 'Elapsed round time', 'Tiempo transcurrido de la ronda')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent ?? 0} className="h-2 overflow-hidden rounded-full bg-[#E4DCCB]">
          <div className="h-full rounded-full bg-[#0E7C6B]" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>}
  </header>;
}
