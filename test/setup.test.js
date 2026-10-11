const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { rupees, AGREEMENT_HASH, deployVault } = require("./helpers");

describe("MilestoneVault setup", function () {
  async function people() {
    const [payer, secondPayer, payee, judge] = await ethers.getSigners();
    const Vault = await ethers.getContractFactory("MilestoneVault");
    return { payer, secondPayer, payee, judge, Vault };
  }

  // Deploys with raw arrays so each check can be broken on its own.
  function deployRaw(Vault, overrides, defaults) {
    const args = { ...defaults, ...overrides };
    return Vault.deploy(args.payers, args.shares, args.judge, args.payees, args.amounts, AGREEMENT_HASH, 0n);
  }

  async function validArgs() {
    const { payer, secondPayer, payee, judge, Vault } = await loadFixture(people);
    const defaults = {
      payers: [payer.address, secondPayer.address],
      shares: [rupees(20000), rupees(10000)],
      judge: judge.address,
      payees: [payee.address, payee.address],
      amounts: [rupees(18000), rupees(12000)],
    };
    return { payer, secondPayer, payee, judge, Vault, defaults };
  }

  it("records the payers, the judge, the stages and the agreement", async function () {
    const { payer, secondPayer, payee, judge } = await loadFixture(people);
    const vault = await deployVault({
      payers: [
        [payer, rupees(20000)],
        [secondPayer, rupees(10000)],
      ],
      judge,
      stages: [
        [payee, rupees(18000)],
        [payee, rupees(12000)],
      ],
    });

    expect(await vault.getPayers()).to.deep.equal([payer.address, secondPayer.address]);
    expect(await vault.shareOf(payer.address)).to.equal(rupees(20000));
    expect(await vault.shareOf(secondPayer.address)).to.equal(rupees(10000));
    expect(await vault.judge()).to.equal(judge.address);
    expect(await vault.agreementHash()).to.equal(AGREEMENT_HASH);
    expect(await vault.totalAmount()).to.equal(rupees(30000));
    expect(await vault.phase()).to.equal(0); // Funding

    const stages = await vault.getStages();
    expect(stages).to.have.lengthOf(2);
    expect(stages[0].payee).to.equal(payee.address);
    expect(stages[0].amount).to.equal(rupees(18000));
    expect(stages[0].state).to.equal(0); // Pending
  });

  it("refuses a deal with no payers", async function () {
    const { Vault, defaults } = await validArgs();
    await expect(deployRaw(Vault, { payers: [], shares: [] }, defaults)).to.be.revertedWithCustomError(
      Vault,
      "NoPayers"
    );
  });

  it("refuses a deal with no stages", async function () {
    const { Vault, defaults } = await validArgs();
    await expect(deployRaw(Vault, { payees: [], amounts: [] }, defaults)).to.be.revertedWithCustomError(
      Vault,
      "NoStages"
    );
  });

  it("refuses lists of different lengths", async function () {
    const { Vault, defaults } = await validArgs();
    await expect(deployRaw(Vault, { shares: [rupees(30000)] }, defaults)).to.be.revertedWithCustomError(
      Vault,
      "LengthMismatch"
    );
    await expect(deployRaw(Vault, { amounts: [rupees(30000)] }, defaults)).to.be.revertedWithCustomError(
      Vault,
      "LengthMismatch"
    );
  });

  it("refuses a zero address in any role", async function () {
    const { payer, payee, Vault, defaults } = await validArgs();
    const zero = ethers.ZeroAddress;

    await expect(deployRaw(Vault, { judge: zero }, defaults)).to.be.revertedWithCustomError(Vault, "ZeroAddress");
    await expect(deployRaw(Vault, { payers: [payer.address, zero] }, defaults)).to.be.revertedWithCustomError(
      Vault,
      "ZeroAddress"
    );
    await expect(deployRaw(Vault, { payees: [payee.address, zero] }, defaults)).to.be.revertedWithCustomError(
      Vault,
      "ZeroAddress"
    );
  });

  it("refuses a zero share or a zero stage amount", async function () {
    const { Vault, defaults } = await validArgs();
    await expect(deployRaw(Vault, { shares: [rupees(30000), 0n] }, defaults)).to.be.revertedWithCustomError(
      Vault,
      "ZeroAmount"
    );
    await expect(deployRaw(Vault, { amounts: [rupees(30000), 0n] }, defaults)).to.be.revertedWithCustomError(
      Vault,
      "ZeroAmount"
    );
  });

  it("refuses the same payer listed twice", async function () {
    const { payer, Vault, defaults } = await validArgs();
    await expect(deployRaw(Vault, { payers: [payer.address, payer.address] }, defaults))
      .to.be.revertedWithCustomError(Vault, "DuplicatePayer")
      .withArgs(payer.address);
  });

  it("refuses a judge who is a payer or a payee", async function () {
    const { payer, payee, Vault, defaults } = await validArgs();
    await expect(deployRaw(Vault, { judge: payer.address }, defaults)).to.be.revertedWithCustomError(
      Vault,
      "JudgeMustBeNeutral"
    );
    await expect(deployRaw(Vault, { judge: payee.address }, defaults)).to.be.revertedWithCustomError(
      Vault,
      "JudgeMustBeNeutral"
    );
  });

  it("refuses a payee who is also a payer", async function () {
    const { payer, payee, Vault, defaults } = await validArgs();
    await expect(deployRaw(Vault, { payees: [payee.address, payer.address] }, defaults))
      .to.be.revertedWithCustomError(Vault, "PayeeCannotBePayer")
      .withArgs(payer.address);
  });

  it("refuses shares that do not add up to the stage amounts", async function () {
    const { Vault, defaults } = await validArgs();
    await expect(deployRaw(Vault, { shares: [rupees(20000), rupees(9999)] }, defaults))
      .to.be.revertedWithCustomError(Vault, "TotalsDiffer")
      .withArgs(rupees(29999), rupees(30000));
  });
});
