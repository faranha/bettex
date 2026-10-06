# core::integer::i16_diff
Source: https://docs.starknet.io/build/corelib/core-integer-i16_diff



If `lhs` >= `rhs` returns `Ok(lhs - rhs)` else returns `Err(2**16 + lhs - rhs)`.

## Signature

```rust theme={null}
pub extern fn i16_diff(lhs: i16, rhs: i16) -> Result implicits(RangeCheck) nopanic;
```


