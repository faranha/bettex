// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

/// @notice Test-only network and immutable monthly release policy.
abstract contract TestnetSchedule {
    error UnsupportedNetwork();
    error InvalidSchedule();
    uint64[36] private _releaseTimes;

    constructor(uint64[36] memory times) {
        if (block.chainid != 31337 && block.chainid != 421614) revert UnsupportedNetwork();
        if (times[0] < block.timestamp) revert InvalidSchedule();
        for (uint256 i = 0; i < 36; ++i) {
            if (i > 0 && (times[i] <= times[i - 1]
                || times[i] - times[i - 1] < 28 days
                || times[i] - times[i - 1] > 31 days)) revert InvalidSchedule();
            _releaseTimes[i] = times[i];
        }
    }

    function releaseTime(uint256 index) external view returns (uint64) { return _releaseTimes[index]; }

    function currentMonth() public view returns (uint256) {
        uint256 month;
        for (uint256 i = 0; i < 36; ++i) {
            if (block.timestamp < _releaseTimes[i]) break;
            ++month;
        }
        return month;
    }

    /// @dev Whole-token groups of 13:4:3, identical to the documented schedule.
    function releasedGroups() public view returns (uint256) {
        return 50_000_000 * currentMonth() / 36;
    }
}
