# core::starknet::event::EventEmitter
Source: https://docs.starknet.io/build/corelib/core-starknet-event-EventEmitter



A trait for emitting Starknet events.

## Signature

```rust theme={null}
pub trait EventEmitter
```

## Examples

```rust theme={null}
#[derive(Drop, starknet::Event)]
pub struct NewOwner {
    pub new_owner: ContractAddress,
}

fn emit_event(ref self: ContractState, new_owner: ContractAddress) {
    self.emit(NewOwner { new_owner });
}
```

## Trait functions

### emit

Emits an event.

#### Signature

```rust theme={null}
fn emit>(ref self: T, event: S)
```


