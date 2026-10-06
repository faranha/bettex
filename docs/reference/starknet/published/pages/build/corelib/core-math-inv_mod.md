# core::math::inv_mod
Source: https://docs.starknet.io/build/corelib/core-math-inv_mod



Computes the modular multiplicative inverse of `a` modulo `n`.
Returns `s` such that `a*s ≡ 1 (mod n)` where `s` is between `1` and `n-1` inclusive, or
`None` if `gcd(a,n) > 1` (inverse doesn't exist).

## Signature

```rust theme={null}
pub fn inv_mod,
    +Drop,
    +Add,
    +Sub,
    +Mul,
    +DivRem,
    +core::num::traits::Zero,
    +core::num::traits::One,
    +TryInto>,
>(
    a: NonZero, n: NonZero,
) -> Option
```

## Examples

```rust theme={null}
use core::math::inv_mod;

let inv = inv_mod::(3, 7);
assert!(inv == Some(5));
```


