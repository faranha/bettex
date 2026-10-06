# core::integer::i128_diff
Source: https://docs.starknet.io/build/corelib/core-integer-i128_diff



If `lhs` >= `rhs` returns `Ok(lhs - rhs)` else returns `Err(2**128 + lhs - rhs)`.

## Signature

```rust theme={null}
pub extern fn i128_diff(lhs: i128, rhs: i128) -> Result implicits(RangeCheck) nopanic;
```


