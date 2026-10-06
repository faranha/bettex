# core::starknet::storage::storage_base::StorageTrait
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-storage_base-StorageTrait



A trait for creating the struct containing the `StorageBase` or `FlattenedStorage` of all the
members of a contract state.

## Signature

```rust theme={null}
pub trait StorageTrait
```

## Trait functions

### storage

Creates a struct containing the `StorageBase` or `FlattenedStorage` of all the members of a
contract state. Should be called from the `deref` method of the contract state.

#### Signature

```rust theme={null}
fn storage(self: FlattenedStorage) -> StorageTraitBaseType
```

## Trait types

### BaseType

The type of the struct containing the `StorageBase` or `FlattenedStorage` of all the members
of the type `T`.

#### Signature

```rust theme={null}
type BaseType;
```


