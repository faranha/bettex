export type WeightedRecipient = { accountId: string; wallet: string; weight: string };
/** Approved split, exact micro-units; no carry-forward or invented capital profit. */
export function localRoundPlan(resultUnits: string, recipients: WeightedRecipient[]) {
  if (!/^\d+$/.test(resultUnits)) throw new Error("invalid_result");
  const profit = BigInt(resultUnits);
  if (new Set(recipients.map(r => r.accountId)).size !== recipients.length
    || recipients.some(r => !/^\d+$/.test(r.weight))) throw new Error("invalid_participants");
  const weight = recipients.reduce((sum, row) => sum + BigInt(row.weight), 0n);
  if (weight === 0n) return { result: resultUnits, retained: resultUnits, buyback: "0", participants: "0", payments: [] };
  const pool = profit / 4n, buyback = profit / 4n;
  const payments = recipients.filter(r => BigInt(r.weight) > 0n).map(r => ({
    ...r, units: String(pool * BigInt(r.weight) / weight),
  })).filter(r => BigInt(r.units) > 0n);
  const paid = payments.reduce((sum, row) => sum + BigInt(row.units), 0n);
  return { result: resultUnits, retained: String(profit - buyback - paid),
    buyback: String(buyback), participants: String(paid), payments };
}
