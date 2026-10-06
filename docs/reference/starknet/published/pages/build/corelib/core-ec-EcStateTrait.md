# core::ec::EcStateTrait
Source: https://docs.starknet.io/build/corelib/core-ec-EcStateTrait



## Signature

```rust theme={null}
pub trait EcStateTrait
```

## Trait functions

### init

Initializes an EC computation with the zero point.

#### Signature

```rust theme={null}
fn init() -> EcState
```

#### Examples

```rust theme={null}
let mut state = EcStateTrait::init();
```

### add

Adds a point to the computation.

#### Arguments

* `p` - The non-zero point to add

#### Signature

```rust theme={null}
fn add(ref self: EcState, p: NonZero)
```

### sub

Subtracts a point to the computation.

#### Arguments

* `p` - The non-zero point to subtract

#### Signature

```rust theme={null}
fn sub(ref self: EcState, p: NonZero)
```

### add\_mul

Adds the product `p * scalar` to the state.

#### Arguments

* `scalar` - The scalar to multiply the point by
* `p` - The non-zero point to multiply and add

#### Signature

```rust theme={null}
fn add_mul(ref self: EcState, scalar: felt252, p: NonZero)
```

### finalize\_nz

Finalizes the EC computation and returns the result as a non-zero point.

#### Returns

* `Option` - The resulting point, or None if the result is the zero point

#### Panics

Panics if the result is the point at infinity.

#### Signature

```rust theme={null}
fn finalize_nz(self: EcState) -> Option>
```

### finalize

Finalizes the EC computation and returns the result.
Returns the zero point if the computation results in the point at infinity.

#### Signature

```rust theme={null}
fn finalize(self: EcState) -> EcPoint
```


