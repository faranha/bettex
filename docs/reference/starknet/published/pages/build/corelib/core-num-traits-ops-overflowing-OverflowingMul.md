# core::num::traits::ops::overflowing::OverflowingMul
Source: https://docs.starknet.io/build/corelib/core-num-traits-ops-overflowing-OverflowingMul



Performs multiplication with a flag for overflow.

## Signature

```rust theme={null}
pub trait OverflowingMul
```

## Examples

```rust theme={null}
use core::num::traits::OverflowingMul;

let (result, is_overflow) = 1_u8.overflowing_mul(2_u8);
assert!(result == 2);
assert!(!is_overflow);
```

## Trait functions

### overflowing\_mul

Returns a tuple of the product along with a boolean indicating whether an arithmetic
overflow would occur.
If an overflow would have occurred then the wrapped value is returned.

#### Signature

```rust theme={null}
fn overflowing_mul(self: T, v: T) -> (T, bool)
```


