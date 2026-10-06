# core::circuit::EvalCircuitTrait
Source: https://docs.starknet.io/build/corelib/core-circuit-EvalCircuitTrait



## Signature

```rust theme={null}
pub trait EvalCircuitTrait
```

## Trait functions

### eval

Evaluates the circuit with the given modulus.

#### Arguments

* `modulus` - The modulus to use for arithmetic operations

#### Returns

Result containing either the circuit outputs or a failure indication

#### Signature

```rust theme={null}
fn eval(
    self: CircuitData, modulus: CircuitModulus,
) -> Result, (CircuitPartialOutputs, CircuitFailureGuarantee)>
```

### eval\_ex

Evaluates the circuit with an explicit descriptor and modulus.

#### Arguments

* `descriptor` - The circuit descriptor
* `modulus` - The modulus to use for arithmetic operations

#### Returns

Result containing either the circuit outputs or a failure indication

#### Signature

```rust theme={null}
fn eval_ex(
    self: CircuitData, descriptor: CircuitDescriptor, modulus: CircuitModulus,
) -> Result, (CircuitPartialOutputs, CircuitFailureGuarantee)>
```


