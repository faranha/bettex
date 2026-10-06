# core::starknet::account::AccountContractDispatcherTrait
Source: https://docs.starknet.io/build/corelib/core-starknet-account-AccountContractDispatcherTrait



## Signature

```rust theme={null}
pub trait AccountContractDispatcherTrait
```

## Trait functions

### **validate\_declare**

An entry point that is called to check if the account is willing to pay for the declaration
of the class with the given hash.
The entry point should return `starknet::VALIDATED` if the account is willing to pay
for the declaration.

#### Signature

```rust theme={null}
fn __validate_declare__(self: T, class_hash: felt252) -> felt252
```

### **validate**

An entry point that is called to check if the account is willing to pay for
executing a given set of calls.
The entry point should return `starknet::VALIDATED` if the account is willing to pay
for the execution, in which case `__execute__` will be called on the same set of calls.

#### Signature

```rust theme={null}
fn __validate__(self: T, calls: Array) -> felt252
```

### **execute**

An entry point that is called to execute a given set of calls.
This entry point should block the deprecated v0 invoke transactions as they do not go
through the `__validate__` entry point.

#### Signature

```rust theme={null}
fn __execute__(self: T, calls: Array) -> Array>
```


