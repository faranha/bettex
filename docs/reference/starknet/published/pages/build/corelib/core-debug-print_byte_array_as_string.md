# core::debug::print_byte_array_as_string
Source: https://docs.starknet.io/build/corelib/core-debug-print_byte_array_as_string



Prints a `ByteArray` as a string.

## Signature

```rust theme={null}
pub fn print_byte_array_as_string(self: ByteArray)
```

## Examples

```rust theme={null}
let ba: ByteArray = "123";
print_byte_array_as_string(@ba);
```


