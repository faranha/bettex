// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;
import {MockUSDC} from "./MockUSDC.sol";

/// @notice Local adversarial fixture: attempts to reenter the sale during payment.
contract ReentrantMockUSDC is MockUSDC {
    address public target;
    bool public attempted;
    bool public reentryBlocked;
    function setTarget(address target_) external { target = target_; }
    function _update(address from, address to, uint256 amount) internal override {
        if (target != address(0) && from != address(0) && !attempted) {
            attempted = true;
            (bool success,) = target.call(abi.encodeWithSignature(
                "buy(uint256,uint256,bytes32)", 1, type(uint256).max, bytes32(uint256(123))
            ));
            reentryBlocked = !success;
        }
        super._update(from, to, amount);
    }
}
