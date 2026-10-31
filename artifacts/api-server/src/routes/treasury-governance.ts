/** HTTP/composition only. Financial rules, custody, ledger and persistence stay in their domains. */
import {Router} from "express";
import {db} from "@workspace/db";
import {sql} from "drizzle-orm";
import {randomUUID,timingSafeEqual} from "node:crypto";
import {keccak256,toUtf8Bytes,Contract} from "ethers";
import {CommandTreasuryGovernanceBody,GetTestContractResponse} from "@workspace/api-zod";
import {testAccountsEnabled,token,permittedOrigin} from "./test-accounts";
import {accountsStore,ensureAccountsSchema,limitAuthAttempts} from "../modules/accounts/infrastructure/store";
import {canReadTreasuryHistory} from "../modules/accounts/infrastructure/history-permission";
import {treasuryIdentity} from "../modules/accounts/infrastructure/treasury-permissions";
import {treasuryGovernance,type TreasuryActor,type GovernanceCommand} from "../modules/risk";
import {governanceStore,ensureGovernanceStore} from "../modules/risk/infrastructure/governance-store";
import {assertAlphaReady} from "../modules/agents";
import {alphaRecords,alphaPipeline,alphaBtcSource,projectAlphaAllocation} from "./alpha-runtime";
import {withTreasuryLock,treasuryReservations,ensureTreasuryReservations} from "../modules/ledger/infrastructure/treasury-reservations";
import {localRoundStore} from "../modules/ledger/infrastructure/local-round-store";
import {chainJournal} from "../modules/ledger/infrastructure/chain-journal";
import {journeyChain} from "../modules/wallets/infrastructure/journey-chain";
import {journeyStore} from "../modules/execution/infrastructure/journey-store";
import {nativeJourney} from "../modules/execution";
import {createTestContractReader} from "../modules/reconciliation/infrastructure/chain-reader";
import {appendHistory,ensureHistorySchema} from "../modules/audit/infrastructure/history-store";
import {treasuryResources} from "./treasury-resources";
const router=Router(),hash=(s:string)=>keccak256(toUtf8Bytes(s));
const flow=nativeJourney({store:journeyStore,chain:journeyChain,executorId:randomUUID(),hashId:hash,
  verifyEffects:(stage,receipt,meta,op)=>journeyChain.verifyEffects(stage.name,receipt.hash,meta,stage.draft as Record<string,string|number>,op)});
let ready:Promise<unknown>|undefined;
const initialize=()=>ready??=ensureAccountsSchema().then(ensureHistorySchema).then(()=>canReadTreasuryHistory("no-actor"))
  .then(()=>Promise.all([ensureGovernanceStore(),ensureTreasuryReservations(),localRoundStore.initialize(),
    chainJournal.initialize(),journeyStore.initialize()])).catch(e=>{ready=undefined;throw e;});
