# core::blake::blake2s_finalize
Source: https://docs.starknet.io/build/corelib/core-blake-blake2s_finalize



A variant of `blake2s_compress` for the final block of the message.
The input `msg` must always be exactly 16 `u32` elements, padded with zeros if necessary,
regardless of the value of `byte_count`. Using any padding scheme other than zero-padding
will produce a different hash output.

## Signature

```rust theme={null}
pub extern fn blake2s_finalize(state: Box, byte_count: u32, msg: Box) -> Box nopanic;
```


