# core::starknet::testing::set_version
Source: https://docs.starknet.io/build/corelib/core-starknet-testing-set_version



Sets the version to the provided value.

## Signature

```rust theme={null}
pub fn set_version(version: felt252)
```

#### Arguments

`version` - The version to set.
After a call to `set_version`, `starknet::get_execution_info().tx_info.version` will return the
set value.


