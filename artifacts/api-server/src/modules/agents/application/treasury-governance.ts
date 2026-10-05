import type { TreasuryPolicy } from "../../risk";
type AgentPort = {
  observe():Promise<{policy:TreasuryPolicy;availableUnits:string}>;
};
/** Control observation only. BETTEX owns opportunity comparison and allocation proposals. */
export function treasuryGovernanceAgent(port:AgentPort) {
  return {async analyze(id:string){
    const snapshot=await port.observe();
    return {id,proposed:false,role:"transversal_financial_control",policy:snapshot.policy,
      availableUnits:snapshot.availableUnits,reason:"opportunity_selection_belongs_to_BETTEX"};
  }};
}
