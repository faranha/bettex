import {predictionEntry,predictionPolicy,type PredictionPolicy,type PredictionExposure} from "../../risk";
import {availablePaperUnits,reservePaper,releasePaper,postPaper,type PaperLedger} from "../../ledger";
import {MICRO,ceilDiv,type PaperCandidate,type PaperQuote,type PaperDecision,type PaperOrder,
  type PaperPosition,type PaperEvent,type PaperValuation} from "../domain/paper-model";
export type PaperState={ledger:PaperLedger;decisions:PaperDecision[];orders:PaperOrder[];positions:PaperPosition[];events:PaperEvent[]};
export type PaperPorts={atomic<T>(run:(s:PaperState)=>Promise<T>):Promise<T>;now():number;
  reconcile(s:PaperState):string;allowFixtures?:boolean;policy?:PredictionPolicy;historical?:boolean};
export type PaperAuthorization={id:string;mode:"simulation_only";policyVersion:string;strategyVersion:string;expiresAt:string;
  approved:boolean;policyEffectiveId?:string};
const live=(o:PaperOrder)=>o.state==="pending"||o.state==="partial";
const open=(p:PaperPosition)=>p.state==="open"||p.state==="reducing";
const canonical=(v:unknown):unknown=>Array.isArray(v)?v.map(canonical):v&&typeof v==="object"?
  Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,canonical(x)])):v;
