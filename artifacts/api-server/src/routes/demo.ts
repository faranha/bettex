import { Router, type Request, type Response } from "express";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { CreateDemoMovementBody, UpdateDemoProfileBody, GetDemoDashboardResponse } from "@workspace/api-zod";
import { loadDashboard, ClaimedBrowserAccountError } from "../lib/demo-store";
import { verifiedAccount, updateAccountName } from "../lib/account-identity";
import { DemoInputError } from "../lib/demo-state";
import { historyPage } from "../modules/audit/infrastructure/history-store";
import { PreviewHistoryDistributionBody } from "@workspace/api-zod";
import { historyQuery } from "../modules/audit/transport/history-filters";
import { canReadTreasuryHistory } from "../modules/accounts/infrastructure/history-permission";
import { CommandSimulationBody, GetSimulationResponse } from "@workspace/api-zod";
import { simulationSnapshot, mutateSimulation } from "../modules/simulation/infrastructure/scenario-store";
import { permittedOrigin } from "./test-accounts";

const router = Router();
const cookieName = "bettex_demo";
const requests = new Map<string, { count: number; reset: number }>();
router.use("/demo", (req, res, next) => {
  if(process.env.NODE_ENV==="production"){
    res.status(403).json({error:"app_in_development"});return;
  }
  if (req.method !== "GET" && req.headers["sec-fetch-site"] === "cross-site") {
    res.status(403).json({ error: "invalid_movement" }); return;
  }
  const now = Date.now();
  // Background polling must not consume the budget for account mutations.
  const read = req.method === "GET";
  const key = `${read ? "read" : "write"}:${req.ip ?? req.socket.remoteAddress ?? "unknown"}`;
  if (requests.size > 5000) for (const [id, entry] of requests) if (entry.reset < now) requests.delete(id);
  const entry = requests.get(key);
  if (entry && entry.reset > now) {
    if (++entry.count > (read ? 300 : 90)) {
      res.set("Retry-After", String(Math.max(1, Math.ceil((entry.reset - now) / 1000))));
      res.status(429).json({ error: "rate_limited" }); return;
    }
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
  res.locals.nativeHistorySubject = user?.nativeAccountId ? `native:${user.nativeAccountId}` : undefined;
  res.locals.nativeAccountId = user?.nativeAccountId;
  const browserId = accountId(req, res);
  res.locals.demoBrowserId = browserId;
  try {
    const result = await loadDashboard({ browserId, ...user }, command, id => { res.locals.demoHistorySubject = `demo:${id}`; });
    if (result) result.profile.canViewTreasuryHistory = !!user?.nativeAccountId && await canReadTreasuryHistory(user.nativeAccountId);
    return result;
  } catch (error) {
    if (!(error instanceof ClaimedBrowserAccountError)) throw error;
    const freshId = accountId(req, res, true);
    res.locals.demoBrowserId = freshId;
    if (command) {
      res.status(403).json({ error: "authentication_required" });
      return undefined;
    }
    return loadDashboard({ browserId: freshId }, undefined, id => { res.locals.demoHistorySubject = `demo:${id}`; });
  }
}
function errorResponse(req: Request, res: Response, error: unknown) {
  if (error instanceof DemoInputError) { res.status(400).json({ error: error.message }); return; }
  if (error instanceof Error && ["email_verification_required", "account_unavailable"].includes(error.message)) {
    res.status(403).json({ error: error.message }); return;
  }
   req.log.error({ code: "engine_unavailable" }, "Demo request failed");
  res.status(503).json({ error: "engine_unavailable" });
}
router.get("/demo/dashboard", async (req, res) => {
  try {
    res.json(GetDemoDashboardResponse.parse(await userDashboard(req, res)));
  } catch (error) { errorResponse(req, res, error); }
});
// This namespace only runs the pure emulated scenario engine. It grants no native account rights.
router.all("/demo/simulation", async (req, res) => {
  res.set("Cache-Control", "private, no-store");
  try {
    if (!["GET", "POST"].includes(req.method)) { res.sendStatus(405); return; }
    await userDashboard(req, res);
    if (!res.locals.demoHistorySubject) { res.status(403).json({ code: "session_unavailable" }); return; }
    const owner = `browser-simulation:${res.locals.demoHistorySubject}`;
    const csrf = createHash("sha256").update(`simulation-csrf:${res.locals.demoBrowserId}`).digest("hex");
    let id = typeof req.query.runId === "string" ? req.query.runId : undefined;
    if (req.method === "POST") {
      if (!permittedOrigin(req) || !req.is("application/json")) { res.status(403).json({ code: "origin_not_allowed" }); return; }
      const parsed = CommandSimulationBody.safeParse(req.body);
      if (!parsed.success) { res.status(400).json({ code: "invalid_simulation_command" }); return; }
      const a = Buffer.from(parsed.data.csrf), b = Buffer.from(csrf);
      if (a.length !== b.length || !timingSafeEqual(a, b)) { res.status(403).json({ code: "csrf_invalid" }); return; }
      const { csrf: unused, ...terms } = parsed.data;
      const hash = createHash("sha256").update(JSON.stringify(terms)).digest("hex");
      id = await mutateSimulation(owner, terms, hash, `sim:${randomUUID()}`);
    }
    const offset = Number(req.query.offset ?? 0);
    if (!Number.isSafeInteger(offset) || offset < 0 || offset > 1000000) { res.status(400).json({ code: "invalid_offset" }); return; }
    const state = await simulationSnapshot(owner, id, typeof req.query.kind === "string" ? req.query.kind : undefined, offset);
    res.json({ ...GetSimulationResponse.parse(state), run: state.run, csrf });
  } catch (error) {
    const code = error instanceof Error ? error.message : "simulation_unavailable";
    const known = ["simulation_not_found", "simulation_run_required", "simulation_revision_changed", "simulation_idempotency_conflict", "simulation_paused", "invalid_amount", "unknown_simulation_action"];
    res.status(code === "simulation_not_found" ? 404 : known.includes(code) ? 409 : 503).json({ code: known.includes(code) ? code : "simulation_unavailable" });
  }
});
router.get("/demo/history", async (req, res) => {
  try {
    const filters = historyQuery.safeParse(req.query);
    if (!filters.success) { res.status(400).json({ code: "invalid_filters" }); return; }
    await userDashboard(req, res);
    const admin = filters.data.view === "treasury";
    if (admin && (!res.locals.nativeAccountId || !await canReadTreasuryHistory(res.locals.nativeAccountId))) { res.status(403).json({ code: "permission_required" }); return; }
    res.json(await historyPage(res.locals.demoHistorySubject, { ...filters.data,
      from: filters.data.from?.toISOString(), to: filters.data.to?.toISOString() }, admin, res.locals.nativeHistorySubject));
  } catch (e) {
    if (e instanceof Error && ["invalid_cursor", "invalid_period"].includes(e.message)) { res.status(400).json({ code: "invalid_filters" }); return; }
    errorResponse(req, res, e);
  }
});
router.post("/demo/history/distribution-preview", async (req, res) => {
  if (process.env.NODE_ENV === "production") { res.status(403).json({ code: "test_environment_required" }); return; }
  const input = PreviewHistoryDistributionBody.safeParse(req.body);
  if (!input.success) { res.status(400).json({ code: "invalid_input" }); return; }
  try { await userDashboard(req, res, { distributionPreview: input.data.requestId }); res.json({ recorded: true }); }
  catch (e) { errorResponse(req, res, e); }
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