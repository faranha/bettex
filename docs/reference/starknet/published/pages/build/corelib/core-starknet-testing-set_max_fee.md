# core::starknet::testing::set_max_fee
Source: https://docs.starknet.io/build/corelib/core-starknet-testing-set_max_fee



Sets the transaction max fee.

## Signature

```rust theme={null}
pub fn set_max_fee(fee: u128)
```

#### Arguments

`fee` - The max fee to set.
After a call to `set_max_fee`, `starknet::get_execution_info().tx_info.max_fee` will return the
set value.


