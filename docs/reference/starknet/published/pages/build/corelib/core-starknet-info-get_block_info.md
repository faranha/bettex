# core::starknet::info::get_block_info
Source: https://docs.starknet.io/build/corelib/core-starknet-info-get_block_info



Returns the block information for the current block.

## Signature

```rust theme={null}
pub fn get_block_info() -> Box
```

## Examples

```rust theme={null}
use starknet::get_block_info;

let block_info = get_block_info().unbox();

let block_number = block_info.block_number;
let block_timestamp = block_info.block_timestamp;
let sequencer = block_info.sequencer_address;
```


