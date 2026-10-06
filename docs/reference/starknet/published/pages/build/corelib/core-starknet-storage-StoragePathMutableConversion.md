# core::starknet::storage::StoragePathMutableConversion
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-StoragePathMutableConversion



## Signature

```rust theme={null}
pub trait StoragePathMutableConversion
```

## Trait functions

### as\_non\_mut

Converts a `StoragePath>` to a `StoragePath`. This is useful to expose
functions implemented for `StoragePath` on a `StoragePath>`.

#### Signature

```rust theme={null}
fn as_non_mut(self: StoragePath>) -> StoragePath
```


