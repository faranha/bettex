import { tokenomics } from './tokenomics.ts';

export type PresaleQuote = {
  quantity: number;
  totalCents: number;
};

export function quotePresalePurchase(rawQuantity: string): PresaleQuote | null {
  const value = rawQuantity.trim();
  if (!/^\d+$/.test(value)) return null;

  const quantity = Number(value);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > tokenomics.presaleAllocation) return null;

  const totalCents = quantity * tokenomics.presalePriceBRL * 100;
  if (!Number.isSafeInteger(totalCents)) return null;
  return { quantity, totalCents };
}