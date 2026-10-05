import type { DemoOperation } from '@workspace/api-client-react';

/** Funds actually placed, including positions awaiting reconciliation. */
export function liveCapital(operations: Pick<DemoOperation, 'status' | 'capitalUsdc'>[]) {
  return operations.reduce((sum, operation) =>
    operation.status === 'open' || operation.status === 'reconciling'
      ? sum + operation.capitalUsdc
      : sum, 0);
}