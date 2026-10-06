# core::gas::gas_reserve_utilize
Source: https://docs.starknet.io/build/corelib/core-gas-gas_reserve_utilize



Adds the gas stored in the reserve back to the gas counter.
The reserve is consumed in the process.

## Signature

```rust theme={null}
pub extern fn gas_reserve_utilize(reserve: GasReserve) implicits(GasBuiltin) nopanic;
```


