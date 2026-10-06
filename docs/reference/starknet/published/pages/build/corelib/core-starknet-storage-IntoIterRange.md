# core::starknet::storage::IntoIterRange
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-IntoIterRange



Trait for turning collection of values into an iterator over a specific range.

## Signature

```rust theme={null}
pub trait IntoIterRange
```

## Trait functions

### into\_iter\_range

Creates an iterator over a range from a collection.

#### Signature

```rust theme={null}
fn into_iter_range(self: T, range: Range) -> IntoIterRangeIntoIter
```

### into\_iter\_full\_range

Creates an iterator over the full range of a collection.

#### Signature

```rust theme={null}
fn into_iter_full_range(self: T) -> IntoIterRangeIntoIter
```

## Trait types

### IntoIter

#### Signature

```rust theme={null}
type IntoIter;
```


