# core::integer::u256
Source: https://docs.starknet.io/build/corelib/core-integer-u256



The 256-bit unsigned integer type.
The `u256` type is composed of two 128-bit parts: the low part \[0, 128) and the high part \[128,
256\).

## Signature

```rust theme={null}

#[derive(Copy, Drop, Hash, PartialEq, Serde)]
pub struct u256 {
    pub low: u128,
    pub high: u128,
}
```

## Members

### low

#### Signature

```rust theme={null}
pub low: u128
```

### high

#### Signature

```rust theme={null}
pub high: u128
```


