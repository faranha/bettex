# core::starknet::info::v2::TxInfo
Source: https://docs.starknet.io/build/corelib/core-starknet-info-v2-TxInfo



Extended information about the current transaction.

## Signature

```rust theme={null}

#[derive(Copy, Drop, Debug, Serde)]
pub struct TxInfo {
    pub version: felt252,
    pub account_contract_address: ContractAddress,
    pub max_fee: u128,
    pub signature: Span,
    pub transaction_hash: felt252,
    pub chain_id: felt252,
    pub nonce: felt252,
    pub resource_bounds: Span,
    pub tip: u128,
    pub paymaster_data: Span,
    pub nonce_data_availability_mode: u32,
    pub fee_data_availability_mode: u32,
    pub account_deployment_data: Span,
}
```

## Members

### version

The version of the transaction. It is fixed (currently, 1) in the OS, and should be
signed by the account contract.
This field allows invalidating old transactions, whenever the meaning of the other
transaction fields is changed (in the OS).

#### Signature

```rust theme={null}
pub version: felt252
```

### account\_contract\_address

The account contract from which this transaction originates.

#### Signature

```rust theme={null}
pub account_contract_address: ContractAddress
```

### max\_fee

The `max_fee` field of the transaction.

#### Signature

```rust theme={null}
pub max_fee: u128
```

### signature

The signature of the transaction.

#### Signature

```rust theme={null}
pub signature: Span
```

### transaction\_hash

The hash of the transaction.

#### Signature

```rust theme={null}
pub transaction_hash: felt252
```

### chain\_id

The identifier of the chain.
This field can be used to prevent replay of testnet transactions on mainnet.

#### Signature

```rust theme={null}
pub chain_id: felt252
```

### nonce

The transaction's nonce.

#### Signature

```rust theme={null}
pub nonce: felt252
```

### resource\_bounds

A span of `ResourceBounds` structs used for V3 transactions.

#### Signature

```rust theme={null}
pub resource_bounds: Span
```

### tip

The tip of the transaction.

#### Signature

```rust theme={null}
pub tip: u128
```

### paymaster\_data

If specified, the paymaster should pay for the execution of the transaction.
The data includes the address of the paymaster sponsoring the transaction, followed by
extra data to send to the paymaster.
Used for V3 transactions.

#### Signature

```rust theme={null}
pub paymaster_data: Span
```

### nonce\_data\_availability\_mode

The data availability mode for the nonce.
Used for V3 transactions.

#### Signature

```rust theme={null}
pub nonce_data_availability_mode: u32
```

### fee\_data\_availability\_mode

The data availability mode for the account balance from which fee will be taken.
Used for V3 transactions.

#### Signature

```rust theme={null}
pub fee_data_availability_mode: u32
```

### account\_deployment\_data

If nonempty, will contain the required data for deploying and initializing an account
contract: its class hash, address salt and constructor calldata.
Used for V3 transactions.

#### Signature

```rust theme={null}
pub account_deployment_data: Span
```


