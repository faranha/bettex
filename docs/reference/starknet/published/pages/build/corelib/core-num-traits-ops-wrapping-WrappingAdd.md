# core::num::traits::ops::wrapping::WrappingAdd
Source: https://docs.starknet.io/build/corelib/core-num-traits-ops-wrapping-WrappingAdd



Performs addition that wraps around on overflow.

## Signature

```rust theme={null}
pub trait WrappingAdd
```

## Examples

```rust theme={null}
use core::num::traits::WrappingAdd;

let result = 255_u8.wrapping_add(1);
assert!(result == 0);

let result = 100_u8.wrapping_add(200);
assert!(result == 44); // (100 + 200) % 256 = 44
```

## Trait functions

### wrapping\_add

Wrapping (modular) addition. Computes `self + other`, wrapping around at the boundary of the
type.

#### Signature

```rust theme={null}
fn wrapping_add(self: T, v: T) -> T
```


