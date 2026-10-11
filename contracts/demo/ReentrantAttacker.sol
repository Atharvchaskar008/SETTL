// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IVaultTarget {
    function markComplete(uint256 index) external;

    function withdraw() external;
}

/// @title ReentrantAttacker
/// @notice A payee that tries to be paid more than once. When the vault sends it
///         money, it calls withdraw again from inside its own receive function,
///         before the first payment has finished.
/// @dev Used only by the tests and the attack demo.
contract ReentrantAttacker {
    address public immutable owner;
    IVaultTarget public vault;

    /// @notice Times it asked for the money again from inside receive.
    uint256 public attempts;
    /// @notice Times the vault refused that inner request.
    uint256 public refusals;

    error NotOwner();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Points the attacker at the vault that names it as a payee.
    function aim(address vault_) external onlyOwner {
        vault = IVaultTarget(vault_);
    }

    /// @notice Behaves like an honest payee up to this point.
    function markComplete(uint256 index) external onlyOwner {
        vault.markComplete(index);
    }

    function attack() external onlyOwner {
        vault.withdraw();
    }

    receive() external payable {
        // Ask again for as long as the vault could pay the same amount once more.
        // The failure is swallowed so the outer withdrawal still completes.
        if (address(vault).balance >= msg.value) {
            attempts += 1;
            try vault.withdraw() {} catch {
                refusals += 1;
            }
        }
    }
}
