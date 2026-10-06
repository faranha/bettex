# core::num::traits::ops::saturating::SaturatingAdd
Source: https://docs.starknet.io/build/corelib/core-num-traits-ops-saturating-SaturatingAdd



Performs addition that saturates at the numeric bounds instead of overflowing.

## Signature

```rust theme={null}
pub trait SaturatingAdd
```

## Examples

```rust theme={null}
use core::num::traits::SaturatingAdd;

assert!(255_u8.saturating_add(1_u8) == 255);
```

## Trait functions

### saturating\_add

Saturating addition. Computes `self + other`, saturating at the relevant high or low
boundary of the type.

#### Signature

```rust theme={null}
fn saturating_add(self: T, other: T) -> T
```


