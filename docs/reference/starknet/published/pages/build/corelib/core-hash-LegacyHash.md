# core::hash::LegacyHash
Source: https://docs.starknet.io/build/corelib/core-hash-LegacyHash



A trait for hashing values using a `felt252` as hash state, used for backwards compatibility.
NOTE: Implement `Hash` instead of this trait if possible.

## Signature

```rust theme={null}
pub trait LegacyHash
```

## Trait functions

### hash

Takes a `felt252` state and a value of type `T` and returns the hash result.

#### Signature

```rust theme={null}
fn hash(state: felt252, value: T) -> felt252
```

#### Examples

```rust theme={null}
use core::pedersen::PedersenTrait;
use core::hash::LegacyHash;

let hash = LegacyHash::hash(0, 1);
```


