# core::assert
Source: https://docs.starknet.io/build/corelib/core-assert



Panics if `cond` is false with the given `felt252` as error message.

## Signature

```rust theme={null}
pub fn assert(cond: bool, err_code: felt252)
```

## Examples

```rust theme={null}
assert(false, 'error message');
```


