import type { DemoSwapPool, DemoSwapQuote } from "@workspace/api-zod";
import { demoAmmContract } from "./demo-amm-contract.ts";

const SCALE = 1_000_000;
const money = (n: number) => Math.round(n * SCALE) / SCALE;

export function createDemoSwapPool(availableUsdc: number, now: number): DemoSwapPool {
  // Demo capital only: USDC is earmarked from existing Treasury cash, not added
  // to its total. BETTEX inventory is explicitly modeled, not minted on-chain.
  const cash = money(Math.min(25_000, Math.max(0, availableUsdc)));
  if (cash <= 0) throw new Error("pool_liquidity_unavailable");
  return {
    id: "BETTEX-USDC-DEMO", source: "constant_product_demo", contractAddress: null,
    contract: { ...demoAmmContract.descriptor },
    reserveUsdc: cash, reserveBettex: money(cash / .04),
    initialReserveUsdc: cash, initialReserveBettex: money(cash / .04),
    spotPriceUsdc: .04, totalVolumeUsdc: 0, swapCount: 0,
    updatedAt: new Date(now).toISOString(),
  };
}

export function quoteDemoSwap(pool: DemoSwapPool, asset: string, amount: number, feeUsdc: number): DemoSwapQuote {
  return demoAmmContract.quoteSwap(pool, asset, amount, feeUsdc);
}

export function executeDemoSwap(pool: DemoSwapPool, quote: DemoSwapQuote, now: number) {
  return demoAmmContract.swap(pool, quote, now);
}
