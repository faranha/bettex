# core::starknet::testing::set_signature
Source: https://docs.starknet.io/build/corelib/core-starknet-testing-set_signature



Set the transaction signature.

## Signature

```rust theme={null}
pub fn set_signature(signature: Span)
```

#### Arguments

`signature` - The signature to set.
After a call to `set_signature`, `starknet::get_execution_info().tx_info.signature` will return
the set value.


