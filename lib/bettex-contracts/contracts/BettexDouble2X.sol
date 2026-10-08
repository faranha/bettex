// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IDoubleEntropy {
    function getFeeV2(uint32 gasLimit) external view returns (uint128);
    function requestV2(uint32 gasLimit) external payable returns (uint64);
}

/// @notice Isolated faucet token, NOT Circle USDC or the native BETTEX protocol.
contract Double2XTestUSDC is ERC20 {
    constructor(address treasury) ERC20("BETTEX Double 2X Test USDC", "tUSDC") {
        require(block.chainid == 421614 || block.chainid == 31337, "TESTNET_ONLY");
        _mint(treasury, 10_000_000 * 1e6);
    }
    function decimals() public pure override returns (uint8) { return 6; }
}

/// @notice Custodial ALFA earnings escrow. Operator mirrors simulated earnings
/// into isolated test tokens; outcomes and token settlements happen on-chain.
contract BettexDouble2X is ReentrancyGuard {
    using SafeERC20 for IERC20;
    uint32 public constant CALLBACK_GAS = 400_000;
    address public immutable operator;
    address public immutable treasury;
    address public immutable randomnessProvider;
    IERC20 public immutable token;
    IDoubleEntropy public immutable entropy;
    struct Play {
        bytes32 player;
        uint256 stake;
        uint64 sequence;
        uint64 startedAt;
        uint64 settledAt;
        uint8 choice; // 0 red, 1 black
        uint8 result;
        uint8 status; // 0 absent, 1 pending, 2 won, 3 lost
    }
    mapping(bytes32 => Play) public plays;
    mapping(uint64 => bytes32) private requests;
    mapping(bytes32 => uint256) public rewardBalance;
    mapping(bytes32 => uint64) public nextPlayAt;
    mapping(bytes32 => bool) public pending;
    event PlayRequested(bytes32 indexed id, bytes32 indexed player, uint64 sequence, uint256 stake, uint8 choice);
    event PlaySettled(bytes32 indexed id, uint64 sequence, uint8 result, uint256 payout);

    constructor(address token_, address treasury_, address entropy_, address provider_) {
        require(block.chainid == 421614 || block.chainid == 31337, "TESTNET_ONLY");
        require(token_.code.length > 0 && entropy_.code.length > 0 && treasury_ != address(0) && provider_ != address(0), "BAD_CONFIGURATION");
        operator = msg.sender;
        token = IERC20(token_);
        treasury = treasury_;
        entropy = IDoubleEntropy(entropy_);
        randomnessProvider = provider_;
    }

    function play(bytes32 player, bytes32 id, uint256 stake, uint8 choice) external payable nonReentrant returns (uint64) {
        require(msg.sender == operator, "OPERATOR_ONLY");
        require(player != bytes32(0) && id != bytes32(0) && stake > 0 && choice < 2, "INVALID_PLAY");
        Play storage previous = plays[id];
        if (previous.status != 0) {
            require(previous.player == player && previous.stake == stake && previous.choice == choice, "REQUEST_CONFLICT");
            if (msg.value > 0) { (bool ok,) = payable(operator).call{value: msg.value}(""); require(ok, "REFUND_FAILED"); }
            return previous.sequence;
        }
        require(!pending[player] && block.timestamp >= nextPlayAt[player], "DAILY_LIMIT");
        uint256 fee = entropy.getFeeV2(CALLBACK_GAS);
        require(msg.value == fee, "EXACT_ORACLE_FEE");
        // Synchronize ONLY the isolated game escrow, not any native account.
        uint256 oldBalance = rewardBalance[player];
        if (oldBalance < stake) token.safeTransferFrom(treasury, address(this), stake - oldBalance);
        else if (oldBalance > stake) token.safeTransfer(treasury, oldBalance - stake);
        // Reserve the entire potential payout before asking for randomness.
        token.safeTransferFrom(treasury, address(this), stake);
        rewardBalance[player] = 0;
        pending[player] = true;
        nextPlayAt[player] = uint64(block.timestamp + 24 hours);
        uint64 sequence = entropy.requestV2{value: fee}(CALLBACK_GAS);
        require(sequence != 0 && requests[sequence] == bytes32(0), "BAD_SEQUENCE");
        plays[id] = Play(player, stake, sequence, uint64(block.timestamp), 0, choice, 0, 1);
        requests[sequence] = id;
        emit PlayRequested(id, player, sequence, stake, choice);
    }

    /// @dev Pyth IEntropyConsumer callback ABI. No operator-chosen outcome.
    function _entropyCallback(uint64 sequence, address provider, bytes32 randomNumber) external nonReentrant {
        require(msg.sender == address(entropy) && provider == randomnessProvider, "ORACLE_ONLY");
        bytes32 id = requests[sequence];
        Play storage p = plays[id];
        require(id != bytes32(0) && p.status == 1, "UNKNOWN_REQUEST");
        uint8 result = uint8(uint256(randomNumber) & 1);
        bool won = result == p.choice;
        p.result = result;
        p.status = won ? 2 : 3;
        p.settledAt = uint64(block.timestamp);
        pending[p.player] = false;
        if (won) rewardBalance[p.player] = p.stake * 2;
        else token.safeTransfer(treasury, p.stake * 2);
        emit PlaySettled(id, sequence, result, won ? p.stake * 2 : 0);
    }
}
