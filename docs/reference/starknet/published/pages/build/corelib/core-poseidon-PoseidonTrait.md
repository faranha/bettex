# core::poseidon::PoseidonTrait
Source: https://docs.starknet.io/build/corelib/core-poseidon-PoseidonTrait



## Signature

```rust theme={null}
pub trait PoseidonTrait
```

## Trait functions

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


