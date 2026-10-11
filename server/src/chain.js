// Everything the server does on the chain goes through this file: deploying a
// vault, sending an action as a named person, and reading a vault's state.
//
// The server never decides whether an action is allowed. It sends the
// transaction and, if the contract refuses, turns the contract's error into a
// sentence a non-technical person can read.

const hre = require("hardhat");

const { ethers } = hre;

// Where the chain is. "Local" is the Hardhat network inside this process: it has
// built-in funded accounts, can hand out test money and can be reset. Any other
// network (a public test network, for example) is reached over RPC; there the
// server holds no key at all, and every transaction comes from someone's wallet.
const isLocal = hre.network.name === "hardhat";

// Test money. On the local chain Rs 1,000 is one test ETH (10^15 wei per rupee):
// gas costs a fraction of a rupee and wallets show round numbers. On a public
// test network test ETH is scarce, so a rupee is 10^9 wei there and Rs 30,000
// is 0.00003 test ETH. RUPEE_WEI overrides either.
const RUPEE = BigInt(process.env.RUPEE_WEI || (isLocal ? 10n ** 15n : 10n ** 9n));
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

/** A deal's terms in the order and units the vault's constructor takes them. */
const constructorArgs = ({ payers, judge, stages, agreementHash, stake = 0 }) => [
  payers.map((payer) => payer.address),
  payers.map((payer) => toWei(payer.share)),
  judge,
  stages.map((stage) => stage.payee),
  stages.map((stage) => toWei(stage.amount)),
  agreementHash,
  toWei(stake),
];

/**
 * Deploys one vault for one deal from an account the server holds. Local chain
 * only, for demo people. Amounts are whole rupees.
 * @returns {Promise<{ address: string, block: number }>}
 */
async function deployVault(terms) {
  const Vault = await ethers.getContractFactory(terms.contract || "MilestoneVault");
  try {
    const vault = await Vault.deploy(...constructorArgs(terms));
    const receipt = await vault.deploymentTransaction().wait();
    return { address: vault.target, block: receipt.blockNumber };
  } catch (error) {
    throw refusalFrom(error, Vault) || error;
  }
}

/**
 * The transaction that creates a deal's vault, for the organiser's own wallet to
 * sign and send. It is built from the agreed terms alone, so a transaction with
 * exactly this data can only create exactly this vault.
 */
async function deploymentFor(terms) {
  const artifact = hre.artifacts.readArtifactSync(terms.contract || "MilestoneVault");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode);
  const { data } = await factory.getDeployTransaction(...constructorArgs(terms));
  const { chainId } = await ethers.provider.getNetwork();
  return { data, value: "0x0", chainId: Number(chainId) };
}

/** A vault to read from. On the local chain it is also connected to an account, so demo people can act. */
async function vaultAt(address, contract = "MilestoneVault") {
  const artifact = hre.artifacts.readArtifactSync(contract);
  const [account] = await ethers.getSigners();
  return new ethers.Contract(address, artifact.abi, account || ethers.provider);
}

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
 * `vault` may be left out when the transaction is the one that creates the vault.
 * @returns {Promise<null | { from, to, data, created, block, succeeded, method, args }>} null if it is not on the chain
 */
async function lookUp(hash, vault) {
  const read = () => Promise.all([ethers.provider.getTransaction(hash), ethers.provider.getTransactionReceipt(hash)]);
  let [transaction, receipt] = await read();
  // On a public network the wallet's node can be a moment ahead of the one the server reads from.
  for (let attempt = 0; !isLocal && (!transaction || !receipt) && attempt < LOOKUP_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, LOOKUP_PAUSE_MS));
    [transaction, receipt] = await read();
  }
  if (!transaction || !receipt) return null;
  let call = null;
  try {
    if (vault && transaction.to) call = vault.interface.parseTransaction({ data: transaction.data, value: transaction.value });
  } catch (ignored) {
    // Not a call this contract understands.
  }
  return {
    from: transaction.from,
    to: transaction.to,
    data: transaction.data,
    // The address of the contract this transaction created, if it created one.
    created: receipt.contractAddress,
    block: receipt.blockNumber,
    succeeded: receipt.status === 1,
    method: call ? call.name : null,
    args: call ? [...call.args] : [],
  };
}

// The only networks Settl will run on. Every one of them uses test money that
// is free and worth nothing. `rpc` is a public address a wallet can use to add
// the network; the server's own RPC address is never sent to a browser.
const TEST_NETWORKS = {
  31337: { name: "Local", coin: "ETH" },
  1337: { name: "Local", coin: "ETH" },
  11155111: { name: "Sepolia", coin: "ETH", explorer: "https://sepolia.etherscan.io", rpc: "https://ethereum-sepolia-rpc.publicnode.com" },
  17000: { name: "Holesky", coin: "ETH", explorer: "https://holesky.etherscan.io", rpc: "https://ethereum-holesky-rpc.publicnode.com" },
  84532: { name: "Base Sepolia", coin: "ETH", explorer: "https://sepolia.basescan.org", rpc: "https://sepolia.base.org" },
  421614: { name: "Arbitrum Sepolia", coin: "ETH", explorer: "https://sepolia.arbiscan.io", rpc: "https://sepolia-rollup.arbitrum.io/rpc" },
  11155420: { name: "OP Sepolia", coin: "ETH", explorer: "https://sepolia-optimism.etherscan.io", rpc: "https://sepolia.optimism.io" },
  80002: { name: "Polygon Amoy", coin: "POL", explorer: "https://amoy.polygonscan.com", rpc: "https://rpc-amoy.polygon.technology" },
};

