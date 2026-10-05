import {createHash} from "node:crypto";
import {missing,observed,type Opportunity} from "../domain/opportunity";
import {predictionPolicy,predictionSpecialists} from "../../risk";
type Json=Record<string,unknown>;
export type SourceStatus={status:"observed"|"partial"|"unavailable"|"no_btc_markets"|"no_eligible_markets";attemptedAt:string;
  error?:string;opportunityCount:number};
/** Public data only; fixed hosts, bounded requests/time, no trading/signing SDK. */
export function polymarketBtc(fetcher:typeof fetch=fetch,clock:()=>number=Date.now,asset:"btc"|"eth"|"sol"="btc") {
  const specialist=predictionSpecialists.find(s=>s.asset===asset)!;
  const search=`https://gamma-api.polymarket.com/public-search?q=${specialist.search}&events_status=active&limit_per_type=3`;
  const json=async(url:string):Promise<Json>=>{
    const r=await fetcher(url,{signal:AbortSignal.timeout(8000),headers:{Accept:"application/json"}});
    if(!r.ok)throw new Error(`source_http_${r.status}`);
    const data:unknown=await r.json();
    if(!data || typeof data!=="object" || Array.isArray(data))throw new Error("source_invalid_response");
    return data as Json;
  };
  const strings=(v:unknown):string[]=>{
    const a=typeof v==="string"?JSON.parse(v):v;
    if(!Array.isArray(a) || a.some(x=>typeof x!=="string"))throw new Error("source_invalid_instruments");
    return a;
  };
  return {
    async verifyCurrent(o:Opportunity){
      if(o.origin.provider!=="polymarket_gamma_clob" || !/^\d{1,100}$/.test(o.instrument.id))
        throw new Error("opportunity_invalidated");
      const book=await json(`https://clob.polymarket.com/book?token_id=${o.instrument.id}`);
      const evidence=o.sources.find(s=>s.url.startsWith("https://clob.polymarket.com/book?"));
      const expected=evidence?.evidence.match(/^book:([^;]+);/)?.[1];
      const marketId=o.sources.find(s=>s.url.startsWith("https://gamma-api.polymarket.com/"))?.evidence.match(/^market:(\d+);/)?.[1];
      if(!marketId || book.hash!==expected || book.asset_id!==o.instrument.id)throw new Error("opportunity_invalidated");
      const market=await json(`https://gamma-api.polymarket.com/markets/${marketId}`);
      if(market.active!==true || market.closed!==false || market.enableOrderBook!==true ||
        market.question!==o.instrument.name || Date.parse(String(market.endDate))<=clock())throw new Error("opportunity_invalidated");
    },
    async collect():Promise<{opportunities:Opportunity[];source:SourceStatus}>{
    const attemptedAt=new Date(clock()).toISOString(),opportunities:Opportunity[]=[];
    let failures=0;
    try{
      const data=await json(search);
      if(!Array.isArray(data.events))throw new Error("source_invalid_response");
      const markets=data.events.flatMap(e=>e && typeof e==="object" && Array.isArray((e as Json).markets)?(e as Json).markets as Json[]:[])
        .filter(m=>m.active===true && m.closed===false && m.enableOrderBook===true &&
          typeof m.question==="string" && specialist.match.test(m.question) &&
          typeof m.endDate==="string" && Date.parse(m.endDate)>clock()).slice(0,2);
      for(const m of markets){
        try{
          const instruments=strings(m.clobTokenIds),outcomes=strings(m.outcomes);
          for(const [i,id] of instruments.slice(0,2).entries()){
            if(!/^\d{1,100}$/.test(id))throw new Error("source_invalid_instrument");
            const url=`https://clob.polymarket.com/book?token_id=${id}`,book=await json(url);
            if(book.asset_id!==id || typeof book.hash!=="string" || !book.hash || !Array.isArray(book.asks))
              throw new Error("source_invalid_book");
            const produced=Number(book.timestamp),updated=Date.parse(String(m.updatedAt));
            if(!Number.isFinite(produced) || !Number.isFinite(updated))throw new Error("source_missing_timestamp");
            const collectedAt=new Date(clock()).toISOString();
            const asks=(book.asks as Json[]).filter(a=>typeof a.price==="string" && typeof a.size==="string" &&
              Number(a.price)>0 && Number(a.price)<=1 && Number(a.size)>0).sort((a,b)=>Number(a.price)-Number(b.price));
            const best=asks[0];
            const levels=(raw:unknown)=>(Array.isArray(raw)?raw:[]).slice(0,100).filter(x=>x&&typeof x==="object"&&
              typeof (x as Json).price==="string"&&typeof (x as Json).size==="string")
              .map(x=>({price:String((x as Json).price),size:String((x as Json).size)}));
            const capture={provider:"polymarket_gamma_clob",
              market:{id:String(m.id),question:String(m.question),endDate:String(m.endDate),updatedAt:String(m.updatedAt)},
              book:{assetId:id,hash:String(book.hash),timestamp:String(book.timestamp),
                asks:levels(book.asks),bids:levels(book.bids),totalAskLevels:book.asks.length,
                totalBidLevels:Array.isArray(book.bids)?book.bids.length:0,
                truncated:book.asks.length>100||Array.isArray(book.bids)&&book.bids.length>100}};
            const normalize=(v:unknown):unknown=>Array.isArray(v)?v.map(normalize):v&&typeof v==="object"?
              Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,normalize(x)])):v;
            const snapshotId=createHash("sha256").update(JSON.stringify(normalize(capture))).digest("hex");
            opportunities.push({
               id:`${asset}:${snapshotId}`,marketAgent:"predictions",specialist:asset,market:"prediction",
               deduplicationKey:`${asset}:${snapshotId}`,strategyVersion:predictionPolicy.strategyVersion,
               policyVersion:predictionPolicy.version,
               sourceSnapshots:[{...capture,snapshotHash:snapshotId}],
               probability:missing("calibrated_event_probability_not_validated"),
               orderQuote:missing("order_size_fee_model_and_depth_quote_not_validated"),
               exitPlan:observed("Manter até resolução; reduzir por perda de vantagem; sair por invalidação, prazo ou limite de perda; sem garantia de liquidez."),
              origin:{provider:"polymarket_gamma_clob",snapshotId,nature:"real_market_data"},
              instrument:{id,name:String(m.question),outcome:outcomes[i]??"unknown",
                settlementAsset:missing("provider_settlement_asset_and_conversion_not_attested")},
              operation:missing("strategy_order_intent_not_defined"),
              sources:[
                {url:search,producedAt:new Date(updated).toISOString(),collectedAt,evidence:`market:${m.id};metadata:${m.updatedAt}`},
                {url,producedAt:new Date(produced).toISOString(),collectedAt,
                  evidence:`book:${book.hash};bestAskShares:${best?.size??"absent"}`},
              ],
              model:missing("calibrated_prediction_market_model_not_implemented"),
              executablePrice:best?observed(String(best.price)):missing("no_executable_ask"),
              costs:missing("fees_slippage_and_conversion_quote_unavailable"),
              liquidity:missing("observed_share_depth_not_verified_capital_capacity"),
              estimatedReturn:missing("no_estimate_without_calibrated_model"),
              uncertainty:missing("no_calibrated_uncertainty"),
              risks:["market_resolution","liquidity","quote_expiry","settlement_asset_and_network"],
              potentialLossUnits:missing("order_size_not_defined"),capitalUnits:missing("order_size_not_defined"),
              horizonSeconds:observed(Math.max(1,Math.floor((Date.parse(String(m.endDate))-produced)/1000))),
              correlation:missing("external_exposure_not_reconciled"),
              validUntil:new Date(Math.min(produced+60000,Date.parse(String(m.endDate)))).toISOString(),
              invalidationConditions:["quote_expired","book_changed","market_closed","source_stale","policy_changed"],
            });
          }
        }catch{failures++;}
      }
      return {opportunities,source:{status:failures?(opportunities.length?"partial":"unavailable"):
         opportunities.length?"observed":asset==="btc"?"no_btc_markets":"no_eligible_markets",attemptedAt,opportunityCount:opportunities.length,
        ...(failures?{error:"book_data_unavailable"}:{})}};
    }catch(e){
      return {opportunities:[],source:{status:"unavailable",attemptedAt,opportunityCount:0,
        error:e instanceof Error && /^source_[a-z_0-9]+$/.test(e.message)?e.message:"source_unavailable"}};
    }
  }};
}
