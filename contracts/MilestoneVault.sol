// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title MilestoneVault
/// @notice Holds the payers' deposits and pays them out one stage at a time.
/// @dev One vault is deployed per deal. Payers fund it, each stage has one payee,
///      and a judge who is neither a payer nor a payee settles disputes.
contract MilestoneVault is ReentrancyGuard {
    enum Phase {
        Funding,
        Active,
        Cancelled,
        Closed
    }

    enum State {
        Pending,
        Completed,
        Disputed,
        Released,
        Refunded
    }

    struct Stage {
        uint256 amount;
        address payee;
        State state;
        uint256 approvals;
    }

    address public immutable judge;
    /// @notice Fingerprint of the deal text and the checklist everyone agreed to.
    bytes32 public immutable agreementHash;
    uint256 public immutable totalAmount;

    address[] public payers;
    mapping(address => uint256) public shareOf;
    Stage[] public stages;

    Phase public phase;

    mapping(address => bool) public hasDeposited;
    uint256 public depositCount;
    mapping(uint256 => mapping(address => bool)) public hasApproved;
    uint256 public settledCount;

    // Accounting. Every wei in the vault is either locked in a stage or owed to someone.
    uint256 public totalDeposited;
    uint256 public totalLocked;
    uint256 public totalOwed;
    uint256 public totalWithdrawn;
    /// @notice Money each person may withdraw.
    mapping(address => uint256) public owed;

    event Deposited(address indexed payer, uint256 amount);
    event Activated(uint256 totalDeposited);
    event Cancelled(address indexed by);
    event DepositReturned(address indexed payer, uint256 amount);
    event Completed(uint256 indexed index, address indexed payee);
    event Approved(uint256 indexed index, address indexed payer, uint256 approvals);
    event Disputed(uint256 indexed index, address indexed payer);
    event Released(uint256 indexed index, address indexed payee, uint256 amount);
    event Refunded(uint256 indexed index, uint256 amount);
    event RefundShare(uint256 indexed index, address indexed payer, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event Closed();

    error NoPayers();
    error NoStages();
    error LengthMismatch();
    error ZeroAddress();
    error ZeroAmount();
    error DuplicatePayer(address payer);
    error JudgeMustBeNeutral();
    error PayeeCannotBePayer(address payee);
    error TotalsDiffer(uint256 shareTotal, uint256 stageTotal);
    error NotPayer();
    error WrongPhase(Phase current);
    error AlreadyDeposited();
    error WrongDeposit(uint256 expected, uint256 received);
    error NotPayee();
    error NoSuchStage(uint256 index);
    error WrongState(State current);
    error AlreadyApproved();
    error NotJudge();
    error NothingOwed();
    error TransferFailed();

    modifier onlyPayer() {
        if (shareOf[msg.sender] == 0) revert NotPayer();
        _;
    }

    modifier onlyJudge() {
        if (msg.sender != judge) revert NotJudge();
        _;
    }

    constructor(
        address[] memory payers_,
        uint256[] memory shares_,
        address judge_,
        address[] memory payees_,
        uint256[] memory amounts_,
        bytes32 agreementHash_
    ) {
        if (payers_.length == 0) revert NoPayers();
        if (payees_.length == 0) revert NoStages();
        if (payers_.length != shares_.length || payees_.length != amounts_.length) revert LengthMismatch();
        if (judge_ == address(0)) revert ZeroAddress();

        uint256 shareTotal;
        for (uint256 i = 0; i < payers_.length; i++) {
            address payer = payers_[i];
            if (payer == address(0)) revert ZeroAddress();
            if (shares_[i] == 0) revert ZeroAmount();
            if (shareOf[payer] != 0) revert DuplicatePayer(payer);
            if (payer == judge_) revert JudgeMustBeNeutral();

            shareOf[payer] = shares_[i];
            payers.push(payer);
            shareTotal += shares_[i];
        }

        uint256 stageTotal;
        for (uint256 i = 0; i < payees_.length; i++) {
            address payee = payees_[i];
            if (payee == address(0)) revert ZeroAddress();
            if (amounts_[i] == 0) revert ZeroAmount();
            if (payee == judge_) revert JudgeMustBeNeutral();
            if (shareOf[payee] != 0) revert PayeeCannotBePayer(payee);

            stages.push(Stage({amount: amounts_[i], payee: payee, state: State.Pending, approvals: 0}));
            stageTotal += amounts_[i];
        }

        if (shareTotal != stageTotal) revert TotalsDiffer(shareTotal, stageTotal);

        judge = judge_;
        agreementHash = agreementHash_;
        totalAmount = stageTotal;
    }

    /// @notice A payer puts in exactly their share, once.
    function deposit() external payable onlyPayer {
        if (phase != Phase.Funding) revert WrongPhase(phase);
        if (hasDeposited[msg.sender]) revert AlreadyDeposited();
        uint256 share = shareOf[msg.sender];
        if (msg.value != share) revert WrongDeposit(share, msg.value);

        hasDeposited[msg.sender] = true;
        depositCount += 1;
        totalDeposited += msg.value;
        totalLocked += msg.value;
        emit Deposited(msg.sender, msg.value);

        if (depositCount == payers.length) {
            phase = Phase.Active;
            emit Activated(totalDeposited);
        }
    }

    /// @notice Before every payer has paid, any payer may call the deal off.
    ///         Deposits already made are credited back to the payers who made them.
    function cancel() external onlyPayer {
        if (phase != Phase.Funding) revert WrongPhase(phase);

        phase = Phase.Cancelled;
        for (uint256 i = 0; i < payers.length; i++) {
            address payer = payers[i];
            if (hasDeposited[payer]) {
                _credit(payer, shareOf[payer]);
                emit DepositReturned(payer, shareOf[payer]);
            }
        }
        emit Cancelled(msg.sender);
    }

    /// @notice The payee of a stage says the work for it is done.
    function markComplete(uint256 index) external {
        Stage storage stage = _stage(index);
        if (msg.sender != stage.payee) revert NotPayee();
        if (phase != Phase.Active) revert WrongPhase(phase);
        if (stage.state != State.Pending) revert WrongState(stage.state);

        stage.state = State.Completed;
        emit Completed(index, msg.sender);
    }

    /// @notice A payer approves a completed stage. When more than half the payers
    ///         have approved, the stage is released to its payee.
    function approve(uint256 index) external onlyPayer {
        Stage storage stage = _stage(index);
        if (phase != Phase.Active) revert WrongPhase(phase);
        if (stage.state != State.Completed) revert WrongState(stage.state);
        if (hasApproved[index][msg.sender]) revert AlreadyApproved();

        hasApproved[index][msg.sender] = true;
        stage.approvals += 1;
        emit Approved(index, msg.sender, stage.approvals);

        if (stage.approvals * 2 > payers.length) {
            _release(index, stage);
        }
    }

    /// @notice Any payer may dispute a completed stage. The judge then decides it.
    function dispute(uint256 index) external onlyPayer {
        Stage storage stage = _stage(index);
        if (phase != Phase.Active) revert WrongPhase(phase);
        if (stage.state != State.Completed) revert WrongState(stage.state);

        stage.state = State.Disputed;
        emit Disputed(index, msg.sender);
    }

    /// @notice The judge settles a disputed stage: pay the payee, or refund the payers.
    ///         These are the judge's only two choices, and neither sends money to the judge.
    function resolve(uint256 index, bool payPayee) external onlyJudge {
        Stage storage stage = _stage(index);
        if (phase != Phase.Active) revert WrongPhase(phase);
        if (stage.state != State.Disputed) revert WrongState(stage.state);

        if (payPayee) {
            _release(index, stage);
        } else {
            _refund(index, stage);
        }
    }

    /// @notice Sends the caller whatever they are owed. This is the only function
    ///         that moves money out of the vault.
    /// @dev The credit is zeroed before the transfer, and the call cannot be
    ///      re-entered. Virtual only so the demo's WeakVault can show what
    ///      happens without those two protections.
    function withdraw() external virtual nonReentrant {
        uint256 amount = owed[msg.sender];
        if (amount == 0) revert NothingOwed();

        owed[msg.sender] = 0;
        totalOwed -= amount;
        totalWithdrawn += amount;
        emit Withdrawn(msg.sender, amount);

        (bool sent, ) = msg.sender.call{value: amount}("");
        if (!sent) revert TransferFailed();
    }

    /// @dev Settles a stage in the payers' favour, each payer credited by share.
    ///      Division rounds down, so the last payer takes whatever is left and
    ///      the credits always add up to the stage amount exactly.
    function _refund(uint256 index, Stage storage stage) private {
        stage.state = State.Refunded;

        uint256 remaining = stage.amount;
        uint256 last = payers.length - 1;
        for (uint256 i = 0; i < last; i++) {
            address payer = payers[i];
            uint256 part = (stage.amount * shareOf[payer]) / totalAmount;
            remaining -= part;
            _credit(payer, part);
            emit RefundShare(index, payer, part);
        }
        _credit(payers[last], remaining);
        emit RefundShare(index, payers[last], remaining);

        emit Refunded(index, stage.amount);
        _settle();
    }

    /// @dev Settles a stage in the payee's favour. The state changes before any credit.
    function _release(uint256 index, Stage storage stage) private {
        stage.state = State.Released;
        _credit(stage.payee, stage.amount);
        emit Released(index, stage.payee, stage.amount);
        _settle();
    }

    /// @dev Counts a settled stage and closes the vault after the last one.
    function _settle() private {
        settledCount += 1;
        if (settledCount == stages.length) {
            phase = Phase.Closed;
            emit Closed();
        }
    }

    function _stage(uint256 index) private view returns (Stage storage) {
        if (index >= stages.length) revert NoSuchStage(index);
        return stages[index];
    }

    /// @dev Moves `amount` from locked to owed. No money leaves the vault here.
    function _credit(address to, uint256 amount) private {
        totalLocked -= amount;
        totalOwed += amount;
        owed[to] += amount;
    }

    /// @notice True when the money in the vault matches the books: it equals
    ///         deposits minus withdrawals, and also locked money plus owed money.
    function reconciles() external view returns (bool) {
        uint256 balance = address(this).balance;
        return balance == totalDeposited - totalWithdrawn && balance == totalLocked + totalOwed;
    }

    function getPayers() external view returns (address[] memory) {
        return payers;
    }

    function getStages() external view returns (Stage[] memory) {
        return stages;
    }
}
