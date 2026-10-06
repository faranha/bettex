# core::circuit::AddInputResultTrait
Source: https://docs.starknet.io/build/corelib/core-circuit-AddInputResultTrait



## Signature

```rust theme={null}
pub trait AddInputResultTrait
```

## Trait functions

### next

Adds an input value to the circuit instance.

#### Arguments

* `value` - The value to add as input, must be convertible to circuit input value

#### Returns

A new `AddInputResult` that can be used to add more inputs or finalize

#### Panics

Panics if all inputs have already been filled

#### Signature

```rust theme={null}
fn next, +Drop>(
    self: AddInputResult, value: Value,
) -> AddInputResult
```

### done

Finalizes the input process and returns the circuit data.

#### Returns

The complete circuit data ready for evaluation

#### Panics

Panics if not all required inputs have been filled

#### Signature

```rust theme={null}
fn done(self: AddInputResult) -> CircuitData
```


