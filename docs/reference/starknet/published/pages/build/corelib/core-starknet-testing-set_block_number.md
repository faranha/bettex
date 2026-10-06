# core::starknet::testing::set_block_number
Source: https://docs.starknet.io/build/corelib/core-starknet-testing-set_block_number



Sets the block number to the provided value.

## Signature

```rust theme={null}
pub fn set_block_number(block_number: u64)
```

#### Arguments

`block_number` - The block number to set.
After a call to `set_block_number`, `starknet::get_execution_info().block_info.block_number`
will return the set value.


