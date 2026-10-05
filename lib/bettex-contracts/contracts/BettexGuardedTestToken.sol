// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;
import {BettexTestToken} from "./BettexTestToken.sol";

/// @notice Opt-in test deployment; does not modify or replace existing tokens.
contract BettexGuardedTestToken is BettexTestToken {
    mapping(address => uint256) public exitNonce;
    constructor(address founder, address investors, address treasury, address operating,
        address administrator, address usdc, uint256 price, uint64[36] memory times)
        BettexTestToken(founder, investors, treasury, operating, administrator, usdc, price, times) {}

    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);
        if (from != address(0) && from != to && value > 0) ++exitNonce[from];
    }
}
