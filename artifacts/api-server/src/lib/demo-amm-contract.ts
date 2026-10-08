import type { DemoAmmContract as ContractDescriptor, DemoSwapPool, DemoSwapQuote } from "@workspace/api-zod";

const SCALE = 1_000_000;
const money = (n: number) => Math.round(n * SCALE) / SCALE;
const units = (n: number) => BigInt(Math.round(n * SCALE));
const quantity = (n: bigint) => Number(n) / SCALE;

/**
 * Executable mock contract for the ALFA. State is persisted by the existing
 * engine transaction, not on a blockchain. The public activity registry is
 * separate and must never be presented as this AMM's deployment.
 */
export class SimulatedAmmContract {
  readonly descriptor: Readonly<ContractDescriptor> = Object.freeze({
    id: "SIM-BETTEX-AMM-001", name: "BETTEX AMM", version: "1.0",
    runtime: "server_simulation", status: "active",
  });

  getReserves(pool: DemoSwapPool) {
    return { reserveUsdc: pool.reserveUsdc, reserveBettex: pool.reserveBettex, version: pool.swapCount };
  }

  quoteSwap(pool: DemoSwapPool, asset: string, amount: number, feeUsdc: number): DemoSwapQuote {
    if (!["USDC", "BETTEX"].includes(asset) || !Number.isFinite(amount) || amount < .000001 || amount > 100000 || money(amount) !== amount) throw new Error("invalid_movement");
    if (!(pool.reserveUsdc > 0 && pool.reserveBettex > 0)) throw new Error("pool_liquidity_unavailable");
    const buy = asset === "USDC";
    const inputReserve = units(buy ? pool.reserveUsdc : pool.reserveBettex);
    const outputReserve = units(buy ? pool.reserveBettex : pool.reserveUsdc);
    // Integer floor prevents rounding from paying more than the invariant allows.
    const gross = quantity(outputReserve * units(amount) / (inputReserve + units(amount)));
    const output = buy ? gross : money(gross - feeUsdc);
    if (output <= 0 || gross <= 0) throw new Error("swap_amount_below_fee");
    const spot = pool.reserveUsdc / pool.reserveBettex;
    return {
      source: "constant_product_demo", assetIn: asset as "USDC" | "BETTEX",
      assetOut: buy ? "BETTEX" : "USDC", amountIn: amount, amountOut: output,
      grossOutputAmount: gross, feeUsdc, spotPriceUsdc: spot,
      executionPriceUsdc: buy ? amount / gross : gross / amount,
      priceImpactPercent: Math.max(0, 100 * (1 - gross / (buy ? amount / spot : amount * spot))),
      poolVersion: pool.swapCount,
    };
  }

  swap(pool: DemoSwapPool, quote: DemoSwapQuote, now: number) {
    if (quote.poolVersion !== pool.swapCount) throw new Error("pool_quote_changed");
    const buy = quote.assetIn === "USDC";
    const cashDelta = buy ? quote.amountIn : -quote.grossOutputAmount;
    pool.reserveUsdc = money(pool.reserveUsdc + cashDelta);
    pool.reserveBettex = money(pool.reserveBettex + (buy ? -quote.grossOutputAmount : quote.amountIn));
    pool.spotPriceUsdc = pool.reserveUsdc / pool.reserveBettex;
    pool.totalVolumeUsdc = money(pool.totalVolumeUsdc + Math.abs(cashDelta));
    pool.swapCount++;
    pool.updatedAt = new Date(now).toISOString();
    return cashDelta;
  }
}

export const demoAmmContract = new SimulatedAmmContract();
