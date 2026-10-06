# core::blake::blake2s_compress
Source: https://docs.starknet.io/build/corelib/core-blake-blake2s_compress



The blake2s compress function, which takes a state, a byte count, and a message, and returns a
new state.
`byte_count` should be the total number of bytes hashed after hashing the current `msg`.

## Signature

```rust theme={null}
pub extern fn blake2s_compress(state: Box, byte_count: u32, msg: Box) -> Box nopanic;
```


