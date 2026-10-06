# core::box::BoxTrait
Source: https://docs.starknet.io/build/corelib/core-box-BoxTrait



## Signature

```rust theme={null}
pub trait BoxTrait
```

## Trait functions

### new

Creates a new `Box` with the given value.
Allocates space in the boxed segment for the provided value
and returns a `Box` that points to it.

#### Signature

```rust theme={null}
fn new(value: T) -> Box
```

#### Examples

```rust theme={null}
let x = 42;
let boxed_x = BoxTrait::new(x);
```

### unbox

Unboxes the given `Box` and returns the wrapped value.

#### Signature

```rust theme={null}
fn unbox(self: Box) -> T
```

#### Examples

```rust theme={null}
let boxed = BoxTrait::new(42);
assert!(boxed.unbox() == 42);
```

### as\_snapshot

Converts the given snapshot of a `Box` into a `Box` of a snapshot.
Useful for structures that aren't copyable.

#### Signature

```rust theme={null}
fn as_snapshot(self: @Box) -> Box
```

#### Examples

```rust theme={null}
let snap_boxed_arr = @BoxTraits::new(array![1, 2, 3]);
let boxed_snap_arr = snap_boxed_arr.as_snapshot();
let snap_arr = boxed_snap_arr.unbox();
```


