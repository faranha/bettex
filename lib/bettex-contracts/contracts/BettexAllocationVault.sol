// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {TestnetSchedule} from "./TestnetSchedule.sol";

contract BettexAllocationVault is TestnetSchedule {
    using SafeERC20 for IERC20;
    error InvalidAllocation();
    error NothingToRelease();
    IERC20 public immutable token;
    address public immutable beneficiary;
    uint256 public immutable groupShare;
    uint256 public released;
    event AllocationReleased(address indexed beneficiary, uint256 month, uint256 amount);

    constructor(address token_, address beneficiary_, uint256 share_, uint64[36] memory times)
        TestnetSchedule(times)
    {
        if (token_ == address(0) || beneficiary_ == address(0) || (share_ != 4 && share_ != 3)) {
            revert InvalidAllocation();
        }
        token = IERC20(token_);
        beneficiary = beneficiary_;
        groupShare = share_;
    }

    function releasable() public view returns (uint256) {
        return releasedGroups() * groupShare * 1e18 - released;
    }

    /// @notice Anyone can release, but destination and calendar cannot be changed.
    function release() external {
        uint256 amount = releasable();
        if (amount == 0) revert NothingToRelease();
        released += amount;
        token.safeTransfer(beneficiary, amount);
        emit AllocationReleased(beneficiary, currentMonth(), amount);
    }
}
