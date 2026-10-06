# core::ops::arith::RemAssign
Source: https://docs.starknet.io/build/corelib/core-ops-arith-RemAssign



The remainder assignment operator `%=`.

## Signature

```rust theme={null}
pub trait RemAssign
```

## Trait functions

### rem\_assign

Performs the `%=` operation.

#### Signature

```rust theme={null}
fn rem_assign(ref self: Lhs, rhs: Rhs)
```

#### Examples

```rust theme={null}
let mut x: u8 = 3;
x %= x;
assert!(x == 0);
```


