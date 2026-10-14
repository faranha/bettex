Source: https://hummingbot.org/gateway
Title: Gateway DEX Middleware - Hummingbot
Fetched: 2026-10-14T01:05:43.216Z

[Skip to content](https://hummingbot.org/gateway/#what-is-gateway)

# Gateway DEX Middleware

## What is Gateway? [¶](https://hummingbot.org/gateway/\#what-is-gateway "Permanent link")

Hummingbot Gateway is a Typescript-based API server that standardizes interactions with blockchain networks and decentralized exchanges (DEXs). It acts as a middleware layer, providing a unified interface for performing actions like checking balances, executing trades, and managing wallets across different protocols.

Gateway is a companion service to the Python-based [Hummingbot client](https://github.com/hummingbot/hummingbot), exposing standardized REST API endpoints for trading and liquidity-related functionality on DEXs. This enables Hummingbot to run strategies that operate across both centralized (CEX) and decentralized exchanges seamlessly.

## In This Section [¶](https://hummingbot.org/gateway/\#in-this-section "Permanent link")

- **[Installation & Setup](https://hummingbot.org/gateway/installation/)**: Complete installation guide for source and Docker
- **[Configuration](https://hummingbot.org/gateway/configuration/)**: How to configure chains, connectors, and settings
- **[Commands](https://hummingbot.org/gateway/commands/)**: Comprehensive reference of all Gateway-related Hummingbot commands
- **[Chains](https://hummingbot.org/gateway/chains/)**: Detailed information about supported chains
- **[DEX Connectors](https://hummingbot.org/gateway/connectors/)**: Guide to all supported DEX in Gateway
- **[Strategies & Scripts](https://hummingbot.org/gateway/strategies/)**: Using Gateway with Hummingbot strategies

## Key Features [¶](https://hummingbot.org/gateway/\#key-features "Permanent link")

- **Standardized REST API**: Consistent endpoints for interacting with blockchains (Ethereum, Solana) and DEXs
- **DEX SDK Integration**: Interfaces with TypeScript/JavaScript DEX SDKs to provide standardized endpoints across different protocols
- **Connector Sub-Types**: Router (DEX aggregators), AMM (V2-style pools), and CLMM (V3-style concentrated liquidity)
- **Modular Architecture**: Clear separation of concerns with distinct modules for chains, connectors, configuration, and wallet management
- **Hardware Wallet Support**: Built-in support for hardware wallets and encrypted storage for regular wallets
- **Extensible**: Easily extended with new chains and connectors

### Connector Schemas [¶](https://hummingbot.org/gateway/\#connector-schemas "Permanent link")

- **Router**: DEX aggregators that find optimal swap routes across multiple liquidity sources, maximizing execution quality by splitting trades across multiple pools and protocols
- **AMM** (Automated Market Maker): Traditional V2-style constant product pools using the x\*y=k formula, where liquidity is distributed uniformly across the entire price range, making it simpler but less capital efficient
- **CLMM** (Concentrated Liquidity Market Maker): V3-style pools that allow liquidity providers to concentrate their capital within custom price ranges, dramatically improving capital efficiency and enabling better pricing for traders

For detailed implementation guides and examples for each schema, see [DEX Connectors](https://hummingbot.org/gateway/connectors/).

## Installation [¶](https://hummingbot.org/gateway/\#installation "Permanent link")

Gateway can be installed alongside [Hummingbot](https://github.com/hummingbot/hummingbot) to enable trading on AMM DEXs, or as a standalone API server. For detailed installation instructions, see [Installation & Setup](https://hummingbot.org/gateway/installation/).

When running Gateway in `DEV` mode, access the interactive Swagger API documentation at: [http://localhost:15888/docs](http://localhost:15888/docs)

## Architecture [¶](https://hummingbot.org/gateway/\#architecture "Permanent link")

Gateway follows a modular architecture with clear separation of concerns:

```
/src
├── chains/               # Blockchain-specific implementations
│   └── {chain}/         # Each blockchain (ethereum, solana, etc.)
├── connectors/           # DEX-specific implementations
│   ├── {dex}/           # Each DEX connector directory
│   │   ├── router-routes/   # DEX aggregator operations
│   │   ├── amm-routes/      # AMM pool operations
│   │   └── clmm-routes/     # Concentrated liquidity operations
├── services/             # Core services (config, logging, tokens)
├── schemas/              # API request/response schemas
├── templates/            # Base classes and interfaces for connectors
├── tokens/               # Token lists and metadata
├── pools/                # Liquidity pool configurations
└── wallet/               # Wallet management
```

## Governance and Maintenance [¶](https://hummingbot.org/gateway/\#governance-and-maintenance "Permanent link")

Like other connectors, Gateway DEX connectors require ongoing maintenance: fixing bugs, addressing user issues, and keeping up with updates to both the exchange/blockchain API as well as improvements to the Hummingbot connector standard.

Hummingbot Foundation maintains certain reference connectors as the standard and utilizes a community-based maintenance process. We assign [Bounties](https://hummingbot.org/bounties/) to community developers to upgrade and fix bugs for each exchange's connectors in the codebase.

The community can propose changes to connector maintenance, bounty allocations, and connector removals through [Hummingbot Governance Proposals (HGP)](https://hummingbot.org/about/proposals/). This process also determines which blockchains and networks that Gateway supports.

See the **Connector Pots** tab in [HBOT Tracker](https://docs.google.com/spreadsheets/d/1UNAumPMnXfsghAAXrfKkPGRH9QlC8k7Cu1FGQVL1t0M/edit?usp=sharing) for the current allocations for each exchange.

## Contributing [¶](https://hummingbot.org/gateway/\#contributing "Permanent link")

Gateway is part of the open source Hummingbot project. Ways to contribute:

- **Build new connectors**: See [DEX Connectors](https://hummingbot.org/connectors/gateway-connectors/) for implementation guide
- **File issues**: Report bugs at [GitHub Issues](https://github.com/hummingbot/gateway/issues)
- **Submit pull requests**: Contribute code at [GitHub](https://github.com/hummingbot/gateway/pulls)
- **Edit documentation**: Improve docs at [GitHub](https://github.com/hummingbot/hummingbot-site/)
- **Vote on proposals**: Participate in [governance proposals](https://snapshot.org/#/hbot.eth) to vote on which DEXs are supported

## History [¶](https://hummingbot.org/gateway/\#history "Permanent link")

For more information about Gateway's history and architecture decisions, see:

- [Hummingbot Gateway V2 Architecture - Part 1](https://hummingbot.org/blog/hummingbot-gateway-architecture---part-1/)
- [Hummingbot Gateway V2 Architecture - Part 2](https://hummingbot.org/blog/hummingbot-gateway-architecture---part-2/)

Was this page helpful?











Thanks for your feedback!











Thanks for your feedback! Help us improve this page by [filing an issue](https://github.com/hummingbot/hummingbot-site/issues/new?title=[Feedback]+Gateway%20DEX%20Middleware+-+/gateway/).


Back to top