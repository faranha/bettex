# Test accounts and personal wallets under holder control

**Status:** development implementation, without Clerk replacement.

The requested registration waives email verification, KYC, and recovery. Existing Clerk accounts are preserved: login migration has not been authorized. The new flow is located at `/testes/conta`, with its own identity and session, unavailable when `NODE_ENV` is not `development`. There is no import of demonstration balances.

The two EVM wallets are generated in the browser with ethers 6.16, cryptographic randomness, and distinct keys. The server receives public metadata and an AES-256-GCM/PBKDF2-SHA256 vault (600,000 iterations), never the keys. The authentication password uses a separate scrypt. There is no administrative key for decryption, recovery, or server-side signing.

`accounts` possesses identity, authentication, consents, and sessions; `wallets` possesses vaults, wallets, and network associations. The HTTP composition injects its adapters into use cases and coordinates a PostgreSQL transaction for registration and password change. This composition point, outside the modules, can import the adapters of the two contexts; it does not grant cross-access to the tables within them.

Registration and password change are atomic. Internal IDs remain immutable. Repeating the registration identifier requires the correct password and preserves the originally assigned wallets. Changing the password re-encrypts on the client, with revision control and revocation of other sessions.

Revealing, copying, or downloading private material requires the current password, a warning against scams, and an unchecked confirmation. Temporary revelation is closed upon leaving the page, hiding the tab, or the deadline expiring. Individual backup uses JSON Keystore V3, interoperable with ethers and compatible tools; it does not restore the application account.

The initial association is Arbitrum Sepolia, chain ID 421614. No agents or workers are provisioned per user. The model supports other associations, but they are not implicitly enabled. No balance, deposit, contract, or payment is declared confirmed solely by the existence of an address. Staking and financial operations remain pending contracts and reconciliation; wallet creation does not execute transactions.

Sources verified on 2026-10-05:
- Corpus Arbitrum: `pnpm docs:query --platform arbitrum --query "Arbitrum Sepolia chain ID 421614"`.
- https://docs.ethers.org/v6/api/wallet/ — random generation and JSON Keystore.
- https://developers.circle.com/stablecoins/usdc-contract-addresses — Arbitrum Sepolia test USDC: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`.

**Limits:** this work delivers registration and wallet protection, it does not complete the multi-network financial environment. There is no mainnet, provisioning, contract deployment, asset distribution, or on-chain staking enabled.
