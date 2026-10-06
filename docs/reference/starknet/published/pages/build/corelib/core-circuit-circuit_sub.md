# core::circuit::circuit_sub
Source: https://docs.starknet.io/build/corelib/core-circuit-circuit_sub



Creates a new circuit element representing subtraction modulo p of two input circuits.
This function combines two circuit elements using modular subtraction, creating a new circuit
element that represents their difference modulo the circuit's modulus.

## Signature

```rust theme={null}
pub fn circuit_sub, +CircuitElementTrait>(
    lhs: CircuitElement, rhs: CircuitElement,
) -> CircuitElement>
```

#### Arguments

* `lhs` - Left-hand side circuit element (minuend)
* `rhs` - Right-hand side circuit element (subtrahend)

#### Returns

A new circuit element representing `(lhs - rhs) mod p`

## Examples

```rust theme={null}
let a = CircuitElement::> {};
let b = CircuitElement::> {};
let diff = circuit_sub(a, b);
```


