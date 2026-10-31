import {Router} from "express";
import {GetAlphaAgentsResponse} from "@workspace/api-zod";
import {alphaAgents} from "../modules/agents";
import {alphaRecords} from "./alpha-runtime";
const router=Router();
router.get("/agents/alpha",async(req,res)=>{
  res.set("Cache-Control","no-store");
  try{
    const source=await alphaRecords.source();
    res.json(GetAlphaAgentsResponse.parse({
      orchestrator:{id:"bettex",name:"BETTEX",mode:"observation_only_no_external_execution"},
      agents:alphaAgents,source:source??{status:"not_collected",attemptedAt:"",opportunityCount:0},
      opportunities:await alphaRecords.list(),
    }));
  }catch{
    req.log.warn({code:"alpha_store_unavailable"},"Alpha observation unavailable; no mock fallback");
    res.status(503).json({code:"alpha_store_unavailable"});
  }
});
export default router;
