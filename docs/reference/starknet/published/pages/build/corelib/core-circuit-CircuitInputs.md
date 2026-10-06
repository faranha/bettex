# core::circuit::CircuitInputs
Source: https://docs.starknet.io/build/corelib/core-circuit-CircuitInputs



## Signature

```rust theme={null}
pub trait CircuitInputs
```

## Trait functions

### new\_inputs

Initializes a new circuit instance with inputs.
This function creates a new input accumulator for the circuit, which can then
be used to add input values sequentially.

#### Signature

```rust theme={null}
fn new_inputs, +Drop>(
    self: CES,
) -> AddInputResult
```

#### Returns

An `AddInputResult` that can be used to add input values to the circuit


