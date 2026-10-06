# core::starknet::info::get_caller_address
Source: https://docs.starknet.io/build/corelib/core-starknet-info-get_caller_address



Returns the address of the caller contract.
Returns `0` if there is no caller—for example, when a transaction begins execution inside an
account contract.
Note: This function returns the direct caller. If you're interested in the account that
initiated the transaction, use `get_execution_info().tx_info.unbox().account_contract_address`
instead.

## Signature

```rust theme={null}
pub fn get_caller_address() -> ContractAddress
```

## Examples

```rust theme={null}
use starknet::get_caller_address;

let caller = get_caller_address();
```


