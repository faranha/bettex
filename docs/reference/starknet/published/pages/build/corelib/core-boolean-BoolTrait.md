# core::boolean::BoolTrait
Source: https://docs.starknet.io/build/corelib/core-boolean-BoolTrait



## Signature

```rust theme={null}
pub trait BoolTrait>
```

## Trait functions

### then\_some

Returns `Some(t)` if the `bool` is `true`, `None` otherwise.

#### Signature

```rust theme={null}
fn then_some, T, +Drop>(self: bool, t: T) -> Option
```

#### Examples

```rust theme={null}
assert!(false.then_some(0) == None);
assert!(true.then_some(0) == Some(0));
```


