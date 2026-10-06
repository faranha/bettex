# core::starknet::storage::SubPointersDeref
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-SubPointersDeref



This makes the sub-pointers members directly accessible from a pointer to the parent struct.

## Signature

```rust theme={null}
pub impl SubPointersDeref> of Deref>;
```

## Impl functions

### deref

#### Signature

```rust theme={null}
fn deref(self: StoragePointer) -> SubPointersType
```

## Impl types

### Target

#### Signature

```rust theme={null}
type Target = SubPointersType;
```


