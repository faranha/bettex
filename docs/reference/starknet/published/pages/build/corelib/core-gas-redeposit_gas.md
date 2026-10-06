# core::gas::redeposit_gas
Source: https://docs.starknet.io/build/corelib/core-gas-redeposit_gas



Returns unused gas into the gas builtin.
Useful for cases where different branches take different amounts of gas, but gas withdrawal is
the same for both.

## Signature

```rust theme={null}
pub extern fn redeposit_gas() implicits(GasBuiltin) nopanic;
```


