// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {BettexAllocationVault} from "./BettexAllocationVault.sol";
import {BettexPrimarySale} from "./BettexPrimarySale.sol";

/// @notice One-billion genesis supply, entirely under the documented release schedule.
contract BettexTestToken is ERC20Burnable {
    error InvalidDestinations();
    uint256 public constant GENESIS_SUPPLY = 1_000_000_000 * 1e18;
    BettexPrimarySale public immutable publicSale;
    BettexAllocationVault public immutable founderVault;
    BettexAllocationVault public immutable investorVault;
    event TestAllocationCreated(address indexed publicSale, address indexed founderVault, address indexed investorVault);

    constructor(
        address founder, address investors, address treasury, address operating,
        address administrator, address usdc, uint256 pricePerWholeToken, uint64[36] memory times
    ) ERC20("BETTEX Testnet", "tBETTEX") {
        if (founder == address(0) || investors == address(0) || founder == investors
            || founder == treasury || founder == operating || investors == treasury || investors == operating) {
            revert InvalidDestinations();
        }
        publicSale = new BettexPrimarySale(address(this), usdc, treasury, operating, administrator, pricePerWholeToken, times);
        founderVault = new BettexAllocationVault(address(this), founder, 4, times);
        investorVault = new BettexAllocationVault(address(this), investors, 3, times);
        _mint(address(publicSale), 650_000_000 * 1e18);
        _mint(address(founderVault), 200_000_000 * 1e18);
        _mint(address(investorVault), 150_000_000 * 1e18);
        emit TestAllocationCreated(address(publicSale), address(founderVault), address(investorVault));
    }
}
