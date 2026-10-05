import {qualification,score,value,type Opportunity,type OpportunityRecord} from "../domain/opportunity";
import {predictionPolicy,type EffectivePolicy,type PolicyAsset} from "../../risk";
import {predictionProposal} from "./prediction-proposal";
// PostgreSQL JSONB reorders keys. Compare terms structurally, not by insertion order.
const canonical=(v:unknown):unknown=>Array.isArray(v)?v.map(canonical):
  v && typeof v==="object"?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,canonical(x)])):v;
export interface AlphaTransaction {
  list():Promise<OpportunityRecord[]>;
  find(id:string):Promise<OpportunityRecord|undefined>;
  save(record:OpportunityRecord):Promise<void>;
  event(record:OpportunityRecord):Promise<void>;
}
export interface AlphaPorts {
  atomic<T>(run:(tx:AlphaTransaction)=>Promise<T>):Promise<T>;
  now():number; allowFixtures?:boolean;
  resolvePolicy?(asset:PolicyAsset):Promise<EffectivePolicy|undefined>;
}
export function alphaHierarchy(ports:AlphaPorts) {
  const policyFor=async(asset:string)=>ports.allowFixtures?undefined:
    ports.resolvePolicy&&["btc","eth","sol"].includes(asset)?
      ports.resolvePolicy(asset as PolicyAsset):undefined;
  const step=async(tx:AlphaTransaction,r:OpportunityRecord,layer:OpportunityRecord["decisions"][number]["layer"],
    state:OpportunityRecord["state"],reason:string)=>{
    r.state=state;r.reason=reason;r.revision++;
    r.queueState=state==="qualified"?(reason==="strategy_and_evidence_validated"?"validated":"awaiting_decision"):state==="selected"?"selected":
      state==="rejected"?"rejected":state==="expired"?"expired":
      ["awaiting_authorization","allocation_authorized","allocation_uncertain","allocation_confirmed"].includes(state)?"forwarded_to_execution":"received";
    r.decisions.push({layer,reason,at:new Date(ports.now()).toISOString()});
    await tx.save(r);await tx.event(r);
  };
  return {
    async ingest(opportunities:Opportunity[]) {
      const current=new Map<string,EffectivePolicy|undefined>();
      for(const asset of new Set(opportunities.map(o=>o.specialist)))current.set(asset,await policyFor(asset));
      const analyzed=opportunities.map(source=>{
        const active=current.get(source.specialist);
        if(!active||ports.allowFixtures)return source;
        const short=active.reference.effectiveId.slice(0,12);
        return {...source,id:`${source.id}:${short}`,deduplicationKey:`${source.id}:${short}`,
          policyVersion:active.configuration.version,strategyVersion:active.configuration.strategyVersion,
          policyEffectiveId:active.reference.effectiveId,policyReference:active.reference};
      });
      return ports.atomic(async tx=>{
        const stored=await tx.list();
        for(const r of stored){
          if(["needs_update","qualified","selected","awaiting_authorization","allocation_authorized"].includes(r.state) &&
            Date.parse(r.opportunity.validUntil)<=ports.now())await step(tx,r,"market","expired","quote_expired_no_new_submission");
        }
        // Market-domain priority before forwarding. BETTEX still owns the global comparison/budget.
        const ordered=[...analyzed].sort((a,b)=>{
          const aq=qualification(a,ports.now(),ports.allowFixtures)==="qualified";
          const bq=qualification(b,ports.now(),ports.allowFixtures)==="qualified";
          if(aq && bq){const diff=score(b)-score(a);return diff>0n?1:diff<0n?-1:a.id.localeCompare(b.id);}
          return aq===bq?a.id.localeCompare(b.id):aq?-1:1;
        });
        for(const o of ordered){
          const previous=await tx.find(o.id);
          if(previous){
            const identity=(item:Opportunity)=>JSON.stringify(canonical({...item,
              policyReference:item.policyReference?{...item.policyReference,revision:undefined}:undefined,
              sources:item.sources.map(({collectedAt,...s})=>s)}));
            if(identity(previous.opportunity)!==identity(o))throw new Error("opportunity_identity_conflict");
            continue; // Never renew a quote or reproduce events using collection time.
          }
          const r:OpportunityRecord={opportunity:o,state:"needs_update",reason:"analysis_received",revision:0,
           correlationId:`alpha:${o.id}`,decisions:[],queueState:"received",
           strategyVersion:o.strategyVersion,attempts:0};
          await step(tx,r,"specialist","needs_update","analysis_forwarded_to_market");
          const effective=current.get(o.specialist);
          let reason=!ports.allowFixtures&&!effective?"valid_active_policy_required":qualification(o,ports.now(),ports.allowFixtures);
          // Legacy fixtures remain isolated to internal tests. Real proposals need one shared strategy.
          if(reason==="qualified" && !ports.allowFixtures && !predictionProposal(o,ports.now(),false,effective!.configuration))
            reason="strategy_or_model_not_validated";
          if(reason==="qualified"){
            await step(tx,r,"market","qualified","strategy_and_evidence_validated");
            r.priority=String(score(o));
          }
          await step(tx,r,"market",reason==="qualified"?"qualified":reason==="expired"?"expired":"needs_update",reason);
          if(reason!=="qualified")await step(tx,r,"BETTEX",r.state,"hold_capital_request_update");
          stored.push(r);
        }
        return stored;
      });
    },
    async decide(control:{paused:boolean;availableUnits:string;maxAllocationUnits:string;exposureVerified:boolean;
      propose(input:{id:string;units:string;reason:string}):Promise<unknown>}) {
      const plan=await ports.atomic(async tx=>{
        const records=await tx.list();
        const candidates=records.filter(r=>r.state==="qualified").sort((a,b)=>{
          const diff=score(b.opportunity)-score(a.opportunity);
          return diff>0n?1:diff<0n?-1:a.opportunity.id.localeCompare(b.opportunity.id);
        });
        let free=BigInt(control.availableUnits);
        const groups=new Set(records.filter(r=>["selected","awaiting_authorization","allocation_authorized",
          "allocation_uncertain","allocation_confirmed"].includes(r.state)).map(r=>value(r.opportunity.correlation)?.group));
        const results:OpportunityRecord[]=[];
        // Retry an interrupted hand-off with the identical financial ID/terms.
        const pending=records.filter(r=>r.state==="selected");
        for(const r of [...pending,...candidates]){
          const effective=await policyFor(r.opportunity.specialist);
          let reason=!ports.allowFixtures&&(!effective||r.opportunity.policyEffectiveId!==effective.reference.effectiveId)?
            "policy_or_strategy_changed":qualification(r.opportunity,ports.now(),ports.allowFixtures);
          if(reason==="qualified"&&!ports.allowFixtures&&!predictionProposal(r.opportunity,ports.now(),false,effective!.configuration))
            reason="strategy_or_model_not_validated";
          const n=value(r.opportunity.capitalUnits);
          const c=value(r.opportunity.correlation);
          if(reason==="qualified"){
            if(control.paused)reason="operations_paused";
            else if(!control.exposureVerified)reason="external_exposure_unreconciled";
            else if(!n || BigInt(n)>BigInt(control.maxAllocationUnits))reason="allocation_limit";
            else if(BigInt(n)>free)reason="insufficient_available_resources";
            else if(r.state!=="selected" && (groups.has(c?.group) || BigInt(c!.existingExposureUnits)>0n))reason="correlated_exposure";
          }
          if(reason!=="qualified"){
            await step(tx,r,"BETTEX",reason==="expired"?"expired":"rejected",reason);results.push(r);continue;
          }
          r.allocationUnits=n!;r.governanceProposalId=`alpha:${r.opportunity.id}`;
          if(r.state!=="selected")await step(tx,r,"BETTEX","selected","net_cost_risk_horizon_liquidity_comparison");
          free-=BigInt(n!);groups.add(c!.group);results.push(r);
        }
        return {decisions:results,heldCapitalUnits:String(free)};
      });
      // Commit the decision before entering risk's independent transaction.
      // A crash on either side is recovered using the same immutable key/terms.
      for(const planned of plan.decisions.filter(r=>r.state==="selected")){
        const r=await ports.atomic(tx=>tx.find(planned.opportunity.id));
        if(!r || r.state!=="selected")continue;
        const validity=qualification(r.opportunity,ports.now(),ports.allowFixtures);
        if(validity!=="qualified"){
          await ports.atomic(async tx=>{const latest=await tx.find(r.opportunity.id);
            if(latest?.state==="selected")await step(tx,latest,"BETTEX","expired","opportunity_expired");});
          continue;
        }
        await control.propose({id:r.governanceProposalId!,units:r.allocationUnits!,
          reason:`BETTEX selection ${r.opportunity.id}; ${r.correlationId}; model ${value(r.opportunity.model)!.version}`});
        await ports.atomic(async tx=>{
          const latest=await tx.find(r.opportunity.id);
          if(latest?.state==="selected")await step(tx,latest,"risk","awaiting_authorization","financial_proposal_not_authorization");
        });
      }
      const decisions=await ports.atomic(async tx=>{
        const output:OpportunityRecord[]=[];
        for(const r of plan.decisions){const latest=await tx.find(r.opportunity.id);if(latest)output.push(latest);}
        return output;
      });
      const selected=decisions.filter(r=>r.state==="awaiting_authorization");
      return {...plan,decisions,selected,reason:selected.length?"proposals_forwarded":"hold_capital"};
    },
  };
}
/** Before financial authorization/submission; never treat expired cached selection as permission. */
export function assertAlphaReady(r:OpportunityRecord|undefined,now:number,allowFixtures=false) {
  if(!r || r.governanceProposalId!==`alpha:${r.opportunity.id}` || !r.allocationUnits || !r.decisions.some(d=>d.layer==="BETTEX" &&
    d.reason==="net_cost_risk_horizon_liquidity_comparison") || ["rejected","expired","needs_update"].includes(r.state))throw new Error("invalid_agent_decision");
  const reason=qualification(r.opportunity,now,allowFixtures);
  if(reason!=="qualified")throw new Error(reason==="expired"?"opportunity_expired":"invalid_agent_decision");
  if(!allowFixtures && !predictionProposal(r.opportunity,now))throw new Error("strategy_or_model_not_validated");
  if(r.allocationUnits!==value(r.opportunity.capitalUnits))throw new Error("invalid_agent_decision");
}
