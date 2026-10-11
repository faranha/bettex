/** @jsxImportSource react */
import { useFmt } from '../alpha-trading/format';
import { CentralGraph } from './CentralGraph';
import { SPEC_NOTE } from './central-copy';

/** BETTEX AI Center as a local visual demo: the 3D scene hosts every panel; fixture-driven, no queries, timers or writes. */
export function CentralDemo({ onAction }: { onAction: () => void }) {
  const { x } = useFmt();
  return <div className="grid min-w-0 gap-2" data-testid="alpha-trading">
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h1 className="display text-xl font-extrabold">{x('Central da IA', 'AI Center', 'Central de IA')}</h1>
      <span className="rounded-full border border-[#C9A227]/60 bg-[#FBF0D6] px-2 py-0.5 text-[11px] font-bold text-[#7A5410]">{x('Demonstração visual', 'Visual demo', 'Demostración visual')}</span>
      <details className="text-xs text-[#5B6B85]"><summary className="min-h-11 cursor-pointer py-3 font-bold">{x('Sobre esta demonstração', 'About this demo', 'Sobre esta demostración')}</summary>
        <p className="max-w-3xl rounded-xl border border-[#C9A227]/60 bg-[#FBF0D6] p-2 font-bold text-[#7A5410]" data-testid="central-demo-note">{SPEC_NOTE(x)}</p></details></div>
    <CentralGraph onAction={onAction} />
  </div>;
}
