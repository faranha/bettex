# core::starknet::storage::map::Map
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-map-Map



A persistent key-value store in contract storage.
This type cannot be instantiated as it is marked with `#[phantom]`. This is by design:
`Map` is a compile-time type that only exists to provide type information for the compiler.
It represents a mapping in storage, but the actual storage operations are handled by the
[`StorageMapReadAccess`](./core-starknet-storage-map-StorageMapReadAccess), [`StorageMapWriteAccess`](./core-starknet-storage-map-StorageMapWriteAccess), and [`StoragePathEntry`](./core-starknet-storage-map-StoragePathEntry) traits.

## Signature

```rust theme={null}

#[phantom]
pub struct Map {}
```


