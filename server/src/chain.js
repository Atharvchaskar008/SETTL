// Everything the server does on the chain goes through this file: deploying a
// vault, sending an action as a named person, and reading a vault's state.
//
// The server never decides whether an action is allowed. It sends the
// transaction and, if the contract refuses, turns the contract's error into a
// sentence a non-technical person can read.

const hre = require("hardhat");

const { ethers } = hre;

// Pretend money: one rupee is 10^12 wei on the local chain.
const RUPEE = 10n ** 12n;
const toWei = (rupees) => BigInt(rupees) * RUPEE;
const toRupees = (wei) => Number(wei / RUPEE) + Number(wei % RUPEE) / 1e12;

const PHASES = ["Funding", "Active", "Cancelled", "Closed"];
const STATES = ["Pending", "Completed", "Disputed", "Released", "Refunded"];

const PHASE_REASON = [
  "The deal is still waiting for deposits, so this step is not allowed yet.",
  "The deal has already started, so this step is no longer allowed.",
  "The deal was cancelled, so nothing more can happen in it.",
  "The deal is closed: every stage is already settled.",
];
const STATE_REASON = [
  "This stage has not been marked done yet.",
  "This stage is marked done and is waiting for the payers.",
  "This stage is disputed and is waiting for the judge.",
  "This stage has already been paid.",
  "This stage has already been refunded.",
];

// One plain-language reason per contract error.
const REASONS = {
  NotPayer: () => "Only a payer in this deal can do that.",
  NotPayee: () => "Only the person assigned to this stage can mark it done.",
  NotJudge: () => "Only the judge can settle a dispute.",
  WrongPhase: ([phase]) => PHASE_REASON[Number(phase)],
  WrongState: ([state]) => STATE_REASON[Number(state)],
  NoSuchStage: ([index]) => `There is no stage ${Number(index) + 1} in this deal.`,
  AlreadyDeposited: () => "This payer has already paid in their share.",
  WrongDeposit: ([expected, received]) =>
    `The deposit must be exactly ₹${toRupees(expected)}, not ₹${toRupees(received)}.`,
  AlreadyApproved: () => "This payer has already approved this stage.",
  NothingOwed: () => "There is nothing for this person to withdraw.",
  TransferFailed: () => "The payment could not be sent.",
  ReentrancyGuardReentrantCall: () => "A second withdrawal was attempted before the first one had finished.",
  // Refusals at creation. The checklist rules catch these first; the contract checks again.
  JudgeMustBeNeutral: () => "The judge cannot be a payer or a payee in the same deal.",
  PayeeCannotBePayer: () => "A person cannot both pay into a deal and be paid from it.",
  DuplicatePayer: () => "The same payer is listed twice.",
  TotalsDiffer: ([shares, stages]) =>
    `The payers put in ₹${toRupees(shares)} but the stages add up to ₹${toRupees(stages)}.`,
  ZeroAmount: () => "Every share and every stage amount must be above zero.",
  ZeroAddress: () => "Someone in the deal has no account.",
  NoPayers: () => "A deal needs at least one payer.",
  NoStages: () => "A deal needs at least one stage.",
  LengthMismatch: () => "The lists of people and amounts do not line up.",
};

/** Thrown when the contract says no. `rule` is the contract error name. */
class Refusal extends Error {
  constructor(rule, reason) {
    super(reason);
    this.name = "Refusal";
    this.rule = rule;
    this.reason = reason;
  }
}

/** Finds the contract's custom error inside whatever the provider threw. */
function decodeRevert(error, contract) {
  const data = [error.data, error.error && error.error.data, error.info && error.info.error && error.info.error.data].find(
    (value) => typeof value === "string" && value.startsWith("0x") && value.length >= 10
  );
  if (data) {
    try {
      const parsed = contract.interface.parseError(data);
      if (parsed) return { name: parsed.name, args: [...parsed.args] };
    } catch (ignored) {
      // Not one of this contract's errors; fall through to the message.
    }
  }
  const named = /custom error '(\w+)\(/.exec(error.message || "");
  return named ? { name: named[1], args: [] } : null;
}

function refusalFrom(error, contract) {
  const revert = decodeRevert(error, contract);
  if (!revert) return null;
  const reason = REASONS[revert.name];
  let text = "The contract refused this action.";
  if (reason) text = reason(revert.args) || text;
  return new Refusal(revert.name, text);
}

/**
 * Deploys one vault for one deal. Amounts are whole rupees.
 * @returns {Promise<string>} the vault's address
 */
async function deployVault({ payers, judge, stages, agreementHash, contract = "MilestoneVault" }) {
  const Vault = await ethers.getContractFactory(contract);
  try {
    const vault = await Vault.deploy(
      payers.map((payer) => payer.address),
      payers.map((payer) => toWei(payer.share)),
      judge,
      stages.map((stage) => stage.payee),
      stages.map((stage) => toWei(stage.amount)),
      agreementHash
    );
    await vault.waitForDeployment();
    return vault.target;
  } catch (error) {
    throw refusalFrom(error, Vault) || error;
  }
}

const vaultAt = (address, contract = "MilestoneVault") => ethers.getContractAt(contract, address);

/**
 * Sends one action to a vault as `signer`.
 * @returns {Promise<{ tx: string }>}
 * @throws {Refusal} when the contract refuses
 */
