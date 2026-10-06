# core::hash::Hash
Source: https://docs.starknet.io/build/corelib/core-hash-Hash



A trait for values that can be hashed.
This trait should be implemented for any type that can be included in a hash calculation.
The most common way to implement this trait is by using `#[derive(Hash)]`.

## Signature

```rust theme={null}
pub trait Hash>
```

## Trait functions

### update\_state

Updates the hash state with the given value and returns a new hash state.

#### Signature

```rust theme={null}
fn update_state, T, S, +HashStateTrait>(state: S, value: T) -> S
```

#### Examples

```rust theme={null}
use core::pedersen::PedersenTrait;
use core::hash::Hash;

let mut state = PedersenTrait::new(0);
let new_state = Hash::update_state(state, 1);
```


