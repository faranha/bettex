# core::ec::ec_point_unwrap
Source: https://docs.starknet.io/build/corelib/core-ec-ec_point_unwrap



Unwraps a non-zero point into its (x, y) coordinates.

## Signature

```rust theme={null}
pub extern fn ec_point_unwrap(p: NonZero) -> (felt252, felt252) nopanic;
```


