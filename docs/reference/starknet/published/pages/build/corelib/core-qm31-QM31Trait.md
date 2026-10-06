# core::qm31::QM31Trait
Source: https://docs.starknet.io/build/corelib/core-qm31-QM31Trait



## Signature

```rust theme={null}
pub trait QM31Trait
```

## Trait functions

### new

Returns a new `qm31` composed of the given parts.

#### Signature

```rust theme={null}
fn new(
    w0: BoundedInt,
    w1: BoundedInt,
    w2: BoundedInt,
    w3: BoundedInt,
) -> qm31
```

### unpack

Returns the parts of the given `qm31` as `m31`s.

#### Signature

```rust theme={null}
fn unpack(self: qm31) -> [BoundedInt; 4]
```


