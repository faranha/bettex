# core::starknet::testing::set_account_contract_address
Source: https://docs.starknet.io/build/corelib/core-starknet-testing-set_account_contract_address



Sets the account contract address.

## Signature

```rust theme={null}
pub fn set_account_contract_address(address: ContractAddress)
```

#### Arguments

`address` - The account contract to set.
After a call to `set_account_contract_address`,
`starknet::get_execution_info().tx_info.account_contract_address` will return the set value.


