# core::starknet::testing::set_contract_address
Source: https://docs.starknet.io/build/corelib/core-starknet-testing-set_contract_address



Sets the contract address to the provided value.

## Signature

```rust theme={null}
pub fn set_contract_address(address: ContractAddress)
```

#### Arguments

`address` - The contract address to set.
After a call to `set_contract_address`, `starknet::get_execution_info().contract_address` will
return the set value.


