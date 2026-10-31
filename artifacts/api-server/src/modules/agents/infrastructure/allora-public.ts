/** Read-only Allora LCD/RPC. No consumer key, signing, event probability or orders. */
export const ALLORA_TOPICS = { BTC: 14, ETH: 9, SOL: 10 } as const;
export type AlloraAsset = keyof typeof ALLORA_TOPICS;
export type AlloraObservation = {
  asset: AlloraAsset; topicId: number; network: "allora-mainnet-1"; unit: "USD";
  horizonSeconds: number; price: string; blockHeight: string; producedAt: string;
  targetAt: string; observedAt: string; status: "current" | "stale"; source: string;
  authentication: "public_unsigned"; uncertainty: "unavailable";
};
const lcd = "https://allora-api.mainnet.allora.network";
const rpc = "https://allora-rpc.mainnet.allora.network";
type Fetcher = typeof fetch;
export async function readAllora(asset: AlloraAsset, fetcher: Fetcher = fetch, now = Date.now()): Promise<AlloraObservation> {
  const topicId = ALLORA_TOPICS[asset];
  if (!topicId) throw new Error("unsupported_asset");
  const get = async (url: string) => {
    const response = await fetcher(url, { signal: AbortSignal.timeout(8000), redirect: "error" });
    if (!response.ok) throw new Error("source_unavailable");
    const text = await response.text();
    if (text.length > 1_000_000) throw new Error("invalid_source");
    return JSON.parse(text);
  };
  const [topic, activity, inference] = await Promise.all([
    get(`${lcd}/emissions/v10/topics/${topicId}`), get(`${lcd}/emissions/v10/is_topic_active/${topicId}`),
    get(`${lcd}/emissions/v10/latest_network_inferences/${topicId}`),
  ]);
  if (String(topic?.topic?.id) !== String(topicId)
    || topic.topic.metadata !== `${asset}/USD - Price Prediction - 8h`
    || activity?.is_active !== true) throw new Error("topic_incompatible");
  const blockHeight = String(inference?.inference_block_height ?? "");
  const labeled = inference?.network_inferences?.combined_value;
  if (!/^[1-9]\d{0,15}$/.test(blockHeight) || !Array.isArray(labeled) || labeled.length !== 1
    || labeled[0]?.label_name !== "y") throw new Error("invalid_inference");
  const price = String(labeled[0]?.value ?? "");
  if (!/^\d{1,12}(?:\.\d{1,60})?$/.test(price) || !Number.isFinite(Number(price)) || Number(price) <= 0) {
    throw new Error("invalid_inference");
  }
  const block = await get(`${rpc}/block?height=${blockHeight}`);
  const header = block?.result?.block?.header;
  const produced = Date.parse(String(header?.time ?? ""));
  if (String(header?.height) !== blockHeight || header?.chain_id !== "allora-mainnet-1"
    || !Number.isFinite(produced) || produced > now + 60_000) throw new Error("invalid_block");
  const horizonSeconds = 8 * 3600;
  return { asset, topicId, network: "allora-mainnet-1", unit: "USD", horizonSeconds, price, blockHeight,
    producedAt: new Date(produced).toISOString(), targetAt: new Date(produced + horizonSeconds * 1000).toISOString(),
    observedAt: new Date(now).toISOString(), status: now - produced >= horizonSeconds * 1000 ? "stale" : "current",
    source: `${lcd}/emissions/v10/latest_network_inferences/${topicId}`,
    authentication: "public_unsigned", uncertainty: "unavailable" };
}
