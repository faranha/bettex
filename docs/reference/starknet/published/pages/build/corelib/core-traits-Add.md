# core::traits::Add
Source: https://docs.starknet.io/build/corelib/core-traits-Add



The addition operator `+`.

## Signature

```rust theme={null}
pub trait Add
```

## Examples

`Add`able types:

```rust theme={null}
assert!(1_u8 + 2_u8 == 3_u8);
```

Implementing `Add` for a type:

```rust theme={null}
#[derive(Copy, Drop, PartialEq)]
struct Point {
    x: u32,
    y: u32,
}

impl PointAdd of Add {
    fn add(lhs: Point, rhs: Point) -> Point {
        Point {
            x: lhs.x + rhs.x,
            y: lhs.y + rhs.y,
        }
    }
}

let p1 = Point { x: 1, y: 0 };
let p2 = Point { x: 2, y: 3 };
let p3 = p1 + p2;
assert!(p3 == Point { x: 3, y: 3 });
```

## Trait functions

### add

Performs the `+` operation.

#### Signature

```rust theme={null}
fn add(lhs: T, rhs: T) -> T
```

#### Examples

```rust theme={null}
assert!(12 + 1 == 13);
```


