# API Reference
Source: https://docs.starknet.io/build/starkzap/api-reference

Complete API documentation for Starkzap

## StarkZap

The main SDK class for initializing and managing wallet connections.

### Constructor

```typescript theme={null}
new StarkZap(config: SDKConfig): StarkZap
```

### Methods

| Method                       | Returns                             | Description                                       |
| ---------------------------- | ----------------------------------- | ------------------------------------------------- |
| `connectWallet(options)`     | `Promise<Wallet>`                   | Connect with signer + account preset              |
| `connectCartridge(options?)` | `Promise<CartridgeWalletInterface>` | Connect via Cartridge Controller popup (web only) |
| `onboard(options)`           | `Promise<OnboardResult>`            | Onboard with strategy selection                   |
| `stakingTokens()`            | `Promise<Token[]>`                  | Get stakeable tokens                              |
| `getStakerPools(staker)`     | `Promise<Pool[]>`                   | Get validator's delegation pools                  |
| `getBridgingTokens(chain?)`  | `Promise<BridgeToken[]>`            | Get bridgeable tokens by source chain             |
| `getProvider()`              | `RpcProvider`                       | Get the underlying RPC provider                   |
| `callContract(call)`         | `Promise<CallContractResponse>`     | Call a contract read function                     |

### Configuration

```typescript theme={null}
interface SDKConfig {
  network?: NetworkName | NetworkPreset;
  rpcUrl?: string;
  chainId?: ChainId;
  allowInsecureHttp?: boolean; // accept plain http:// off loopback; dev only
  paymaster?: PaymasterOptions; // { nodeUrl?: string; default?: boolean; headers?: object }
  explorer?: ExplorerConfig;
  staking?: StakingConfig;
  bridging?: BridgingConfig;
}
```

### ConnectWalletOptions

```typescript theme={null}
interface ConnectWalletOptions {
  account: AccountConfig;
  accountAddress?: Address;
  feeMode?: FeeMode;
  timeBounds?: PaymasterTimeBounds;
  swapProviders?: SwapProvider[];
  defaultSwapProviderId?: string;
  dcaProviders?: DcaProvider[];
  defaultDcaProviderId?: string;
}

interface AccountConfig {
  signer: SignerInterface;
  accountClass?: AccountClassConfig;
}
```

## Wallet / WalletInterface

The wallet interface provides access to account operations, transactions, and token management.

### Properties

| Property  | Type      | Description    |
| --------- | --------- | -------------- |
| `address` | `Address` | Wallet address |

### Methods

