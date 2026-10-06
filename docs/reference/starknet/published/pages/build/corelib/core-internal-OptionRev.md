# core::internal::OptionRev
Source: https://docs.starknet.io/build/corelib/core-internal-OptionRev



Same as `Option`, except that the order of the variants is reversed.
This is used as the return type of some libfuncs for efficiency reasons.

## Signature

```rust theme={null}
pub enum OptionRev {
    None,
    Some: T,
}
```

## Variants

### None

#### Signature

```rust theme={null}
None
```

### Some

#### Signature

```rust theme={null}
Some: T
```


