# core::starknet::syscalls::emit_event_syscall
Source: https://docs.starknet.io/build/corelib/core-starknet-syscalls-emit_event_syscall



Emits an event.

## Signature

```rust theme={null}
pub extern fn emit_event_syscall(keys: Span, data: Span) -> Result> implicits(GasBuiltin, System) nopanic;
```

#### Arguments

* `keys` - The keys of the event.
* `data` - The data of the event.


