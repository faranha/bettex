# core::starknet::storage::storage_base::StorageBase
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-storage_base-StorageBase



A struct for holding an address to initialize a storage path with. The members (not direct
members, but accessible using `deref`) of a contract state are either `StorageBase` or
`FlattenedStorage` instances, with the generic type representing the type of the stored member.

## Signature

```rust theme={null}
pub struct StorageBase {
    pub __base_address__: felt252,
}
```

## Members

### **base\_address**

#### Signature

```rust theme={null}
pub __base_address__: felt252
```


