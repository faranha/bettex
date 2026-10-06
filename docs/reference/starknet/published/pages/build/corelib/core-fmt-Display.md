# core::fmt::Display
Source: https://docs.starknet.io/build/corelib/core-fmt-Display



A trait for standard formatting, using the empty format ("").

## Signature

```rust theme={null}
pub trait Display
```

## Examples

```rust theme={null}
let word: ByteArray = "123";
println!("{}", word);
```

## Trait functions

### fmt

#### Signature

```rust theme={null}
fn fmt(self: @T, ref f: Formatter) -> Result
```


