# core::starknet::account::Call
Source: https://docs.starknet.io/build/corelib/core-starknet-account-Call



A struct representing a call to a contract.

## Signature

```rust theme={null}

#[derive(Drop, Copy, Serde, Debug)]
pub struct Call {
    pub to: ContractAddress,
    pub selector: felt252,
    pub calldata: Span,
}
```

## Members

### to

The address of the contract to call.

#### Signature

```rust theme={null}
pub to: ContractAddress
```

### selector

The entry point selector in the called contract.

#### Signature

```rust theme={null}
pub selector: felt252
```

### calldata

The calldata to pass to entry point.

#### Signature

```rust theme={null}
pub calldata: Span
```


