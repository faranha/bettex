# core::ops::arith::SubAssign
Source: https://docs.starknet.io/build/corelib/core-ops-arith-SubAssign



The subtraction assignment operator `-=`.

## Signature

```rust theme={null}
pub trait SubAssign
```

## Trait functions

### sub\_assign

Performs the `-=` operation.

#### Signature

```rust theme={null}
fn sub_assign(ref self: Lhs, rhs: Rhs)
```

#### Examples

```rust theme={null}
let mut x: u8 = 3;
x -= x;
assert!(x == 0);
```


