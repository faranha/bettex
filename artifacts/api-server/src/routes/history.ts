import { Router } from "express";
import { historyQuery } from "../modules/audit/transport/history-filters";
import { token, testAccountsEnabled } from "./test-accounts";
import { accountsStore, ensureAccountsSchema } from "../modules/accounts/infrastructure/store";
import { canReadTreasuryHistory } from "../modules/accounts/infrastructure/history-permission";
import { ensureHistorySchema, historyPage, historyTransparency } from "../modules/audit/infrastructure/history-store";
import { refreshNativeHistory } from "./native-history-runtime";
const router = Router();
router.get("/history/transparency", async (_req, res) => {
  res.set("Cache-Control", "no-store");
  try { await ensureHistorySchema(); res.json(await historyTransparency()); }
  catch { res.status(503).json({ code: "history_unavailable" }); }
});
router.get(["/account/history", "/account/history/admin", "/test-account/history", "/test-account/history/admin"], async (req, res) => {
  res.set("Cache-Control", "no-store, private");
  try {
    if (!testAccountsEnabled()) { res.status(403).json({ code: "test_environment_required" }); return; }
    await Promise.all([ensureAccountsSchema(), ensureHistorySchema()]);
    const session = await accountsStore().session(token(req));
    if (!session) { res.status(401).json({ code: "session_required" }); return; }
    const filters = historyQuery.safeParse(req.query);
    if (!filters.success) { res.status(400).json({ code: "invalid_filters" }); return; }
    const admin = req.path.endsWith("/admin") || filters.data.view === "treasury";
    if (admin && !await canReadTreasuryHistory(session.accountId)) { res.status(403).json({ code: "permission_required" }); return; }
    let syncState = "current";
    try { await refreshNativeHistory(session.accountId); }
    catch { syncState = "unavailable"; req.log.warn({ code: "history_sync_unavailable" }, "Serving persisted history without inferring new confirmations"); }
    res.json({ ...await historyPage(`native:${session.accountId}`, { ...filters.data,
       from: filters.data.from?.toISOString(), to: filters.data.to?.toISOString() }, admin, `demo:native:${session.accountId}`),
      syncState, ...(syncState === "unavailable" ? { warning: "sync_unavailable" } : {}) });
  } catch (e) {
    const invalid = e instanceof Error && ["invalid_cursor", "invalid_period"].includes(e.message);
    res.status(invalid ? 400 : 503).json({ code: invalid ? "invalid_filters" : "history_unavailable" });
  }
});
export default router;