const LOOKUP_ATTEMPTS = 12;
const LOOKUP_PAUSE_MS = 1500;

/**
 * The network the server is connected to. Refuses anything that is not a test
 * network, so that Settl can never be pointed at real money by mistake.
 */
async function testNetwork() {
  const id = Number((await ethers.provider.getNetwork()).chainId);
  const network = TEST_NETWORKS[id];
  if (!network) {
    throw new Error(`Chain ${id} is not a test network. Settl only runs on test networks, where the money is not real.`);
  }
  return { chainId: id, ...network };
}

/** What a client needs to know about the chain and the vault contract. */
async function contractInfo() {
  const network = await testNetwork();
  return {
    chainId: network.chainId,
    local: isLocal,
    network: network.name,
    coin: network.coin,
    // Wallets reach the local chain through this server. A public network they reach themselves.
    rpcPath: isLocal ? "/rpc" : null,
    publicRpc: isLocal ? null : network.rpc || null,
    explorer: network.explorer || null,
    rupeeWei: RUPEE.toString(),
    abi: hre.artifacts.readArtifactSync("MilestoneVault").abi,
  };
}

/** How far a vault has got: its phase and the state of each stage. Two reads, for lists. */
async function readProgress(address) {
  const vault = await vaultAt(address);
  const [phase, stages] = await Promise.all([vault.phase(), vault.getStages()]);
  return { phase: PHASES[Number(phase)], stages: stages.map((stage) => ({ state: STATES[Number(stage.state)] })) };
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
async function readSettlement(address, fromBlock = 0, contract = "MilestoneVault") {
  const vault = await vaultAt(address, contract);
  // Events are read from the block the vault was created in: public networks refuse a search of the whole chain.
  const eventsNamed = (name) => vault.queryFilter(vault.filters[name](), fromBlock);
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

// The event that names who acted, for each action a person can take, and the field holding their address.
const ACTION_EVENTS = {
  Deposited: ["deposit", "payer"],
  Staked: ["stake", "payee"],
  Completed: ["complete", "payee"],
  Approved: ["approve", "payer"],
  Disputed: ["dispute", "payer"],
  Withdrawn: ["withdraw", "to"],
  Left: ["leave", "payee"],
  Cancelled: ["cancel", "by"],
};

/**
 * Every action a vault has recorded, oldest first: what was done, by which
 * address, on which stage and in which transaction.
 *
 * This is read from the vault's own events, so it does not matter how a
 * transaction reached the vault. A wallet may send it directly or route it
 * through a contract of its own; either way the vault names who acted.
 */
async function readActions(address, fromBlock = 0) {
  const vault = await vaultAt(address);
  const [events, judge] = await Promise.all([vault.queryFilter("*", fromBlock), vault.judge()]);

  const byTransaction = new Map();
  for (const event of events) {
    if (!event.eventName) continue;
    if (!byTransaction.has(event.transactionHash)) byTransaction.set(event.transactionHash, []);
    byTransaction.get(event.transactionHash).push(event);
  }

  const actions = [];
  for (const [tx, emitted] of byTransaction) {
    const named = emitted.find((event) => ACTION_EVENTS[event.eventName]);
    // A release or refund with nobody named is the judge settling a dispute: the contract lets no one else do it.
    const ruling = emitted.find((event) => event.eventName === "Released" || event.eventName === "Refunded");
    const event = named || ruling;
    if (!event) continue;
    const [action, field] = named ? ACTION_EVENTS[event.eventName] : ["resolve"];
    const index = event.args.index;
    actions.push({
      tx,
      action,
      by: named ? event.args[field] : judge,
      ...(index !== undefined ? { stage: Number(index) + 1 } : {}),
    });
  }
  return actions;
}

/** What one address may withdraw from a vault right now, in rupees. */
async function owedTo(address, person, contract = "MilestoneVault") {
  return toRupees(await (await vaultAt(address, contract)).owed(person));
}

module.exports = {
  ethers,
  isLocal,
  RUPEE,
  toWei,
  toRupees,
  PHASES,
  STATES,
  Refusal,
  deployVault,
  deploymentFor,
  vaultAt,
  act,
  simulate,
  prepare,
  lookUp,
  contractInfo,
  testNetwork,
  readProgress,
  readActions,
  readVault,
  readSettlement,
  owedTo,
};
