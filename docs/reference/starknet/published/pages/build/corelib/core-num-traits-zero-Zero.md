# core::num::traits::zero::Zero
Source: https://docs.starknet.io/build/corelib/core-num-traits-zero-Zero



Defines an additive identity element for `T`.

## Signature

```rust theme={null}
pub trait Zero
```

# Laws

```text theme={null}
a + 0 = a       ∀ a ∈ T
0 + a = a       ∀ a ∈ T
```

## Trait functions

### zero

Returns the additive identity element of `T`, `0`.

#### Signature

```rust theme={null}
fn zero() -> T
```

#### Examples

```rust theme={null}
use core::num::traits::Zero;

assert!(Zero::::zero() == 0);
```

### is\_zero

Returns true if `self` is equal to the additive identity.

#### Signature

```rust theme={null}
fn is_zero(self: @T) -> bool
```

#### Examples

```rust theme={null}
use core::num::traits::Zero;

assert!(0.is_zero());
assert!(!5.is_zero());
```

### is\_non\_zero

Returns false if `self` is equal to the additive identity.

#### Signature

```rust theme={null}
fn is_non_zero(self: @T) -> bool
```

#### Examples

```rust theme={null}
use core::num::traits::Zero;

assert!(5.is_non_zero());
assert!(!0.is_non_zero());
```


