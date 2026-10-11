const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { rupees, Phase, State, deployVault, expectReconciled, accept, refuse } = require("./helpers");

// Several payers share one deal: flatmates splitting a bill, for example.
describe("MilestoneVault with several payers", function () {
  const SHARES = [rupees(5000), rupees(3000), rupees(2000)];
  const TOTAL = rupees(10000);

  async function threePayers() {
    const [asha, bilal, chitra, payee, judge, stranger] = await ethers.getSigners();
    const payers = [asha, bilal, chitra];
    const vault = await deployVault({
      payers: payers.map((payer, i) => [payer, SHARES[i]]),
      judge,
      stages: [
        [payee, rupees(6000)],
        [payee, rupees(4000)],
      ],
    });
    return { vault, asha, bilal, chitra, payers, payee, judge, stranger };
  }

  async function threePayersFunded() {
    const people = await threePayers();
    for (const [i, payer] of people.payers.entries()) {
      await people.vault.connect(payer).deposit({ value: SHARES[i] });
    }
    return people;
  }

  const stateOf = async (vault, index) => (await vault.stages(index)).state;

  describe("funding", function () {
    it("stays in Funding until every payer has paid", async function () {
      const { vault, asha, bilal, chitra, payee } = await loadFixture(threePayers);

      await accept(vault, vault.connect(asha).deposit({ value: SHARES[0] }));
      await accept(vault, vault.connect(bilal).deposit({ value: SHARES[1] }));
      expect(await vault.phase()).to.equal(Phase.Funding);
      await refuse(vault, vault.connect(payee).markComplete(0), "WrongPhase", Phase.Funding);

      const last = vault.connect(chitra).deposit({ value: SHARES[2] });
      await expect(last).to.emit(vault, "Activated").withArgs(TOTAL);
      await accept(vault, last);
      expect(await vault.phase()).to.equal(Phase.Active);
    });

    it("takes each payer's own share, once", async function () {
      const { vault, asha, bilal } = await loadFixture(threePayers);

      await refuse(vault, vault.connect(bilal).deposit({ value: SHARES[0] }), "WrongDeposit", SHARES[1], SHARES[0]);
      await accept(vault, vault.connect(asha).deposit({ value: SHARES[0] }));
      await refuse(vault, vault.connect(asha).deposit({ value: SHARES[0] }), "AlreadyDeposited");
    });

    it("returns deposits when a payer cancels before the deal starts", async function () {
      const { vault, asha, bilal, chitra } = await loadFixture(threePayers);
      await accept(vault, vault.connect(asha).deposit({ value: SHARES[0] }));
      await accept(vault, vault.connect(bilal).deposit({ value: SHARES[1] }));

      // Chitra never paid. She may still call the deal off, and gets nothing back.
      await accept(vault, vault.connect(chitra).cancel());
      expect(await vault.phase()).to.equal(Phase.Cancelled);
      expect(await vault.owed(asha.address)).to.equal(SHARES[0]);
      expect(await vault.owed(bilal.address)).to.equal(SHARES[1]);
      expect(await vault.owed(chitra.address)).to.equal(0);

      await expect(vault.connect(asha).withdraw()).to.changeEtherBalance(asha, SHARES[0]);
      await expect(vault.connect(bilal).withdraw()).to.changeEtherBalance(bilal, SHARES[1]);
      await refuse(vault, vault.connect(chitra).withdraw(), "NothingOwed");
      expect(await ethers.provider.getBalance(vault.target)).to.equal(0);
    });
  });

  describe("approval", function () {
    it("does not release on one approval out of three", async function () {
      const { vault, asha, payee } = await loadFixture(threePayersFunded);
      await accept(vault, vault.connect(payee).markComplete(0));
      await accept(vault, vault.connect(asha).approve(0));

      expect(await stateOf(vault, 0)).to.equal(State.Completed);
      expect((await vault.stages(0)).approvals).to.equal(1);
      expect(await vault.owed(payee.address)).to.equal(0);
    });

    it("releases on the second approval out of three", async function () {
      const { vault, asha, chitra, payee } = await loadFixture(threePayersFunded);
      await accept(vault, vault.connect(payee).markComplete(0));
      await accept(vault, vault.connect(asha).approve(0));
      await accept(vault, vault.connect(chitra).approve(0));

      expect(await stateOf(vault, 0)).to.equal(State.Released);
      expect(await vault.owed(payee.address)).to.equal(rupees(6000));
    });

    it("refuses the same payer approving twice to fake a majority", async function () {
      const { vault, asha, payee } = await loadFixture(threePayersFunded);
      await accept(vault, vault.connect(payee).markComplete(0));
      await accept(vault, vault.connect(asha).approve(0));

      await refuse(vault, vault.connect(asha).approve(0), "AlreadyApproved");
      expect(await stateOf(vault, 0)).to.equal(State.Completed);
    });

    it("needs both payers when there are two", async function () {
      const [first, second, payee, judge] = await ethers.getSigners();
      const vault = await deployVault({
        payers: [
          [first, rupees(500)],
          [second, rupees(500)],
        ],
        judge,
        stages: [[payee, rupees(1000)]],
      });
      await vault.connect(first).deposit({ value: rupees(500) });
      await vault.connect(second).deposit({ value: rupees(500) });
      await accept(vault, vault.connect(payee).markComplete(0));

      await accept(vault, vault.connect(first).approve(0));
      expect(await stateOf(vault, 0)).to.equal(State.Completed);
      await accept(vault, vault.connect(second).approve(0));
      expect(await stateOf(vault, 0)).to.equal(State.Released);
    });
  });

  describe("dispute and refund", function () {
    it("lets one payer dispute even after another has approved", async function () {
      const { vault, asha, bilal, chitra, payee } = await loadFixture(threePayersFunded);
      await accept(vault, vault.connect(payee).markComplete(0));
      await accept(vault, vault.connect(asha).approve(0));
      await accept(vault, vault.connect(bilal).dispute(0));

      expect(await stateOf(vault, 0)).to.equal(State.Disputed);
      await refuse(vault, vault.connect(chitra).approve(0), "WrongState", State.Disputed);
    });

    it("splits a refund between the payers by share", async function () {
      const { vault, asha, bilal, chitra, payee, judge } = await loadFixture(threePayersFunded);
      await accept(vault, vault.connect(payee).markComplete(0));
      await accept(vault, vault.connect(bilal).dispute(0));
      await accept(vault, vault.connect(judge).resolve(0, false));

      // Stage 0 is 6,000 of a 10,000 deal: 50%, 30% and 20% of it.
      expect(await vault.owed(asha.address)).to.equal(rupees(3000));
      expect(await vault.owed(bilal.address)).to.equal(rupees(1800));
      expect(await vault.owed(chitra.address)).to.equal(rupees(1200));
      expect(await vault.owed(payee.address)).to.equal(0);
    });

    it("gives the rounding remainder to the last payer so nothing is lost", async function () {
      const [first, second, third, payee, judge] = await ethers.getSigners();
      // Amounts in single wei, chosen so the split cannot be exact.
      const vault = await deployVault({
        payers: [
          [first, 3n],
          [second, 3n],
          [third, 4n],
        ],
        judge,
        stages: [
          [payee, 7n],
          [payee, 3n],
        ],
      });
      await vault.connect(first).deposit({ value: 3n });
      await vault.connect(second).deposit({ value: 3n });
      await vault.connect(third).deposit({ value: 4n });

      await accept(vault, vault.connect(payee).markComplete(0));
      await accept(vault, vault.connect(first).dispute(0));
      await accept(vault, vault.connect(judge).resolve(0, false));

      // 7 * 3 / 10 rounds down to 2 for the first two; the last payer takes the other 3.
      expect(await vault.owed(first.address)).to.equal(2n);
      expect(await vault.owed(second.address)).to.equal(2n);
      expect(await vault.owed(third.address)).to.equal(3n);
      expect(await vault.totalOwed()).to.equal(7n);
      await expectReconciled(vault);
    });
  });
});
