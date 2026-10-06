# core::ops::arith::DivAssign
Source: https://docs.starknet.io/build/corelib/core-ops-arith-DivAssign



The division assignment operator `/=`.

## Signature

```rust theme={null}
pub trait DivAssign
```

## Trait functions

### div\_assign

Performs the `/=` operation.

#### Signature

```rust theme={null}
fn div_assign(ref self: Lhs, rhs: Rhs)
```

#### Examples

```rust theme={null}
let mut x: u8 = 3;
x /= x;
assert!(x == 1);
```


