import global from "./policies/global.v1.json";
import strategy from "./policies/strategy.v1.json";
import btc from "./policies/btc.v1.json";
import eth from "./policies/eth.v1.json";
import sol from "./policies/sol.v1.json";
import {composeControls} from "./policy-composition";
import type {PolicyDefinition,PredictionPolicy} from "./policy-model";
/** Bundled Git definitions are an informative, unfunded draft. Only published DB versions authorize simulation. */
export const predictionPolicy:PredictionPolicy={
  ...composeControls([global,strategy,btc] as PolicyDefinition[]),
  version:`${global.id}/${global.version}`,strategyVersion:`${strategy.id}/${strategy.version}`,
  name:strategy.name,published:false,rules:[global.justification,strategy.justification],
};
export type {PredictionPolicy} from "./policy-model";
export const predictionSpecialists = [
  { asset: "btc", search: btc.search, match: /\b(bitcoin|btc)\b/i },
  { asset: "eth", search: eth.search, match: /\b(ethereum|ether|eth)\b/i },
  { asset: "sol", search: sol.search, match: /\b(solana|sol)\b/i },
] as const;
