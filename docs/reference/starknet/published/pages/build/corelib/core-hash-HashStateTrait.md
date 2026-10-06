# core::hash::HashStateTrait
Source: https://docs.starknet.io/build/corelib/core-hash-HashStateTrait



A trait for hash state accumulators.
Provides methods to update a hash state with new values and finalize it into a hash result.

## Signature

```rust theme={null}
pub trait HashStateTrait
```

## Trait functions

### update

Updates the current hash state `self` with the given `felt252` value and returns a new hash
state.

#### Signature

```rust theme={null}
fn update(self: S, value: felt252) -> S
```

#### Examples

```rust theme={null}
use core::pedersen::PedersenTrait;
use core::hash::HashStateTrait;

let mut state = PedersenTrait::new(0);
state = state.update(1);
```

### finalize

Takes the current state `self` and returns the hash result.

#### Signature

```rust theme={null}
fn finalize(self: S) -> felt252
```

#### Examples

```rust theme={null}
use core::pedersen::PedersenTrait;
use core::hash::HashStateTrait;

let mut state = PedersenTrait::new(0);
let hash = state.finalize();
```


