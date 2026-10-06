# core::starknet::info::get_execution_info
Source: https://docs.starknet.io/build/corelib/core-starknet-info-get_execution_info



Returns the execution info for the current execution.

## Signature

```rust theme={null}
pub fn get_execution_info() -> Box
```

## Examples

```rust theme={null}
use starknet::get_execution_info;

let execution_info = get_execution_info().unbox();

// Access various execution context information
let caller = execution_info.caller_address;
let contract = execution_info.contract_address;
let selector = execution_info.entry_point_selector;
```


