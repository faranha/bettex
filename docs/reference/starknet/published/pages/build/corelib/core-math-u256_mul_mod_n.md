# core::math::u256_mul_mod_n
Source: https://docs.starknet.io/build/corelib/core-math-u256_mul_mod_n



Returns `a * b (mod n)`.

## Signature

```rust theme={null}
pub fn u256_mul_mod_n(a: u256, b: u256, n: NonZero) -> u256
```

## Examples

```rust theme={null}
use core::math::u256_mul_mod_n;

let result = u256_mul_mod_n(17, 23, 29);
assert!(result == 14);
```


