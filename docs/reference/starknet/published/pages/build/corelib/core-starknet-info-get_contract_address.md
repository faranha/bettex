# core::starknet::info::get_contract_address
Source: https://docs.starknet.io/build/corelib/core-starknet-info-get_contract_address



Returns the address of the contract being executed.

## Signature

```rust theme={null}
pub fn get_contract_address() -> ContractAddress
```

## Examples

```rust theme={null}
use starknet::get_contract_address;

let contract_address = get_contract_address();
```


