# core::ops::range::RangeTrait
Source: https://docs.starknet.io/build/corelib/core-ops-range-RangeTrait



## Signature

```rust theme={null}
pub trait RangeTrait+PartialOrd>
```

## Trait functions

### contains

Returns `true` if `item` is contained in the range.

#### Signature

```rust theme={null}
fn contains, +PartialOrd, T, +Destruct, +PartialOrd>(
    self: @Range, item: @T,
) -> bool
```

#### Examples

```rust theme={null}
assert!(!(3..5).contains(@2));
assert!( (3..5).contains(@3));
assert!( (3..5).contains(@4));
assert!(!(3..5).contains(@5));

assert!(!(3..3).contains(@3));
assert!(!(3..2).contains(@3));
```

### is\_empty

Returns `true` if the range contains no items.

#### Signature

```rust theme={null}
fn is_empty, +PartialOrd, T, +Destruct, +PartialOrd>(
    self: @Range,
) -> bool
```

#### Examples

```rust theme={null}
assert!(!(3_u8..5_u8).is_empty());
assert!( (3_u8..3_u8).is_empty());
assert!( (3_u8..2_u8).is_empty());
```


