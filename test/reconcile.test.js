const { expect } = require("chai");
const { ethers } = require("hardhat");
const { rupees, Phase, deployVault, expectReconciled } = require("./helpers");

// Throws hundreds of random actions at a vault, from the right people and the
// wrong ones, and checks the books after every single step. The sequence is
// seeded, so a failure can be replayed exactly.
describe("Balance after every step", function () {
  const STEPS = 150;
  const SEEDS = [1, 7, 42, 2026];

  // Small deterministic random number generator (mulberry32).
  function random(seed) {
    let state = seed;
    return function next() {
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), state | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  async function scene() {
    const [asha, bilal, chitra, mason, plumber, judge, stranger] = await ethers.getSigners();
    const payers = [asha, bilal, chitra];
    const shares = [rupees(5000), rupees(3000), rupees(2000)];
    const stages = [
      [mason, rupees(2500)],
      [mason, rupees(1500)],
      [plumber, rupees(1999)],
      [plumber, rupees(2001)],
      [mason, rupees(1000)],
      [plumber, rupees(1000)],
    ];
    const vault = await deployVault({ payers: payers.map((payer, i) => [payer, shares[i]]), judge, stages });
    const everyone = [...payers, mason, plumber, judge, stranger];
    return { vault, payers, shares, stages, judge, everyone };
  }

  /** Runs `steps` random actions and checks the books after each one. */
  async function runRandomly({ vault, payers, shares, stages, judge, everyone }, next, steps, { allowCancel }) {
    const pick = (list) => list[Math.floor(next() * list.length)];
    const anyStage = () => Math.floor(next() * stages.length);
    // Most of the time the right person acts; the rest of the time anyone does.
    const actor = (rightful) => (next() < 0.7 ? rightful : pick(everyone));

    const deposit = () => {
      const i = Math.floor(next() * payers.length);
      const value = next() < 0.85 ? shares[i] : shares[i] - 1n;
      return vault.connect(actor(payers[i])).deposit({ value });
    };
    const stageActions = [
      () => {
        const i = anyStage();
        return vault.connect(actor(stages[i][0])).markComplete(i);
      },
      () => vault.connect(actor(pick(payers))).approve(anyStage()),
      () => vault.connect(actor(pick(payers))).dispute(anyStage()),
      () => vault.connect(actor(judge)).resolve(anyStage(), next() < 0.5),
      () => vault.connect(pick(everyone)).withdraw(),
    ];

    let accepted = 0;
    let refused = 0;
    for (let step = 0; step < steps; step++) {
      const funding = Number(await vault.phase()) === Phase.Funding;
      let action = pick(stageActions);
      if (funding && next() < 0.6) action = deposit;
      if (funding && allowCancel && next() < 0.15) action = () => vault.connect(actor(pick(payers))).cancel();

      try {
        await action();
        accepted += 1;
      } catch (error) {
        refused += 1;
      }
      await expectReconciled(vault);
    }
    return { accepted, refused };
  }

  async function expectNothingCreatedOrLost(vault) {
    const balance = await ethers.provider.getBalance(vault.target);
    expect(balance + (await vault.totalWithdrawn())).to.equal(await vault.totalDeposited());
  }

  for (const seed of SEEDS) {
    it(`holds through ${STEPS} random actions on a running deal (seed ${seed})`, async function () {
      this.timeout(120000);
      const people = await scene();
      const { accepted, refused } = await runRandomly(people, random(seed), STEPS, { allowCancel: false });

      // The run must exercise both outcomes, or it proves nothing.
      expect(accepted, "accepted actions").to.be.greaterThan(15);
      expect(refused, "refused actions").to.be.greaterThan(15);
      expect(Number(await people.vault.phase())).to.be.oneOf([Phase.Active, Phase.Closed]);
      await expectNothingCreatedOrLost(people.vault);
    });
  }

  for (const seed of SEEDS) {
    it(`holds when the deal may be cancelled during funding (seed ${seed})`, async function () {
      this.timeout(120000);
      const people = await scene();
      await runRandomly(people, random(seed + 1000), 60, { allowCancel: true });
      await expectNothingCreatedOrLost(people.vault);

      // If it was cancelled, every payer can take their deposit back and the vault empties.
      if (Number(await people.vault.phase()) === Phase.Cancelled) {
        for (const payer of people.payers) {
          if ((await people.vault.owed(payer.address)) > 0n) {
            await people.vault.connect(payer).withdraw();
            await expectReconciled(people.vault);
          }
        }
        expect(await ethers.provider.getBalance(people.vault.target)).to.equal(0);
      }
    });
  }
});
