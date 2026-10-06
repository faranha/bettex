import type { DemoDashboard, HistoryEntry } from '@workspace/api-client-react';

export type WalletAsset = 'USDC' | 'BETTEX' | 'ETH';
export type WalletHistoryRow = {
  id: string; correlationId: string; at: string; kind: string; type: string; state: string;
  environment: string; source: string; category: string; example: boolean; reconstructed: boolean;
  wallets: WalletAsset[]; asset: string | null; amount: string | null;
  paidAsset: string | null; paidAmount: string | null; feeUsdc: string | null;
  walletAddress: string | null; transactionHash: string | null; details: Record<string, string>;
};
const DEC: Record<string, number> = { USDC: 6, BETTEX: 18, ETH: 18 };
const SAFE = ['operationKind', 'stage', 'action', 'privateAction', 'periodId', 'reason', 'ruleVersion', 'from', 'to', 'targetWallet', 'trigger', 'previousState', 'priceUnits', 'priceDecimals', 'priceUnit', 'gasWei', 'quantityUnits', 'eligibleUnits', 'poolUnits', 'weightUnits', 'weightDecimals', 'principalUnits', 'capitalUnits', 'resultUnits', 'resultDecimals', 'costUnits', 'costDecimals'] as const;
export function decimalQuantity(raw: unknown, decimals: unknown): string | null {
  if (typeof raw !== 'string' || !/^-?\d+$/.test(raw)) return null;
  const dec = Number(decimals);
  if (!Number.isInteger(dec) || dec < 0 || dec > 36) return null;
  const n = BigInt(raw), sign = n < 0n ? '-' : '', abs = n < 0n ? -n : n;
  const base = 10n ** BigInt(dec);
  const fraction = (abs % base).toString().padStart(dec, '0').replace(/0+$/, '');
  return `${sign}${abs / base}${fraction ? `.${fraction}` : ''}`;
}
export function transactionType(kind: string, operationKind?: string): string {
  const k = operationKind || kind;
  if (/distribution|yield/.test(k)) return 'yield';
  if (/participation|staking/.test(k)) return 'staking';
  if (/purchase/.test(k)) return 'purchase';
  if (/swap|conversion/.test(k)) return 'swap';
  if (/withdraw/.test(k)) return 'withdrawal';
  if (/send|transfer/.test(k)) return 'send';
  if (/onramp/.test(k)) return 'onramp';
  if (/external_deposit|receive/.test(k)) return 'receive';
  if (/fund|deposit/.test(k)) return 'deposit';
  if (/fee|gas/.test(k)) return 'fee';
  if (/approve|approval/.test(k)) return 'approval';
  if (/quote/.test(k)) return 'quote';
  if (/wallet|backup|private_action/.test(k)) return 'wallet_activity';
  return 'operation';
}
export function walletHistoryRow(entry: HistoryEntry): WalletHistoryRow {
  const data = entry.data as Record<string, unknown>;
  const paidAsset = typeof data.paidAsset === 'string' ? data.paidAsset : null;
  const fromReceived = data.amountUnits == null && data.receivedUnits != null;
  const asset = fromReceived && typeof data.receivedAsset === 'string' ? data.receivedAsset : entry.asset ?? (typeof data.receivedAsset === 'string' ? data.receivedAsset : paidAsset);
  const amount = decimalQuantity(data.amountUnits ?? data.receivedUnits ?? data.quantityUnits ?? data.eligibleUnits ?? data.paidUnits,
    fromReceived ? data.receivedDecimals ?? DEC[asset ?? ''] ?? data.decimals : data.decimals ?? DEC[asset ?? '']);
  const paidAmount = decimalQuantity(data.paidUnits, data.paidDecimals ?? DEC[paidAsset ?? '']);
  const feeUsdc = decimalQuantity(data.feeUnits, 6);
  const type = transactionType(entry.kind, typeof data.operationKind === 'string' ? data.operationKind : undefined);
  const assets = new Set<string>([asset ?? '', paidAsset ?? '', typeof data.receivedAsset === 'string' ? data.receivedAsset : '']);
  // A conversion affects both user wallets, even in legacy records lacking the debit detail.
  if (type === 'swap' || type === 'purchase') { assets.add('USDC'); assets.add('BETTEX'); }
  if (type === 'yield') { assets.add('USDC'); assets.add('BETTEX'); }
  if (feeUsdc && Number(feeUsdc) > 0) assets.add('USDC');
  if (data.gasWei && data.gasWei !== '0') assets.add('ETH');
  const details: Record<string, string> = {};
  for (const key of SAFE) if (typeof data[key] === 'string' || typeof data[key] === 'number') details[key] = String(data[key]);
  return {
    id: entry.id, correlationId: entry.correlationId, at: entry.occurredAt, kind: entry.kind,
    type, state: entry.state, environment: entry.environment, source: entry.source,
    category: entry.category, example: false, reconstructed: entry.reconstructed,
    wallets: [...assets].filter((a): a is WalletAsset => a === 'USDC' || a === 'BETTEX' || a === 'ETH'),
    asset, amount, paidAsset, paidAmount, feeUsdc, walletAddress: entry.wallet ?? null,
    transactionHash: entry.transactionHash ?? null, details,
  };
}
export function brlReference(row: WalletHistoryRow, d: DemoDashboard, fee = false): number | null {
  const quantity = fee ? row.feeUsdc : row.amount;
  const asset = fee ? 'USDC' : row.asset;
  if (quantity === null || !asset) return null;
  const amount = Number(quantity), rate = d.balances.brlPerUsdc;
  if (!Number.isFinite(amount) || Math.abs(amount) > Number.MAX_SAFE_INTEGER || !Number.isFinite(rate) || rate <= 0) return null;
  if (asset === 'USDC') return amount * rate;
  // The simulated BETTEX quote is not a native-token market price.
  if (asset === 'BETTEX' && row.environment === 'simulation' && Number.isFinite(d.balances.bettexUsdc) && d.balances.bettexUsdc > 0) return amount * rate * d.balances.bettexUsdc;
  return null;
}
export type WalletHistoryFilters = { wallet: string; type: string; state: string; search: string };
export function filterWalletHistory(rows: WalletHistoryRow[], f: WalletHistoryFilters): WalletHistoryRow[] {
  const term = f.search.trim().toLowerCase();
  return rows.filter(r => (!f.wallet || r.wallets.includes(f.wallet as WalletAsset)
    || [r.walletAddress, r.details.targetWallet, r.details.from, r.details.to].some(a => a?.toLowerCase() === f.wallet.toLowerCase()))
    && (!f.type || r.type === f.type) && (!f.state || r.state === f.state)
    && (!term || [r.id, r.transactionHash, r.walletAddress, r.kind, r.correlationId].some(v => v?.toLowerCase().includes(term))));
}
