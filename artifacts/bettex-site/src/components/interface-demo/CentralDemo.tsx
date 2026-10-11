/** @jsxImportSource react */
import { useFmt } from '../alpha-trading/format';
import { CentralGraph } from './CentralGraph';

/** BETTEX AI Center as a local visual demo: the 3D scene hosts every panel; fixture-driven, no queries, timers or writes. */
export function CentralDemo({ onAction }: { onAction: () => void }) {
  const { x } = useFmt();
  return <div className="grid min-w-0 gap-2" data-testid="alpha-trading">
    <h1 className="sr-only">{x('Central da IA', 'AI Center', 'Central de IA')}</h1>
    <CentralGraph onAction={onAction} />
  </div>;
}
