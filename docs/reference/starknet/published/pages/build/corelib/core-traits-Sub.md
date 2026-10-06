# core::traits::Sub
Source: https://docs.starknet.io/build/corelib/core-traits-Sub



The subtraction operator `-`.

## Signature

```rust theme={null}
pub trait Sub
```

## Examples

`Sub`tractable types:

```rust theme={null}
assert!(3_u8 - 2_u8 == 1_u8);
```

Implementing `Sub` for a type:

```rust theme={null}
#[derive(Copy, Drop, PartialEq)]
struct Point {
    x: u32,
    y: u32,
}

impl PointSub of Sub {
    fn sub(lhs: Point, rhs: Point) -> Point {
        Point {
            x: lhs.x - rhs.x,
            y: lhs.y - rhs.y,
        }
    }
}

let p1 = Point { x: 2, y: 3 };
let p2 = Point { x: 1, y: 0 };
let p3 = p1 - p2;
assert!(p3 == Point { x: 1, y: 3 });
```

## Trait functions

### sub

Performs the `-` operation.

#### Signature

```rust theme={null}
fn sub(lhs: T, rhs: T) -> T
```

#### Examples

```rust theme={null}
assert!(12 - 1 == 11);
```


