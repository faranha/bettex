# core::starknet::storage_access::storage_address_from_base
Source: https://docs.starknet.io/build/corelib/core-starknet-storage_access-storage_address_from_base



Converts a `StorageBaseAddress` into a `StorageAddress`.
This should be used through the high-level `Into` trait.

## Signature

```rust theme={null}
pub extern fn storage_address_from_base(base: StorageBaseAddress) -> StorageAddress nopanic;
```


