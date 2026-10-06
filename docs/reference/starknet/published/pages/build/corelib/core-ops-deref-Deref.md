# core::ops::deref::Deref
Source: https://docs.starknet.io/build/corelib/core-ops-deref-Deref



A trait for dereferencing a value to provide transparent access to its contents.
Implementing this trait allows a type to behave like its inner type, enabling direct access to
the inner type's fields.
Note: The `Deref` mechanism is limited and cannot be used to implicitly convert a type to its
target type when passing arguments to functions. For example, if you have a function that takes
an `Inner`, you cannot pass an `Outer` to it even if `Outer` implements `Deref`.

## Signature

```rust theme={null}
pub trait Deref
```

## Examples

```rust theme={null}
struct Wrapper { inner: T }

impl WrapperDeref of Deref> {
    type Target = T;
    fn deref(self: Wrapper) -> T { self.inner }
}

let wrapped = Wrapper { inner: 42 };
assert!(wrapped.deref() == 42);
```

## Trait functions

### deref

Returns the dereferenced value.

#### Signature

```rust theme={null}
fn deref(self: T) -> DerefTarget
```

## Trait types

### Target

The type of the dereferenced value.

#### Signature

```rust theme={null}
type Target;
```


