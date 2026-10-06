# core::circuit::circuit_add
Source: https://docs.starknet.io/build/corelib/core-circuit-circuit_add



Creates a new circuit element representing addition modulo p of two input circuits.
This function combines two circuit elements using modular addition, creating a new circuit
element that represents their sum modulo the circuit's modulus.

## Signature

```rust theme={null}
pub fn circuit_add, +CircuitElementTrait>(
    lhs: CircuitElement, rhs: CircuitElement,
) -> CircuitElement>
```

#### Arguments

* `lhs` - Left-hand side circuit element
* `rhs` - Right-hand side circuit element

#### Returns

A new circuit element representing `(lhs + rhs) mod p`

## Examples

```rust theme={null}
let a = CircuitElement::> {};
let b = CircuitElement::> {};
let sum = circuit_add(a, b);
```


