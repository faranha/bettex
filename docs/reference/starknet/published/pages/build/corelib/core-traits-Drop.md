# core::traits::Drop
Source: https://docs.starknet.io/build/corelib/core-traits-Drop



A trait for types that can be safely dropped.
Types implementing `Drop` can be automatically discarded when they go out of scope.
The drop operation is a no-op - it simply indicates to the compiler that this type
can be safely discarded.

## Signature

```rust theme={null}
pub trait Drop
```

## Examples

Without `Drop`:

```rust theme={null}
struct Point {
    x: u128,
    y: u128,
}

fn foo(p: Point) {} // Error: `p` cannot be dropped
```

With `Drop`:

```rust theme={null}
#[derive(Drop)]
struct Point {
    x: u128,
    y: u128,
}

fn foo(p: Point) {} // OK: `p` is dropped at the end of the function
```


