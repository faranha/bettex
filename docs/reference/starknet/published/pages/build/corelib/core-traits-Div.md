# core::traits::Div
Source: https://docs.starknet.io/build/corelib/core-traits-Div



The division operator `/`.
Types implementing this trait support the division operation via the `/` operator.

## Signature

```rust theme={null}
pub trait Div
```

## Examples

`Div`isible types:

```rust theme={null}
assert!(4_u8 / 2_u8 == 2_u8);
```

Implementing `Div` for a type:

```rust theme={null}
#[derive(Copy, Drop, PartialEq)]
struct Point {
    x: u32,
    y: u32,
}

impl PointDiv of Div {
    fn div(lhs: Point, rhs: Point) -> Point {
        Point {
            x: lhs.x / rhs.x,
            y: lhs.y / rhs.y,
        }
    }
}

let p1 = Point { x: 2, y: 4 };
let p2 = Point { x: 2, y: 2 };
let p3 = p1 / p2;
assert!(p3 == Point { x: 1, y: 2 });
```

## Trait functions

### div

Performs the `/` operation.

#### Signature

```rust theme={null}
fn div(lhs: T, rhs: T) -> T
```

#### Examples

```rust theme={null}
assert!(12 / 2 == 6);
```


