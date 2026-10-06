# core::starknet::secp256_trait::Secp256PointTrait
Source: https://docs.starknet.io/build/corelib/core-starknet-secp256_trait-Secp256PointTrait



A trait for performing operations on Secp2561 curve points.
Provides operations needed for elliptic curve cryptography, including point addition
and scalar multiplication.

## Signature

```rust theme={null}
pub trait Secp256PointTrait
```

## Examples

```rust theme={null}
use starknet::SyscallResultTrait;
use starknet::secp256k1::Secp256k1Point;
use starknet::secp256_trait::Secp256PointTrait;
use starknet::secp256_trait::Secp256Trait;

let generator = Secp256Trait::::get_generator_point();

assert!(
    Secp256PointTrait::get_coordinates(generator)
        .unwrap_syscall() == (
            0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798,
            0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8,
        ),
);

let point = Secp256PointTrait::add(generator, generator);
let other_point = Secp256PointTrait::mul(generator, 2);
```

## Trait functions

### get\_coordinates

Returns the x and y coordinates of the curve point.

#### Signature

```rust theme={null}
fn get_coordinates(
    self: Secp256Point,
) -> Result>
```

### add

Performs elliptic curve point addition.
Adds `self` and `other` following the curve's addition law and returns
the resulting point.

#### Signature

```rust theme={null}
fn add(
    self: Secp256Point, other: Secp256Point,
) -> Result>
```

### mul

Performs scalar multiplication of a curve point.
Multiplies `self` by the given scalar value.

#### Signature

```rust theme={null}
fn mul(
    self: Secp256Point, scalar: u256,
) -> Result>
```


