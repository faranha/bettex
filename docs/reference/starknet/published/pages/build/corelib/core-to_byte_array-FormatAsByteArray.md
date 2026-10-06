# core::to_byte_array::FormatAsByteArray
Source: https://docs.starknet.io/build/corelib/core-to_byte_array-FormatAsByteArray



A trait for formatting values into their ASCII string representation in a `ByteArray`.

## Signature

```rust theme={null}
pub trait FormatAsByteArray
```

## Trait functions

### format\_as\_byte\_array

Returns a new `ByteArray` containing the ASCII representation of the value.

#### Signature

```rust theme={null}
fn format_as_byte_array(self: @T, base: NonZero) -> ByteArray
```

#### Examples

```rust theme={null}
use core::to_byte_array::FormatAsByteArray;

let num: u32 = 42;
let formatted = num.format_as_byte_array(16);
assert!(formatted, "2a");
```


