import { Router, type Request, type Response } from "express";
import { createHash, randomBytes } from "node:crypto";
import { CreateDemoMovementBody, UpdateDemoProfileBody, GetDemoDashboardResponse } from "@workspace/api-zod";
import { loadDashboard, ClaimedBrowserAccountError } from "../lib/demo-store";
import { verifiedAccount, updateAccountName } from "../lib/account-identity";
import { DemoInputError } from "../lib/demo-state";

const router = Router();
const cookieName = "bettex_demo";
const requests = new Map<string, { count: number; reset: number }>();
router.use("/demo", (req, res, next) => {
  if (req.method !== "GET" && req.headers["sec-fetch-site"] === "cross-site") {
    res.status(403).json({ error: "invalid_movement" }); return;
  }
  const now = Date.now();
  const key = req.ip ?? req.socket.remoteAddress ?? "unknown";
  if (requests.size > 5000) for (const [id, entry] of requests) if (entry.reset < now) requests.delete(id);
  const entry = requests.get(key);
  if (entry && entry.reset > now) {
    if (++entry.count > 90) { res.status(429).json({ error: "rate_limited" }); return; }
  } else requests.set(key, { count: 1, reset: now + 60000 });
  res.set("Cache-Control", "no-store");
  next();
});
function accountId(req: Request, res: Response, rotate = false) {
  const raw = req.headers.cookie?.split(";").map(value => value.trim()).find(value => value.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  const token = !rotate && raw && /^[a-f0-9]{64}$/.test(raw) ? raw : randomBytes(32).toString("hex");
  if (token !== raw) res.cookie(cookieName, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" || req.secure || req.headers["x-forwarded-proto"] === "https",
    maxAge: 365 * 86400000, path: "/api/demo",
  });
  return createHash("sha256").update(token).digest("hex");
}
async function userDashboard(req: Request, res: Response, command?: Parameters<typeof loadDashboard>[1]) {
  const user = await verifiedAccount(req);
  const browserId = accountId(req, res);
  try {
    return await loadDashboard({ browserId, ...user }, command);
  } catch (error) {
    if (!(error instanceof ClaimedBrowserAccountError)) throw error;
    const freshId = accountId(req, res, true);
    if (command) {
      res.status(403).json({ error: "authentication_required" });
      return undefined;
    }
    return loadDashboard({ browserId: freshId });
  }
}
function errorResponse(req: Request, res: Response, error: unknown) {
  if (error instanceof DemoInputError) { res.status(400).json({ error: error.message }); return; }
  if (error instanceof Error && ["email_verification_required", "account_unavailable"].includes(error.message)) {
    res.status(403).json({ error: error.message }); return;
  }
  req.log.error({ err: error }, "Demo request failed");
  res.status(503).json({ error: "engine_unavailable" });
}
router.get("/demo/dashboard", async (req, res) => {
  try {
    res.json(GetDemoDashboardResponse.parse(await userDashboard(req, res)));
  } catch (error) { errorResponse(req, res, error); }
});
router.post("/demo/movements", async (req, res) => {
  const input = CreateDemoMovementBody.safeParse(req.body);
  if (!input.success) { res.status(400).json({ error: "invalid_movement" }); return; }
  try {
    const result = await userDashboard(req, res, { movement: input.data });
    if (result) res.json(GetDemoDashboardResponse.parse(result));
  } catch (error) { errorResponse(req, res, error); }
});
router.patch("/demo/profile", async (req, res) => {
  const input = UpdateDemoProfileBody.safeParse(req.body);
  if (!input.success || input.data.name.trim().length < 2) { res.status(400).json({ error: "invalid_profile" }); return; }
  try {
    await updateAccountName(req, input.data.name);
    const result = await userDashboard(req, res, { name: input.data.name });
    if (result) res.json(GetDemoDashboardResponse.parse(result));
  } catch (error) { errorResponse(req, res, error); }
});
export default router;