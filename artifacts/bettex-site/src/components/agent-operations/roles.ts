// Pure role-scope helper. Worker IDs/API types are unchanged; this only decides presentation.
export type OpsScope = 'orchestrator' | 'agents' | 'controls';
export const ORCHESTRATOR_ID = 'bettex';
// Active prediction-market agents: parent plus BTC/ETH/SOL specialists.
export const ACTIVE_AGENT_IDS = ['predictions', 'btc', 'eth', 'sol'] as const;
// Operational controls/services persisted as control reports. They are NOT agents.
export const CONTROL_IDS = ['treasury', 'governance', 'risk', 'execution', 'reconciliation'] as const;
// Inactive/reserved workers: never shown as active cards.
export const INACTIVE_IDS = ['sports', 'crypto', 'bonus'] as const;

const SETS: Record<OpsScope, readonly string[]> = { orchestrator: [ORCHESTRATOR_ID], agents: ACTIVE_AGENT_IDS, controls: CONTROL_IDS };
export const idsForScope = (s: OpsScope): readonly string[] => SETS[s];
export const inScope = (s: OpsScope, id: string) => SETS[s].includes(id);
export const scopeItems = <T extends { id: string }>(s: OpsScope, items: readonly T[]): T[] => items.filter(i => inScope(s, i.id));
export const defaultSelection = (s: OpsScope): string => SETS[s][0];
export const roleOf = (id: string): 'orchestrator' | 'agent' | 'control' | 'inactive' | 'unknown' =>
  id === ORCHESTRATOR_ID ? 'orchestrator' : (ACTIVE_AGENT_IDS as readonly string[]).includes(id) ? 'agent' : (CONTROL_IDS as readonly string[]).includes(id) ? 'control' : (INACTIVE_IDS as readonly string[]).includes(id) ? 'inactive' : 'unknown';
