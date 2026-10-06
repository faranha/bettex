# core::byte_array::ByteArrayTrait
Source: https://docs.starknet.io/build/corelib/core-byte_array-ByteArrayTrait



## Signature

```rust theme={null}
pub trait ByteArrayTrait
```

## Trait functions

### append\_word

Appends a single word of `len` bytes to the end of the `ByteArray`.
This function assumes that:

1. `word` could be validly converted to a `bytes31` which has no more than `len` bytes
   of data.
2. len  ByteArray

````


### append_byte



Appends a single byte to the end of the `ByteArray`.

#### Signature

```rust
fn append_byte(ref self: ByteArray, byte: u8)
````

#### Examples

```rust theme={null}
let mut ba = "";
ba.append_byte(0);
assert!(ba == "0");
```

### len

Returns the length of the `ByteArray`.

#### Signature

```rust theme={null}
fn len(self: ByteArray) -> u32
```

#### Examples

```rust theme={null}
let ba: ByteArray = "byte array";
let len = ba.len();
assert!(len == 10);
```

### at

Returns an option of the byte at the given index of `self`
or `None` if the index is out of bounds.

#### Signature

```rust theme={null}
fn at(self: ByteArray, index: u32) -> Option
```

#### Examples

```rust theme={null}
let ba: ByteArray = "byte array";
let byte = ba.at(0).unwrap();
assert!(byte == 98);
```

### rev

Returns a `ByteArray` with the reverse order of `self`.

#### Signature

```rust theme={null}
fn rev(self: ByteArray) -> ByteArray
```

#### Examples

```rust theme={null}
let ba: ByteArray = "123";
let rev_ba = ba.rev();
assert!(rev_ba == "321");
```

### append\_word\_rev

Appends the reverse of the given word to the end of `self`.
This function assumes that:

1. len \< 31
2. word is validly convertible to bytes31 of length `len`.

#### Signature

```rust theme={null}
fn append_word_rev(ref self: ByteArray, word: felt252, len: u32)
```

#### Examples

```rust theme={null}
let mut ba: ByteArray = "";
ba.append_word_rev('123', 3);
assert!(ba == "321");
```


