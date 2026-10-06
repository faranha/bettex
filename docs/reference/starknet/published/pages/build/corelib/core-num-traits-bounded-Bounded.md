# core::num::traits::bounded::Bounded
Source: https://docs.starknet.io/build/corelib/core-num-traits-bounded-Bounded



A trait defining minimum and maximum bounds for numeric types.
This trait only supports types that can have constant values.

## Signature

```rust theme={null}
pub trait Bounded
```

## Trait constants

### MIN

Returns the minimum value for type `T`.

#### Signature

```rust theme={null}
const MIN: T;
```

#### Examples

```rust theme={null}
use core::num::traits::Bounded;

let min = Bounded::::MIN;
assert!(min == 0);
```

### MAX

Returns the maximum value for type `T`.

#### Signature

```rust theme={null}
const MAX: T;
```

#### Examples

```rust theme={null}
use core::num::traits::Bounded;

let max = Bounded::::MAX;
assert!(max == 255);
```


