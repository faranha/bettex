import { allocationReason, availableUnits, exactUnits, policyValid, treasuryPermissions,
  type TreasuryActor, type TreasuryPermission, type TreasuryPolicy, type TreasuryProposal, type TreasuryResources } from "../domain/governance";
export type GovernanceCommand = {
  action: "propose" | "approve" | "reject" | "execute" | "pause" | "resume";
  id: string; reason: string; kind?: TreasuryProposal["kind"]; units?: string; destination?: string;
  policy?: TreasuryProposal["policy"]; permission?: TreasuryProposal["permission"];
};
export interface TreasuryTransaction {
  permissions(id: string): Promise<string[]>;
  policy(): Promise<TreasuryPolicy>;
  setPolicy(p: TreasuryPolicy): Promise<void>;
  proposal(id: string): Promise<TreasuryProposal | undefined>;
  proposals(): Promise<TreasuryProposal[]>;
  save(p: TreasuryProposal): Promise<void>;
  resources(except?: string): Promise<TreasuryResources>;
  reserve(p: TreasuryProposal, day: number): Promise<void>;
  release(id: string): Promise<void>;
  spent(id: string, day: number): Promise<void>;
  changePermission(change: NonNullable<TreasuryProposal["permission"]>): Promise<void>;
  event(actor: TreasuryActor, id: string, state: string, version: number, reason: string, hash?: string): Promise<void>;
  execute(p: TreasuryProposal, submit: boolean): Promise<{ confirmed: boolean; state: string; hash?: string; confirmedDay?: number }>;
  started(id: string): Promise<boolean>;
}
export type TreasuryPorts = { atomic<T>(run: (tx: TreasuryTransaction)=>Promise<T>): Promise<T> };
const checkHuman=(actor:TreasuryActor)=>{ if(actor.type!=="human")throw new Error("human_authority_required"); };
async function requirePermission(tx:TreasuryTransaction, actor:TreasuryActor, permission:TreasuryPermission) {
  checkHuman(actor); if(!(await tx.permissions(actor.id)).includes(permission))throw new Error("permission_required");
}
export function treasuryGovernance(ports:TreasuryPorts) {
  return {
    async observe(actor:TreasuryActor) {
      return ports.atomic(async tx=>{
        if(actor.type!=="agent")await requirePermission(tx,actor,"treasury_view");
        const policy=await tx.policy(), resources=await tx.resources();
        return {policy,resources,availableUnits:availableUnits(resources,policy),realizedProfitUnits:null,
          resultStatus:"no_external_realized_result_evidence",proposals:await tx.proposals()};
      });
    },
    async command(actor:TreasuryActor, c:GovernanceCommand) {
      return ports.atomic(async tx=>{
        const required = c.action==="propose" ? c.kind==="allocation" ? "treasury_propose" : "treasury_policy"
          : c.action==="pause" ? "treasury_pause" : c.action==="resume" ? "treasury_activate"
          : c.action==="execute" ? "treasury_execute" : "treasury_approve";
        if(actor.type==="agent"){
          if(c.action!=="propose" || c.kind!=="allocation")throw new Error("agent_proposal_only");
         }else if(c.action==="execute")checkHuman(actor);
         else await requirePermission(tx,actor,required);
        let policy=await tx.policy();
        if(c.action==="pause" || c.action==="resume"){
          policy={...policy,paused:c.action==="pause"};
          await tx.setPolicy(policy);await tx.event(actor,c.id,c.action,policy.version,c.reason);
          return {policy};
        }
        let p=await tx.proposal(c.id);
        if(c.action==="propose"){
          if(!c.kind || !c.reason.trim())throw new Error("invalid_proposal");
          const candidate:TreasuryProposal={id:c.id,kind:c.kind,proposer:actor,reason:c.reason,version:policy.version,state:"proposed",
            ...(c.kind==="allocation"?{units:c.units,destination:c.destination?.toLowerCase()}:
              c.kind==="policy"?{policy:c.policy}:{permission:c.permission})};
          if(candidate.kind==="allocation" && (!exactUnits(candidate.units)||!candidate.destination))throw new Error("invalid_proposal");
          if(candidate.kind==="policy" && (!candidate.policy||!policyValid(candidate.policy)))throw new Error("invalid_policy");
          if(candidate.kind==="permission" && (!candidate.permission||!treasuryPermissions.includes(candidate.permission.permission)))throw new Error("invalid_permission");
          if(p){
            if(p.proposer.id!==actor.id || p.kind!==candidate.kind || p.reason!==candidate.reason
              || JSON.stringify([p.units,p.destination,p.policy,p.permission])!==JSON.stringify([candidate.units,candidate.destination,candidate.policy,candidate.permission]))
              throw new Error("proposal_conflict");
            return {proposal:p};
          }
          await tx.save(candidate);await tx.event(actor,c.id,"proposed",policy.version,c.reason);
          return {proposal:candidate};
        }
        if(!p)throw new Error("proposal_not_found");
         if(c.action==="execute")await requirePermission(tx,actor,p.kind==="allocation"?"treasury_execute":"treasury_activate");
        if(c.action==="approve" || c.action==="reject"){
          checkHuman(actor);
          if(p.kind!=="allocation")await requirePermission(tx,actor,"treasury_policy");
          if(p.proposer.id===actor.id)throw new Error("self_approval_forbidden");
          if(["confirmed","executing","uncertain","rejected"].includes(p.state))throw new Error("invalid_transition");
          if(await tx.started(p.id))throw new Error("execution_already_started");
          const resources=await tx.resources(p.id);
          const candidate={...p,version:policy.version};
           const reason=c.action==="reject"?"administrative_rejection":p.kind==="allocation"?allocationReason(candidate,policy,resources):
             p.kind==="policy"&&p.policy?.destinations.some(d=>resources.blockedDestinations?.includes(d.toLowerCase()))?"destination_not_authorized":"allowed";
          await tx.event(actor,p.id,"validated",policy.version,reason);
          p={...candidate,state:reason==="allowed"?"approved":"rejected",approver:actor.id,result:reason};
          if(p.state==="approved" && p.kind==="allocation")await tx.reserve(p,Math.floor(resources.timestamp/86400));
          else await tx.release(p.id);
          await tx.save(p);await tx.event(actor,p.id,p.state,policy.version,`${reason}: ${c.reason}`);
          return {proposal:p};
        }
         if(p.state==="confirmed" || p.state==="rejected"){
           if(p.kind==="allocation" && p.state==="confirmed"){
             const result=await tx.execute(p,false);
             if(!result.confirmed || result.hash!==p.hash || !Number.isSafeInteger(result.confirmedDay))
               throw new Error("allocation_reconciliation_required");
             await tx.spent(p.id,result.confirmedDay!);
           }
           return {proposal:p};
         }
        if(!["approved","executing","uncertain"].includes(p.state)||!p.approver)throw new Error("approval_required");
        checkHuman(actor);
        const alreadyStarted=p.kind==="allocation" && await tx.started(p.id);
        const approverPermissions=await tx.permissions(p.approver);
        if(!alreadyStarted && !approverPermissions.includes(p.kind==="allocation"?"treasury_approve":"treasury_policy"))throw new Error("approver_permission_revoked");
        if(p.kind!=="allocation"){
          await requirePermission(tx,actor,"treasury_activate");
          if(p.version!==policy.version)throw new Error("policy_version_changed");
          if(p.kind==="policy") {
            if(!p.policy || !policyValid(p.policy))throw new Error("invalid_policy");
            policy={...p.policy,version:policy.version+1,paused:policy.paused};
          } else {
            await tx.changePermission(p.permission!);policy={...policy,version:policy.version+1};
          }
          await tx.setPolicy(policy);p={...p,state:"confirmed",result:"activated"};
        }else{
          const started=alreadyStarted;
          const resources=await tx.resources(p.id);
          // Even paused/revoked/version-changed execution may only reconcile an already armed transaction.
          const reason=allocationReason(p,policy,resources);
          if(!started && reason!=="allowed")throw new Error(reason);
          await tx.event(actor,p.id,"execution_validated",policy.version,started?"reconciliation_only":reason);
          const result=await tx.execute(p,!started && reason==="allowed");
          p={...p,state:result.confirmed?"confirmed":result.state==="failed"?"rejected":"uncertain",result:result.state,hash:result.hash};
          if(result.confirmed){
            if(!Number.isSafeInteger(result.confirmedDay))throw new Error("confirmation_evidence_required");
            await tx.spent(p.id,result.confirmedDay!);
          }
          if(result.state==="failed")await tx.release(p.id);
        }
        await tx.save(p);await tx.event(actor,p.id,p.state,policy.version,p.result??"unknown",p.hash);
        return {proposal:p,policy};
      });
    },
  };
}