| Method                                                                               | Returns                                        | Description                                                          |
| ------------------------------------------------------------------------------------ | ---------------------------------------------- | -------------------------------------------------------------------- |
| `isDeployed()`                                                                       | `Promise<boolean>`                             | Check deployment status                                              |
| `ensureReady(options?)`                                                              | `Promise<void>`                                | Deploy if needed                                                     |
| `deploy(options?)`                                                                   | `Promise<Tx>`                                  | Deploy account contract                                              |
| `execute(calls, options?)`                                                           | `Promise<Tx>`                                  | Execute contract calls                                               |
| `signMessage(typedData)`                                                             | `Promise<Signature>`                           | Sign typed data                                                      |
| `preflight(options)`                                                                 | `Promise<PreflightResult>`                     | Simulate transaction                                                 |
| `tx()`                                                                               | `TxBuilder`                                    | Create a transaction builder                                         |
| `balanceOf(token)`                                                                   | `Promise<Amount>`                              | Get token balance                                                    |
| `transfer(token, transfers, options?)`                                               | `Promise<Tx>`                                  | Transfer ERC20 tokens                                                |
| `stake(pool, amount, options?)`                                                      | `Promise<Tx>`                                  | Smart stake (enter or add)                                           |
| `enterPool(pool, amount, options?)`                                                  | `Promise<Tx>`                                  | Enter staking pool                                                   |
| `addToPool(pool, amount, options?)`                                                  | `Promise<Tx>`                                  | Add to existing stake                                                |
| `claimPoolRewards(pool, options?)`                                                   | `Promise<Tx>`                                  | Claim staking rewards                                                |
| `exitPoolIntent(pool, amount, options?)`                                             | `Promise<Tx>`                                  | Start exit process                                                   |
| `exitPool(pool, options?)`                                                           | `Promise<Tx>`                                  | Complete exit                                                        |
| `isPoolMember(pool)`                                                                 | `Promise<boolean>`                             | Check pool membership                                                |
| `getPoolPosition(pool)`                                                              | `Promise<PoolMember \| null>`                  | Get staking position                                                 |
| `getPoolCommission(pool)`                                                            | `Promise<number>`                              | Get pool commission rate                                             |
| `estimateFee(calls)`                                                                 | `Promise<EstimateFeeResponse>`                 | Estimate execution fee                                               |
| `getAccount()`                                                                       | `Account`                                      | Get starknet.js Account                                              |
| `getProvider()`                                                                      | `RpcProvider`                                  | Get RPC provider                                                     |
| `getChainId()`                                                                       | `ChainId`                                      | Get chain ID                                                         |
| `getFeeMode()`                                                                       | `FeeMode`                                      | Get default fee mode                                                 |
| `erc20(token)`                                                                       | `Erc20`                                        | Get ERC20 helper for token                                           |
| `getClassHash()`                                                                     | `string`                                       | Get account class hash                                               |
| `getQuote(request)`                                                                  | `Promise<SwapQuote>`                           | Get swap quote                                                       |
| `prepareSwap(request)`                                                               | `Promise<PreparedSwap>`                        | Prepare swap calls                                                   |
| `swap(request, options?)`                                                            | `Promise<Tx>`                                  | Execute a token swap                                                 |
| `registerSwapProvider(provider, makeDefault?)`                                       | `void`                                         | Register a swap provider                                             |
| `setDefaultSwapProvider(providerId)`                                                 | `void`                                         | Set the default swap provider                                        |
| `getSwapProvider(providerId)`                                                        | `SwapProvider`                                 | Get a registered swap provider                                       |
| `getDefaultSwapProvider()`                                                           | `SwapProvider`                                 | Get the default swap provider                                        |
| `listSwapProviders()`                                                                | `string[]`                                     | List registered swap provider IDs                                    |
| `dca()`                                                                              | `DcaClientInterface`                           | Get DCA (recurring buy) client                                       |
| `lending()`                                                                          | `LendingClient`                                | Get lending client                                                   |
| `staking(poolAddress)`                                                               | `Promise<Staking>`                             | Get staking helper for a pool                                        |
| `stakingInStaker(stakerAddress, token)`                                              | `Promise<Staking>`                             | Get staking helper from a staker                                     |
| `lstStaking(asset, options?)`                                                        | `EndurStaking`                                 | Get Endur liquid staking helper for an asset                         |
| `troves(options?)`                                                                   | `Troves`                                       | Get Troves strategy client                                           |
| `callContract(call)`                                                                 | `Promise<CallContractResponse>`                | Read-only contract call                                              |
| `disconnect()`                                                                       | `Promise<void>`                                | Disconnect wallet                                                    |
| `deposit(recipient, amount, token, externalWallet, options?)`                        | `Promise<{ hash: string }>`                    | Bridge deposit from external chain                                   |
| `getDepositBalance(token, externalWallet)`                                           | `Promise<Amount>`                              | Get source-chain available balance                                   |
| `getAllowance(token, externalWallet)`                                                | `Promise<Amount \| null>`                      | Get source-chain allowance (if applicable)                           |
| `getDepositFeeEstimate(token, externalWallet, options?)`                             | `Promise<BridgeDepositFeeEstimation>`          | Estimate bridge route fees                                           |
| `initiateWithdraw(recipient, amount, token, externalWallet, options?)`               | `Promise<Tx>`                                  | Initiate withdrawal from Starknet to external chain                  |
| `completeWithdraw(recipient, amount, token, externalWallet, options?)`               | `Promise<{ hash: string }>`                    | Complete withdrawal on external chain (Canonical & CCTP only)        |
| `getWithdrawBalance(token, externalWallet)`                                          | `Promise<Amount>`                              | Get L2 balance available to withdraw                                 |
| `getInitiateWithdrawFeeEstimate(token, externalWallet, options?)`                    | `Promise<BridgeInitiateWithdrawFeeEstimation>` | Estimate L2 fee for initiating withdrawal                            |
| `getCompleteWithdrawFeeEstimate(amount, recipient, token, externalWallet, options?)` | `Promise<BridgeCompleteWithdrawFeeEstimation>` | Estimate L1 gas for completing withdrawal                            |
| `monitorDeposit(token, externalTxHash, starknetTxHash?)`                             | `Promise<DepositMonitorResult>`                | Get full deposit status snapshot                                     |
| `monitorWithdrawal(token, snTxHash, externalTxHash?)`                                | `Promise<WithdrawMonitorResult>`               | Get full withdrawal status snapshot (includes CCTP attestation data) |
| `getDepositState(token, param)`                                                      | `Promise<DepositState>`                        | Simplified deposit state for UI                                      |
| `getWithdrawalState(token, param)`                                                   | `Promise<WithdrawalState>`                     | Simplified withdrawal state for UI                                   |