async function act(vault, signer, method, args = [], overrides = {}) {
  try {
    const transaction = await vault.connect(signer)[method](...args, overrides);
    await transaction.wait();
    return { tx: transaction.hash };
  } catch (error) {
    throw refusalFrom(error, vault) || error;
  }
}

/** Reads everything the dashboard needs about a vault, in rupees. */
async function readVault(address, contract = "MilestoneVault") {
  const vault = await vaultAt(address, contract);
  const [phase, payers, stages, judge, agreementHash, balance, deposited, withdrawn, locked, owed, reconciles] =
    await Promise.all([
      vault.phase(),
      vault.getPayers(),
      vault.getStages(),
      vault.judge(),
      vault.agreementHash(),
      ethers.provider.getBalance(address),
      vault.totalDeposited(),
      vault.totalWithdrawn(),
      vault.totalLocked(),
      vault.totalOwed(),
      vault.reconciles(),
    ]);

  const payerDetails = await Promise.all(
    payers.map(async (payer) => ({
      address: payer,
      share: toRupees(await vault.shareOf(payer)),
      deposited: await vault.hasDeposited(payer),
    }))
  );

  return {
    address,
    agreementHash,
    judge,
    phase: PHASES[Number(phase)],
    payers: payerDetails,
    stages: stages.map((stage, index) => ({
      number: index + 1,
      payee: stage.payee,
      amount: toRupees(stage.amount),
      state: STATES[Number(stage.state)],
      approvals: Number(stage.approvals),
    })),
    approvalsNeeded: Math.floor(payers.length / 2) + 1,
    money: {
      inVault: toRupees(balance),
      locked: toRupees(locked),
      waitingToBeWithdrawn: toRupees(owed),
      paidOut: toRupees(withdrawn),
      deposited: toRupees(deposited),
      reconciles,
    },
  };
}

/**
 * The final accounts of a vault, rebuilt from the events the contract emitted.
 * Nothing here comes from the server's own records.
 */
async function readSettlement(address, contract = "MilestoneVault") {
  const vault = await vaultAt(address, contract);
  const eventsNamed = (name) => vault.queryFilter(vault.filters[name]());
  const [deposits, returns, releases, refunds, withdrawals, disputes, stages, balance] = await Promise.all([
    eventsNamed("Deposited"),
    eventsNamed("DepositReturned"),
    eventsNamed("Released"),
    eventsNamed("RefundShare"),
    eventsNamed("Withdrawn"),
    eventsNamed("Disputed"),
    vault.getStages(),
    ethers.provider.getBalance(address),
  ]);

  // Sums are kept in wei so that nothing is lost to rounding, and converted at the end.
  const accounts = new Map();
  const account = (who) => {
    if (!accounts.has(who)) accounts.set(who, { paidIn: 0n, earned: 0n, refunded: 0n, withdrawn: 0n });
    return accounts.get(who);
  };
  for (const event of deposits) account(event.args.payer).paidIn += event.args.amount;
  for (const event of returns) account(event.args.payer).refunded += event.args.amount;
  for (const event of releases) account(event.args.payee).earned += event.args.amount;
  for (const event of refunds) account(event.args.payer).refunded += event.args.amount;
  for (const event of withdrawals) account(event.args.to).withdrawn += event.args.amount;

  const disputed = new Set(disputes.map((event) => Number(event.args.index)));
  const outcomeOf = (stage, index) => {
    const state = STATES[Number(stage.state)];
    if (state === "Released") return disputed.has(index) ? "paid by the judge" : "paid on approval";
    if (state === "Refunded") return "refunded by the judge";
    return "not settled";
  };

  const total = (field) => [...accounts.values()].reduce((sum, entry) => sum + entry[field], 0n);
  const deposited = total("paidIn");
  const earned = total("earned");
  const refunded = total("refunded");
  const withdrawn = total("withdrawn");

  return {
    accounts: [...accounts.entries()].map(([who, entry]) => ({
      address: who,
      paidIn: toRupees(entry.paidIn),
      earned: toRupees(entry.earned),
      refunded: toRupees(entry.refunded),
      withdrawn: toRupees(entry.withdrawn),
      stillToWithdraw: toRupees(entry.earned + entry.refunded - entry.withdrawn),
    })),
    stages: stages.map((stage, index) => ({
      number: index + 1,
      payee: stage.payee,
      amount: toRupees(stage.amount),
      outcome: outcomeOf(stage, index),
    })),
    totals: {
      deposited: toRupees(deposited),
      paidToPayees: toRupees(earned),
      returnedToPayers: toRupees(refunded),
      withdrawn: toRupees(withdrawn),
      stillInVault: toRupees(balance),
    },
    // Every deposited rupee is either withdrawn or still in the vault.
    addsUp: deposited === withdrawn + balance,
  };
}

/** What one address may withdraw from a vault right now, in rupees. */
async function owedTo(address, person, contract = "MilestoneVault") {
  return toRupees(await (await vaultAt(address, contract)).owed(person));
}

module.exports = {
  ethers,
  RUPEE,
  toWei,
  toRupees,
  PHASES,
  STATES,
  Refusal,
  deployVault,
  vaultAt,
  act,
  readVault,
  readSettlement,
  owedTo,
};
