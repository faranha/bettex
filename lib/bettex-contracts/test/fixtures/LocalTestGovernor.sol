// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

/// @notice Local harness ONLY, never a production multisig.
contract LocalTestGovernor {
    address private immutable signer;
    constructor() {
        require(block.chainid == 31337, "LOCAL_ONLY");
        signer = msg.sender;
    }
    function execute(address target, bytes calldata payload) external {
        require(msg.sender == signer, "NOT_TEST_SIGNER");
        (bool ok, bytes memory reason) = target.call(payload);
        if (!ok) assembly ("memory-safe") { revert(add(reason, 32), mload(reason)) }
    }
}
