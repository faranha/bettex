# core::internal::InferDrop
Source: https://docs.starknet.io/build/corelib/core-internal-InferDrop



Helper to have the same interface as `DropWith` while inferring the `Drop` implementation.

## Signature

```rust theme={null}

#[derive(Drop)]
pub struct InferDrop {
    pub value: T,
}
```

## Members

### value

#### Signature

```rust theme={null}
pub value: T
```


