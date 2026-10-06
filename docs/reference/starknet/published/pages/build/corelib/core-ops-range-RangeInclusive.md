# core::ops::range::RangeInclusive
Source: https://docs.starknet.io/build/corelib/core-ops-range-RangeInclusive



Represents the range start, end.

## Signature

```rust theme={null}

#[derive(Clone, Drop, PartialEq)]
pub struct RangeInclusive {
    pub start: T,
    pub end: T,
}
```

## Members

### start

The lower bound of the range (inclusive).

#### Signature

```rust theme={null}
pub start: T
```

### end

The upper bound of the range (inclusive).

#### Signature

```rust theme={null}
pub end: T
```


