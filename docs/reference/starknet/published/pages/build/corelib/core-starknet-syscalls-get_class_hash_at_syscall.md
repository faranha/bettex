# core::starknet::syscalls::get_class_hash_at_syscall
Source: https://docs.starknet.io/build/corelib/core-starknet-syscalls-get_class_hash_at_syscall



Gets the class hash of the contract at the given address.

## Signature

```rust theme={null}
pub extern fn get_class_hash_at_syscall(contract_address: ContractAddress) -> Result> implicits(GasBuiltin, System) nopanic;
```

#### Arguments

* `contract_address` - The address of the deployed contract.

#### Returns

* The class hash of the contract's originating code.


