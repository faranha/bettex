// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Local fixture ONLY. Not Circle USDC, not STT, never a public asset.
contract MockUSDC is ERC20 {
    error LocalOnly();
    error BlockedRecipient();
    mapping(address => bool) public blocked;
    constructor() ERC20("LOCAL MOCK USDC", "mockUSDC") {
        if (block.chainid != 31337) revert LocalOnly();
    }
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 amount) external { _mint(to, amount); }
    function setBlocked(address to, bool value) external { blocked[to] = value; }
    function _update(address from, address to, uint256 amount) internal virtual override {
        if (blocked[to]) revert BlockedRecipient();
        super._update(from, to, amount);
    }
}
