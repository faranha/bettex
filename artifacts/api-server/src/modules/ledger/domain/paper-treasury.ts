/** Simulation subledger. No wallet balance, blockchain movement or profit distribution. */
export type PaperLedger = {
  status:"unfunded"|"reconciled"|"divergence"; fundingUnits:string|null; cashUnits:string|null;
  obligationsUnits:string; defensiveUnits:string; realizedUnits:string;
  reservations:Record<string,string>;
  entries:{id:string;cashDeltaUnits:string;realizedDeltaUnits:string;reason:string;at:string}[];
};
export function emptyPaperLedger(defensiveUnits:string):PaperLedger {
  return {status:"unfunded",fundingUnits:null,cashUnits:null,obligationsUnits:"0",defensiveUnits,
    realizedUnits:"0",reservations:{},entries:[]};
}
export const reservedPaperUnits=(a:PaperLedger)=>Object.values(a.reservations).reduce((n,s)=>n+BigInt(s),0n);
export function availablePaperUnits(a:PaperLedger):bigint {
  if(a.status!=="reconciled" || a.cashUnits===null)return 0n;
  const v=BigInt(a.cashUnits)-BigInt(a.defensiveUnits)-BigInt(a.obligationsUnits)-reservedPaperUnits(a);
  return v>0n?v:0n;
}
export function reservePaper(a:PaperLedger,id:string,units:string) {
  if(a.reservations[id]!==undefined){if(a.reservations[id]!==units)throw new Error("reservation_conflict");return;}
  if(BigInt(units)<=0n || BigInt(units)>availablePaperUnits(a))throw new Error("insufficient_available_resources");
  a.reservations[id]=units;
}
export function releasePaper(a:PaperLedger,id:string){delete a.reservations[id];}
export function postPaper(a:PaperLedger,input:PaperLedger["entries"][number],reservationId?:string) {
  const old=a.entries.find(e=>e.id===input.id);
  if(old){if(Object.keys(input).some(k=>old[k as keyof typeof old]!==input[k as keyof typeof input]))
    throw new Error("ledger_entry_conflict");return false;}
  if(a.status!=="reconciled" || a.cashUnits===null)throw new Error("paper_ledger_unfunded_or_divergent");
  const delta=BigInt(input.cashDeltaUnits),next=BigInt(a.cashUnits)+delta;
  if(next<0n)throw new Error("negative_cash");
  if(delta<0n){
    if(!reservationId || BigInt(a.reservations[reservationId]??"0")< -delta)throw new Error("reservation_insufficient");
    a.reservations[reservationId]=String(BigInt(a.reservations[reservationId])+delta);
  }
  a.cashUnits=String(next);a.realizedUnits=String(BigInt(a.realizedUnits)+BigInt(input.realizedDeltaUnits));
  a.entries.push(input);return true;
}
export function reconcilePaper(a:PaperLedger) {
  if(a.fundingUnits===null)return "paper_budget_not_authorized";
  const cash=BigInt(a.fundingUnits)+a.entries.reduce((n,e)=>n+BigInt(e.cashDeltaUnits),0n);
  const realized=a.entries.reduce((n,e)=>n+BigInt(e.realizedDeltaUnits),0n);
  if(String(cash)!==a.cashUnits || String(realized)!==a.realizedUnits ||
    cash<BigInt(a.obligationsUnits)+reservedPaperUnits(a)){
    a.status="divergence";return "paper_ledger_divergence";
  }
  a.status="reconciled";return "paper_journal_reconciled_no_real_money";
}
