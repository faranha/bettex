# core::starknet::class_hash::class_hash_const
Source: https://docs.starknet.io/build/corelib/core-starknet-class_hash-class_hash_const



Returns a `ClassHash` given a `felt252` value.

## Signature

```rust theme={null}
pub extern fn class_hash_const() -> ClassHash nopanic;
```

## Examples

```rust theme={null}
use starknet::class_hash::class_hash_const;

let class_hash = class_hash_const::();
```


