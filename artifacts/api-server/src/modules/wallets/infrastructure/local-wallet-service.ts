import { Contract, ContractFactory } from "ethers";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import artifacts from "@workspace/bettex-contracts/verified-artifacts" with { type: "json" };
import { journeyChain, type LocalMetadata } from "./journey-chain";
import { matchesContractRuntime } from "@workspace/bettex-contracts/runtime";

/** Durable address per epoch; restart never deploys over an existing service. */
export async function localWalletService(meta: LocalMetadata): Promise<string> {
  if (process.env.NODE_ENV !== "development" || meta.chainId !== 31337
    || process.env.BETTEX_EXECUTION_PAUSED === "true") throw new Error("test_environment_required");
  await db.execute(sql`CREATE TABLE IF NOT EXISTS local_wallet_services (
    epoch text PRIMARY KEY, address text NOT NULL, transaction_hash text NOT NULL
  )`);
  return db.transaction(async tx => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`wallet-service:${meta.epoch}`}))`);
    const rows = await tx.execute(sql`SELECT address FROM local_wallet_services WHERE epoch=${meta.epoch}`);
    let address = String(rows.rows[0]?.address ?? "");
    const artifact = artifacts.BettexTestWalletService;
    if (!address) {
      const signer = await journeyChain.provider.getSigner(meta.reserve);
      const deployed = await new ContractFactory(artifact.abi, artifact.bytecode, signer).deploy(
        meta.token, meta.usdc, meta.sale, meta.operating);
      await deployed.waitForDeployment();
      address = await deployed.getAddress();
      await tx.execute(sql`INSERT INTO local_wallet_services (epoch,address,transaction_hash)
        VALUES (${meta.epoch},${address},${deployed.deploymentTransaction()!.hash})`);
    }
    if (!matchesContractRuntime(await journeyChain.provider.getCode(address), "BettexTestWalletService")) throw new Error("invalid_source");
    const service = new Contract(address, artifact.abi, journeyChain.provider);
    const values = await Promise.all(["token", "usdc", "sale", "operatingWallet"].map(n => service.getFunction(n)()));
    if (values.some((v, i) => String(v).toLowerCase()
      !== [meta.token, meta.usdc, meta.sale, meta.operating][i]!.toLowerCase())
      || BigInt(await service.getFunction("FEE_USDC")()) !== 2_500_000n) throw new Error("invalid_source");
    return address;
  });
}
