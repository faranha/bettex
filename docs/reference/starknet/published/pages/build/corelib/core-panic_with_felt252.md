# core::panic_with_felt252
Source: https://docs.starknet.io/build/corelib/core-panic_with_felt252



Panics with the given `felt252` as error message.

## Signature

```rust theme={null}
pub fn panic_with_felt252(err_code: felt252) -> never
```

## Examples

```rust theme={null}
use core::panic_with_felt252;

panic_with_felt252('error message');
```


