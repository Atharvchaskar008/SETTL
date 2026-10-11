// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MilestoneVault} from "../MilestoneVault.sol";

/// @title WeakVault
/// @notice UNSAFE. FOR DEMONSTRATION ONLY. Never use this contract to hold money.
/// @dev Identical to MilestoneVault except for withdraw, which has both
///      protections removed: it sends the money before clearing the credit, and
///      it can be re-entered. The attack demo runs the same attacker against
///      both vaults to show what those two lines are worth.
contract WeakVault is MilestoneVault {
    constructor(
        address[] memory payers_,
        uint256[] memory shares_,
        address judge_,
        address[] memory payees_,
        uint256[] memory amounts_,
        bytes32 agreementHash_,
        uint256 stakeAmount_
    ) MilestoneVault(payers_, shares_, judge_, payees_, amounts_, agreementHash_, stakeAmount_) {}

    function withdraw() external override {
        uint256 amount = owed[msg.sender];
        if (amount == 0) revert NothingOwed();

        // Mistake 1: the money leaves first...
        (bool sent, ) = msg.sender.call{value: amount}("");
        if (!sent) revert TransferFailed();

        // Mistake 2: ...and the credit is cleared only afterwards, with no guard.
        owed[msg.sender] = 0;
    }
}
