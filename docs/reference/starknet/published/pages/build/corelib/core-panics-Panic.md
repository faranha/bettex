# panic
Source: https://docs.starknet.io/build/corelib/core-panics-Panic



## panic

```rust theme={null}
extern fn panic(data: Array<felt252>) -> never;
```

Triggers an immediate panic with the provided data and terminates execution.

This function is the core panic mechanism in Cairo. When called, it:

1. Takes an array of `felt252` values as panic data
2. Terminates the current execution
3. Propagates the panic data up the call stack

### Parameters

* `data: Array<felt252>` - The panic data to be included with the panic

### Returns

* `never` - This function never returns as it terminates execution

### Example

```rust theme={null}
use core::panics::panic;

// Panic with custom data
panic(array!['Error code', 42, 'Additional info']);
```

### Related Functions

* [`panic_with_byte_array`](./core-panics-panic_with_byte_array) - Panic with a `ByteArray` message
* [`panic!` macro](./core-panic_with_felt252) - Convenient macro for panicking with messages


