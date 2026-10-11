const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { rupees, Phase, State, deployVault, expectReconciled, accept, refuse } = require("./helpers");

// Every test here tries to cheat the vault and expects to be refused.
describe("MilestoneVault under attack", function () {
  const AMOUNT = rupees(10000);
  const TOTAL = rupees(30000);

  async function unfundedVault() {
    const [payer, payee, judge, stranger] = await ethers.getSigners();
    const vault = await deployVault({
      payers: [[payer, TOTAL]],
      judge,
      stages: [
        [payee, AMOUNT],
        [payee, AMOUNT],
        [payee, AMOUNT],
      ],
    });
    return { vault, payer, payee, judge, stranger };
  }

  async function fundedVault() {
    const people = await unfundedVault();
    await people.vault.connect(people.payer).deposit({ value: TOTAL });
    return people;
  }

  describe("second release attempt", function () {
    it("refuses a second approval of a stage that is already paid", async function () {
      const { vault, payer, payee } = await loadFixture(fundedVault);
      await accept(vault, vault.connect(payee).markComplete(0));
      await accept(vault, vault.connect(payer).approve(0));

      await refuse(vault, vault.connect(payer).approve(0), "WrongState", State.Released);
      expect(await vault.owed(payee.address)).to.equal(AMOUNT);
    });

    it("refuses the judge releasing a stage the payer already approved", async function () {
      const { vault, payer, payee, judge } = await loadFixture(fundedVault);
      await accept(vault, vault.connect(payee).markComplete(0));
      await accept(vault, vault.connect(payer).approve(0));

      await refuse(vault, vault.connect(judge).resolve(0, true), "WrongState", State.Released);
      await refuse(vault, vault.connect(judge).resolve(0, false), "WrongState", State.Released);
      expect(await vault.owed(payee.address)).to.equal(AMOUNT);
    });

    it("refuses a second ruling on a stage the judge already settled", async function () {
      const { vault, payer, payee, judge } = await loadFixture(fundedVault);
      await accept(vault, vault.connect(payee).markComplete(0));
      await accept(vault, vault.connect(payer).dispute(0));
      await accept(vault, vault.connect(judge).resolve(0, true));

      await refuse(vault, vault.connect(judge).resolve(0, true), "WrongState", State.Released);
      await refuse(vault, vault.connect(payer).approve(0), "WrongState", State.Released);
      expect(await vault.owed(payee.address)).to.equal(AMOUNT);
    });

    it("refuses paying out a stage that was refunded", async function () {
      const { vault, payer, payee, judge } = await loadFixture(fundedVault);
      await accept(vault, vault.connect(payee).markComplete(0));
      await accept(vault, vault.connect(payer).dispute(0));
      await accept(vault, vault.connect(judge).resolve(0, false));

      await refuse(vault, vault.connect(judge).resolve(0, true), "WrongState", State.Refunded);
      await refuse(vault, vault.connect(payee).markComplete(0), "WrongState", State.Refunded);
      expect(await vault.owed(payee.address)).to.equal(0);
      expect(await vault.owed(payer.address)).to.equal(AMOUNT);
    });

    it("refuses a second withdrawal of the same payment", async function () {
      const { vault, payer, payee } = await loadFixture(fundedVault);
      await accept(vault, vault.connect(payee).markComplete(0));
      await accept(vault, vault.connect(payer).approve(0));

      await expect(vault.connect(payee).withdraw()).to.changeEtherBalance(payee, AMOUNT);
      await refuse(vault, vault.connect(payee).withdraw(), "NothingOwed");
      expect(await ethers.provider.getBalance(vault.target)).to.equal(TOTAL - AMOUNT);
    });
  });

  describe("unauthorised refund attempt", function () {
    async function disputedStage() {
      const people = await fundedVault();
      await people.vault.connect(people.payee).markComplete(0);
      await people.vault.connect(people.payer).dispute(0);
      return people;
    }

    it("refuses the payer refunding their own dispute", async function () {
      const { vault, payer } = await loadFixture(disputedStage);
      await refuse(vault, vault.connect(payer).resolve(0, false), "NotJudge");
      expect(await vault.owed(payer.address)).to.equal(0);
    });

    it("refuses the payee awarding the disputed stage to themselves", async function () {
      const { vault, payee } = await loadFixture(disputedStage);
      await refuse(vault, vault.connect(payee).resolve(0, true), "NotJudge");
      expect(await vault.owed(payee.address)).to.equal(0);
    });

    it("refuses a stranger settling the dispute either way", async function () {
      const { vault, stranger } = await loadFixture(disputedStage);
      await refuse(vault, vault.connect(stranger).resolve(0, true), "NotJudge");
      await refuse(vault, vault.connect(stranger).resolve(0, false), "NotJudge");
      expect((await vault.stages(0)).state).to.equal(State.Disputed);
    });

    it("gives the judge nothing, whichever way the judge rules", async function () {
      const { vault, judge } = await loadFixture(disputedStage);
      await accept(vault, vault.connect(judge).resolve(0, false));
      expect(await vault.owed(judge.address)).to.equal(0);
      await refuse(vault, vault.connect(judge).withdraw(), "NothingOwed");
    });

    it("refuses every action from someone outside the deal", async function () {
      const { vault, stranger } = await loadFixture(unfundedVault);
      await refuse(vault, vault.connect(stranger).deposit({ value: TOTAL }), "NotPayer");
      await refuse(vault, vault.connect(stranger).cancel(), "NotPayer");
      await refuse(vault, vault.connect(stranger).markComplete(0), "NotPayee");
      await refuse(vault, vault.connect(stranger).approve(0), "NotPayer");
      await refuse(vault, vault.connect(stranger).dispute(0), "NotPayer");
      await refuse(vault, vault.connect(stranger).withdraw(), "NothingOwed");
    });

    it("keeps each role to its own actions", async function () {
      const { vault, payer, payee, judge } = await loadFixture(fundedVault);
      await refuse(vault, vault.connect(payer).markComplete(0), "NotPayee");
      await refuse(vault, vault.connect(judge).markComplete(0), "NotPayee");

      await accept(vault, vault.connect(payee).markComplete(0));
      await refuse(vault, vault.connect(payee).approve(0), "NotPayer");
      await refuse(vault, vault.connect(judge).approve(0), "NotPayer");
      await refuse(vault, vault.connect(payee).dispute(0), "NotPayer");
      await refuse(vault, vault.connect(judge).dispute(0), "NotPayer");
    });

    it("refuses money sent to the vault outside a deposit", async function () {
      const { vault, stranger } = await loadFixture(fundedVault);
      await expect(stranger.sendTransaction({ to: vault.target, value: AMOUNT })).to.be.reverted;
      await expectReconciled(vault);
    });
  });

  describe("out of order steps", function () {
    it("refuses approving or disputing a stage that was never marked done", async function () {
      const { vault, payer } = await loadFixture(fundedVault);
      await refuse(vault, vault.connect(payer).approve(0), "WrongState", State.Pending);
      await refuse(vault, vault.connect(payer).dispute(0), "WrongState", State.Pending);
    });

    it("refuses a ruling on a stage that is not disputed", async function () {
      const { vault, payee, judge } = await loadFixture(fundedVault);
      await refuse(vault, vault.connect(judge).resolve(0, true), "WrongState", State.Pending);

      await accept(vault, vault.connect(payee).markComplete(0));
      await refuse(vault, vault.connect(judge).resolve(0, true), "WrongState", State.Completed);
      await refuse(vault, vault.connect(judge).resolve(0, false), "WrongState", State.Completed);
    });

    it("refuses marking a stage done twice", async function () {
      const { vault, payee } = await loadFixture(fundedVault);
      await accept(vault, vault.connect(payee).markComplete(0));
      await refuse(vault, vault.connect(payee).markComplete(0), "WrongState", State.Completed);
    });

    it("refuses approving a stage once it is disputed", async function () {
      const { vault, payer, payee } = await loadFixture(fundedVault);
      await accept(vault, vault.connect(payee).markComplete(0));
      await accept(vault, vault.connect(payer).dispute(0));
      await refuse(vault, vault.connect(payer).approve(0), "WrongState", State.Disputed);
      await refuse(vault, vault.connect(payer).dispute(0), "WrongState", State.Disputed);
    });

    it("refuses any work step before the vault is funded", async function () {
      const { vault, payer, payee, judge } = await loadFixture(unfundedVault);
      await refuse(vault, vault.connect(payee).markComplete(0), "WrongPhase", Phase.Funding);
      await refuse(vault, vault.connect(payer).approve(0), "WrongPhase", Phase.Funding);
      await refuse(vault, vault.connect(payer).dispute(0), "WrongPhase", Phase.Funding);
      await refuse(vault, vault.connect(judge).resolve(0, true), "WrongPhase", Phase.Funding);
    });

    it("refuses a second deposit and a late cancel once the vault is Active", async function () {
      const { vault, payer } = await loadFixture(fundedVault);
      await refuse(vault, vault.connect(payer).deposit({ value: TOTAL }), "WrongPhase", Phase.Active);
      await refuse(vault, vault.connect(payer).cancel(), "WrongPhase", Phase.Active);
    });

    it("refuses everything after the deal is cancelled", async function () {
      const { vault, payer, payee, judge } = await loadFixture(unfundedVault);
      await accept(vault, vault.connect(payer).cancel());
      expect(await vault.phase()).to.equal(Phase.Cancelled);

      await refuse(vault, vault.connect(payer).deposit({ value: TOTAL }), "WrongPhase", Phase.Cancelled);
      await refuse(vault, vault.connect(payer).cancel(), "WrongPhase", Phase.Cancelled);
      await refuse(vault, vault.connect(payee).markComplete(0), "WrongPhase", Phase.Cancelled);
      await refuse(vault, vault.connect(payer).approve(0), "WrongPhase", Phase.Cancelled);
      await refuse(vault, vault.connect(judge).resolve(0, true), "WrongPhase", Phase.Cancelled);
    });

    it("refuses every step after the deal is closed", async function () {
      const { vault, payer, payee, judge } = await loadFixture(fundedVault);
      for (let index = 0; index < 3; index++) {
        await accept(vault, vault.connect(payee).markComplete(index));
        await accept(vault, vault.connect(payer).approve(index));
      }
      expect(await vault.phase()).to.equal(Phase.Closed);

      await refuse(vault, vault.connect(payee).markComplete(0), "WrongPhase", Phase.Closed);
      await refuse(vault, vault.connect(payer).approve(0), "WrongPhase", Phase.Closed);
      await refuse(vault, vault.connect(payer).dispute(0), "WrongPhase", Phase.Closed);
      await refuse(vault, vault.connect(judge).resolve(0, false), "WrongPhase", Phase.Closed);
    });

    it("refuses a stage number that does not exist", async function () {
      const { vault, payer, payee, judge } = await loadFixture(fundedVault);
      await refuse(vault, vault.connect(payee).markComplete(3), "NoSuchStage", 3);
      await refuse(vault, vault.connect(payer).approve(3), "NoSuchStage", 3);
      await refuse(vault, vault.connect(payer).dispute(99), "NoSuchStage", 99);
      await refuse(vault, vault.connect(judge).resolve(3, true), "NoSuchStage", 3);
    });
  });
});
