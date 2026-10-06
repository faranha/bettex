# core::num::traits::one::One
Source: https://docs.starknet.io/build/corelib/core-num-traits-one-One



Defines a multiplicative identity element for `T`.

## Signature

```rust theme={null}
pub trait One
```

# Laws

```text theme={null}
a * 1 = a       ∀ a ∈ T
1 * a = a       ∀ a ∈ T
```

## Trait functions

### one

Returns the multiplicative identity element of `T`, `1`.

#### Signature

```rust theme={null}
fn one() -> T
```

#### Examples

```rust theme={null}
use core::num::traits::One;

assert!(One::::one() == 1);
```

### is\_one

Returns true if `self` is equal to the multiplicative identity.

#### Signature

```rust theme={null}
fn is_one(self: @T) -> bool
```

#### Examples

```rust theme={null}
use core::num::traits::One;

assert!(1.is_one());
assert!(!0.is_one());
```

### is\_non\_one

Returns false if `self` is equal to the multiplicative identity.

#### Signature

```rust theme={null}
fn is_non_one(self: @T) -> bool
```

#### Examples

```rust theme={null}
use core::num::traits::One;

assert!(0.is_non_one());
assert!(!1.is_non_one());
```


