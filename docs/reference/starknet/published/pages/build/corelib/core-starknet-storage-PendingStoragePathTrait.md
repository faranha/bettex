# core::starknet::storage::PendingStoragePathTrait
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-PendingStoragePathTrait



A trait for creating a `PendingStoragePath` from a `StoragePath` hash state and a key.

## Signature

```rust theme={null}
pub trait PendingStoragePathTrait
```

## Trait functions

### new

#### Signature

```rust theme={null}
fn new(storage_path: @StoragePath, pending_key: felt252) -> PendingStoragePath
```


