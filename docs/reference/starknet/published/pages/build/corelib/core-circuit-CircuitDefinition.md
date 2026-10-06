# core::circuit::CircuitDefinition
Source: https://docs.starknet.io/build/corelib/core-circuit-CircuitDefinition



A trait for defining a circuit's structure and behavior.
This trait is used to define the structure of a circuit, including its inputs,
gates, and outputs. It provides the foundation for circuit evaluation.
The `CES` type parameter represents a tuple of `CircuitElement`s that together
define the circuit's structure.

## Signature

```rust theme={null}
pub trait CircuitDefinition
```

## Trait types

### CircuitType

The internal circuit type representing a tuple of `CircuitElement`s.

#### Signature

```rust theme={null}
type CircuitType;
```


