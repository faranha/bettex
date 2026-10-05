import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { GetAlloraAnalysisParams, GetAlloraAnalysisResponse } from "@workspace/api-zod";
import { readAllora, type AlloraAsset } from "../modules/agents/infrastructure/allora-public";

const router = Router();
type Analysis = ReturnType<typeof GetAlloraAnalysisResponse.parse>;
const cache = new Map<AlloraAsset, { until: number; result: Promise<Analysis> }>();
let ready: Promise<unknown> | undefined;
async function analysis(asset: AlloraAsset): Promise<Analysis> {
  await (ready ??= db.execute(sql`CREATE TABLE IF NOT EXISTS allora_observations (
    network text NOT NULL, topic_id integer NOT NULL, block_height text NOT NULL,
    produced_at timestamptz NOT NULL, observation jsonb NOT NULL,
    PRIMARY KEY(network,topic_id,block_height)
  )`).catch(error => { ready = undefined; throw error; }));
  const observation = await readAllora(asset);
  const identity = { ...observation, observedAt: undefined, status: undefined };
  const stored = await db.execute(sql`INSERT INTO allora_observations (network,topic_id,block_height,produced_at,observation)
    VALUES (${observation.network},${observation.topicId},${observation.blockHeight},${observation.producedAt},
      ${JSON.stringify(identity)}::jsonb)
    ON CONFLICT (network,topic_id,block_height) DO UPDATE SET observation=allora_observations.observation
    WHERE allora_observations.observation=EXCLUDED.observation RETURNING block_height`);
  if (!stored.rows.length) throw new Error("source_identity_changed");
  const history = await db.execute(sql`SELECT observation FROM allora_observations
    WHERE network=${observation.network} AND topic_id=${observation.topicId}
    ORDER BY produced_at DESC LIMIT 60`);
  return GetAlloraAnalysisResponse.parse({ observation, history: history.rows.map(r => r.observation) });
}
router.get("/agents/allora/:asset", async (req, res): Promise<void> => {
  res.set("Cache-Control", "no-store");
  const params = GetAlloraAnalysisParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ code: "unsupported_asset" }); return; }
  const asset = params.data.asset;
  let entry = cache.get(asset);
  if (!entry || entry.until <= Date.now()) {
    const result = analysis(asset);
    entry = { until: Date.now() + 60_000, result };
    cache.set(asset, entry);
    result.catch(() => { if (cache.get(asset)?.result === result) entry!.until = Date.now() + 15_000; });
  }
  try { res.json(await entry.result); }
  catch {
    req.log.warn({ asset, code: "allora_unavailable" }, "Allora observation rejected; no synthetic replacement");
    res.status(503).json({ code: "allora_unavailable" });
  }
});
export default router;