## Tx

Transaction object returned from `execute()`, `deploy()`, and `transfer()`.

### Properties

| Property      | Type     | Description        |
| ------------- | -------- | ------------------ |
| `hash`        | `string` | Transaction hash   |
| `explorerUrl` | `string` | Block explorer URL |

### Methods

| Method                      | Returns              | Description                                                        |
| --------------------------- | -------------------- | ------------------------------------------------------------------ |
| `wait(options?)`            | `Promise<void>`      | Wait for confirmation                                              |
| `watch(callback, options?)` | `TxUnsubscribe`      | Watch status changes (options: pollIntervalMs, timeoutMs, onError) |
| `receipt()`                 | `Promise<TxReceipt>` | Get transaction receipt                                            |

## TxBuilder

Fluent API for building and executing batched transactions.

### Properties

| Property  | Type      | Description                      |
| --------- | --------- | -------------------------------- |
| `length`  | `number`  | Number of queued call groups     |
| `isEmpty` | `boolean` | Whether the builder has no calls |
| `isSent`  | `boolean` | Whether `send()` has been called |

### Methods

| Method                                         | Returns                        | Description                                    |
| ---------------------------------------------- | ------------------------------ | ---------------------------------------------- |
| `.add(...calls)`                               | `TxBuilder`                    | Add raw `Call` objects                         |
| `.approve(token, spender, amount)`             | `TxBuilder`                    | ERC20 approval                                 |
| `.transfer(token, transfers)`                  | `TxBuilder`                    | ERC20 transfer(s)                              |
| `.stake(pool, amount)`                         | `TxBuilder`                    | Smart stake (enter or add based on membership) |
| `.enterPool(pool, amount)`                     | `TxBuilder`                    | Enter pool as new member                       |
| `.addToPool(pool, amount)`                     | `TxBuilder`                    | Add to existing pool position                  |
| `.claimPoolRewards(pool)`                      | `TxBuilder`                    | Claim staking rewards                          |
| `.exitPoolIntent(pool, amount)`                | `TxBuilder`                    | Start exit process                             |
| `.exitPool(pool)`                              | `TxBuilder`                    | Complete exit after window                     |
| `.swap(request)`                               | `TxBuilder`                    | Provider-driven token swap                     |
| `.lendDeposit(request)`                        | `TxBuilder`                    | Lending deposit (supply)                       |
| `.lendWithdraw(request)`                       | `TxBuilder`                    | Lending withdraw                               |
| `.lendWithdrawMax(request)`                    | `TxBuilder`                    | Lending max withdraw                           |
| `.lendBorrow(request)`                         | `TxBuilder`                    | Lending borrow                                 |
| `.lendRepay(request)`                          | `TxBuilder`                    | Lending repay                                  |
| `.trovesDeposit(params)`                       | `TxBuilder`                    | Troves strategy deposit                        |
| `.trovesWithdraw(params)`                      | `TxBuilder`                    | Troves strategy withdraw                       |
| `.dcaCreate(request)`                          | `TxBuilder`                    | Create a DCA (recurring buy) order             |
| `.dcaCancel(request)`                          | `TxBuilder`                    | Cancel a DCA order                             |
| `.confidentialFund(confidential, details)`     | `TxBuilder`                    | Fund confidential account                      |
| `.confidentialTransfer(confidential, details)` | `TxBuilder`                    | Confidential transfer                          |
| `.confidentialWithdraw(confidential, details)` | `TxBuilder`                    | Withdraw from confidential to public address   |
| `.calls()`                                     | `Promise<Call[]>`              | Resolve all calls without sending              |
| `.estimateFee()`                               | `Promise<EstimateFeeResponse>` | Estimate gas cost                              |
| `.preflight()`                                 | `Promise<PreflightResult>`     | Simulate the transaction                       |
| `.send(options?)`                              | `Promise<Tx>`                  | Execute all calls atomically                   |

## Amount

Type-safe amount handling for token values.

### Static Methods

| Method                         | Returns  | Description               |
| ------------------------------ | -------- | ------------------------- |
| `Amount.parse(value, token)`   | `Amount` | From human-readable value |
| `Amount.fromRaw(value, token)` | `Amount` | From raw blockchain value |

### Instance Methods

