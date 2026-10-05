export interface ParticipationTransfer {
  from: string; to: string; value: string; timestamp: number;
  blockNumber: number; logIndex: number;
}
/** Balance-based participation; amount × confirmed seconds, not USD or custody. */
export function participationAt(wallet: string, transfers: ParticipationTransfer[], timestamp: number) {
  const address = wallet.toLowerCase();
  const start = Math.floor(timestamp / 86400) * 86400;
  let balance = 0n, weight = 0n, cursor = start, startedAt: number | null = null;
  for (const event of [...transfers].sort((a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex)) {
    if (event.timestamp > timestamp || event.from.toLowerCase() === event.to.toLowerCase()) continue;
    const incoming = event.to.toLowerCase() === address, outgoing = event.from.toLowerCase() === address;
    if (!incoming && !outgoing) continue;
    const time = Math.max(start, event.timestamp);
    if (event.timestamp >= start) { weight += balance * BigInt(time - cursor); cursor = time; }
    if (outgoing) { balance -= BigInt(event.value); weight = 0n; startedAt = balance > 0n ? event.timestamp : null; }
    else { if (balance === 0n) startedAt = event.timestamp; balance += BigInt(event.value); }
    if (balance < 0n) throw new Error('incomplete_participation_history');
  }
  weight += balance * BigInt(timestamp - cursor);
  return { model: 'wallet_balance', balance: String(balance), eligible: String(balance),
    tokenSeconds: String(weight), startedAt, roundStart: start, roundEnd: start + 86400,
    settlement: 'not_implemented', assessedUsdc: null, availableUsdc: null, paidUsdc: null };
}
