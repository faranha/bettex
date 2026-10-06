# core::num::traits::ops::checked::CheckedAdd
Source: https://docs.starknet.io/build/corelib/core-num-traits-ops-checked-CheckedAdd



Performs addition that returns `None` instead of wrapping around on
overflow.

## Signature

```rust theme={null}
pub trait CheckedAdd
```

## Examples

```rust theme={null}
use core::num::traits::CheckedAdd;

let result = 1_u8.checked_add(2);
assert!(result == Some(3));

let result = 255_u8.checked_add(1);
assert!(result == None); // Overflow
```

## Trait functions

### checked\_add

Adds two numbers, checking for overflow. If overflow happens, `None` is
returned.

#### Signature

```rust theme={null}
fn checked_add(self: T, v: T) -> Option
```


