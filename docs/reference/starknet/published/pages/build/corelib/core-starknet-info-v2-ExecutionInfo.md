# core::starknet::info::v2::ExecutionInfo
Source: https://docs.starknet.io/build/corelib/core-starknet-info-v2-ExecutionInfo



The same as `ExecutionInfo`, but with the `TxInfo` field replaced with `v2::TxInfo`.

## Signature

```rust theme={null}

#[derive(Copy, Drop, Debug)]
pub struct ExecutionInfo {
    pub block_info: Box,
    pub tx_info: Box,
    pub caller_address: ContractAddress,
    pub contract_address: ContractAddress,
    pub entry_point_selector: felt252,
}
```

## Members

### block\_info

#### Signature

```rust theme={null}
pub block_info: Box
```

### tx\_info

#### Signature

```rust theme={null}
pub tx_info: Box
```

### caller\_address

#### Signature

```rust theme={null}
pub caller_address: ContractAddress
```

### contract\_address

#### Signature

```rust theme={null}
pub contract_address: ContractAddress
```

### entry\_point\_selector

#### Signature

```rust theme={null}
pub entry_point_selector: felt252
```


