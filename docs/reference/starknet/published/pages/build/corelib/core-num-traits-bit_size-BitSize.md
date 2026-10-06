# core::num::traits::bit_size::BitSize
Source: https://docs.starknet.io/build/corelib/core-num-traits-bit_size-BitSize



A trait used to retrieve the size of a type in bits.

## Signature

```rust theme={null}
pub trait BitSize
```

## Trait functions

### bits

Returns the bit size of `T` as a `usize`.

#### Signature

```rust theme={null}
fn bits() -> u32
```

#### Examples

```rust theme={null}
use core::num::traits::BitSize;

let bits = BitSize::::bits();
assert!(bits == 8);
```


