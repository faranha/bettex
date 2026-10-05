import {Router} from "express";
import {createHash,randomUUID,timingSafeEqual} from "node:crypto";
import {CommandSimulationBody,GetSimulationResponse as Snapshot} from "@workspace/api-zod";
import {accountsStore,ensureAccountsSchema,limitAuthAttempts} from "../modules/accounts/infrastructure/store";
import {testAccountsEnabled,permittedOrigin,token} from "./test-accounts";
import {simulationSnapshot,mutateSimulation} from "../modules/simulation/infrastructure/scenario-store";
const router=Router();
router.all("/simulation",async(req,res)=>{
  res.set("Cache-Control","private, no-store");
  try{
    if(!["GET","POST"].includes(req.method)){res.status(405).json({code:"method_not_allowed"});return;}
    if(!testAccountsEnabled()){res.status(403).json({code:"test_environment_required"});return;}
    await ensureAccountsSchema();const session=await accountsStore().session(token(req));
    if(!session){res.status(401).json({code:"session_required"});return;}
    let id=typeof req.query.runId==="string"?req.query.runId:undefined;
    if(req.method==="POST"){
      if(!permittedOrigin(req)||!req.is("application/json")){res.status(403).json({code:"origin_not_allowed"});return;}
      const parsed=CommandSimulationBody.safeParse(req.body);
      if(!parsed.success){res.status(400).json({code:"invalid_simulation_command"});return;}
      const input=parsed.data,a=Buffer.from(input.csrf),b=Buffer.from(session.csrf);
      if(a.length!==b.length||!timingSafeEqual(a,b)){res.status(403).json({code:"csrf_invalid"});return;}
      await limitAuthAttempts(`simulation:${session.accountId}`,240);
      const {csrf,...terms}=input;
      const contentHash=createHash("sha256").update(JSON.stringify(terms)).digest("hex");
      id=await mutateSimulation(session.accountId,terms,contentHash,`sim:${randomUUID()}`);
    }
    const offset=Number(req.query.offset??0);
    if(!Number.isSafeInteger(offset)||offset<0||offset>1000000){res.status(400).json({code:"invalid_offset"});return;}
    const kind=typeof req.query.kind==="string"?req.query.kind:undefined;
    const state=await simulationSnapshot(session.accountId,id,kind,offset);
    const validated=Snapshot.parse(state);
    // Orval's generated validator strips additionalProperties from SimulationRun.
    // Keep the server-owned journal intact after validating its public envelope.
    res.json({...validated,run:state.run});
  }catch(e){
    const code=e instanceof Error?e.message:"simulation_unavailable";
    const known=["simulation_not_found","simulation_run_required","simulation_revision_changed","simulation_idempotency_conflict",
      "simulation_paused","invalid_amount","unknown_simulation_action"];
    res.status(code==="simulation_not_found"?404:known.includes(code)?409:503).json({code:known.includes(code)?code:"simulation_unavailable"});
  }
});
export default router;
