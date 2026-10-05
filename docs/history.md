# BETTEX History

## Source and scope

The audit domain maintains a single persistent journal, shared by the six queries. Accounts, wallets, execution, ledger, and reconciliation maintain their responsibilities. Ports injected into the composition record execution transitions in the same PostgreSQL transaction; account and emulation also record effect and journal atomically. External confirmations require receipts and canonical blocks; the observer resumes idempotent ingestion after failure.

Journal values are strings of integer units: USDC 6 places, BETTEX 18, and ETH 18. This does not convert the legacy demo engine, which uses JavaScript numbers, into a production ledger. Its facts remain identified as simulation, without real money. New executed prices are captured in the request and preserved, not recalculated on confirmation.

Local purchases have a single user financial fact. Approval, submission, treasury principal, and participation are correlated steps. Participation is based on wallet balance and quantity × seconds, with cancellation of the previous weight upon exit according to the current rule. There is no fictitious transfer for staking.

Native distributions do not yet exist; they are not invented. The demo engine's daily closing records existing emulation calculations and payments. The manual preview only calculates an estimate in the simulation: it does not credit balance, does not make rights available, and does not confirm payment.

## Migration and operation

Apply the existing base schema and run `pnpm --filter @workspace/db migrate:history` on the explicitly selected database. The migration is idempotent, does not erase data, and does not grant permissions. In development, there is initialization compatible with the native path standard; production does not execute DDL automatically.

The journal has deterministic uniqueness, an index by owner/date/ID, a correlation index, and PostgreSQL protection against UPDATE/DELETE. Corrections are linked events. Cursor pagination uses date and ID, sequence snapshot, and linked scope/filters: events inserted between pages do not change the set in progress.

The local observer captures events from wallets explicitly associated with 31337 every 15 seconds, even with the browser closed. Test accounts and the observer are not enabled in production. The query presents the persisted records and an explicit warning if the reconciliation cannot verify the current state.

## Access and privacy

The session determines the owner on the server. The personal account now enters the demo itself: profile, security, wallets, local operations, and history are kept in My Account. Your session also determines the identity of the dashboard and emulated balances. Existing Clerk/browser accounts are preserved; there is no merging by email nor appropriation of data from another account. User IDs sent by the browser do not choose the owner. Technical data does not appear in the common history.

Administrative detailing requires the persisted `treasury_history` permission in `test_account_permissions`, linked to the existing account. No account gains this access at registration, via the browser, or via environment variable. The grant depends on authorized base administration; there is no self-elevation screen. Existing public contract/treasury data remains aggregated and does not receive private activities.

The migration captures grants, revocations, and changes to this permission in the same transaction as the base administration. The target receives the private event and the administration receives its restricted projection, without copying name, email, or credentials. The actor identifies the authorized base administration, does not claim to know the person who executed the SQL.

No password, wallet secret, seed phrase, cookie, session, ciphertext, or backup content is recorded. Profile records only the changed field, without replicating names/emails. Failures use limited codes, not stack traces or SQL parameters. Export records authorization and execution reported by the client, never confirmation that a file was saved.

There is no automatic deletion of financial/audit facts. As long as current rules do not define an additional deadline, do not invent a retention period or erase the trail. Personal data remains in existing identity sources; changes to retention/anonymization require an approved policy.

## Recovery and gaps

Proven EVM local events are recovered with hash, block, index, source, and rebuilt stamp when prior to the start of capture. Recovered/seeded demo JSON history is explicitly non-authoritative. Old unproven activities are not fabricated: login, consent, authorization, and original request instant may be absent.

The journal informs its capture start. This does not claim completeness for operations that do not yet exist, unconnected networks, Clerk actions outside the application, or material discarded before migration. For a personal account session, the query gathers only the native and emulated records of that same account, with the environments identified; distinct Clerk identities are not merged. Emulated balances do not represent balance on the local blockchain or on a public network.

## Demo administration

The administrative grant is done outside the browser and remains in the journal. Development provisioning uses the normal registry and generates the same encrypted wallet vault; it receives credentials only via standard input, without writing them to code or logs. The initial emulated credit and participation are recorded in the same transaction as the balances. Rerunning provisioning does not duplicate the credit or replace the wallets.
