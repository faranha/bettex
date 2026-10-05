export const treasuryPermissions = ["treasury_view", "treasury_propose", "treasury_approve", "treasury_execute",
  "treasury_pause", "treasury_policy", "treasury_activate"] as const;
export type TreasuryPermission = typeof treasuryPermissions[number];
export type TreasuryActor = { id: string; type: "human" | "agent" };
export type TreasuryPolicy = { version: number; paused: boolean; defensiveUnits: string; maxAllocationUnits: string;
  dailyLimitUnits: string; destinations: string[] };
export type TreasuryProposal = {
  id: string; kind: "allocation" | "policy" | "permission"; proposer: TreasuryActor; reason: string;
  version: number; state: "proposed" | "approved" | "rejected" | "executing" | "uncertain" | "confirmed";
  units?: string; destination?: string; policy?: Omit<TreasuryPolicy, "version" | "paused">;
  permission?: { target: string; permission: TreasuryPermission; grant: boolean }; approver?: string; result?: string; hash?: string;
};
export type TreasuryResources = { cashUnits: string; capitalUnits: string; unclassifiedIncomingUnits: string;
  syntheticIncomingUnits: string; obligationUnits: string; reservedUnits: string; allocatedUnits: string;
   dailyCommittedUnits: string; blockNumber: number; blockHash: string; timestamp: number;
   blockedDestinations?:string[];
   distributionSummary?:{resultNature:"synthetic_test_model_not_external_profit";rounds:number;modeledResultUnits:string;
     modeledRetainedUnits:string;paidUnits:string;pendingUnits:string;cancelledOrExpiredUnits:string;
     buybackPaidUnits:string;buybackPendingUnits:string} };
export function exactUnits(v: unknown): v is string { return typeof v === "string" && /^(0|[1-9]\d{0,39})$/.test(v); }
export function policyValid(p: Omit<TreasuryPolicy, "version" | "paused">) {
  return [p.defensiveUnits,p.maxAllocationUnits,p.dailyLimitUnits].every(exactUnits)
    && BigInt(p.maxAllocationUnits) > 0n && BigInt(p.maxAllocationUnits) <= BigInt(p.dailyLimitUnits)
    && p.destinations.length > 0 && p.destinations.length <= 10
     && p.destinations.every(a => /^0x[0-9a-f]{40}$/i.test(a)&&!/^0x0{40}$/i.test(a))
    && new Set(p.destinations.map(a => a.toLowerCase())).size === p.destinations.length;
}
export function availableUnits(r: TreasuryResources, p: TreasuryPolicy) {
  const v=BigInt(r.cashUnits)-BigInt(p.defensiveUnits)-BigInt(r.obligationUnits)-BigInt(r.reservedUnits);
  return String(v > 0n ? v : 0n);
}
export function allocationReason(p: TreasuryProposal, policy: TreasuryPolicy, resources: TreasuryResources) {
  if (policy.paused) return "operations_paused";
  if (p.version !== policy.version) return "policy_version_changed";
  if (!exactUnits(p.units) || BigInt(p.units) === 0n) return "invalid_units";
  if (!policy.destinations.some(a=>a.toLowerCase()===p.destination?.toLowerCase())) return "destination_not_authorized";
  if(resources.blockedDestinations?.some(a=>a.toLowerCase()===p.destination?.toLowerCase()))return "destination_not_authorized";
  if (BigInt(p.units) > BigInt(policy.maxAllocationUnits)) return "allocation_limit";
  if (BigInt(p.units) + BigInt(resources.dailyCommittedUnits) > BigInt(policy.dailyLimitUnits)) return "daily_limit";
  if (BigInt(p.units) > BigInt(availableUnits(resources,policy))) return "insufficient_available_resources";
  return "allowed";
}
