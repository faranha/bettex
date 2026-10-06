# core::starknet::testing::pop_log_raw
Source: https://docs.starknet.io/build/corelib/core-starknet-testing-pop_log_raw



Pop the earliest unpopped logged event for the contract.

## Signature

```rust theme={null}
pub fn pop_log_raw(address: ContractAddress) -> Option, Span)>
```

#### Arguments

`address` - The contract address from which to pop an event.
The value is returned as a tuple of two spans, the first for the keys and the second for the
data.
May be called multiple times to pop multiple events.
If called until `None` is returned, all events have been popped.


