/** @jsxImportSource react */
import { useX } from './ui';

/** Display the persisted ID verbatim: current rounds and historical records must match. */
export function RoundIdentity({ id, testId }: { id: string; testId?: string }) {
  const { x } = useX();
  return <span data-testid={testId} data-round-id={id} className="inline-flex max-w-full flex-wrap items-center gap-x-1.5 rounded-lg bg-[#F0E9DA] px-2.5 py-1 text-xs text-[#5B6B85]">
    <span className="font-semibold">{x('ID da rodada', 'Round ID', 'ID de la ronda')}:</span>
    <span className="mono break-all font-bold text-[#0A2342]">{id}</span>
  </span>;
}
