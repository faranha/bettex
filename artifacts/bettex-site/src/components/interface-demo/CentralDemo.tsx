/** @jsxImportSource react */
import { CentralGraph } from './CentralGraph';

/** BETTEX AI Center as a local visual demo: the 3D scene hosts every panel; fixture-driven, no queries, timers or writes. */
export function CentralDemo({ onAction }: { onAction: () => void }) {
  return <div className="grid min-w-0 gap-2" data-testid="alpha-trading">
    <CentralGraph onAction={onAction} />
  </div>;
}
