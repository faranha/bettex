# core::pedersen::PedersenImpl
Source: https://docs.starknet.io/build/corelib/core-pedersen-PedersenImpl



A trait for creating a new Pedersen hash state.

## Signature

```rust theme={null}
pub impl PedersenImpl of PedersenTrait;
```

## Impl functions

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


