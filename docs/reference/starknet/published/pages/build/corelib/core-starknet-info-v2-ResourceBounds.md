# core::starknet::info::v2::ResourceBounds
Source: https://docs.starknet.io/build/corelib/core-starknet-info-v2-ResourceBounds



V3 transactions resources used for enabling the fee market.

## Signature

```rust theme={null}

#[derive(Copy, Drop, Debug, Serde)]
pub struct ResourceBounds {
    pub resource: felt252,
    pub max_amount: u64,
    pub max_price_per_unit: u128,
}
```

## Members

### resource

The name of the resource.

#### Signature

```rust theme={null}
pub resource: felt252
```

### max\_amount

The maximum amount of the resource allowed for usage during the execution.

#### Signature

```rust theme={null}
pub max_amount: u64
```

### max\_price\_per\_unit

The maximum price the user is willing to pay for the resource unit.

#### Signature

```rust theme={null}
pub max_price_per_unit: u128
```


