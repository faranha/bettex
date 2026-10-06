# core::starknet::storage_access::storage_base_address_const
Source: https://docs.starknet.io/build/corelib/core-starknet-storage_access-storage_base_address_const



Returns a `StorageBaseAddress` given a constant `felt252` value.
The value is validated to be in the range `[0, 2**251 - 256)` at compile time.

## Signature

```rust theme={null}
pub extern fn storage_base_address_const() -> StorageBaseAddress nopanic;
```

## Examples

```rust theme={null}
use starknet::storage_access::storage_base_address_const;

let base_address = storage_base_address_const::();
```