| Method                     | Returns               | Description                  |
| -------------------------- | --------------------- | ---------------------------- |
| `toUnit()`                 | `string`              | Human-readable string        |
| `toBase()`                 | `bigint`              | Raw value for contracts      |
| `toFormatted(compressed?)` | `string`              | Locale-formatted with symbol |
| `getDecimals()`            | `number`              | Token decimal places         |
| `getSymbol()`              | `string \| undefined` | Token symbol                 |
| `add(other)`               | `Amount`              | Addition                     |
| `subtract(other)`          | `Amount`              | Subtraction                  |
| `multiply(scalar)`         | `Amount`              | Multiplication               |
| `divide(scalar)`           | `Amount`              | Division                     |
| `eq(other)`                | `boolean`             | Equal                        |
| `gt(other)`                | `boolean`             | Greater than                 |
| `gte(other)`               | `boolean`             | Greater than or equal        |
| `lt(other)`                | `boolean`             | Less than                    |
| `lte(other)`               | `boolean`             | Less than or equal           |
| `isZero()`                 | `boolean`             | Is zero                      |
| `isPositive()`             | `boolean`             | Is positive                  |

## Signers

### StarkSigner

Local Stark curve signer for private key management.

```typescript theme={null}
new StarkSigner(privateKey: string): StarkSigner
```

### PrivySigner

Privy server-side key management signer.

```typescript theme={null}
new PrivySigner(config: {
  walletId: string;
  publicKey: string;
  serverUrl?: string;
  rawSign?: (walletId: string, hash: string) => Promise<string>;
}): PrivySigner
```

### SignerInterface

Custom signer interface for implementing your own key management.

```typescript theme={null}
interface SignerInterface {
  getPubKey(): Promise<string>;
  signRaw(hash: string): Promise<Signature>;
}
```

## Types

### Address

Branded string type for Starknet addresses.

```typescript theme={null}
type Address = string & { readonly __type: "StarknetAddress" };

// Create from BigNumberish (string, number, or bigint)
fromAddress(value: BigNumberish): Address
```

### ChainId

Chain ID utilities and constants.

```typescript theme={null}
class ChainId {
  static MAINNET: ChainId;
  static SEPOLIA: ChainId;
  
  static from(literal: ChainIdLiteral): ChainId;
  static fromFelt252(felt: string): ChainId;
  
  isMainnet(): boolean;
  isSepolia(): boolean;
  toFelt252(): string;
  toLiteral(): ChainIdLiteral;
}
```

### FeeMode

Transaction fee payment mode.

```typescript theme={null}
type FeeMode =
  | "user_pays"
  | { type: "paymaster"; gasToken?: Address }
  | "sponsored"; // deprecated alias for { type: "paymaster" }
```

### DeployMode

Account deployment policy.

```typescript theme={null}
type DeployMode = "never" | "if_needed" | "always";
```

### OnboardStrategy

Onboarding strategy selection.

```typescript theme={null}
const OnboardStrategy = {
  Signer: "signer",
  Privy: "privy",
  Cartridge: "cartridge",
} as const;

type OnboardStrategy = (typeof OnboardStrategy)[keyof typeof OnboardStrategy];
```

## Interfaces

### Token

```typescript theme={null}
interface Token {
  name: string;
  address: Address;
  decimals: number;
  symbol: string;
  metadata?: { logoUrl?: URL };
}
```

### BridgingConfig

```typescript theme={null}
interface BridgingConfig {
  layerZeroApiKey?: string; // required for OFT/OFT-migrated routes
  layerswapApiKey?: string; // required for Layerswap routes + token discovery
  layerswapBaseUrl?: string; // defaults to https://api.layerswap.io
  layerswapAllowedContracts?: readonly Address[]; // extra contracts Layerswap may call; unset = transfer only
  ethereumRpcUrl?: string;
  solanaRpcUrl?: string;
}
```

### ExternalChain

```typescript theme={null}
enum ExternalChain {
  ETHEREUM = "ethereum",
  SOLANA = "solana",
}
```

### BridgeToken

```typescript theme={null}
abstract class BridgeToken {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  chain: ExternalChain;
  protocol: Protocol;
  address: ExternalAddress;      // source-chain token
  bridgeAddress: ExternalAddress; // source-chain bridge
  starknetAddress: Address;      // destination token on Starknet
  starknetBridge: Address;       // destination bridge contract
}
// Concrete subclasses: EthereumBridgeToken, SolanaBridgeToken
```

### WithdrawalState

Simplified withdrawal state for use in UI polling.

```typescript theme={null}
type WithdrawalState = "PENDING" | "READY_TO_CLAIM" | "COMPLETED" | "ERROR";
```

| Value            | Meaning                                                            |
| ---------------- | ------------------------------------------------------------------ |
| `PENDING`        | Bridging in progress — no user action needed                       |
| `READY_TO_CLAIM` | Ready to finalize on L1 — call `completeWithdraw` (CCTP/Canonical) |
| `COMPLETED`      | Bridge flow fully complete                                         |
| `ERROR`          | Unrecoverable error                                                |

