# core::num::traits::ops::saturating::SaturatingSub
Source: https://docs.starknet.io/build/corelib/core-num-traits-ops-saturating-SaturatingSub



Performs subtraction that saturates at the numeric bounds instead of overflowing.

## Signature

```rust theme={null}
pub trait SaturatingSub
```

## Examples

```rust theme={null}
use core::num::traits::SaturatingSub;

assert!(1_u8.saturating_sub(2_u8) == 0);
```

## Trait functions

### saturating\_sub

Saturating subtraction. Computes `self - other`, saturating at the relevant high or low
boundary of the type.

#### Signature

```rust theme={null}
fn saturating_sub(self: T, other: T) -> T
```


