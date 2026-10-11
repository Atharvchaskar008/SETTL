const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { rupees, Phase, State, deployVault, expectReconciled, accept, refuse } = require("./helpers");

// One payer, one payee, one judge: the case the brief describes.
describe("MilestoneVault lifecycle", function () {
  const AMOUNTS = [rupees(10000), rupees(15000), rupees(5000)];
  const TOTAL = rupees(30000);

  async function unfundedVault() {
    const [payer, payee, judge, stranger] = await ethers.getSigners();
    const vault = await deployVault({
      payers: [[payer, TOTAL]],
      judge,
      stages: AMOUNTS.map((amount) => [payee, amount]),
    });
    return { vault, payer, payee, judge, stranger };
  }

  async function fundedVault() {
    const people = await unfundedVault();
    await people.vault.connect(people.payer).deposit({ value: TOTAL });
    return people;
  }

  const stateOf = async (vault, index) => (await vault.stages(index)).state;

  describe("full payment path", function () {
    it("becomes Active when the payer deposits the exact total", async function () {
      const { vault, payer } = await loadFixture(unfundedVault);
      expect(await vault.phase()).to.equal(Phase.Funding);

      const deposit = vault.connect(payer).deposit({ value: TOTAL });
      await expect(deposit).to.emit(vault, "Deposited").withArgs(payer.address, TOTAL);
      await expect(deposit).to.emit(vault, "Activated").withArgs(TOTAL);
      await accept(vault, deposit);

      expect(await vault.phase()).to.equal(Phase.Active);
      expect(await ethers.provider.getBalance(vault.target)).to.equal(TOTAL);
    });

    it("refuses a deposit that is not the exact share", async function () {
      const { vault, payer } = await loadFixture(unfundedVault);
      await refuse(vault, vault.connect(payer).deposit({ value: TOTAL - 1n }), "WrongDeposit", TOTAL, TOTAL - 1n);
      await refuse(vault, vault.connect(payer).deposit({ value: TOTAL + 1n }), "WrongDeposit", TOTAL, TOTAL + 1n);
    });

    it("pays a stage only after it is marked done and approved", async function () {
      const { vault, payer, payee } = await loadFixture(fundedVault);

      await accept(vault, vault.connect(payee).markComplete(0));
      expect(await stateOf(vault, 0)).to.equal(State.Completed);
      expect(await vault.owed(payee.address)).to.equal(0);

      const approval = vault.connect(payer).approve(0);
      await expect(approval).to.emit(vault, "Released").withArgs(0, payee.address, AMOUNTS[0]);
      await accept(vault, approval);
      expect(await stateOf(vault, 0)).to.equal(State.Released);
      expect(await vault.owed(payee.address)).to.equal(AMOUNTS[0]);

      // Approval only credits the payee. The money moves when the payee withdraws.
      expect(await ethers.provider.getBalance(vault.target)).to.equal(TOTAL);
      const withdrawal = vault.connect(payee).withdraw();
      await expect(withdrawal).to.changeEtherBalances([vault, payee], [-AMOUNTS[0], AMOUNTS[0]]);
      await accept(vault, withdrawal);
      expect(await vault.owed(payee.address)).to.equal(0);
    });

    it("closes with an empty vault once every stage is paid and withdrawn", async function () {
      const { vault, payer, payee } = await loadFixture(fundedVault);

      for (let index = 0; index < AMOUNTS.length; index++) {
        await accept(vault, vault.connect(payee).markComplete(index));
        await accept(vault, vault.connect(payer).approve(index));
      }
      expect(await vault.phase()).to.equal(Phase.Closed);
      expect(await vault.owed(payee.address)).to.equal(TOTAL);

      await expect(vault.connect(payee).withdraw()).to.changeEtherBalance(payee, TOTAL);
      await expectReconciled(vault);
      expect(await ethers.provider.getBalance(vault.target)).to.equal(0);
      expect(await vault.totalWithdrawn()).to.equal(TOTAL);
    });
  });

  describe("dispute settled for the payee", function () {
    it("passes a disputed stage to the judge, who releases it", async function () {
      const { vault, payer, payee, judge } = await loadFixture(fundedVault);
      await accept(vault, vault.connect(payee).markComplete(0));

      const disputed = vault.connect(payer).dispute(0);
      await expect(disputed).to.emit(vault, "Disputed").withArgs(0, payer.address);
      await accept(vault, disputed);
      expect(await stateOf(vault, 0)).to.equal(State.Disputed);
      expect(await vault.owed(payee.address)).to.equal(0);

      const ruling = vault.connect(judge).resolve(0, true);
      await expect(ruling).to.emit(vault, "Released").withArgs(0, payee.address, AMOUNTS[0]);
      await accept(vault, ruling);
      expect(await stateOf(vault, 0)).to.equal(State.Released);

      await expect(vault.connect(payee).withdraw()).to.changeEtherBalances(
        [vault, payee, judge],
        [-AMOUNTS[0], AMOUNTS[0], 0]
      );
      await expectReconciled(vault);
    });

    it("leaves the other stages untouched by the dispute", async function () {
      const { vault, payer, payee, judge } = await loadFixture(fundedVault);
      await accept(vault, vault.connect(payee).markComplete(0));
      await accept(vault, vault.connect(payer).dispute(0));
      await accept(vault, vault.connect(judge).resolve(0, true));

      expect(await stateOf(vault, 1)).to.equal(State.Pending);
      expect(await stateOf(vault, 2)).to.equal(State.Pending);
      expect(await vault.totalLocked()).to.equal(AMOUNTS[1] + AMOUNTS[2]);
      expect(await vault.phase()).to.equal(Phase.Active);
    });
  });

  describe("dispute settled for the payer", function () {
    it("returns the stage amount to the payer when the judge refunds", async function () {
      const { vault, payer, payee, judge } = await loadFixture(fundedVault);
      await accept(vault, vault.connect(payee).markComplete(1));
      await accept(vault, vault.connect(payer).dispute(1));

      const ruling = vault.connect(judge).resolve(1, false);
      await expect(ruling).to.emit(vault, "Refunded").withArgs(1, AMOUNTS[1]);
      await expect(ruling).to.emit(vault, "RefundShare").withArgs(1, payer.address, AMOUNTS[1]);
      await accept(vault, ruling);

      expect(await stateOf(vault, 1)).to.equal(State.Refunded);
      expect(await vault.owed(payer.address)).to.equal(AMOUNTS[1]);
      expect(await vault.owed(payee.address)).to.equal(0);

      await expect(vault.connect(payer).withdraw()).to.changeEtherBalances(
        [vault, payer, payee, judge],
        [-AMOUNTS[1], AMOUNTS[1], 0, 0]
      );
      await expectReconciled(vault);
    });

    it("closes after a mix of paid and refunded stages, with every rupee accounted for", async function () {
      const { vault, payer, payee, judge } = await loadFixture(fundedVault);

      // Stage 0 is approved, stage 1 is refunded, stage 2 is released by the judge.
      await accept(vault, vault.connect(payee).markComplete(0));
      await accept(vault, vault.connect(payer).approve(0));
      await accept(vault, vault.connect(payee).markComplete(1));
      await accept(vault, vault.connect(payer).dispute(1));
      await accept(vault, vault.connect(judge).resolve(1, false));
      await accept(vault, vault.connect(payee).markComplete(2));
      await accept(vault, vault.connect(payer).dispute(2));
      await accept(vault, vault.connect(judge).resolve(2, true));

      expect(await vault.phase()).to.equal(Phase.Closed);
      expect(await vault.owed(payee.address)).to.equal(AMOUNTS[0] + AMOUNTS[2]);
      expect(await vault.owed(payer.address)).to.equal(AMOUNTS[1]);

      await accept(vault, vault.connect(payee).withdraw());
      await accept(vault, vault.connect(payer).withdraw());
      expect(await ethers.provider.getBalance(vault.target)).to.equal(0);
      expect(await vault.totalWithdrawn()).to.equal(TOTAL);
    });
  });
});