function exposures(s:PaperState,exclude=""):PredictionExposure[]{
  const byId=new Map(s.decisions.map(d=>[d.id,d]));
  const result:PredictionExposure[]=[];
  const push=(id:string,units:string)=>{
    const c=byId.get(id)?.candidate;if(!c||BigInt(units)===0n)return;
    result.push({asset:c.asset,eventId:c.eventId,strategyVersion:c.strategyVersion,counterparty:c.counterparty,
      correlationGroup:c.correlationGroup,units});
  };
  for(const p of s.positions.filter(open))push(p.decisionId,p.committedUnits);
  for(const [id,n] of Object.entries(s.ledger.reservations))if(id!==exclude)push(id,n);
  return result;
}
export function paperTrading(ports:PaperPorts){
  const policy=ports.policy??predictionPolicy,now=()=>ports.now(),date=()=>new Date(now()).toISOString();
  const event=(s:PaperState,id:string,stage:string,reason:string)=>{
    const sequence=(s.events.at(-1)?.sequence??0)+1;
    const decision=s.decisions.find(d=>d.opportunityId===id),original=decision?.policySnapshot;
    const differences=original?Object.keys(policy).flatMap(field=>{
      const key=field as keyof PredictionPolicy;
      return JSON.stringify(canonical(original[key]))===JSON.stringify(canonical(policy[key]))?[]:
        [{field,before:original[key]??null,after:policy[key]??null}];
    }):[];
    s.events.push({id:`paper:${sequence}`,opportunityId:id,at:date(),stage,reason,sequence,
      policyReference:decision?.policyReference,currentPolicyId:policy.effectiveId??"unavailable",differences});
  };
  const quoteValid=(q:PaperQuote,c:{instrumentId:string;direction:"buy"|"sell"})=>
    q.verified&&q.instrumentId===c.instrumentId&&q.side===c.direction&&
    /^[1-9]\d{0,39}$/.test(q.priceUnits)&&BigInt(q.priceUnits)<=MICRO&&
    /^(0|[1-9]\d{0,39})$/.test(q.availableSharesUnits)&&
    Number.isInteger(q.feesBps)&&q.feesBps>=0&&q.feesBps<=10000&&/^https:\/\//.test(q.source)&&
    Number.isFinite(Date.parse(q.producedAt))&&now()-Date.parse(q.producedAt)>=-5000&&
    now()-Date.parse(q.producedAt)<=policy.maxQuoteAgeSeconds*1000&&Date.parse(q.validUntil)>now();
  const authorized=(a:PaperAuthorization)=>a.approved&&a.id&&a.mode==="simulation_only"&&
    a.policyVersion===policy.version&&a.strategyVersion===policy.strategyVersion&&Date.parse(a.expiresAt)>now()&&
    (ports.allowFixtures||policy.published===true&&a.policyEffectiveId===policy.effectiveId);
  const cancel=(s:PaperState,o:PaperOrder,state:"cancelled"|"expired"|"failed",reason:string)=>{
    if(!live(o))return;
    o.state=state;o.reason=reason;o.updatedAt=date();o.reservedUnits="0";
    if(o.direction==="buy")releasePaper(s.ledger,o.decisionId);
    else {const p=s.positions.find(p=>p.id===o.positionId);if(p&&open(p)){p.state="open";p.exitState="triggered";}}
    event(s,o.opportunityId,"order",reason);
  };
  const sweep=(s:PaperState)=>{
    ports.reconcile(s);
    for(const o of s.orders.filter(live)){
      const scoped=ports.allowFixtures||policy.allowedAssets.includes(o.asset as "btc"|"eth"|"sol");
      if(Date.parse(o.validUntil)<=now())cancel(s,o,"expired","order_expired_reservation_released");
      else if(!ports.historical&&scoped&&o.direction==="buy"&&(policy.paused||o.policyVersion!==policy.version||o.strategyVersion!==policy.strategyVersion||
        !ports.allowFixtures&&o.policyReference?.effectiveId!==policy.effectiveId))
        cancel(s,o,"cancelled","policy_or_strategy_changed");
      else if((ports.allowFixtures||o.policyReference?.effectiveId===policy.effectiveId)&&
        o.attempts>=policy.maxAttempts)cancel(s,o,"cancelled","retry_limit_reservation_released");
    }
    for(const d of s.decisions.filter(d=>d.state==="selected"&&s.ledger.reservations[d.id]!==undefined)){
      if(!s.orders.some(o=>o.decisionId===d.id) && (Date.parse(d.candidate.validUntil)<=now()||
        !ports.historical&&(ports.allowFixtures||policy.allowedAssets.includes(d.asset as "btc"|"eth"|"sol"))&&
          (d.policyVersion!==policy.version||d.strategyVersion!==policy.strategyVersion||
            !ports.allowFixtures&&d.policyReference?.effectiveId!==policy.effectiveId))){
        releasePaper(s.ledger,d.id);event(s,d.opportunityId,"reservation","selection_expired_reservation_released");
      }
    }
  };
  return {
    async decide(candidates:PaperCandidate[]){
      return ports.atomic(async s=>{
        sweep(s);
        const ratio=(c:PaperCandidate)=>BigInt(c.expectedUnits)*10n**12n/
          (BigInt(c.lossUnits)+BigInt(c.upperBps-c.lowerBps)*BigInt(c.quantityUnits)/10000n+1n)/
          BigInt(Math.max(1,c.horizonSeconds));
        const ordered=[...candidates].sort((a,b)=>{
          const diff=ratio(b)-ratio(a);return diff>0n?1:diff<0n?-1:a.id.localeCompare(b.id);
        });
        const result:PaperDecision[]=[];
        for(const [rank,c] of ordered.entries()){
          const previous=s.decisions.find(d=>d.opportunityId===c.id);
          if(previous){
            if(JSON.stringify(canonical(previous.candidate))!==JSON.stringify(canonical(c)))throw new Error("opportunity_identity_conflict");
            result.push(previous);continue;
          }
          let reason=predictionEntry(c,{now:now(),availableUnits:String(availablePaperUnits(s.ledger)),
            exposure:exposures(s),allowFixtures:ports.allowFixtures},policy);
          if(s.ledger.status!=="reconciled")reason=s.ledger.status==="unfunded"?"paper_budget_not_authorized":"paper_ledger_divergence";
          const recent=s.positions.find(p=>!open(p)&&p.instrumentId===c.instrumentId&&p.closedAt&&
            now()-Date.parse(p.closedAt)<policy.reentryCooldownSeconds*1000);
          if(recent)reason="reentry_cooldown";
          const d:PaperDecision={id:`paper-decision:${c.id}`,opportunityId:c.id,asset:c.asset,
            state:reason==="qualified"?"selected":"rejected",reason:reason==="qualified"?"net_edge_uncertainty_liquidity_exposure_comparison":reason,
            at:date(),policyVersion:policy.version,strategyVersion:policy.strategyVersion,rank:rank+1,
            requestedUnits:c.capitalUnits,candidate:structuredClone(c),policyReference:c.policyReference,
            policySnapshot:structuredClone(policy)};
          s.decisions.push(d);result.push(d);
          if(d.state==="selected")reservePaper(s.ledger,d.id,c.capitalUnits);
          event(s,c.id,"decision",d.reason);
        }
        return {decisions:result,heldCapitalUnits:String(availablePaperUnits(s.ledger)),reason:result.some(d=>d.state==="selected")?"selected":"hold_capital"};
      });
    },
    async submit(decisionId:string,q:PaperQuote,a:PaperAuthorization){
      return ports.atomic(async s=>{
        sweep(s);
        const d=s.decisions.find(d=>d.id===decisionId);if(!d)throw new Error("unknown_decision");
        const old=s.orders.find(o=>o.decisionId===d.id&&o.direction==="buy");if(old)return old;
        if(d.state!=="selected" || !authorized(a))throw new Error("simulation_authorization_required");
        const c=d.candidate;
        let reason="qualified";
        if(Date.parse(c.validUntil)<=now())reason="expired";
        else if(!quoteValid(q,{instrumentId:c.instrumentId,direction:"buy"}))reason="quote_invalid_or_stale";
        else if(BigInt(q.availableSharesUnits)===0n)reason="no_executable_liquidity";
        else {
          const gross=ceilDiv(BigInt(c.quantityUnits)*BigInt(q.priceUnits),MICRO);
          const fees=ceilDiv(gross*BigInt(q.feesBps),10000n);
          if(gross+fees>BigInt(c.capitalUnits))reason="price_changed_before_execution";
          else reason=predictionEntry({...c,priceUnits:q.priceUnits,feesUnits:String(fees),capitalUnits:String(gross+fees),
            expectedUnits:String(BigInt(c.quantityUnits)*BigInt(c.probabilityBps)/10000n-gross-fees),
            lossUnits:String(gross+fees),producedAt:q.producedAt,validUntil:q.validUntil},
            {now:now(),availableUnits:String(availablePaperUnits(s.ledger)+BigInt(s.ledger.reservations[d.id]??"0")),
              exposure:exposures(s,d.id),allowFixtures:ports.allowFixtures},policy);
        }
        if(reason!=="qualified"){
          releasePaper(s.ledger,d.id);event(s,c.id,"pre_execution",reason);
          d.state="rejected";d.reason=reason;return null;
        }
        const o:PaperOrder={id:`paper-buy:${c.id}`,opportunityId:c.id,decisionId:d.id,asset:c.asset,
          instrumentId:c.instrumentId,outcome:c.outcome,direction:"buy",state:"pending",
          quantityUnits:c.quantityUnits,filledUnits:"0",reservedUnits:c.capitalUnits,policyVersion:policy.version,
          strategyVersion:policy.strategyVersion,createdAt:date(),updatedAt:date(),
          policyReference:c.policyReference,
          submittedQuote:structuredClone(q),fillQuotes:[],
          validUntil:new Date(Math.min(Date.parse(c.validUntil),Date.parse(a.expiresAt))).toISOString(),
          fills:[],reason:"simulation_order_not_confirmed_position",authorizationId:a.id,attempts:0,nextAttemptAt:date()};
        s.orders.push(o);event(s,c.id,"authorization",`simulation_mandate:${a.id}`);
        event(s,c.id,"order",o.reason);return o;
      });
    },
    async fill(orderId:string,q:PaperQuote){
      return ports.atomic(async s=>{
        sweep(s);
        const o=s.orders.find(o=>o.id===orderId);if(!o)throw new Error("unknown_order");
        if(s.ledger.status!=="reconciled"){cancel(s,o,"failed","paper_ledger_divergence");return o;}
        const fillId=`${o.id}:${q.id}`;
        if(o.fills.some(f=>f.id===fillId)||!live(o))return o;
        if(!quoteValid(q,{instrumentId:o.instrumentId,direction:o.direction})||Date.parse(o.nextAttemptAt)>now())return o;
          if(o.direction==="buy"&&(o.policyVersion!==policy.version||o.strategyVersion!==policy.strategyVersion||
            !ports.allowFixtures&&o.policyReference?.effectiveId!==policy.effectiveId))
            throw new Error("policy_or_strategy_changed");
        const d=s.decisions.find(d=>d.id===o.decisionId)!;
        // A book snapshot's visible depth cannot be consumed twice by different paper orders.
        const used=s.orders.filter(x=>x.instrumentId===o.instrumentId&&x.direction===o.direction).flatMap(x=>x.fills)
          .filter(f=>f.id.endsWith(`:${q.id}`)).reduce((n,f)=>n+BigInt(f.sharesUnits),0n);
        const depth=BigInt(q.availableSharesUnits)>used?BigInt(q.availableSharesUnits)-used:0n;
        const remaining=BigInt(o.quantityUnits)-BigInt(o.filledUnits);
        let quantity=remaining<depth?remaining:depth;
        o.attempts++;o.nextAttemptAt=new Date(now()+policy.retrySeconds*1000).toISOString();
        if(quantity===0n){o.reason="no_executable_liquidity";
          if(o.positionId){const p=s.positions.find(p=>p.id===o.positionId);if(p)p.exitState="blocked_liquidity";}
          event(s,o.opportunityId,"fill_attempt",o.reason);return o;}
        const gross=o.direction==="buy"?ceilDiv(quantity*BigInt(q.priceUnits),MICRO):
          quantity*BigInt(q.priceUnits)/MICRO;
        const fees=ceilDiv(gross*BigInt(q.feesBps),10000n);
        if(o.direction==="buy"&&gross+fees>BigInt(s.ledger.reservations[o.decisionId]??"0")){
          cancel(s,o,"failed","price_changed_before_execution");return o;
        }
        const at=date();
        if(o.direction==="buy"){
          // Re-evaluate advantage on every new fill quote, not just on order creation.
          const reason=predictionEntry({...d.candidate,quantityUnits:String(quantity),priceUnits:q.priceUnits,
            capitalUnits:String(gross+fees),lossUnits:String(gross+fees),feesUnits:String(fees),
            expectedUnits:String(quantity*BigInt(d.candidate.probabilityBps)/10000n-gross-fees),producedAt:q.producedAt,
            validUntil:q.validUntil},{now:now(),availableUnits:String(availablePaperUnits(s.ledger)+BigInt(s.ledger.reservations[d.id]??"0")),
              exposure:exposures(s,d.id),allowFixtures:ports.allowFixtures},policy);
          if(reason!=="qualified"){cancel(s,o,"failed",reason);return o;}
          postPaper(s.ledger,{id:fillId,cashDeltaUnits:String(-gross-fees),realizedDeltaUnits:"0",reason:"paper_buy_fill_capital_not_loss",at},o.decisionId);
          let p=s.positions.find(p=>p.orderId===o.id);
          if(!p){
            p={id:`paper-position:${o.opportunityId}`,opportunityId:o.opportunityId,decisionId:o.decisionId,orderId:o.id,
              asset:o.asset,event:d.candidate.event,instrumentId:o.instrumentId,outcome:o.outcome,state:"open",quantityUnits:"0",
              entryCostUnits:"0",entryFeesUnits:"0",committedUnits:"0",originalExpectedUnits:d.candidate.expectedUnits,realizedUnits:"0",
              strategyVersion:o.strategyVersion,policyVersion:o.policyVersion,openedAt:at,updatedAt:at,exitPlan:d.candidate.exitPlan,
              exitState:"planned",resolutionState:"unresolved",valuations:[],
              policyReference:d.candidate.policyReference,policySnapshot:structuredClone(policy)};
            s.positions.push(p);o.positionId=p.id;
          }
          p.quantityUnits=String(BigInt(p.quantityUnits)+quantity);p.entryCostUnits=String(BigInt(p.entryCostUnits)+gross);
          p.entryFeesUnits=String(BigInt(p.entryFeesUnits)+fees);p.committedUnits=String(BigInt(p.committedUnits)+gross+fees);p.updatedAt=at;
          o.reservedUnits=s.ledger.reservations[d.id]??"0";
        } else {
          const p=s.positions.find(p=>p.id===o.positionId);if(!p||!open(p)||quantity>BigInt(p.quantityUnits))throw new Error("position_quantity_unavailable");
          const basis=quantity===BigInt(p.quantityUnits)?BigInt(p.committedUnits):
            BigInt(p.committedUnits)*quantity/BigInt(p.quantityUnits);
          const proceeds=gross-fees,realized=proceeds-basis;
          postPaper(s.ledger,{id:fillId,cashDeltaUnits:String(proceeds),realizedDeltaUnits:String(realized),reason:"paper_sell_confirmed",at});
          p.quantityUnits=String(BigInt(p.quantityUnits)-quantity);p.committedUnits=String(BigInt(p.committedUnits)-basis);
          p.realizedUnits=String(BigInt(p.realizedUnits)+realized);p.updatedAt=at;p.exitState="partial";
          if(p.quantityUnits==="0"){p.state="closed";p.exitState="confirmed";p.closedAt=at;}
        }
        o.fills.push({id:fillId,at,sharesUnits:String(quantity),cashUnits:String(gross),feesUnits:String(fees),
          price:String(Number(q.priceUnits)/1000000),source:q.source});
        (o.fillQuotes??=[]).push(structuredClone(q));
        o.filledUnits=String(BigInt(o.filledUnits)+quantity);o.updatedAt=at;
        o.state=o.filledUnits===o.quantityUnits?"filled":"partial";o.reason=o.state==="filled"?"paper_fill_confirmed":"paper_partial_fill_confirmed";
        if(o.state==="filled"&&o.direction==="buy"){releasePaper(s.ledger,o.decisionId);o.reservedUnits="0";}
        if(o.state==="filled"&&o.direction==="sell"){
          const p=s.positions.find(p=>p.id===o.positionId)!;
          if(p.quantityUnits!=="0"){p.state="open";p.exitState="planned";}
        }
        event(s,o.opportunityId,"fill",o.reason);return o;
      });
    },
    async evaluate(positionId:string,input:{quote?:PaperQuote;probabilityBps?:number;probabilityValidated?:boolean;
      hypothesisValid?:boolean;indicativePriceUnits?:string;indicativeSource?:string;indicativeProducedAt?:string}){
      return ports.atomic(async s=>{
        sweep(s);
        const p=s.positions.find(p=>p.id===positionId);if(!p||!open(p))return undefined;
        const q=input.quote,valid=!!q&&quoteValid(q,{instrumentId:p.instrumentId,direction:"sell"});
        const quantity=BigInt(p.quantityUnits),depth=valid?BigInt(q!.availableSharesUnits):0n;
        const liquidatable=quantity<depth?quantity:depth;
        const gross=valid?quantity*BigInt(q!.priceUnits)/MICRO:0n;
        const net=gross-ceilDiv(gross*BigInt(q?.feesBps??0),10000n);
        const full=valid&&liquidatable===quantity;
        const probability=input.probabilityBps;
        const estimated=input.probabilityValidated===true&&probability!==undefined&&Number.isInteger(probability)&&probability>=0&&probability<=10000;
        const v:PaperValuation={at:date(),source:q?.source??input.indicativeSource??"unavailable",
          priceUnits:q?.priceUnits??input.indicativePriceUnits??null,
          producedAt:q?.producedAt??input.indicativeProducedAt??null,kind:full?"executable":
          valid?"conservative":input.indicativePriceUnits?"indicative":"unavailable",stale:!valid,
          quantityUnits:p.quantityUnits,liquidatableUnits:String(liquidatable),exitValueUnits:full?String(net):null,
          unrealizedUnits:full?String(net-BigInt(p.committedUnits)):null,
          updatedExpectedUnits:estimated?String(quantity*BigInt(probability!)/10000n-BigInt(p.committedUnits)):null,
          action:"hold",reason:"hold_until_resolution"};
        if(!ports.allowFixtures&&policy.paused){v.action="pause";v.reason="policy_emergency_pause";}
        else if(s.ledger.status!=="reconciled"){v.action="pause";v.reason="paper_ledger_divergence";}
        else if(input.hypothesisValid===false){v.action="exit";v.reason="hypothesis_invalidated";}
        else if(now()-Date.parse(p.openedAt)>policy.maximumHoldSeconds*1000){v.action="exit";v.reason="maximum_hold_time";}
        else if(!valid){v.action="pause";v.reason="source_invalid_or_stale";}
        else if(full&&(BigInt(p.committedUnits)-net)*10000n>BigInt(p.committedUnits)*BigInt(policy.maximumLossBps)){
          v.action="exit";v.reason="loss_limit_trigger_not_guaranteed_stop";
        } else if(estimated&&BigInt(probability!)-BigInt(q!.priceUnits)*10000n/MICRO<
          BigInt(policy.minimumNetEdgeBps-policy.exitHysteresisBps)){v.action="reduce";v.reason="edge_disappeared_after_hysteresis";}
        p.valuations.push(v);p.updatedAt=v.at;
        if(v.action==="exit"||v.action==="reduce")p.exitState=liquidatable===0n?"blocked_liquidity":"triggered";
        event(s,p.opportunityId,"valuation",v.reason);return v;
      });
    },
    async requestExit(positionId:string,quantityUnits:string,q:PaperQuote,a:PaperAuthorization){
      return ports.atomic(async s=>{
        sweep(s);
        const p=s.positions.find(p=>p.id===positionId);if(!p||!open(p))throw new Error("position_not_open");
        if(s.ledger.status!=="reconciled"){event(s,p.opportunityId,"exit","paper_ledger_divergence");return null;}
        const existing=s.orders.find(o=>o.positionId===p.id&&o.direction==="sell"&&live(o));if(existing)return existing;
        if(!authorized(a))throw new Error("simulation_authorization_required");
        if(!/^[1-9]\d{0,39}$/.test(quantityUnits)||BigInt(quantityUnits)>BigInt(p.quantityUnits))throw new Error("invalid_exit_size");
        if(!quoteValid(q,{instrumentId:p.instrumentId,direction:"sell"})||q.availableSharesUnits==="0"){
          p.exitState="blocked_liquidity";event(s,p.opportunityId,"exit","exit_trigger_not_executable");return null;
        }
        const count=s.orders.filter(o=>o.positionId===p.id&&o.direction==="sell").length+1;
        const o:PaperOrder={id:`paper-exit:${p.opportunityId}:${count}`,opportunityId:p.opportunityId,decisionId:p.decisionId,
          positionId:p.id,asset:p.asset,instrumentId:p.instrumentId,outcome:p.outcome,direction:"sell",state:"pending",
          quantityUnits,filledUnits:"0",reservedUnits:"0",policyVersion:policy.version,strategyVersion:policy.strategyVersion,
          policyReference:p.policyReference,
          submittedQuote:structuredClone(q),fillQuotes:[],
          createdAt:date(),updatedAt:date(),
          validUntil:new Date(Math.min(Date.parse(q.validUntil),Date.parse(a.expiresAt))).toISOString(),
          fills:[],reason:"exit_requested_not_confirmed",
          authorizationId:a.id,attempts:0,nextAttemptAt:date()};
        s.orders.push(o);p.state="reducing";p.exitState="requested";event(s,p.opportunityId,"exit",o.reason);return o;
      });
    },
    async settle(positionId:string,resolution:{instrumentId:string;payoutUnits:string;evidenceId:string;source:string;observedAt:string;verified:boolean}){
      return ports.atomic(async s=>{
        sweep(s);
        const p=s.positions.find(p=>p.id===positionId);if(!p)throw new Error("unknown_position");
        if(p.state==="settled")return p;
        if(!open(p)||!resolution.verified||resolution.instrumentId!==p.instrumentId||
          !["0","1000000"].includes(resolution.payoutUnits)||!resolution.evidenceId||!/^https:\/\//.test(resolution.source)||
          !Number.isFinite(Date.parse(resolution.observedAt))||Date.parse(resolution.observedAt)>now()+5000)
          throw new Error("resolution_not_verified");
        for(const o of s.orders.filter(o=>o.opportunityId===p.opportunityId&&live(o)))cancel(s,o,"cancelled","event_resolved_cancel_remaining_order");
        p.resolutionState="settlement_pending";event(s,p.opportunityId,"resolution",resolution.evidenceId);
        const cash=BigInt(p.quantityUnits)*BigInt(resolution.payoutUnits)/MICRO,realized=cash-BigInt(p.committedUnits);
        postPaper(s.ledger,{id:`paper-settle:${p.id}:${resolution.evidenceId}`,cashDeltaUnits:String(cash),
          realizedDeltaUnits:String(realized),reason:"verified_simulation_resolution",at:date()});
        p.realizedUnits=String(BigInt(p.realizedUnits)+realized);p.quantityUnits="0";p.committedUnits="0";
        p.state="settled";p.resolutionState="settled";p.exitState="confirmed";p.closedAt=date();p.updatedAt=date();
        event(s,p.opportunityId,"settlement","paper_settlement_not_distributable_profit");return p;
      });
    },
    async cancel(orderId:string){return ports.atomic(async s=>{
      const o=s.orders.find(o=>o.id===orderId);if(!o)throw new Error("unknown_order");
      cancel(s,o,"cancelled","order_cancelled_unused_reservation_released");return o;
    });},
    async maintain(){return ports.atomic(async s=>{sweep(s);return s;});},
  };
}
