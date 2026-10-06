# core::internal::InferDestruct
Source: https://docs.starknet.io/build/corelib/core-internal-InferDestruct



Helper to have the same interface as `DestructWith` while inferring the `Destruct`
implementation.

## Signature

```rust theme={null}

#[derive(Destruct)]
pub struct InferDestruct {
    pub value: T,
}
```

## Members

### value

#### Signature

```rust theme={null}
pub value: T
```


