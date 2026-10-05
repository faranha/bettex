// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ITestBuyerBinding {
    function authorizedRecipient(address payer) external view returns (address);
}

/// @notice Local-test wallet service. Fee and delivery succeed or revert together.
/// No exchange rate, market making, minting, custody or operator withdrawal power.
contract BettexTestWalletService is ReentrancyGuard {
    using SafeERC20 for IERC20;
    IERC20 public immutable token;
    IERC20 public immutable usdc;
    ITestBuyerBinding public immutable sale;
    address public immutable operatingWallet;
    uint256 public constant FEE_USDC = 2_500_000;
    mapping(bytes32 => bool) public completed;
    error InvalidRequest();
    error AlreadyCompleted();
    event Withdrawal(bytes32 indexed operationId, address indexed payer, address indexed recipient,
        address asset, address holder, uint256 amount, uint256 fee);

    constructor(address token_, address usdc_, address sale_, address operating_) {
        if (block.chainid != 31337 || token_ == address(0) || usdc_ == address(0)
            || sale_ == address(0) || operating_ == address(0)) revert InvalidRequest();
        token = IERC20(token_);
        usdc = IERC20(usdc_);
        sale = ITestBuyerBinding(sale_);
        operatingWallet = operating_;
    }

    function withdraw(address asset, address recipient, uint256 amount, bytes32 operationId)
        external nonReentrant
    {
        address holder = sale.authorizedRecipient(msg.sender);
        if (holder == address(0) || amount == 0 || operationId == bytes32(0)
            || (asset != address(token) && asset != address(usdc))
            || recipient == address(0) || recipient == msg.sender || recipient == holder
            || recipient == address(this) || recipient == address(token) || recipient == address(usdc)
            || recipient == address(sale) || recipient == operatingWallet) revert InvalidRequest();
        if (completed[operationId]) revert AlreadyCompleted();
        completed[operationId] = true;
        usdc.safeTransferFrom(msg.sender, operatingWallet, FEE_USDC);
        IERC20(asset).safeTransferFrom(asset == address(usdc) ? msg.sender : holder, recipient, amount);
        emit Withdrawal(operationId, msg.sender, recipient, asset, holder, amount, FEE_USDC);
    }
}
