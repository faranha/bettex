# Complete personal dashboard

## Scope and preservation

The creator requires personal account data, details, wallets and balances in the development dashboard, not exclusively behind account or balance navigation. Dedicated balance/history, account/security, treasury, simulation and trading pages remain available. The public production preview remains illustrative; this change does not activate development accounts or financial APIs in production.

## Data ownership

The browser-scoped demo is presented as an automatically active **test session**, with ALFA/testing/no-real-money labels. Its default dashboard, wallets and account-management paths do not require sign-in. This is not native/Clerk authentication and must never authorize protected blockchain, key-export or administrative APIs. Existing actual account tests remain available via an explicit account-provider URL; authenticated actual accounts retain their own identity and wallets.

The scenario simulator also supports the browser demo under its own cookie-derived owner namespace and CSRF-bound commands. It reuses only the pure emulated scenario engine; its runs are separate from native-account runs, application balances and EVM runtime. Treasury remains readable in the default demo, without presenting an administrative sign-in requirement as a missing demo session.

- Demo profile, balances and movements come from the existing server-owned demonstration snapshot.
- Native account metadata and personal public wallet addresses come from the authenticated account-session endpoint. They are shown only when its identity matches the dashboard's authenticated native owner.
- Native balances and participation come from the existing local-chain journey endpoint, only after both personal wallets have an explicit local association. Chain, environment and both wallet addresses must match before displaying readings.
- Emulated balances never substitute missing native readings. Unavailable readings are not rendered as zero. Old readings are explicitly marked stale.
- Integer-string amounts retain exact precision. No monetary value is inferred from a wallet address, demonstration amount or AI response.
- Native personal history uses the existing native audit/history read model. Demonstrative histories retain their own scope.

## Functional access

The overview retains contextual demonstration-wallet actions and links to complete statements and account management. Native wallet management and operations links select their respective existing account tabs. Secret export and signing remain behind the existing authentication, consent and confirmation flows; the overview never displays or exports private wallet material.

The native account overview includes account identity, registration date, the two public wallet addresses, registered networks, confirmed local-test asset balances when available, eligible participation, round timing/weight, assessed amount and paid amount. An assessed amount is not automatically described as unpaid; the USDC wallet balance is not described as a staking receivable.

## Verification

Verification covers exact amount formatting, identity and chain/address rejection, localized dashboard copy, frontend typing/build, existing wallet-safety checks and architecture checks. Browser checks use newly created test identities and do not modify existing accounts, roles or the shared EVM runtime. Browser-only response fixtures, when used, verify presentation/error handling and are not evidence of on-chain execution.
