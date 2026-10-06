# core::starknet::storage::PendingStoragePath
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-PendingStoragePath



A struct for delaying the creation of a storage path, used for lazy evaluation in storage nodes.

## Signature

```rust theme={null}
pub struct PendingStoragePath {
    __hash_state__: HashState,
    __pending_key__: felt252,
}
```


