# core::integer::i8_diff
Source: https://docs.starknet.io/build/corelib/core-integer-i8_diff



If `lhs` >= `rhs` returns `Ok(lhs - rhs)` else returns `Err(2**8 + lhs - rhs)`.

## Signature

```rust theme={null}
pub extern fn i8_diff(lhs: i8, rhs: i8) -> Result implicits(RangeCheck) nopanic;
```


