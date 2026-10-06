# core::num::traits::ops::sqrt::Sqrt
Source: https://docs.starknet.io/build/corelib/core-num-traits-ops-sqrt-Sqrt



A trait for computing the square root of a number.

## Signature

```rust theme={null}
pub trait Sqrt
```

## Examples

```rust theme={null}
use core::num::traits::Sqrt;

assert!(9_u8.sqrt() == 3);
```

## Trait functions

### sqrt

Computes the square root of a number.

#### Signature

```rust theme={null}
fn sqrt(self: T) -> SqrtTarget
```

## Trait types

### Target

The type of the result of the square root operation.

#### Signature

```rust theme={null}
type Target;
```


