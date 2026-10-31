import { REQUESTS } from './central-data';
import { packetById } from './central-packets';
import { parseSel, type Sel } from './central-graph-model';

export const SUPPORT_AGENT_IDS = ['governance', 'risk', 'treasury', 'execution', 'reconciliation'];
export type CentralView = {
  selection: Sel | null;
  packetId: string | null;
  requestId: string | null;
  reportsOpen: boolean;
  reportAgentId: string | null;
  agentMonitoring: boolean;
};
export const validRequestId = (id: string | null | undefined): string | null =>
  id && REQUESTS.some(r => r.id === id) ? id : null;
const validRole = (id: string | null | undefined): string | null =>
  id && SUPPORT_AGENT_IDS.includes(id) ? id : null;

export function readCentralView(search: string): CentralView {
  const q = new URLSearchParams(search);
  const packet = packetById(q.get('packet') ?? '');
  const reportsOpen = q.get('view') === 'reports';
  return {
    selection: reportsOpen || packet ? null : parseSel(search),
    packetId: reportsOpen ? null : packet?.id ?? null,
    requestId: packet?.requestId ?? validRequestId(q.get('request')),
    reportsOpen,
    reportAgentId: validRole(q.get('reportAgent')),
    agentMonitoring: !reportsOpen && !packet && q.get('view') === 'monitoring',
  };
}

export function writeCentralView(search: string, view: CentralView): string {
  const q = new URLSearchParams(search);
  ['node', 'edge', 'packet', 'request', 'view', 'reportAgent'].forEach(key => q.delete(key));
  if (view.requestId) q.set('request', view.requestId);
  if (view.reportAgentId) q.set('reportAgent', view.reportAgentId);
  if (view.reportsOpen) q.set('view', 'reports');
  else if (view.packetId) q.set('packet', view.packetId);
  else if (view.selection) { q.set(view.selection.k, view.selection.id); if (view.agentMonitoring) q.set('view', 'monitoring'); }
  return q.toString();
}

export type CentralAction =
  | { type: 'packet'; id: string }
  | { type: 'request'; id: string }
  | { type: 'reports'; requestId?: string | null; agentId?: string | null }
  | { type: 'agent'; id: string }
  | { type: 'selection'; selection: Sel }
  | { type: 'selectRequest'; id: string }
  | { type: 'selectAgent'; id: string }
  | { type: 'clearRequest' }
  | { type: 'close' };

/** Every transition has exactly one overlay and one proposal context. */
export function transitionCentralView(current: CentralView, action: CentralAction): CentralView {
  const closed = { ...current, selection: null, packetId: null, reportsOpen: false, agentMonitoring: false };
  switch (action.type) {
    case 'packet': {
      const packet = packetById(action.id);
      if (!packet) return current;
      return { ...closed, packetId: packet.id, requestId: packet.requestId,
        reportAgentId: packet.exchange ? validRole(packet.source === 'bettex' ? packet.target : packet.source) : current.reportAgentId };
    }
    case 'request':
      return validRequestId(action.id) ? { ...closed, requestId: action.id, selection: { k: 'node', id: 'predictions' } } : current;
    case 'reports': {
      const source = current.packetId ? packetById(current.packetId) : null;
      const role = action.agentId === undefined
        ? validRole(source?.source === 'bettex' ? source.target : source?.source) ?? validRole(current.selection?.id) ?? current.reportAgentId
        : validRole(action.agentId);
      return { ...closed, reportsOpen: true, requestId: action.requestId === undefined ? current.requestId : validRequestId(action.requestId), reportAgentId: role };
    }
    case 'agent':
      return parseSel(`?node=${encodeURIComponent(action.id)}`) ? { ...closed, selection: { k: 'node', id: action.id }, agentMonitoring: true } : current;
    case 'selection':
      return parseSel(`?${action.selection.k}=${encodeURIComponent(action.selection.id)}`) ? { ...closed, selection: action.selection } : current;
    case 'selectRequest':
      return validRequestId(action.id) ? { ...current, requestId: action.id } : current;
    case 'selectAgent':
      return validRole(action.id) ? { ...current, reportAgentId: action.id } : current;
    case 'clearRequest':
      return { ...closed, reportsOpen: current.reportsOpen, selection: current.selection, requestId: null };
    case 'close':
      return closed;
  }
}
