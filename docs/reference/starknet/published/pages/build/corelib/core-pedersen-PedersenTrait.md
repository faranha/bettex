# core::pedersen::PedersenTrait
Source: https://docs.starknet.io/build/corelib/core-pedersen-PedersenTrait



## Signature

```rust theme={null}
pub trait PedersenTrait
```

## Trait functions

### new

Creates a new Pedersen hash state with the given base value.

#### Signature

```rust theme={null}
fn new(base: felt252) -> HashState
```

#### Examples

```rust theme={null}
use core::pedersen::PedersenTrait;

let mut state = PedersenTrait::new(0);
assert!(state.state == 0);
```


