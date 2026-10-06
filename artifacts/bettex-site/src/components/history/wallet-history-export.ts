import type { WalletHistoryRow } from './wallet-history-model';
import type { DemoDashboard } from '@workspace/api-client-react';
import { brlReference } from './wallet-history-model.ts';
export const CSV_COLUMNS = ['id','timestamp_utc','type','operation','state','wallets','asset','amount','paid_asset','paid_amount','fee_usdc','estimated_brl_current_simulated_rate','estimated_fee_brl_current_simulated_rate','environment','source','example','reconstructed','correlation_id','wallet_address','transaction_hash','details_json'] as const;
export function safeCsvCell(value: unknown): string {
  const text = String(value ?? '');
  const safe = /^[\s]*[=+@\-\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function exportWalletHistory(rows: WalletHistoryRow[], d: DemoDashboard, kind: 'csv' | 'json', scope: 'actual' | 'examples' = 'actual'): string {
  rows = rows.filter(row => scope === 'examples' ? row.example : !row.example);
  const values = rows.map(r => ({
    id: r.id, timestamp_utc: r.at, type: r.type, operation: r.kind, state: r.state,
    wallets: r.wallets.join('|'), asset: r.asset, amount: r.amount, paid_asset: r.paidAsset,
    paid_amount: r.paidAmount, fee_usdc: r.feeUsdc,
    estimated_brl_current_simulated_rate: brlReference(r, d),
    estimated_fee_brl_current_simulated_rate: brlReference(r, d, true),
    environment: r.environment, source: r.source, example: r.example, reconstructed: r.reconstructed,
    correlation_id: r.correlationId, wallet_address: r.walletAddress, transaction_hash: r.transactionHash, details_json: JSON.stringify(r.details),
  }));
  if (kind === 'json') return JSON.stringify({
    exportedAt: new Date().toISOString(), scope: scope === 'examples' ? 'illustrative_examples' : 'user_wallet_history', count: values.length,
    valuation: 'BRL references use current simulated rates, not historical execution prices.',
    brlPerUsdc: d.balances.brlPerUsdc, simulatedBettexUsdc: d.balances.bettexUsdc,
    records: values.map((value, index) => ({ ...value, details: rows[index]!.details })),
  }, null, 2);
  return '\uFEFF' + [CSV_COLUMNS.map(safeCsvCell).join(','), ...values.map(row => CSV_COLUMNS.map(key => safeCsvCell(row[key])).join(','))].join('\r\n');
}
export function downloadWalletHistory(rows: WalletHistoryRow[], d: DemoDashboard, kind: 'csv' | 'json', scope: 'actual' | 'examples' = 'actual') {
  const content = exportWalletHistory(rows, d, kind, scope);
  const url = URL.createObjectURL(new Blob([content], { type: kind === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url; link.download = `bettex-${scope === 'examples' ? 'example-' : ''}wallet-history-${new Date().toISOString().slice(0, 10)}.${kind}`;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
