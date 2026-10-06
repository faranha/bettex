# core::to_byte_array::AppendFormattedToByteArray
Source: https://docs.starknet.io/build/corelib/core-to_byte_array-AppendFormattedToByteArray



A trait for appending the ASCII representation of a number to an existing `ByteArray`.

## Signature

```rust theme={null}
pub trait AppendFormattedToByteArray
```

## Trait functions

### append\_formatted\_to\_byte\_array

Appends the ASCII representation of the value to the provided `ByteArray`.

#### Signature

```rust theme={null}
fn append_formatted_to_byte_array(self: @T, ref byte_array: ByteArray, base: NonZero)
```

#### Examples

```rust theme={null}
use core::to_byte_array::AppendFormattedToByteArray;

let mut buffer = "Count: ";
let num: u32 = 42;
num.append_formatted_to_byte_array(ref buffer, 10);
assert!(buffer == "Count: 42");
```


