# core::starknet::testing::set_transaction_hash
Source: https://docs.starknet.io/build/corelib/core-starknet-testing-set_transaction_hash



Sets the transaction hash.

## Signature

```rust theme={null}
pub fn set_transaction_hash(hash: felt252)
```

#### Arguments

`hash` - The transaction hash to set.
After a call to `set_transaction_hash`,
`starknet::get_execution_info().tx_info.transaction_hash` will return the set value.


