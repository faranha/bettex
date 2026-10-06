import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { GetDemoTestnetActivityResponse } from "@workspace/api-zod";
import { publicTestnetStatus } from "../modules/public-testnet/infrastructure/status";

const router = Router();
router.get("/demo/testnet", async (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(await publicTestnetStatus());
});
let activityCache: { until: number; data: unknown } | undefined;
router.get("/demo/testnet-activity", async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    if (!activityCache || activityCache.until < Date.now()) {
      const result = await db.execute(sql`
        SELECT count(*)::int AS sessions, max(updated_at)::text AS updated_at,
          (SELECT count(*)::int FROM demo_commands c
            JOIN demo_accounts a ON a.id = c.account_id WHERE a.clerk_user_id IS NULL) AS movements
        FROM demo_accounts WHERE clerk_user_id IS NULL
      `);
      const row = result.rows[0];
      activityCache = { until: Date.now() + 30_000, data: GetDemoTestnetActivityResponse.parse({
        sessions: Number(row?.sessions ?? 0), movements: Number(row?.movements ?? 0),
        updatedAt: row?.updated_at ?? null,
      }) };
    }
    res.json(activityCache.data);
  } catch (error) {
    req.log.warn({ err: error }, "Public demo aggregate observation unavailable");
    res.status(503).json({ error: "demo_activity_unavailable" });
  }
});
export default router;
