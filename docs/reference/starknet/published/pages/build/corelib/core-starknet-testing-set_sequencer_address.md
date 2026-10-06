# core::starknet::testing::set_sequencer_address
Source: https://docs.starknet.io/build/corelib/core-starknet-testing-set_sequencer_address



Sets the sequencer address to the provided value.

## Signature

```rust theme={null}
pub fn set_sequencer_address(address: ContractAddress)
```

#### Arguments

`address` - The sequencer address to set.
After a call to `set_sequencer_address`,
`starknet::get_execution_info().block_info.sequencer_address` will return the set value.


