# core::starknet::storage::sub_pointers::SubPointersMutForward
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-sub_pointers-SubPointersMutForward



A trait for implementing `SubPointersMut` for types which are not a `StoragePointer`, such as
`StorageBase` and `StoragePath`.

## Signature

```rust theme={null}
pub trait SubPointersMutForward
```

## Trait functions

### sub\_pointers\_mut

#### Signature

```rust theme={null}
fn sub_pointers_mut(self: T) -> SubPointersMutForwardSubPointersType
```

## Trait types

### SubPointersType

#### Signature

```rust theme={null}
type SubPointersType;
```


