/** Composition of existing financial sources; no new source of balances or realized profit. */
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { chainJournal } from "../modules/ledger/infrastructure/chain-journal";
import { localRoundStore } from "../modules/ledger/infrastructure/local-round-store";
import { treasuryReservations } from "../modules/ledger/infrastructure/treasury-reservations";
import { journeyChain, type LocalMetadata } from "../modules/wallets/infrastructure/journey-chain";
export async function treasuryResources(client:Pick<typeof db,"execute">,meta:LocalMetadata,except?:string) {
  const block=await journeyChain.provider.getBlock("latest");
  if(!block?.hash)throw new Error("block_unavailable");
  await chainJournal.reconcile(meta.epoch,async n=>(await journeyChain.provider.getBlock(n))?.hash??null);
  await chainJournal.record(meta.epoch,meta.usdc,6,await journeyChain.logs({...meta,deploymentBlock:0},meta.usdc,"*",block.number));
  const cash=await journeyChain.balance(meta.usdc,meta.treasury,block.number);
  if(await chainJournal.balance(meta.epoch,meta.usdc,meta.treasury)!==cash)throw new Error("ledger_mismatch");
  const purchases=await journeyChain.purchases(meta,block.number);
  for(const p of purchases){
    const receipt=await journeyChain.receipt(p.hash);
    if(!receipt || receipt.status!==1 || receipt.blockHash!==p.blockHash)throw new Error("unverified_capital");
    const matches=(asset:string,from:string,to:string,units:string)=>receipt.logs.some(l=>{
      if(l.address.toLowerCase()!==asset.toLowerCase())return false;
      try{const e=journeyChain.erc.parseLog(l);return e?.name==="Transfer"&&String(e.args[0]).toLowerCase()===from.toLowerCase()
        &&String(e.args[1]).toLowerCase()===to.toLowerCase()&&String(e.args[2])===units;}catch{return false;}
    });
    // Both app-channel and direct purchases are capital; the personal app-buy verifier is intentionally narrower.
    if(!matches(meta.usdc,p.buyer,meta.treasury,p.principal) || !matches(meta.token,meta.sale,p.recipient,p.tokenUnits)
      || (BigInt(p.fee)>0n&&!matches(meta.usdc,p.buyer,meta.operating,p.fee)))throw new Error("unverified_capital");
  }
  const allocations=(await client.execute(sql`SELECT r.units,r.day,s.draft,s.sender,s.nonce,s.transaction_hash FROM treasury_allocation_reservations r
    LEFT JOIN treasury_governance_proposals p ON p.id=r.id AND p.epoch=r.epoch
    LEFT JOIN test_journey_stages s ON s.transaction_hash=p.proposal->>'hash' AND s.epoch=r.epoch AND s.name='distribution'
    WHERE r.epoch=${meta.epoch} AND r.state='spent'`)).rows;
  for(const a of allocations){
    if(!a.transaction_hash || !a.draft)throw new Error("allocation_reconciliation_required");
    const draft=a.draft as Record<string,string|number>;
    const receipt=await journeyChain.verifyReceipt(String(a.transaction_hash),String(a.sender),draft);
    if(!receipt || receipt.status!==1)throw new Error("allocation_reconciliation_required");
    const settledBlock=await journeyChain.provider.getBlock(receipt.blockNumber);
    if(!settledBlock || Number(a.day)!==Math.floor(settledBlock.timestamp/86400))throw new Error("allocation_reconciliation_required");
    await journeyChain.verifyEffects("distribution",String(a.transaction_hash),meta,draft,
      {id:"",quantity:"0",principal:String(a.units),fee:"0"});
  }
  // A stale native payout/buyback projection may not make treasury resources available twice.
  const settlements=(await client.execute(sql`SELECT p.units,p.transaction_hash hash FROM local_test_payouts p
    JOIN local_test_rounds r ON r.id=p.round_id WHERE r.epoch=${meta.epoch} AND p.state='paid'
    UNION ALL SELECT plan->>'buyback',buyback_hash FROM local_test_rounds WHERE epoch=${meta.epoch}
    AND buyback_state='paid' AND (plan->>'buyback')::numeric>0`)).rows;
  for(const s of settlements){
    const receipt=typeof s.hash==="string"?await journeyChain.receipt(s.hash):null;
    if(!receipt || receipt.status!==1 || (await journeyChain.provider.getBlock(receipt.blockNumber))?.hash!==receipt.blockHash)
      throw new Error("allocation_reconciliation_required");
    const stages=(await client.execute(sql`SELECT draft,sender FROM test_journey_stages WHERE epoch=${meta.epoch}
      AND transaction_hash=${String(s.hash)} AND name='distribution'`)).rows;
    const stage=stages[0];
    if(!stage || String(stage.sender).toLowerCase()!==meta.treasury.toLowerCase())throw new Error("allocation_reconciliation_required");
    const verified=await journeyChain.verifyReceipt(String(s.hash),String(stage.sender),stage.draft as Record<string,string|number>);
    if(!verified || verified.status!==1)throw new Error("allocation_reconciliation_required");
    await journeyChain.verifyEffects("distribution",String(s.hash),meta,stage.draft as Record<string,string|number>,
      {id:"",quantity:"0",principal:String(s.units),fee:"0"});
  }
  const incoming=(await client.execute(sql`SELECT j.transaction_hash,
    (l->>'units')::text units,COALESCE(o.account_id,'') owner
    FROM local_chain_journal j CROSS JOIN LATERAL jsonb_array_elements(j.legs) l
    LEFT JOIN test_journey_stages s ON s.transaction_hash=j.transaction_hash AND s.state='confirmed'
    LEFT JOIN test_journey_operations o ON o.id=s.operation_id
    WHERE j.epoch=${meta.epoch} AND j.asset=${meta.usdc.toLowerCase()}
      AND l->>'account'=${meta.treasury.toLowerCase()} AND (l->>'units')::numeric>0 AND j.reverses IS NULL
      AND NOT EXISTS(SELECT 1 FROM local_chain_journal r WHERE r.reverses=j.id)`)).rows;
  const primaryHashes=new Set(purchases.map(p=>p.hash));
  let capital=0n,synthetic=0n,unclassified=0n;
  for(const r of incoming) {
    const amount=BigInt(String(r.units));
    if(primaryHashes.has(String(r.transaction_hash)) || r.owner==="treasury-governance-capital")capital+=amount;
    else if(r.owner==="local-round-system")synthetic+=amount;
    else unclassified+=amount;
  }
  if((await journeyChain.provider.getBlock(block.number))?.hash!==block.hash)throw new Error("chain_reorganized");
  return {cashUnits:cash,capitalUnits:String(capital),syntheticIncomingUnits:String(synthetic),
    unclassifiedIncomingUnits:String(unclassified),obligationUnits:await localRoundStore.obligations(meta.epoch,""),
    ...await treasuryReservations(client,meta.epoch).totals(Math.floor(block.timestamp/86400),except),
    blockNumber:block.number,blockHash:block.hash,timestamp:block.timestamp,
    blockedDestinations:[meta.treasury,meta.operating,meta.reserve,meta.sale,meta.token,meta.usdc].map(a=>a.toLowerCase()),
    distributionSummary:await localRoundStore.summary(meta.epoch)};
}
