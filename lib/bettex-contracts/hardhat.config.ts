import { defineConfig } from "hardhat/config";

// No HTTP networks, public accounts or deployment task.
export default defineConfig({
  networks: {
    local: { type: "edr-simulated", chainType: "l1", chainId: 31337 },
    forbidden: { type: "edr-simulated", chainType: "l1", chainId: 42161 },
    sepoliaGuard: { type: "edr-simulated", chainType: "l1", chainId: 421614 },
  },
});
