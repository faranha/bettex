# core::starknet::storage::map::StorageMapWriteAccess
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-map-StorageMapWriteAccess



Provides direct write access to values in a storage [`Map`](./core-starknet-storage-map-Map).
Enables directly storing values in the contract's storage at the address of the given key.

## Signature

```rust theme={null}
pub trait StorageMapWriteAccess
```

## Examples

```rust theme={null}
use starknet::ContractAddress;
use starknet::storage::{Map, StorageMapWriteAccess, StoragePathEntry};

#[storage]
struct Storage {
    balances: Map,
    allowances: Map>,
}

fn write_storage(ref self: ContractState, address: ContractAddress) {
    // Write to single mapping
    self.balances.write(address, 100);
    // Write to nested mapping
    self.allowances.entry(owner).write(spender, 50);
}
```

## Trait functions

### write

#### Signature

```rust theme={null}
fn write(self: TMemberState, key: Self::Key, value: Self::Value)
```

## Trait types

### Key

#### Signature

```rust theme={null}
type Key;
```

### Value

#### Signature

```rust theme={null}
type Value;
```


