import {alphaHierarchy,predictionProposal} from "../../agents";
import {paperTrading} from "../../execution";
import {emptyPaperLedger,availablePaperUnits,reservedPaperUnits,reservePaper,postPaper,participationAt,localRoundPlan,reconcilePaper} from "../../ledger";
import {reconcilePaperExecution} from "../../reconciliation";
import {event,type ScenarioRun,type Scenario,type ScenarioCommand} from "./scenario-model";
import {scenarioPolicy,opportunities,quote,authorization} from "./scenario-fixtures";
const DAY=86400000,BASE=Date.UTC(2026,9,5),micro=1000000n;
export function createScenario(id:string,scenario:Scenario):ScenarioRun{
  const r:ScenarioRun={id,environment:"simulation",scenario,stage:0,revision:0,clock:BASE,paused:false,
    account:{id:`${id}:account`,usdcUnits:"0",bettexUnits:"0",receivedUnits:"0",
      wallets:["USDC","BETTEX"].map(asset=>({asset,id:`${id}:wallet:${asset}`,network:"simulation"}))},
    parameters:{provisional:true,tokenPriceUnits:"40000",feesUnits:"0",model:"fixture-not-calibrated",policyVersion:scenarioPolicy.version,seed:1},
    paper:{ledger:emptyPaperLedger(scenarioPolicy.defensiveUnits),decisions:[],orders:[],positions:[],events:[]},
    opportunities:[],events:[],rounds:[],transfers:[],generation:0,failure:scenario==="complete"?undefined:scenario,
    marketPriceUnits:"500000",paymentsCancelled:false};
  event(r,"account","created","simulation_account_and_inert_wallets");return r;
}
export function scenarioView(r:ScenarioRun){
  const committed=r.paper.positions.filter(x=>x.state==="open"||x.state==="reducing").reduce((n,p)=>n+BigInt(p.committedUnits),0n);
  return {...r,staking:participationAt(r.account.wallets[1].id,r.transfers,Math.floor(r.clock/1000)),
    capital:{cashUnits:r.paper.ledger.cashUnits??"0",availableUnits:String(availablePaperUnits(r.paper.ledger)),
      reservedUnits:String(reservedPaperUnits(r.paper.ledger)),committedUnits:String(committed),
      obligationsUnits:r.paper.ledger.obligationsUnits,realizedUnits:r.paper.ledger.realizedUnits,
      buybackUnits:String(r.rounds.reduce((n,round)=>n+BigInt(round.buybackUnits),0n))}};
}
function amount(v:string|undefined,defaultValue:string){
  const n=v??defaultValue;if(!/^[1-9]\d{0,12}$/.test(n)||BigInt(n)>1000000000000n)throw new Error("invalid_amount");
  return BigInt(n);
}
function deposit(r:ScenarioRun,n:bigint){
  r.account.usdcUnits=String(BigInt(r.account.usdcUnits)+n);event(r,"movement","confirmed","simulation_deposit",{asset:"USDC",units:String(n)});
}
function purchase(r:ScenarioRun,n:bigint){
  if(BigInt(r.account.usdcUnits)<n){event(r,"movement","rejected","insufficient_balance");return;}
  const tokens=n*micro/BigInt(r.parameters.tokenPriceUnits);
  r.account.usdcUnits=String(BigInt(r.account.usdcUnits)-n);r.account.bettexUnits=String(BigInt(r.account.bettexUnits)+tokens);
  const l=r.paper.ledger;l.fundingUnits=String(BigInt(l.fundingUnits??"0")+n);l.cashUnits=String(BigInt(l.cashUnits??"0")+n);l.status="reconciled";
  r.transfers.push({from:"simulation-mint",to:r.account.wallets[1].id,value:String(tokens),timestamp:Math.floor(r.clock/1000),
    blockNumber:r.transfers.length,logIndex:0});
  event(r,"movement","confirmed","simulation_purchase_principal_to_treasury",{usdcUnits:String(n),bettexUnits:String(tokens),provisional:true});
}
function withdraw(r:ScenarioRun,n:bigint){
  if(BigInt(r.account.bettexUnits)<n){event(r,"movement","rejected","insufficient_balance");return;}
  r.account.bettexUnits=String(BigInt(r.account.bettexUnits)-n);r.paymentsCancelled=true;
  r.transfers.push({from:r.account.wallets[1].id,to:"simulation-external",value:String(n),timestamp:Math.floor(r.clock/1000),
    blockNumber:r.transfers.length,logIndex:0});
  for(const round of r.rounds.filter(x=>x.status==="pending"||x.status==="failed")){round.status="cancelled";
    r.paper.ledger.obligationsUnits=String(BigInt(r.paper.ledger.obligationsUnits)-BigInt(round.paymentUnits));
    round.retainedUnits=String(BigInt(round.retainedUnits)+BigInt(round.paymentUnits));
    event(r,"distribution","cancelled","bettex_exit_cancels_unpaid_rights",{roundId:round.id});}
  event(r,"movement","confirmed","simulation_bettex_exit_resets_weight",{units:String(n)});
}
/** Paper engine excludes treasury settlement; reconcile the explicit scenario settlement separately. */
function reconcileRun(r:ScenarioRun){
  const external=r.paper.ledger.entries.filter(e=>e.reason==="simulation_distribution"||e.reason==="simulation_buyback_segregation");
  const expected=r.rounds.reduce((n,round)=>n+BigInt(round.buybackUnits)+(round.status==="paid"?BigInt(round.paymentUnits):0n),0n);
  const outflow=external.reduce((n,e)=>n-BigInt(e.cashDeltaUnits),0n);
  if(outflow!==expected||external.some(e=>BigInt(e.cashDeltaUnits)>0n||e.realizedDeltaUnits!=="0")){
    r.paper.ledger.status="divergence";return "simulation_settlement_divergence";
  }
  const operational={...r.paper,ledger:{...r.paper.ledger,
    cashUnits:r.paper.ledger.cashUnits===null?null:String(BigInt(r.paper.ledger.cashUnits)+outflow),
    entries:r.paper.ledger.entries.filter(e=>!external.includes(e))}};
  const result=reconcilePaperExecution(operational,scenarioPolicy.defensiveUnits);
  if(operational.ledger.status==="divergence"){r.paper.ledger.status="divergence";return result;}
  return reconcilePaper(r.paper.ledger);
}
function engines(r:ScenarioRun){
  const policy={...scenarioPolicy,maxCorrelatedUnits:r.failure==="exposure"?"100000000":scenarioPolicy.maxCorrelatedUnits};
  const paper=paperTrading({now:()=>r.clock,policy,allowFixtures:true,
    atomic:async f=>f(r.paper),reconcile:()=>reconcileRun(r)});
  const hierarchy=alphaHierarchy({now:()=>r.clock,allowFixtures:true,atomic:async f=>f({
    list:async()=>[...r.opportunities],find:async id=>r.opportunities.find(x=>x.opportunity.id===id),
    save:async row=>{const i=r.opportunities.findIndex(x=>x.opportunity.id===row.opportunity.id);if(i<0)r.opportunities.push(row);else r.opportunities[i]=row;},
    event:async row=>{event(r,"opportunity",row.state,row.reason,{specialist:row.opportunity.specialist,layer:row.decisions.at(-1)?.layer},row.opportunity.id);},
  })});
  return {paper,hierarchy};
}
async function generate(r:ScenarioRun){
  const {hierarchy,paper}=engines(r);r.generation++;
  if(r.failure==="integration_failure"){event(r,"integration","failed","simulation_adapter_unavailable");return;}
  const batch=opportunities(r);await hierarchy.ingest(batch);
  if(r.failure==="expired_duplicate"){await hierarchy.ingest(batch);event(r,"opportunity","deduplicated","same_identity_not_recreated");}
  await hierarchy.decide({paused:false,availableUnits:String(availablePaperUnits(r.paper.ledger)),maxAllocationUnits:scenarioPolicy.maxOrderUnits,
    exposureVerified:true,propose:async input=>{
      const o=r.opportunities.find(x=>x.governanceProposalId===input.id)!;
      const candidate=predictionProposal(o.opportunity,r.clock,true,scenarioPolicy);
      if(!candidate){event(r,"risk","rejected","fixture_not_qualified",{},input.id);return;}
      const result=await paper.decide([candidate]);const d=result.decisions[0];
      event(r,"risk",d.state,d.reason,{reservedUnits:r.paper.ledger.reservations[d.id]??"0"},o.opportunity.id);
      return result;
    }});
  for(const row of r.opportunities){
    const decision=r.paper.decisions.find(d=>d.opportunityId===row.opportunity.id);
    if(decision){row.state=decision.state==="selected"?"allocation_authorized":"rejected";row.reason=decision.reason;}
  }
}
async function market(r:ScenarioRun){
  const {paper}=engines(r);
  for(const p of r.paper.positions.filter(x=>x.state==="open"||x.state==="reducing")){
    await paper.evaluate(p.id,{quote:quote(r,p,"sell"),probabilityBps:6500,probabilityValidated:true});
  }
}
function pay(r:ScenarioRun,round:ScenarioRun["rounds"][number]){
  const units=BigInt(round.paymentUnits);
  if(units>0n){
    r.paper.ledger.obligationsUnits=String(BigInt(r.paper.ledger.obligationsUnits)-units);
    const key=`${r.id}:distribution:${round.id}`;reservePaper(r.paper.ledger,key,String(units));
    postPaper(r.paper.ledger,{id:key,cashDeltaUnits:String(-units),realizedDeltaUnits:"0",reason:"simulation_distribution",at:new Date(r.clock).toISOString()},key);
    delete r.paper.ledger.reservations[key];
    r.account.usdcUnits=String(BigInt(r.account.usdcUnits)+units);r.account.receivedUnits=String(BigInt(r.account.receivedUnits)+units);
  }
  round.status="paid";event(r,"distribution","paid","simulation_payment_confirmed",{roundId:round.id,units:String(units)},`${r.id}:round:${round.id}`);
}
function distribute(r:ScenarioRun){
  if(r.paper.positions.some(x=>x.state==="open"||x.state==="reducing")||Object.keys(r.paper.ledger.reservations).length){
    event(r,"distribution","blocked","open_positions_or_reservations");return false;
  }
  const start=Math.floor(r.clock/DAY)*DAY,end=start+DAY,id=new Date(start).toISOString().slice(0,10);
  if(r.rounds.some(x=>x.id===id)){event(r,"distribution","rejected","round_already_closed");return true;}
  const result=r.paper.ledger.entries.filter(e=>Date.parse(e.at)>=start&&Date.parse(e.at)<end).reduce((n,e)=>n+BigInt(e.realizedDeltaUnits),0n);
  const participation=participationAt(r.account.wallets[1].id,r.transfers,Math.floor(end/1000)-1);
  const weight=BigInt(participation.tokenSeconds)+BigInt(participation.balance);
  const eligible=result>0n&&BigInt(r.paper.ledger.cashUnits??"0")-result>=BigInt(r.paper.ledger.defensiveUnits)&&weight>0n;
  const plan=localRoundPlan(String(result>0n?result:0n),eligible?[{accountId:r.account.id,wallet:r.account.wallets[0].id,weight:String(weight)}]:[]);
  const round:ScenarioRun["rounds"][number]={id,resultUnits:String(result),retainedUnits:plan.retained,buybackUnits:plan.buyback,
    paymentUnits:plan.participants,status:eligible?"pending":"retained",at:new Date(end).toISOString()};
  r.clock=end;r.rounds.push(round);
  event(r,"distribution",round.status,eligible?"simulation_round_assessed_50_25_25":"independent_round_no_payment",
    {...round,weight:String(weight)},`${r.id}:round:${id}`);
  if(eligible){
    // Buyback cash is segregated, not a new expense or realized loss.
    const key=`${r.id}:buyback:${id}`;reservePaper(r.paper.ledger,key,plan.buyback);
    postPaper(r.paper.ledger,{id:key,cashDeltaUnits:`-${plan.buyback}`,realizedDeltaUnits:"0",reason:"simulation_buyback_segregation",at:new Date(r.clock).toISOString()},key);
    delete r.paper.ledger.reservations[key];
    r.paper.ledger.obligationsUnits=String(BigInt(r.paper.ledger.obligationsUnits)+BigInt(round.paymentUnits));
    if(r.failure==="payment_failure"){round.status="failed";event(r,"distribution","failed","simulation_payment_failure_existing_entitlement");}
    else pay(r,round);
  }
  return true;
}
/** Caller owns transactional copy and controlled clock. No provider, wallet or credential port exists. */
export async function commandScenario(r:ScenarioRun,c:ScenarioCommand){
  const originalPaperEvents=r.paper.events.length;
  if(c.action==="pause"){r.paused=true;event(r,"control","paused","simulation_paused");}
  else if(c.action==="resume"){r.paused=false;event(r,"control","running","simulation_resumed");}
  else if(c.action==="failure"){r.failure=c.failure;event(r,"control","configured","simulation_failure_selected",{failure:c.failure});}
  else {
    if(r.paused)throw new Error("simulation_paused");
    r.clock+=5000;
    if(c.action==="deposit")deposit(r,amount(c.amountUnits,"1000000000"));
    else if(c.action==="purchase")purchase(r,amount(c.amountUnits,"100000000"));
    else if(c.action==="withdraw")withdraw(r,amount(c.amountUnits,"1000000"));
    else if(c.action==="clock"){r.clock+=(c.seconds??30)*1000;await engines(r).paper.maintain();event(r,"control","advanced","controlled_clock",{seconds:c.seconds??30});}
    else if(c.action==="generate")await generate(r);
    else if(c.action==="market"){r.failure=undefined;r.marketPriceUnits="500000";await market(r);
      event(r,"market","updated","simulation_market_conditions_updated");}
    else if(c.action==="advance"){
      const {paper}=engines(r);
      if(r.failure==="restart"&&r.stage===3){r.failure=undefined;r.paused=true;event(r,"control","checkpoint","simulated_processing_interruption_no_half_commit");}
      else if(r.stage===0){deposit(r,r.failure==="insufficient_balance"?10000000n:2000000000n);r.stage++;}
      else if(r.stage===1){purchase(r,1500000000n);r.stage++;}
      else if(r.stage===2){await generate(r);r.stage++;}
      else if(r.stage===3){for(const d of r.paper.decisions.filter(x=>x.state==="selected"&&!r.paper.orders.some(o=>o.decisionId===x.id))){
        await paper.submit(d.id,quote(r,d.candidate,"buy"),authorization(r));}r.stage++;}
      else if(r.stage===4){for(const o of r.paper.orders.filter(x=>x.direction==="buy"&&x.state==="pending")){
        const d=r.paper.decisions.find(x=>x.id===o.decisionId)!;await paper.fill(o.id,quote(r,d.candidate,"buy",r.failure==="partial_fill"));
      }await market(r);r.stage++;}
      else if(r.stage===5){
        if(r.paper.orders.some(x=>x.direction==="buy"&&x.state==="partial")){r.clock+=30000;
          for(const o of r.paper.orders.filter(x=>x.direction==="buy"&&x.state==="partial")){
            const d=r.paper.decisions.find(x=>x.id===o.decisionId)!;await paper.fill(o.id,quote(r,d.candidate,"buy"));}}
        await market(r);
        for(const p of r.paper.positions.filter(x=>x.state==="open")){
          const o=await paper.requestExit(p.id,p.quantityUnits,quote(r,p,"sell"),authorization(r));
          if(o)await paper.fill(o.id,quote(r,p,"sell"));
        }
        if(!r.paper.positions.some(x=>x.state==="open"||x.state==="reducing")){
          for(const row of r.opportunities.filter(x=>["awaiting_authorization","allocation_authorized"].includes(x.state))){
            row.state="rejected";row.reason="simulation_operation_closed";
            event(r,"opportunity","closed",row.reason,{},row.opportunity.id);}
          r.stage++;}
      }
      else if(r.stage===6){if(distribute(r))r.stage++;}
      else {for(const round of r.rounds.filter(x=>x.status==="failed"||x.status==="pending")){
        if(r.failure!=="payment_failure")pay(r,round);}
        event(r,"control","complete","scenario_complete_new_actions_available");}
    }else throw new Error("unknown_simulation_action");
  }
  for(const e of r.paper.events.slice(originalPaperEvents))event(r,e.stage,e.stage,e.reason,{...e},e.opportunityId);
  for(const row of [r.account,...r.account.wallets,...r.transfers,...r.opportunities,...r.paper.decisions,
    ...r.paper.orders,...r.paper.positions,...r.paper.events,...r.paper.ledger.entries,...r.rounds]){
    Object.assign(row,{environment:"simulation",runId:r.id,scenarioId:r.scenario});
  }
  const integrity=reconcileRun(r);
  if(r.paper.ledger.status==="divergence")throw new Error(integrity);
  r.revision++;return r;
}
