# Networks, integrations, and external dependencies

| Component | Actual state | Requirements / limitations |
| --- | --- | --- |
| GitHub | Synchronization service implemented locally; connection pending | Private repository, authorized Git transport, development branch and remote-push verification |
| PostgreSQL / Drizzle | Implemented persistence and isolated fixture checks | Development database for execution; no database data belongs in Git |
| Clerk | Implemented existing authentication adapter | Correct tenant and environment keys; hosted production proxy configuration is external |
| Native test accounts | Implemented, development-only | Browser-encrypted EVM vaults; not production account recovery/KYC |
| Local EVM | Implemented contract library and tests, chain 31337 | Free MockUSDC, loopback node, new epoch on restart; no real funds |
| Arbitrum Sepolia | Existing observation adapter and test-network association | Public test deployment/funding and end-to-end evidence remain separate requirements |
| Arbitrum mainnet | Product target; no production execution authorized | No repository preparation, CI or demo starts mainnet execution |
| Polymarket Gamma/CLOB | Read adapters and market observation; paper infrastructure | Live trading, custody/signing and fill reconciliation are not implemented as production execution |
| Allora | Public-data research exists; operational integration blocked | Verified topics, horizons, model/event mapping and calibration still required |
| Robinhood/FOMO | Product/provider direction and reference material | Do not infer funded trading connectivity from logos or documentation |
| Telegram / YouTube | Public community link / privacy-enhanced Pitch embed | External content and availability; not financial integrations |
| Replit | Artifact proxy, managed services/auth configuration, connector flow | Optional development platform; local ports/proxy documented separately |

Provider names and logos do not imply partnerships, grants, audits or
endorsements. Research observations have timestamps and do not establish current
service availability. See the detailed [integration blockers](integration-pendencies.md)
and [Allora research](allora-live-chart-research.md).

Runtime secrets must remain in the platform secret manager or a private ignored
environment file. Public keys are not secret keys. No Git remote may contain a
token/password. The sync watcher invokes Git through the installed supported
credential manager; its retries cannot repair revoked scopes without authorization.
