import { Router } from "express";
import { GetMarketLiveResponse } from "@workspace/api-zod";
import { createMarketFeed } from "../modules/agents/infrastructure/coinbase-market-feed";

const router = Router();
const feed = createMarketFeed();
router.get("/markets/live", async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    res.json(GetMarketLiveResponse.parse(await feed.snapshot()));
  } catch {
    req.log.warn({ code: "market_feed_unavailable" }, "Public market observations unavailable");
    res.status(503).json({ code: "market_feed_unavailable" });
  }
});
export default router;
