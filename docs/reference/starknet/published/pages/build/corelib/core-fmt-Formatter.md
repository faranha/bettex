# core::fmt::Formatter
Source: https://docs.starknet.io/build/corelib/core-fmt-Formatter



Configuration for formatting.

## Signature

```rust theme={null}

#[derive(Default, Drop)]
pub struct Formatter {
    pub buffer: ByteArray,
}
```

## Members

### buffer

The pending result of formatting.

#### Signature

```rust theme={null}
pub buffer: ByteArray
```


