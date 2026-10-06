# core::traits::BitOr
Source: https://docs.starknet.io/build/corelib/core-traits-BitOr



The bitwise OR operator `|`.

## Signature

```rust theme={null}
pub trait BitOr
```

## Examples

An implementation of `BitOr` for a wrapper around `bool`.

```rust theme={null}
use core::traits::BitOr;

#[derive(Drop, PartialEq)]
struct Scalar {
    inner: bool,
}

impl BitOrScalar of BitOr {
    fn bitor(lhs: Scalar, rhs: Scalar) -> Scalar {
        Scalar { inner: lhs.inner | rhs.inner }
    }
}

assert!(Scalar { inner: true } | Scalar { inner: true } == Scalar { inner: true });
assert!(Scalar { inner: true } | Scalar { inner: false } == Scalar { inner: true });
assert!(Scalar { inner: false } | Scalar { inner: true } == Scalar { inner: true });
assert!(Scalar { inner: false } | Scalar { inner: false } == Scalar { inner: false });
```

## Trait functions

### bitor

Performs the `|` operation.

#### Signature

```rust theme={null}
fn bitor(lhs: T, rhs: T) -> T
```

#### Examples

```rust theme={null}
assert!(1_u8 | 2_u8 == 3);
```


