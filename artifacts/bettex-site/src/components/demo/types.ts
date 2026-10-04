/** Visual prototype only: deliberately no network, storage or wallet credentials. */
export type AgentId = 'orchestrator' | 'treasury' | 'predictions' | 'crypto' | 'sports' | 'bonus' | 'buyback' | 'governance';
export type Status = 'proposed' | 'analyzing' | 'authorized' | 'open' | 'partial' | 'uncertain' | 'confirmed' | 'rejected' | 'failed' | 'cancelled' | 'closed';
export type Text = readonly [string, string, string];
export type Operation = {
  id: string; agent: AgentId; title: Text; status: Status; capital: number;
  result: number; costs: number; reason: Text; source: Text; data: { label: Text; value: Text }[];
  events: { time: number; status: Status; text: Text }[];
  version: number; quoteUntil: number;
};
export type MovementKind = 'receive' | 'onramp' | 'swap' | 'send' | 'withdraw' | 'distribution';
export type Movement = {
  id: string; kind: MovementKind; asset: 'USDC' | 'BETTEX'; amount: number; fee: number;
  externalCost: number; status: Status; time: number; destination: string; outcome: 'success' | 'failure' | 'uncertain'; revision: number;
  quoteAt?: number;
};
export type RoundScenario = 'profit' | 'loss' | 'reserve' | 'liquidity' | 'zero' | 'fraction' | 'uncertain';
export type Round = {
  id: string; scenario: RoundScenario; status: 'accruing' | 'assessed' | 'authorized' | 'uncertain' | 'paid' | 'cancelled' | 'closed';
  utcDay: number; gross: number; costs: number; entityTax: number; eligible: number;
  treasury: number; staking: number; buyback: number; weight: number; totalWeight: number;
  grossPersonal: number; withholding: number; netPersonal: number; fraction: number;
  receipt: string | null; closed: boolean; reservesPass: boolean; liquidityPass: boolean;
  remainingObligation: number;
};
export type Message = { id: string; author: 'participant' | 'system' | 'example'; text: Text; reference?: string; reactions: number; reacted: boolean; time: number };
export type PublicEvent = { id: string; time: number; agent: AgentId; status: Status; text: Text; reference?: string; asset?: 'USDC' | 'BETTEX' };
export type Policy = { version: number; stage: 'suggested' | 'approved' | 'waiting' | 'active'; scheduledAt: number | null; signatures: number; paused: boolean; incident: 'none' | 'detected' | 'contained' | 'resolved' };
export type DemoState = {
  clock: number; step: number; running: boolean; session: 'ready' | 'expired' | 'ended'; profile: 'ready' | 'creation' | 'recovery' | 'access';
  usdc: number; bettex: number; receivedYield: number; eligibleSince: number | null; accumulatedWeight: number; participationRevision: number;
  movements: Movement[]; operations: Operation[]; rounds: Round[]; messages: Message[];
  roundWeights: Record<number, number>;
  poll: { votes: [number, number, number]; selected: number | null; closed: boolean };
  publicEvents: PublicEvent[]; policy: Policy;
  treasury: { assets: number; reserve: number; requiredReserve: number; liquid: number; obligations: number; committed: number; transit: number; reserveTransit: number; liquidityTransit: number; operating: number };
  buyback: { wallet: number; committed: number; acquired: number; burned: number; stage: 'accumulating' | 'analysis' | 'authorized' | 'purchased' | 'burned' };
  error: Text | null;
};
export type DemoAction =
  | { type: 'RESET' } | { type: 'TICK' } | { type: 'RUN'; value: boolean }
  | { type: 'REVIEW_MOVEMENT'; kind: MovementKind; amount: number; destination: string; outcome: Movement['outcome']; quoteAt: number }
  | { type: 'AUTHORIZE_MOVEMENT'; id: string }
  | { type: 'RESOLVE_MOVEMENT'; id: string; received?: boolean }
  | { type: 'CANCEL_MOVEMENT'; id: string }
  | { type: 'ASSESS_ROUND'; scenario: RoundScenario }
  | { type: 'AUTHORIZE_ROUND'; id: string }
  | { type: 'PAY_ROUND'; id: string }
  | { type: 'RECONCILE_ROUND'; id: string }
  | { type: 'CLOSE_ROUND'; id: string }
  | { type: 'BUYBACK_NEXT' } | { type: 'POLICY_NEXT' } | { type: 'INCIDENT_NEXT' } | { type: 'RECONCILE_RESERVE' } | { type: 'RECONCILE_LIQUIDITY' }
  | { type: 'MESSAGE'; text: string; reference?: string }
  | { type: 'REACTION'; id: string }
  | { type: 'VOTE'; option: number } | { type: 'CLOSE_POLL' }
  | { type: 'SESSION'; state: DemoState['session'] }
  | { type: 'PROFILE'; state: DemoState['profile'] }
  | { type: 'CLEAR_ERROR' };