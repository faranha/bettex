import type { NativeTestOperation } from '@workspace/api-client-react';

/** Approval confirmation is never purchase completion. Includes quote-only rows. */
export function findPurchaseInProgress(operations: NativeTestOperation[]) {
  return operations.find(operation => operation.kind === 'purchase'
    && !operation.stages.some(stage => stage.name === 'buy' && stage.state === 'confirmed')
    && !operation.stages.some(stage => ['failed', 'rejected', 'expired', 'cancelled'].includes(stage.state)));
}

/** BUY draft is intentionally created only AFTER exact approval confirms. */
export function purchaseNeedsQuote(operation?: NativeTestOperation) {
  if (!operation || operation.stages.some(stage => stage.name === 'buy')) return false;
  return operation.stages.length === 0
    || operation.stages.some(stage => stage.name === 'approve' && stage.state === 'confirmed');
}
