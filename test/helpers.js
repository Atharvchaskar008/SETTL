const { expect } = require("chai");
const { ethers } = require("hardhat");

// Pretend money: one rupee is 10^12 wei on the local chain.
const RUPEE = 10n ** 12n;
const rupees = (amount) => BigInt(amount) * RUPEE;

const AGREEMENT_HASH = ethers.id("demo agreement");

const Phase = { Funding: 0, Active: 1, Cancelled: 2, Closed: 3 };
const State = { Pending: 0, Completed: 1, Disputed: 2, Released: 3, Refunded: 4 };

/**
 * Deploys a vault. `payers` is a list of [signer, share] pairs and `stages`
 * a list of [payee signer or contract, amount] pairs. `stake` is what each
 * payee must put in before the deal starts; zero means no stake.
 */
async function deployVault({ payers, judge, stages, stake = 0n, contract = "MilestoneVault", hash = AGREEMENT_HASH }) {
  const Vault = await ethers.getContractFactory(contract);
  const addressOf = (party) => party.target ?? party.address;
  return Vault.deploy(
    payers.map(([payer]) => addressOf(payer)),
    payers.map(([, share]) => share),
    addressOf(judge),
    stages.map(([payee]) => addressOf(payee)),
    stages.map(([, amount]) => amount),
    hash,
    stake
  );
}

/** The money in the vault must match its books, checked both ways. */
async function expectReconciled(vault) {
  const [balance, deposited, withdrawn, locked, owed] = await Promise.all([
    ethers.provider.getBalance(vault.target),
    vault.totalDeposited(),
    vault.totalWithdrawn(),
    vault.totalLocked(),
    vault.totalOwed(),
  ]);
  expect(await vault.reconciles(), "reconciles()").to.equal(true);
  expect(balance, "balance equals deposits minus withdrawals").to.equal(deposited - withdrawn);
  expect(balance, "balance equals locked plus owed").to.equal(locked + owed);
}

/** Sends an action that must be accepted, then checks the books. */
async function accept(vault, action) {
  await action;
  await expectReconciled(vault);
}

/** Sends an action that must be refused with `error`, then checks the books. */
async function refuse(vault, action, error, ...args) {
  const assertion = expect(action).to.be.revertedWithCustomError(vault, error);
  await (args.length ? assertion.withArgs(...args) : assertion);
  await expectReconciled(vault);
}

module.exports = {
  RUPEE,
  rupees,
  AGREEMENT_HASH,
  Phase,
  State,
  deployVault,
  expectReconciled,
  accept,
  refuse,
};
