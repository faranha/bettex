// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IExitTrackedToken {
    function exitNonce(address holder) external view returns (uint256);
}

/// @notice Test-only atomic payout gate. Rights must still be assessed by the ledger.
/// A snapshot exit nonce, bounded round, budget and one-shot identifier are immutable.
contract BettexTestDistributionGuard is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    IExitTrackedToken public immutable token;
    IERC20 public immutable usdc;
    address public immutable treasury;
    mapping(bytes32 => bool) public used;
    mapping(uint256 => uint256) public budgets;
    mapping(uint256 => uint256) public spent;
    error InvalidRight();
    event Paid(bytes32 indexed id, uint256 indexed roundStart, address indexed holder, address recipient, uint256 units);
    constructor(address token_, address usdc_, address treasury_, address operator) Ownable(operator) {
        if (block.chainid != 31337 || token_ == address(0) || usdc_ == address(0)
            || treasury_ == address(0)) revert InvalidRight();
        token = IExitTrackedToken(token_);
        usdc = IERC20(usdc_);
        treasury = treasury_;
    }
    function authorizeRound(uint256 start, uint256 budget) external onlyOwner {
        if (start % 86400 != 0 || start > block.timestamp || block.timestamp >= start + 86400
            || budget == 0 || budgets[start] != 0) revert InvalidRight();
        budgets[start] = budget;
    }
    function pay(bytes32 id, uint256 start, address holder, address recipient,
        uint256 snapshotExitNonce, uint256 units) external onlyOwner nonReentrant {
        if (id == bytes32(0) || used[id] || holder == address(0) || recipient == address(0)
            || units == 0 || start > block.timestamp || block.timestamp >= start + 86400
            || token.exitNonce(holder) != snapshotExitNonce || spent[start] + units > budgets[start]) {
            revert InvalidRight();
        }
        used[id] = true;
        spent[start] += units;
        usdc.safeTransferFrom(treasury, recipient, units);
        emit Paid(id, start, holder, recipient, units);
    }
}
