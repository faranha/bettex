# core::integer::i64_diff
Source: https://docs.starknet.io/build/corelib/core-integer-i64_diff



If `lhs` >= `rhs` returns `Ok(lhs - rhs)` else returns `Err(2**64 + lhs - rhs)`.

## Signature

```rust theme={null}
pub extern fn i64_diff(lhs: i64, rhs: i64) -> Result implicits(RangeCheck) nopanic;
```


