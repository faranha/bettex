import {Router} from "express";
import {GetAgentCenterResponse} from "@workspace/api-zod";
import {agentDefinitions} from "../modules/agents/domain/operations";
import {readAgentCenter} from "../modules/agents/infrastructure/operations-store";
const router=Router();
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
