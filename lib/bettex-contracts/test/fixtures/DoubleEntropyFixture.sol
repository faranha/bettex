// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
interface IDoubleConsumer {
    function _entropyCallback(uint64 sequence, address provider, bytes32 randomness) external;
}
contract DoubleEntropyFixture {
    uint64 public sequence;
    mapping(uint64 => address) public consumers;
    function getFeeV2(uint32) external pure returns (uint128) { return 1; }
    function requestV2(uint32) external payable returns (uint64) {
        require(msg.value == 1);
        consumers[++sequence] = msg.sender;
        return sequence;
    }
    function resolve(uint64 seq, address provider, bytes32 randomness) external {
        IDoubleConsumer(consumers[seq])._entropyCallback(seq, provider, randomness);
    }
}
