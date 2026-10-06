# core::cmp::max
Source: https://docs.starknet.io/build/corelib/core-cmp-max



Takes two comparable values `a` and `b` and returns
the greater of the two values.

## Signature

```rust theme={null}
pub fn max, +Drop, +Copy>(a: T, b: T) -> T
```

## Examples

```rust theme={null}
use core::cmp::max;

assert!(max(0, 1) == 1);
```


