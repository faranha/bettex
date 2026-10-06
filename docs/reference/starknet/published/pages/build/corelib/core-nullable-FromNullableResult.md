# core::nullable::FromNullableResult
Source: https://docs.starknet.io/build/corelib/core-nullable-FromNullableResult



Represents the result of matching a `Nullable` value.
Used to safely handle both null and non-null cases when using `match_nullable` on a
`Nullable`.

## Signature

```rust theme={null}
pub enum FromNullableResult {
    Null,
    NotNull: Box,
}
```

## Variants

### Null

Represents a null value

#### Signature

```rust theme={null}
Null
```

### NotNull

The boxed value when not null

#### Signature

```rust theme={null}
NotNull: Box
```


