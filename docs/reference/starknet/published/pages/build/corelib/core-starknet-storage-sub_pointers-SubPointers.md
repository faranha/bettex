# core::starknet::storage::sub_pointers::SubPointers
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-sub_pointers-SubPointers



Similar to storage node, but for structs which are stored sequentially in the storage. In
contrast to storage node, the fields of the struct are just at an offset from the base address
of the struct.

## Signature

```rust theme={null}
pub trait SubPointers
```

## Trait functions

### sub\_pointers

Creates a sub pointers struct for the given storage pointer to a struct T.

#### Signature

```rust theme={null}
fn sub_pointers(self: StoragePointer) -> SubPointersSubPointersType
```

## Trait types

### SubPointersType

The type of the storage pointers, generated for the struct T.

#### Signature

```rust theme={null}
type SubPointersType;
```