router.all("/treasury/governance",async(req,res)=>{
  res.set("Cache-Control","no-store, private");
  let auditActor:string|undefined,auditEpoch:string|undefined,auditProposal:string|undefined;
  try{
    if(!["GET","POST"].includes(req.method)){res.status(405).json({code:"method_not_allowed"});return;}
    if(!testAccountsEnabled()){res.status(403).json({code:"test_environment_required"});return;}
    await initialize();
    const session=await accountsStore().session(token(req));
    if(!session){res.status(401).json({code:"session_required"});return;}
    auditActor=session.accountId;
    if(!(await treasuryIdentity(db).permissions(session.accountId)).some(p=>p.startsWith("treasury_")&&p!=="treasury_history")){
      res.status(403).json({code:"permission_required"});return;
    }
    let body;
    if(req.method==="POST"){
      if(!permittedOrigin(req)||!req.is("application/json")){res.status(403).json({code:"origin_not_allowed"});return;}
      const parsed=CommandTreasuryGovernanceBody.strict().safeParse(req.body);
      if(!parsed.success){res.status(400).json({code:"invalid_command"});return;}
      body=parsed.data;
      auditProposal=body.id;
      const actual=Buffer.from(body.csrf),expected=Buffer.from(session.csrf);
      if(actual.length!==expected.length||!timingSafeEqual(actual,expected)){res.status(403).json({code:"session_required"});return;}
      await limitAuthAttempts(`treasury:${session.accountId}`,80);
    }
    const meta=await journeyChain.metadata();
    auditEpoch=meta.epoch;
    const source=GetTestContractResponse.parse((await createTestContractReader(journeyChain.provider,31337).read(meta.token)).state);
    if(source.treasury?.toLowerCase()!==meta.treasury.toLowerCase() || source.operatingWallet?.toLowerCase()!==meta.operating.toLowerCase()
      || source.allocations.find(a=>a.kind==="public")?.address.toLowerCase()!==meta.sale.toLowerCase())
      throw new Error("invalid_source");
    // Bind the only spendable asset to the attested sale's immutable quote asset.
    const sale=new Contract(meta.sale,["function usdc() view returns (address)"],journeyChain.provider);
    if(String(await sale.getFunction("usdc")()).toLowerCase()!==meta.usdc.toLowerCase())throw new Error("invalid_source");
    const nodeAccounts=await journeyChain.provider.send("eth_accounts",[]) as string[];
    const destination=nodeAccounts[7];
    if(!destination)throw new Error("invalid_source");
    const actor:TreasuryActor={id:session.accountId,type:"human"};
    const service=treasuryGovernance({atomic:run=>withTreasuryLock(meta.epoch,async client=>{
      const store=governanceStore(client,meta.epoch,meta.usdc,meta.treasury,destination);
      const ledger=treasuryReservations(client,meta.epoch),identity=treasuryIdentity(client);
      const operationId=(id:string)=>hash(`governance:${meta.epoch}:${id}`);
      return run({
        ...store,
        policy:async()=>{
          const exists=(await client.execute(sql`SELECT 1 FROM treasury_governance_control WHERE epoch=${meta.epoch}`)).rows.length;
          if(!exists && !(await identity.permissions(actor.id)).includes("treasury_policy"))throw new Error("governance_initialization_required");
          return store.policy();
        },
        permissions:identity.permissions,changePermission:identity.change,
        resources:except=>treasuryResources(client,meta,except),
        reserve:(p,day)=>ledger.reserve(p.id,p.units!,day),spent:ledger.spent,
        release:async id=>{
          const stage=await journeyStore.stage(operationId(id),"distribution");
          if(stage?.state==="requested"){
            const higher=(await client.execute(sql`SELECT 1 FROM test_journey_stages WHERE epoch=${meta.epoch}
              AND lower(sender)=lower(${stage.sender}) AND nonce>${stage.nonce} LIMIT 1`)).rows;
            if(higher.length)throw new Error("execution_already_started");
            await journeyStore.cancelUnsentDistribution(stage.id);
          }
          await ledger.release(id);
        },
        started:async id=>{const stage=await journeyStore.stage(operationId(id),"distribution");return !!stage&&stage.state!=="requested";},
        execute:async(p,submit)=>{
          const previous=await journeyStore.stage(operationId(p.id),"distribution");
          if(p.id.startsWith("alpha:") && submit && (!previous || previous.state==="requested")){
            const r=await alphaRecords.record(p.id.slice(6));assertAlphaReady(r,Date.now());
            if(r!.allocationUnits!==p.units)throw new Error("invalid_agent_decision");
            await alphaBtcSource.verifyCurrent(r!.opportunity);
            assertAlphaReady(r,Date.now());
          }
          const r=await flow.transferTest("treasury-governance-system",meta,operationId(p.id),meta.treasury,p.destination!,p.units!,submit);
          let confirmedDay:number|undefined;
          if(r.confirmed && r.stage?.transactionHash){
            const receipt=await journeyChain.receipt(r.stage.transactionHash);
            const block=receipt && await journeyChain.provider.getBlock(receipt.blockNumber);
            if(!block || !receipt || block.hash!==receipt.blockHash)throw new Error("confirmation_evidence_required");
            confirmedDay=Math.floor(block.timestamp/86400);
          }
          return {confirmed:r.confirmed,state:r.stage?.state??"not_sent",hash:r.stage?.transactionHash??undefined,confirmedDay};
        },
        event:async(who,id,state,version,reason,transactionHash)=>{
          await appendHistory({key:`gov:${meta.epoch}:${id}:${state}:${version}:${who.id}`,
            subject:"treasury:local",visibility:"admin",correlationId:`governance:${meta.epoch}:${id}`,
            category:"automatic",kind:`treasury_governance_${state}`,state:state.includes("validated")?"calculated":["approved","pause","resume"].includes(state)?"authorized":
              ["confirmed"].includes(state)?"confirmed":state==="proposed"?"requested":state,
            actor:who.type==="agent"?"agent":"admin",environment:"local_evm",chainId:31337,epoch:meta.epoch,
            source:"treasury_governance",transactionHash,
            data:{actorId:who.id,ruleVersion:String(version),reason}},client);
        },
      });
    })});
    if(!body){res.json({environment:"local_evm",epoch:meta.epoch,chainId:31337,...await service.observe(actor)});return;}
    if(body.action==="analyze"){
      const snapshot=await service.observe(actor);
      // External positions are not reconciled by the local treasury ledger. Do not assume zero.
      res.json(await alphaPipeline.decide({paused:snapshot.policy.paused,availableUnits:snapshot.availableUnits,
        maxAllocationUnits:snapshot.policy.maxAllocationUnits,exposureVerified:false,
        propose:p=>service.command({id:"bettex",type:"agent"},{action:"propose",kind:"allocation",...p,
          destination:snapshot.policy.destinations[0]})}));return;
    }
    if(body.id.startsWith("alpha:")){
      if(body.action==="propose")throw new Error("invalid_agent_decision");
      if(body.action==="approve"){
        const r=await alphaRecords.record(body.id.slice(6));assertAlphaReady(r,Date.now());
        await alphaBtcSource.verifyCurrent(r!.opportunity);
        assertAlphaReady(r,Date.now());
      }
    }
    const result=await service.command(actor,{...body} as GovernanceCommand);
    if("proposal" in result && result.proposal)await projectAlphaAllocation(body.id,result.proposal.state,result.proposal.hash);
    res.json(result);
  }catch(e){
    const code=e instanceof Error?e.message:"treasury_unavailable";
    const denied=["permission_required","human_authority_required","agent_proposal_only","self_approval_forbidden",
      "approver_permission_revoked"];
    const conflict=["operations_paused","approval_required","policy_version_changed","destination_not_authorized","allocation_limit",
      "daily_limit","insufficient_available_resources","execution_already_started","invalid_transition","proposal_conflict","reservation_conflict",
       "governance_initialization_required","opportunity_expired","opportunity_invalidated","invalid_agent_decision"];
    const invalid=["invalid_proposal","invalid_policy","invalid_permission","account_not_found","proposal_not_found"];
    const unavailable=["allocation_reconciliation_required","confirmation_evidence_required","ledger_mismatch","chain_reorganized",
      "block_unavailable","governance_source_changed","unverified_capital","invalid_source","wrong_network","reserve_unavailable"];
    const known=[...denied,...conflict,...invalid,...unavailable].includes(code);
    if(auditActor && auditEpoch && req.method==="POST")await appendHistory({
      key:`gov-attempt:${randomUUID()}`,subject:"treasury:local",visibility:"admin",
      correlationId:`governance:${auditEpoch}:${auditProposal??"invalid"}`,category:"automatic",kind:"treasury_governance_failed",
      state:"failed",actor:"admin",environment:"local_evm",chainId:31337,epoch:auditEpoch,source:"treasury_governance",
      data:{actorId:auditActor,reason:known?code:"treasury_unavailable"},
    }).catch(()=>req.log.warn({code:"governance_audit_unavailable"},"Governance failure could not be persisted"));
    req.log.warn({code:known?code:"treasury_unavailable"},"Treasury governance command failed closed");
    res.status(denied.includes(code)?403:conflict.includes(code)?409:invalid.includes(code)?400:503).json({code:known?code:"treasury_unavailable"});
  }
});
export default router;
