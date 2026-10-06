# core::gas::gas_reserve_create
Source: https://docs.starknet.io/build/corelib/core-gas-gas_reserve_create



Creates a new gas reserve by withdrawing the specified amount from the gas counter.
Returns `Some(GasReserve)` if there is sufficient gas, otherwise returns `None`.

## Signature

```rust theme={null}
pub extern fn gas_reserve_create(amount: u128) -> Option implicits(RangeCheck, GasBuiltin) nopanic;
```


