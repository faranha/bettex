# core::ops::arith::MulAssign
Source: https://docs.starknet.io/build/corelib/core-ops-arith-MulAssign



The multiplication assignment operator `*=`.

## Signature

```rust theme={null}
pub trait MulAssign
```

## Trait functions

### mul\_assign

Performs the `*=` operation.

#### Signature

```rust theme={null}
fn mul_assign(ref self: Lhs, rhs: Rhs)
```

#### Examples

```rust theme={null}
let mut x: u8 = 3;
x *= x;
assert!(x == 9);
```


