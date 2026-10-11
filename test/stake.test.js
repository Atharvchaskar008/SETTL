const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { rupees, Phase, State, deployVault, expectReconciled, accept, refuse } = require("./helpers");

// An optional stake: each payee puts money in before the deal starts, gets it
// back when the deal closes, and loses it to the payers by walking away.
describe("MilestoneVault with a payee stake", function () {
  const STAKE = rupees(2000);
  const SHARES = [rupees(6000), rupees(4000)];
  const TOTAL = rupees(10000);

  // Two payers (60% and 40%). The mason has two stages, the plumber one.
  async function unfunded() {
    const [asha, bilal, mason, plumber, judge, stranger] = await ethers.getSigners();
    const vault = await deployVault({
      payers: [
        [asha, SHARES[0]],
        [bilal, SHARES[1]],
      ],
      judge,
      stake: STAKE,
      stages: [
        [mason, rupees(3000)],
        [mason, rupees(3000)],
        [plumber, rupees(4000)],
      ],
    });
    return { vault, asha, bilal, mason, plumber, judge, stranger };
  }

  async function active() {
    const people = await unfunded();
    const { vault, asha, bilal, mason, plumber } = people;
    await vault.connect(asha).deposit({ value: SHARES[0] });
    await vault.connect(bilal).deposit({ value: SHARES[1] });
    await vault.connect(mason).stake({ value: STAKE });
    await vault.connect(plumber).stake({ value: STAKE });
    return people;
  }

  const stateOf = async (vault, index) => (await vault.stages(index)).state;
  const balanceOf = (vault) => ethers.provider.getBalance(vault.target);

  /** Marks a stage done and has both payers approve it. */
  async function pay(vault, payee, index, payers) {
    await accept(vault, vault.connect(payee).markComplete(index));
    for (const payer of payers) await accept(vault, vault.connect(payer).approve(index));
  }

  describe("when no stake is set", function () {
    async function noStake() {
      const [payer, payee, judge] = await ethers.getSigners();
      const vault = await deployVault({ payers: [[payer, TOTAL]], judge, stages: [[payee, TOTAL]] });
      return { vault, payer, payee };
    }

    it("refuses a stake nobody asked for", async function () {
      const { vault, payee } = await loadFixture(noStake);
      await refuse(vault, vault.connect(payee).stake({ value: STAKE }), "StakeNotRequired");
    });

    it("starts on the payers' deposits alone, and has no leave action", async function () {
      const { vault, payer, payee } = await loadFixture(noStake);
      await accept(vault, vault.connect(payer).deposit({ value: TOTAL }));
      expect(await vault.phase()).to.equal(Phase.Active);
      await refuse(vault, vault.connect(payee).leave(), "StakeNotRequired");
    });
  });

  describe("funding", function () {
    it("does not start until every payer has paid and every payee has staked", async function () {
      const { vault, asha, bilal, mason, plumber } = await loadFixture(unfunded);

      await accept(vault, vault.connect(asha).deposit({ value: SHARES[0] }));
      await accept(vault, vault.connect(bilal).deposit({ value: SHARES[1] }));
      expect(await vault.phase()).to.equal(Phase.Funding);
      await refuse(vault, vault.connect(mason).markComplete(0), "WrongPhase", Phase.Funding);

      await accept(vault, vault.connect(mason).stake({ value: STAKE }));
      expect(await vault.phase()).to.equal(Phase.Funding);

      const last = vault.connect(plumber).stake({ value: STAKE });
      await expect(last).to.emit(vault, "Staked").withArgs(plumber.address, STAKE);
      await expect(last).to.emit(vault, "Activated").withArgs(TOTAL + 2n * STAKE);
      await accept(vault, last);
      expect(await vault.phase()).to.equal(Phase.Active);
      expect(await balanceOf(vault)).to.equal(TOTAL + 2n * STAKE);
    });

    it("starts just the same when the payees stake first", async function () {
      const { vault, asha, bilal, mason, plumber } = await loadFixture(unfunded);
      await accept(vault, vault.connect(mason).stake({ value: STAKE }));
      await accept(vault, vault.connect(plumber).stake({ value: STAKE }));
      await accept(vault, vault.connect(asha).deposit({ value: SHARES[0] }));
      expect(await vault.phase()).to.equal(Phase.Funding);
      await accept(vault, vault.connect(bilal).deposit({ value: SHARES[1] }));
      expect(await vault.phase()).to.equal(Phase.Active);
    });

    it("asks each payee for one stake, however many stages they have", async function () {
      const { vault, mason, plumber } = await loadFixture(unfunded);
      expect(await vault.getPayees()).to.deep.equal([mason.address, plumber.address]);
      await accept(vault, vault.connect(mason).stake({ value: STAKE }));
      await refuse(vault, vault.connect(mason).stake({ value: STAKE }), "AlreadyStaked");
    });

    it("takes the exact stake, from payees only, before the start only", async function () {
      const { vault, asha, mason, judge, stranger } = await loadFixture(unfunded);
      await refuse(vault, vault.connect(asha).stake({ value: STAKE }), "NotPayee");
      await refuse(vault, vault.connect(judge).stake({ value: STAKE }), "NotPayee");
      await refuse(vault, vault.connect(stranger).stake({ value: STAKE }), "NotPayee");
      await refuse(vault, vault.connect(mason).stake({ value: STAKE - 1n }), "WrongDeposit", STAKE, STAKE - 1n);
      await refuse(vault, vault.connect(mason).stake({ value: STAKE + 1n }), "WrongDeposit", STAKE, STAKE + 1n);

      const started = await loadFixture(active);
      await refuse(started.vault, started.vault.connect(started.mason).stake({ value: STAKE }), "WrongPhase", Phase.Active);
    });

    it("returns stakes and deposits when the deal is called off before it starts", async function () {
      const { vault, asha, bilal, mason, plumber } = await loadFixture(unfunded);
      await accept(vault, vault.connect(asha).deposit({ value: SHARES[0] }));
      await accept(vault, vault.connect(mason).stake({ value: STAKE }));

      const cancelled = vault.connect(bilal).cancel();
      await expect(cancelled).to.emit(vault, "StakeReturned").withArgs(mason.address, STAKE);
      await accept(vault, cancelled);
      expect(await vault.owed(asha.address)).to.equal(SHARES[0]);
      expect(await vault.owed(mason.address)).to.equal(STAKE);
      expect(await vault.owed(plumber.address)).to.equal(0);

      await accept(vault, vault.connect(asha).withdraw());
      await accept(vault, vault.connect(mason).withdraw());
      expect(await balanceOf(vault)).to.equal(0);
    });
  });

  describe("finishing the deal", function () {
    it("gives every payee their stake back when the deal closes", async function () {
      const { vault, asha, bilal, mason, plumber } = await loadFixture(active);
      await pay(vault, mason, 0, [asha, bilal]);
      await pay(vault, mason, 1, [asha, bilal]);
      expect(await vault.owed(mason.address)).to.equal(rupees(6000));

      await accept(vault, vault.connect(plumber).markComplete(2));
      await accept(vault, vault.connect(asha).approve(2));
      const closing = vault.connect(bilal).approve(2);
      await expect(closing).to.emit(vault, "StakeReturned").withArgs(mason.address, STAKE);
      await expect(closing).to.emit(vault, "StakeReturned").withArgs(plumber.address, STAKE);
      await accept(vault, closing);

      expect(await vault.phase()).to.equal(Phase.Closed);
      expect(await vault.owed(mason.address)).to.equal(rupees(6000) + STAKE);
      expect(await vault.owed(plumber.address)).to.equal(rupees(4000) + STAKE);

      await expect(vault.connect(mason).withdraw()).to.changeEtherBalance(mason, rupees(6000) + STAKE);
      await expect(vault.connect(plumber).withdraw()).to.changeEtherBalance(plumber, rupees(4000) + STAKE);
      await expectReconciled(vault);
      expect(await balanceOf(vault)).to.equal(0);
    });
  });

  describe("walking away", function () {
    it("refunds the leaver's unsettled stages and gives their stake to the payers by share", async function () {
      const { vault, asha, bilal, mason, plumber, judge } = await loadFixture(active);
      await pay(vault, mason, 0, [asha, bilal]);

      const leaving = vault.connect(mason).leave();
      await expect(leaving).to.emit(vault, "Left").withArgs(mason.address, 1);
      await expect(leaving).to.emit(vault, "StakeForfeited").withArgs(mason.address, asha.address, rupees(1200));
      await expect(leaving).to.emit(vault, "StakeForfeited").withArgs(mason.address, bilal.address, rupees(800));
      await accept(vault, leaving);

      // The stage already paid stays paid. The other one goes back to the payers.
      expect(await stateOf(vault, 0)).to.equal(State.Released);
      expect(await stateOf(vault, 1)).to.equal(State.Refunded);
      expect(await vault.owed(mason.address)).to.equal(rupees(3000));
      // 60% and 40% of the refunded 3,000 stage plus the 2,000 stake.
      expect(await vault.owed(asha.address)).to.equal(rupees(1800 + 1200));
      expect(await vault.owed(bilal.address)).to.equal(rupees(1200 + 800));
      expect(await vault.owed(judge.address)).to.equal(0);

      // The plumber is not affected and the deal carries on.
      expect(await vault.phase()).to.equal(Phase.Active);
      expect(await stateOf(vault, 2)).to.equal(State.Pending);
      expect(await vault.hasLeft(plumber.address)).to.equal(false);
    });

    it("refunds a stage that was done or disputed when its payee leaves", async function () {
      const { vault, asha, mason } = await loadFixture(active);
      await accept(vault, vault.connect(mason).markComplete(0));
      await accept(vault, vault.connect(mason).markComplete(1));
      await accept(vault, vault.connect(asha).dispute(1));

      await accept(vault, vault.connect(mason).leave());
      expect(await stateOf(vault, 0)).to.equal(State.Refunded);
      expect(await stateOf(vault, 1)).to.equal(State.Refunded);
      expect(await vault.owed(mason.address)).to.equal(0);
    });

    it("closes the deal when the leaver held the last open stages, and still returns the other stake", async function () {
      const { vault, asha, bilal, mason, plumber } = await loadFixture(active);
      await pay(vault, plumber, 2, [asha, bilal]);

      const leaving = vault.connect(mason).leave();
      await expect(leaving).to.emit(vault, "Closed");
      await expect(leaving).to.emit(vault, "StakeReturned").withArgs(plumber.address, STAKE);
      await accept(vault, leaving);

      expect(await vault.phase()).to.equal(Phase.Closed);
      expect(await vault.owed(plumber.address)).to.equal(rupees(4000) + STAKE);
      expect(await vault.owed(mason.address)).to.equal(0);
      // The payers get both of the mason's stages back, plus the mason's stake.
      expect((await vault.owed(asha.address)) + (await vault.owed(bilal.address))).to.equal(rupees(6000) + STAKE);

      for (const person of [asha, bilal, plumber]) await accept(vault, vault.connect(person).withdraw());
      expect(await balanceOf(vault)).to.equal(0);
    });

    it("splits a stake that does not divide evenly without losing a wei", async function () {
      const [first, second, third, payee, judge] = await ethers.getSigners();
      const vault = await deployVault({
        payers: [
          [first, 3n],
          [second, 3n],
          [third, 4n],
        ],
        judge,
        stake: 7n,
        stages: [[payee, 10n]],
      });
      for (const [payer, share] of [[first, 3n], [second, 3n], [third, 4n]]) {
        await vault.connect(payer).deposit({ value: share });
      }
      await vault.connect(payee).stake({ value: 7n });

      await accept(vault, vault.connect(payee).leave());
      // Stage of 10 splits 3, 3, 4. Stake of 7 splits 2, 2 and the last payer takes the other 3.
      expect(await vault.owed(first.address)).to.equal(3n + 2n);
      expect(await vault.owed(second.address)).to.equal(3n + 2n);
      expect(await vault.owed(third.address)).to.equal(4n + 3n);
      expect(await vault.totalOwed()).to.equal(17n);
    });
  });

  describe("cheat attempts", function () {
    it("refuses leaving twice", async function () {
      const { vault, mason } = await loadFixture(active);
      await accept(vault, vault.connect(mason).leave());
      await refuse(vault, vault.connect(mason).leave(), "AlreadyLeft");
    });

    it("refuses leaving before the deal starts or after it closes", async function () {
      const early = await loadFixture(unfunded);
      await refuse(early.vault, early.vault.connect(early.mason).leave(), "WrongPhase", Phase.Funding);

      const { vault, asha, bilal, mason, plumber } = await loadFixture(active);
      await pay(vault, mason, 0, [asha, bilal]);
      await pay(vault, mason, 1, [asha, bilal]);
      await pay(vault, plumber, 2, [asha, bilal]);
      await refuse(vault, vault.connect(mason).leave(), "WrongPhase", Phase.Closed);
    });

    it("refuses anyone who is not a payee calling leave", async function () {
      const { vault, asha, judge, stranger } = await loadFixture(active);
      for (const person of [asha, judge, stranger]) {
        await refuse(vault, vault.connect(person).leave(), "NotPayee");
      }
    });

    it("refuses a payee whose work is all settled using leave to pull the stake early", async function () {
      const { vault, asha, bilal, mason } = await loadFixture(active);
      await pay(vault, mason, 0, [asha, bilal]);
      await pay(vault, mason, 1, [asha, bilal]);

      // The mason's stages are paid but the plumber's is still open, so the stake stays locked.
      await refuse(vault, vault.connect(mason).leave(), "NothingToLeave");
      expect(await vault.owed(mason.address)).to.equal(rupees(6000));
      expect(await vault.hasLeft(mason.address)).to.equal(false);
    });

    it("gives a payee who left no stake back at the close, and no second withdrawal", async function () {
      const { vault, asha, bilal, mason, plumber } = await loadFixture(active);
      await pay(vault, mason, 0, [asha, bilal]);
      await accept(vault, vault.connect(mason).leave());
      await pay(vault, plumber, 2, [asha, bilal]);
      expect(await vault.phase()).to.equal(Phase.Closed);

      // The mason keeps what was earned before leaving, and nothing else.
      await expect(vault.connect(mason).withdraw()).to.changeEtherBalance(mason, rupees(3000));
      await refuse(vault, vault.connect(mason).withdraw(), "NothingOwed");
      // The plumber's stake is the plumber's alone.
      await expect(vault.connect(plumber).withdraw()).to.changeEtherBalance(plumber, rupees(4000) + STAKE);
      await refuse(vault, vault.connect(plumber).withdraw(), "NothingOwed");
    });

    it("refuses a payee who left marking their old stages done", async function () {
      const { vault, mason } = await loadFixture(active);
      await accept(vault, vault.connect(mason).leave());
      await refuse(vault, vault.connect(mason).markComplete(0), "WrongState", State.Refunded);
    });

    it("keeps the books balanced through random staking, leaving and everything else", async function () {
      this.timeout(120000);
      for (const seed of [3, 11, 77]) {
        const people = await unfunded();
        const { vault, asha, bilal, mason, plumber, judge, stranger } = people;
        const everyone = [asha, bilal, mason, plumber, judge, stranger];

        // Small deterministic random number generator (mulberry32).
        let state = seed;
        const next = () => {
          state = (state + 0x6d2b79f5) | 0;
          let t = Math.imul(state ^ (state >>> 15), state | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        const pick = (list) => list[Math.floor(next() * list.length)];
        const stage = () => Math.floor(next() * 3);
        const actions = [
          () => vault.connect(asha).deposit({ value: SHARES[0] }),
          () => vault.connect(bilal).deposit({ value: SHARES[1] }),
          () => vault.connect(pick([mason, plumber, stranger])).stake({ value: STAKE }),
          () => vault.connect(pick([mason, plumber])).markComplete(stage()),
          () => vault.connect(pick([asha, bilal])).approve(stage()),
          () => vault.connect(pick([asha, bilal])).dispute(stage()),
          () => vault.connect(judge).resolve(stage(), next() < 0.5),
          () => vault.connect(pick(everyone)).withdraw(),
          () => (next() < 0.15 ? vault.connect(pick([mason, plumber, asha])).leave() : vault.connect(pick(everyone)).withdraw()),
        ];

        for (let step = 0; step < 120; step++) {
          try {
            await pick(actions)();
          } catch (error) {
            // Refusals are expected; the books must balance either way.
          }
          await expectReconciled(vault);
        }
        expect((await balanceOf(vault)) + (await vault.totalWithdrawn())).to.equal(await vault.totalDeposited());
      }
    });
  });
});
