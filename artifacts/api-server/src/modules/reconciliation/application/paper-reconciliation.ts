import type {PaperState} from "../../execution";
import {reconcilePaper} from "../../ledger";
/** Reconcile the operational simulation records, not the real wallet or provider account. */
export function reconcilePaperExecution(s:PaperState,defensiveUnits:string):string{
  if(s.ledger.defensiveUnits!==defensiveUnits){
    s.ledger.status="divergence";return "paper_policy_reserve_mismatch";
  }
  const result=reconcilePaper(s.ledger);
  if(s.ledger.status!=="reconciled")return result;
  const entries=new Map(s.ledger.entries.map(e=>[e.id,e]));
  const committed=s.positions.reduce((n,p)=>n+BigInt(p.committedUnits),0n);
  const realized=s.positions.reduce((n,p)=>n+BigInt(p.realizedUnits),0n);
  const mismatch=s.orders.some(o=>{
    if(o.filledUnits!==String(o.fills.reduce((n,f)=>n+BigInt(f.sharesUnits),0n)))return true;
    return o.fills.some(f=>{
      const entry=entries.get(f.id),gross=BigInt(f.cashUnits),fees=BigInt(f.feesUnits);
      return !entry||entry.cashDeltaUnits!==String(o.direction==="buy"?-gross-fees:gross-fees);
    });
  });
  if(mismatch||realized!==BigInt(s.ledger.realizedUnits)||
    BigInt(s.ledger.cashUnits!)+committed!==BigInt(s.ledger.fundingUnits!)+realized){
    s.ledger.status="divergence";return "paper_operational_records_divergence";
  }
  return result;
}
