# core::num::traits::ops::wrapping::WrappingSub
Source: https://docs.starknet.io/build/corelib/core-num-traits-ops-wrapping-WrappingSub



Performs subtraction that wraps around on overflow.

## Signature

```rust theme={null}
pub trait WrappingSub
```

## Examples

```rust theme={null}
use core::num::traits::WrappingSub;

let result = 0_u8.wrapping_sub(1);
assert!(result == 255);

let result = 100_u8.wrapping_sub(150);
assert!(result == 206);
```

## Trait functions

### wrapping\_sub

Wrapping (modular) subtraction. Computes `self - other`, wrapping around at the boundary of
the type.

#### Signature

```rust theme={null}
fn wrapping_sub(self: T, v: T) -> T
```


