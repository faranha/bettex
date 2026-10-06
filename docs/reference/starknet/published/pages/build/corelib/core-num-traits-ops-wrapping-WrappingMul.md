# core::num::traits::ops::wrapping::WrappingMul
Source: https://docs.starknet.io/build/corelib/core-num-traits-ops-wrapping-WrappingMul



Performs multiplication that wraps around on overflow.

## Signature

```rust theme={null}
pub trait WrappingMul
```

## Examples

```rust theme={null}
use core::num::traits::WrappingMul;

let result = 10_u8.wrapping_mul(30);
assert!(result == 44); // (10 * 30) % 256 = 44

let result = 200_u8.wrapping_mul(2);
assert!(result == 144); // (200 * 2) % 256 = 144
```

## Trait functions

### wrapping\_mul

Wrapping (modular) multiplication. Computes `self * other`, wrapping around at the boundary
of the type.

#### Signature

```rust theme={null}
fn wrapping_mul(self: T, v: T) -> T
```