### DepositState

Simplified deposit state for use in UI polling.

```typescript theme={null}
type DepositState = "PENDING" | "COMPLETED" | "ERROR";
```

### InitiateBridgeWithdrawOptions

Discriminated union by `protocol`:

```typescript theme={null}
type InitiateBridgeWithdrawOptions =
  | {
      protocol: "canonical";
      autoWithdraw?: boolean;       // let a relayer handle L1 completion
      preferredFeeToken?: Token;    // fee token for the auto-withdraw relayer
    }
  | {
      protocol: "cctp";
      fastTransfer?: boolean;       // use CCTP fast transfer path
    }
  | {
      protocol: "oft" | "oft-migrated";
    }
  | {
      protocol: "hyperlane";
    };
```

### CompleteBridgeWithdrawOptions

Options required for the L1 completion step (CCTP only). The attestation data is returned by `monitorWithdrawal`.

```typescript theme={null}
type CompleteBridgeWithdrawOptions = {
  protocol: "cctp";
  attestation: string;       // Circle-issued attestation
  message: string;           // encoded CCTP message
  nonce?: string;
  expirationBlock?: number;  // attestation expiry — re-attestation is automatic
};
```

### BridgeInitiateWithdrawFeeEstimation

```typescript theme={null}
interface BridgeInitiateWithdrawFeeEstimation {
  l2Fee: Amount;
  l2FeeError?: FeeErrorCause;
  // Canonical with autoWithdraw only:
  autoWithdrawFee?: { amount: Amount; token: Token };
  autoWithdrawFeeError?: FeeErrorCause;
  // CCTP only:
  fastTransferBpFee?: number; // basis points, e.g. 14 = 0.14%
}
```

### BridgeCompleteWithdrawFeeEstimation

```typescript theme={null}
interface BridgeCompleteWithdrawFeeEstimation {
  l1Fee: Amount;
  l1FeeError?: FeeErrorCause;
}
```

### Connected External Wallets

```typescript theme={null}
ConnectedEthereumWallet.from(
  {
    chain: ExternalChain.ETHEREUM,
    provider: eip1193Provider,
    address: "0x...",
    chainId: "0x1",
  },
  starknetChainId
);

ConnectedSolanaWallet.from(
  {
    chain: ExternalChain.SOLANA,
    provider: solanaProvider,
    address: "So1...",
    chainId: "<solana-genesis-hash>",
  },
  starknetChainId
);
```

### Pool

```typescript theme={null}
interface Pool {
  poolContract: Address;
  token: Token;
  amount: Amount;
}
```

### PoolMember

```typescript theme={null}
interface PoolMember {
  staked: Amount;
  rewards: Amount;
  total: Amount;
  unpooling: Amount;
  unpoolTime: Date | null;
  commissionPercent: number;
  rewardAddress: Address;
}
```

### Validator

```typescript theme={null}
interface Validator {
  name: string;
  stakerAddress: Address;
  logoUrl: URL | null;
}
```

### PreflightResult

```typescript theme={null}
interface PreflightResultOk { ok: true }
interface PreflightResultError { ok: false; reason: string }
type PreflightResult = PreflightResultOk | PreflightResultError;
```

## Presets

### Token Presets

```typescript theme={null}
import { mainnetTokens, sepoliaTokens } from "starkzap";

// Access tokens
const STRK = mainnetTokens.STRK;
const USDC = mainnetTokens.USDC;
```

### Validator Presets

```typescript theme={null}
import { mainnetValidators, sepoliaValidators } from "starkzap";

// Access validators
for (const validator of Object.values(mainnetValidators)) {
  console.log(validator.name);
}
```

### Account Presets

```typescript theme={null}
import {
  OpenZeppelinPreset,
  ArgentPreset,
  ArgentXV050Preset,
  BraavosPreset,
  DevnetPreset,
} from "starkzap";
```

## Utility Functions

### fromAddress

Parse and validate a Starknet address.

```typescript theme={null}
fromAddress(value: BigNumberish): Address
```

### getChainId

Get chain ID from a provider.

```typescript theme={null}
getChainId(provider: RpcProvider): Promise<ChainId>
```

### getPresets

Get token or validator presets for a chain ID.

```typescript theme={null}
getPresets(chainId: ChainId): Record<string, Token>
```

### getTokensFromAddresses

Resolve token metadata from contract addresses.

```typescript theme={null}
getTokensFromAddresses(
  addresses: Address[],
  provider: RpcProvider
): Promise<Token[]>
```


