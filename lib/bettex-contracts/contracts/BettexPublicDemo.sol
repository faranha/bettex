// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

/// @notice Public-testnet activity registry, NOT the economic token or custody of funds.
/// Demo balances and trading remain simulated; checkpoints attest app activity.
contract BettexPublicDemo {
    error Unauthorized();
    error WrongNetwork();
    error InvalidCheckpoint();
    address public immutable operator;
    bytes32 public constant APPLICATION = keccak256("BETTEX_PUBLIC_DEMO_V1");
    uint256 public checkpoints;
    uint256 public lastCheckpointAt;
    bytes32 public activityDigest;
    event Checkpoint(uint256 indexed sequence, bytes32 indexed digest, uint256 timestamp);

    constructor() {
        if (block.chainid != 421614 && block.chainid != 31337) revert WrongNetwork();
        operator = msg.sender;
    }

    function checkpoint(bytes32 digest) external {
        if (msg.sender != operator) revert Unauthorized();
        if (digest == bytes32(0)) revert InvalidCheckpoint();
        activityDigest = digest;
        lastCheckpointAt = block.timestamp;
        emit Checkpoint(++checkpoints, digest, block.timestamp);
    }
}
