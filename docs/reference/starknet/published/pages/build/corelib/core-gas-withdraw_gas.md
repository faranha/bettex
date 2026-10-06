# core::gas::withdraw_gas
Source: https://docs.starknet.io/build/corelib/core-gas-withdraw_gas



Withdraws gas from the `GasBuiltin` to handle the success case flow.
Returns `Some(())` if there is sufficient gas to handle the success case, otherwise
returns `None`.

## Signature

```rust theme={null}
pub extern fn withdraw_gas() -> Option implicits(RangeCheck, GasBuiltin) nopanic;
```

## Examples

```rust theme={null}
// The success branch is the following lines, the failure branch is the `panic` caused by the
// `unwrap` call.
withdraw_gas().unwrap();
```

```rust theme={null}
// Direct handling of `withdraw_gas`.
match withdraw_gas() {
    Some(()) => success_case(),
    None => cheap_not_enough_gas_case(),
}
```


