import { Router } from "express";
import { GetTestContractResponse, ObserveTestContractBody } from "@workspace/api-zod";
import { verifiedAccount } from "../lib/account-identity";
import { testContractObservation, InvalidTestContract } from "../modules/reconciliation";
import { observationStore } from "../modules/reconciliation/infrastructure/observation-store";
import { createTestContractReader } from "../modules/reconciliation/infrastructure/chain-reader";

const router = Router();
const service = testContractObservation(observationStore, createTestContractReader());
const attempts = new Map<string, number>();
router.all("/test-contract", async (req, res) => {
  res.set("Cache-Control", "no-store");
  if (process.env.NODE_ENV === "production") { res.status(403).json({ error: "development_only" }); return; }
  if (!["GET", "POST"].includes(req.method)) { res.sendStatus(405); return; }
  if (req.method === "POST" && req.headers["sec-fetch-site"] === "cross-site") {
    res.status(403).json({ error: "invalid_origin" }); return;
  }
  try {
    const account = await verifiedAccount(req);
    if (!account?.userId) { res.status(401).json({ error: "authentication_required" }); return; }
    const now = Date.now();
    if (req.method === "POST" && (attempts.get(account.userId) ?? 0) > now - 5000) { res.status(429).json({ error: "rate_limited" }); return; }
    if (attempts.size > 2000) for (const [id, time] of attempts) if (time < now - 60000) attempts.delete(id);
    if (req.method === "POST") attempts.set(account.userId, now);
    const input = req.method === "POST" ? ObserveTestContractBody.safeParse(req.body) : null;
    if (input && !input.success) { res.status(400).json({ error: "invalid_address" }); return; }
    const result = input?.success ? await service.register(account.userId, input.data.address) : await service.get(account.userId);
    res.json(GetTestContractResponse.parse(result));
  } catch (error) {
    if (error instanceof InvalidTestContract) { res.status(400).json({ error: error.message }); return; }
    if (error instanceof Error && ["email_verification_required", "account_unavailable"].includes(error.message)) {
      res.status(403).json({ error: error.message }); return;
    }
    req.log.warn("Test contract observation unavailable; no financial execution attempted");
    res.status(503).json({ error: "blockchain_unavailable" });
  }
});
export default router;
