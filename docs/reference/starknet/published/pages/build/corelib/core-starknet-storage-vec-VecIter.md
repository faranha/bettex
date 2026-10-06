# core::starknet::storage::vec::VecIter
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-vec-VecIter



An iterator struct over a `Vec` in storage.

## Signature

```rust theme={null}

#[derive(Drop)]
pub struct VecIter> {
    vec: T,
    current_index: IntRange,
}
```


