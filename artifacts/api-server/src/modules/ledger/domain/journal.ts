export type LedgerLeg = { account: string; units: string };
export function balancedLegs(legs: LedgerLeg[]) {
  if (legs.length < 2 || legs.some(l => !l.account || !/^-?\d+$/.test(l.units))) throw new Error("invalid_ledger_entry");
  if (legs.reduce((v, l) => v + BigInt(l.units), 0n) !== 0n) throw new Error("unbalanced_ledger_entry");
  return legs;
}
