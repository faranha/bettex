# core::ops::range::Range
Source: https://docs.starknet.io/build/corelib/core-ops-range-Range



A (half-open) range bounded inclusively below and exclusively above
(`start..end`).
The range `start..end` contains all values with `start = end`.

## Signature

```rust theme={null}
#[derive(Clone, Drop, PartialEq)]
pub struct Range {
    pub start: T,
    pub end: T,
}
```

## Examples

The `start..end` syntax is a `Range`:

```rust theme={null}
assert!((3..5) == core::ops::Range { start: 3, end: 5 });

let mut sum = 0;
for i in 3..6 {
    sum += i;
}
assert!(sum == 3 + 4 + 5);
```

## Members

### start

The lower bound of the range (inclusive).

#### Signature

```rust theme={null}
pub start: T
```

### end

The upper bound of the range (exclusive).

#### Signature

```rust theme={null}
pub end: T
```


