# core::starknet::storage::map::StorageMapReadAccess
Source: https://docs.starknet.io/build/corelib/core-starknet-storage-map-StorageMapReadAccess



Provides direct read access to values in a storage [`Map`](./core-starknet-storage-map-Map).

## Signature

```rust theme={null}
pub trait StorageMapReadAccess
```

## Examples

```rust theme={null}
use starknet::ContractAddress;
use starknet::storage::{Map, StorageMapReadAccess, StoragePathEntry};

#[storage]
struct Storage {
    balances: Map,
    allowances: Map>,
}

fn read_storage(self: @ContractState, address: ContractAddress) {
    // Read from single mapping
    let balance = self.balances.read(address);
    // Read from nested mapping
    let allowance = self.allowances.entry(owner).read(spender);
}
```

## Trait functions

### read

#### Signature

```rust theme={null}
fn read(self: TMemberState, key: Self::Key) -> StorageMapReadAccessValue
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


