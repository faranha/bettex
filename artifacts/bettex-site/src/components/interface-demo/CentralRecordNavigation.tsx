/** @jsxImportSource react */
import { createContext, useContext } from 'react';
import { useFmt } from '../alpha-trading/format';
import { useL } from './CentralAgents';
import { nodeOf } from './central-graph-model';
import { requestJourney } from './central-journey';

type RecordNavigation = {
  requestId: string | null;
  reportAgentId: string | null;
  agentMonitoring: boolean;
  openRequest: (id: string) => void;
  openPacket: (id: string) => void;
  openReports: (requestId?: string | null, agentId?: string | null) => void;
  openAgent: (id: string) => void;
  selectRequest: (id: string) => void;
  selectReportAgent: (id: string) => void;
  clearRequest: () => void;
};

export const CentralRecordNavigation = createContext<RecordNavigation | null>(null);
export const useRecordNavigation = () => useContext(CentralRecordNavigation);

/** The record and its messages share an identity; these are links, not new records. */
export function RelatedPackets({ requestId }: { requestId: string }) {
  const nav = useRecordNavigation(); const { x, date } = useFmt(); const L = useL();
  const packets = requestJourney(requestId)?.packets ?? [];
  if (!nav || !packets.length) return null;
  return <details className="mt-3 rounded-xl border border-[#34748A] p-3" data-testid={`related-packets-${requestId}`}>
    <summary className="cursor-pointer py-2 text-sm font-bold text-[#0A6657]">
      {x('Ver pacotes relacionados', 'View related packets', 'Ver paquetes relacionados')} ({packets.length})
    </summary>
    <ol className="mt-2 grid gap-2">{packets.map(p => <li key={p.id}>
      <button type="button" data-demo-local data-testid={`record-packet-${p.id}`}
        className="grid min-h-11 w-full gap-1 rounded-xl border border-[#34748A] p-3 text-left text-sm"
        onClick={() => nav.openPacket(p.id)}>
        <strong>{L(p.title)}</strong>
        <span>{L(nodeOf(p.source).name)} → {L(nodeOf(p.target).name)}</span>
        <span className="text-xs">{date(p.at)}</span>
      </button>
    </li>)}</ol>
  </details>;
}
