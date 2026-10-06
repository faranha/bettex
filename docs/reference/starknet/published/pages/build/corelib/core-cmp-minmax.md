# core::cmp::minmax
Source: https://docs.starknet.io/build/corelib/core-cmp-minmax



Takes two comparable values `a` and `b` and returns
a tuple with the smaller value and the greater value.

## Signature

```rust theme={null}
pub fn minmax, +Drop, +Copy>(a: T, b: T) -> (T, T)
```

## Examples

```rust theme={null}
use core::cmp::minmax;

assert!(minmax(0, 1) == (0, 1));
assert!(minmax(1, 0) == (0, 1));
```


