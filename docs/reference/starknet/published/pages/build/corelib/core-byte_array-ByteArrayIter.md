# core::byte_array::ByteArrayIter
Source: https://docs.starknet.io/build/corelib/core-byte_array-ByteArrayIter



An iterator struct over a ByteArray.

## Signature

```rust theme={null}

#[derive(Drop, Clone)]
pub struct ByteArrayIter {
    ba: ByteArray,
    current_index: IntRange,
}
```


