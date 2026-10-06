# core::traits::Copy
Source: https://docs.starknet.io/build/corelib/core-traits-Copy



A trait for copying values.
By default, variables in Cairo have 'move semantics', meaning they are moved when used.
However, types implementing `Copy` have 'copy semantics', allowing the value to be
duplicated instead of moved.

## Signature

```rust theme={null}
pub trait Copy
```

## Examples

Without `Copy` (move semantics):

```rust theme={null}
#[derive(Drop)]
struct Point {
    x: u128,
    y: u128,
}

fn main() {
    let p1 = Point { x: 5, y: 10 };
    foo(p1);
    foo(p1); // error: Variable was previously moved.
}

fn foo(p: Point) {}
```

With `Copy` (copy semantics):

```rust theme={null}
#[derive(Copy, Drop)]
struct Point {
    x: u128,
    y: u128,
}

fn main() {
    let p1 = Point { x: 5, y: 10 };
    foo(p1);
    foo(p1); // works: `p1` is copied when passed to `foo`
}

fn foo(p: Point) {}
```


