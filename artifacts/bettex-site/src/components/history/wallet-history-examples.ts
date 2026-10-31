import type { WalletHistoryRow } from './wallet-history-model';
/** Explicit examples: never inserted into balances, the ledger or actual-record exports. */
export function walletHistoryExamples(at: string): WalletHistoryRow[] {
  const base: WalletHistoryRow = {
    id: '', correlationId: '', at, kind: '', type: '', state: 'simulated',
    environment: 'simulation', source: 'illustrative_example', category: 'financial',
    example: true, reconstructed: false, wallets: [], asset: 'USDC', amount: '0',
    paidAsset: null, paidAmount: null, feeUsdc: '0', walletAddress: null, transactionHash: null, details: {},
  };
  const examples: Array<Partial<WalletHistoryRow>> = [
    { type: 'onramp', kind: 'onramp', amount: '998', feeUsdc: '2', wallets: ['USDC'] },
    { type: 'receive', kind: 'external_deposit', amount: '800', wallets: ['USDC'] },
    { type: 'swap', kind: 'swap', asset: 'BETTEX', amount: '2500', paidAsset: 'USDC', paidAmount: '100', feeUsdc: '0.1', wallets: ['USDC','BETTEX'] },
    { type: 'swap', kind: 'swap', asset: 'USDC', amount: '39.96', paidAsset: 'BETTEX', paidAmount: '1000', feeUsdc: '0.04', wallets: ['BETTEX','USDC'] },
    { type: 'yield', kind: 'distribution_paid', amount: '0.717628', wallets: ['USDC','BETTEX'], details: { periodId: 'example-round', ruleVersion: 'illustrative-only' } },
    { type: 'withdrawal', kind: 'withdraw', amount: '50', feeUsdc: '0.025', wallets: ['USDC'] },
    { type: 'send', kind: 'send', asset: 'BETTEX', amount: '500', feeUsdc: '0.01', wallets: ['BETTEX','USDC'] },
    { type: 'receive', kind: 'external_deposit', asset: 'BETTEX', amount: '3000', wallets: ['BETTEX'] },
    { type: 'staking', kind: 'participation_entered', asset: 'BETTEX', amount: '12500', wallets: ['BETTEX'], category: 'activity' },
    { type: 'fee', kind: 'gas_fee', asset: 'ETH', amount: '0.000021', feeUsdc: null, wallets: ['ETH'], environment: 'example' },
    { type: 'send', kind: 'financial_requested', asset: 'BETTEX', amount: '250', state: 'pending', wallets: ['BETTEX','USDC'], feeUsdc: '0.005' },
    { type: 'withdrawal', kind: 'financial_requested', amount: '150', state: 'failed', wallets: ['USDC'], feeUsdc: null },
  ];
  return examples.map((e, index) => ({ ...base, ...e, id: `EXAMPLE-${index + 1}`, correlationId: `illustration:${index + 1}`, at: new Date(Date.parse(at) - index * 3600000).toISOString() }));
}
