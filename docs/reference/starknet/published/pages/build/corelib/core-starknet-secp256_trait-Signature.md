# core::starknet::secp256_trait::Signature
Source: https://docs.starknet.io/build/corelib/core-starknet-secp256_trait-Signature



Represents a Secp2561 ECDSA signature.
This struct holds the components of an ECDSA signature: `r`, `s`, and `y_parity`.

## Signature

```rust theme={null}

#[derive(Copy, Drop, Debug, PartialEq, Serde, Hash)]
pub struct Signature {
    pub r: u256,
    pub s: u256,
    pub y_parity: bool,
}
```

## Members

### r

#### Signature

```rust theme={null}
pub r: u256
```

### s

#### Signature

```rust theme={null}
pub s: u256
```

### y\_parity

The parity of the y coordinate of the elliptic curve point whose x coordinate is `r`.
`y_parity == true` means that the y coordinate is odd.
Some places use non boolean `v` instead of `y_parity`.
In that case, `signature_from_vrs` should be used.

#### Signature

```rust theme={null}
pub y_parity: bool
```


