# core::starknet::storage::sub_pointers::SubPointersForward
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-sub_pointers-SubPointersForward



A trait for implementing `SubPointers` for types which are not a `StoragePointer`, such as
`StorageBase` and `StoragePath`.

## Signature

```rust theme={null}
pub trait SubPointersForward
```

## Trait functions

### sub\_pointers

#### Signature

```rust theme={null}
fn sub_pointers(self: T) -> SubPointersForwardSubPointersType
```

## Trait types

### SubPointersType

#### Signature

```rust theme={null}
type SubPointersType;
```


