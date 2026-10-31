// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {TestnetSchedule} from "./TestnetSchedule.sol";

/// @notice Fixed-parameter test sale; no sweep, unrestricted mint or proxy.
contract BettexPrimarySale is TestnetSchedule, Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    error InvalidSaleConfiguration();
    error InvalidPurchase();
    error AlreadyProcessed();
    error UnreleasedInventory();
    error InexactPayment();
    error AdministrationRequired();
    error UnauthorizedBuyer();
    address public constant SEPOLIA_USDC = 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d;
    uint256 public constant APP_FEE_USDC = 2_500_000;
    IERC20 public immutable token;
    IERC20 public immutable usdc;
    address public immutable treasury;
    address public immutable operatingWallet;
    uint256 public immutable pricePerWholeTokenUsdc;
    uint256 public sold;
    mapping(address => address) public authorizedRecipient;
    event BuyerAuthorization(address indexed payer, address indexed recipient);
    mapping(address => mapping(bytes32 => bool)) public processed;
    mapping(address => mapping(bytes32 => bytes32)) public directIntent;
    event DirectPurchaseIntent(address indexed buyer, bytes32 indexed operationId, bytes32 terms);
    event PrimaryPurchase(
        bytes32 indexed operationId, address indexed buyer, address indexed recipient, bool appChannel,
        uint256 tokenUnits, uint256 principalUsdc, uint256 feeUsdc
    );

    constructor(
        address token_, address usdc_, address treasury_, address operating_,
        address administrator_, uint256 price_, uint64[36] memory times
    ) TestnetSchedule(times) Ownable(administrator_) {
        if (token_ == address(0) || treasury_ == address(0) || operating_ == address(0)
            || treasury_ == operating_ || price_ == 0 || usdc_.code.length == 0
            || IERC20Metadata(usdc_).decimals() != 6) revert InvalidSaleConfiguration();
        if (block.chainid == 421614 && (usdc_ != SEPOLIA_USDC || administrator_.code.length == 0)) {
            revert InvalidSaleConfiguration();
        }
        token = IERC20(token_);
        usdc = IERC20(usdc_);
        treasury = treasury_;
        operatingWallet = operating_;
        pricePerWholeTokenUsdc = price_;
        _pause();
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
    function transferOwnership(address newOwner) public override onlyOwner {
        if (newOwner == address(0) || (block.chainid == 421614 && newOwner.code.length == 0)) {
            revert InvalidSaleConfiguration();
        }
        super.transferOwnership(newOwner);
    }
    function renounceOwnership() public view override onlyOwner { revert AdministrationRequired(); }
    /// @notice Technical allowlist, not KYC. Production provisioning remains to be integrated.
    function authorizeBuyer(address payer, address recipient) external onlyOwner {
        if (payer == address(0) || recipient == address(0) || payer == treasury || payer == operatingWallet
            || recipient == treasury || recipient == operatingWallet || recipient == address(this)) {
            revert InvalidPurchase();
        }
        authorizedRecipient[payer] = recipient;
        emit BuyerAuthorization(payer, recipient);
    }
    function revokeBuyer(address payer) external onlyOwner {
        delete authorizedRecipient[payer];
        emit BuyerAuthorization(payer, address(0));
    }
    function inventory() external view returns (
        uint256 total, uint256 locked, uint256 released, uint256 soldUnits, uint256 available
    ) {
        total = 650_000_000 * 1e18;
        released = releasedGroups() * 13 * 1e18;
        locked = total - released;
        soldUnits = sold;
        available = released - sold;
    }

    /// @notice Explicit whole-token quantity and maximum approved total.
    function buy(uint256 wholeTokens, uint256 maxTotalUsdc, bytes32 operationId)
        external whenNotPaused nonReentrant
    {
        _purchase(msg.sender, msg.sender, wholeTokens, maxTotalUsdc, operationId, true);
    }

    /// @notice USDC wallet signs payment; BETTEX goes to its explicitly authorized wallet.
    function buyTo(address recipient, uint256 wholeTokens, uint256 maxTotalUsdc, bytes32 operationId)
        external whenNotPaused nonReentrant
    {
        _purchase(msg.sender, recipient, wholeTokens, maxTotalUsdc, operationId, true);
    }

    /// @notice Buyer explicitly authorizes exact terms, in addition to ERC-20 allowance.
    function authorizeDirect(uint256 wholeTokens, uint256 maxTotalUsdc, bytes32 operationId) external {
        if (operationId == bytes32(0) || wholeTokens == 0 || processed[msg.sender][operationId]) {
            revert InvalidPurchase();
        }
        bytes32 terms = keccak256(abi.encode(wholeTokens, maxTotalUsdc));
        directIntent[msg.sender][operationId] = terms;
        emit DirectPurchaseIntent(msg.sender, operationId, terms);
    }

    function revokeDirect(bytes32 operationId) external {
        delete directIntent[msg.sender][operationId];
        emit DirectPurchaseIntent(msg.sender, operationId, bytes32(0));
    }

    /// @notice Authorized broker channel, with buyer-approved terms and USDC allowance.
    function sellDirect(address buyer, uint256 wholeTokens, uint256 maxTotalUsdc, bytes32 operationId)
        external onlyOwner whenNotPaused nonReentrant
    {
        if (directIntent[buyer][operationId] != keccak256(abi.encode(wholeTokens, maxTotalUsdc))) {
            revert InvalidPurchase();
        }
        _purchase(buyer, buyer, wholeTokens, maxTotalUsdc, operationId, false);
        delete directIntent[buyer][operationId];
    }

    function _purchase(address buyer, address recipient, uint256 quantity, uint256 maximum, bytes32 id, bool appChannel) private {
        if (recipient == address(0) || authorizedRecipient[buyer] != recipient) revert UnauthorizedBuyer();
        if (buyer == address(0) || buyer == treasury || buyer == operatingWallet
            || quantity == 0 || id == bytes32(0)) revert InvalidPurchase();
        if (processed[buyer][id]) revert AlreadyProcessed();
        uint256 units = quantity * 1e18;
        if (sold + units > releasedGroups() * 13 * 1e18) revert UnreleasedInventory();
        uint256 principal = quantity * pricePerWholeTokenUsdc;
        uint256 fee = appChannel ? APP_FEE_USDC : 0;
        if (principal + fee > maximum) revert InvalidPurchase();
        processed[buyer][id] = true;
        sold += units;
        uint256 treasuryBefore = usdc.balanceOf(treasury);
        uint256 operatingBefore = usdc.balanceOf(operatingWallet);
        usdc.safeTransferFrom(buyer, treasury, principal);
        if (fee != 0) usdc.safeTransferFrom(buyer, operatingWallet, fee);
        // No fee-on-transfer, partial success or arbitrary stored balance.
        if (usdc.balanceOf(treasury) != treasuryBefore + principal
            || usdc.balanceOf(operatingWallet) != operatingBefore + fee) revert InexactPayment();
        token.safeTransfer(recipient, units);
        emit PrimaryPurchase(id, buyer, recipient, appChannel, units, principal, fee);
    }
}
