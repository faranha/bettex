# core::starknet::info::BlockInfo
Source: https://docs.starknet.io/build/corelib/core-starknet-info-BlockInfo



Information about the current block.

## Signature

```rust theme={null}

#[derive(Copy, Drop, Debug, Serde)]
pub struct BlockInfo {
    pub block_number: u64,
    pub block_timestamp: u64,
    pub sequencer_address: ContractAddress,
}
```

## Members

### block\_number

The number, that is, the height, of this block.

#### Signature

```rust theme={null}
pub block_number: u64
```

### block\_timestamp

The time at which the sequencer began building the block, in seconds since the Unix epoch.

#### Signature

```rust theme={null}
pub block_timestamp: u64
```

### sequencer\_address

The Starknet address of the sequencer that created the block.

#### Signature

```rust theme={null}
pub sequencer_address: ContractAddress
```


