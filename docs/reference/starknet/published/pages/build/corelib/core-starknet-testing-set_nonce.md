# core::starknet::testing::set_nonce
Source: https://docs.starknet.io/build/corelib/core-starknet-testing-set_nonce



Set the transaction nonce.

## Signature

```rust theme={null}
pub fn set_nonce(nonce: felt252)
```

#### Arguments

`non` - The nonce to set.
After a call to `set_nonce`, `starknet::get_execution_info().tx_info.nonce` will return the set
value.


