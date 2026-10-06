# core::circuit::AddInputResult
Source: https://docs.starknet.io/build/corelib/core-circuit-AddInputResult



The result of filling an input in the circuit instance's data.
This enum represents the state of input filling process, indicating whether
all inputs have been provided or more are needed.

## Signature

```rust theme={null}
pub enum AddInputResult {
    Done: CircuitData,
    More: CircuitInputAccumulator,
}
```

## Variants

### Done

All inputs have been filled and the circuit data is complete.

#### Signature

```rust theme={null}
Done: CircuitData
```

### More

More inputs are needed to complete the circuit instance's data.

#### Signature

```rust theme={null}
More: CircuitInputAccumulator
```


