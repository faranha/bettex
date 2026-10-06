# core::ec::EcState
Source: https://docs.starknet.io/build/corelib/core-ec-EcState



Elliptic curve state.
Use this to perform multiple point operations efficiently.
Initialize with `EcStateTrait::init`, add points with `EcStateTrait::add`
or `EcStateTrait::add_mul`, and finalize with `EcStateTrait::finalize`.

## Signature

```rust theme={null}
pub extern type EcState;
```


