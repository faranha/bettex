# core::starknet::storage::StorableStoragePointerReadAccess
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-StorableStoragePointerReadAccess



Simple implementation of `StoragePointerReadAccess` for any type that implements `Store` for any
offset.

## Signature

```rust theme={null}
pub impl StorableStoragePointerReadAccess,
> of StoragePointerReadAccess>;
```

## Impl functions

### read

#### Signature

```rust theme={null}
fn read(self: @StoragePointer) -> T
```

## Impl types

### Value

#### Signature

```rust theme={null}
type Value = T;
```


