# core::num::traits::ops::widesquare::WideSquare
Source: https://docs.starknet.io/build/corelib/core-num-traits-ops-widesquare-WideSquare



A trait for a type that can be squared to produce a wider type.
This trait enables squaring operations where the result type has double
the bit width of the input type, preventing overflow in cases where the
result would exceed the input type's maximum value.

## Signature

```rust theme={null}
pub trait WideSquare
```

## Examples

```rust theme={null}
use core::num::traits::WideSquare;

let a: u8 = 16;
let result: u16 = a.wide_square();
assert!(result == 256);
```

## Trait functions

### wide\_square

Calculates the square, producing a wider type.

#### Signature

```rust theme={null}
fn wide_square(self: T) -> WideSquareTarget
```

## Trait types

### Target

The type of the result of the square.

#### Signature

```rust theme={null}
type Target;
```


