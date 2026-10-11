// Everything the server does on the chain goes through this file: deploying a
// vault, sending an action as a named person, and reading a vault's state.
//
// The server never decides whether an action is allowed. It sends the
// transaction and, if the contract refuses, turns the contract's error into a
// sentence a non-technical person can read.

const hre = require("hardhat");

const { ethers } = hre;

// Pretend money: Rs 1,000 is one test ETH on the local chain, so one rupee is 10^15 wei.
// At this scale gas costs a fraction of a rupee and wallets show round numbers.
const RUPEE = 10n ** 15n;
const toWei = (rupees) => BigInt(rupees) * RUPEE;
const toRupees = (wei) => Number(wei / RUPEE) + Number(wei % RUPEE) / Number(RUPEE);

const PHASES = ["Funding", "Active", "Cancelled", "Closed"];
const STATES = ["Pending", "Completed", "Disputed", "Released", "Refunded"];

const PHASE_REASON = [
  "The deal has not started yet: it is still waiting for deposits or stakes.",
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
  // The contract uses this one error for three actions; the action says which sentence fits.
  NotPayee: (args, method) =>
    ({ stake: "Only a payee in this deal can put in a stake.", leave: "Only a payee in this deal can leave it." })[method] ||
    "Only the person assigned to this stage can mark it done.",
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
  StakeNotRequired: () => "This deal has no stake, so there is nothing to put in and no leave step.",
  AlreadyStaked: () => "This payee has already put in their stake.",
  AlreadyLeft: () => "This payee has already left the deal.",
  NothingToLeave: () => "All of this payee's stages are settled, so there is nothing to walk away from. The stake comes back when the deal closes.",
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

function refusalFrom(error, contract, method) {
  const revert = decodeRevert(error, contract);
  if (!revert) return null;
  const reason = REASONS[revert.name];
  let text = "The contract refused this action.";
  if (reason) text = reason(revert.args, method) || text;
  return new Refusal(revert.name, text);
}

/**
 * Deploys one vault for one deal. Amounts are whole rupees.
 * @returns {Promise<string>} the vault's address
 */
async function deployVault({ payers, judge, stages, agreementHash, stake = 0, contract = "MilestoneVault" }) {
  const Vault = await ethers.getContractFactory(contract);
  try {
    const vault = await Vault.deploy(
      payers.map((payer) => payer.address),
      payers.map((payer) => toWei(payer.share)),
      judge,
      stages.map((stage) => stage.payee),
      stages.map((stage) => toWei(stage.amount)),
      agreementHash,
      toWei(stake)
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
    throw refusalFrom(error, vault, method) || error;
  }
}

/**
 * Asks the chain what would happen if `from` sent this action, without sending
 * it. Used for people who sign with their own wallet: a refusal is known, and
 * explained in plain words, before their wallet is ever opened.
 * @throws {Refusal} when the contract would refuse
 */
async function simulate(vault, from, method, args = [], overrides = {}) {
  try {
    // Connected to the provider alone: no account of the server's is involved in the call.
    await vault.connect(ethers.provider)[method].staticCall(...args, { ...overrides, from });
  } catch (error) {
    const refusal = refusalFrom(error, vault, method);
    if (refusal) throw refusal;
    if (/enough funds|insufficient funds/i.test(error.message || "")) {
      throw new Refusal("NotEnoughFunds", "This wallet does not hold enough to send that amount.");
    }
    throw error;
  }
}

/** The transaction a wallet must sign and send to carry out an action. The server never signs it. */
async function prepare(vault, method, args = [], overrides = {}) {
  const { chainId } = await ethers.provider.getNetwork();
  return {
    to: vault.target,
    data: vault.interface.encodeFunctionData(method, args),
    value: ethers.toBeHex(overrides.value || 0n),
    chainId: Number(chainId),
  };
}

/**
 * Looks up a transaction a wallet says it sent, and says what it did.
 * @returns {Promise<null | { from, to, succeeded, method, args }>} null if it is not on the chain
 */
async function lookUp(hash, vault) {
  const [transaction, receipt] = await Promise.all([ethers.provider.getTransaction(hash), ethers.provider.getTransactionReceipt(hash)]);
  if (!transaction || !receipt) return null;
  let call = null;
  try {
    call = vault.interface.parseTransaction({ data: transaction.data, value: transaction.value });
  } catch (ignored) {
    // Not a call this contract understands.
  }
  return {
    from: transaction.from,
    to: transaction.to,
    succeeded: receipt.status === 1,
    method: call ? call.name : null,
    args: call ? [...call.args] : [],
  };
}

/** What a client needs to talk to a vault directly. */
async function contractInfo() {
  const { chainId } = await ethers.provider.getNetwork();
  return { chainId: Number(chainId), rpcPath: "/rpc", abi: hre.artifacts.readArtifactSync("MilestoneVault").abi };
}

/** Reads everything the dashboard needs about a vault, in rupees. */
async function readVault(address, contract = "MilestoneVault") {
  const vault = await vaultAt(address, contract);
  const [phase, payers, payees, stages, judge, agreementHash, stake, balance, deposited, withdrawn, locked, owed, reconciles] =
    await Promise.all([
      vault.phase(),
      vault.getPayers(),
      vault.getPayees(),
      vault.getStages(),
      vault.judge(),
      vault.agreementHash(),
      vault.stakeAmount(),
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
  const payeeDetails = await Promise.all(
    payees.map(async (payee) => ({
      address: payee,
      staked: await vault.hasStaked(payee),
      left: await vault.hasLeft(payee),
    }))
  );

  return {
    address,
    agreementHash,
    judge,
    phase: PHASES[Number(phase)],
    stake: toRupees(stake),
    payers: payerDetails,
    payees: payeeDetails,
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
  const [deposits, returns, releases, refunds, withdrawals, disputes, stakes, stakeReturns, forfeits, stages, balance] =
    await Promise.all([
      eventsNamed("Deposited"),
      eventsNamed("DepositReturned"),
      eventsNamed("Released"),
      eventsNamed("RefundShare"),
      eventsNamed("Withdrawn"),
      eventsNamed("Disputed"),
      eventsNamed("Staked"),
      eventsNamed("StakeReturned"),
      eventsNamed("StakeForfeited"),
      vault.getStages(),
      ethers.provider.getBalance(address),
    ]);

  // Sums are kept in wei so that nothing is lost to rounding, and converted at the end.
  const accounts = new Map();
  const account = (who) => {
    if (!accounts.has(who)) {
      accounts.set(who, { paidIn: 0n, earned: 0n, refunded: 0n, withdrawn: 0n, staked: 0n, stakeBack: 0n, stakeLost: 0n, fromStakes: 0n });
    }
    return accounts.get(who);
  };
  for (const event of deposits) account(event.args.payer).paidIn += event.args.amount;
  for (const event of returns) account(event.args.payer).refunded += event.args.amount;
  for (const event of releases) account(event.args.payee).earned += event.args.amount;
  for (const event of refunds) account(event.args.payer).refunded += event.args.amount;
  for (const event of withdrawals) account(event.args.to).withdrawn += event.args.amount;
  for (const event of stakes) account(event.args.payee).staked += event.args.amount;
  for (const event of stakeReturns) account(event.args.payee).stakeBack += event.args.amount;
  for (const event of forfeits) {
    account(event.args.payee).stakeLost += event.args.amount;
    account(event.args.payer).fromStakes += event.args.amount;
  }

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
  const staked = total("staked");

  return {
    accounts: [...accounts.entries()].map(([who, entry]) => ({
      address: who,
      paidIn: toRupees(entry.paidIn),
      earned: toRupees(entry.earned),
      refunded: toRupees(entry.refunded),
      staked: toRupees(entry.staked),
      stakeBack: toRupees(entry.stakeBack),
      stakeLost: toRupees(entry.stakeLost),
      fromStakes: toRupees(entry.fromStakes),
      withdrawn: toRupees(entry.withdrawn),
      stillToWithdraw: toRupees(entry.earned + entry.refunded + entry.stakeBack + entry.fromStakes - entry.withdrawn),
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
      staked: toRupees(staked),
      stakesReturned: toRupees(total("stakeBack")),
      stakesForfeited: toRupees(total("stakeLost")),
      withdrawn: toRupees(withdrawn),
      stillInVault: toRupees(balance),
    },
    // Every rupee that came in, as a deposit or a stake, is either withdrawn or still in the vault.
    addsUp: deposited + staked === withdrawn + balance,
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
  simulate,
  prepare,
  lookUp,
  contractInfo,
  readVault,
  readSettlement,
  owedTo,
};
