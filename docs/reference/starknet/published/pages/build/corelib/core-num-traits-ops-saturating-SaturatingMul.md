# core::num::traits::ops::saturating::SaturatingMul
Source: https://docs.starknet.io/build/corelib/core-num-traits-ops-saturating-SaturatingMul



Performs multiplication that saturates at the numeric bounds instead of overflowing.

## Signature

```rust theme={null}
pub trait SaturatingMul
```

## Examples

```rust theme={null}
use core::num::traits::SaturatingMul;

assert!(100_u8.saturating_mul(3_u8) == 255);
```

## Trait functions

### saturating\_mul

Saturating multiplication. Computes `self * other`, saturating at the relevant high or low
boundary of the type.

#### Signature

```rust theme={null}
fn saturating_mul(self: T, other: T) -> T
```


