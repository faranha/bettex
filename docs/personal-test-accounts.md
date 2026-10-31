# Personal account and test wallets

## Simple access

In the development preview, open **My account → Account and test wallets**, or `/testes/conta`.

1. Enter name, email, password of at least 12 characters, and confirmation.
2. Read the notice that there is no recovery and check the acceptance.
3. Click **Create account and test wallets**.
4. Under **My wallets**, copy the public address of the desired wallet. Do not confuse address with public key or private key.
5. To save a backup, choose **Download encrypted backup (recommended)**. Read the notices, enter the current password, and mark the responsibility.

The secrets do not appear in the registration. Revealing, copying the private key, downloading an unencrypted file, and downloading a backup are separate actions, each with a new password and confirmation. The revealed key is hidden upon leaving the tab/page or after 60 seconds. Signing out of the account also hides it. Hiding the tab cancels private operations still in progress.

Never share keys, passwords, or backups with alleged attendants. Do not accept remote access or share your screen when showing secrets. An unencrypted file or copied content can be read by other people/applications. Keep the password and an encrypted copy in a safe place: losing them may prevent access. Support cannot reset the password for this new registration.

## Separation and truth of states

This flow has its own development accounts, without automatic Clerk account migration or demonstrative financial history. It does not request email confirmation, documents, or selfies. The email is not presented as verified.

Both wallets are real, personal, and distinct EVM wallets. Creating an address is not a transaction and does not require gas. The initial association is **Arbitrum Sepolia, chain ID 421614**, not Ethereum Mainnet. Keys and addresses remain the same after changing profile or password.

| Part | State and limit |
| --- | --- |
| Registration and login | Implemented, PostgreSQL, one-hour opaque session, no recovery |
| Two wallets | Generated in the browser; metadata separated by purpose and network associations |
| Protection | AES-GCM/PBKDF2 vault; separate scrypt hash; server does not receive keys in plain text |
| Profile, email and password | Implemented; email/password require current password; atomic re-encryption and update |
| Export | Public key, private key, and individual JSON Keystore V3; secret hidden by default |
| Test USDC | Official contract identified, does not represent detected deposit nor confirmed balance |
| Balance query and deposits | Pending RPC adapter and reconciliation; are not simulated as real |
| BETTEX and staking | Personal destination identified by wallet purpose; on-chain contracts/receipts pending |
| Robinhood Chain and Allora | Not provisioned by this flow; agent accounts are not personal wallets |
| Production/mainnet | New registration blocked outside development; no financial sending enabled |

Test USDC: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`, as per Circle. Do not send real assets. A backup can open the wallet in a compatible external tool; it does not recover the BETTEX account nor guarantee access to specific contract positions. If the password changes, previously exported backups remain protected by the password used during export; export new backups if necessary and protect/securely remove old copies.

There are no supply, sale, or staking transactions to present: none have been executed. This is not the completed delivery of the multi-network financial environment.

## Verification

- `pnpm --filter @workspace/api-server check:accounts`
- `pnpm --filter @workspace/bettex-site check:wallets`
- `pnpm quality`

The cryptographic tests compare keys only in memory, without including them in logs. Browser validation uses only synthetic accounts and does not record images of revealed secrets. SQL/tokens/passwords/request bodies are not included in the error messages of the new flow.

Decision and sources: [personal wallets](decisions/0006-personal-test-wallets.md).
