# core::panics::PanicResult
Source: https://docs.starknet.io/build/corelib/core-panics-PanicResult



Result type for operations that can trigger a panic.

## Signature

```rust theme={null}
pub enum PanicResult {
    Ok: T,
    Err: (Panic, Array),
}
```

## Variants

### Ok

#### Signature

```rust theme={null}
Ok: T
```

### Err

#### Signature

```rust theme={null}
Err: (Panic, Array)
```


