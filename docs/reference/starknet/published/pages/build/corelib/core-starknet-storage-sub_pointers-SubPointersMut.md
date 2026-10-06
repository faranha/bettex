# core::starknet::storage::sub_pointers::SubPointersMut
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-sub_pointers-SubPointersMut



A mutable version of `SubPointers`, works the same way, but on `Mutable`.

## Signature

```rust theme={null}
pub trait SubPointersMut
```

## Trait functions

### sub\_pointers\_mut

Creates a sub pointers struct for the given storage pointer to a struct T.

#### Signature

```rust theme={null}
fn sub_pointers_mut(self: StoragePointer>) -> SubPointersMutSubPointersType
```

## Trait types

### SubPointersType

The type of the storage pointers, generated for the struct T.

#### Signature

```rust theme={null}
type SubPointersType;
```


