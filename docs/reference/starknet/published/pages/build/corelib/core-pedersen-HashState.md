# core::pedersen::HashState
Source: https://docs.starknet.io/build/corelib/core-pedersen-HashState



Represents the current state of a Pedersen hash computation.
The state is maintained as a single `felt252` value, which is updated
through the `HashStateTrait::finalize` method.

## Signature

```rust theme={null}

#[derive(Copy, Drop, Debug)]
pub struct HashState {
    pub state: felt252,
}
```

## Members

### state

The current hash state

#### Signature

```rust theme={null}
pub state: felt252
```


