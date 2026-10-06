# core::traits::BitXor
Source: https://docs.starknet.io/build/corelib/core-traits-BitXor



The bitwise XOR operator `^`.

## Signature

```rust theme={null}
pub trait BitXor
```

## Examples

An implementation of `BitXor` for a wrapper around `bool`.

```rust theme={null}
use core::traits::BitXor;

#[derive(Drop, PartialEq)]
struct Scalar {
    inner: bool,
}

impl BitXorScalar of BitXor {
    fn bitxor(lhs: Scalar, rhs: Scalar) -> Scalar {
        Scalar { inner: lhs.inner ^ rhs.inner }
    }
}

assert!(Scalar { inner: true } ^ Scalar { inner: true } == Scalar { inner: false });
assert!(Scalar { inner: true } ^ Scalar { inner: false } == Scalar { inner: true });
assert!(Scalar { inner: false } ^ Scalar { inner: true } == Scalar { inner: true });
assert!(Scalar { inner: false } ^ Scalar { inner: false } == Scalar { inner: false });
```

## Trait functions

### bitxor

Performs the `^` operation.

#### Signature

```rust theme={null}
fn bitxor(lhs: T, rhs: T) -> T
```

#### Examples

```rust theme={null}
assert!(1_u8 ^ 2_u8 == 3);
```


