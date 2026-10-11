const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { rupees, deployVault, expectReconciled, refuse } = require("./helpers");

// The same attacker is run against the real vault and against WeakVault, which
// is the real vault with the two withdraw protections removed.
describe("Re-entrancy attack", function () {
  const AMOUNT = rupees(10000);
  const TOTAL = rupees(30000);

  // The attacker is the payee of stage 0 and earns it honestly, so it is owed
  // exactly one stage. The other two stages belong to an honest payee.
  async function scene(contract) {
    const [payer, payee, judge, thief] = await ethers.getSigners();
    const attacker = await (await ethers.getContractFactory("ReentrantAttacker", thief)).deploy();
    const vault = await deployVault({
      contract,
      payers: [[payer, TOTAL]],
      judge,
      stages: [
        [attacker, AMOUNT],
        [payee, AMOUNT],
        [payee, AMOUNT],
      ],
    });
    await vault.connect(payer).deposit({ value: TOTAL });
    await attacker.aim(vault.target);
    await attacker.markComplete(0);
    await vault.connect(payer).approve(0);
    return { vault, attacker, payer, payee, judge, thief };
  }

  async function realVault() {
    return scene("MilestoneVault");
  }

  async function weakVault() {
    return scene("WeakVault");
  }

  const balanceOf = (target) => ethers.provider.getBalance(target.target ?? target.address);

  describe("against the real vault", function () {
    it("pays the attacker exactly what it was owed and nothing more", async function () {
      const { vault, attacker } = await loadFixture(realVault);
      expect(await vault.owed(attacker.target)).to.equal(AMOUNT);

      await attacker.attack();

      expect(await balanceOf(attacker)).to.equal(AMOUNT);
      expect(await balanceOf(vault)).to.equal(TOTAL - AMOUNT);
      expect(await vault.owed(attacker.target)).to.equal(0);
      await expectReconciled(vault);
    });

    it("refuses the inner call the attacker makes while being paid", async function () {
      const { vault, attacker } = await loadFixture(realVault);
      await attacker.attack();

      expect(await attacker.attempts()).to.equal(1);
      expect(await attacker.refusals()).to.equal(1);
      await refuse(vault, attacker.attack(), "NothingOwed");
    });

    it("still pays the honest payee afterwards", async function () {
      const { vault, attacker, payer, payee } = await loadFixture(realVault);
      await attacker.attack();

      await vault.connect(payee).markComplete(1);
      await vault.connect(payer).approve(1);
      await expect(vault.connect(payee).withdraw()).to.changeEtherBalance(payee, AMOUNT);
      await expectReconciled(vault);
    });
  });

  describe("against WeakVault", function () {
    it("lets the attacker take every stage, not just its own", async function () {
      const { vault, attacker } = await loadFixture(weakVault);
      expect(await vault.owed(attacker.target)).to.equal(AMOUNT);

      await attacker.attack();

      expect(await balanceOf(attacker)).to.equal(TOTAL);
      expect(await balanceOf(vault)).to.equal(0);
      expect(await attacker.attempts()).to.equal(2);
      expect(await attacker.refusals()).to.equal(0);
      expect(await vault.reconciles()).to.equal(false);
    });

    it("leaves nothing for the honest payee", async function () {
      const { vault, attacker, payer, payee } = await loadFixture(weakVault);
      await attacker.attack();

      await vault.connect(payee).markComplete(1);
      await vault.connect(payer).approve(1);
      expect(await vault.owed(payee.address)).to.equal(AMOUNT);
      await expect(vault.connect(payee).withdraw()).to.be.revertedWithCustomError(vault, "TransferFailed");
    });
  });
});
