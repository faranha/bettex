# core::byte_array::ByteArray
Source: https://docs.starknet.io/build/corelib/core-byte_array-ByteArray



Byte array type.

## Signature

```rust theme={null}

#[derive(Drop, Clone, PartialEq, Serde, Default)]
pub struct ByteArray {
    pub(crate) data: Array,
    pub(crate) pending_word: felt252,
    pub(crate) pending_word_len: u32,
}
```


