# core::starknet::storage::storage_base::StorageTraitMut
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-storage_base-StorageTraitMut



A trait for creating the struct containing the mutable `StorageBase` or `FlattenedStorage` of
all the members of a contract state.

## Signature

```rust theme={null}
pub trait StorageTraitMut
```

## Trait functions

### storage\_mut

Creates a struct containing a mutable version of the `StorageBase` or `FlattenedStorage` of
all the members of a contract state. Should be called from the `deref` method of the
contract state.

#### Signature

```rust theme={null}
fn storage_mut(self: FlattenedStorage>) -> StorageTraitMutBaseType
```

## Trait types

### BaseType

The type of the struct containing the mutable `StorageBase` or `FlattenedStorage` of all the
members of the type `T`.

#### Signature

```rust theme={null}
type BaseType;
```


