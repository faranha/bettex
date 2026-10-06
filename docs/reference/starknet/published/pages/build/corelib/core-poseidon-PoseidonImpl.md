# core::poseidon::PoseidonImpl
Source: https://docs.starknet.io/build/corelib/core-poseidon-PoseidonImpl



A trait for creating a new Poseidon hash state.

## Signature

```rust theme={null}
pub impl PoseidonImpl of PoseidonTrait;
```

## Impl functions

### new

Creates an initial state with all fields set to 0.

#### Signature

```rust theme={null}
fn new() -> HashState
```

#### Examples

```rust theme={null}
use core::poseidon::PoseidonTrait;

let mut state = PoseidonTrait::new();
```


