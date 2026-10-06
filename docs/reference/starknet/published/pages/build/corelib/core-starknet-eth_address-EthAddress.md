# core::starknet::eth_address::EthAddress
Source: https://docs.starknet.io/build/corelib/core-starknet-eth_address-EthAddress



An Ethereum address, 20 bytes in length.

## Signature

```rust theme={null}

#[derive(Copy, Drop, Hash, PartialEq)]
pub struct EthAddress {
    address: felt252,
}
```


