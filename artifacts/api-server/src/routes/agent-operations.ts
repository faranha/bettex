import {Router} from "express";
import {GetAgentCenterResponse} from "@workspace/api-zod";
import {agentDefinitions} from "../modules/agents/domain/operations";
import {readAgentCenter} from "../modules/agents/infrastructure/operations-store";
import { randomUUID } from "node:crypto";
import { CreateAgentReasoningBody, GetAgentReasoningQueryParams, GetAgentReasoningResponse, CreateAgentReasoningResponse } from "@workspace/api-zod";
import { reasonAgent } from "../modules/agents";
import { openaiReasoning } from "../modules/agents/infrastructure/openai-reasoning";
import { saveReasoning, reasoningHistory } from "../modules/agents/infrastructure/reasoning-store";
import { permittedOrigin } from "./test-accounts";
const router=Router();
const nextRequest = new Map<string, number>();
let inferenceBusy = false;
router.all("/agents/reasoning", async (req, res) => {
  res.set("Cache-Control", "no-store");
  if (process.env.NODE_ENV === "production") { res.status(403).json({ code: "development_only" }); return; }
  if (!["GET", "POST"].includes(req.method)) { res.sendStatus(405); return; }
  const parsed = req.method === "POST" ? CreateAgentReasoningBody.safeParse(req.body) : GetAgentReasoningQueryParams.safeParse(req.query);
  if (!parsed.success || !agentDefinitions.some(agent => agent.id === parsed.data.agentId)) { res.status(400).json({ code: "invalid_reasoning_request" }); return; }
  const { agentId, language } = parsed.data;
  if (req.method === "GET") {
    try { res.json(GetAgentReasoningResponse.parse({ reports: await reasoningHistory(agentId, language) })); }
    catch { res.status(503).json({ code: "reasoning_history_unavailable" }); }
    return;
  }
  if (!permittedOrigin(req) || !req.is("application/json")) { res.status(403).json({ code: "origin_not_allowed" }); return; }
  const now = Date.now(), key = req.ip ?? "unknown";
  for (const [ip, until] of nextRequest) if (until < now) nextRequest.delete(ip);
  if (inferenceBusy || (nextRequest.get(key) ?? 0) > now) { res.set("Retry-After", "30"); res.status(429).json({ code: "reasoning_busy" }); return; }
  nextRequest.set(key, now + 30000);
  inferenceBusy = true;
  try {
    const center = await readAgentCenter(agentId);
    const agent = center.agents.find(item => item.id === agentId)!;
    const report = await reasonAgent({
      agentId, language, sourceAt: center.asOf, rules: agent.rules, dependencies: agent.dependencies,
      run: agent.latest ? structuredClone(agent.latest) : null,
    }, openaiReasoning, `ai:${randomUUID()}`);
    const validated = CreateAgentReasoningResponse.parse(report);
    await saveReasoning(report);
    res.json(validated);
  } catch (error) {
    const status = (error as { status?: unknown })?.status;
    const failure = error instanceof Error && ["invalid_model_output", "invalid_model_evidence", "unsupported_model_recommendation", "missing_model_provenance", "inference_incomplete"].includes(error.message) ? error.message : "provider_or_storage_failure";
    req.log.warn({ code: "reasoning_inference_unavailable", failure, providerStatus: typeof status === "number" ? status : undefined }, "Real model inference failed; no deterministic substitute");
    res.status(503).json({ code: "reasoning_inference_unavailable" });
  } finally { inferenceBusy = false; }
});
router.get("/agents/center",async(req,res)=>{
  res.set("Cache-Control","no-store");
  const agentId=req.query.agentId,before=req.query.before;
  if(Object.keys(req.query).some(key=>!["agentId","before"].includes(key))||
    agentId!==undefined&&(typeof agentId!=="string"||!agentDefinitions.some(a=>a.id===agentId))||
    before!==undefined&&(typeof before!=="string"||!/^[0-9]{1,20}$/.test(before)||BigInt(before)>9223372036854775807n)){
    res.status(400).json({code:"invalid_agent_filter"});return;
  }
  try{res.json(GetAgentCenterResponse.parse(await readAgentCenter(agentId as string|undefined,before as string|undefined)));}
  catch{req.log.warn({code:"agent_center_unavailable"},"Agent operation evidence unavailable; no synthetic activity");
    res.status(503).json({code:"agent_center_unavailable"});}
});
export default router;
