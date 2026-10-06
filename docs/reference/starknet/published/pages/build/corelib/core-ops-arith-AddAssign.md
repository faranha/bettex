# core::ops::arith::AddAssign
Source: https://docs.starknet.io/build/corelib/core-ops-arith-AddAssign



The addition assignment operator `+=`.

## Signature

```rust theme={null}
pub trait AddAssign
```

## Trait functions

### add\_assign

Performs the `+=` operation.

#### Signature

```rust theme={null}
fn add_assign(ref self: Lhs, rhs: Rhs)
```

#### Examples

```rust theme={null}
let mut x: u8 = 3;
x += x;
assert!(x == 6);
```


