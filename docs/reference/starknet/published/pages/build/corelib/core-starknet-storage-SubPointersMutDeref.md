# core::starknet::storage::SubPointersMutDeref
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-SubPointersMutDeref



This makes the sub-pointers members directly accessible from a pointer to the parent struct.

## Signature

```rust theme={null}
pub impl SubPointersMutDeref> of Deref>>;
```

## Impl functions

### deref

#### Signature

```rust theme={null}
fn deref(self: StoragePointer>) -> SubPointersType
```

## Impl types

### Target

#### Signature

```rust theme={null}
type Target = SubPointersType;
```


