/** Bounded development mandate. Zero defensive requirement is a TEST hypothesis, not product policy. */
export function localRoundAllowed(input: { chainId: number; development: boolean; result: string;
  transferable: string; payments: string; buyback: string; otherObligations: string }) {
  const values = [input.result, input.transferable, input.payments, input.buyback, input.otherObligations];
  if (values.some(v => !/^\d+$/.test(v))) return false;
  return input.development && input.chainId === 31337 && BigInt(input.result) <= 1_000_000n
    && BigInt(input.payments) + BigInt(input.buyback) <= BigInt(input.result) / 2n
    && BigInt(input.transferable) >= BigInt(input.payments) + BigInt(input.buyback) + BigInt(input.otherObligations);
}
