# core::starknet::storage::ValidStorageTypeTrait
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-ValidStorageTypeTrait



Trait that ensures a type is valid for storage in Starknet contracts.
This trait is used to enforce that only specific types, such as those implementing
`Store` or acting as a `StorageNode`, can be a part of a storage hierarchy. Any type
that does not implement this trait cannot be used in a storage struct.

## Signature

```rust theme={null}
pub trait ValidStorageTypeTrait
```


