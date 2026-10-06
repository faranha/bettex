# core::traits::Rem
Source: https://docs.starknet.io/build/corelib/core-traits-Rem



The remainder operator `%`.
Types implementing this trait support the remainder operation via the `%` operator.

## Signature

```rust theme={null}
pub trait Rem
```

## Examples

```rust theme={null}
assert!(3_u8 % 2_u8 == 1_u8);
```

## Trait functions

### rem

Performs the `%` operation.

#### Signature

```rust theme={null}
fn rem(lhs: T, rhs: T) -> T
```

#### Examples

```rust theme={null}
assert!(12_u8 % 10_u8 == 2_u8);
```


