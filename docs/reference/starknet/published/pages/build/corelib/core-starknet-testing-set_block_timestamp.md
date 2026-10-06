# core::starknet::testing::set_block_timestamp
Source: https://docs.starknet.io/build/corelib/core-starknet-testing-set_block_timestamp



Sets the block timestamp to the provided value.

## Signature

```rust theme={null}
pub fn set_block_timestamp(block_timestamp: u64)
```

#### Arguments

`block_timestamp` - The block timestamp to set.
After a call to `set_block_timestamp`,
`starknet::get_execution_info().block_info.block_timestamp` will return the set value.


