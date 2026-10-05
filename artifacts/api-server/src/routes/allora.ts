import { Router } from "express";
import { GetAlloraAnalysisParams } from "@workspace/api-zod";
import { collectAlloraObservation } from "../modules/agents/infrastructure/allora-observations";

const router = Router();
router.get("/agents/allora/:asset", async (req, res): Promise<void> => {
  res.set("Cache-Control", "no-store");
  const params = GetAlloraAnalysisParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ code: "unsupported_asset" }); return; }
  const asset = params.data.asset;
  try { res.json(await collectAlloraObservation(asset)); }
  catch {
    req.log.warn({ asset, code: "allora_unavailable" }, "Allora observation rejected; no synthetic replacement");
    res.status(503).json({ code: "allora_unavailable" });
  }
});
export default router;
