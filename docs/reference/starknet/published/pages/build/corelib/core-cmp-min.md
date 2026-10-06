# core::cmp::min
Source: https://docs.starknet.io/build/corelib/core-cmp-min



Takes two comparable values `a` and `b` and returns
the smaller of the two values.

## Signature

```rust theme={null}
pub fn min, +Drop, +Copy>(a: T, b: T) -> T
```

## Examples

```rust theme={null}
use core::cmp::min;

assert!(min(0, 1) == 0);
```


